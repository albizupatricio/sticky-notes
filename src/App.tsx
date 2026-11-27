import { useReducer } from 'react';

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
	const [state] = useReducer(notesReducer, devState);

	return (
		<div className={styles.app}>
			<header className={styles.header}>
				<h1 className={styles.title}>Sticky Notes</h1>
			</header>
			<main className={styles.board} aria-label="Board">
				{state.notes.map((note) => (
					<Note key={note.id} note={note} />
				))}
			</main>
		</div>
	);
}

export default App;
