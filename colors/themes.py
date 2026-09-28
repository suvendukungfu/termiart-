"""Color themes mapping RGB colors and luminance to stylized terminal palettes."""

import colorsys
import random
from abc import ABC, abstractmethod
from typing import Dict, Tuple, List, Optional
from colors.rgb import clamp_byte
from colors.gradients import multi_stop_gradient, rainbow_color, lerp_rgb


class ColorTheme(ABC):
    """Abstract base class for all TermiArt color themes."""

    name: str = "base"
    description: str = "Base Color Theme"

    @abstractmethod
    def transform(
        self,
        rgb: Tuple[int, int, int],
        luminance: int,
        x: int,
        y: int,
        width: int,
        height: int,
    ) -> Tuple[int, int, int]:
        """Transform an image pixel's color into the theme's color."""
        pass


class OriginalTheme(ColorTheme):
    """Preserves authentic 24-bit true-color RGB from the original image."""

    name = "original"
    description = "True-color faithful rendition of the original image"

    def transform(
        self,
        rgb: Tuple[int, int, int],
        luminance: int,
        x: int,
        y: int,
        width: int,
        height: int,
    ) -> Tuple[int, int, int]:
        return rgb


class MatrixGreenTheme(ColorTheme):
    """Phosphor CRT green Matrix aesthetic with bright digital highlights."""

    name = "matrix"
    description = "Digital rain phosphor greens with bright terminal highlights"

    STOPS = [
        (0.00, (0, 12, 0)),
        (0.25, (0, 60, 15)),
        (0.55, (0, 180, 45)),
        (0.85, (30, 255, 90)),
        (1.00, (220, 255, 230)),
    ]

    def transform(
        self,
        rgb: Tuple[int, int, int],
        luminance: int,
        x: int,
        y: int,
        width: int,
        height: int,
    ) -> Tuple[int, int, int]:
        t = luminance / 255.0
        return multi_stop_gradient(self.STOPS, t)


class RainbowTheme(ColorTheme):
    """Full-spectrum chromatic rainbow based on position and luminance."""

    name = "rainbow"
    description = "Vibrant multi-spectral chromatic rainbow gradient"

    def transform(
        self,
        rgb: Tuple[int, int, int],
        luminance: int,
        x: int,
        y: int,
        width: int,
        height: int,
    ) -> Tuple[int, int, int]:
        # Spatial wave combined with luminance
        pos_phase = (x / max(1, width) + y / max(1, height)) * 0.5
        lum_phase = (luminance / 255.0) * 0.5
        t = (pos_phase + lum_phase) % 1.0
        # Value depends on luminance so dark regions stay darker
        val = max(0.15, luminance / 255.0)
        r, g, b = rainbow_color(t, saturation=0.9, value=val)
        return (r, g, b)


class CyberpunkTheme(ColorTheme):
    """High-contrast neon cyan, hot magenta, and electric violet."""

    name = "cyberpunk"
    description = "Neon Tokyo nightscape: cyan, hot pink, and ultraviolet"

    STOPS = [
        (0.00, (8, 0, 20)),
        (0.20, (50, 0, 90)),
        (0.45, (255, 0, 128)),   # Hot pink / magenta
        (0.75, (0, 220, 255)),   # Neon cyan
        (0.92, (255, 230, 0)),   # Canary electric yellow
        (1.00, (255, 255, 255)), # Flash highlight
    ]

    def transform(
        self,
        rgb: Tuple[int, int, int],
        luminance: int,
        x: int,
        y: int,
        width: int,
        height: int,
    ) -> Tuple[int, int, int]:
        t = luminance / 255.0
        theme_rgb = multi_stop_gradient(self.STOPS, t)
        # Blend subtly with original color hue to maintain recognizable features
        return lerp_rgb(rgb, theme_rgb, 0.75)


class FireTheme(ColorTheme):
    """Incandescent glow of smoldering embers, blazing orange, and white heat."""

    name = "fire"
    description = "Blazing inferno: crimson embers to white-hot plasma"

    STOPS = [
        (0.00, (10, 0, 0)),
        (0.20, (110, 0, 0)),
        (0.45, (220, 45, 0)),
        (0.70, (255, 140, 0)),
        (0.88, (255, 230, 50)),
        (1.00, (255, 255, 245)),
    ]

    def transform(
        self,
        rgb: Tuple[int, int, int],
        luminance: int,
        x: int,
        y: int,
        width: int,
        height: int,
    ) -> Tuple[int, int, int]:
        t = luminance / 255.0
        return multi_stop_gradient(self.STOPS, t)


