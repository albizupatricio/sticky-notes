import {
	type CSSProperties,
	type Dispatch,
	type MouseEvent,
	type PointerEvent,
	useCallback,
	useId,
	useMemo,
	useRef,
	useState,
} from 'react';

import { usePointerDrag } from '../../hooks/usePointerDrag';
import { clamp, clampToBoard, distanceToRect, rectFromPoints } from '../../lib/geometry';
import { DEFAULT_NOTE_SIZE, MIN_NOTE_SIZE } from '../../model/noteSizes';
import {
	type Note as NoteModel,
	type NoteAction,
	NoteActionType,
	NoteColor,
	type Point,
	type Rect,
} from '../../model/types';
import { EmptyState } from '../EmptyState/EmptyState';
import { Loading } from '../Loading/Loading';
import { Note } from '../Note/Note';
import { Trash } from '../Trash/Trash';
import { TrashState } from '../Trash/trashState';

import styles from './Board.module.css';

/** Pointer movement below this many pixels counts as a click, not a draw. */
const CLICK_TOLERANCE = 4;

type BoardProps = {
	notes: readonly NoteModel[];
	dispatch: Dispatch<NoteAction>;
	/** Color for notes created on the board. */
	newNoteColor: NoteColor;
	/** True while notes are loading: shows the loading state and blocks the board. */
	isLoading: boolean;
};

export function Board({ notes, dispatch, newNoteColor, isLoading }: BoardProps) {
	const boardRef = useRef<HTMLElement>(null);
	// Where the draw started, relative to the board.
	const drawStartRef = useRef<Point>({ x: 0, y: 0 });
	// The rectangle being drawn. UI-only, so it lives here and not in the reducer.
	const [draft, setDraft] = useState<Rect | null>(null);

	const trashRef = useRef<HTMLDivElement>(null);

	// One hidden help text for every note, linked with aria-describedby.
	const helpId = useId();

	// Drives how the trash looks while notes are dragged.
	const [trashState, setTrashState] = useState<TrashState>(TrashState.Idle);

	// The note just created, so it opens ready to type.
	const [newNoteId, setNewNoteId] = useState<string | null>(null);

	/** Distance from a point in viewport coordinates to the trash; 0 when over it. */
	const getTrashDistance = useCallback((pointer: Point) => {
		const trash = trashRef.current;
		return trash ? distanceToRect(pointer, trash.getBoundingClientRect()) : Infinity;
	}, []);

	const getBoardSize = useCallback(() => {
		const board = boardRef.current;
		return { width: board?.clientWidth ?? 0, height: board?.clientHeight ?? 0 };
	}, []);

	/** Keeps keyboard focus on the board when a focused note is deleted. */
	const focusBoard = useCallback(() => boardRef.current?.focus(), []);

	// Stable DOM order, so raising a note doesn't move its node and release pointer capture.
	const renderOrder = useMemo(() => [...notes].sort((a, b) => a.id.localeCompare(b.id)), [notes]);
	const zIndexById = useMemo(() => new Map(notes.map((note, i) => [note.id, i])), [notes]);

	const createNote = (rect: Rect) => {
		const sized = {
			...rect,
			width: Math.max(rect.width, MIN_NOTE_SIZE.width),
			height: Math.max(rect.height, MIN_NOTE_SIZE.height),
		};
		const id = crypto.randomUUID();
		setNewNoteId(id);
		dispatch({
			type: NoteActionType.Create,
			note: {
				...clampToBoard(sized, getBoardSize()),
				id,
				color: newNoteColor,
				text: '',
			},
		});
	};

	const draftFrom = (delta: Point): Rect => {
		const board = getBoardSize();
		const start = drawStartRef.current;
		const end = {
			x: clamp(start.x + delta.x, 0, board.width),
			y: clamp(start.y + delta.y, 0, board.height),
		};
		return rectFromPoints(start, end);
	};

	const startDraw = usePointerDrag({
		onMove: (delta) => setDraft(draftFrom(delta)),
		onEnd: (delta) => {
			setDraft(null);
			const rect = draftFrom(delta);
			// A click without movement isn't a draw.
			if (rect.width < CLICK_TOLERANCE && rect.height < CLICK_TOLERANCE) return;
			createNote(rect);
		},
		onCancel: () => setDraft(null),
	});

	/** Board coordinates of a pointer event. */
	const toBoardPoint = (event: MouseEvent<HTMLElement>): Point => {
		const bounds = event.currentTarget.getBoundingClientRect();
		return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
	};

	const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
		// Only empty board space starts a draw; notes handle their own pointer events.
		if (event.target !== event.currentTarget) return;
		drawStartRef.current = toBoardPoint(event);
		startDraw(event);
	};

	const handleDoubleClick = (event: MouseEvent<HTMLElement>) => {
		if (event.target !== event.currentTarget) return;
		const point = toBoardPoint(event);
		createNote({
			...DEFAULT_NOTE_SIZE,
			x: point.x - DEFAULT_NOTE_SIZE.width / 2,
			y: point.y - DEFAULT_NOTE_SIZE.height / 2,
		});
	};

	/** Adds a default-size note in the middle of the board (keyboard path). */
	const addCenteredNote = () => {
		const board = getBoardSize();
		createNote({
			...DEFAULT_NOTE_SIZE,
			x: (board.width - DEFAULT_NOTE_SIZE.width) / 2,
			y: (board.height - DEFAULT_NOTE_SIZE.height) / 2,
		});
	};

	return (
		<main
			ref={boardRef}
			className={styles.board}
			aria-label="Board"
			tabIndex={-1}
			onPointerDown={handlePointerDown}
			onDoubleClick={handleDoubleClick}
		>
			{/* First in the tab order, so keyboard users can add a note before going through them all. */}
			<button
				type="button"
				className={styles.addButton}
				onClick={addCenteredNote}
				disabled={isLoading}
			>
				Add note
			</button>
			{isLoading ? <Loading /> : notes.length === 0 && !draft && <EmptyState />}
			{renderOrder.map((note) => (
				<Note
					key={note.id}
					note={note}
					zIndex={zIndexById.get(note.id) ?? 0}
					dispatch={dispatch}
					getBoardSize={getBoardSize}
					getTrashDistance={getTrashDistance}
					onTrashStateChange={setTrashState}
					onFocusedDelete={focusBoard}
					startEditing={note.id === newNoteId}
					helpId={helpId}
				/>
			))}
			{draft && (
				<div
					className={styles.draft}
					style={
						{
							translate: `${draft.x}px ${draft.y}px`,
							width: draft.width,
							height: draft.height,
							zIndex: notes.length,
							// Preview the color the new note will have.
							'--draft-color': `var(--note-${newNoteColor})`,
						} as CSSProperties
					}
				/>
			)}
			<p id={helpId} className={styles.srOnly}>
				Press Enter to edit, arrow keys to move, Alt and arrow keys to resize, Delete to remove.
				Hold Shift for bigger steps.
			</p>
			<Trash ref={trashRef} state={trashState} zIndex={notes.length + 1} />
		</main>
	);
}
