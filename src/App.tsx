import { useEffect, useReducer, useState } from 'react';

import { Board } from './components/Board/Board';
import { Header } from './components/Header/Header';
import { fetchNotes } from './model/notesApi';
import { initialNotesState, notesReducer } from './model/notesReducer';
import { saveNotes } from './model/notesStorage';
import { NoteActionType, NoteColor } from './model/types';

import styles from './App.module.css';

function App() {
	const [state, dispatch] = useReducer(notesReducer, initialNotesState);
	const [isLoading, setLoading] = useState(true);
	// Color for the next note the user creates.
	const [newNoteColor, setNewNoteColor] = useState<NoteColor>(NoteColor.Green);

	// Initial load from the (mock) API.
	useEffect(() => {
		// Ignore the result if the component unmounted first (also covers StrictMode's double run).
		let isCancelled = false;
		fetchNotes().then((notes) => {
			if (isCancelled) return;
			dispatch({ type: NoteActionType.Load, notes });
			setLoading(false);
		});
		return () => {
			isCancelled = true;
		};
	}, []);

	useEffect(() => {
		// Don't save until notes are loaded, or the empty initial state would overwrite them.
		if (isLoading) return;
		saveNotes(state.notes);
	}, [state.notes, isLoading]);

	return (
		<div className={styles.app}>
			<Header
				noteCount={state.notes.length}
				newNoteColor={newNoteColor}
				onNewNoteColorChange={setNewNoteColor}
			/>
			<Board
				notes={state.notes}
				dispatch={dispatch}
				newNoteColor={newNoteColor}
				isLoading={isLoading}
			/>
		</div>
	);
}

export default App;
