/**
 * Type-safe form event handling utilities
 * Eliminates the need for `as` casting in form event handlers
 */

/**
 * Type guard for HTML input elements
 */
function isHTMLInputElement(
  element: EventTarget | null
): element is HTMLInputElement {
  return element instanceof HTMLInputElement;
}

/**
 * Type guard for HTML select elements
 */
function isHTMLSelectElement(
  element: EventTarget | null
): element is HTMLSelectElement {
  return element instanceof HTMLSelectElement;
}

/**
 * Type guard for HTML textarea elements
 */
function isHTMLTextAreaElement(
  element: EventTarget | null
): element is HTMLTextAreaElement {
  return element instanceof HTMLTextAreaElement;
}

/**
 * Extract value from input event with type safety
 */
export function getInputValue(event: Event): string {
  if (isHTMLInputElement(event.target)) {
    return event.target.value;
  }
  return '';
}

/**
 * Extract checked state from checkbox input event with type safety
 */
export function getInputChecked(event: Event): boolean {
  if (isHTMLInputElement(event.target)) {
    return event.target.checked;
  }
  return false;
}

/**
 * Extract value from select event with type safety
 */
export function getSelectValue(event: Event): string {
  if (isHTMLSelectElement(event.target)) {
    return event.target.value;
  }
  return '';
}

/**
 * Extract value from textarea event with type safety
 */
export function getTextAreaValue(event: Event): string {
  if (isHTMLTextAreaElement(event.target)) {
    return event.target.value;
  }
  return '';
}

/**
 * Extract numeric value from input event with type safety
 */
export function getInputNumberValue(event: Event, defaultValue = 0): number {
  if (isHTMLInputElement(event.target)) {
    const value = parseInt(event.target.value, 10);
    return isNaN(value) ? defaultValue : value;
  }
  return defaultValue;
}

/**
 * Extract float value from input event with type safety
 */
export function getInputFloatValue(event: Event, defaultValue = 0): number {
  if (isHTMLInputElement(event.target)) {
    const value = parseFloat(event.target.value);
    return isNaN(value) ? defaultValue : value;
  }
  return defaultValue;
}

/**
 * Generic typed event handler for form inputs
 */
export function createTypedInputHandler<T extends string>(
  callback: (value: T) => void
): (event: Event) => void {
  return (event: Event) => {
    const value = getInputValue(event) as T;
    callback(value);
  };
}

/**
 * Generic typed event handler for select elements
 */
export function createTypedSelectHandler<T extends string>(
  callback: (value: T) => void
): (event: Event) => void {
  return (event: Event) => {
    const value = getSelectValue(event) as T;
    callback(value);
  };
}

/**
 * Generic typed event handler for textarea elements
 */
export function createTypedTextAreaHandler(
  callback: (value: string) => void
): (event: Event) => void {
  return (event: Event) => {
    const value = getTextAreaValue(event);
    callback(value);
  };
}

/**
 * Generic typed event handler for checkbox inputs
 */
export function createTypedCheckboxHandler(
  callback: (checked: boolean) => void
): (event: Event) => void {
  return (event: Event) => {
    const checked = getInputChecked(event);
    callback(checked);
  };
}

/**
 * Generic typed event handler for number inputs
 */
export function createTypedNumberHandler(
  callback: (value: number) => void,
  defaultValue = 0
): (event: Event) => void {
  return (event: Event) => {
    const value = getInputNumberValue(event, defaultValue);
    callback(value);
  };
}

/**
 * Strongly typed event interfaces for common form elements
 */
export interface TypedInputEvent extends Event {
  target: HTMLInputElement;
}

export interface TypedSelectEvent extends Event {
  target: HTMLSelectElement;
}

export interface TypedTextAreaEvent extends Event {
  target: HTMLTextAreaElement;
}

/**
 * Type guards for typed events
 */
export function isTypedInputEvent(event: Event): event is TypedInputEvent {
  return isHTMLInputElement(event.target);
}

export function isTypedSelectEvent(event: Event): event is TypedSelectEvent {
  return isHTMLSelectElement(event.target);
}

export function isTypedTextAreaEvent(
  event: Event
): event is TypedTextAreaEvent {
  return isHTMLTextAreaElement(event.target);
}
