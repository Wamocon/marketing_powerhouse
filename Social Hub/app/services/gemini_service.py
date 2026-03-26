# Social Media Marketing Hub — Gemini Text Generation Service
"""
Uses Google Gemini Pro with Google Search grounding to generate
researched posts about the German job market & Weiterbildung.
Supports LinkedIn and Instagram platform-specific formatting.
"""
import asyncio
from pydantic import BaseModel, Field

from google import genai
from google.genai import types

from app.config import settings
from app.services.resilience import run_blocking_with_retry

_client = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        if not settings.GOOGLE_API_KEY:
            raise RuntimeError(
                "GOOGLE_API_KEY ist nicht konfiguriert. Bitte in .env eintragen."
            )
        _client = genai.Client(api_key=settings.GOOGLE_API_KEY)
    return _client


def _get_model() -> str:
    from app.database import get_setting
    return get_setting("gemini_model", settings.GEMINI_MODEL)


def _get_max_chars() -> int:
    from app.database import get_setting
    return int(get_setting("post_max_chars", str(settings.POST_MAX_CHARS)))


class GeneratedPostPackage(BaseModel):
    body: str = Field(description="Final copy-paste-ready post body without placeholders.")
    hashtags: list[str] = Field(default_factory=list, description="Platform-appropriate hashtags including the leading # sign.")
    value_comment: str = Field(default="", description="A short follow-up comment that adds a fresh angle.")
    image_prompt: str = Field(description="English Imagen prompt without any text overlays.")


GENERATED_POST_PACKAGE_SCHEMA = {
    "type": "object",
    "properties": {
        "body": {"type": "string"},
        "hashtags": {
            "type": "array",
            "items": {"type": "string"},
        },
        "value_comment": {"type": "string"},
        "image_prompt": {"type": "string"},
    },
    "required": ["body", "hashtags", "value_comment", "image_prompt"],
}


def _hashtag_bounds(platform: str, strategy: str) -> tuple[int, int]:
    platform_name = platform.lower()
    strategy_name = (strategy or "moderate").lower()
    if platform_name == "instagram":
        mapping = {
            "none": (0, 0),
            "minimal": (3, 5),
            "moderate": (5, 8),
            "aggressive": (8, 12),
        }
        return mapping.get(strategy_name, (5, 8))

    mapping = {
        "none": (0, 0),
        "minimal": (1, 2),
        "moderate": (3, 3),
        "aggressive": (4, 5),
    }
    return mapping.get(strategy_name, (3, 3))


def _normalize_hashtags(raw_hashtags: list[str], platform: str, strategy: str) -> list[str]:
    minimum, maximum = _hashtag_bounds(platform, strategy)
    if maximum == 0:
        return []

    normalized: list[str] = []
    seen: set[str] = set()
    for tag in raw_hashtags:
        if tag is None:
            continue
        cleaned = str(tag).strip()
        if not cleaned:
            continue
        if not cleaned.startswith("#"):
            cleaned = f"#{cleaned}"
        key = cleaned.lower()
        if key in seen:
            continue
        seen.add(key)
        normalized.append(cleaned)
        if len(normalized) >= maximum:
            break

    if len(normalized) < minimum:
        fallback = ["#karriere", "#weiterbildung", "#arbeitsmarkt"] if platform.lower() == "linkedin" else ["#karriere", "#weiterbildung", "#karrieretipps", "#beruf", "#deutschlandjobs"]
        for tag in fallback:
            if tag.lower() in seen:
                continue
            normalized.append(tag)
            seen.add(tag.lower())
            if len(normalized) >= minimum:
                break

    return normalized[:maximum]


def _clean_optional_text(value: str | None, limit: int) -> str:
    return (value or "").strip()[:limit]


def _response_text(response: object) -> str:
    return _clean_optional_text(getattr(response, "text", ""), 8192)


def _language_instruction(language: str) -> str:
    normalized = (language or "de").strip().lower()
    mapping = {
        "de": "Write in idiomatic German.",
        "en": "Write in natural English.",
        "fr": "Write in natural French.",
    }
    return mapping.get(normalized, f"Write in {language}.")


