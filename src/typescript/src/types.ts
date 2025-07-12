/**
 * Type definitions for the Keyboard Bridge Client
 */

// DOM types for event listeners
export type EventListener = (event: Event) => void;

export interface ModifierState {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  altGr: boolean;
  capsLock: boolean;
  numLock: boolean;
  scrollLock: boolean;
}

export interface KeyboardEvent {
  type: 'keyboard_event';
  keyCode: number;
  char: string;
  modifiers: ModifierState;
  eventType: 'keydown' | 'keyup';
  timestamp: number;
  location?: number;
  repeat?: boolean;
}

export interface CompositionEvent {
  type: 'composition_event';
  compositionText: string;
  compositionStart: number;
  compositionEnd: number;
  modifiers: ModifierState;
  timestamp: number;
}

export interface ConnectEvent {
  type: 'connect';
  clientId: string;
  timestamp: number;
}

export interface ConnectionResponse {
  type: 'connection_established';
  deviceId: number;
  status: 'connected' | 'error';
  message?: string;
}

export type Keymap = Record<string, string>;

export interface KeymapEvent {
  type: 'keymap';
  keymap: Keymap;
}

export type BridgeEvent = KeyboardEvent | CompositionEvent | ConnectEvent | ConnectionResponse | KeymapEvent;

export interface KeyboardBridgeOptions {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  debug?: boolean;
}

export interface EventCaptureOptions {
  target?: HTMLElement | Document;
  captureComposition?: boolean;
  captureModifiers?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
} 