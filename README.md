# TermiArt 🎨💻

**High-Fidelity Image to Terminal Character Art Converter for macOS Terminal & Modern Terminals.**

TermiArt transforms any user-provided image (`JPG`, `JPEG`, `PNG`, `WEBP`) into visually stunning terminal character art rendered directly inside your terminal using ANSI 24-bit TrueColor, Half-block subpixels, dense ASCII, Unicode shades, Braille dot matrices, and animated cybernetic effects.

---

## 🌟 Features

- **Arbitrary Image Support**: Works with any image format (`PNG`, `JPG`, `JPEG`, `WEBP`, etc.) — no hardcoded datasets or filenames.
- **24-bit TrueColor ANSI Engine**: Photorealistic color rendition with 16.7 million colors using standard escape sequences (`\033[38;2;R;G;Bm`).
- **Aspect Ratio Compensation**: Automatically compensates for non-square terminal character geometry (2:1 height-to-width ratio) so faces and shapes are never stretched.
- **Automatic Terminal Sizing**: Dynamically detects window dimensions using `shutil.get_terminal_size()`.
- **9 Specialized Renderers**:
  1. **Half-Block (`halfblock`)**: Dual vertical pixels per character cell (`▀`) for double vertical resolution.
  2. **Classic ASCII (`ascii`)**: Timeless 10-level standard character density ramp.
  3. **Dense ASCII (`dense_ascii`)**: Ultra-detailed 70-level tonal ramp for smooth shading and subtle face contours.
  4. **Unicode Blocks (`unicode`)**: Geometric blocks and dithering shades (`░▒▓█`).
  5. **Braille Matrix (`braille`)**: 2×4 dot subgrid (`U+2800`–`U+28FF`) for crisp line art and extreme spatial fidelity.
  6. **Matrix Digital (`matrix`)**: Cybernetic digital rain glyphs with phosphor green highlights.
  7. **RGB Full-Block (`rgb`)**: 24-bit TrueColor full-block pixel art.
  8. **Cyberpunk (`cyberpunk`)**: Neon cyan, hot magenta, and electric edge glow.
  9. **Procedural Random (`random`)**: Generates fresh combinations of renderers, color palettes, and processing filters.
- **Rich Color Themes**:
  - `original`: Authentic 24-bit TrueColor RGB from the source image
  - `matrix`: Phosphor green CRT aesthetic
  - `rainbow`: Chromatic spectral gradient
  - `cyberpunk`: Neon cyan, hot pink, and ultraviolet
  - `fire`: Smoldering embers to incandescent white heat
  - `ocean`: Deep abyss blue to bioluminescent turquoise
  - `purple_neon`: Synthwave ultraviolet and neon magenta
  - `monochrome`: Neutral silver-to-white grayscale
  - `anime`: Saturated anime cel-shading palette
- **Procedural Random Art Mode**: Generates surprising, beautiful style combinations reproducible with `--seed`.
- **Terminal Animations**: CPU-efficient animations including Matrix rain, glitch artifacts, breathing pulse, and scanlines.
- **Export Capabilities**: Clean plain text (`.txt`) with ANSI stripped or full ANSI TrueColor files (`.ans`).
- **Interactive Menu**: Beginner-friendly interactive mode with drag-and-drop support.
- **Terminal Safety Guarantee**: Cursor hiding/restoration, automatic cleanup, and robust `Ctrl+C` handling.

---

## 📦 Installation

TermiArt requires **Python 3.11+** and **Pillow**.

```bash
# Clone or navigate to the project directory
cd "termi art"

# Install minimal dependencies
pip install -r requirements.txt
```

---

## 🚀 Usage

### 1. Direct CLI Rendering

Render any image using the default Half-Block TrueColor engine:

```bash
python3 termiart.py ~/Desktop/photo.png
```

Render in classic or dense ASCII:

```bash
python3 termiart.py ~/Pictures/landscape.jpg --style ascii
python3 termiart.py ~/Pictures/portrait.png --style dense_ascii
```