def _build_post_system_prompt(platform: str, max_chars: int, hashtag_strategy: str, language: str) -> str:
    min_tags, max_tags = _hashtag_bounds(platform, hashtag_strategy)
    platform_name = platform.lower()
    platform_rules = (
        "LinkedIn rules: one strong idea, a punchy first line, short paragraphs, credible B2B tone, no emoji spam, and no generic thought-leadership filler."
        if platform_name == "linkedin"
        else "Instagram rules: stronger emotional rhythm, visually vivid caption writing, short paragraphs, and an explicit save/share/comment CTA."
    )
    hashtag_rule = "Do not return hashtags." if max_tags == 0 else f"Return between {min_tags} and {max_tags} niche-relevant hashtags."
    return (
        f"You are a senior social media strategist creating premium {platform_name} posts. "
        f"Keep the post under {max_chars} characters. {platform_rules} {hashtag_rule} "
        f"{_language_instruction(language)} "
        "Use only the facts in the brief. Do not invent products, offers, customer quotes, case studies, or statistics. "
        "Follow the brand voice, audience cues, dos, donts, and positioning in the strategic brief exactly. "
        "Avoid generic openings, filler, corporate cliches, and placeholder text. The first line must earn attention in-feed. "
        "The CTA must be specific. The value comment must add a fresh angle instead of repeating the post. "
        "The image prompt must be in English, visually concrete, photorealistic or editorial, and contain no text overlays."
    )


def _build_fallback_user_prompt(topic: str, brief_context: str, platform: str) -> str:
    return (
        f"Create one premium {platform} post using only the brief below.\n\n"
        f"## Topic\n{topic}\n\n"
        f"## Strategic brief\n{brief_context or 'No additional context provided.'}\n\n"
        "Return only the final post body. No JSON, no hashtags list, no rationale, and no markdown fences."
    )


async def _generate_post_package(topic: str, platform: str, brief_context: str, hashtag_strategy: str, max_chars: int, language: str) -> GeneratedPostPackage:
    response = await run_blocking_with_retry(
        lambda: _get_client().models.generate_content(
            model=_get_model(),
            contents=(
                "Create one premium social media post package from the following brief.\n\n"
                f"## Topic\n{topic}\n\n"
                f"## Strategic brief\n{brief_context or 'No additional context provided.'}\n\n"
                "Return only JSON matching the schema."
            ),
            config=types.GenerateContentConfig(
                system_instruction=_build_post_system_prompt(platform, max_chars, hashtag_strategy, language),
                temperature=0.8,
                max_output_tokens=2048,
                response_mime_type="application/json",
                response_schema=GENERATED_POST_PACKAGE_SCHEMA,
            ),
        ),
        service_name="Google Gemini",
    )

    parsed_response = getattr(response, "parsed", None)
    if parsed_response:
        package = GeneratedPostPackage.model_validate(parsed_response)
    else:
        package = GeneratedPostPackage.model_validate_json(response.text)
    package.body = _clean_optional_text(package.body, max_chars)
    package.value_comment = _clean_optional_text(package.value_comment, 500)
    package.image_prompt = _clean_optional_text(package.image_prompt, 800)
    package.hashtags = _normalize_hashtags(package.hashtags, platform, hashtag_strategy)
    return package


SYSTEM_PROMPT = """\
Du bist ein LinkedIn-Content-Experte für den deutschen Arbeitsmarkt und Weiterbildung.

DEINE AUFGABE:
Erstelle einen professionellen LinkedIn-Beitrag auf Deutsch zu dem vorgegebenen Thema.

ANFORDERUNGEN:
1. Maximal {max_chars} Zeichen (inkl. Leerzeichen).
2. Verwende aktuelle, verifizierbare Zahlen und Studien.
3. Nenne alle Quellen am Ende des Beitrags (Quellenname + Jahr).
4. Schreibe professionell aber zugänglich — kein Akademiker-Deutsch.
5. Verwende Absätze und Leerzeilen für Lesbarkeit.
6. Beginne mit einem starken Aufhänger (Zahl, Frage oder überraschende Aussage).
7. Ende mit einer Frage an die Leser (Engagement-Booster).
8. Verwende relevante Emojis sparsam (max. 3-5 pro Beitrag).
9. Keine Hashtags im Text — die werden separat hinzugefügt.

QUELLEN (bevorzugt):
- Bundesagentur für Arbeit (statistik.arbeitsagentur.de)
- IAB (Institut für Arbeitsmarkt- und Berufsforschung)
- BIBB (Bundesinstitut für Berufsbildung)
- IHK (Industrie- und Handelskammer)
- Destatis (Statistisches Bundesamt)
- Aktuelle Studien und Berichte

ZIELGRUPPE:
Jobsuchende, Weiterbildungsinteressierte, HR-Manager und Karriereberater
im deutschsprachigen Raum (DACH).

STIL:
Wie ein erfahrener Karriereberater, der komplexe Arbeitsmarkt-Themen
verständlich erklärt und echten Mehrwert bietet.
"""

VALUE_COMMENT_PROMPT = """\
Erstelle einen kurzen Folge-Kommentar (max. 500 Zeichen) zu diesem LinkedIn-Beitrag.
Der Kommentar soll:
1. Einen zusätzlichen Fakt oder Gedanken aus einer anderen Perspektive ergänzen.
2. Die Diskussion weiter anregen.
3. Natürlich klingen — nicht wie KI-generiert.
4. Keine Wiederholung des Beitrags.

Beitrag:
{post_body}
"""

