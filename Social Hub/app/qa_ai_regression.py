"""Targeted regressions for Social Hub AI generation.

These checks are deterministic and do not call live Gemini. They exist to catch
SDK/config compatibility regressions and brand-context fallback regressions early.
"""
from __future__ import annotations

import json
import unittest
from unittest.mock import AsyncMock, patch

from app.services import gemini_service


class _FakeResponse:
    def __init__(self, text: str):
        self.text = text


class _FakeModels:
    def __init__(self, response_text: str):
        self.response_text = response_text
        self.last_model = None
        self.last_contents = None
        self.last_config = None

    def generate_content(self, *, model, contents, config):
        self.last_model = model
        self.last_contents = contents
        self.last_config = config
        return _FakeResponse(self.response_text)


class _FakeClient:
    def __init__(self, response_text: str):
        self.models = _FakeModels(response_text)


async def _run_fake_blocking(func, *, service_name: str, retries: int | None = None):
    return func()


class SocialHubAiRegressionTests(unittest.IsolatedAsyncioTestCase):
    async def test_generate_post_package_uses_sdk_compatible_response_schema(self):
        fake_client = _FakeClient(
            json.dumps(
                {
                    "body": "Ein klarer, sofort nutzbarer Testbeitrag.",
                    "hashtags": ["SoftwareTesting", "#SoftwareTesting", "Qualitätssicherung", "bughunting"],
                    "value_comment": "Ein ergänzender Kommentar mit neuem Blickwinkel.",
                    "image_prompt": "Editorial macro photograph of software testing workflow.",
                }
            )
        )

        with (
            patch.object(gemini_service, "_get_client", return_value=fake_client),
            patch.object(gemini_service, "_get_model", return_value="gemini-2.5-pro"),
            patch.object(gemini_service, "run_blocking_with_retry", side_effect=_run_fake_blocking),
        ):
            package = await gemini_service._generate_post_package(
                topic="Software-Testing erklärt",
                platform="linkedin",
                brief_context="Brand tone: klar, glaubwürdig, konkret",
                hashtag_strategy="moderate",
                max_chars=500,
                language="de",
            )

        config = fake_client.models.last_config
        self.assertEqual(config.response_mime_type, "application/json")
        self.assertEqual(config.response_schema, gemini_service.GENERATED_POST_PACKAGE_SCHEMA)
        self.assertNotIn('"default"', json.dumps(config.response_schema).lower())
        self.assertIn("Write in idiomatic German.", config.system_instruction)
        self.assertIn("Follow the brand voice", config.system_instruction)
        self.assertEqual(package.hashtags, ["#SoftwareTesting", "#Qualitätssicherung", "#bughunting"])

    async def test_generate_post_fallback_keeps_brand_context(self):
        fake_client = _FakeClient("Ein prägnanter Fallback-Beitrag ohne generische Floskeln.")

        with (
            patch.object(gemini_service, "_generate_post_package", new=AsyncMock(side_effect=RuntimeError("schema failed"))),
            patch.object(gemini_service, "_get_client", return_value=fake_client),
            patch.object(gemini_service, "_get_model", return_value="gemini-2.5-pro"),
            patch.object(gemini_service, "run_blocking_with_retry", side_effect=_run_fake_blocking),
            patch.object(gemini_service, "_generate_image_prompt", new=AsyncMock(return_value="Editorial portrait of a QA lead")),
            patch.object(gemini_service, "_generate_hashtags", new=AsyncMock(return_value="#QA #Testing #B2B")),
            patch.object(gemini_service, "generate_value_comment", new=AsyncMock(return_value="Ein zusätzlicher Praxisimpuls.")),
        ):
            result = await gemini_service.generate_post(
                topic="ISTQB-Erfolgsgeschichte",
                platform="linkedin",
                language="de",
                brief_context="Brand voice: ruhig, fachlich, konkret\nAudience: QA-Leads in regulierten Branchen",
                hashtag_strategy="moderate",
            )

        self.assertEqual(result["body"], "Ein prägnanter Fallback-Beitrag ohne generische Floskeln.")
        self.assertEqual(result["sources"], "")
        self.assertEqual(result["hashtags"], "#QA #Testing #B2B")
        self.assertIn("QA-Leads in regulierten Branchen", fake_client.models.last_contents)
        self.assertIn("Return only the final post body", fake_client.models.last_contents)
        self.assertIn("Write in idiomatic German.", fake_client.models.last_config.system_instruction)
        self.assertNotIn("deutschen Arbeitsmarkt", fake_client.models.last_contents.lower())

    async def test_regenerate_post_falls_back_when_structured_json_is_invalid(self):
        fake_client = _FakeClient("Fallback response for invalid structured JSON.")
        with (
            patch.object(gemini_service, "_generate_post_package", new=AsyncMock(side_effect=ValueError("invalid structured JSON"))),
            patch.object(
                gemini_service,
                "generate_post",
                new=AsyncMock(
                    return_value={
                        "body": "Fallback rewrite body.",
                        "hashtags": "#QA #Testing #B2B",
                        "value_comment": "Fallback comment.",
                        "image_prompt": "Fallback image prompt.",
                        "sources": "",
                    }
                ),
            ),
        ):
            result = await gemini_service.regenerate_post(
                post_body="Original draft.",
                instruction="Make it sharper.",
                platform="linkedin",
                topic="QA topic",
                brief_context="Brand voice: credible and practical",
                hashtag_strategy="moderate",
                language="en",
            )

        self.assertEqual(result["body"], "Fallback rewrite body.")
        self.assertEqual(result["hashtags"], ["#QA", "#Testing", "#B2B"])
        self.assertEqual(result["value_comment"], "Fallback comment.")
        self.assertEqual(result["image_prompt"], "Fallback image prompt.")


if __name__ == "__main__":
    unittest.main()