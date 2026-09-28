"""Command-line interface argument definitions and parsing for TermiArt."""

import argparse
from pathlib import Path
from typing import Optional, List, Tuple
from core.config import RenderConfig, PRESETS
from renderers import RENDERERS
from colors.themes import THEMES


def create_parser() -> argparse.ArgumentParser:
    """Build and configure the CLI argument parser."""
    parser = argparse.ArgumentParser(
        prog="termiart",
        description="TermiArt - High-Fidelity Image to Terminal Art Converter for macOS Terminal",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  termiart image.png                          # Render using default Half-Block true-color
  termiart image.jpg --style ascii            # Render in classic ASCII
  termiart image.webp --style matrix          # Matrix digital rain theme
  termiart photo.png --random                 # Generate randomized aesthetic
  termiart photo.png --random --seed 42       # Reproducible randomized aesthetic
  termiart logo.png --preset cyberpunk        # Quick preset (cyberpunk neon)
  termiart face.jpg --animate --style matrix  # Matrix rain animation
  termiart art.png --width 120 --contrast 1.4 # Custom resolution and contrast
  termiart diagram.png --output art.txt       # Export to text file
  termiart                                    # Launch interactive menu
        """,
    )

    # Positional image path
    parser.add_argument(
        "image",
        nargs="?",
        default=None,
        help="Path to image file (JPG, PNG, WEBP, etc.) or drag-and-drop file path",
    )

    # Styling & Renderer
    style_choices = list(RENDERERS.keys())
    parser.add_argument(
        "-s", "--style", "--renderer",
        dest="style",
        default="halfblock",
        choices=style_choices,
        help="Rendering engine style (default: halfblock)",
    )

    # Color Theme
    theme_choices = list(THEMES.keys()) + ["random"]
    parser.add_argument(
        "-t", "--theme", "--color-theme",
        dest="theme",
        default="original",
        choices=theme_choices,
        help="Color theme palette (default: original)",
    )

    parser.add_argument(
        "--no-color",
        dest="color",
        action="store_false",
        help="Disable ANSI 24-bit TrueColor and render in monochrome",
    )

    # Random Mode
    parser.add_argument(
        "-r", "--random",
        dest="random_mode",
        action="store_true",
        help="Enable random art generator (randomizes renderer, theme, and processing)",
    )

    parser.add_argument(
        "--seed",
        dest="seed",
        type=int,
        default=None,
        help="Seed for reproducible random styles (e.g. --seed 42)",
    )

    # Presets
    preset_choices = list(PRESETS.keys()) + ["random"]
    parser.add_argument(
        "-p", "--preset",
        dest="preset",
        default=None,
        choices=preset_choices,
        help="Apply pre-configured aesthetic preset",
    )

    # Dimensions
    parser.add_argument(
        "-W", "--width",
        dest="width",
        type=int,
        default=None,
        help="Target render width in terminal columns (default: auto-detected)",
    )

    parser.add_argument(
        "-H", "--height",
        dest="height",
        type=int,
        default=None,
        help="Target render height in terminal rows (default: auto-detected)",
    )

    # Image Processing Adjustments
    parser.add_argument(
        "--contrast",
        dest="contrast",
        type=float,
        default=1.0,
        help="Contrast multiplier (e.g. 1.3 for boosted contrast)",
    )

    parser.add_argument(
        "--brightness",
        dest="brightness",
        type=float,
        default=1.0,
        help="Brightness multiplier (e.g. 1.1 for brighter image)",
    )

    parser.add_argument(
        "--sharpness",
        dest="sharpness",
        type=float,
        default=1.0,
        help="Sharpness multiplier (e.g. 1.5 to accentuate fine lines)",
    )

    parser.add_argument(
        "--gamma",
        dest="gamma",
        type=float,
        default=1.0,
        help="Gamma curve correction (default: 1.0)",
    )

    parser.add_argument(
        "--density",
        dest="density",
        type=float,
        default=1.0,
        help="Character/dot density multiplier (default: 1.0)",
    )

    parser.add_argument(
        "-e", "--edge", "--edge-enhance",
        dest="edge_enhance",
        action="store_true",
        help="Enhance edges and contours prior to rendering",
    )

    parser.add_argument(
        "-i", "--invert",
        dest="invert",
        action="store_true",
        help="Invert luminance mapping / negative color effect",
    )

    # Animation
    parser.add_argument(
        "-a", "--animate",
        dest="animate",
        action="store_true",
        help="Run dynamic terminal animation loop",
    )

    parser.add_argument(
        "--animation-type",
        dest="animation_type",
        default="matrix",
        choices=["matrix", "glitch", "pulse", "cycle", "scanline"],
        help="Animation effect type (default: matrix)",
    )

    parser.add_argument(
        "--fps",
        dest="fps",
        type=float,
        default=15.0,
        help="Animation frames per second (default: 15.0)",
    )

    # Export
    parser.add_argument(
        "-o", "--output",
        dest="output_path",
        type=str,
        default=None,
        help="Export art to file (.txt for clean plain-text, .ans for ANSI true-color)",
    )

    # Interactive & Debug
    parser.add_argument(
        "--interactive",
        dest="interactive",
        action="store_true",
        help="Force launch interactive menu mode",
    )

    parser.add_argument(
        "--debug",
        dest="debug",
        action="store_true",
        help="Display full Python tracebacks on error",
    )

    # Web Studio UI
    parser.add_argument(
        "--web",
        dest="web",
        action="store_true",
        help="Launch the TermiArt Web Studio UI in your web browser",
    )

    parser.add_argument(
        "--port",
        dest="port",
        type=int,
        default=8080,
        help="Port for Web Studio server (default: 8080)",
    )

    return parser


def parse_arguments(args: Optional[List[str]] = None) -> Tuple[RenderConfig, bool]:
    """Parse CLI arguments into a RenderConfig. Returns (config, is_interactive_requested)."""
    parser = create_parser()
    parsed = parser.parse_args(args)

    config = RenderConfig(
        image_path=Path(parsed.image) if parsed.image else None,
        output_path=Path(parsed.output_path) if parsed.output_path else None,
        width=parsed.width,
        height=parsed.height,
        style=parsed.style,
        theme=parsed.theme,
        color=parsed.color,
        contrast=parsed.contrast,
        brightness=parsed.brightness,
        sharpness=parsed.sharpness,
        gamma=parsed.gamma,
        density=parsed.density,
        edge_enhance=parsed.edge_enhance,
        invert=parsed.invert,
        random_mode=parsed.random_mode,
        seed=parsed.seed,
        preset=parsed.preset,
        animate=parsed.animate,
        animation_type=parsed.animation_type,
        fps=parsed.fps,
        debug=parsed.debug,
        web=parsed.web,
        port=parsed.port,
    )

    should_run_interactive = not parsed.web and (parsed.interactive or (parsed.image is None and not parsed.random_mode))
    return config, should_run_interactive
