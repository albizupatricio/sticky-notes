import { assertNever } from '../lib/assertNever';
import { type Note, type NoteAction, NoteActionType, type NotesState } from './types';

export const initialNotesState: NotesState = { notes: [] };

export function notesReducer(state: NotesState, action: NoteAction): NotesState {
	switch (action.type) {
		case NoteActionType.Create:
			return { notes: [...state.notes, action.note] };
		case NoteActionType.Delete:
			return { notes: state.notes.filter((note) => note.id !== action.id) };
		case NoteActionType.Load:
			return { notes: action.notes };
		case NoteActionType.Move:
			return updateNote(state, action.id, { x: action.x, y: action.y });
		case NoteActionType.Raise: {
			const index = state.notes.findIndex((note) => note.id === action.id);
			const note = state.notes[index];

			// Not found, or already on top: keep the same state so React skips the re-render.
			if (!note || index === state.notes.length - 1) {
				return state;
			}

			return {
				notes: [...state.notes.slice(0, index), ...state.notes.slice(index + 1), note],
			};
		}
		case NoteActionType.Resize:
			return updateNote(state, action.id, { width: action.width, height: action.height });
		case NoteActionType.SetColor:
			return updateNote(state, action.id, { color: action.color });
		case NoteActionType.SetText:
			return updateNote(state, action.id, { text: action.text });
		default:
			return assertNever(action);
	}
}

/** Returns a new state where only the note with `id` has the given changes. */
function updateNote(state: NotesState, id: string, changes: Partial<Omit<Note, 'id'>>): NotesState {
	return {
		notes: state.notes.map((note) => (note.id === id ? { ...note, ...changes } : note)),
	};
}
