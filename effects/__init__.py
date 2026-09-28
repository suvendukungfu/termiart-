"""Animation effects and loop orchestration."""

import time
import sys
import math
from typing import Optional, Callable
from PIL import ImageEnhance

from core.terminal import Terminal, TerminalGuard
from core.config import RenderConfig
from core.image_processor import ProcessedImage, ImageProcessor
from renderers import get_renderer
from colors.themes import get_theme
from colors.gradients import rainbow_color
from effects.matrix_rain import MatrixRainEffect
from effects.glitch import GlitchEffect
from effects.scanline import ScanlineEffect


class AnimationEngine:
    """Orchestrates real-time CPU-efficient terminal animations with safe teardown."""

    @classmethod
    def run(
        cls,
        image: ProcessedImage,
        config: RenderConfig,
    ) -> None:
        """Run terminal animation until Ctrl+C or duration expires."""
        fps = max(1.0, min(60.0, config.fps))
        frame_delay = 1.0 / fps
        anim_type = config.animation_type.lower().strip()

        renderer = get_renderer(config.style)
        theme = get_theme(config.theme, seed=config.seed)

        matrix_effect = MatrixRainEffect(image.width, image.height)
        glitch_effect = GlitchEffect()
        scanline_effect = ScanlineEffect()

        frame = 0
        start_time = time.time()

        with TerminalGuard(hide_cursor=True, clear_on_start=True):
            try:
                while True:
                    if config.animation_duration and (time.time() - start_time) > config.animation_duration:
                        break

                    # Move cursor to top-left to avoid flicker
                    sys.stdout.write(Terminal.RESET_CURSOR)

                    if anim_type == "matrix":
                        frame_str = matrix_effect.render_frame(image, frame)
                    elif anim_type == "glitch":
                        base_str = renderer.render(image, config, theme)
                        lines = base_str.split("\n")
                        glitched_lines = glitch_effect.apply(lines, frame)
                        frame_str = "\n".join(glitched_lines)
                    elif anim_type == "pulse":
                        # Modulate brightness sinusoidally
                        factor = 0.8 + 0.4 * (0.5 + 0.5 * math.sin(frame * 0.25))
                        pulsed_cfg = RenderConfig(
                            width=config.width,
                            height=config.height,
                            style=config.style,
                            theme=config.theme,
                            contrast=config.contrast,
                            brightness=config.brightness * factor,
                            sharpness=config.sharpness,
                            density=config.density,
                            color=config.color,
                            invert=config.invert,
                        )
                        enhancer = ImageEnhance.Brightness(image.rgb)
                        boosted_rgb = enhancer.enhance(factor)
                        pulsed_img = ProcessedImage(
                            rgb=boosted_rgb,
                            luminance=boosted_rgb.convert("L"),
                            width=image.width,
                            height=image.height,
                            original_size=image.original_size,
                        )
                        frame_str = renderer.render(pulsed_img, pulsed_cfg, theme)
                    elif anim_type == "cycle":
                        # Cycle rainbow hue or theme gradient
                        cycle_theme = get_theme("rainbow")
                        frame_str = renderer.render(image, config, cycle_theme)
                    elif anim_type == "scanline":
                        base_str = renderer.render(image, config, theme)
                        lines = base_str.split("\n")
                        # Lightly format lines
                        frame_str = "\n".join(lines)
                    else:
                        # Default to matrix rain if matrix style, else pulse
                        if config.style == "matrix":
                            frame_str = matrix_effect.render_frame(image, frame)
                        else:
                            base_str = renderer.render(image, config, theme)
                            lines = base_str.split("\n")
                            frame_str = "\n".join(glitch_effect.apply(lines, frame))

                    sys.stdout.write(frame_str)
                    sys.stdout.flush()

                    frame += 1
                    time.sleep(frame_delay)

            except KeyboardInterrupt:
                # Graceful interrupt when user presses Ctrl+C
                pass


__all__ = [
    "MatrixRainEffect",
    "GlitchEffect",
    "ScanlineEffect",
    "AnimationEngine",
]
