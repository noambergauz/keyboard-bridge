/**
 * Keyboard Bridge Client
 * 
 * A TypeScript library that captures keyboard events from web browsers
 * and sends them to a Python daemon via WebSocket for RDP integration.
 */

export { KeyboardBridge } from './keyboard-bridge';
export { KeyboardEventCapture } from './keyboard-event-capture';
export { WebSocketClient } from './websocket-client';
export type { KeyboardEvent, CompositionEvent, ModifierState } from './types'; 