HASHTAG_PROMPT = """\
Generiere 3-5 relevante LinkedIn-Hashtags (mit #) für diesen Beitrag.
Nur die Hashtags, eine Zeile, durch Leerzeichen getrennt.

Beitrag:
{post_body}
"""

IG_SYSTEM_PROMPT = """\
Du bist ein Instagram-Content-Experte für den deutschen Arbeitsmarkt und Weiterbildung.

DEINE AUFGABE:
Erstelle einen professionellen Instagram-Caption auf Deutsch zu dem vorgegebenen Thema.

ANFORDERUNGEN:
1. Maximal {max_chars} Zeichen (Caption-Limit).
2. Verwende aktuelle, verifizierbare Zahlen und Studien.
3. Schreibe professionell aber zugänglich und visuell ansprechend.
4. Verwende kurze, punchy Absätze und Leerzeilen für Lesbarkeit.
5. Beginne mit einem starken Aufhänger.
6. Ende mit einem Call-to-Action (💾 Speichern, 🔁 Teilen, 💬 Kommentieren).
7. Verwende relevante Emojis großzügig (5-10 pro Beitrag).
8. Keine Hashtags im Text — die werden separat hinzugefügt.
9. Instagram-typischer Stil: kürzer, punchiger, visuell fokussiert.
10. Quellenangabe am Ende, aber kompakt.

ZIELGRUPPE:
Jobsuchende, Weiterbildungsinteressierte, HR-Manager
im deutschsprachigen Raum (DACH).
"""

IG_HASHTAG_PROMPT = """\
Generiere 20-25 relevante Instagram-Hashtags (mit #) für diesen Beitrag.
Mische große (>100k Posts), mittlere (10k-100k) und Nischen-Hashtags (<10k).
Nur Hashtags, durch Leerzeichen getrennt, eine Zeile.

Beitrag:
{post_body}
"""


async def generate_post(topic: str, platform: str = "linkedin", language: str = "de", brief_context: str = "", hashtag_strategy: str = "moderate") -> dict:
    """
    Generate a post about the given topic for the specified platform.
    Uses Google Search grounding for real-time data.
    Returns: {"body": str, "sources": str, "image_prompt": str, "hashtags": str}
    """
    max_chars = _get_max_chars()
    if platform == "instagram":
        from app.database import get_setting
        max_chars = int(get_setting("ig_post_max_chars", "2200"))

    try:
        package = await _generate_post_package(topic, platform, brief_context, hashtag_strategy, max_chars, language)
        return {
            "body": package.body,
            "sources": "",
            "image_prompt": package.image_prompt,
            "hashtags": " ".join(package.hashtags),
            "value_comment": package.value_comment,
        }
    except Exception:
        response = await run_blocking_with_retry(
            lambda: _get_client().models.generate_content(
                model=_get_model(),
                contents=_build_fallback_user_prompt(topic, brief_context, platform),
                config=types.GenerateContentConfig(
                    system_instruction=_build_post_system_prompt(platform, max_chars, hashtag_strategy, language),
                    temperature=0.7,
                    max_output_tokens=2048,
                ),
            ),
            service_name="Google Gemini",
        )

        post_body = _response_text(response)
        image_prompt = await _generate_image_prompt(topic, post_body, platform)
        hashtags = await _generate_hashtags(post_body, platform)

        return {
            "body": post_body[:max_chars],
            "sources": "",
            "image_prompt": image_prompt,
            "hashtags": hashtags,
            "value_comment": await generate_value_comment(post_body),
        }


async def generate_value_comment(post_body: str) -> str:
    """Generate a value-add follow-up comment for the post."""
    response = await run_blocking_with_retry(
        lambda: _get_client().models.generate_content(
            model=_get_model(),
            contents=VALUE_COMMENT_PROMPT.format(post_body=post_body),
            config=types.GenerateContentConfig(
                temperature=0.8,
                max_output_tokens=512,
            ),
        ),
        service_name="Google Gemini",
    )
    return _response_text(response)[:500]


async def suggest_topics(count: int = 5) -> list[str]:
    """Suggest trending topics for the German job market."""
    prompt = (
        f"Schlage {count} aktuelle, relevante LinkedIn-Beitragsthemen vor "
        "zum deutschen Arbeitsmarkt und Weiterbildung. "
        "Die Themen sollen aktuell sein, Engagement erzeugen "
        "und echten Mehrwert für Jobsuchende und HR-Manager bieten. "
        "Gib nur die Themen als nummerierte Liste zurück, ohne Erklärung."
    )
    response = await run_blocking_with_retry(
        lambda: _get_client().models.generate_content(
            model=_get_model(),
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.9,
                max_output_tokens=512,
                tools=[types.Tool(google_search=types.GoogleSearch())],
            ),
        ),
        service_name="Google Gemini",
    )
    lines = [
        line.strip().lstrip("0123456789.)- ")
        for line in _response_text(response).split("\n")
        if line.strip()
    ]
    return lines[:count]


