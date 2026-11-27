import styles from './App.module.css';

function App() {
	return (
		<div className={styles.app}>
			<header className={styles.header}>
				<h1 className={styles.title}>Sticky notes</h1>
			</header>
			<main className={styles.board} aria-label="Board" />
		</div>
	);
}

export default App;