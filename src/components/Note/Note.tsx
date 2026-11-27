import { type Dispatch, memo, type PointerEvent, useState } from 'react';

import { usePointerDrag } from '../../hooks/usePointerDrag';
import { clamp, clampToBoard, type Size } from '../../lib/geometry';
import { MIN_NOTE_SIZE } from '../../model/noteSizes';
import {
	type Note as NoteModel,
	type NoteAction,
	NoteActionType,
	type Point,
} from '../../model/types';
import { TrashState } from '../Trash/trashState';

import styles from './Note.module.css';

type NoteProps = {
	note: NoteModel;
	zIndex: number;
	dispatch: Dispatch<NoteAction>;
	getBoardSize: () => Size;
	/** Whether a point in viewport coordinates is over the trash. */
	isOverTrash: (pointer: Point) => boolean;
	/** Tells the board how the trash should look while this note is dragged. */
	onTrashStateChange: (state: TrashState) => void;
};

export const Note = memo(function Note({
	note,
	zIndex,
	dispatch,
	getBoardSize,
	isOverTrash,
	onTrashStateChange,
}: NoteProps) {
	// Live values while the pointer is down; the reducer is updated once, on release.
	const [dragOffset, setDragOffset] = useState<Point | null>(null);
	const [liveSize, setLiveSize] = useState<Size | null>(null);

	const [isOverTrashNow, setOverTrashNow] = useState(false);

	const updateTrash = (state: TrashState) => {
		setOverTrashNow(state === TrashState.Active);
		onTrashStateChange(state);
	};

	const raise = () => dispatch({ type: NoteActionType.Raise, id: note.id });

	const startDrag = usePointerDrag({
		onMove: (delta, pointer) => {
			setDragOffset(delta);
			updateTrash(isOverTrash(pointer) ? TrashState.Active : TrashState.Ready);
		},
		onEnd: (delta, pointer) => {
			// Check before resetting, while the trash still has its expanded size.
			const shouldDelete = isOverTrash(pointer);
			setDragOffset(null);
			updateTrash(TrashState.Idle);
			if (shouldDelete) {
				dispatch({ type: NoteActionType.Delete, id: note.id });
				return;
			}
			const target = clampToBoard(
				{ ...note, x: note.x + delta.x, y: note.y + delta.y },
				getBoardSize(),
			);
			dispatch({ type: NoteActionType.Move, id: note.id, x: target.x, y: target.y });
		},
		onCancel: () => {
			setDragOffset(null);
			updateTrash(TrashState.Idle);
		},
	});

	/** Size after growing by `delta`, kept above the minimum and inside the board. */
	const sizeFrom = (delta: Point): Size => {
		const board = getBoardSize();
		return {
			width: clamp(note.width + delta.x, MIN_NOTE_SIZE.width, board.width - note.x),
			height: clamp(note.height + delta.y, MIN_NOTE_SIZE.height, board.height - note.y),
		};
	};

	const startResize = usePointerDrag({
		onMove: (delta) => setLiveSize(sizeFrom(delta)),
		onEnd: (delta) => {
			setLiveSize(null);
			const size = sizeFrom(delta);
			dispatch({ type: NoteActionType.Resize, id: note.id, ...size });
		},
		onCancel: () => setLiveSize(null),
	});

	const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
		if (event.button !== 0) return;
		raise();
		// Lift the note right away, before the pointer moves.
		setDragOffset({ x: 0, y: 0 });
		startDrag(event);
	};

	const handleResizePointerDown = (event: PointerEvent<HTMLElement>) => {
		// Stop the note's own pointerdown from starting a move at the same time.
		event.stopPropagation();
		raise();
		startResize(event);
	};

	const x = note.x + (dragOffset?.x ?? 0);
	const y = note.y + (dragOffset?.y ?? 0);
	const { width, height } = liveSize ?? note;

	const className = [styles.note, dragOffset && styles.dragging, isOverTrashNow && styles.overTrash]
		.filter(Boolean)
		.join(' ');

	return (
		<article
			className={className}
			onPointerDown={handlePointerDown}
			style={{
				transform: `translate(${x}px, ${y}px)`,
				width,
				height,
				background: `var(--note-${note.color})`,
				zIndex,
			}}
		>
			<p className={styles.text}>{note.text}</p>
			<span
				className={styles.resizeHandle}
				onPointerDown={handleResizePointerDown}
				aria-hidden="true"
			/>
		</article>
	);
});
