"""Cyberpunk glitch animation effect."""

import random
from typing import List


class GlitchEffect:
    """Applies subtle horizontal slice displacements and digital artifacts to art."""

    def __init__(self, glitch_frequency: float = 0.25) -> None:
        self.glitch_frequency = glitch_frequency
        self.rng = random.Random()

    def apply(self, rendered_lines: List[str], frame_num: int) -> List[str]:
        # Only glitch periodically
        if self.rng.random() > self.glitch_frequency:
            return rendered_lines

        output = list(rendered_lines)
        num_lines = len(output)
        if num_lines == 0:
            return output

        # Pick 1-2 small slices to glitch
        slice_start = self.rng.randint(0, num_lines - 1)
        slice_len = self.rng.randint(1, min(4, num_lines - slice_start))
        offset = self.rng.choice([-2, -1, 1, 2])

        for idx in range(slice_start, slice_start + slice_len):
            line = output[idx]
            if offset > 0:
                output[idx] = (" " * offset) + line
            elif offset < 0 and len(line) > abs(offset):
                output[idx] = line[abs(offset):]

        return output
