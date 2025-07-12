/**
 * WebSocket Client
 * 
 * Handles WebSocket communication with the Python daemon
 * for sending keyboard events and receiving responses.
 */

import type { BridgeEvent, KeyboardBridgeOptions } from './types';

export class WebSocketClient {
  private url: string;
  private ws: WebSocket | null = null;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private reconnectAttempts = 0;
  private debug: boolean;
  private isConnecting = false;
  private isConnected = false;

  constructor(options: KeyboardBridgeOptions) {
    this.url = options.url;
    this.reconnectInterval = options.reconnectInterval || 5000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.debug = options.debug || false;
  }

  /**
   * Connect to the WebSocket server
   */
  async connect(): Promise<void> {
    if (this.isConnecting || this.isConnected) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);

      // Wait for connection to be established
      await new Promise<void>((resolve, reject) => {
        if (!this.ws) {
          reject(new Error('WebSocket not initialized'));
          return;
        }

        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.ws!.onopen = () => {
          clearTimeout(timeout);
          this.isConnecting = false;
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws!.onerror = (error) => {
          clearTimeout(timeout);
          reject(error);
        };
      });

      this.log('Connected to WebSocket server');

    } catch (error) {
      this.isConnecting = false;
      this.log(`Failed to connect: ${error}`);
      throw error;
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.log('Disconnected from WebSocket server');
  }

  /**
   * Send an event to the server
   */
  send(event: BridgeEvent): void {
    if (!this.isConnected || !this.ws) {
      throw new Error('WebSocket not connected');
    }

    try {
      const message = JSON.stringify(event);
      this.ws.send(message);
      this.log(`Sent event: ${event.type}`);
    } catch (error) {
      this.log(`Failed to send event: ${error}`);
      throw error;
    }
  }

  /**
   * Check if the client is connected
   */
  get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    this.isConnected = true;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.onConnect?.();
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    this.isConnected = false;
    this.isConnecting = false;
    
    this.log(`WebSocket closed: ${event.code} - ${event.reason}`);
    
    // Attempt to reconnect if not a normal closure
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.attemptReconnect();
    } else {
      this.onDisconnect?.(event);
    }
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(error: Event): void {
    this.log(`WebSocket error: ${error}`);
    this.onError?.(error);
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      this.log(`Received message: ${data.type}`);
      this.onMessage?.(data);
    } catch (error) {
      this.log(`Failed to parse message: ${error}`);
    }
  }

  /**
   * Attempt to reconnect to the server
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    this.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch((error) => {
        this.log(`Reconnection failed: ${error}`);
        this.attemptReconnect();
      });
    }, this.reconnectInterval);
  }

  /**
   * Log message if debug is enabled
   */
  private log(message: string): void {
    if (this.debug) {
      console.log(`[WebSocketClient] ${message}`);
    }
  }

  // Event callbacks
  onConnect?: () => void;
  onDisconnect?: (event: CloseEvent) => void;
  onError?: (error: Event) => void;
  onMessage?: (data: BridgeEvent) => void;
} 