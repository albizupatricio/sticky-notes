import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchNotes, LATENCY_MS } from './notesApi';

// vi.mock is moved to the top of the file, so its data must be created with vi.hoisted.
const { savedNote } = vi.hoisted(() => ({
	savedNote: { id: 'a', x: 0, y: 0, width: 200, height: 160, color: 'green', text: 'Hi' },
}));

// The API reads storage underneath; replace it so the test controls the data.
vi.mock('./notesStorage', () => ({ loadNotes: () => [savedNote] }));

describe('fetchNotes', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('waits for the simulated latency before resolving', async () => {
		let isResolved = false;
		void fetchNotes().then(() => {
			isResolved = true;
		});

		await vi.advanceTimersByTimeAsync(LATENCY_MS - 1);
		expect(isResolved).toBe(false);

		await vi.advanceTimersByTimeAsync(1);
		expect(isResolved).toBe(true);
	});

	it('resolves with the stored notes', async () => {
		const promise = fetchNotes();
		await vi.advanceTimersByTimeAsync(LATENCY_MS);
		await expect(promise).resolves.toEqual([savedNote]);
	});
});