Render in Braille 2×4 dot matrix:

```bash
python3 termiart.py ~/Desktop/drawing.png --style braille
```

Render in Matrix digital style:

```bash
python3 termiart.py ~/Desktop/wallpaper.webp --style matrix
```

### 2. Color Themes

Switch color palettes effortlessly:

```bash
python3 termiart.py image.png --theme cyberpunk
python3 termiart.py image.png --theme fire
python3 termiart.py image.png --theme ocean
python3 termiart.py image.png --theme rainbow
python3 termiart.py image.png --no-color   # Monochrome
```

### 3. Aesthetic Presets

Apply curated settings with a single flag:

```bash
python3 termiart.py image.png --preset matrix
python3 termiart.py image.png --preset cyberpunk
python3 termiart.py image.png --preset anime
python3 termiart.py image.png --preset fire
python3 termiart.py image.png --preset ocean
```

### 4. Random Art Generator (`--random`)

Surprise yourself with procedural styling:

```bash
# Random mode
python3 termiart.py image.png --random

# Reproducible random mode with seed
python3 termiart.py image.png --random --seed 42
```

Outputs a concise status header before rendering:

```text
Renderer: Half Block | Theme: Cyberpunk | Contrast: 1.35 | Brightness: 1.10 | Density: 0.95 | Seed: 42
```

### 5. Terminal Animations (`--animate`)

Animate characters and effects live in the terminal:

```bash
# Matrix digital rain
python3 termiart.py image.png --style matrix --animate

# Cyberpunk glitch
python3 termiart.py image.png --style cyberpunk --animate --animation-type glitch

# Breathing brightness pulse
python3 termiart.py image.png --animate --animation-type pulse --fps 20
```

Press `Ctrl+C` at any time to return safely to the prompt.

### 6. Interactive Mode

Launch the interactive UI by running without arguments:

```bash
python3 termiart.py
```

Features an intuitive menu:

```text
========================================
              TERMIART
       IMAGE → TERMINAL ART
========================================

1. Render image
2. Random style
3. Choose renderer
4. Choose color theme
5. Animation
6. Settings
7. Exit
```

Supports drag-and-drop image paths (automatically cleans quotes and escape sequences).

### 7. Artwork Export

Export terminal art to file:

```bash
# Clean plain-text without ANSI codes
python3 termiart.py image.png --style ascii --output art.txt

# ANSI TrueColor art (display later with 'cat art.ans')
python3 termiart.py image.png --style halfblock --output art.ans
```

---

## ⚙️ CLI Reference

| Flag | Description | Default |
| --- | --- | --- |
| `image` | Path to image file (JPG, PNG, WEBP, etc.) | Interactive mode |
| `-s, --style` | Renderer style (`halfblock`, `ascii`, `dense_ascii`, `braille`, `matrix`, `unicode`, `rgb`, `cyberpunk`, `random`) | `halfblock` |
| `-t, --theme` | Color theme (`original`, `matrix`, `rainbow`, `cyberpunk`, `fire`, `ocean`, `purple_neon`, `monochrome`, `anime`, `random`) | `original` |
| `--no-color` | Disable ANSI TrueColor colors | Enabled |
| `-r, --random` | Enable procedural random art mode | Disabled |
| `--seed` | Random seed integer for reproducible styles | Random |
| `-p, --preset` | Quick preset (`matrix`, `cyberpunk`, `anime`, `fire`, `ocean`, `random`) | None |
| `-W, --width` | Custom width in terminal columns | Auto-detected |
| `-H, --height` | Custom height in terminal rows | Auto-detected |
| `--contrast` | Contrast multiplier (e.g. `1.3`) | `1.0` |
| `--brightness` | Brightness multiplier (e.g. `1.1`) | `1.0` |
| `--sharpness` | Sharpness multiplier (e.g. `1.4`) | `1.0` |
| `--gamma` | Gamma correction curve | `1.0` |
| `--density` | Character/dot threshold density | `1.0` |
| `-e, --edge` | Edge enhancement filter | Disabled |
| `-i, --invert` | Invert luminance / negative mode | Disabled |
| `-a, --animate` | Run terminal animation | Disabled |
| `--animation-type` | Animation type (`matrix`, `glitch`, `pulse`, `cycle`, `scanline`) | `matrix` |
| `--fps` | Animation frames per second | `15.0` |
| `-o, --output` | Export path (`.txt` or `.ans`) | None |
| `--debug` | Display detailed Python tracebacks | Disabled |

