#!/usr/bin/env python3
"""Run TermiArt Web Studio UI Server."""

import sys
import argparse
import webbrowser
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import uvicorn
from web.server import app


def run():
    parser = argparse.ArgumentParser(description="TermiArt Web Studio UI Server")
    parser.add_argument("--host", default="127.0.0.1", help="Host interface (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=8080, help="Port to listen on (default: 8080)")
    parser.add_argument("--no-open", action="store_true", help="Don't open browser automatically")
    parser.add_argument("--reload", action="store_true", help="Enable hot reload")
    args = parser.parse_args()

    url = f"http://{args.host}:{args.port}"
    print(f"\n=======================================================")
    print(f"  🎨 TermiArt Web Studio Engine v2.0")
    print(f"  ➜ Local:   {url}")
    print(f"  ➜ Engine:  24-bit TrueColor ANSI, Subpixels & Effects")
    print(f"=======================================================\n")

    if not args.no_open:
        try:
            webbrowser.open(url)
        except Exception:
            pass

    uvicorn.run("web.server:app", host=args.host, port=args.port, reload=args.reload)


if __name__ == "__main__":
    run()
