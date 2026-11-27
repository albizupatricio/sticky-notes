import {
	type Dispatch,
	type FocusEvent,
	type KeyboardEvent,
	memo,
	type PointerEvent,
	useRef,
	useState,
} from 'react';

import { usePointerDrag } from '../../hooks/usePointerDrag';
import { clamp, clampToBoard, type Size } from '../../lib/geometry';
import { MIN_NOTE_SIZE } from '../../model/noteSizes';
import {
	type Note as NoteModel,
	type NoteAction,
	NoteActionType,
	type Point,
} from '../../model/types';
import { ColorPicker } from '../ColorPicker/ColorPicker';
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
	/** Opens the note in edit mode when it mounts (for newly created notes). */
	startEditing: boolean;
};

/** Pointer movement below this many pixels is a click, not a drag. */
const DRAG_THRESHOLD = 3;

export const Note = memo(function Note({
	note,
	zIndex,
	dispatch,
	getBoardSize,
	isOverTrash,
	onTrashStateChange,
	startEditing,
}: NoteProps) {
	// Live values while the pointer is down; the reducer is updated once, on release.
	const [dragOffset, setDragOffset] = useState<Point | null>(null);
	const [liveSize, setLiveSize] = useState<Size | null>(null);
	const [isOverTrashNow, setOverTrashNow] = useState(false);
	const [isEditing, setEditing] = useState(startEditing);

	// Last trash state shown during this drag. Releasing while it's Active deletes the note.
	const trashStateRef = useRef<TrashState>(TrashState.Idle);
	// Set by Escape, so the blur that follows discards the changes instead of saving them.
	const discardEditRef = useRef(false);

	const raise = () => dispatch({ type: NoteActionType.Raise, id: note.id });

	const updateTrash = (state: TrashState) => {
		// Skip repeated values, so moving the pointer doesn't re-render on every event.
		if (trashStateRef.current === state) return;
		trashStateRef.current = state;
		setOverTrashNow(state === TrashState.Active);
		onTrashStateChange(state);
	};

	const startDrag = usePointerDrag({
		onMove: (delta, pointer) => {
			// Ignore tiny movements, so clicks and double-clicks don't lift the note.
			if (!dragOffset && Math.hypot(delta.x, delta.y) < DRAG_THRESHOLD) return;
			setDragOffset(delta);
			updateTrash(isOverTrash(pointer) ? TrashState.Active : TrashState.Ready);
		},
		onEnd: (delta) => {
			// Delete only if the trash was showing "Release to delete".
			const shouldDelete = trashStateRef.current === TrashState.Active;
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
			dispatch({ type: NoteActionType.Resize, id: note.id, ...sizeFrom(delta) });
		},
		onCancel: () => setLiveSize(null),
	});

	const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
		if (event.button !== 0) return;
		raise();
		startDrag(event);
	};

	const handleResizePointerDown = (event: PointerEvent<HTMLElement>) => {
		// Stop the note's own pointerdown from starting a move at the same time.
		event.stopPropagation();
		raise();
		startResize(event);
	};

	/** Puts the caret at the end instead of the start. */
	const handleTextFocus = (event: FocusEvent<HTMLTextAreaElement>) => {
		const end = event.currentTarget.value.length;
		event.currentTarget.setSelectionRange(end, end);
	};

	const handleTextBlur = (event: FocusEvent<HTMLTextAreaElement>) => {
		setEditing(false);
		if (discardEditRef.current) {
			discardEditRef.current = false;
			return;
		}
		const text = event.currentTarget.value;
		if (text !== note.text) {
			dispatch({ type: NoteActionType.SetText, id: note.id, text });
		}
	};

	const handleTextKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Escape') {
			discardEditRef.current = true;
			event.currentTarget.blur();
		} else if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
			event.currentTarget.blur();
		}
	};

	const x = note.x + (dragOffset?.x ?? 0);
	const y = note.y + (dragOffset?.y ?? 0);
	const { width, height } = liveSize ?? note;
	const className = [
		styles.note,
		dragOffset && styles.dragging,
		isOverTrashNow && styles.overTrash,
		isEditing && styles.editing,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<article
			className={className}
			onPointerDown={handlePointerDown}
			onDoubleClick={() => setEditing(true)}
			style={{
				transform: `translate(${x}px, ${y}px)`,
				width,
				height,
				background: `var(--note-${note.color})`,
				zIndex,
			}}
		>
			{isEditing ? (
				<textarea
					className={`${styles.text} ${styles.editor}`}
					defaultValue={note.text}
					autoFocus
					aria-label="Note text"
					onFocus={handleTextFocus}
					onBlur={handleTextBlur}
					onKeyDown={handleTextKeyDown}
					// Let the textarea handle the pointer (caret, selection) instead of starting a drag.
					onPointerDown={(event) => event.stopPropagation()}
				/>
			) : (
				<p className={note.text ? styles.text : `${styles.text} ${styles.placeholder}`}>
					{note.text || 'Double-click to write'}
				</p>
			)}
			<div className={styles.colors}>
				<ColorPicker
					value={note.color}
					onChange={(color) => dispatch({ type: NoteActionType.SetColor, id: note.id, color })}
				/>
			</div>
			<span
				className={styles.resizeHandle}
				onPointerDown={handleResizePointerDown}
				aria-hidden="true"
			/>
		</article>
	);
});
