"""TermiArt main CLI execution module."""

import sys
import traceback
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from core.pipeline import ArtPipeline
from cli.arguments import parse_arguments
from cli.interactive import run_interactive_menu
from core.terminal import Terminal


def main() -> int:
    """Main CLI entrypoint for TermiArt."""
    try:
        config, is_interactive = parse_arguments()
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1

    # Web Studio UI branch
    if config.web:
        import uvicorn
        import webbrowser
        host = "127.0.0.1"
        port = config.port or 8080
        url = f"http://{host}:{port}"
        print(f"\n=======================================================")
        print(f"  🎨 TermiArt Web Studio Engine v2.0")
        print(f"  ➜ Local:   {url}")
        print(f"  ➜ Engine:  24-bit TrueColor ANSI, Subpixels & Effects")
        print(f"=======================================================\n")
        try:
            webbrowser.open(url)
        except Exception:
            pass
        uvicorn.run("web.server:app", host=host, port=port)
        return 0

    if is_interactive:
        try:
            run_interactive_menu(config)
            return 0
        except KeyboardInterrupt:
            print("\nExiting TermiArt.")
            return 130

    try:
        ArtPipeline.execute(config)
        return 0
    except FileNotFoundError as e:
        print(f"\nERROR: Could not find image:\n{e.filename if hasattr(e, 'filename') and e.filename else config.image_path}\n", file=sys.stderr)
        if config.debug:
            traceback.print_exc()
        return 1
    except (ValueError, IsADirectoryError) as e:
        print(f"\nERROR: {e}\n", file=sys.stderr)
        if config.debug:
            traceback.print_exc()
        return 1
    except KeyboardInterrupt:
        print("\nOperation cancelled.", file=sys.stderr)
        return 130
    except Exception as e:
        if config.debug:
            traceback.print_exc()
        else:
            print(f"\nERROR: An unexpected error occurred: {e}\n(Use --debug to see detailed traceback)\n", file=sys.stderr)
        return 1
