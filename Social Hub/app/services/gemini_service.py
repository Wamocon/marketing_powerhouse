# Social Media Marketing Hub — Gemini Text Generation Service
"""
Uses Google Gemini Pro with Google Search grounding to generate
researched posts about the German job market & Weiterbildung.
Supports LinkedIn and Instagram platform-specific formatting.
"""
import asyncio

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


async def generate_post(topic: str, platform: str = "linkedin") -> dict:
    """
    Generate a post about the given topic for the specified platform.
    Uses Google Search grounding for real-time data.
    Returns: {"body": str, "sources": str, "image_prompt": str, "hashtags": str}
    """
    model = _get_model()

    if platform == "instagram":
        from app.database import get_setting
        max_chars = int(get_setting("ig_post_max_chars", "2200"))
        sys_prompt = IG_SYSTEM_PROMPT.format(max_chars=max_chars - 200)
        user_msg = f"Erstelle einen Instagram-Caption zum Thema: {topic}"
    else:
        max_chars = _get_max_chars()
        sys_prompt = SYSTEM_PROMPT.format(max_chars=max_chars - 200)
        user_msg = f"Erstelle einen LinkedIn-Beitrag zum Thema: {topic}"

    response = await run_blocking_with_retry(
        lambda: _get_client().models.generate_content(
            model=model,
            contents=user_msg,
            config=types.GenerateContentConfig(
                system_instruction=sys_prompt,
                temperature=0.7,
                max_output_tokens=2048,
                tools=[types.Tool(google_search=types.GoogleSearch())],
            ),
        ),
        service_name="Google Gemini",
    )

    post_body = response.text.strip()

    sources = []
    if response.candidates and response.candidates[0].grounding_metadata:
        gm = response.candidates[0].grounding_metadata
        if gm.grounding_chunks:
            for chunk in gm.grounding_chunks:
                if chunk.web:
                    sources.append(f"{chunk.web.title} ({chunk.web.uri})")

    image_prompt = await _generate_image_prompt(topic, post_body, platform)
    hashtags = await _generate_hashtags(post_body, platform)

    return {
        "body": post_body[:max_chars],
        "sources": "\n".join(sources),
        "image_prompt": image_prompt,
        "hashtags": hashtags,
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
    return response.text.strip()[:500]


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
        for line in response.text.strip().split("\n")
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
    return response.text.strip()[:_get_max_chars()]


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
        tags = response.text.strip()
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
    return response.text.strip()
