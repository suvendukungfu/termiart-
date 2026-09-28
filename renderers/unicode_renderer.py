"""Unicode block and shade terminal art renderer."""

from renderers.base import BaseRenderer
from core.config import RenderConfig
from core.image_processor import ProcessedImage
from colors.themes import ColorTheme
from colors.rgb import RESET_ANSI


class UnicodeRenderer(BaseRenderer):
    """Renders images using Unicode shade blocks (░, ▒, ▓, █)."""

    name = "unicode"
    description = "Unicode block elements and dithering shades"
    char_aspect_ratio = 0.5

    UNICODE_SHADES = " ░▒▓█"

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
                char = self.get_char_by_luminance(
                    lum,
                    self.UNICODE_SHADES,
                    invert=config.invert,
                    density=config.density,
                )

                if config.color:
                    raw_rgb = image.get_pixel_rgb(x, y)
                    theme_rgb = theme.transform(raw_rgb, lum, x, y, width, height)
                    if theme_rgb != last_fg:
                        line_parts.append(self.format_cell(char, fg_rgb=theme_rgb, color_enabled=True))
                        last_fg = theme_rgb
                    else:
                        line_parts.append(char)
                else:
                    line_parts.append(char)

            if config.color:
                line_parts.append(RESET_ANSI)
            lines.append("".join(line_parts))

        return "\n".join(lines)
