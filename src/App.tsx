import { useCallback, useMemo, useReducer, useRef } from 'react';

import { Note } from './components/Note/Note';
import { notesReducer } from './state/notesReducer';
import { NoteColor, type NotesState } from './state/types';

import styles from './App.module.css';

// Temporary notes to see something on screen. Removed once notes can be created.
const devState: NotesState = {
	notes: [
		{ id: '1', x: 72, y: 52, width: 236, height: 188, color: NoteColor.Green, text: 'First note' },
		{
			id: '2',
			x: 372,
			y: 104,
			width: 214,
			height: 170,
			color: NoteColor.Sand,
			text: 'Second note',
		},
	],
};

function App() {
	const [state, dispatch] = useReducer(notesReducer, devState);
	const boardRef = useRef<HTMLElement>(null);

	// Render notes in a stable order so raising one never moves its DOM node,
	// which would release pointer capture mid-drag. Stacking comes from z-index.
	const renderOrder = useMemo(
		() => [...state.notes].sort((a, b) => a.id.localeCompare(b.id)),
		[state.notes],
	);

	const zIndexById = useMemo(
		() => new Map(state.notes.map((note, index) => [note.id, index])),
		[state.notes],
	);

	// Stable across renders, so memoized notes don't re-render because of it.
	const getBoardSize = useCallback(() => {
		const board = boardRef.current;
		return { width: board?.clientWidth ?? 0, height: board?.clientHeight ?? 0 };
	}, []);

	return (
		<div className={styles.app}>
			<header className={styles.header}>
				<h1 className={styles.title}>Sticky Notes</h1>
			</header>
			<main ref={boardRef} className={styles.board} aria-label="Board">
				{state.notes.map((note) => (
					<Note
						key={note.id}
						note={note}
						zIndex={zIndexById.get(note.id) ?? 0}
						dispatch={dispatch}
						getBoardSize={getBoardSize}
					/>
				))}
			</main>
		</div>
	);
}

export default App;
