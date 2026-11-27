import { memo } from 'react';

import type { Note as NoteModel } from '../../state/types';

import styles from './Note.module.css';

type NoteProps = {
	note: NoteModel;
};

export const Note = memo(function Note({ note }: NoteProps) {
	return (
		<article
			className={styles.note}
			style={{
				transform: `translate(${note.x}px, ${note.y}px)`,
				width: note.width,
				height: note.height,
				background: `var(--note-${note.color})`,
			}}
		>
			<p className={styles.text}>{note.text}</p>
		</article>
	);
});
