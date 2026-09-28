"""High-resolution Braille terminal art renderer (2x4 dot matrix per cell)."""

import math
from typing import List, Tuple
from renderers.base import BaseRenderer
from core.config import RenderConfig
from core.image_processor import ProcessedImage
from colors.themes import ColorTheme
from colors.rgb import rgb_fg, RESET_ANSI


class BrailleRenderer(BaseRenderer):
    """Renders images using Unicode Braille patterns (U+2800 - U+28FF).
    
    Each Braille character represents a 2x4 pixel subgrid, yielding incredible
    spatial resolution and detailed line contours in the terminal.
    """

    name = "braille"
    description = "Ultra-dense 2x4 dot-matrix Unicode Braille renderer"
    char_aspect_ratio = 1.0  # 2 columns x 4 rows matches 1:2 cell aspect ratio

    # Offsets and bit weights for Unicode Braille matrix
    # Format: (dx, dy, bit_weight)
    BRAILLE_DOTS: List[Tuple[int, int, int]] = [
        (0, 0, 0x01),  # Dot 1
        (0, 1, 0x02),  # Dot 2
        (0, 2, 0x04),  # Dot 3
        (1, 0, 0x08),  # Dot 4
        (1, 1, 0x10),  # Dot 5
        (1, 2, 0x20),  # Dot 6
        (0, 3, 0x40),  # Dot 7
        (1, 3, 0x80),  # Dot 8
    ]

    def render(
        self,
        image: ProcessedImage,
        config: RenderConfig,
        theme: ColorTheme,
    ) -> str:
        lines = []
        width = image.width
        height = image.height

        # Dynamic threshold based on density
        base_threshold = int(128 / max(0.2, config.density))
        threshold = max(20, min(235, base_threshold))

        cells_x = math.ceil(width / 2)
        cells_y = math.ceil(height / 4)

        for cy in range(cells_y):
            line_parts = []
            base_y = cy * 4
            last_fg = None

            for cx in range(cells_x):
                base_x = cx * 2
                mask = 0
                active_rgbs = []
                all_rgbs = []

                for dx, dy, bit in self.BRAILLE_DOTS:
                    px = base_x + dx
                    py = base_y + dy
                    if px < width and py < height:
                        lum = image.get_luminance(px, py)
                        c = image.get_pixel_rgb(px, py)
                        all_rgbs.append((c, lum, px, py))

                        is_active = (lum >= threshold) if not config.invert else (lum < threshold)
                        if is_active:
                            mask |= bit
                            active_rgbs.append((c, lum, px, py))

                braille_char = chr(0x2800 + mask)

                if config.color:
                    # Choose representative color from active pixels or overall cell
                    source_pixels = active_rgbs if active_rgbs else all_rgbs
                    if source_pixels:
                        avg_r = int(sum(p[0][0] for p in source_pixels) / len(source_pixels))
                        avg_g = int(sum(p[0][1] for p in source_pixels) / len(source_pixels))
                        avg_b = int(sum(p[0][2] for p in source_pixels) / len(source_pixels))
                        avg_lum = int(sum(p[1] for p in source_pixels) / len(source_pixels))
                        theme_color = theme.transform(
                            (avg_r, avg_g, avg_b), avg_lum, base_x, base_y, width, height
                        )
                    else:
                        theme_color = (0, 0, 0)

                    if theme_color != last_fg:
                        line_parts.append(rgb_fg(theme_color[0], theme_color[1], theme_color[2]))
                        last_fg = theme_color

                line_parts.append(braille_char)

            if config.color:
                line_parts.append(RESET_ANSI)
            lines.append("".join(line_parts))

        return "\n".join(lines)
