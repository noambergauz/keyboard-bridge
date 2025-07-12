#!/bin/bash

# Docker entrypoint script for keyboard-bridge daemon
# Converts environment variables to command-line arguments

set -e

# Build command arguments from environment variables
ARGS=()

# Host configuration
if [ -n "$BRIDGE_HOST" ]; then
    ARGS+=("--host" "$BRIDGE_HOST")
fi

# Port configuration
if [ -n "$BRIDGE_PORT" ]; then
    ARGS+=("--port" "$BRIDGE_PORT")
fi

# Device ID configuration
if [ -n "$BRIDGE_DEVICE_ID" ]; then
    ARGS+=("--device-id" "$BRIDGE_DEVICE_ID")
fi

# Debug mode
if [ "$BRIDGE_DEBUG" = "true" ]; then
    ARGS+=("--debug")
fi

# Mock mode
if [ "$BRIDGE_MOCK" = "true" ]; then
    ARGS+=("--mock")
fi

# Keymap file
if [ -n "$BRIDGE_KEYMAP_FILE" ]; then
    ARGS+=("--keymap-file" "$BRIDGE_KEYMAP_FILE")
fi

# Log level
if [ -n "$BRIDGE_LOG_LEVEL" ]; then
    ARGS+=("--log-level" "$BRIDGE_LOG_LEVEL")
fi

# Add any additional command-line arguments passed to the container
ARGS+=("$@")

# Execute the keyboard-bridge daemon with all arguments
exec keyboard-bridge "${ARGS[@]}" 