class OceanTheme(ColorTheme):
    """Deep oceanic abyss, bioluminescent teal, and cresting white foam."""

    name = "ocean"
    description = "Abyssal blue to bioluminescent turquoise and seafoam"

    STOPS = [
        (0.00, (0, 6, 20)),
        (0.25, (0, 30, 80)),
        (0.55, (0, 140, 180)),
        (0.80, (0, 235, 220)),
        (1.00, (225, 250, 255)),
    ]

    def transform(
        self,
        rgb: Tuple[int, int, int],
        luminance: int,
        x: int,
        y: int,
        width: int,
        height: int,
    ) -> Tuple[int, int, int]:
        t = luminance / 255.0
        return multi_stop_gradient(self.STOPS, t)


class PurpleNeonTheme(ColorTheme):
    """Synthwave / outrun aesthetic with ultraviolet, neon magenta, and cyan."""

    name = "purple_neon"
    description = "Synthwave ultraviolet, electric magenta, and neon lavender"

    STOPS = [
        (0.00, (15, 0, 30)),
        (0.30, (80, 0, 140)),
        (0.60, (180, 0, 255)),
        (0.85, (255, 60, 220)),
        (1.00, (180, 240, 255)),
    ]

    def transform(
        self,
        rgb: Tuple[int, int, int],
        luminance: int,
        x: int,
        y: int,
        width: int,
        height: int,
    ) -> Tuple[int, int, int]:
        t = luminance / 255.0
        return multi_stop_gradient(self.STOPS, t)


class MonochromeTheme(ColorTheme):
    """Classic black and white grayscale with high dynamic range."""

    name = "monochrome"
    description = "Refined monochromatic black, silver, and crisp white"

    def transform(
        self,
        rgb: Tuple[int, int, int],
        luminance: int,
        x: int,
        y: int,
        width: int,
        height: int,
    ) -> Tuple[int, int, int]:
        return (luminance, luminance, luminance)


class AnimeTheme(ColorTheme):
    """Vibrant anime cel-shading aesthetic with boosted color saturation and clarity."""

    name = "anime"
    description = "Saturated anime cel aesthetic with vibrant highlights and pop"

    def transform(
        self,
        rgb: Tuple[int, int, int],
        luminance: int,
        x: int,
        y: int,
        width: int,
        height: int,
    ) -> Tuple[int, int, int]:
        r, g, b = [c / 255.0 for c in rgb]
        h, s, v = colorsys.rgb_to_hsv(r, g, b)
        # Boost saturation and brightness for anime pop
        s = min(1.0, s * 1.45 + 0.05)
        v = min(1.0, v * 1.15)
        nr, ng, nb = colorsys.hsv_to_rgb(h, s, v)
        return (clamp_byte(nr * 255), clamp_byte(ng * 255), clamp_byte(nb * 255))


THEMES: Dict[str, ColorTheme] = {
    "original": OriginalTheme(),
    "matrix": MatrixGreenTheme(),
    "rainbow": RainbowTheme(),
    "cyberpunk": CyberpunkTheme(),
    "fire": FireTheme(),
    "ocean": OceanTheme(),
    "purple_neon": PurpleNeonTheme(),
    "monochrome": MonochromeTheme(),
    "anime": AnimeTheme(),
}


def get_theme(name: str, seed: Optional[int] = None) -> ColorTheme:
    """Retrieve theme by name, or select a random one if 'random' is requested."""
    clean = name.lower().strip()
    if clean == "random":
        rng = random.Random(seed)
        # Exclude 'random' and pick from concrete themes
        choices = [k for k in THEMES.keys() if k != "random"]
        selected = rng.choice(choices)
        return THEMES[selected]
    if clean in THEMES:
        return THEMES[clean]
    valid = ", ".join(list(THEMES.keys()) + ["random"])
    raise ValueError(f"Unknown color theme '{name}'. Available themes: {valid}")
