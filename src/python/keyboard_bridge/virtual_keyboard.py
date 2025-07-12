#!/usr/bin/env python3
"""
Virtual Keyboard Device

Creates and manages virtual USB HID keyboard devices that can be used
by xFreeRDP as input devices.
"""

import logging
from dataclasses import dataclass
from typing import Any, Dict, Optional

# Try to import uinput, fallback to mock if not available
try:
    import uinput  # type: ignore

    UINPUT_AVAILABLE = True
except ImportError:
    UINPUT_AVAILABLE = False
    logging.warning("uinput not available, using mock virtual keyboard")

logger = logging.getLogger(__name__)


@dataclass
class KeyboardEvent:
    """Represents a keyboard event with Unicode support."""

    key_code: int
    unicode_char: str
    modifiers: Dict[str, bool]
    event_type: str  # 'keydown', 'keyup', 'composition'
    timestamp: float


class VirtualKeyboardDevice:
    """Virtual USB HID keyboard device for xFreeRDP integration."""

    def __init__(self, device_id: int, keymap: Optional[Dict[str, str]] = None) -> None:
        self.device_id = device_id
        self.device: Optional[Any] = None
        self.is_connected = False
        self.composition_buffer = ""
        self.keymap = keymap or {}
        # Initialize the virtual keyboard device
        self._create_device()

    def set_keymap(self, keymap: Optional[Dict[str, str]]) -> None:
        self.keymap = keymap or {}
        logger.info(f"Keymap updated for device {self.device_id}")

    def _create_device(self) -> None:
        """Create a virtual USB HID keyboard device."""
        if not UINPUT_AVAILABLE:
            logger.warning("uinput not available, using mock virtual keyboard")
            self.device = None
            self.is_connected = True
            return

        try:
            # Define the virtual keyboard capabilities
            events = (
                uinput.KEY_A,
                uinput.KEY_B,
                uinput.KEY_C,
                uinput.KEY_D,
                uinput.KEY_E,
                uinput.KEY_F,
                uinput.KEY_G,
                uinput.KEY_H,
                uinput.KEY_I,
                uinput.KEY_J,
                uinput.KEY_K,
                uinput.KEY_L,
                uinput.KEY_M,
                uinput.KEY_N,
                uinput.KEY_O,
                uinput.KEY_P,
                uinput.KEY_Q,
                uinput.KEY_R,
                uinput.KEY_S,
                uinput.KEY_T,
                uinput.KEY_U,
                uinput.KEY_V,
                uinput.KEY_W,
                uinput.KEY_X,
                uinput.KEY_Y,
                uinput.KEY_Z,
                uinput.KEY_0,
                uinput.KEY_1,
                uinput.KEY_2,
                uinput.KEY_3,
                uinput.KEY_4,
                uinput.KEY_5,
                uinput.KEY_6,
                uinput.KEY_7,
                uinput.KEY_8,
                uinput.KEY_9,
                uinput.KEY_ENTER,
                uinput.KEY_ESC,
                uinput.KEY_BACKSPACE,
                uinput.KEY_TAB,
                uinput.KEY_SPACE,
                uinput.KEY_MINUS,
                uinput.KEY_EQUAL,
                uinput.KEY_LEFTBRACE,
                uinput.KEY_RIGHTBRACE,
                uinput.KEY_BACKSLASH,
                uinput.KEY_SEMICOLON,
                uinput.KEY_APOSTROPHE,
                uinput.KEY_GRAVE,
                uinput.KEY_COMMA,
                uinput.KEY_DOT,
                uinput.KEY_SLASH,
                uinput.KEY_CAPSLOCK,
                uinput.KEY_F1,
                uinput.KEY_F2,
                uinput.KEY_F3,
                uinput.KEY_F4,
                uinput.KEY_F5,
                uinput.KEY_F6,
                uinput.KEY_F7,
                uinput.KEY_F8,
                uinput.KEY_F9,
                uinput.KEY_F10,
                uinput.KEY_F11,
                uinput.KEY_F12,
                uinput.KEY_SYSRQ,
                uinput.KEY_SCROLLLOCK,
                uinput.KEY_PAUSE,
                uinput.KEY_INSERT,
                uinput.KEY_HOME,
                uinput.KEY_PAGEUP,
                uinput.KEY_DELETE,
                uinput.KEY_END,
                uinput.KEY_PAGEDOWN,
                uinput.KEY_RIGHT,
                uinput.KEY_LEFT,
                uinput.KEY_DOWN,
                uinput.KEY_UP,
                uinput.KEY_NUMLOCK,
                uinput.KEY_KPSLASH,
                uinput.KEY_KPASTERISK,
                uinput.KEY_KPMINUS,
                uinput.KEY_KPPLUS,
                uinput.KEY_KPENTER,
                uinput.KEY_KP1,
                uinput.KEY_KP2,
                uinput.KEY_KP3,
                uinput.KEY_KP4,
                uinput.KEY_KP5,
                uinput.KEY_KP6,
                uinput.KEY_KP7,
                uinput.KEY_KP8,
                uinput.KEY_KP9,
                uinput.KEY_KP0,
                uinput.KEY_KPDOT,
                uinput.KEY_102ND,
                uinput.KEY_COMPOSE,
                uinput.KEY_POWER,
                uinput.KEY_KPEQUAL,
                uinput.KEY_F13,
                uinput.KEY_F14,
                uinput.KEY_F15,
                uinput.KEY_F16,
                uinput.KEY_F17,
                uinput.KEY_F18,
                uinput.KEY_F19,
                uinput.KEY_F20,
                uinput.KEY_F21,
                uinput.KEY_F22,
                uinput.KEY_F23,
                uinput.KEY_F24,
                uinput.KEY_OPEN,
                uinput.KEY_HELP,
                uinput.KEY_MENU,
                uinput.KEY_FRONT,
                uinput.KEY_STOP,
                uinput.KEY_AGAIN,
                uinput.KEY_UNDO,
                uinput.KEY_CUT,
                uinput.KEY_COPY,
                uinput.KEY_PASTE,
                uinput.KEY_FIND,
                uinput.KEY_MUTE,
                uinput.KEY_VOLUMEUP,
                uinput.KEY_VOLUMEDOWN,
                uinput.KEY_LEFTCTRL,
                uinput.KEY_LEFTSHIFT,
                uinput.KEY_LEFTALT,
                uinput.KEY_LEFTMETA,
                uinput.KEY_RIGHTCTRL,
                uinput.KEY_RIGHTSHIFT,
                uinput.KEY_RIGHTALT,
                uinput.KEY_RIGHTMETA,
            )

            # Create the virtual device
            self.device = uinput.Device(
                events,
                name=f"Keyboard Bridge Device {self.device_id}",
                vendor=0x1234,
                product=0x5678,
            )

            self.is_connected = True
            logger.info(f"Created virtual keyboard device {self.device_id}")

        except Exception as e:
            logger.error(f"Failed to create virtual keyboard device: {e}")
            self.device = None
            self.is_connected = False

    def send_key_event(self, event: KeyboardEvent) -> None:
        """Send a keyboard event to the virtual device."""
        if not self.is_connected or not self.device:
            logger.debug(f"Mock mode: received key event: {event}")
            return

        try:
            # Map the key code to uinput key code
            uinput_key = self._map_key_code(event.key_code)
            if uinput_key is None:
                logger.warning(f"Unknown key code: {event.key_code}")
                return

            # Handle modifiers
            self._handle_modifiers(event.modifiers)

            # Send the key event
            if event.event_type == "keydown":
                self.device.emit(uinput_key, 1)
            elif event.event_type == "keyup":
                self.device.emit(uinput_key, 0)

            logger.debug(f"Sent key event: {event.event_type} {uinput_key}")

        except Exception as e:
            logger.error(f"Error sending key event: {e}")

    def send_composition_event(self, event: KeyboardEvent) -> None:
        """Send a composition event to the virtual device."""
        if not self.is_connected or not self.device:
            logger.debug(f"Mock mode: received composition event: {event}")
            return

        try:
            # For composition events, we need to handle Unicode characters
            # This is a simplified implementation
            logger.debug(f"Composition event: {event.unicode_char}")

        except Exception as e:
            logger.error(f"Error sending composition event: {e}")

    def _map_key_code(self, key_code: int) -> Optional[int]:
        """Map a key code to uinput key code."""
        # Use the keymap if available
        if str(key_code) in self.keymap:
            mapped_key = self.keymap[str(key_code)]
            # Convert string key name to uinput constant
            return getattr(uinput, mapped_key, None)

        # Fallback to direct mapping
        key_mapping = {
            65: uinput.KEY_A,
            66: uinput.KEY_B,
            67: uinput.KEY_C,
            68: uinput.KEY_D,
            69: uinput.KEY_E,
            70: uinput.KEY_F,
            71: uinput.KEY_G,
            72: uinput.KEY_H,
            73: uinput.KEY_I,
            74: uinput.KEY_J,
            75: uinput.KEY_K,
            76: uinput.KEY_L,
            77: uinput.KEY_M,
            78: uinput.KEY_N,
            79: uinput.KEY_O,
            80: uinput.KEY_P,
            81: uinput.KEY_Q,
            82: uinput.KEY_R,
            83: uinput.KEY_S,
            84: uinput.KEY_T,
            85: uinput.KEY_U,
            86: uinput.KEY_V,
            87: uinput.KEY_W,
            88: uinput.KEY_X,
            89: uinput.KEY_Y,
            90: uinput.KEY_Z,
            32: uinput.KEY_SPACE,
            13: uinput.KEY_ENTER,
            9: uinput.KEY_TAB,
            8: uinput.KEY_BACKSPACE,
            16: uinput.KEY_LEFTSHIFT,
            17: uinput.KEY_LEFTCTRL,
            18: uinput.KEY_LEFTALT,
            20: uinput.KEY_CAPSLOCK,
            27: uinput.KEY_ESC,
        }

        return key_mapping.get(key_code)

    def _handle_modifiers(self, modifiers: Dict[str, bool]) -> None:
        """Handle modifier keys."""
        if not self.device:
            return

        # Handle common modifiers
        if modifiers.get("ctrl"):
            self.device.emit(uinput.KEY_LEFTCTRL, 1)
        else:
            self.device.emit(uinput.KEY_LEFTCTRL, 0)

        if modifiers.get("shift"):
            self.device.emit(uinput.KEY_LEFTSHIFT, 1)
        else:
            self.device.emit(uinput.KEY_LEFTSHIFT, 0)

        if modifiers.get("alt"):
            self.device.emit(uinput.KEY_LEFTALT, 1)
        else:
            self.device.emit(uinput.KEY_LEFTALT, 0)

        if modifiers.get("meta"):
            self.device.emit(uinput.KEY_LEFTMETA, 1)
        else:
            self.device.emit(uinput.KEY_LEFTMETA, 0)

    def get_device_path(self) -> Optional[str]:
        """Get the device path for xFreeRDP integration."""
        if self.device and hasattr(self.device, "device_path"):
            device_path = self.device.device_path
            return str(device_path) if device_path is not None else None
        return None

    def cleanup(self) -> None:
        """Clean up the virtual device."""
        if self.device:
            try:
                self.device.destroy()
                logger.info(f"Destroyed virtual keyboard device {self.device_id}")
            except Exception as e:
                logger.error(f"Error destroying virtual keyboard device: {e}")
        self.is_connected = False
