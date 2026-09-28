"""Unit tests for the color and theme systems."""

import unittest
from colors.rgb import RGBColor, rgb_fg, rgb_bg, clamp_byte, RESET_ANSI
from colors.gradients import lerp_rgb, multi_stop_gradient, rainbow_color
from colors.themes import (
    THEMES,
    get_theme,
    MatrixGreenTheme,
    CyberpunkTheme,
    FireTheme,
    OceanTheme,
    MonochromeTheme,
    AnimeTheme,
)


class TestColorSystem(unittest.TestCase):
    """Test suite for RGB, gradients, and theme transformations."""

    def test_clamp_byte(self) -> None:
        self.assertEqual(clamp_byte(-10), 0)
        self.assertEqual(clamp_byte(300), 255)
        self.assertEqual(clamp_byte(127.6), 128)

    def test_rgb_ansi_codes(self) -> None:
        fg = rgb_fg(255, 128, 0)
        self.assertEqual(fg, "\033[38;2;255;128;0m")

        bg = rgb_bg(10, 20, 30)
        self.assertEqual(bg, "\033[48;2;10;20;30m")

    def test_rgb_color_class(self) -> None:
        c = RGBColor(100, 150, 200)
        self.assertEqual(c.tuple, (100, 150, 200))
        self.assertTrue(0 <= c.luminance <= 255)

        blended = c.blend(RGBColor(0, 0, 0), 0.5)
        self.assertEqual(blended.r, 50)
        self.assertEqual(blended.g, 75)
        self.assertEqual(blended.b, 100)

    def test_gradients(self) -> None:
        c1 = (0, 0, 0)
        c2 = (100, 200, 50)
        mid = lerp_rgb(c1, c2, 0.5)
        self.assertEqual(mid, (50, 100, 25))

        stops = [(0.0, (0, 0, 0)), (1.0, (255, 255, 255))]
        self.assertEqual(multi_stop_gradient(stops, 0.0), (0, 0, 0))
        self.assertEqual(multi_stop_gradient(stops, 1.0), (255, 255, 255))
        self.assertEqual(multi_stop_gradient(stops, 0.5), (127, 127, 127))

        rb = rainbow_color(0.5)
        self.assertEqual(len(rb), 3)

    def test_themes(self) -> None:
        test_rgb = (120, 80, 200)
        lum = 100

        for name, theme in THEMES.items():
            out = theme.transform(test_rgb, lum, 5, 5, 20, 20)
            self.assertIsInstance(out, tuple)
            self.assertEqual(len(out), 3)
            for ch in out:
                self.assertTrue(0 <= ch <= 255)

        # Monochrome check
        mono = MonochromeTheme()
        self.assertEqual(mono.transform(test_rgb, 142, 0, 0, 10, 10), (142, 142, 142))

        # Theme retrieval
        self.assertIsInstance(get_theme("cyberpunk"), CyberpunkTheme)
        self.assertIsInstance(get_theme("matrix"), MatrixGreenTheme)

        # Random theme retrieval with seed
        rand_theme = get_theme("random", seed=42)
        self.assertIsNotNone(rand_theme)

        # Invalid theme name
        with self.assertRaises(ValueError):
            get_theme("non_existent_theme_name")


if __name__ == "__main__":
    unittest.main()
