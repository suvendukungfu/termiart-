"""Gradient generators and color interpolation utilities."""

import colorsys
from typing import List, Tuple
from colors.rgb import clamp_byte


def lerp_rgb(c1: Tuple[int, int, int], c2: Tuple[int, int, int], t: float) -> Tuple[int, int, int]:
    """Linearly interpolate between two RGB colors (t between 0.0 and 1.0)."""
    t_clamped = min(1.0, max(0.0, t))
    r = int(c1[0] + (c2[0] - c1[0]) * t_clamped)
    g = int(c1[1] + (c2[1] - c1[1]) * t_clamped)
    b = int(c1[2] + (c2[2] - c1[2]) * t_clamped)
    return (clamp_byte(r), clamp_byte(g), clamp_byte(b))


def multi_stop_gradient(
    stops: List[Tuple[float, Tuple[int, int, int]]],
    t: float,
) -> Tuple[int, int, int]:
    """Interpolate through a multi-stop color gradient.
    
    stops is a sorted list of (position_float, (r, g, b)) where position is in [0.0, 1.0].
    """
    if not stops:
        return (255, 255, 255)
    if len(stops) == 1:
        return stops[0][1]

    t_val = min(1.0, max(0.0, t))

    if t_val <= stops[0][0]:
        return stops[0][1]
    if t_val >= stops[-1][0]:
        return stops[-1][1]

    for i in range(len(stops) - 1):
        pos1, color1 = stops[i]
        pos2, color2 = stops[i + 1]
        if pos1 <= t_val <= pos2:
            span = pos2 - pos1
            if span == 0:
                return color1
            factor = (t_val - pos1) / span
            return lerp_rgb(color1, color2, factor)

    return stops[-1][1]


def rainbow_color(t: float, saturation: float = 0.95, value: float = 0.95) -> Tuple[int, int, int]:
    """Generate a smooth rainbow color at phase t in [0.0, 1.0]."""
    hue = t % 1.0
    r, g, b = colorsys.hsv_to_rgb(hue, saturation, value)
    return (clamp_byte(r * 255), clamp_byte(g * 255), clamp_byte(b * 255))
