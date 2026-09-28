"""Unit tests for the CLI parser and options."""

import unittest
from pathlib import Path
from cli.arguments import create_parser, parse_arguments
from core.config import PRESETS


class TestCLI(unittest.TestCase):
    """Test suite for CLI arguments and preset resolution."""

    def test_parser_creation(self) -> None:
        parser = create_parser()
        self.assertIsNotNone(parser)

    def test_positional_image_argument(self) -> None:
        cfg, interactive = parse_arguments(["my_image.png"])
        self.assertEqual(cfg.image_path, Path("my_image.png"))
        self.assertFalse(interactive)

    def test_interactive_default_when_no_args(self) -> None:
        cfg, interactive = parse_arguments([])
        self.assertIsNone(cfg.image_path)
        self.assertTrue(interactive)

    def test_style_and_theme_flags(self) -> None:
        cfg, _ = parse_arguments(["pic.jpg", "--style", "matrix", "--theme", "cyberpunk"])
        self.assertEqual(cfg.style, "matrix")
        self.assertEqual(cfg.theme, "cyberpunk")

    def test_random_mode_flag(self) -> None:
        cfg, _ = parse_arguments(["pic.jpg", "--random", "--seed", "12345"])
        self.assertTrue(cfg.random_mode)
        self.assertEqual(cfg.seed, 12345)

    def test_presets(self) -> None:
        cfg, _ = parse_arguments(["pic.jpg", "--preset", "cyberpunk"])
        self.assertEqual(cfg.preset, "cyberpunk")
        cfg.apply_preset("cyberpunk")
        self.assertEqual(cfg.style, "cyberpunk")
        self.assertEqual(cfg.theme, "cyberpunk")
        self.assertEqual(cfg.contrast, PRESETS["cyberpunk"].contrast)

    def test_image_adjustment_flags(self) -> None:
        cfg, _ = parse_arguments([
            "pic.jpg",
            "--width", "120",
            "--height", "60",
            "--contrast", "1.4",
            "--brightness", "1.1",
            "--edge",
            "--invert",
        ])
        self.assertEqual(cfg.width, 120)
        self.assertEqual(cfg.height, 60)
        self.assertEqual(cfg.contrast, 1.4)
        self.assertEqual(cfg.brightness, 1.1)
        self.assertTrue(cfg.edge_enhance)
        self.assertTrue(cfg.invert)


if __name__ == "__main__":
    unittest.main()
