import { useEffect, useReducer, useState } from 'react';

import { Board } from './components/Board/Board';
import { Header } from './components/Header/Header';
import { initialNotesState, notesReducer } from './model/notesReducer';
import { loadNotes, saveNotes } from './model/notesStorage';
import { NoteColor } from './model/types';

import styles from './App.module.css';

function App() {
	// Lazy initializer: reads storage once, on the first render.
	const [state, dispatch] = useReducer(notesReducer, initialNotesState, (initial) => ({
		...initial,
		notes: loadNotes(),
	}));

	// Color for the next note the user creates.
	const [newNoteColor, setNewNoteColor] = useState<NoteColor>(NoteColor.Green);

	useEffect(() => {
		saveNotes(state.notes);
	}, [state.notes]);

	return (
		<div className={styles.app}>
			<Header
				noteCount={state.notes.length}
				newNoteColor={newNoteColor}
				onNewNoteColorChange={setNewNoteColor}
			/>
			<Board notes={state.notes} dispatch={dispatch} newNoteColor={newNoteColor} />
		</div>
	);
}

export default App;
