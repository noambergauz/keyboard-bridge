#!/usr/bin/env python3
"""
Keyboard Bridge Daemon

A Python daemon that creates virtual USB HID keyboard devices and handles
keyboard events from TypeScript clients via WebSocket connections.
"""

import argparse
import asyncio
import json as pyjson
import logging
import signal
import sys
from dataclasses import dataclass
from typing import Dict, Optional, Any

from websockets.exceptions import ConnectionClosed
from websockets.server import WebSocketServerProtocol, serve

from keyboard_bridge.event_processor import KeyboardEventProcessor
from keyboard_bridge.virtual_keyboard import VirtualKeyboardDevice

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@dataclass
class ClientConnection:
    """Represents a connected WebSocket client."""

    websocket: WebSocketServerProtocol
    client_id: str
    device_id: Optional[int] = None


class KeyboardBridgeDaemon:
    """Main daemon class that manages WebSocket connections and virtual keyboards."""

    def __init__(
        self,
        port: int = 8080,
        device_id: int = 1,
        host: str = "localhost",
        keymap: Optional[Dict[str, str]] = None,
    ) -> None:
        self.port = port
        self.device_id = device_id
        self.host = host
        self.keymap = keymap or None
        self.clients: Dict[str, ClientConnection] = {}
        self.virtual_keyboards: Dict[int, Optional[VirtualKeyboardDevice]] = {}
        self.event_processor = KeyboardEventProcessor()
        self.running = False

    async def start(self) -> None:
        """Start the WebSocket server and virtual keyboard devices."""
        logger.info(f"Starting Keyboard Bridge Daemon on port {self.port}")

        # Create virtual keyboard device
        try:
            keyboard = VirtualKeyboardDevice(self.device_id, keymap=self.keymap)
            self.virtual_keyboards[self.device_id] = keyboard
            logger.info(f"Created virtual keyboard device with ID: {self.device_id}")
        except Exception as e:
            logger.warning(f"Failed to create virtual keyboard device: {e}")
            logger.info("Continuing without virtual keyboard support (mock mode)")
            self.virtual_keyboards[self.device_id] = None

        # Start WebSocket server
        self.running = True
        host = getattr(self, "host", "localhost")
        async with serve(self.handle_client, host, self.port):
            logger.info(f"WebSocket server listening on ws://{host}:{self.port}")
            await asyncio.Future()  # Run forever

    async def handle_client(self, websocket: WebSocketServerProtocol, path: str) -> None:
        """Handle incoming WebSocket connections."""
        client_id = f"client_{len(self.clients) + 1}"
        client = ClientConnection(websocket=websocket, client_id=client_id)

        self.clients[client_id] = client
        logger.info(f"Client {client_id} connected")

        try:
            async for message in websocket:
                await self.process_message(client, message)
        except ConnectionClosed:
            logger.info(f"Client {client_id} disconnected")
        except Exception as e:
            logger.error(f"Error handling client {client_id}: {e}")
        finally:
            if client_id in self.clients:
                del self.clients[client_id]

    async def process_message(self, client: ClientConnection, message: str) -> None:
        """Process incoming keyboard events from clients."""
        try:
            data = pyjson.loads(message)
            event_type = data.get("type")

            if event_type == "keyboard_event":
                await self.handle_keyboard_event(client, data)
            elif event_type == "composition_event":
                await self.handle_composition_event(client, data)
            elif event_type == "connect":
                await self.handle_connect(client, data)
            elif event_type == "keymap":
                await self.handle_keymap(client, data)
            else:
                logger.warning(f"Unknown event type: {event_type}")

        except pyjson.JSONDecodeError:
            logger.error(f"Invalid JSON received from {client.client_id}")
        except Exception as e:
            logger.error(f"Error processing message from {client.client_id}: {e}")

    async def handle_keyboard_event(self, client: ClientConnection, data: Dict[str, Any]) -> None:
        """Handle keyboard events and send to virtual keyboard."""
        try:
            # Process the keyboard event
            processed_event = self.event_processor.process_keyboard_event(data)

            if processed_event:
                # Send to virtual keyboard device
                keyboard = self.virtual_keyboards.get(self.device_id)
                if keyboard:
                    keyboard.send_key_event(processed_event)
                    logger.debug(
                        f"Sent key event to virtual keyboard: {processed_event}"
                    )
                else:
                    logger.debug(f"Mock mode: received key event: {processed_event}")

        except Exception as e:
            logger.error(f"Error handling keyboard event: {e}")

    async def handle_composition_event(self, client: ClientConnection, data: Dict[str, Any]) -> None:
        """Handle composition events (AltGr, dead keys, etc.)."""
        try:
            # Process composition event
            processed_event = self.event_processor.process_composition_event(data)

            if processed_event:
                # Send to virtual keyboard device
                keyboard = self.virtual_keyboards.get(self.device_id)
                if keyboard:
                    keyboard.send_composition_event(processed_event)
                    logger.debug(
                        f"Sent composition event to virtual keyboard: {processed_event}"
                    )
                else:
                    logger.debug(
                        f"Mock mode: received composition event: {processed_event}"
                    )

        except Exception as e:
            logger.error(f"Error handling composition event: {e}")

    async def handle_connect(self, client: ClientConnection, data: Dict[str, Any]) -> None:
        """Handle client connection setup."""
        try:
            # Assign device ID to client
            client.device_id = self.device_id

            # Send connection confirmation
            response = {
                "type": "connection_established",
                "device_id": self.device_id,
                "status": "connected",
            }
            await client.websocket.send(pyjson.dumps(response))
            logger.info(
                f"Client {client.client_id} assigned to device {self.device_id}"
            )

        except Exception as e:
            logger.error(f"Error handling connect event: {e}")

    async def handle_keymap(self, client: ClientConnection, data: Dict[str, Any]) -> None:
        """Handle keymap event from client."""
        try:
            keymap = data.get("keymap")
            if not keymap:
                logger.warning("Received empty keymap from client")
                return
            logger.info(f"Received keymap from client {client.client_id}")
            # Update the virtual keyboard device mapping
            keyboard = self.virtual_keyboards.get(self.device_id)
            if keyboard:
                keyboard.set_keymap(keymap)
            else:
                # If no keyboard yet, create one with this keymap
                self.virtual_keyboards[self.device_id] = VirtualKeyboardDevice(
                    self.device_id, keymap=keymap
                )
        except Exception as e:
            logger.error(f"Error handling keymap event: {e}")

    def stop(self) -> None:
        """Stop the daemon and cleanup resources."""
        logger.info("Stopping Keyboard Bridge Daemon")
        self.running = False

        # Cleanup virtual keyboards
        for keyboard in self.virtual_keyboards.values():
            if keyboard:
                keyboard.cleanup()

        logger.info("Daemon stopped")


