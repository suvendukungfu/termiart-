"""Matrix digital rain animation effect."""

import random
from typing import List, Tuple
from core.image_processor import ProcessedImage
from colors.rgb import rgb_fg, RESET_ANSI


class MatrixDrop:
    """Represents a falling digital rain streamer."""
    def __init__(self, col: int, max_y: int) -> None:
        self.col = col
        self.max_y = max_y
        self.y = random.randint(-max_y, 0)
        self.speed = random.choice([1, 1, 2])
        self.length = random.randint(4, max(5, max_y // 2))

    def update(self) -> None:
        self.y += self.speed
        if self.y - self.length > self.max_y:
            self.y = random.randint(-self.length, 0)
            self.speed = random.choice([1, 1, 2])


class MatrixRainEffect:
    """Animated Matrix digital rain streaming over the dominant image structure."""

    RAIN_GLYPHS = "ﾊﾐﾋｰｳｼﾅﾓｸ0123456789XYZ"

    def __init__(self, width: int, height: int, density: float = 0.45) -> None:
        self.width = width
        self.height = height
        num_drops = int(width * density)
        self.drops = [MatrixDrop(random.randint(0, width - 1), height) for _ in range(num_drops)]
        self.rng = random.Random()

    def render_frame(self, image: ProcessedImage, frame_num: int) -> str:
        # Advance rain drops
        for drop in self.drops:
            drop.update()

        # Build column occupancy map
        # (col, y) -> intensity: 1.0 (head), 0.7 (body), 0.3 (tail)
        rain_map = {}
        for drop in self.drops:
            head_y = drop.y
            for i in range(drop.length):
                pos_y = head_y - i
                if 0 <= pos_y < self.height:
                    intensity = 1.0 if i == 0 else max(0.2, 1.0 - (i / drop.length))
                    # Higher intensity wins if drops overlap
                    current = rain_map.get((drop.col, pos_y), 0.0)
                    if intensity > current:
                        rain_map[(drop.col, pos_y)] = intensity

        lines = []
        for y in range(self.height):
            line_parts = []
            last_color = None

            for x in range(self.width):
                lum = image.get_luminance(x, y)
                intensity = rain_map.get((x, y), 0.0)

                # Character selection
                if intensity > 0.8:
                    char = self.rng.choice(self.RAIN_GLYPHS)
                    # Bright white-green head
                    color = (220, 255, 230)
                elif intensity > 0.3:
                    char = self.rng.choice(self.RAIN_GLYPHS)
                    # Glowing matrix green
                    g = min(255, int(160 + lum * 0.3))
                    color = (20, g, 40)
                elif lum > 40:
                    # Underlying image character
                    char = "0" if lum > 140 else ":"
                    g = min(255, int(50 + lum * 0.7))
                    color = (0, g, 20)
                else:
                    char = " "
                    color = (0, 0, 0)

                if color != last_color:
                    line_parts.append(rgb_fg(color[0], color[1], color[2]))
                    last_color = color

                line_parts.append(char)

            line_parts.append(RESET_ANSI)
            lines.append("".join(line_parts))

        return "\n".join(lines)
