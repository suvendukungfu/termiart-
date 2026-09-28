"""TermiArt CLI Package."""

from cli.arguments import create_parser, parse_arguments
from cli.interactive import run_interactive_menu

__all__ = [
    "create_parser",
    "parse_arguments",
    "run_interactive_menu",
]
