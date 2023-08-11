import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateStream = async (
  url: string,
  data: unknown
): Promise<AsyncIterable<string>> => {
  let response: Response | null = null;
  try {
    response = await fetch(url, {
      method: 'post',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    });
    if (!response.ok || !response.body) {
      throw new Error(getErrorMessage(response.status));
    }
    return getIterableStream(response.body);
  } catch (e) {
    if (e instanceof Error && e.message) throw e;
    throw new Error(getErrorMessage(response?.status));
  }
};

export async function* getIterableStream(
  body: ReadableStream<Uint8Array>
): AsyncIterable<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const decodedChunk = decoder.decode(value, { stream: true });
      if (decodedChunk) yield decodedChunk;
    }
  } finally {
    reader.releaseLock();
  }
}

export const getErrorMessage = (error: number | undefined): string => {
  switch (error) {
    case 400:
      return "Oops! That's not a valid request.";
    case 401:
      return 'Invalid API key. Please verify and try again.';
    case 403:
      return 'Access denied. Check API key permissions.';
    case 404:
      return 'Resource unavailable. Check the request and retry.';
    case 429:
      return 'Usage limit exceeded. Try again later.';
    case 500:
      return 'Unexpected server issue. Please try again later.';
    case 503:
    case 529:
      return 'Service is temporarily busy. Please retry later.';
    case undefined:
      return 'LLMstudio Engine is not running';
    default:
      return 'Unknown error';
  }
};

/**
 * Accessibility helpers.
 *
 * These utilities centralize a few accessibility concerns (screen reader
 * announcements, reduced-motion preference detection, focus management)
 * so that UI components can rely on consistent, well-tested behavior
 * instead of reimplementing the same patterns ad-hoc.
 */

// Cache the reduced-motion MediaQueryList so we don't re-query on every call.
// `matchMedia` is cheap but not free, and `prefersReducedMotion` is invoked
// on many animation paths.
let reducedMotionMql: MediaQueryList | null = null;

/**
 * Returns true if the user has requested reduced motion at the OS level.
 * Safe to call during SSR — returns false when `window` is unavailable.
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  if (!reducedMotionMql) {
    reducedMotionMql = window.matchMedia('(prefers-reduced-motion: reduce)');
  }
  return reducedMotionMql.matches;
};

/**
 * Subscribe to changes in the user's reduced-motion preference. Returns an
 * unsubscribe function. Useful for components that need to re-render or
 * adjust animations when the OS-level setting changes at runtime.
 */
export const onReducedMotionChange = (
  listener: (reduced: boolean) => void
): (() => void) => {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  if (!reducedMotionMql) {
    reducedMotionMql = window.matchMedia('(prefers-reduced-motion: reduce)');
  }
  const handler = (e: MediaQueryListEvent) => listener(e.matches);
  // Safari < 14 only supports the deprecated addListener/removeListener API.
  if (reducedMotionMql.addEventListener) {
    reducedMotionMql.addEventListener('change', handler);
    return () => reducedMotionMql?.removeEventListener('change', handler);
  }
  reducedMotionMql.addListener(handler);
  return () => reducedMotionMql?.removeListener(handler);
};

/**
 * Announce a message to assistive technologies via an ARIA live region.
 * Creates (and reuses) a visually-hidden container appended to <body>.
 *
 * @param message  The text to announce.
 * @param priority 'polite' (default) waits for the AT to be idle;
 *                 'assertive' interrupts the current announcement.
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void => {
  if (typeof document === 'undefined' || !message) return;

  const id = `sr-live-${priority}`;
  let region = document.getElementById(id);
  if (!region) {
    region = document.createElement('div');
    region.id = id;
    region.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.style.cssText =
      'position:absolute;width:1px;height:1px;padding:0;margin:-1px;' +
      'overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
    document.body.appendChild(region);
  }

  // Clear first so identical consecutive messages still get announced.
  region.textContent = '';
  window.setTimeout(() => {
    if (region) region.textContent = message;
  }, 50);
};

/** CSS selector matching elements that are typically focusable. */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

/**
 * Returns the focusable descendants of `container`, in DOM order.
 *
 * Uses a single `querySelectorAll` pass plus an in-place visibility filter
 * to avoid the double-iteration cost of `Array.from(...).filter(...)` on
 * large containers (e.g. long lists, complex dialogs).
 */
export const getFocusableElements = (
  container: HTMLElement
): HTMLElement[] => {
  const nodes = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  const result: HTMLElement[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const el = nodes[i];
    if (
      !el.hasAttribute('disabled') &&
      el.getAttribute('aria-hidden') !== 'true' &&
      el.offsetParent !== null
    ) {
      result.push(el);
    }
  }
  return result;
};
