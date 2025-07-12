"""
Keyboard Bridge Library

A Python library for creating virtual USB HID keyboard devices and handling
keyboard events via WebSocket for RDP integration.
"""

__version__ = "1.0.0"
__author__ = "Keyboard Bridge Team"
__email__ = "team@keyboardbridge.dev"

from .daemon import KeyboardBridgeDaemon
from .virtual_keyboard import VirtualKeyboardDevice
from .event_processor import KeyboardEventProcessor

__all__ = [
    "KeyboardBridgeDaemon",
    "VirtualKeyboardDevice", 
    "KeyboardEventProcessor",
] 