"""Interactive terminal UI menu for TermiArt."""

import sys
from pathlib import Path
from typing import Optional
from core.config import RenderConfig
from core.pipeline import ArtPipeline
from core.image_processor import clean_image_path
from renderers import RENDERERS
from colors.themes import THEMES


BANNER = """
========================================
              TERMIART
       IMAGE → TERMINAL ART
========================================
"""


def prompt_image_path(current: Optional[Path] = None) -> Optional[Path]:
    """Prompt user for image path, accepting drag-and-drop or manual input."""
    prompt = f"Enter image path (or drag & drop file into terminal){f' [{current}]' if current else ''}: "
    try:
        raw = input(prompt).strip()
    except (KeyboardInterrupt, EOFError):
        print()
        return current

    if not raw and current:
        return current
    if not raw:
        print("No path provided.")
        return None

    path = clean_image_path(raw)
    if not path.exists():
        print(f"\nERROR: Could not find image:\n{path}\n")
        return None
    return path


def menu_choose_renderer(config: RenderConfig) -> None:
    """Sub-menu to choose renderer."""
    print("\nAvailable Renderers:")
    print("--------------------")
    keys = list(RENDERERS.keys())
    for idx, key in enumerate(keys, start=1):
        desc = RENDERERS[key].description
        marker = " (Active)" if config.style == key else ""
        print(f"  {idx}. {key.replace('_', ' ').title():<15} - {desc}{marker}")

    try:
        choice = input("\nSelect renderer number (or Enter to keep current): ").strip()
        if choice.isdigit():
            val = int(choice)
            if 1 <= val <= len(keys):
                config.style = keys[val - 1]
                print(f"Selected style: {config.style}")
    except (KeyboardInterrupt, EOFError):
        print()


def menu_choose_theme(config: RenderConfig) -> None:
    """Sub-menu to choose color theme."""
    print("\nAvailable Color Themes:")
    print("-----------------------")
    keys = list(THEMES.keys()) + ["random"]
    for idx, key in enumerate(keys, start=1):
        desc = THEMES[key].description if key in THEMES else "Procedural random theme"
        marker = " (Active)" if config.theme == key else ""
        print(f"  {idx}. {key.replace('_', ' ').title():<15} - {desc}{marker}")

    try:
        choice = input("\nSelect theme number (or Enter to keep current): ").strip()
        if choice.isdigit():
            val = int(choice)
            if 1 <= val <= len(keys):
                config.theme = keys[val - 1]
                print(f"Selected theme: {config.theme}")
    except (KeyboardInterrupt, EOFError):
        print()


def menu_animation(config: RenderConfig) -> None:
    """Sub-menu to configure and launch animation."""
    if not config.image_path:
        path = prompt_image_path(config.image_path)
        if not path:
            return
        config.image_path = path

    print("\nAnimation Modes:")
    print("----------------")
    print("  1. Matrix Digital Rain (Iconic falling green code)")
    print("  2. Cyberpunk Glitch (Subtle digital slice glitch)")
    print("  3. Brightness Pulse (Breathing sinusoidal glow)")
    print("  4. Color Spectrum Cycle (Dynamic rainbow hue shift)")
    print("  5. Return to Main Menu")

    try:
        choice = input("\nSelect animation (1-5): ").strip()
        anim_map = {"1": "matrix", "2": "glitch", "3": "pulse", "4": "cycle"}
        if choice in anim_map:
            config.animate = True
            config.animation_type = anim_map[choice]
            print("\nStarting animation. Press Ctrl+C at any time to return to menu.\n")
            try:
                ArtPipeline.execute(config)
            except KeyboardInterrupt:
                pass
            finally:
                config.animate = False
    except (KeyboardInterrupt, EOFError):
        print()


def menu_settings(config: RenderConfig) -> None:
    """Sub-menu to view and adjust image processing settings."""
    while True:
        print("\nCurrent Settings:")
        print("-----------------")
        print(f"  1. Width:           {config.width or 'Auto-detect'}")
        print(f"  2. Height:          {config.height or 'Auto-detect'}")
        print(f"  3. Contrast:        {config.contrast:.2f}")
        print(f"  4. Brightness:      {config.brightness:.2f}")
        print(f"  5. Sharpness:       {config.sharpness:.2f}")
        print(f"  6. Edge Enhance:    {'Enabled' if config.edge_enhance else 'Disabled'}")
        print(f"  7. Invert Luminance: {'Enabled' if config.invert else 'Disabled'}")
        print(f"  8. Reset to Defaults")
        print(f"  9. Return to Main Menu")

        try:
            choice = input("\nOption to change (1-9): ").strip()
            if choice == "1":
                val = input("Enter target width (or blank for auto): ").strip()
                config.width = int(val) if val.isdigit() else None
            elif choice == "2":
                val = input("Enter target height (or blank for auto): ").strip()
                config.height = int(val) if val.isdigit() else None
            elif choice == "3":
                val = input("Enter contrast multiplier (e.g. 1.3): ").strip()
                config.contrast = float(val) if val else 1.0
            elif choice == "4":
                val = input("Enter brightness multiplier (e.g. 1.1): ").strip()
                config.brightness = float(val) if val else 1.0
            elif choice == "5":
                val = input("Enter sharpness multiplier (e.g. 1.4): ").strip()
                config.sharpness = float(val) if val else 1.0
            elif choice == "6":
                config.edge_enhance = not config.edge_enhance
            elif choice == "7":
                config.invert = not config.invert
            elif choice == "8":
                config.contrast = 1.0
                config.brightness = 1.0
                config.sharpness = 1.0
                config.edge_enhance = False
                config.invert = False
                config.width = None
                config.height = None
                print("Settings reset to defaults.")
            elif choice == "9" or not choice:
                break
        except (KeyboardInterrupt, EOFError):
            print()
            break
        except ValueError:
            print("Invalid input format.")


def run_interactive_menu(initial_config: RenderConfig) -> None:
    """Main interactive menu loop."""
    config = initial_config

    while True:
        print(BANNER)
        if config.image_path:
            print(f"Current Image: {config.image_path.name}")
        else:
            print("Current Image: (None selected)")
        print(f"Style: {config.style.replace('_', ' ').title()} | Theme: {config.theme.title()}\n")

        print("1. Render image")
        print("2. Random style")
        print("3. Choose renderer")
        print("4. Choose color theme")
        print("5. Animation")
        print("6. Settings")
        print("7. Exit\n")

        try:
            choice = input("Choice: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nGoodbye!")
            break

        if choice == "1":
            if not config.image_path:
                path = prompt_image_path(config.image_path)
                if not path:
                    continue
                config.image_path = path

            try:
                config.random_mode = False
                ArtPipeline.execute(config)
            except Exception as e:
                print(f"\nERROR: Failed to render image: {e}\n")

        elif choice == "2":
            if not config.image_path:
                path = prompt_image_path(config.image_path)
                if not path:
                    continue
                config.image_path = path

            try:
                config.random_mode = True
                ArtPipeline.execute(config)
            except Exception as e:
                print(f"\nERROR: Failed to render randomized style: {e}\n")

        elif choice == "3":
            menu_choose_renderer(config)

        elif choice == "4":
            menu_choose_theme(config)

        elif choice == "5":
            menu_animation(config)

        elif choice == "6":
            menu_settings(config)

        elif choice == "7" or choice.lower() in ("exit", "quit", "q"):
            print("\nGoodbye!")
            break
        else:
            print("Invalid choice, please select 1-7.")