async def main() -> None:
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Keyboard Bridge Daemon")
    parser.add_argument("--port", type=int, default=8080, help="WebSocket port")
    parser.add_argument("--device-id", type=int, default=1, help="Virtual keyboard device ID")
    parser.add_argument("--host", type=str, default="localhost", help="WebSocket host")
    parser.add_argument("--keymap", type=str, help="Path to key mapping JSON file")
    parser.add_argument("--debug", action="store_true", help="Enable debug logging")

    args = parser.parse_args()

    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)
    keymap = None
    if args.keymap:
        try:
            with open(args.keymap, "r", encoding="utf-8") as f:
                keymap = pyjson.load(f)
            logger.info(f"Loaded keymap from {args.keymap}")
        except Exception as e:
            logger.error(f"Failed to load keymap: {e}")
    # Create and start daemon
    daemon = KeyboardBridgeDaemon(port=args.port, device_id=args.device_id, host=args.host, keymap=keymap)

    # Setup signal handlers
    def signal_handler(signum: int, frame: Any) -> None:
        logger.info("Received shutdown signal")
        daemon.stop()
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    try:
        await daemon.start()
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt")
    finally:
        daemon.stop()


def cli_main() -> None:
    """CLI entry point that properly handles the async main function."""
    asyncio.run(main())


if __name__ == "__main__":
    asyncio.run(main())
