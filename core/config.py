"""Configuration models and preset definitions for TermiArt."""

from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional, Dict, Any


@dataclass
class Preset:
    """Preset configuration grouping multiple render settings."""
    name: str
    description: str
    style: str
    theme: str
    contrast: float = 1.0
    brightness: float = 1.0
    sharpness: float = 1.0
    gamma: float = 1.0
    density: float = 1.0
    edge_enhance: bool = False
    invert: bool = False


PRESETS: Dict[str, Preset] = {
    "matrix": Preset(
        name="matrix",
        description="Classic digital rain aesthetic with high contrast phosphor green",
        style="matrix",
        theme="matrix",
        contrast=1.35,
        brightness=1.05,
        edge_enhance=True,
    ),
    "cyberpunk": Preset(
        name="cyberpunk",
        description="High-saturation neon cyan, magenta, and electric blue half-blocks",
        style="cyberpunk",
        theme="cyberpunk",
        contrast=1.4,
        brightness=1.1,
        sharpness=1.4,
    ),
    "anime": Preset(
        name="anime",
        description="Crisp edge-enhanced true-color anime aesthetic with boosted saturation",
        style="halfblock",
        theme="anime",
        contrast=1.25,
        brightness=1.12,
        sharpness=1.35,
        edge_enhance=True,
    ),
    "fire": Preset(
        name="fire",
        description="Incandescent glow of deep reds, blazing oranges, and white heat",
        style="dense_ascii",
        theme="fire",
        contrast=1.45,
        brightness=1.1,
    ),
    "ocean": Preset(
        name="ocean",
        description="Deep aquatic blues, bioluminescent cyan, and seafoam gradients",
        style="unicode",
        theme="ocean",
        contrast=1.3,
        brightness=1.05,
    ),
    "purple_neon": Preset(
        name="purple_neon",
        description="Synthwave ultraviolet, deep purple, and neon accents",
        style="halfblock",
        theme="purple_neon",
        contrast=1.35,
        brightness=1.08,
    ),
    "monochrome": Preset(
        name="monochrome",
        description="Clean, sophisticated black-and-white tonal rendition",
        style="ascii",
        theme="monochrome",
        contrast=1.25,
        brightness=1.0,
    ),
}


@dataclass
class RenderConfig:
    """Configuration options for image processing and rendering."""
    # Source & Output
    image_path: Optional[Path] = None
    output_path: Optional[Path] = None

    # Dimensions
    width: Optional[int] = None
    height: Optional[int] = None
    char_aspect_ratio: float = 0.5  # Standard terminal char width/height ratio (~0.45-0.55)

    # Renderer & Color
    style: str = "halfblock"
    theme: str = "original"
    color: bool = True

    # Image adjustments
    contrast: float = 1.0
    brightness: float = 1.0
    sharpness: float = 1.0
    gamma: float = 1.0
    density: float = 1.0
    edge_enhance: bool = False
    invert: bool = False
    autocontrast: bool = True

    # Random mode
    random_mode: bool = False
    seed: Optional[int] = None

    # Animation
    animate: bool = False
    animation_type: str = "matrix"  # matrix, cycle, pulse, glitch, scanline
    fps: float = 15.0
    animation_duration: Optional[float] = None  # None = loop until Ctrl+C

    # Preset
    preset: Optional[str] = None

    # Debugging
    debug: bool = False

    # Web Studio UI
    web: bool = False
    port: int = 8080

    def apply_preset(self, preset_name: str) -> None:
        """Apply a named preset to this configuration."""
        name_clean = preset_name.lower().strip()
        if name_clean in PRESETS:
            p = PRESETS[name_clean]
            self.style = p.style
            self.theme = p.theme
            self.contrast = p.contrast
            self.brightness = p.brightness
            self.sharpness = p.sharpness
            self.gamma = p.gamma
            self.density = p.density
            self.edge_enhance = p.edge_enhance
            self.invert = p.invert
            self.preset = name_clean
        elif name_clean == "random":
            self.random_mode = True
            self.preset = "random"
        else:
            valid = ", ".join(list(PRESETS.keys()) + ["random"])
            raise ValueError(f"Unknown preset '{preset_name}'. Available presets: {valid}")
