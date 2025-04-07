export const isBrowser = typeof window !== 'undefined';
export const canUseDOM: boolean =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined';

// These functions should only be called on the client side
export const getIsMobile = (): boolean => {
  return isBrowser ? window.matchMedia('(pointer: coarse)').matches : false;
};

export const getIsApple = (): boolean => {
  return canUseDOM ? /Mac|iPod|iPhone|iPad/.test(navigator.userAgent) : false;
};
