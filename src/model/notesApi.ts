import { loadNotes } from './notesStorage';
import type { Note } from './types';

/** Simulated network latency, so the loading state is visible. */
export const LATENCY_MS = 600;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Mock REST client: same async contract a real backend would have.
 * Reads from localStorage underneath; swapping it for fetch() wouldn't change the callers.
 */
export async function fetchNotes(): Promise<Note[]> {
	await wait(LATENCY_MS);
	return loadNotes();
}
