# Social Media Marketing Hub — Image Generation Service
"""
Generates platform-optimized post images using Google Imagen 4 Ultra.
Falls back to a branded placeholder if Imagen is unavailable.
Supports LinkedIn (1200x628 PNG) and Instagram (1080x1080 JPEG).
"""
import asyncio
import io
from pathlib import Path

from google import genai
from google.genai import types
from PIL import Image, ImageDraw, ImageFont

from app.config import settings, DATA_DIR
from app.services.resilience import run_blocking_with_retry

_client = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        if not settings.GOOGLE_API_KEY:
            raise RuntimeError("GOOGLE_API_KEY ist nicht konfiguriert.")
        _client = genai.Client(api_key=settings.GOOGLE_API_KEY)
    return _client

IMAGES_DIR = DATA_DIR / "images"
IMAGES_DIR.mkdir(exist_ok=True)

PLATFORM_IMAGE_CONFIGS = {
    "linkedin": {
        "dimensions": (1200, 628),
        "aspect_ratio": "16:9",
        "format": "PNG",
        "ext": "png",
    },
    "instagram": {
        "dimensions": (1080, 1080),
        "aspect_ratio": "1:1",
        "format": "JPEG",
        "ext": "jpg",
    },
    "instagram_portrait": {
        "dimensions": (1080, 1350),
        "aspect_ratio": "4:5",
        "format": "JPEG",
        "ext": "jpg",
    },
}


async def generate_image(prompt: str, post_id: int, platform: str = "linkedin") -> str:
    """
    Generate a post image via Imagen 4 Ultra.
    Returns the relative file path (from DATA_DIR) of the saved image.
    Falls back to branded placeholder on failure.
    """
    config = PLATFORM_IMAGE_CONFIGS.get(platform, PLATFORM_IMAGE_CONFIGS["linkedin"])
    ext = config["ext"]
    filename = f"post_{post_id}.{ext}"
    output_path = IMAGES_DIR / filename
    relative_path = f"images/{filename}"

    try:
        response = await run_blocking_with_retry(
            lambda: _get_client().models.generate_images(
                model=settings.IMAGEN_MODEL,
                prompt=prompt,
                config=types.GenerateImagesConfig(
                    number_of_images=1,
                    aspect_ratio=config["aspect_ratio"],
                    output_mime_type="image/png",
                ),
            ),
            service_name="Google Imagen",
        )

        if response.generated_images:
            image_bytes = response.generated_images[0].image.image_bytes
            img = Image.open(io.BytesIO(image_bytes))

            if config["format"] == "JPEG":
                if img.mode in ("RGBA", "LA", "P"):
                    background = Image.new("RGB", img.size, (255, 255, 255))
                    if img.mode == "RGBA":
                        background.paste(img, mask=img.split()[3])
                    else:
                        background.paste(img.convert("RGBA"), mask=img.convert("RGBA").split()[3] if img.mode == "LA" else None)
                    img = background
                elif img.mode != "RGB":
                    img = img.convert("RGB")
                img.save(str(output_path), "JPEG", quality=95)
            else:
                img.save(str(output_path), "PNG")
            return relative_path

    except Exception:
        pass

    return _create_branded_placeholder(post_id, prompt, output_path, relative_path, platform)


def _create_branded_placeholder(
    post_id: int, topic: str, output_path: Path, relative_path: str,
    platform: str = "linkedin",
) -> str:
    """Create a branded placeholder image with platform-appropriate dimensions."""
    config = PLATFORM_IMAGE_CONFIGS.get(platform, PLATFORM_IMAGE_CONFIGS["linkedin"])
    width, height = config["dimensions"]

    # Platform-specific brand colors
    if platform.startswith("instagram"):
        bg_color = "#833AB4"  # Instagram purple
        accent_r, accent_g, accent_b = 131, 58, 180
    else:
        bg_color = "#0A66C2"  # LinkedIn blue
        accent_r, accent_g, accent_b = 10, 102, 194

    img = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    for y in range(height):
        alpha = int(80 * (y / height))
        draw.line([(0, y), (width, y)], fill=(alpha, alpha, alpha))

    try:
        font_large = ImageFont.truetype("arial.ttf", 42 if platform == "linkedin" else 38)
        font_small = ImageFont.truetype("arial.ttf", 20)
    except OSError:
        font_large = ImageFont.load_default()
        font_small = font_large

    words = topic[:120].split()
    lines, current = [], ""
    for w in words:
        test = f"{current} {w}".strip()
        bbox = draw.textbbox((0, 0), test, font=font_large)
        if bbox[2] - bbox[0] > width - 120:
            lines.append(current)
            current = w
        else:
            current = test
    if current:
        lines.append(current)

    y_start = height // 2 - len(lines) * 30
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font_large)
        x = (width - (bbox[2] - bbox[0])) // 2
        draw.text((x, y_start + i * 60), line, fill="white", font=font_large)

    platform_label = "Instagram" if platform.startswith("instagram") else "LinkedIn"
    draw.text(
        (40, height - 50),
        f"WAMOCON — {platform_label}",
        fill=(200, 200, 200),
        font=font_small,
    )

    if config["format"] == "JPEG":
        img = img.convert("RGB")
        img.save(str(output_path), "JPEG", quality=95)
    else:
        img.save(str(output_path), "PNG")
    return relative_path
