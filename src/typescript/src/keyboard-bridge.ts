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
  // Letters A-Z
  '65': 'KEY_A', '66': 'KEY_B', '67': 'KEY_C', '68': 'KEY_D', '69': 'KEY_E',
  '70': 'KEY_F', '71': 'KEY_G', '72': 'KEY_H', '73': 'KEY_I', '74': 'KEY_J',
  '75': 'KEY_K', '76': 'KEY_L', '77': 'KEY_M', '78': 'KEY_N', '79': 'KEY_O',
  '80': 'KEY_P', '81': 'KEY_Q', '82': 'KEY_R', '83': 'KEY_S', '84': 'KEY_T',
  '85': 'KEY_U', '86': 'KEY_V', '87': 'KEY_W', '88': 'KEY_X', '89': 'KEY_Y',
  '90': 'KEY_Z',
  
  // Numbers 0-9
  '48': 'KEY_0', '49': 'KEY_1', '50': 'KEY_2', '51': 'KEY_3', '52': 'KEY_4',
  '53': 'KEY_5', '54': 'KEY_6', '55': 'KEY_7', '56': 'KEY_8', '57': 'KEY_9',
  
  // Basic controls
  '32': 'KEY_SPACE', '13': 'KEY_ENTER', '9': 'KEY_TAB', '8': 'KEY_BACKSPACE',
  '27': 'KEY_ESC', '20': 'KEY_CAPSLOCK',
  
  // Symbols
  '189': 'KEY_MINUS', '187': 'KEY_EQUAL', '219': 'KEY_LEFTBRACE', '221': 'KEY_RIGHTBRACE',
  '220': 'KEY_BACKSLASH', '186': 'KEY_SEMICOLON', '222': 'KEY_APOSTROPHE',
  '192': 'KEY_GRAVE', '188': 'KEY_COMMA', '190': 'KEY_DOT', '191': 'KEY_SLASH',
  
  // Function keys F1-F12
  '112': 'KEY_F1', '113': 'KEY_F2', '114': 'KEY_F3', '115': 'KEY_F4',
  '116': 'KEY_F5', '117': 'KEY_F6', '118': 'KEY_F7', '119': 'KEY_F8',
  '120': 'KEY_F9', '121': 'KEY_F10', '122': 'KEY_F11', '123': 'KEY_F12',
  
  // Extended function keys F13-F24
  '124': 'KEY_F13', '125': 'KEY_F14', '126': 'KEY_F15', '127': 'KEY_F16',
  '128': 'KEY_F17', '129': 'KEY_F18', '130': 'KEY_F19', '131': 'KEY_F20',
  '132': 'KEY_F21', '133': 'KEY_F22', '134': 'KEY_F23', '135': 'KEY_F24',
  
  // Navigation keys
  '37': 'KEY_LEFT', '38': 'KEY_UP', '39': 'KEY_RIGHT', '40': 'KEY_DOWN',
  '36': 'KEY_HOME', '35': 'KEY_END', '33': 'KEY_PAGEUP', '34': 'KEY_PAGEDOWN',
  '45': 'KEY_INSERT', '46': 'KEY_DELETE',
  
  // Special keys
  '44': 'KEY_SYSRQ', '145': 'KEY_SCROLLLOCK', '19': 'KEY_PAUSE',
  
  // Modifier keys (left and right variants)
  '16': 'KEY_LEFTSHIFT', '17': 'KEY_LEFTCTRL', '18': 'KEY_LEFTALT',
  '91': 'KEY_LEFTMETA', '92': 'KEY_RIGHTMETA',
  '160': 'KEY_LEFTSHIFT', '161': 'KEY_RIGHTSHIFT',
  '162': 'KEY_LEFTCTRL', '163': 'KEY_RIGHTCTRL',
  '164': 'KEY_LEFTALT', '165': 'KEY_RIGHTALT',
  
  // Numpad keys
  '96': 'KEY_KP0', '97': 'KEY_KP1', '98': 'KEY_KP2', '99': 'KEY_KP3',
  '100': 'KEY_KP4', '101': 'KEY_KP5', '102': 'KEY_KP6', '103': 'KEY_KP7',
  '104': 'KEY_KP8', '105': 'KEY_KP9', '110': 'KEY_KPDOT',
  '106': 'KEY_KPASTERISK', '109': 'KEY_KPMINUS', '107': 'KEY_KPPLUS',
  '111': 'KEY_KPSLASH', '144': 'KEY_NUMLOCK',
  
  // Additional symbols and special keys
  '226': 'KEY_102ND', '229': 'KEY_COMPOSE', '152': 'KEY_POWER',
  '141': 'KEY_KPEQUAL',
  
  // Media and control keys
  '150': 'KEY_OPEN', '151': 'KEY_HELP',
  '153': 'KEY_STOP', '154': 'KEY_AGAIN', '155': 'KEY_UNDO',
  '156': 'KEY_CUT', '157': 'KEY_COPY', '158': 'KEY_PASTE',
  '159': 'KEY_FIND', '173': 'KEY_MUTE', '174': 'KEY_VOLUMEDOWN',
  '175': 'KEY_VOLUMEUP',
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

    // Connect to WebSocket server
    await this.wsClient.connect();

    // Start capturing keyboard events
    this.eventCapture.start();

    this.isStarted = true;
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
      return;
    }

    try {
      this.wsClient.send(event);
    } catch {
      // Handle error silently or log to external logger
    }
  }

  /**
   * Handle composition events from the event capture
   */
  private handleCompositionEvent(event: CompositionEvent): void {
    if (!this.wsClient.connected) {
      return;
    }

    try {
      this.wsClient.send(event);
    } catch {
      // Handle error silently or log to external logger
    }
  }

  /**
   * Handle WebSocket connect event
   */
  private handleConnect(): void {
    // Send keymap event
    const keymapEvent: BridgeEvent = {
      type: 'keymap',
      keymap: this.keymap
    };
    try {
      this.wsClient.send(keymapEvent);
    } catch {
      // Handle error silently or log to external logger
    }
    // Send initial connection event
    const connectEvent: BridgeEvent = {
      type: 'connect',
      clientId: this.generateClientId(),
      timestamp: Date.now()
    };
    try {
      this.wsClient.send(connectEvent);
    } catch {
      // Handle error silently or log to external logger
    }
  }

  /**
   * Handle WebSocket disconnect event
   */
  private handleDisconnect(): void {
    // Handle disconnect silently
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(): void {
    // Handle error silently or log to external logger
  }

  /**
   * Handle incoming messages from WebSocket
   */
  private handleMessage(): void {
    // Handle incoming messages as needed
  }

  /**
   * Generate a unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current modifier state
   */
  getModifierState() {
    return this.eventCapture.getModifierState();
  }

  /**
   * Reset modifier state
   */
  resetModifierState(): void {
    this.eventCapture.resetModifierState();
  }

  /**
   * Send a custom event
   */
  sendEvent(event: BridgeEvent): void {
    if (this.wsClient.connected) {
      this.wsClient.send(event);
    }
  }

  /**
   * Update the keymap
   */
  setKeymap(keymap: Keymap): void {
    this.keymap = { ...keymap };
  }
} 