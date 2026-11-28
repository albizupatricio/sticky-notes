import {
	type AnimationEvent,
	type Dispatch,
	type FocusEvent,
	type KeyboardEvent,
	memo,
	type PointerEvent,
	useRef,
	useState,
} from 'react';

import { usePointerDrag } from '../../hooks/usePointerDrag';
import { combineStyles } from '../../lib/combineStyles';
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
	/** Distance from a point in viewport coordinates to the trash; 0 when over it. */
	getTrashDistance: (pointer: Point) => number;
	onTrashStateChange: (state: TrashState) => void;
	/** Opens the note in edit mode when it mounts (for newly created notes). */
	startEditing: boolean;
	/** Id of the hidden text that explains the keyboard shortcuts. */
	helpId: string;
	/** Called when a focused note is deleted, so the board can keep keyboard focus. */
	onFocusedDelete: () => void;
};

/** Pointer movement below this many pixels is a click, not a drag. */
const DRAG_THRESHOLD = 3;

/** How close (in px) a dragged note must get before the trash expands. */
const TRASH_NEAR_DISTANCE = 160;

/** Arrow-key move step, in px; Shift uses the large one (one grid cell). */
const KEY_STEP = 4;
const KEY_STEP_LARGE = 24;

export const Note = memo(function Note({
	note,
	zIndex,
	dispatch,
	getBoardSize,
	getTrashDistance,
	onTrashStateChange,
	startEditing,
	helpId,
	onFocusedDelete,
}: NoteProps) {
	// Live values while the pointer is down; the reducer is updated once, on release.
	const [dragOffset, setDragOffset] = useState<Point | null>(null);
	const [liveSize, setLiveSize] = useState<Size | null>(null);
	const [isOverTrash, setOverTrash] = useState(false);
	const [isEditing, setEditing] = useState(startEditing);
	const [isDeleting, setDeleting] = useState(false);

	// Last trash state shown during this drag. Releasing while it's Active deletes the note.
	const trashStateRef = useRef<TrashState>(TrashState.Idle);
	// Set by Escape, so the blur that follows discards the changes instead of saving them.
	const discardEditRef = useRef(false);
	// Whether the pointer crossed the drag threshold. A ref, not state, so the release handler
	// sees it right away, even if the user lets go before React re-renders.
	const hasMovedRef = useRef(false);
	const articleRef = useRef<HTMLElement>(null);

	const raise = () => dispatch({ type: NoteActionType.Raise, id: note.id });

	const updateTrash = (state: TrashState) => {
		// Skip repeated values, so moving the pointer doesn't re-render on every event.
		if (trashStateRef.current === state) return;
		trashStateRef.current = state;
		setOverTrash(state === TrashState.Active);
		onTrashStateChange(state);
	};

	const trashStateFor = (pointer: Point): TrashState => {
		const distance = getTrashDistance(pointer);
		if (distance === 0) return TrashState.Active;
		return distance < TRASH_NEAR_DISTANCE ? TrashState.Ready : TrashState.Idle;
	};

	const startDrag = usePointerDrag({
		onMove: (delta, pointer) => {
			// Ignore tiny movements, so clicks and double-clicks don't lift the note.
			if (!hasMovedRef.current && Math.hypot(delta.x, delta.y) < DRAG_THRESHOLD) return;
			hasMovedRef.current = true;
			setDragOffset(delta);
			updateTrash(trashStateFor(pointer));
		},
		onEnd: (delta) => {
			if (!hasMovedRef.current) return;
			hasMovedRef.current = false;

			const shouldDelete = trashStateRef.current === TrashState.Active;
			updateTrash(TrashState.Idle);
			if (shouldDelete) {
				setDragOffset(delta);
				setDeleting(true);
				return;
			}
			setDragOffset(null);
			const target = clampToBoard(
				{ ...note, x: note.x + delta.x, y: note.y + delta.y },
				getBoardSize(),
			);
			dispatch({ type: NoteActionType.Move, id: note.id, x: target.x, y: target.y });
		},
		onCancel: () => {
			hasMovedRef.current = false;
			setDragOffset(null);
			updateTrash(TrashState.Idle);
		},
	});

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

	const handleAnimationEnd = (event: AnimationEvent<HTMLElement>) => {
		// Only the note's own exit animation, not one bubbling up from a child.
		if (!isDeleting || event.target !== event.currentTarget) return;
		// If this note had focus, let the board keep it so keyboard users aren't sent back to the top.
		if (document.activeElement === articleRef.current) onFocusedDelete();
		dispatch({ type: NoteActionType.Delete, id: note.id });
	};

	const moveBy = (dx: number, dy: number) => {
		const target = clampToBoard({ ...note, x: note.x + dx, y: note.y + dy }, getBoardSize());
		dispatch({ type: NoteActionType.Move, id: note.id, x: target.x, y: target.y });
	};

	const resizeBy = (dw: number, dh: number) => {
		dispatch({ type: NoteActionType.Resize, id: note.id, ...sizeFrom({ x: dw, y: dh }) });
	};

	const handleNoteKeyDown = (event: KeyboardEvent<HTMLElement>) => {
		// Keys typed in the textarea or on the color buttons belong to them.
		if (event.target !== event.currentTarget) return;
		const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP;

		const nudge = event.altKey ? resizeBy : moveBy;
		const actions: Record<string, () => void> = {
			Enter: () => setEditing(true),
			Delete: () => setDeleting(true),
			Backspace: () => setDeleting(true),
			ArrowLeft: () => nudge(-step, 0),
			ArrowRight: () => nudge(step, 0),
			ArrowUp: () => nudge(0, -step),
			ArrowDown: () => nudge(0, step),
		};
		const action = actions[event.key];
		if (!action) return;
		// Stop the page from scrolling with the arrows.
		event.preventDefault();
		action();
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
		const text = event.currentTarget.value.trim();
		if (text !== note.text) {
			dispatch({ type: NoteActionType.SetText, id: note.id, text });
		}
	};

	const handleTextKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		const isSave = event.key === 'Enter' && (event.metaKey || event.ctrlKey);
		if (event.key !== 'Escape' && !isSave) return;
		if (event.key === 'Escape') discardEditRef.current = true;
		event.currentTarget.blur();
		// Give focus back to the note, so keyboard users can keep working with it.
		articleRef.current?.focus();
	};

	const x = note.x + (dragOffset?.x ?? 0);
	const y = note.y + (dragOffset?.y ?? 0);
	const { width, height } = liveSize ?? note;
	const className = combineStyles(
		styles.note,
		dragOffset && styles.dragging,
		isOverTrash && styles.overTrash,
		isEditing && styles.editing,
		isDeleting && styles.deleting,
	);

	return (
		<article
			ref={articleRef}
			className={className}
			tabIndex={0}
			aria-label={note.text ? `Note: ${note.text}` : 'Empty note'}
			aria-describedby={helpId}
			onPointerDown={handlePointerDown}
			onDoubleClick={() => setEditing(true)}
			onKeyDown={handleNoteKeyDown}
			onAnimationEnd={handleAnimationEnd}
			style={{
				// Position with `translate` (applied first), so scale and rotate never move the note.
				translate: `${x}px ${y}px`,
				width,
				height,
				background: `var(--note-${note.color})`,
				zIndex,
			}}
		>
			{isEditing ? (
				<textarea
					className={combineStyles(styles.text, styles.editor)}
					defaultValue={note.text}
					autoFocus
					aria-label="Note text. Click outside or press Command Enter to save, Escape to cancel."
					onFocus={handleTextFocus}
					onBlur={handleTextBlur}
					onKeyDown={handleTextKeyDown}
					// Let the textarea handle the pointer (caret, selection) instead of starting a drag.
					onPointerDown={(event) => event.stopPropagation()}
				/>
			) : (
				<p className={combineStyles(styles.text, !note.text && styles.placeholder)}>
					{note.text || 'Double-click to write'}
				</p>
			)}
			<div className={styles.colors}>
				<ColorPicker
					label="Note color"
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
