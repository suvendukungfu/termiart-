"""TermiArt renderers package."""

from typing import Dict, Optional
from renderers.base import BaseRenderer
from renderers.ascii_renderer import AsciiRenderer
from renderers.dense_ascii import DenseAsciiRenderer
from renderers.unicode_renderer import UnicodeRenderer
from renderers.halfblock import HalfBlockRenderer
from renderers.braille import BrailleRenderer
from renderers.matrix import MatrixRenderer
from renderers.rgb_ansi import RgbAnsiRenderer
from renderers.cyberpunk_renderer import CyberpunkRenderer
from renderers.random_renderer import RandomRenderer

RENDERERS: Dict[str, BaseRenderer] = {
    "ascii": AsciiRenderer(),
    "dense_ascii": DenseAsciiRenderer(),
    "unicode": UnicodeRenderer(),
    "halfblock": HalfBlockRenderer(),
    "braille": BrailleRenderer(),
    "matrix": MatrixRenderer(),
    "rgb": RgbAnsiRenderer(),
    "cyberpunk": CyberpunkRenderer(),
    "random": RandomRenderer(),
}

# Synonyms and aliases
ALIASES: Dict[str, str] = {
    "half-block": "halfblock",
    "half_block": "halfblock",
    "dense": "dense_ascii",
    "rgb_ansi": "rgb",
    "ansi": "rgb",
}


def get_renderer(name: str) -> BaseRenderer:
    """Retrieve renderer instance by name or alias."""
    clean = name.lower().strip()
    clean = ALIASES.get(clean, clean)
    if clean in RENDERERS:
        return RENDERERS[clean]
    valid = ", ".join(RENDERERS.keys())
    raise ValueError(f"Unknown renderer '{name}'. Available renderers: {valid}")


__all__ = [
    "BaseRenderer",
    "AsciiRenderer",
    "DenseAsciiRenderer",
    "UnicodeRenderer",
    "HalfBlockRenderer",
    "BrailleRenderer",
    "MatrixRenderer",
    "RgbAnsiRenderer",
    "CyberpunkRenderer",
    "RandomRenderer",
    "RENDERERS",
    "get_renderer",
]
