"""CRT monitor scanline animation effect."""

import math
from typing import List, Tuple
from colors.rgb import clamp_byte, rgb_fg, RESET_ANSI


class ScanlineEffect:
    """Simulates a rolling CRT monitor scanline and subtle phosphor raster line."""

    def __init__(self, speed: float = 1.2, beam_height: int = 5) -> None:
        self.speed = speed
        self.beam_height = beam_height

    def get_row_multiplier(self, row_idx: int, total_rows: int, frame_num: int) -> float:
        """Calculate luminance multiplier for a row based on scanline position."""
        scan_pos = (frame_num * self.speed) % total_rows
        dist = abs(row_idx - scan_pos)
        if dist > total_rows / 2:
            dist = total_rows - dist

        if dist < self.beam_height:
            # Highlight beam
            boost = (1.0 - (dist / self.beam_height)) * 0.4
            return 1.0 + boost
        else:
            # Subtle alternating CRT raster lines
            raster = 0.92 if (row_idx % 2 == 0) else 1.0
            return raster
