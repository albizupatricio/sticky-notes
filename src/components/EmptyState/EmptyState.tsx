import { Logo } from '../Logo/Logo';

import styles from './EmptyState.module.css';

export function EmptyState() {
	return (
		<div className={styles.empty}>
			<Logo size={64} className={styles.logo} />
			<div className={styles.copy}>
				<h2 className={styles.title}>Start with a note</h2>
				<p className={styles.text}>
					Drag anywhere on the board to draw one the size you want, double-click for a quick one, or
					use Add note in the header.
				</p>
			</div>
			<p className={styles.saved}>
				<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
					<path
						d="M5 12l5 5L19 7"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
				Your notes are saved in this browser automatically.
			</p>
		</div>
	);
}
