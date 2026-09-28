"""Color system package."""

from colors.rgb import RGBColor, rgb_fg, rgb_bg, rgb_combo, RESET_ANSI, clamp_byte
from colors.gradients import lerp_rgb, multi_stop_gradient, rainbow_color
from colors.themes import (
    ColorTheme,
    OriginalTheme,
    MatrixGreenTheme,
    RainbowTheme,
    CyberpunkTheme,
    FireTheme,
    OceanTheme,
    PurpleNeonTheme,
    MonochromeTheme,
    AnimeTheme,
    THEMES,
    get_theme,
)

__all__ = [
    "RGBColor",
    "rgb_fg",
    "rgb_bg",
    "rgb_combo",
    "RESET_ANSI",
    "clamp_byte",
    "lerp_rgb",
    "multi_stop_gradient",
    "rainbow_color",
    "ColorTheme",
    "OriginalTheme",
    "MatrixGreenTheme",
    "RainbowTheme",
    "CyberpunkTheme",
    "FireTheme",
    "OceanTheme",
    "PurpleNeonTheme",
    "MonochromeTheme",
    "AnimeTheme",
    "THEMES",
    "get_theme",
]
