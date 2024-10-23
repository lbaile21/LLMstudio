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

// Mapping of HTTP-ish status codes to user-facing error copy. Kept as a
// module-level constant so the table is allocated once rather than on every
// `getErrorMessage` call, and so new codes can be added without growing the
// switch statement.
const ERROR_MESSAGES: Record<number, string> = {
  400: "Oops! That's not a valid request.",
  401: 'Invalid API key. Please verify and try again.',
  403: 'Access denied. Check API key permissions.',
  404: 'Resource unavailable. Check the request and retry.',
  429: 'Usage limit exceeded. Try again later.',
  500: 'Unexpected server issue. Please try again later.',
  503: 'Service is temporarily busy. Please retry later.',
  529: 'Service is temporarily busy. Please retry later.',
};

export const getErrorMessage = (error: number | undefined): string => {
  if (error === undefined) return 'LLMstudio Engine is not running';
  return ERROR_MESSAGES[error] ?? 'Unknown error';
};

/**
 * Accessibility helpers.
 *
 * These utilities centralize a few accessibility concerns (screen reader
 * announcements, reduced-motion preference detection, focus management)
 * so that UI components can rely on consistent, well-tested behavior
 * instead of reimplementing the same patterns ad-hoc.
 *
 * All helpers in this section are SSR-safe: they short-circuit cleanly
 * when `window` or `document` is unavailable, returning no-op disposers
 * where appropriate. This lets them be imported freely from components
 * that may render on the server.
 */

// Cache the reduced-motion MediaQueryList so we don't re-query on every call.
// `matchMedia` is cheap but not free, and `prefersReducedMotion` is invoked
// on many animation paths.
let reducedMotionMql: MediaQueryList | null = null;

const getReducedMotionMql = (): MediaQueryList | null => {
  if (typeof window === 'undefined' || !window.matchMedia) return null;
  if (!reducedMotionMql) {
    reducedMotionMql = window.matchMedia('(prefers-reduced-motion: reduce)');
  }
  return reducedMotionMql;
};

/**
 * Returns true if the user has requested reduced motion at the OS level.
 * Safe to call during SSR — returns false when `window` is unavailable.
 */
export const prefersReducedMotion = (): boolean => {
  return getReducedMotionMql()?.matches ?? false;
};

/**
 * Subscribe to changes in the user's reduced-motion preference. Returns an
 * unsubscribe function. Useful for components that need to re-render or
 * adjust animations when the OS-level setting changes at runtime.
 */
export const onReducedMotionChange = (
  listener: (reduced: boolean) => void
): (() => void) => {
  const mql = getReducedMotionMql();
  if (!mql) return () => {};
  const handler = (e: MediaQueryListEvent) => listener(e.matches);
  // Safari < 14 only supports the deprecated addListener/removeListener API.
  if (mql.addEventListener) {
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }
  mql.addListener(handler);
  return () => mql.removeListener(handler);
};

// Tracks the pending announcement timer per live-region priority so that
// rapid successive calls don't race: a newer message must always replace
// (not be replaced by) an older one still waiting to be written.
const pendingAnnouncements = new Map<string, ReturnType<typeof setTimeout>>();

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

  // Cancel any in-flight announcement for this priority so the latest
  // message wins instead of being clobbered by a stale timer.
  const existingTimer = pendingAnnouncements.get(id);
  if (existingTimer !== undefined) {
    clearTimeout(existingTimer);
  }

  // Capture in a local so the timeout callback isn't subject to the
  // outer `region` being reassigned or narrowed away.
  const target = region;
  target.textContent = '';
  const timer = window.setTimeout(() => {
    target.textContent = message;
    pendingAnnouncements.delete(id);
  }, 50);
  pendingAnnouncements.set(id, timer);
};

/**
 * Clear any live-region content and cancel pending announcements.
 *
 * Useful when navigating away from a view so that stale status messages
 * are not read out after the context that produced them is gone.
 */
export const clearScreenReaderAnnouncements = (): void => {
  if (typeof document === 'undefined') return;
  for (const [id, timer] of pendingAnnouncements) {
    clearTimeout(timer);
    const region = document.getElementById(id);
    if (region) region.textContent = '';
  }
  pendingAnnouncements.clear();
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
 * Returns true if `el` is currently visible/focusable in the layout.
 *
 * Note: `offsetParent` is null for elements with `position: fixed` even
 * when they are visible, so we additionally consult the client rects as
 * a fallback. This avoids dropping legitimately-focusable elements
 * inside fixed-position dialogs from the focus order.
 */
const isElementVisible = (el: HTMLElement): boolean => {
  if (el.hasAttribute('disabled')) return false;
  if (el.getAttribute('aria-hidden') === 'true') return false;
  if (el.offsetParent !== null) return true;
  return el.getClientRects().length > 0;
};

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
    if (isElementVisible(el)) {
      result.push(el);
    }
  }
  return result;
};

/**
 * Internal helper: focus an element at a specific index in the focus order,
 * supporting negative indices (Python-style) so that `-1` means "last".
 * Returns the focused element, or null if the container is empty.
 */
const focusAt = (
  container: HTMLElement,
  index: number
): HTMLElement | null => {
  const focusable = getFocusableElements(container);
  if (focusable.length === 0) return null;
  const resolved = index < 0 ? focusable.length + index : index;
  const target = focusable[resolved] ?? null;
  target?.focus();
  return target;
};

/**
 * Move focus to the first focusable descendant of `container`.
 *
 * Returns the element that received focus, or `null` if the container
 * had no focusable children. Useful when opening a dialog or panel and
 * you want to land the user on a sensible initial control without
 * hard-coding a ref to it.
 */
export const focusFirstElement = (
  container: HTMLElement
): HTMLElement | null => focusAt(container, 0);

/**
 * Move focus to the last focusable descendant of `container`.
 *
 * Mirrors {@link focusFirstElement} for cases where the natural landing
 * point is at the end of the container (e.g. revealing a newly-appended
 * row and focusing its trailing action button).
 */
export const focusLastElement = (
  container: HTMLElement
): HTMLElement | null => focusAt(container, -1);

/**
 * Trap focus inside `container` until the returned function is invoked.
 *
 * While active, Tab and Shift+Tab cycle through the focusable descendants
 * of `container` instead of leaving it. This is the standard pattern for
 * modal dialogs, command palettes, and similar overlay UI.
 *
 * The previously-focused element is restored when the trap is released,
 * so callers don't need to track it themselves.
 */
export const trapFocus = (container: HTMLElement): (() => void) => {
  if (typeof document === 'undefined') return () => {};

  const previouslyFocused = document.activeElement as HTMLElement | null;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    const focusable = getFocusableElements(container);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
    previouslyFocused?.focus?.();
  };
};
