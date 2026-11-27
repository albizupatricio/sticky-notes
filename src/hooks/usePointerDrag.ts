import { type PointerEvent as ReactPointerEvent, useEffect, useRef } from 'react';

import type { Point } from '../model/types';

type DragHandlers = {
	/** Called on every pointer move. `pointer` is in viewport coordinates. */
	onMove?: (delta: Point, pointer: Point) => void;
	/** Called once when the pointer is released. */
	onEnd?: (delta: Point, pointer: Point) => void;
	/** Called when the drag is cancelled (Escape, or the browser takes the pointer away). */
	onCancel?: () => void;
};

/**
 * Shared drag logic for move, resize and create.
 * Uses pointer capture so the drag keeps working when the pointer leaves the element.
 */
export function usePointerDrag(handlers: DragHandlers) {
	// Keep the latest handlers without re-creating the listeners on every render.
	const handlersRef = useRef(handlers);
	useEffect(() => {
		handlersRef.current = handlers;
	});

	return (event: ReactPointerEvent<HTMLElement>) => {
		if (event.button !== 0) return; // Primary button only.

		// Stop text selection and the browser's native drag from stealing the pointer.
		event.preventDefault();

		// preventDefault also keeps focus where it was, so finish any edit in progress.
		if (document.activeElement instanceof HTMLElement) document.activeElement.blur();

		const target = event.currentTarget;
		const pointerId = event.pointerId;
		const start: Point = { x: event.clientX, y: event.clientY };
		target.setPointerCapture(pointerId);

		const deltaFrom = (e: PointerEvent): Point => ({
			x: e.clientX - start.x,
			y: e.clientY - start.y,
		});

		const pointerOf = (e: PointerEvent): Point => ({ x: e.clientX, y: e.clientY });

		const cleanup = () => {
			// Remove listeners before releasing capture, so releasing doesn't trigger a cancel.
			target.removeEventListener('pointermove', handleMove);
			target.removeEventListener('pointerup', handleUp);
			target.removeEventListener('pointercancel', handleCancel);
			target.removeEventListener('lostpointercapture', handleCancel);
			window.removeEventListener('keydown', handleKeyDown);
			if (target.hasPointerCapture(pointerId)) {
				target.releasePointerCapture(pointerId);
			}
		};

		const handleMove = (e: PointerEvent) =>
			handlersRef.current.onMove?.(deltaFrom(e), pointerOf(e));

		const handleUp = (e: PointerEvent) => {
			cleanup();
			handlersRef.current.onEnd?.(deltaFrom(e), pointerOf(e));
		};

		const handleCancel = () => {
			cleanup();
			handlersRef.current.onCancel?.();
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') handleCancel();
		};

		target.addEventListener('pointermove', handleMove);
		target.addEventListener('pointerup', handleUp);
		target.addEventListener('pointercancel', handleCancel);
		target.addEventListener('lostpointercapture', handleCancel);
		window.addEventListener('keydown', handleKeyDown);
	};
}
