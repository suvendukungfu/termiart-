"""Unit tests for all terminal art renderers."""

import unittest
from PIL import Image
from core.config import RenderConfig
from core.image_processor import ProcessedImage
from colors.themes import OriginalTheme, MatrixGreenTheme, CyberpunkTheme
from renderers import (
    RENDERERS,
    get_renderer,
    AsciiRenderer,
    DenseAsciiRenderer,
    UnicodeRenderer,
    HalfBlockRenderer,
    BrailleRenderer,
    MatrixRenderer,
    RgbAnsiRenderer,
    CyberpunkRenderer,
    RandomRenderer,
)


class TestRenderers(unittest.TestCase):
    """Test suite for renderer output generation and consistency."""

    def setUp(self) -> None:
        # Create a small 8x8 gradient image
        self.img = Image.new("RGB", (8, 8))
        for y in range(8):
            for x in range(8):
                val = int((x + y) * 255 / 14)
                self.img.putpixel((x, y), (val, 128, 255 - val))

        self.processed = ProcessedImage(
            rgb=self.img,
            luminance=self.img.convert("L"),
            width=8,
            height=8,
            original_size=(8, 8),
        )

        self.theme = OriginalTheme()

    def test_all_renderers_output(self) -> None:
        config = RenderConfig(color=True)

        for name, renderer in RENDERERS.items():
            result = renderer.render(self.processed, config, self.theme)
            self.assertIsInstance(result, str)
            self.assertTrue(len(result) > 0, f"Renderer {name} produced empty output")

    def test_monochrome_output(self) -> None:
        config_no_color = RenderConfig(color=False)

        for name, renderer in RENDERERS.items():
            result = renderer.render(self.processed, config_no_color, self.theme)
            self.assertIsInstance(result, str)
            self.assertTrue(len(result) > 0)
            # In no-color mode, should not contain ANSI true-color codes
            self.assertNotIn("\033[38;2;", result)

    def test_halfblock_aspect_ratio_and_output(self) -> None:
        hb = HalfBlockRenderer()
        self.assertEqual(hb.char_aspect_ratio, 1.0)
        res = hb.render(self.processed, RenderConfig(color=True), self.theme)
        # Should contain upper half block '▀'
        self.assertIn("▀", res)
        # 8 height with 2 pixels per row should yield 4 lines
        lines = res.split("\n")
        self.assertEqual(len(lines), 4)

    def test_braille_output(self) -> None:
        br = BrailleRenderer()
        self.assertEqual(br.char_aspect_ratio, 1.0)
        res = br.render(self.processed, RenderConfig(color=True), self.theme)
        # Braille unicode range is 0x2800 to 0x28FF
        has_braille = any(0x2800 <= ord(c) <= 0x28FF for c in res)
        self.assertTrue(has_braille, "Braille renderer did not output Braille characters")

    def test_random_renderer_reproducibility(self) -> None:
        profile1, status1 = RandomRenderer.generate_randomized_profile(RenderConfig(), seed=42)
        profile2, status2 = RandomRenderer.generate_randomized_profile(RenderConfig(), seed=42)
        self.assertEqual(profile1, profile2)
        self.assertEqual(status1, status2)

    def test_get_renderer_lookup(self) -> None:
        self.assertIsInstance(get_renderer("ascii"), AsciiRenderer)
        self.assertIsInstance(get_renderer("halfblock"), HalfBlockRenderer)
        self.assertIsInstance(get_renderer("half-block"), HalfBlockRenderer)  # Alias
        self.assertIsInstance(get_renderer("matrix"), MatrixRenderer)

        with self.assertRaises(ValueError):
            get_renderer("invalid_renderer_name")


if __name__ == "__main__":
    unittest.main()