---

## 💻 macOS Terminal Instructions

1. **True-Color Support**: macOS Terminal natively supports 24-bit TrueColor ANSI escape sequences.
2. **Font Recommendation**: For optimal Braille and Unicode rendering, monospaced fonts such as `SF Mono`, `Menlo`, `JetBrains Mono`, or `Fira Code` are recommended.
3. **Full-screen & Split View**: TermiArt automatically detects fullscreen or split-terminal resize events on each run.
4. **Drag and Drop**: Simply drag an image from Finder and drop it into the Terminal prompt.

---

## 🛠️ Testing & Verification

Run the comprehensive unit test suite:

```bash
python3 -m unittest discover tests
```

Validate code syntax:

```bash
python3 -m compileall .
```

---

## 📁 Project Architecture

```text
termiart/
├── termiart.py              # Main CLI & interactive executable entrypoint
├── requirements.txt         # Project dependencies (Pillow)
├── README.md                # Comprehensive documentation
├── .gitignore               # Git ignore rules
│
├── core/
│   ├── __init__.py          # Core package exports
│   ├── config.py            # RenderConfig dataclass and Presets
│   ├── terminal.py          # Terminal dimension detection and safe guard context manager
│   ├── image_processor.py   # Aspect-ratio preserving Pillow preprocessing pipeline
│   └── pipeline.py          # Master art pipeline coordinator
│
├── renderers/
│   ├── __init__.py          # Renderer registry and resolver
│   ├── base.py              # BaseRenderer abstract class
│   ├── ascii_renderer.py    # Classic 10-level ASCII renderer
│   ├── dense_ascii.py       # 70-level smooth tonal gradation ASCII renderer
│   ├── unicode_renderer.py  # Unicode block & dithering shade renderer
│   ├── halfblock.py         # Flagship 24-bit TrueColor dual-vertical pixel renderer
│   ├── braille.py           # 2x4 dot-matrix high-resolution Braille renderer
│   ├── matrix.py            # Matrix digital rain & phosphor glyph renderer
│   ├── rgb_ansi.py          # Full-block TrueColor renderer
│   ├── cyberpunk_renderer.py# High-contrast neon cyberpunk renderer
│   └── random_renderer.py   # Procedural style randomizer
│
├── colors/
│   ├── __init__.py          # Color system exports
│   ├── rgb.py               # ANSI TrueColor formatting and RGBColor helpers
│   ├── gradients.py         # Multi-stop linear & HSV rainbow gradients
│   └── themes.py            # ColorTheme abstract base and concrete palettes
│
├── effects/
│   ├── __init__.py          # AnimationEngine orchestration
│   ├── matrix_rain.py       # Matrix digital rain streamer effect
│   ├── glitch.py            # Cyberware horizontal slice jitter effect
│   └── scanline.py          # CRT monitor phosphor scanline simulation
│
├── cli/
│   ├── __init__.py          # CLI module exports
│   ├── arguments.py         # Argparse CLI parser & argument definitions
│   └── interactive.py       # User-friendly interactive terminal UI
│
└── tests/
    ├── __init__.py          # Test suite package
    ├── test_image_processor.py
    ├── test_colors.py
    ├── test_renderers.py
    └── test_cli.py
```

---

## 📄 License

MIT License. TermiArt is built for creators, terminal enthusiasts, and developers.
