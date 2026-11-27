import { beforeEach, describe, expect, it, vi } from 'vitest';

import { loadNotes, saveNotes } from './notesStorage';
import { type Note, NoteColor } from './types';

const validNote: Note = {
	id: 'a',
	x: 10,
	y: 20,
	width: 200,
	height: 160,
	color: NoteColor.Sand,
	text: 'Hi',
};

beforeEach(() => {
	const store = new Map<string, string>();
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => store.get(key) ?? null,
		setItem: (key: string, value: string) => store.set(key, value),
	});
});

describe('notesStorage', () => {
	it('returns an empty list when nothing is saved', () => {
		expect(loadNotes()).toEqual([]);
	});

	it('loads what it saved', () => {
		saveNotes([validNote]);
		expect(loadNotes()).toEqual([validNote]);
	});

	it('returns an empty list for corrupt data', () => {
		localStorage.setItem('sticky-notes', 'not json');
		expect(loadNotes()).toEqual([]);
	});

	it('drops entries that are not valid notes', () => {
		localStorage.setItem(
			'sticky-notes',
			JSON.stringify([validNote, { id: 'b' }, { ...validNote, id: 'c', color: 'purple' }]),
		);
		expect(loadNotes()).toEqual([validNote]);
	});
});
