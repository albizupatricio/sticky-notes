import { type Note, NoteColor } from './types';

/** Versioned key, so a future change to the note shape can migrate or ignore old data. */
const STORAGE_KEY = 'sticky-notes';
const COLORS = new Set<string>(Object.values(NoteColor));

/** Reads the saved notes. Returns an empty list if there are none or the data is invalid. */
export function loadNotes(): Note[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const data: unknown = JSON.parse(raw);
		return Array.isArray(data) ? data.filter(isNote) : [];
	} catch {
		return [];
	}
}

/** Saves the notes. Fails silently: the app keeps working in memory. */
export function saveNotes(notes: readonly Note[]): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
	} catch {
		// Storage can be full or disabled (for example, in some private modes).
	}
}

/** Checks that a value read from storage has the shape of a Note. */
function isNote(value: unknown): value is Note {
	if (typeof value !== 'object' || value === null) return false;
	const note = value as Record<string, unknown>;
	return (
		typeof note.id === 'string' &&
		typeof note.text === 'string' &&
		typeof note.color === 'string' &&
		COLORS.has(note.color) &&
		['x', 'y', 'width', 'height'].every((key) => Number.isFinite(note[key]))
	);
}
