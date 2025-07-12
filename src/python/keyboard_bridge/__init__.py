"""
Keyboard Bridge Library

A Python library for creating virtual USB HID keyboard devices and handling
keyboard events via WebSocket for RDP integration.
"""

__version__ = "1.0.0"
__author__ = "Noam Bergauz"
__email__ = "bergauznoam@gmail.com"

from .daemon import KeyboardBridgeDaemon
from .event_processor import KeyboardEventProcessor
from .virtual_keyboard import VirtualKeyboardDevice

__all__ = [
    "KeyboardBridgeDaemon",
    "VirtualKeyboardDevice",
    "KeyboardEventProcessor",
]
