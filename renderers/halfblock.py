"""High-quality Half-Block True-Color terminal renderer."""

import math
from renderers.base import BaseRenderer
from core.config import RenderConfig
from core.image_processor import ProcessedImage
from colors.themes import ColorTheme
from colors.rgb import rgb_fg, rgb_bg, RESET_ANSI


class HalfBlockRenderer(BaseRenderer):
    """Renders images using half-block characters (▀, ▄, █) with ANSI 24-bit TrueColor.
    
    Each terminal character cell displays two vertical pixels:
    - Foreground color for the upper half (▀)
    - Background color for the lower half
    This doubles vertical resolution and delivers near-photorealistic terminal imagery.
    """

    name = "halfblock"
    description = "True-Color 24-bit half-block renderer (2 vertical pixels/cell)"
    char_aspect_ratio = 1.0  # Two vertical subpixels restore square ~1:1 pixel aspect ratio

    UPPER_HALF_BLOCK = "▀"
    FULL_BLOCK = "█"
    SPACE = " "

    def render(
        self,
        image: ProcessedImage,
        config: RenderConfig,
        theme: ColorTheme,
    ) -> str:
        lines = []
        width = image.width
        height = image.height

        # Each character line covers 2 vertical pixels
        num_terminal_rows = math.ceil(height / 2)

        for row in range(num_terminal_rows):
            line_parts = []
            y_top = row * 2
            y_bottom = y_top + 1

            last_fg = None
            last_bg = None

            for x in range(width):
                top_raw = image.get_pixel_rgb(x, y_top)
                top_lum = image.get_luminance(x, y_top)
                top_color = theme.transform(top_raw, top_lum, x, y_top, width, height)

                if y_bottom < height:
                    bot_raw = image.get_pixel_rgb(x, y_bottom)
                    bot_lum = image.get_luminance(x, y_bottom)
                    bot_color = theme.transform(bot_raw, bot_lum, x, y_bottom, width, height)
                else:
                    # Bottom pixel out of bounds, use pure black
                    bot_color = (0, 0, 0)

                if not config.color:
                    # Fallback for monochrome when color disabled
                    if top_lum > 128 and bot_lum > 128:
                        line_parts.append(self.FULL_BLOCK)
                    elif top_lum > 128:
                        line_parts.append(self.UPPER_HALF_BLOCK)
                    elif bot_lum > 128:
                        line_parts.append("▄")
                    else:
                        line_parts.append(self.SPACE)
                    continue

                # Optimize ANSI escape sequences by reusing unchanged colors
                codes = []
                if top_color != last_fg:
                    codes.append(rgb_fg(top_color[0], top_color[1], top_color[2]))
                    last_fg = top_color

                if bot_color != last_bg:
                    codes.append(rgb_bg(bot_color[0], bot_color[1], bot_color[2]))
                    last_bg = bot_color

                if codes:
                    line_parts.append("".join(codes))

                line_parts.append(self.UPPER_HALF_BLOCK)

            if config.color:
                line_parts.append(RESET_ANSI)
            lines.append("".join(line_parts))

        return "\n".join(lines)
