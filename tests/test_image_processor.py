"""Unit tests for ImageProcessor."""

import unittest
from pathlib import Path
from PIL import Image
from core.config import RenderConfig
from core.image_processor import ImageProcessor, clean_image_path, ProcessedImage


class TestImageProcessor(unittest.TestCase):
    """Test suite for image preprocessing pipeline."""

    def setUp(self) -> None:
        # Create a small test image in memory
        self.img = Image.new("RGBA", (100, 50), (255, 0, 0, 255))
        # Draw a small pattern
        for x in range(50):
            for y in range(25):
                self.img.putpixel((x, y), (0, 255, 0, 128))

    def test_clean_image_path(self) -> None:
        self.assertEqual(clean_image_path('"test.png"'), Path("test.png").resolve())
        self.assertEqual(clean_image_path("'test.png'"), Path("test.png").resolve())
        self.assertEqual(clean_image_path("file:///tmp/test.png"), Path("/tmp/test.png").resolve())
        self.assertEqual(clean_image_path("my\\ image.png"), Path("my image.png").resolve())

    def test_target_dimensions_aspect_ratio(self) -> None:
        # Square image (100x100), max terminal (80, 40)
        # With char_aspect_ratio = 0.5 (ASCII character is twice as tall as wide)
        # effective_aspect = (100 / 100) / 0.5 = 2.0
        # For width 80, height should be 80 / 2.0 = 40
        w, h = ImageProcessor.calculate_target_dimensions(100, 100, 80, 40, char_aspect_ratio=0.5)
        self.assertEqual(w, 80)
        self.assertEqual(h, 40)

        # With char_aspect_ratio = 1.0 (Half-block pixels are 1:1 square)
        # effective_aspect = 1.0
        # For max (80, 80), dimensions should be 80x80
        w2, h2 = ImageProcessor.calculate_target_dimensions(100, 100, 80, 80, char_aspect_ratio=1.0)
        self.assertEqual(w2, 80)
        self.assertEqual(h2, 80)

    def test_process_pipeline(self) -> None:
        config = RenderConfig(
            contrast=1.2,
            brightness=1.1,
            sharpness=1.1,
            gamma=1.1,
            edge_enhance=True,
            invert=False,
            autocontrast=True,
        )
        processed = ImageProcessor.process(self.img, target_width=40, target_height=20, config=config)
        self.assertIsInstance(processed, ProcessedImage)
        self.assertEqual(processed.width, 40)
        self.assertEqual(processed.height, 20)
        self.assertEqual(processed.original_size, (100, 50))

        # Check pixel color reading
        rgb = processed.get_pixel_rgb(0, 0)
        self.assertIsInstance(rgb, tuple)
        self.assertEqual(len(rgb), 3)

        # Check luminance reading
        lum = processed.get_luminance(0, 0)
        self.assertTrue(0 <= lum <= 255)


if __name__ == "__main__":
    unittest.main()
