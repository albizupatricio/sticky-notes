import { useEffect, useReducer } from 'react';

import { Board } from './components/Board/Board';
import { initialNotesState, notesReducer } from './model/notesReducer';
import { loadNotes, saveNotes } from './model/notesStorage';

import styles from './App.module.css';

function App() {
	// Lazy initializer: reads storage once, on the first render.
	const [state, dispatch] = useReducer(notesReducer, initialNotesState, (initial) => ({
		...initial,
		notes: loadNotes(),
	}));

	useEffect(() => {
		saveNotes(state.notes);
	}, [state.notes]);

	return (
		<div className={styles.app}>
			<header className={styles.header}>
				<h1 className={styles.title}>Sticky Notes</h1>
			</header>
			<Board notes={state.notes} dispatch={dispatch} />
		</div>
	);
}

export default App;
