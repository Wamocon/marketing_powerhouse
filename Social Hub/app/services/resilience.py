import asyncio
from typing import Any, Callable

import httpx

from app.config import settings

RETRIABLE_STATUS_CODES = {408, 425, 429, 500, 502, 503, 504}


class ExternalServiceError(RuntimeError):
    def __init__(self, service_name: str, public_message: str, detail: str | None = None):
        super().__init__(public_message)
        self.service_name = service_name
        self.public_message = public_message
        self.detail = detail or public_message


def _backoff_delay(attempt: int) -> float:
    return min(6.0, 0.6 * (2 ** (attempt - 1)))


def _status_message(service_name: str, status_code: int) -> str:
    if status_code == 401:
        return f"{service_name} rejected the request. Check the connected account and credentials."
    if status_code == 403:
        return f"{service_name} denied access. Check permissions, app review, or account setup."
    if status_code == 404:
        return f"{service_name} could not find the requested resource."
    if status_code == 409:
        return f"{service_name} reported a conflict. Please retry after refreshing the current data."
    if status_code == 422:
        return f"{service_name} rejected the submitted data. Review the content and settings."
    if status_code == 429:
        return f"{service_name} rate limit reached. Please try again shortly."
    if status_code >= 500:
        return f"{service_name} is temporarily unavailable. Please try again."
    return f"{service_name} request failed. Please try again."


def public_error_message(exc: Exception, fallback: str) -> str:
    if isinstance(exc, ExternalServiceError):
        return exc.public_message
    if isinstance(exc, httpx.TimeoutException):
        return "The request timed out. Please try again."
    if isinstance(exc, httpx.RequestError):
        return "The network request failed. Please try again."
    return fallback


async def request_with_retry(
    method: str,
    url: str,
    *,
    service_name: str,
    headers: dict[str, str] | None = None,
    params: dict[str, Any] | None = None,
    data: dict[str, Any] | None = None,
    json: dict[str, Any] | None = None,
    content: bytes | None = None,
    retries: int | None = None,
) -> httpx.Response:
    attempts = max(1, retries or settings.HTTP_MAX_RETRIES)
    timeout = httpx.Timeout(settings.HTTP_TIMEOUT_SECONDS)
    limits = httpx.Limits(max_connections=20, max_keepalive_connections=10)
    last_error: Exception | None = None

    async with httpx.AsyncClient(timeout=timeout, limits=limits, follow_redirects=True) as client:
        for attempt in range(1, attempts + 1):
            try:
                response = await client.request(
                    method,
                    url,
                    headers=headers,
                    params=params,
                    data=data,
                    json=json,
                    content=content,
                )
                if response.status_code in RETRIABLE_STATUS_CODES and attempt < attempts:
                    await asyncio.sleep(_backoff_delay(attempt))
                    continue
                response.raise_for_status()
                return response
            except httpx.HTTPStatusError as exc:
                last_error = exc
                if exc.response.status_code in RETRIABLE_STATUS_CODES and attempt < attempts:
                    await asyncio.sleep(_backoff_delay(attempt))
                    continue
                detail = exc.response.text[:600] if exc.response.text else str(exc)
                raise ExternalServiceError(
                    service_name,
                    _status_message(service_name, exc.response.status_code),
                    detail,
                ) from exc
            except httpx.TimeoutException as exc:
                last_error = exc
                if attempt < attempts:
                    await asyncio.sleep(_backoff_delay(attempt))
                    continue
                raise ExternalServiceError(
                    service_name,
                    f"{service_name} took too long to respond. Please try again.",
                    str(exc),
                ) from exc
            except httpx.RequestError as exc:
                last_error = exc
                if attempt < attempts:
                    await asyncio.sleep(_backoff_delay(attempt))
                    continue
                raise ExternalServiceError(
                    service_name,
                    f"{service_name} is currently unreachable. Please try again.",
                    str(exc),
                ) from exc

    raise ExternalServiceError(service_name, f"{service_name} request failed.", str(last_error))


async def run_blocking_with_retry(
    func: Callable[[], Any],
    *,
    service_name: str,
    retries: int | None = None,
) -> Any:
    attempts = max(1, retries or settings.HTTP_MAX_RETRIES)
    last_error: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            return await asyncio.to_thread(func)
        except Exception as exc:
            last_error = exc
            if attempt < attempts:
                await asyncio.sleep(_backoff_delay(attempt))
                continue
            raise ExternalServiceError(
                service_name,
                f"{service_name} is temporarily unavailable. Please try again.",
                str(exc),
            ) from exc
    raise ExternalServiceError(service_name, f"{service_name} request failed.", str(last_error))