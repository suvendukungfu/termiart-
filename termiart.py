#!/usr/bin/env python3
"""TermiArt - Visual Terminal Character Art Engine for macOS Terminal.

Converts JPG, JPEG, PNG, and WEBP images into terminal artwork using
Half-block TrueColor, ASCII, Unicode, Braille, Matrix rain, and procedural styles.
"""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from cli.main import main

if __name__ == "__main__":
    sys.exit(main())
