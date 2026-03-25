# Social Hub — Token Encryption Service
"""
Encrypt/decrypt OAuth access + refresh tokens at rest using Fernet symmetric encryption.

Setup:
  1. Generate a key: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
  2. Set TOKEN_ENCRYPTION_KEY in .env

When TOKEN_ENCRYPTION_KEY is not set, tokens pass through unencrypted (dev mode)
with a warning on first use.
"""
import logging
from functools import lru_cache

from app.config import settings

logger = logging.getLogger("token_encryption")

_warned_no_key = False


@lru_cache(maxsize=1)
def _get_fernet():
    """Lazily initialize Fernet cipher — returns None if key isn't configured."""
    key = settings.TOKEN_ENCRYPTION_KEY
    if not key:
        return None
    try:
        from cryptography.fernet import Fernet
        return Fernet(key.encode())
    except Exception as e:
        logger.error("Failed to initialize Fernet cipher: %s", e)
        return None


def encrypt_token(plaintext: str) -> str:
    """Encrypt a token string. Returns ciphertext (base64) or plaintext if no key."""
    if not plaintext:
        return plaintext
    fernet = _get_fernet()
    if fernet is None:
        global _warned_no_key
        if not _warned_no_key:
            logger.warning("TOKEN_ENCRYPTION_KEY not set — tokens stored in plaintext")
            _warned_no_key = True
        return plaintext
    return fernet.encrypt(plaintext.encode()).decode()


def decrypt_token(ciphertext: str) -> str:
    """Decrypt a token string. Returns plaintext, or the input unchanged if not encrypted."""
    if not ciphertext:
        return ciphertext
    fernet = _get_fernet()
    if fernet is None:
        return ciphertext
    try:
        return fernet.decrypt(ciphertext.encode()).decode()
    except Exception:
        # Token was stored before encryption was enabled — return as-is
        return ciphertext
