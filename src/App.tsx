import { useReducer } from 'react';

import { Board } from './components/Board/Board';
import { initialNotesState, notesReducer } from './model/notesReducer';

import styles from './App.module.css';

function App() {
	const [state, dispatch] = useReducer(notesReducer, initialNotesState);

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
