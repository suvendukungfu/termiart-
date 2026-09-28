"""Abstract base class and common utilities for all TermiArt renderers."""

from abc import ABC, abstractmethod
from typing import Tuple, Optional
from core.config import RenderConfig
from core.image_processor import ProcessedImage
from colors.themes import ColorTheme
from colors.rgb import rgb_fg, rgb_bg, RESET_ANSI


class BaseRenderer(ABC):
    """Abstract base class establishing the interface for all terminal art renderers."""

    name: str = "base"
    description: str = "Base Terminal Art Renderer"
    char_aspect_ratio: float = 0.5  # Default terminal char width/height ratio (~1:2)

    @abstractmethod
    def render(
        self,
        image: ProcessedImage,
        config: RenderConfig,
        theme: ColorTheme,
    ) -> str:
        """Render the processed image into a terminal art string with ANSI escape codes.

        Args:
            image: Preprocessed image with RGB and luminance data
            config: Render configuration
            theme: Active color theme
        """
        pass

    @staticmethod
    def get_char_by_luminance(
        luminance: int,
        charset: str,
        invert: bool = False,
        density: float = 1.0,
    ) -> str:
        """Map a luminance value [0-255] to a character from a ramp."""
        if not charset:
            return " "

        lum = luminance / 255.0
        if density != 1.0 and density > 0:
            lum = lum ** (1.0 / density)

        lum = max(0.0, min(1.0, lum))

        if invert:
            lum = 1.0 - lum

        index = int(lum * (len(charset) - 1))
        index = max(0, min(index, len(charset) - 1))
        return charset[index]

    @staticmethod
    def format_cell(
        char: str,
        fg_rgb: Optional[Tuple[int, int, int]] = None,
        bg_rgb: Optional[Tuple[int, int, int]] = None,
        color_enabled: bool = True,
    ) -> str:
        """Format a single character cell with ANSI color codes."""
        if not color_enabled:
            return char

        res = ""
        if fg_rgb is not None:
            res += rgb_fg(fg_rgb[0], fg_rgb[1], fg_rgb[2])
        if bg_rgb is not None:
            res += rgb_bg(bg_rgb[0], bg_rgb[1], bg_rgb[2])
        res += char
        return res
