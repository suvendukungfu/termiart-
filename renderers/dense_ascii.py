"""High-density ASCII art renderer with smooth 70-step tonal gradients."""

from renderers.base import BaseRenderer
from core.config import RenderConfig
from core.image_processor import ProcessedImage
from colors.themes import ColorTheme
from colors.rgb import RESET_ANSI


class DenseAsciiRenderer(BaseRenderer):
    """Dense ASCII renderer offering nuanced shading and intricate contour fidelity."""

    name = "dense_ascii"
    description = "Ultra-detailed 70-character high-density ASCII ramp"
    char_aspect_ratio = 0.5

    # 70-level smooth ramp from sparse to dense
    DENSE_CHARSET = (
        " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@"
    )

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
                    self.DENSE_CHARSET,
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
