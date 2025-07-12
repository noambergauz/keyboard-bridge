#!/usr/bin/env python3
"""
Keyboard Event Processor

Processes and normalizes keyboard events from TypeScript clients,
handling composition events and Unicode support.
"""

import logging
import time
from typing import Any, Dict, Optional

from keyboard_bridge.virtual_keyboard import KeyboardEvent

logger = logging.getLogger(__name__)


class KeyboardEventProcessor:
    """Processes keyboard events and handles composition events."""

    def __init__(self) -> None:
        self.composition_state: Dict[str, Any] = {}
        self.dead_key_state: Dict[str, Any] = {}

    def process_keyboard_event(self, data: Dict[str, Any]) -> Optional[KeyboardEvent]:
        """Process a keyboard event from the TypeScript client."""
        try:
            # Extract event data
            key_code = data.get("keyCode", 0)
            unicode_char = data.get("char", "")
            modifiers = data.get("modifiers", {})
            event_type = data.get("eventType", "keydown")
            timestamp = data.get("timestamp", time.time())

            # Validate the event
            if not self._validate_keyboard_event(data):
                logger.warning(f"Invalid keyboard event received: {data}")
                return None

            # Create keyboard event
            event = KeyboardEvent(
                key_code=key_code,
                unicode_char=unicode_char,
                modifiers=modifiers,
                event_type=event_type,
                timestamp=timestamp,
            )

            # Process composition state
            self._update_composition_state(event)

            logger.debug(f"Processed keyboard event: {event}")
            return event

        except Exception as e:
            logger.error(f"Error processing keyboard event: {e}")
            return None

    def process_composition_event(
        self, data: Dict[str, Any]
    ) -> Optional[KeyboardEvent]:
        """Process a composition event (AltGr, dead keys, etc.)."""
        try:
            # Extract composition data
            composition_text = data.get("compositionText", "")
            composition_start = data.get("compositionStart", 0)
            composition_end = data.get("compositionEnd", 0)
            modifiers = data.get("modifiers", {})
            timestamp = data.get("timestamp", time.time())

            # Validate composition event
            if not self._validate_composition_event(data):
                logger.warning(f"Invalid composition event received: {data}")
                return None

            # Create composition event
            event = KeyboardEvent(
                key_code=0,  # No specific key code for composition
                unicode_char=composition_text,
                modifiers=modifiers,
                event_type="composition",
                timestamp=timestamp,
            )

            # Update composition state
            self._update_composition_state(event)

            logger.debug(f"Processed composition event: {event}")
            return event

        except Exception as e:
            logger.error(f"Error processing composition event: {e}")
            return None

    def _validate_keyboard_event(self, data: Dict[str, Any]) -> bool:
        """Validate keyboard event data."""
        required_fields = ["keyCode", "eventType"]

        for field in required_fields:
            if field not in data:
                return False

        # Validate key code range
        key_code = data.get("keyCode", 0)
        if not (0 <= key_code <= 255):
            return False

        # Validate event type
        event_type = data.get("eventType", "")
        if event_type not in ["keydown", "keyup"]:
            return False

        return True

    def _validate_composition_event(self, data: Dict[str, Any]) -> bool:
        """Validate composition event data."""
        required_fields = ["compositionText"]

        for field in required_fields:
            if field not in data:
                return False

        return True

    def _update_composition_state(self, event: KeyboardEvent) -> None:
        """Update the composition state based on the event."""
        if event.event_type == "composition":
            # Store composition text
            self.composition_state["text"] = event.unicode_char
            self.composition_state["timestamp"] = event.timestamp

        elif event.event_type == "keydown":
            # Check for dead keys or composition triggers
            if self._is_dead_key(event):
                self.dead_key_state["active"] = True
                self.dead_key_state["key"] = event.key_code
                self.dead_key_state["timestamp"] = event.timestamp

        elif event.event_type == "keyup":
            # Clear dead key state if the key is released
            if (
                self.dead_key_state.get("active")
                and self.dead_key_state.get("key") == event.key_code
            ):
                self.dead_key_state["active"] = False
                self.dead_key_state["key"] = None

    def _is_dead_key(self, event: KeyboardEvent) -> bool:
        """Check if the event represents a dead key."""
        # Dead keys are typically modifier combinations
        modifiers = event.modifiers

        # AltGr (Right Alt) is a common dead key trigger
        if modifiers.get("altGr") or modifiers.get("altGraph"):
            return True

        # Check for other dead key combinations
        if modifiers.get("ctrl") and modifiers.get("alt"):
            return True

        return False

    def get_composition_text(self) -> str:
        """Get the current composition text."""
        text = self.composition_state.get("text", "")
        return str(text) if text is not None else ""

    def clear_composition_state(self) -> None:
        """Clear the composition state."""
        self.composition_state.clear()
        self.dead_key_state.clear()

    def is_composition_active(self) -> bool:
        """Check if composition is currently active."""
        text = self.composition_state.get("text")
        return bool(text)

    def is_dead_key_active(self) -> bool:
        """Check if a dead key is currently active."""
        active = self.dead_key_state.get("active", False)
        return bool(active)
