// Simple polyfills for browser environment
if (typeof window !== 'undefined') {
  // Polyfill for 'self' if it's not defined
  if (typeof self === 'undefined') {
    window.self = window;
  }

  // Polyfill for 'global' if it's not defined
  if (typeof global === 'undefined') {
    window.global = window;
  }
}
