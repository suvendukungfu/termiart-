"""Image preprocessing pipeline using Pillow."""

import math
from dataclasses import dataclass
from pathlib import Path
from typing import Tuple, Optional, Union
from PIL import Image, ImageEnhance, ImageOps, ImageFilter

from core.config import RenderConfig


SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif", ".tiff"}


def clean_image_path(raw_path: Union[str, Path]) -> Path:
    """Clean and resolve image path from CLI, drag-and-drop, or interactive input."""
    if isinstance(raw_path, Path):
        path_str = str(raw_path)
    else:
        path_str = str(raw_path).strip()

    # Handle drag-and-drop enclosing quotes
    if (path_str.startswith('"') and path_str.endswith('"')) or (
        path_str.startswith("'") and path_str.endswith("'")
    ):
        path_str = path_str[1:-1].strip()

    # Handle file:// URI scheme
    if path_str.startswith("file://"):
        path_str = path_str[7:]

    # Handle escaped spaces on macOS/bash (e.g. 'My\ Image.png')
    path_str = path_str.replace(r"\ ", " ")

    # Expand ~ user home directory and resolve
    path = Path(path_str).expanduser().resolve()
    return path


@dataclass
class ProcessedImage:
    """Container holding the processed RGB and luminance images ready for rendering."""
    rgb: Image.Image
    luminance: Image.Image
    width: int
    height: int
    original_size: Tuple[int, int]

    def get_pixel_rgb(self, x: int, y: int) -> Tuple[int, int, int]:
        """Safely fetch RGB tuple at coordinate (x, y)."""
        if 0 <= x < self.width and 0 <= y < self.height:
            return self.rgb.getpixel((x, y))  # type: ignore
        return (0, 0, 0)

    def get_luminance(self, x: int, y: int) -> int:
        """Safely fetch grayscale luminance [0-255] at coordinate (x, y)."""
        if 0 <= x < self.width and 0 <= y < self.height:
            return self.luminance.getpixel((x, y))  # type: ignore
        return 0


class ImageProcessor:
    """Non-destructive image preprocessing pipeline for terminal character rendering."""

    @classmethod
    def load_image(cls, path_or_image: Union[str, Path, Image.Image]) -> Image.Image:
        """Load an image from path or return existing PIL Image with format validation."""
        if isinstance(path_or_image, Image.Image):
            return path_or_image

        path = clean_image_path(path_or_image)
        if not path.exists():
            raise FileNotFoundError(f"Could not find image: {path}")

        if path.is_dir():
            raise IsADirectoryError(f"Specified path is a directory, not an image file: {path}")

        ext = path.suffix.lower()
        if ext and ext not in SUPPORTED_EXTENSIONS:
            # We still attempt to open with PIL, but warn if totally unknown
            pass

        try:
            img = Image.open(path)
            img.load()  # Force load image data
            return img
        except Exception as e:
            raise ValueError(f"Unsupported or corrupted image format: {path} ({e})") from e

    @classmethod
    def prepare_base_rgb(cls, image: Image.Image, background_color: Tuple[int, int, int] = (0, 0, 0)) -> Image.Image:
        """Convert image to RGB mode, cleanly compositing transparent RGBA/LA channels."""
        if image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info):
            image = image.convert("RGBA")
            bg = Image.new("RGBA", image.size, (*background_color, 255))
            blended = Image.alpha_composite(bg, image)
            return blended.convert("RGB")
        elif image.mode != "RGB":
            return image.convert("RGB")
        return image.copy()

    @classmethod
    def calculate_target_dimensions(
        cls,
        orig_width: int,
        orig_height: int,
        max_width: int,
        max_height: int,
        char_aspect_ratio: float = 0.5,
    ) -> Tuple[int, int]:
        """Calculate target width and height fitting max bounds while preserving aspect ratio.
        
        Args:
            orig_width: Original image pixel width
            orig_height: Original image pixel height
            max_width: Maximum allowed terminal columns
            max_height: Maximum allowed terminal rows
            char_aspect_ratio: Ratio of character width to character height (e.g. ~0.5 for ASCII, 1.0 for half-block)
        """
        if orig_width <= 0 or orig_height <= 0:
            return max(1, max_width), max(1, max_height)

        # Image aspect ratio corrected for non-square terminal characters
        # char_aspect_ratio = char_width / char_height
        # effective_ratio = (orig_width / orig_height) / char_aspect_ratio
        effective_aspect = (orig_width / orig_height) / char_aspect_ratio

        # Determine dimensions fitting within (max_width, max_height)
        target_w = max_width
        target_h = int(round(target_w / effective_aspect))

        if target_h > max_height:
            target_h = max_height
            target_w = int(round(target_h * effective_aspect))

        target_w = max(1, min(target_w, max_width))
        target_h = max(1, min(target_h, max_height))

        return target_w, target_h

    @classmethod
    def apply_gamma(cls, image: Image.Image, gamma: float) -> Image.Image:
        """Apply gamma correction curve using lookup table."""
        if abs(gamma - 1.0) < 0.001 or gamma <= 0:
            return image

        inv_gamma = 1.0 / gamma
        lut = [min(255, max(0, int(round(255 * math.pow(i / 255.0, inv_gamma))))) for i in range(256)]

        if image.mode == "RGB":
            return image.point(lut * 3)
        return image.point(lut)

    @classmethod
    def process(
        cls,
        image_input: Union[str, Path, Image.Image],
        target_width: int,
        target_height: int,
        config: RenderConfig,
    ) -> ProcessedImage:
        """Full image preprocessing pipeline returning ProcessedImage."""
        base_img = cls.load_image(image_input)
        orig_size = base_img.size

        # 1. Base RGB conversion with transparency composite
        rgb = cls.prepare_base_rgb(base_img)

        # 2. Resizing with high-quality Lanczos resampling
        target_w = max(1, target_width)
        target_h = max(1, target_height)
        resized = rgb.resize((target_w, target_h), Image.Resampling.LANCZOS)

        # 3. Autocontrast
        if config.autocontrast:
            try:
                resized = ImageOps.autocontrast(resized, cutoff=1)
            except Exception:
                pass

        # 4. Brightness adjustment
        if abs(config.brightness - 1.0) > 0.01 and config.brightness > 0:
            enhancer = ImageEnhance.Brightness(resized)
            resized = enhancer.enhance(config.brightness)

        # 5. Contrast adjustment
        if abs(config.contrast - 1.0) > 0.01 and config.contrast > 0:
            enhancer = ImageEnhance.Contrast(resized)
            resized = enhancer.enhance(config.contrast)

        # 6. Sharpness adjustment
        if abs(config.sharpness - 1.0) > 0.01 and config.sharpness > 0:
            enhancer = ImageEnhance.Sharpness(resized)
            resized = enhancer.enhance(config.sharpness)

        # 7. Gamma correction
        if abs(config.gamma - 1.0) > 0.01 and config.gamma > 0:
            resized = cls.apply_gamma(resized, config.gamma)

        # 8. Edge enhancement
        if config.edge_enhance:
            resized = resized.filter(ImageFilter.EDGE_ENHANCE_MORE)

        # 9. Invert colors if requested
        if config.invert:
            resized = ImageOps.invert(resized)

        # Generate corresponding luminance image for character mapping
        luminance = resized.convert("L")

        return ProcessedImage(
            rgb=resized,
            luminance=luminance,
            width=target_w,
            height=target_h,
            original_size=orig_size,
        )
