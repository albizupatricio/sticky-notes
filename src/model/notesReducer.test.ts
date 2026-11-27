import { describe, expect, it } from 'vitest';

import { notesReducer } from './notesReducer';
import { type Note, NoteActionType, NoteColor, type NotesState } from './types';

const note = (id: string, changes: Partial<Note> = {}): Note => ({
	id,
	x: 0,
	y: 0,
	width: 200,
	height: 160,
	color: NoteColor.Green,
	text: '',
	...changes,
});

const state = (...notes: Note[]): NotesState => ({ notes });

describe('notesReducer', () => {
	it('creates a note on top of the others', () => {
		const next = notesReducer(state(note('a')), { type: NoteActionType.Create, note: note('b') });
		expect(next.notes.map((n) => n.id)).toEqual(['a', 'b']);
	});

	it('moves only the given note', () => {
		const next = notesReducer(state(note('a'), note('b')), {
			type: NoteActionType.Move,
			id: 'b',
			x: 40,
			y: 60,
		});
		expect(next.notes[0]).toEqual(note('a'));
		expect(next.notes[1]).toMatchObject({ x: 40, y: 60 });
	});

	it('raises a note to the top of the stack', () => {
		const next = notesReducer(state(note('a'), note('b'), note('c')), {
			type: NoteActionType.Raise,
			id: 'a',
		});
		expect(next.notes.map((n) => n.id)).toEqual(['b', 'c', 'a']);
	});

	it('keeps the same state when raising the top note, so React skips the render', () => {
		const current = state(note('a'), note('b'));
		expect(notesReducer(current, { type: NoteActionType.Raise, id: 'b' })).toBe(current);
	});

	it('deletes a note', () => {
		const next = notesReducer(state(note('a'), note('b')), {
			type: NoteActionType.Delete,
			id: 'a',
		});
		expect(next.notes.map((n) => n.id)).toEqual(['b']);
	});

	it('updates text and color', () => {
		let next = notesReducer(state(note('a')), {
			type: NoteActionType.SetText,
			id: 'a',
			text: 'Hello',
		});
		next = notesReducer(next, { type: NoteActionType.SetColor, id: 'a', color: NoteColor.Rose });
		expect(next.notes[0]).toMatchObject({ text: 'Hello', color: NoteColor.Rose });
	});

	it('replaces all notes on load', () => {
		const next = notesReducer(state(note('a')), {
			type: NoteActionType.Load,
			notes: [note('x'), note('y')],
		});
		expect(next.notes.map((n) => n.id)).toEqual(['x', 'y']);
	});
});
