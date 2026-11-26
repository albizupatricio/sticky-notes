export const NoteColor = {
	Green: 'green',
	Sand: 'sand',
	Slate: 'slate',
	Rose: 'rose',
} as const;

export type NoteColor = (typeof NoteColor)[keyof typeof NoteColor];

/** Pixels, relative to the board's top-left corner. */
export type Point = {
	readonly x: number;
	readonly y: number;
};

/** Pixels, relative to the board's top-left corner. */
export type Rect = Point & {
	readonly width: number;
	readonly height: number;
};

/**
 * A sticky note. Position and size come from Rect.
 * Stacking order is the note's index in NotesState.notes: the last one is on top.
 */
export type Note = Rect & {
	readonly id: string;
	readonly color: NoteColor;
	readonly text: string;
};

/** Persisted notes. UI-only state (like the rectangle being drawn) lives in components. */
export type NotesState = {
	readonly notes: readonly Note[];
};

/**
 * Every change to the notes goes through one of these actions.
 * Coordinates and sizes are board pixels. `raise` moves a note to the end of the list
 * so it renders on top; `load` replaces all notes (e.g. when restoring from storage).
 */
export type NoteAction =
	| { type: 'create'; note: Note }
	| { type: 'delete'; id: string }
	| { type: 'load'; notes: readonly Note[] }
	| { type: 'move'; id: string; x: number; y: number }
	| { type: 'raise'; id: string }
	| { type: 'resize'; id: string; width: number; height: number }
	| { type: 'setColor'; id: string; color: NoteColor }
	| { type: 'setText'; id: string; text: string };