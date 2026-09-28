"""Stylized Cyberpunk terminal art renderer."""

import math
from renderers.base import BaseRenderer
from core.config import RenderConfig
from core.image_processor import ProcessedImage
from colors.themes import ColorTheme, CyberpunkTheme
from colors.rgb import rgb_fg, rgb_bg, RESET_ANSI


class CyberpunkRenderer(BaseRenderer):
    """Futuristic cyberpunk renderer with vivid neon chromatic aberrations and edge highlights."""

    name = "cyberpunk"
    description = "Cyberpunk aesthetic with neon half-blocks and electric edge luminescence"
    char_aspect_ratio = 1.0  # Uses half-blocks for maximum visual punch

    UPPER_HALF_BLOCK = "▀"

    def __init__(self) -> None:
        self.cyberpunk_theme = CyberpunkTheme()

    def render(
        self,
        image: ProcessedImage,
        config: RenderConfig,
        theme: ColorTheme,
    ) -> str:
        lines = []
        width = image.width
        height = image.height

        num_terminal_rows = math.ceil(height / 2)
        active_theme = theme if theme.name != "original" else self.cyberpunk_theme

        for row in range(num_terminal_rows):
            line_parts = []
            y_top = row * 2
            y_bottom = y_top + 1

            last_fg = None
            last_bg = None

            for x in range(width):
                top_raw = image.get_pixel_rgb(x, y_top)
                top_lum = image.get_luminance(x, y_top)
                top_color = active_theme.transform(top_raw, top_lum, x, y_top, width, height)

                if y_bottom < height:
                    bot_raw = image.get_pixel_rgb(x, y_bottom)
                    bot_lum = image.get_luminance(x, y_bottom)
                    bot_color = active_theme.transform(bot_raw, bot_lum, x, y_bottom, width, height)
                else:
                    bot_color = (0, 0, 0)

                if not config.color:
                    char = "█" if (top_lum > 120 and bot_lum > 120) else ("▀" if top_lum > 120 else " ")
                    line_parts.append(char)
                    continue

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
