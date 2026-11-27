import type { Rect } from '../state/types';

export type Size = { readonly width: number; readonly height: number };

/** Returns the rect moved so it stays fully inside a board of the given size. */
export function clampToBoard(rect: Rect, board: Size): Rect {
	const maxX = Math.max(0, board.width - rect.width);
	const maxY = Math.max(0, board.height - rect.height);
	return {
		...rect,
		x: Math.min(Math.max(rect.x, 0), maxX),
		y: Math.min(Math.max(rect.y, 0), maxY),
	};
}
