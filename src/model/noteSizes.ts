import type { Size } from '../lib/geometry';

/** Smallest note the user can draw or resize to. */
export const MIN_NOTE_SIZE: Size = { width: 120, height: 100 };

/** Size of a note created with a double-click. */
export const DEFAULT_NOTE_SIZE: Size = { width: 200, height: 160 };
