"""Matrix digital code terminal art renderer."""

import random
from renderers.base import BaseRenderer
from core.config import RenderConfig
from core.image_processor import ProcessedImage
from colors.themes import ColorTheme, MatrixGreenTheme
from colors.rgb import rgb_fg, RESET_ANSI


class MatrixRenderer(BaseRenderer):
    """Renders images using cybernetic Matrix digital glyphs and phosphor greens.
    
    The underlying image structure and silhouette remain dominant and crisp,
    with glyph density and luminance precisely reflecting image features.
    """

    name = "matrix"
    description = "Iconic Matrix digital glyph aesthetic with phosphor green palette"
    char_aspect_ratio = 0.5

    # Shading glyph tiers organized by luminance weight
    SPARSE_GLYPHS = " .:`"
    MID_GLYPHS = "017:=+*xzXZ$#<>"
    DENSE_GLYPHS = "89MW@%&0123456789ﾊﾐﾋｰｳｼﾅﾓｸ"

    def __init__(self) -> None:
        self.matrix_theme = MatrixGreenTheme()

    def render(
        self,
        image: ProcessedImage,
        config: RenderConfig,
        theme: ColorTheme,
    ) -> str:
        lines = []
        width = image.width
        height = image.height

        # Use seed if provided for reproducible glyph jitter
        rng = random.Random(config.seed if config.seed is not None else 42)

        # Allow user-selected theme or default to Matrix Green
        active_theme = theme if theme.name != "original" else self.matrix_theme

        for y in range(height):
            line_parts = []
            last_fg = None

            for x in range(width):
                lum = image.get_luminance(x, y)

                # Character selection based on luminance thresholds
                if lum < 35:
                    char = " "
                elif lum < 85:
                    char = rng.choice(self.SPARSE_GLYPHS)
                elif lum < 180:
                    char = rng.choice(self.MID_GLYPHS)
                else:
                    char = rng.choice(self.DENSE_GLYPHS)

                if config.color:
                    raw_rgb = image.get_pixel_rgb(x, y)
                    theme_color = active_theme.transform(raw_rgb, lum, x, y, width, height)

                    if theme_color != last_fg:
                        line_parts.append(rgb_fg(theme_color[0], theme_color[1], theme_color[2]))
                        last_fg = theme_color

                line_parts.append(char)

            if config.color:
                line_parts.append(RESET_ANSI)
            lines.append("".join(line_parts))

        return "\n".join(lines)
