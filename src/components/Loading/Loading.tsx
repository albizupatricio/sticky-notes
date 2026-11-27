import styles from './Loading.module.css';

/** Covers the board while notes load, and blocks it so nothing is created before the data arrives. */
export function Loading() {
	return (
		<div className={styles.loading} aria-busy="true">
			<span className={styles.spinner} aria-hidden="true" />
			<div className={styles.copy}>
				<h2 role="status" className={styles.title}>
					Loading your notes
				</h2>
				<p className={styles.text}>Getting your board ready…</p>
			</div>
		</div>
	);
}
