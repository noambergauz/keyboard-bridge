/**
 * Keyboard Event Capture
 * 
 * Captures keyboard events from DOM elements and normalizes them
 * for transmission to the Python daemon.
 */

import type { KeyboardEvent, CompositionEvent, ModifierState, EventCaptureOptions } from './types';

export class KeyboardEventCapture {
  private target: HTMLElement | Document;
  private options: EventCaptureOptions;
  private isCapturing = false;
  private modifierState: ModifierState = {
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
    altGr: false,
    capsLock: false,
    numLock: false,
    scrollLock: false
  };

  constructor(options: EventCaptureOptions = {}) {
    this.target = options.target || document;
    this.options = {
      captureComposition: true,
      captureModifiers: true,
      preventDefault: false,
      stopPropagation: false,
      ...options
    };
  }

  /**
   * Start capturing keyboard events
   */
  start(): void {
    if (this.isCapturing) {
      return;
    }

    this.target.addEventListener('keydown', this.handleKeyDown.bind(this) as EventListener, true);
    this.target.addEventListener('keyup', this.handleKeyUp.bind(this) as EventListener, true);
    
    if (this.options.captureComposition) {
      this.target.addEventListener('compositionstart', this.handleCompositionStart.bind(this) as EventListener, true);
      this.target.addEventListener('compositionupdate', this.handleCompositionUpdate.bind(this) as EventListener, true);
      this.target.addEventListener('compositionend', this.handleCompositionEnd.bind(this) as EventListener, true);
    }

    this.isCapturing = true;
  }

  /**
   * Stop capturing keyboard events
   */
  stop(): void {
    if (!this.isCapturing) {
      return;
    }

    this.target.removeEventListener('keydown', this.handleKeyDown.bind(this) as EventListener, true);
    this.target.removeEventListener('keyup', this.handleKeyUp.bind(this) as EventListener, true);
    
    if (this.options.captureComposition) {
      this.target.removeEventListener('compositionstart', this.handleCompositionStart.bind(this) as EventListener, true);
      this.target.removeEventListener('compositionupdate', this.handleCompositionUpdate.bind(this) as EventListener, true);
      this.target.removeEventListener('compositionend', this.handleCompositionEnd.bind(this) as EventListener, true);
    }

    this.isCapturing = false;
  }

  /**
   * Handle keydown events
   */
  private handleKeyDown(event: globalThis.KeyboardEvent): void {
    if (this.options.preventDefault) {
      event.preventDefault();
    }
    if (this.options.stopPropagation) {
      event.stopPropagation();
    }

    this.updateModifierState(event);
    
    const keyboardEvent: KeyboardEvent = {
      type: 'keyboard_event',
      keyCode: event.keyCode,
      char: event.key,
      modifiers: { ...this.modifierState },
      eventType: 'keydown',
      timestamp: Date.now(),
      location: event.location,
      repeat: event.repeat
    };

    this.onKeyboardEvent?.(keyboardEvent);
  }

  /**
   * Handle keyup events
   */
  private handleKeyUp(event: globalThis.KeyboardEvent): void {
    if (this.options.preventDefault) {
      event.preventDefault();
    }
    if (this.options.stopPropagation) {
      event.stopPropagation();
    }

    this.updateModifierState(event);
    
    const keyboardEvent: KeyboardEvent = {
      type: 'keyboard_event',
      keyCode: event.keyCode,
      char: event.key,
      modifiers: { ...this.modifierState },
      eventType: 'keyup',
      timestamp: Date.now(),
      location: event.location
    };

    this.onKeyboardEvent?.(keyboardEvent);
  }

  /**
   * Handle composition start events
   */
  private handleCompositionStart(event: globalThis.CompositionEvent): void {
    if (this.options.preventDefault) {
      event.preventDefault();
    }
    if (this.options.stopPropagation) {
      event.stopPropagation();
    }

    const compositionEvent: CompositionEvent = {
      type: 'composition_event',
      compositionText: event.data,
      compositionStart: 0,
      compositionEnd: event.data.length,
      modifiers: { ...this.modifierState },
      timestamp: Date.now()
    };

    this.onCompositionEvent?.(compositionEvent);
  }

  /**
   * Handle composition update events
   */
  private handleCompositionUpdate(event: globalThis.CompositionEvent): void {
    if (this.options.preventDefault) {
      event.preventDefault();
    }
    if (this.options.stopPropagation) {
      event.stopPropagation();
    }

    const compositionEvent: CompositionEvent = {
      type: 'composition_event',
      compositionText: event.data,
      compositionStart: 0,
      compositionEnd: event.data.length,
      modifiers: { ...this.modifierState },
      timestamp: Date.now()
    };

    this.onCompositionEvent?.(compositionEvent);
  }

  /**
   * Handle composition end events
   */
  private handleCompositionEnd(event: globalThis.CompositionEvent): void {
    if (this.options.preventDefault) {
      event.preventDefault();
    }
    if (this.options.stopPropagation) {
      event.stopPropagation();
    }

    const compositionEvent: CompositionEvent = {
      type: 'composition_event',
      compositionText: event.data,
      compositionStart: 0,
      compositionEnd: event.data.length,
      modifiers: { ...this.modifierState },
      timestamp: Date.now()
    };

    this.onCompositionEvent?.(compositionEvent);
  }

  /**
   * Update modifier state based on keyboard event
   */
  private updateModifierState(event: globalThis.KeyboardEvent): void {
    if (!this.options.captureModifiers) {
      return;
    }

    this.modifierState.ctrl = event.ctrlKey;
    this.modifierState.alt = event.altKey;
    this.modifierState.shift = event.shiftKey;
    this.modifierState.meta = event.metaKey;
    
    // Detect AltGr (Right Alt)
    this.modifierState.altGr = event.altKey && event.location === 2;
    
    // Get lock states (these may not be available in all browsers)
    this.modifierState.capsLock = event.getModifierState?.('CapsLock') || false;
    this.modifierState.numLock = event.getModifierState?.('NumLock') || false;
    this.modifierState.scrollLock = event.getModifierState?.('ScrollLock') || false;
  }

  /**
   * Get current modifier state
   */
  getModifierState(): ModifierState {
    return { ...this.modifierState };
  }

  /**
   * Reset modifier state
   */
  resetModifierState(): void {
    this.modifierState = {
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
      altGr: false,
      capsLock: false,
      numLock: false,
      scrollLock: false
    };
  }

  // Event callbacks
  onKeyboardEvent?: (event: KeyboardEvent) => void;
  onCompositionEvent?: (event: CompositionEvent) => void;
} 