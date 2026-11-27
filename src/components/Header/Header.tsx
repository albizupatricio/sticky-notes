import type { NoteColor } from '../../model/types';
import { ColorPicker } from '../ColorPicker/ColorPicker';
import { Logo } from '../Logo/Logo';

import styles from './Header.module.css';

type HeaderProps = {
	noteCount: number;
	newNoteColor: NoteColor;
	onNewNoteColorChange: (color: NoteColor) => void;
};

export function Header({ noteCount, newNoteColor, onNewNoteColorChange }: HeaderProps) {
	return (
		<header className={styles.header}>
			<h1 className={styles.title}>
				<Logo className={styles.logo} />
				Sticky notes
				<span className={styles.count}>{noteCount}</span>
			</h1>
			<ColorPicker label="New note color" value={newNoteColor} onChange={onNewNoteColorChange} />
			<ul className={styles.hints}>
				<li>Drag on the board to add</li>
				<li>Double-click to edit, click outside to save</li>
				<li>
					<kbd className={styles.kbd}>Esc</kbd>
					Cancel
				</li>
			</ul>
		</header>
	);
}
