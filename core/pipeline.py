"""Art rendering pipeline coordinating preprocessing, styling, rendering, and export."""

import sys
from pathlib import Path
from typing import Optional, Tuple, Union
from PIL import Image
from core.config import RenderConfig, PRESETS
from core.terminal import Terminal, TerminalGuard, strip_ansi
from core.image_processor import ImageProcessor, ProcessedImage, clean_image_path
from renderers import get_renderer
from renderers.random_renderer import RandomRenderer
from colors.themes import get_theme


class ArtPipeline:
    """Coordinates image loading, terminal sizing, preprocessing, rendering, and export."""

    @classmethod
    def execute(
        cls,
        config: RenderConfig,
        image_input: Optional[Union[Image.Image, str, Path]] = None,
    ) -> str:
        """Run the full TermiArt pipeline based on config."""
        if image_input is not None:
            base_img = ImageProcessor.load_image(image_input)
        elif config.image_path:
            path = clean_image_path(config.image_path)
            base_img = ImageProcessor.load_image(path)
        else:
            raise ValueError("No image path or image object provided to the rendering pipeline.")

        orig_w, orig_h = base_img.size

        # Apply preset if specified
        if config.preset:
            config.apply_preset(config.preset)

        # Handle Random Mode
        random_status_line = None
        if config.random_mode or config.style == "random":
            profile, status_text = RandomRenderer.generate_randomized_profile(config, config.seed)
            config.style = profile["style"]
            config.theme = profile["theme"]
            config.contrast = profile["contrast"]
            config.brightness = profile["brightness"]
            config.sharpness = profile["sharpness"]
            config.density = profile["density"]
            config.edge_enhance = profile["edge_enhance"]
            config.seed = profile["seed"]
            random_status_line = status_text

        # Retrieve renderer & theme
        renderer = get_renderer(config.style)
        theme = get_theme(config.theme, seed=config.seed)

        # Determine target dimensions
        term_cols, term_rows = Terminal.get_size()

        # Allocate max dimensions with safe padding
        max_w = config.width if config.width is not None else max(20, term_cols)
        # For terminal display, leave 2 lines for prompt/status if height auto-detected
        available_rows = max(10, term_rows - (2 if random_status_line else 1))

        # Height mapping: Half-block packs 2 vertical pixels into 1 terminal row
        if config.style in ("halfblock", "cyberpunk"):
            max_h = (config.height * 2) if config.height is not None else (available_rows * 2)
        elif config.style == "braille":
            # Braille packs 4 vertical pixels per cell, 2 horizontal pixels per cell
            max_w = (config.width * 2) if config.width is not None else (max_w * 2)
            max_h = (config.height * 4) if config.height is not None else (available_rows * 4)
        else:
            max_h = config.height if config.height is not None else available_rows

        char_aspect = renderer.char_aspect_ratio
        target_w, target_h = ImageProcessor.calculate_target_dimensions(
            orig_w, orig_h, max_w, max_h, char_aspect_ratio=char_aspect
        )

        # Preprocess image
        processed_img = ImageProcessor.process(
            image_input=base_img,
            target_width=target_w,
            target_height=target_h,
            config=config,
        )

        # Animation branch
        if config.animate:
            from effects import AnimationEngine
            if random_status_line:
                print(random_status_line)
            AnimationEngine.run(processed_img, config)
            return ""

        # Static render
        rendered_art = renderer.render(processed_img, config, theme)

        # File export if requested
        if config.output_path:
            out_path = Path(config.output_path).expanduser().resolve()
            ext = out_path.suffix.lower()
            if ext == ".txt":
                # Clean plain-text without ANSI escapes
                content_to_write = strip_ansi(rendered_art)
            else:
                # .ans or other format: preserve ANSI true-color escapes
                content_to_write = rendered_art

            out_path.parent.mkdir(parents=True, exist_ok=True)
            out_path.write_text(content_to_write, encoding="utf-8")

        # Output to terminal
        with TerminalGuard(hide_cursor=False):
            if random_status_line:
                print(random_status_line)
            sys.stdout.write(rendered_art + "\n")
            sys.stdout.flush()

        return rendered_art
