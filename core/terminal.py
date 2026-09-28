"""Terminal environment detection, formatting, and safety controls."""

import re
import shutil
import sys
from contextlib import contextmanager
from typing import Tuple, Generator

# ANSI escape sequence patterns
ANSI_ESCAPE_RE = re.compile(r"\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])")


def strip_ansi(text: str) -> str:
    """Remove ANSI escape sequences from text for clean plain-text output."""
    return ANSI_ESCAPE_RE.sub("", text)


class Terminal:
    """Helper utilities for interacting with macOS/POSIX terminals."""

    CURSOR_HIDE = "\033[?25l"
    CURSOR_SHOW = "\033[?25h"
    CLEAR_SCREEN = "\033[2J\033[H"
    RESET_CURSOR = "\033[H"
    RESET_ALL = "\033[0m"

    @classmethod
    def get_size(cls, fallback: Tuple[int, int] = (80, 24)) -> Tuple[int, int]:
        """Get the current terminal dimensions (columns, rows)."""
        try:
            size = shutil.get_terminal_size(fallback=fallback)
            # Ensure safe bounds
            columns = max(size.columns, 20)
            rows = max(size.lines, 10)
            return columns, rows
        except Exception:
            return fallback

    @classmethod
    def hide_cursor(cls) -> None:
        """Hide the terminal text cursor."""
        if sys.stdout.isatty():
            sys.stdout.write(cls.CURSOR_HIDE)
            sys.stdout.flush()

    @classmethod
    def show_cursor(cls) -> None:
        """Restore the terminal text cursor."""
        if sys.stdout.isatty():
            sys.stdout.write(cls.CURSOR_SHOW)
            sys.stdout.flush()

    @classmethod
    def clear(cls) -> None:
        """Clear the terminal screen and position cursor at top-left."""
        if sys.stdout.isatty():
            sys.stdout.write(cls.CLEAR_SCREEN)
            sys.stdout.flush()

    @classmethod
    def reset(cls) -> None:
        """Reset terminal styles and colors."""
        sys.stdout.write(cls.RESET_ALL)
        sys.stdout.flush()


@contextmanager
def TerminalGuard(hide_cursor: bool = True, clear_on_start: bool = False) -> Generator[None, None, None]:
    """Context manager to guarantee terminal state restoration upon exit or interruption."""
    try:
        if clear_on_start:
            Terminal.clear()
        if hide_cursor:
            Terminal.hide_cursor()
        yield
    finally:
        Terminal.reset()
        if hide_cursor:
            Terminal.show_cursor()
