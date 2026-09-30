"""ANSI 24-bit TrueColor utilities and RGB color manipulations."""

from dataclasses import dataclass
from typing import Tuple, Optional


def clamp_byte(val: float) -> int:
    """Clamp float/int to valid 8-bit color byte [0, 255]."""
    return min(255, max(0, int(round(val))))


@dataclass(frozen=True)
class RGBColor:
    """Represents a 24-bit RGB color with terminal escape helpers."""
    r: int
    g: int
    b: int

    def __post_init__(self) -> None:
        object.__setattr__(self, "r", clamp_byte(self.r))
        object.__setattr__(self, "g", clamp_byte(self.g))
        object.__setattr__(self, "b", clamp_byte(self.b))

    @property
    def tuple(self) -> Tuple[int, int, int]:
        return (self.r, self.g, self.b)

    @property
    def fg_ansi(self) -> str:
        """ANSI escape sequence for 24-bit foreground."""
        return f"\033[38;2;{self.r};{self.g};{self.b}m"

    @property
    def bg_ansi(self) -> str:
        """ANSI escape sequence for 24-bit background."""
        return f"\033[48;2;{self.r};{self.g};{self.b}m"

    @property
    def luminance(self) -> int:
        """Perceived ITU-R BT.601 luminance."""
        return clamp_byte(0.299 * self.r + 0.587 * self.g + 0.114 * self.b)

    def blend(self, other: "RGBColor", factor: float) -> "RGBColor":
        """Linear blend with another color (factor 0.0 = self, 1.0 = other)."""
        f = min(1.0, max(0.0, factor))
        nr = self.r + (other.r - self.r) * f
        ng = self.g + (other.g - self.g) * f
        nb = self.b + (other.b - self.b) * f
        return RGBColor(int(nr), int(ng), int(nb))


def rgb_fg(r: int, g: int, b: int) -> str:
    """Generate ANSI true-color foreground escape code."""
    return f"\033[38;2;{clamp_byte(r)};{clamp_byte(g)};{clamp_byte(b)}m"


def rgb_bg(r: int, g: int, b: int) -> str:
    """Generate ANSI true-color background escape code."""
    return f"\033[48;2;{clamp_byte(r)};{clamp_byte(g)};{clamp_byte(b)}m"


def rgb_combo(
    fg_rgb: Tuple[int, int, int],
    bg_rgb: Optional[Tuple[int, int, int]] = None,
) -> str:
    """Generate combined foreground and optional background ANSI true-color code."""
    fr, fg, fb = fg_rgb
    code = f"\033[38;2;{clamp_byte(fr)};{clamp_byte(fg)};{clamp_byte(fb)}m"
    if bg_rgb is not None:
        br, bg, bb = bg_rgb
        code += f"\033[48;2;{clamp_byte(br)};{clamp_byte(bg)};{clamp_byte(bb)}m"
    return code


RESET_ANSI = "\033[0m"
