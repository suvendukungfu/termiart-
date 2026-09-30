"""FastAPI backend server for TermiArt Web Studio."""

import io
import re
import html
import time
import base64
from pathlib import Path
from typing import Optional, Dict, Any

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse, Response, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from core.config import RenderConfig, PRESETS, Preset
from core.pipeline import ArtPipeline
from core.image_processor import ImageProcessor, ProcessedImage
from core.terminal import strip_ansi
from renderers import RENDERERS, get_renderer
from renderers.random_renderer import RandomRenderer
from colors.themes import THEMES, get_theme
from effects.matrix_rain import MatrixRainEffect
from effects.glitch import GlitchEffect
from effects.scanline import ScanlineEffect

# Initialize FastAPI App
app = FastAPI(
    title="TermiArt Web Studio",
    description="High-fidelity interactive web studio for TermiArt image-to-terminal art engine",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
SAMPLES_DIR = BASE_DIR.parent

# Cache for active session image (to support smooth 30+ FPS animations without repeated re-uploads)
CURRENT_SESSION: Dict[str, Any] = {
    "image": None,
    "last_processed": None,
    "matrix_effect": None,
    "glitch_effect": None,
    "scanline_effect": None,
}


def ansi_to_html(ansi_str: str) -> str:
    """Converts 24-bit TrueColor and standard ANSI escape sequences into clean styled HTML spans."""
    pattern = re.compile(r"(\x1b\[[0-9;]*[a-zA-Z])")
    parts = pattern.split(ansi_str)
    out = []
    current_fg = None
    current_bg = None
    active_fg = None
    active_bg = None
    active_span = False

    for part in parts:
        if not part:
            continue
        if part.startswith("\x1b["):
            if part in ("\x1b[0m", "\x1b[m"):
                current_fg = None
                current_bg = None
            elif part.startswith("\x1b[38;2;"):
                m = re.match(r"^\x1b\[38;2;(\d+);(\d+);(\d+)m$", part)
                if m:
                    current_fg = f"rgb({m.group(1)},{m.group(2)},{m.group(3)})"
            elif part.startswith("\x1b[48;2;"):
                m = re.match(r"^\x1b\[48;2;(\d+);(\d+);(\d+)m$", part)
                if m:
                    current_bg = f"rgb({m.group(1)},{m.group(2)},{m.group(3)})"
            elif part in ("\x1b[1m", "\x1b[22m"):
                # Bold / normal weight
                pass
        else:
            # Non-escape content (character glyphs, spaces, newlines)
            if current_fg != active_fg or current_bg != active_bg:
                if active_span:
                    out.append("</span>")
                    active_span = False

                if current_fg or current_bg:
                    styles = []
                    if current_fg:
                        styles.append(f"color:{current_fg}")
                    if current_bg:
                        styles.append(f"background-color:{current_bg}")
                    out.append(f'<span style="{";".join(styles)}">')
                    active_span = True

                active_fg = current_fg
                active_bg = current_bg

            out.append(html.escape(part))

    if active_span:
        out.append("</span>")

    return "".join(out)


def build_cli_command(config: RenderConfig, filename: str = "image.png") -> str:
    """Reconstructs the equivalent bash CLI command for current render configuration."""
    parts = ["python3 termiart.py", filename]
    if config.preset:
        parts.append(f"--preset {config.preset}")
    else:
        if config.style and config.style != "halfblock":
            parts.append(f"--style {config.style}")
        if config.theme and config.theme != "original":
            parts.append(f"--theme {config.theme}")
        if config.contrast != 1.0:
            parts.append(f"--contrast {round(config.contrast, 2)}")
        if config.brightness != 1.0:
            parts.append(f"--brightness {round(config.brightness, 2)}")
        if config.sharpness != 1.0:
            parts.append(f"--sharpness {round(config.sharpness, 2)}")
        if config.gamma != 1.0:
            parts.append(f"--gamma {round(config.gamma, 2)}")
        if config.density != 1.0:
            parts.append(f"--density {round(config.density, 2)}")
        if config.edge_enhance:
            parts.append("--edge")
        if config.invert:
            parts.append("--invert")
        if not config.color:
            parts.append("--no-color")

    if config.width:
        parts.append(f"-W {config.width}")
    if config.height:
        parts.append(f"-H {config.height}")
    if config.random_mode:
        parts.append("-r")
        if config.seed is not None:
            parts.append(f"--seed {config.seed}")

    return " ".join(parts)


@app.get("/create", response_class=HTMLResponse)
@app.get("/explore", response_class=HTMLResponse)
@app.get("/presets", response_class=HTMLResponse)
@app.get("/", response_class=HTMLResponse)
async def serve_index(request: Request):
    """Serve main TermiArt Web Studio UI."""
    index_file = STATIC_DIR / "index.html"
    if not index_file.exists():
        raise HTTPException(status_code=404, detail="Web Studio frontend index.html not found.")
    return HTMLResponse(content=index_file.read_text(encoding="utf-8"))


@app.get("/404", response_class=HTMLResponse)
async def serve_404():
    """Serve cinematic minimal 404 page."""
    f404 = STATIC_DIR / "404.html"
    if f404.exists():
        return HTMLResponse(content=f404.read_text(encoding="utf-8"), status_code=404)
    return HTMLResponse("<h1>404 Not Found</h1>", status_code=404)


@app.exception_handler(404)
async def custom_404_handler(request: Request, exc: Exception):
    """Handle missing pages with the cinematic TermiArt 404 experience."""
    if request.url.path.startswith("/api/"):
        return JSONResponse(status_code=404, content={"detail": "API endpoint not found"})
    f404 = STATIC_DIR / "404.html"
    if f404.exists():
        return HTMLResponse(content=f404.read_text(encoding="utf-8"), status_code=404)
    return HTMLResponse("<h1>404 Not Found</h1>", status_code=404)


@app.get("/api/health")
async def health_check():
    """Health status and engine metadata."""
    return {
        "status": "online",
        "engine": "TermiArt Engine v2.0",
        "styles": list(RENDERERS.keys()),
        "themes": list(THEMES.keys()),
        "presets": list(PRESETS.keys()),
    }


@app.get("/api/presets")
async def get_presets():
    """Get metadata for all presets, styles, and color themes."""
    return {
        "presets": [
            {
                "id": k,
                "name": v.name.title(),
                "description": v.description,
                "style": v.style,
                "theme": v.theme,
                "contrast": v.contrast,
                "brightness": v.brightness,
                "sharpness": v.sharpness,
                "gamma": v.gamma,
                "density": v.density,
                "edge_enhance": v.edge_enhance,
                "invert": v.invert,
            }
            for k, v in PRESETS.items()
        ],
        "styles": [
            {"id": "halfblock", "name": "Half-Block (24-bit TrueColor Subpixel)", "badge": "High-Res"},
            {"id": "ascii", "name": "Classic ASCII", "badge": "Vintage"},
            {"id": "dense_ascii", "name": "Dense ASCII (70-tier ramp)", "badge": "Detailed"},
            {"id": "braille", "name": "Braille Unicode (2x4 dot matrix)", "badge": "Crisp"},
            {"id": "matrix", "name": "Matrix Rain (Digital rain glyphs)", "badge": "Cyber"},
            {"id": "unicode", "name": "Unicode Shades (░▒▓█)", "badge": "Blocks"},
            {"id": "rgb", "name": "RGB Letters (R/G/B tinted)", "badge": "Stylized"},
            {"id": "cyberpunk", "name": "Cyberpunk Neon (Glow halftone)", "badge": "Neon"},
        ],
        "themes": [
            {"id": "original", "name": "Original (TrueColor RGB)", "color": "#00ff88"},
            {"id": "matrix", "name": "Matrix (Phosphor Green)", "color": "#00ff41"},
            {"id": "cyberpunk", "name": "Cyberpunk (Cyan & Magenta)", "color": "#ff007f"},
            {"id": "rainbow", "name": "Rainbow (Spectral Flow)", "color": "#a855f7"},
            {"id": "fire", "name": "Fire (Blazing Heat)", "color": "#ff4500"},
            {"id": "ocean", "name": "Ocean (Deep Bioluminescent)", "color": "#00d2ff"},
            {"id": "purple_neon", "name": "Purple Neon (Synthwave)", "color": "#b026ff"},
            {"id": "monochrome", "name": "Monochrome (High-Contrast B&W)", "color": "#e2e8f0"},
            {"id": "anime", "name": "Anime (Vivid Saturated)", "color": "#f43f5e"},
        ],
    }


@app.get("/api/samples")
async def list_samples():
    """List curated demo samples available for instant loading."""
    return {
        "samples": [
            {
                "id": "portrait",
                "name": "Portrait",
                "tag": "Cyberpunk",
                "description": "Neon rim light & cyber visor silhouette",
                "style": "halfblock",
                "theme": "cyberpunk",
                "image_url": "/api/sample/portrait"
            },
            {
                "id": "anime",
                "name": "Anime",
                "tag": "Vivid Character",
                "description": "Expressive eyes, sharp lines & colorful hair",
                "style": "dense_ascii",
                "theme": "anime",
                "image_url": "/api/sample/anime"
            },
            {
                "id": "landscape",
                "name": "Landscape",
                "tag": "Synthwave",
                "description": "Glowing sun, mountain ridges & perspective grid",
                "style": "halfblock",
                "theme": "fire",
                "image_url": "/api/sample/landscape"
            },
            {
                "id": "architecture",
                "name": "Architecture",
                "tag": "Neo-Tokyo",
                "description": "Cyberpunk skyscraper tower & neon skyline",
                "style": "unicode",
                "theme": "cyberpunk",
                "image_url": "/api/sample/architecture"
            },
            {
                "id": "animals",
                "name": "Animals",
                "tag": "Cyber Panther",
                "description": "Geometric cybernetic wolf with glowing eyes",
                "style": "braille",
                "theme": "rainbow",
                "image_url": "/api/sample/animals"
            },
            {
                "id": "logo",
                "name": "Logo",
                "tag": "Arcade Terminal",
                "description": "Pixel skull, prompt glyph & cyber frame",
                "style": "braille",
                "theme": "matrix",
                "image_url": "/api/sample/logo"
            }
        ]
    }


@app.get("/api/sample/{name}")
async def get_sample_image(name: str):
    """Retrieve built-in sample test images."""
    clean_name = Path(name).stem.lower()
    candidates = [
        STATIC_DIR / "samples" / f"{clean_name}.png",
        STATIC_DIR / "samples" / f"{clean_name}.jpg",
        SAMPLES_DIR / f"{clean_name}.png",
        SAMPLES_DIR / "sample_test.png",
    ]
    for c in candidates:
        if c.exists():
            return FileResponse(c, media_type="image/png")
    raise HTTPException(status_code=404, detail="Sample image not found")


@app.post("/api/render")
async def render_art(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    sample_name: Optional[str] = Form(None),
    style: str = Form("halfblock"),
    theme: str = Form("original"),
    preset: Optional[str] = Form(None),
    width: Optional[int] = Form(100),
    height: Optional[int] = Form(None),
    contrast: float = Form(1.0),
    brightness: float = Form(1.0),
    sharpness: float = Form(1.0),
    gamma: float = Form(1.0),
    density: float = Form(1.0),
    edge_enhance: bool = Form(False),
    invert: bool = Form(False),
    color: bool = Form(True),
    random_mode: bool = Form(False),
    seed: Optional[int] = Form(None),
):
    """Execute rendering pipeline and return styled HTML, raw ANSI, plain text, and performance stats."""
    t0 = time.perf_counter()

    pil_img: Optional[Image.Image] = None
    source_filename = "image.png"

    # 1. Resolve image source with human-friendly error catching
    try:
        if file and file.filename:
            content = await file.read()
            pil_img = Image.open(io.BytesIO(content))
            source_filename = file.filename
        elif image_base64:
            if "base64," in image_base64:
                image_base64 = image_base64.split("base64,")[1]
            raw_bytes = base64.b64decode(image_base64)
            pil_img = Image.open(io.BytesIO(raw_bytes))
        elif sample_name:
            clean_sname = Path(sample_name).stem.lower()
            candidates = [
                STATIC_DIR / "samples" / f"{clean_sname}.png",
                SAMPLES_DIR / f"{clean_sname}.png",
                SAMPLES_DIR / "sample_test.png",
            ]
            for c in candidates:
                if c.exists():
                    pil_img = Image.open(c)
                    source_filename = f"{clean_sname}.png"
                    break
        elif CURRENT_SESSION["image"] is not None:
            pil_img = CURRENT_SESSION["image"]
        else:
            # Fallback to default portrait or sample
            default_path = STATIC_DIR / "samples" / "portrait.png"
            if not default_path.exists():
                default_path = SAMPLES_DIR / "sample_test.png"
            if default_path.exists():
                pil_img = Image.open(default_path)
                source_filename = default_path.name
    except Image.DecompressionBombError:
        raise HTTPException(
            status_code=400,
            detail="This image is too large to process safely. Try a smaller image or resize it first."
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Could not open this image format: {str(e)}. Try a standard PNG, JPG, or WebP image."
        )

    if pil_img is None:
        raise HTTPException(status_code=400, detail="No valid image found to render.")

    try:
        pil_img.load()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image decoding failed: {str(e)}")

    CURRENT_SESSION["image"] = pil_img.copy()

    # 2. Build RenderConfig
    cfg = RenderConfig(
        image_path="",  # Direct in-memory image
        width=width,
        height=height,
        style=style,
        theme=theme,
        contrast=contrast,
        brightness=brightness,
        sharpness=sharpness,
        gamma=gamma,
        density=density,
        edge_enhance=edge_enhance,
        invert=invert,
        color=color,
        preset=preset if (preset and preset in PRESETS) else None,
        random_mode=random_mode,
        seed=seed,
    )

    # 3. Calculate target dimensions if height is None so it preserves aspect ratio on web
    orig_w, orig_h = pil_img.size
    renderer = get_renderer(cfg.style if cfg.style != "random" else "halfblock")
    char_aspect = renderer.char_aspect_ratio

    max_w = width if width is not None else 100
    if height is not None:
        max_h = height
    else:
        # Compute natural proportional height for aspect ratio
        calculated_h = int((orig_h / orig_w) * max_w * char_aspect)
        if cfg.style in ("halfblock", "cyberpunk"):
            max_h = max(10, calculated_h * 2)
        elif cfg.style == "braille":
            max_h = max(10, calculated_h * 4)
        else:
            max_h = max(10, calculated_h)
    cfg.height = max_h

    # 4. Execute rendering pipeline
    try:
        ansi_output = ArtPipeline.execute(cfg, image_input=pil_img)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rendering error: {str(e)}")

    t1 = time.perf_counter()
    render_time_ms = round((t1 - t0) * 1000, 2)

    # 5. Produce HTML and clean plain-text outputs
    html_output = ansi_to_html(ansi_output)
    plain_output = strip_ansi(ansi_output)

    # 6. Gather dimensions and metadata
    lines = plain_output.split("\n")
    out_rows = len(lines)
    out_cols = max(len(l) for l in lines) if lines else 0

    cli_cmd = build_cli_command(cfg, filename=source_filename)

    return {
        "status": "success",
        "html": html_output,
        "ansi": ansi_output,
        "plain": plain_output,
        "cli_command": cli_cmd,
        "stats": {
            "cols": out_cols,
            "rows": out_rows,
            "characters": len(plain_output),
            "render_time_ms": render_time_ms,
            "original_width": orig_w,
            "original_height": orig_h,
            "style": cfg.style,
            "theme": cfg.theme,
        },
    }


@app.post("/api/animate-frame")
async def get_animation_frame(
    frame: int = Form(0),
    anim_type: str = Form("matrix"),
    style: str = Form("halfblock"),
    theme: str = Form("original"),
    width: int = Form(100),
    contrast: float = Form(1.0),
    brightness: float = Form(1.0),
    sharpness: float = Form(1.0),
    edge_enhance: bool = Form(False),
    invert: bool = Form(False),
):
    """Generate a single live animation frame for smooth browser animation playback."""
    pil_img = CURRENT_SESSION.get("image")
    if pil_img is None:
        sample_path = SAMPLES_DIR / "sample_test.png"
        if sample_path.exists():
            pil_img = Image.open(sample_path)
            CURRENT_SESSION["image"] = pil_img
        else:
            raise HTTPException(status_code=400, detail="No session image available for animation.")

    orig_w, orig_h = pil_img.size
    renderer = get_renderer(style)
    char_aspect = renderer.char_aspect_ratio

    calculated_h = int((orig_h / orig_w) * width * char_aspect)
    if style in ("halfblock", "cyberpunk"):
        max_h = max(10, calculated_h * 2)
    elif style == "braille":
        max_h = max(10, calculated_h * 4)
    else:
        max_h = max(10, calculated_h)

    cfg = RenderConfig(
        image_path="",
        width=width,
        height=max_h,
        style=style,
        theme=theme,
        contrast=contrast,
        brightness=brightness,
        sharpness=sharpness,
        edge_enhance=edge_enhance,
        invert=invert,
    )

    # Process image
    target_w, target_h = ImageProcessor.calculate_target_dimensions(
        orig_w, orig_h, width, max_h, char_aspect_ratio=char_aspect
    )
    processed_img = ImageProcessor.process(
        image_input=pil_img,
        target_width=target_w,
        target_height=target_h,
        config=cfg,
    )

    theme_obj = get_theme(theme)

    # Effects dispatch
    if anim_type == "matrix":
        if CURRENT_SESSION["matrix_effect"] is None:
            CURRENT_SESSION["matrix_effect"] = MatrixRainEffect(processed_img.width, processed_img.height)
        frame_ansi = CURRENT_SESSION["matrix_effect"].render_frame(processed_img, frame)
    elif anim_type == "glitch":
        if CURRENT_SESSION["glitch_effect"] is None:
            CURRENT_SESSION["glitch_effect"] = GlitchEffect()
        base_ansi = renderer.render(processed_img, cfg, theme_obj)
        lines = base_ansi.split("\n")
        glitched_lines = CURRENT_SESSION["glitch_effect"].apply(lines, frame)
        frame_ansi = "\n".join(glitched_lines)
    elif anim_type == "pulse":
        import math
        from PIL import ImageEnhance
        factor = 0.8 + 0.4 * (0.5 + 0.5 * math.sin(frame * 0.25))
        enhancer = ImageEnhance.Brightness(processed_img.rgb)
        boosted_rgb = enhancer.enhance(factor)
        pulsed_img = ProcessedImage(
            rgb=boosted_rgb,
            luminance=boosted_rgb.convert("L"),
            width=processed_img.width,
            height=processed_img.height,
            original_size=processed_img.original_size,
        )
        frame_ansi = renderer.render(pulsed_img, cfg, theme_obj)
    elif anim_type == "cycle":
        cycle_theme = get_theme("rainbow")
        frame_ansi = renderer.render(processed_img, cfg, cycle_theme)
    else:
        # Default scanline / standard render
        frame_ansi = renderer.render(processed_img, cfg, theme_obj)

    frame_html = ansi_to_html(frame_ansi)
    return {
        "frame": frame,
        "html": frame_html,
    }


# Mount static directory for JS/CSS assets
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
