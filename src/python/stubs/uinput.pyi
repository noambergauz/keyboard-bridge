"""
Type stub for uinput module.
This helps mypy understand the uinput types without requiring the actual module.
"""

from typing import Any, Tuple

# Key constants
KEY_A: int
KEY_B: int
KEY_C: int
KEY_D: int
KEY_E: int
KEY_F: int
KEY_G: int
KEY_H: int
KEY_I: int
KEY_J: int
KEY_K: int
KEY_L: int
KEY_M: int
KEY_N: int
KEY_O: int
KEY_P: int
KEY_Q: int
KEY_R: int
KEY_S: int
KEY_T: int
KEY_U: int
KEY_V: int
KEY_W: int
KEY_X: int
KEY_Y: int
KEY_Z: int
KEY_0: int
KEY_1: int
KEY_2: int
KEY_3: int
KEY_4: int
KEY_5: int
KEY_6: int
KEY_7: int
KEY_8: int
KEY_9: int
KEY_ENTER: int
KEY_ESC: int
KEY_BACKSPACE: int
KEY_TAB: int
KEY_SPACE: int
KEY_MINUS: int
KEY_EQUAL: int
KEY_LEFTBRACE: int
KEY_RIGHTBRACE: int
KEY_BACKSLASH: int
KEY_SEMICOLON: int
KEY_APOSTROPHE: int
KEY_GRAVE: int
KEY_COMMA: int
KEY_DOT: int
KEY_SLASH: int
KEY_CAPSLOCK: int
KEY_F1: int
KEY_F2: int
KEY_F3: int
KEY_F4: int
KEY_F5: int
KEY_F6: int
KEY_F7: int
KEY_F8: int
KEY_F9: int
KEY_F10: int
KEY_F11: int
KEY_F12: int
KEY_SYSRQ: int
KEY_SCROLLLOCK: int
KEY_PAUSE: int
KEY_INSERT: int
KEY_HOME: int
KEY_PAGEUP: int
KEY_DELETE: int
KEY_END: int
KEY_PAGEDOWN: int
KEY_RIGHT: int
KEY_LEFT: int
KEY_DOWN: int
KEY_UP: int
KEY_NUMLOCK: int
KEY_KPSLASH: int
KEY_KPASTERISK: int
KEY_KPMINUS: int
KEY_KPPLUS: int
KEY_KPENTER: int
KEY_KP1: int
KEY_KP2: int
KEY_KP3: int
KEY_KP4: int
KEY_KP5: int
KEY_KP6: int
KEY_KP7: int
KEY_KP8: int
KEY_KP9: int
KEY_KP0: int
KEY_KPDOT: int
KEY_102ND: int
KEY_COMPOSE: int
KEY_POWER: int
KEY_KPEQUAL: int
KEY_F13: int
KEY_F14: int
KEY_F15: int
KEY_F16: int
KEY_F17: int
KEY_F18: int
KEY_F19: int
KEY_F20: int
KEY_F21: int
KEY_F22: int
KEY_F23: int
KEY_F24: int
KEY_OPEN: int
KEY_HELP: int
KEY_MENU: int
KEY_FRONT: int
KEY_STOP: int
KEY_AGAIN: int
KEY_UNDO: int
KEY_CUT: int
KEY_COPY: int
KEY_PASTE: int
KEY_FIND: int
KEY_MUTE: int
KEY_VOLUMEUP: int
KEY_VOLUMEDOWN: int
KEY_LEFTCTRL: int
KEY_LEFTSHIFT: int
KEY_LEFTALT: int
KEY_LEFTMETA: int
KEY_RIGHTCTRL: int
KEY_RIGHTSHIFT: int
KEY_RIGHTALT: int
KEY_RIGHTMETA: int

class Device:
    def __init__(self, events: Tuple[int, ...], name: str = "", vendor: int = 0, product: int = 0) -> None: ...
    def emit(self, event: int, value: int) -> None: ...
    def destroy(self) -> None: ...
    @property
    def device_path(self) -> str: ... 