async def regenerate_text(post_body: str, instruction: str) -> str:
    """Rewrite a post body based on user instruction (e.g. 'make shorter')."""
    prompt = (
        f"Überarbeite den folgenden LinkedIn-Beitrag nach dieser Anweisung: {instruction}\n\n"
        f"Originalbeitrag:\n{post_body}\n\n"
        "Gib nur den überarbeiteten Beitrag zurück, ohne Erklärung."
    )
    response = await run_blocking_with_retry(
        lambda: _get_client().models.generate_content(
            model=_get_model(),
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.6,
                max_output_tokens=2048,
            ),
        ),
        service_name="Google Gemini",
    )
    return _response_text(response)[:_get_max_chars()]


async def regenerate_post(post_body: str, instruction: str, platform: str = "linkedin", topic: str = "", brief_context: str = "", hashtag_strategy: str = "moderate", language: str = "de") -> dict:
    max_chars = _get_max_chars()
    if platform == "instagram":
        from app.database import get_setting
        max_chars = int(get_setting("ig_post_max_chars", "2200"))

    revision_topic = topic or "Refine the existing draft"
    revision_brief = (
        f"Existing post:\n{post_body}\n\n"
        f"Revision instruction:\n{instruction}\n\n"
        f"Additional context:\n{brief_context or 'No additional context provided.'}"
    )
    try:
        package = await _generate_post_package(revision_topic, platform, revision_brief, hashtag_strategy, max_chars, language)
        return {
            "body": package.body,
            "hashtags": package.hashtags,
            "value_comment": package.value_comment,
            "image_prompt": package.image_prompt,
        }
    except Exception:
        fallback = await generate_post(
            revision_topic,
            platform=platform,
            language=language,
            brief_context=revision_brief,
            hashtag_strategy=hashtag_strategy,
        )
        return {
            "body": fallback["body"],
            "hashtags": [tag for tag in fallback.get("hashtags", "").split() if tag],
            "value_comment": fallback.get("value_comment", ""),
            "image_prompt": fallback.get("image_prompt", ""),
        }


async def _generate_hashtags(post_body: str, platform: str = "linkedin") -> str:
    """Generate platform-appropriate hashtags for a post."""
    from app.database import get_setting
    if platform == "instagram":
        default_tags = get_setting("ig_default_hashtags", "")
        prompt_template = IG_HASHTAG_PROMPT
        max_tokens = 512
    else:
        default_tags = get_setting("default_hashtags", "")
        prompt_template = HASHTAG_PROMPT
        max_tokens = 128
    try:
        response = await run_blocking_with_retry(
            lambda: _get_client().models.generate_content(
                model=_get_model(),
                contents=prompt_template.format(post_body=post_body[:500]),
                config=types.GenerateContentConfig(
                    temperature=0.5,
                    max_output_tokens=max_tokens,
                ),
            ),
            service_name="Google Gemini",
        )
        tags = _response_text(response)
        if default_tags:
            existing = set(tags.split())
            for t in default_tags.split():
                if t not in existing:
                    tags += f" {t}"
        return tags
    except Exception:
        return default_tags


async def _generate_image_prompt(topic: str, post_body: str, platform: str = "linkedin") -> str:
    """Generate an Imagen prompt for the post's featured image."""
    if platform == "instagram":
        prompt = (
            "Create a short English image prompt (max 200 words) for a professional "
            "Instagram post image about this topic:\n\n"
            f"Topic: {topic}\n\n"
            "Requirements:\n"
            "- Eye-catching, modern, lifestyle-meets-professional aesthetic\n"
            "- Square format (1:1 aspect ratio)\n"
            "- Vibrant colors, clean composition\n"
            "- No text in the image\n"
            "- Photorealistic or editorial-style photography\n"
            "Return ONLY the English prompt."
        )
    else:
        prompt = (
            "Create a short English image prompt (max 200 words) for a professional "
            "LinkedIn post image about this topic:\n\n"
            f"Topic: {topic}\n\n"
            "Requirements:\n"
            "- Professional, modern, business context\n"
            "- Clear main subject, minimal text\n"
            "- Accent colors: blue tones (#0A66C2 LinkedIn blue)\n"
            "- No text in the image (will be added as overlay)\n"
            "- Photorealistic or high-quality illustration\n"
            "Return ONLY the English prompt."
        )
    response = await run_blocking_with_retry(
        lambda: _get_client().models.generate_content(
            model=_get_model(),
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
                max_output_tokens=256,
            ),
        ),
        service_name="Google Gemini",
    )
    return _response_text(response)
