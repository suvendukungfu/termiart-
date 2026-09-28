"""Random style generator and randomized art renderer."""

import random
from typing import Tuple, Optional, Dict, Any
from renderers.base import BaseRenderer
from core.config import RenderConfig
from core.image_processor import ProcessedImage
from colors.themes import ColorTheme, get_theme


class RandomRenderer(BaseRenderer):
    """Dynamically chooses and configures render styles and color palettes."""

    name = "random"
    description = "Procedurally randomized combinations of renderers and themes"
    char_aspect_ratio = 1.0  # Dynamic based on chosen renderer

    AVAILABLE_RENDERERS = [
        "halfblock",
        "braille",
        "dense_ascii",
        "ascii",
        "unicode",
        "matrix",
        "cyberpunk",
    ]

    AVAILABLE_THEMES = [
        "cyberpunk",
        "fire",
        "ocean",
        "matrix",
        "rainbow",
        "purple_neon",
        "anime",
        "monochrome",
        "original",
    ]

    @classmethod
    def generate_randomized_profile(
        cls,
        base_config: RenderConfig,
        seed: Optional[int] = None,
    ) -> Tuple[Dict[str, Any], str]:
        """Generate randomized render parameters with optional seed reproducibility."""
        actual_seed = seed if seed is not None else random.randint(1000, 999999)
        rng = random.Random(actual_seed)

        chosen_renderer = rng.choice(cls.AVAILABLE_RENDERERS)
        chosen_theme = rng.choice(cls.AVAILABLE_THEMES)
        chosen_contrast = round(rng.uniform(1.15, 1.60), 2)
        chosen_brightness = round(rng.uniform(0.95, 1.25), 2)
        chosen_sharpness = round(rng.uniform(1.0, 1.5), 2)
        chosen_density = round(rng.uniform(0.80, 1.30), 2)
        chosen_edge = rng.choice([False, False, True])  # ~33% chance

        status_text = (
            f"Renderer: {chosen_renderer.replace('_', ' ').title()} | "
            f"Theme: {chosen_theme.replace('_', ' ').title()} | "
            f"Contrast: {chosen_contrast:.2f} | "
            f"Brightness: {chosen_brightness:.2f} | "
            f"Density: {chosen_density:.2f} | "
            f"Seed: {actual_seed}"
        )

        profile = {
            "style": chosen_renderer,
            "theme": chosen_theme,
            "contrast": chosen_contrast,
            "brightness": chosen_brightness,
            "sharpness": chosen_sharpness,
            "density": chosen_density,
            "edge_enhance": chosen_edge,
            "seed": actual_seed,
        }

        return profile, status_text

    def render(
        self,
        image: ProcessedImage,
        config: RenderConfig,
        theme: ColorTheme,
    ) -> str:
        # Import registry here to avoid circular imports
        from renderers import get_renderer

        profile, _ = self.generate_randomized_profile(config, config.seed)
        sub_renderer = get_renderer(profile["style"])
        sub_theme = get_theme(profile["theme"])

        # Create temporary updated config
        sub_config = RenderConfig(
            width=config.width,
            height=config.height,
            style=profile["style"],
            theme=profile["theme"],
            contrast=profile["contrast"],
            brightness=profile["brightness"],
            sharpness=profile["sharpness"],
            density=profile["density"],
            edge_enhance=profile["edge_enhance"],
            color=config.color,
            invert=config.invert,
            seed=profile["seed"],
        )

        return sub_renderer.render(image, sub_config, sub_theme)
