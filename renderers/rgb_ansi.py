"""RGB ANSI TrueColor terminal renderer."""

from renderers.base import BaseRenderer
from core.config import RenderConfig
from core.image_processor import ProcessedImage
from colors.themes import ColorTheme
from colors.rgb import rgb_fg, RESET_ANSI


class RgbAnsiRenderer(BaseRenderer):
    """Renders images using 24-bit ANSI TrueColor with full block elements (█)."""

    name = "rgb"
    description = "Full-block ANSI 24-bit TrueColor renderer"
    char_aspect_ratio = 0.5

    BLOCK_CHAR = "█"

    def render(
        self,
        image: ProcessedImage,
        config: RenderConfig,
        theme: ColorTheme,
    ) -> str:
        lines = []
        width = image.width
        height = image.height

        for y in range(height):
            line_parts = []
            last_fg = None

            for x in range(width):
                lum = image.get_luminance(x, y)
                raw_rgb = image.get_pixel_rgb(x, y)
                theme_rgb = theme.transform(raw_rgb, lum, x, y, width, height)

                if config.color:
                    if theme_rgb != last_fg:
                        line_parts.append(rgb_fg(theme_rgb[0], theme_rgb[1], theme_rgb[2]))
                        last_fg = theme_rgb
                    line_parts.append(self.BLOCK_CHAR)
                else:
                    char = " " if lum < 64 else ("░" if lum < 128 else ("▒" if lum < 192 else "█"))
                    line_parts.append(char)

            if config.color:
                line_parts.append(RESET_ANSI)
            lines.append("".join(line_parts))

        return "\n".join(lines)
