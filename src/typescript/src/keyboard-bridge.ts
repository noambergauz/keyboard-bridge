/**
 * Keyboard Bridge
 * 
 * Main class that combines keyboard event capture with WebSocket communication
 * to bridge keyboard events between web clients and RDP connections.
 */

import { KeyboardEventCapture } from './keyboard-event-capture';
import { WebSocketClient } from './websocket-client';
import type { KeyboardEvent, CompositionEvent, KeyboardBridgeOptions, EventCaptureOptions, BridgeEvent, Keymap } from './types';

const DEFAULT_KEYMAP: Keymap = {
  "65": "KEY_A",
  "66": "KEY_B",
  "67": "KEY_C",
  "68": "KEY_D",
  "69": "KEY_E",
  "70": "KEY_F",
  "71": "KEY_G",
  "72": "KEY_H",
  "73": "KEY_I",
  "74": "KEY_J",
  "75": "KEY_K",
  "76": "KEY_L",
  "77": "KEY_M",
  "78": "KEY_N",
  "79": "KEY_O",
  "80": "KEY_P",
  "81": "KEY_Q",
  "82": "KEY_R",
  "83": "KEY_S",
  "84": "KEY_T",
  "85": "KEY_U",
  "86": "KEY_V",
  "87": "KEY_W",
  "88": "KEY_X",
  "89": "KEY_Y",
  "90": "KEY_Z",
  "32": "KEY_SPACE",
  "13": "KEY_ENTER",
  "9": "KEY_TAB",
  "8": "KEY_BACKSPACE",
  "16": "KEY_LEFTSHIFT",
  "17": "KEY_LEFTCTRL",
  "18": "KEY_LEFTALT",
  "20": "KEY_CAPSLOCK",
  "27": "KEY_ESC",
  // ... add more as needed
};

export class KeyboardBridge {
  private eventCapture: KeyboardEventCapture;
  private wsClient: WebSocketClient;
  private isStarted = false;
  private keymap: Keymap;

  constructor(options: KeyboardBridgeOptions, captureOptions?: EventCaptureOptions, keymap?: Keymap) {
    this.wsClient = new WebSocketClient(options);
    this.eventCapture = new KeyboardEventCapture(captureOptions);
    this.keymap = keymap || { ...DEFAULT_KEYMAP };

    // Set up event handlers
    this.eventCapture.onKeyboardEvent = this.handleKeyboardEvent.bind(this);
    this.eventCapture.onCompositionEvent = this.handleCompositionEvent.bind(this);

    this.wsClient.onConnect = this.handleConnect.bind(this);
    this.wsClient.onDisconnect = this.handleDisconnect.bind(this);
    this.wsClient.onError = this.handleError.bind(this);
    this.wsClient.onMessage = this.handleMessage.bind(this);
  }

  /**
   * Start the keyboard bridge
   */
  async start(): Promise<void> {
    if (this.isStarted) {
      return;
    }

    try {
      // Connect to WebSocket server
      await this.wsClient.connect();

      // Start capturing keyboard events
      this.eventCapture.start();

      this.isStarted = true;
      console.log('Keyboard Bridge started');

    } catch (error) {
      console.error('Failed to start Keyboard Bridge:', error);
      throw error;
    }
  }

  /**
   * Stop the keyboard bridge
   */
  stop(): void {
    if (!this.isStarted) {
      return;
    }

    // Stop capturing events
    this.eventCapture.stop();

    // Disconnect from WebSocket
    this.wsClient.disconnect();

    this.isStarted = false;
    console.log('Keyboard Bridge stopped');
  }

  /**
   * Check if the bridge is started
   */
  get started(): boolean {
    return this.isStarted;
  }

  /**
   * Check if the bridge is connected
   */
  get connected(): boolean {
    return this.wsClient.connected;
  }

  /**
   * Handle keyboard events from the event capture
   */
  private handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.wsClient.connected) {
      console.warn('WebSocket not connected, dropping keyboard event');
      return;
    }

    try {
      this.wsClient.send(event);
    } catch (error) {
      console.error('Failed to send keyboard event:', error);
    }
  }

  /**
   * Handle composition events from the event capture
   */
  private handleCompositionEvent(event: CompositionEvent): void {
    if (!this.wsClient.connected) {
      console.warn('WebSocket not connected, dropping composition event');
      return;
    }

    try {
      this.wsClient.send(event);
    } catch (error) {
      console.error('Failed to send composition event:', error);
    }
  }

  /**
   * Handle WebSocket connect event
   */
  private handleConnect(): void {
    console.log('Connected to keyboard bridge server');
    // Send keymap event
    const keymapEvent: BridgeEvent = {
      type: 'keymap',
      keymap: this.keymap
    };
    try {
      this.wsClient.send(keymapEvent);
    } catch (error) {
      console.error('Failed to send keymap event:', error);
    }
    // Send initial connection event
    const connectEvent: BridgeEvent = {
      type: 'connect',
      clientId: this.generateClientId(),
      timestamp: Date.now()
    };
    try {
      this.wsClient.send(connectEvent);
    } catch (error) {
      console.error('Failed to send connect event:', error);
    }
  }

  /**
   * Handle WebSocket disconnect event
   */
  private handleDisconnect(event: CloseEvent): void {
    console.log('Disconnected from keyboard bridge server:', event.code, event.reason);
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(error: Event): void {
    console.error('WebSocket error:', error);
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(data: BridgeEvent): void {
    if (data.type === 'connection_established') {
      console.log('Connection established with device ID:', data.deviceId);
    } else {
      console.log('Received message:', data);
    }
  }

  /**
   * Generate a unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get the current modifier state
   */
  getModifierState() {
    return this.eventCapture.getModifierState();
  }

  /**
   * Reset the modifier state
   */
  resetModifierState(): void {
    this.eventCapture.resetModifierState();
  }

  /**
   * Send a custom event to the server
   */
  sendEvent(event: BridgeEvent): void {
    if (!this.wsClient.connected) {
      throw new Error('WebSocket not connected');
    }

    this.wsClient.send(event);
  }

  /**
   * Set or update the keymap
   */
  setKeymap(keymap: Keymap): void {
    this.keymap = { ...keymap };
  }
} 