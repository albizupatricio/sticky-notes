export const NoteColor = {
	Green: 'green',
	Sand: 'sand',
	Slate: 'slate',
	Rose: 'rose',
} as const;

export const NoteActionType = {
	Create: 'create',
	Delete: 'delete',
	Load: 'load',
	Move: 'move',
	Raise: 'raise',
	Resize: 'resize',
	SetColor: 'setColor',
	SetText: 'setText',
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
	| { type: typeof NoteActionType.Create; note: Note }
	| { type: typeof NoteActionType.Delete; id: string }
	| { type: typeof NoteActionType.Load; notes: readonly Note[] }
	| { type: typeof NoteActionType.Move; id: string; x: number; y: number }
	| { type: typeof NoteActionType.Raise; id: string }
	| { type: typeof NoteActionType.Resize; id: string; width: number; height: number }
	| { type: typeof NoteActionType.SetColor; id: string; color: NoteColor }
	| { type: typeof NoteActionType.SetText; id: string; text: string };
