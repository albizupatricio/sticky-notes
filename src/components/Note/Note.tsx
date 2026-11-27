import { type Dispatch, memo, type PointerEvent, useState } from 'react';

import { usePointerDrag } from '../../hooks/usePointerDrag';
import { clampToBoard, type Size } from '../../lib/geometry';
import {
	type Note as NoteModel,
	type NoteAction,
	NoteActionType,
	type Point,
} from '../../model/types';

import styles from './Note.module.css';

type NoteProps = {
	note: NoteModel;
	zIndex: number;
	dispatch: Dispatch<NoteAction>;
	getBoardSize: () => Size;
};

export const Note = memo(function Note({ note, zIndex, dispatch, getBoardSize }: NoteProps) {
	// Offset applied only while dragging; the reducer is updated once, on release.
	const [dragOffset, setDragOffset] = useState<Point | null>(null);

	const startDrag = usePointerDrag({
		onMove: (delta) => setDragOffset(delta),
		onEnd: (delta) => {
			setDragOffset(null);
			const target = clampToBoard(
				{ ...note, x: note.x + delta.x, y: note.y + delta.y },
				getBoardSize(),
			);
			dispatch({ type: NoteActionType.Move, id: note.id, x: target.x, y: target.y });
		},
		onCancel: () => setDragOffset(null),
	});

	const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
		dispatch({ type: NoteActionType.Raise, id: note.id });
		startDrag(event);
	};

	const x = note.x + (dragOffset?.x ?? 0);
	const y = note.y + (dragOffset?.y ?? 0);

	return (
		<article
			className={dragOffset ? `${styles.note} ${styles.dragging}` : styles.note}
			onPointerDown={handlePointerDown}
			style={{
				transform: `translate(${x}px, ${y}px)`,
				width: note.width,
				height: note.height,
				background: `var(--note-${note.color})`,
				zIndex,
			}}
		>
			<p className={styles.text}>{note.text}</p>
		</article>
	);
});
