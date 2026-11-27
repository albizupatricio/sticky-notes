import type { Point, Rect } from '../model/types';

export type Size = { readonly width: number; readonly height: number };

/** Limits `value` to the range [min, max]. */
export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

/** Returns the rect moved so it stays fully inside a board of the given size. */
export function clampToBoard(rect: Rect, board: Size): Rect {
	return {
		...rect,
		x: clamp(rect.x, 0, Math.max(0, board.width - rect.width)),
		y: clamp(rect.y, 0, Math.max(0, board.height - rect.height)),
	};
}

/** Returns the rect between two corners, whatever direction the user dragged in. */
export function rectFromPoints(a: Point, b: Point): Rect {
	return {
		x: Math.min(a.x, b.x),
		y: Math.min(a.y, b.y),
		width: Math.abs(a.x - b.x),
		height: Math.abs(a.y - b.y),
	};
}

/** Whether `point` is inside `rect`, edges included. */
export function pointInRect(point: Point, rect: Rect): boolean {
	return (
		point.x >= rect.x &&
		point.x <= rect.x + rect.width &&
		point.y >= rect.y &&
		point.y <= rect.y + rect.height
	);
}
