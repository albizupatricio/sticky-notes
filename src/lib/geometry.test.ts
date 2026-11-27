import { describe, expect, it } from 'vitest';

import { clamp, clampToBoard, distanceToRect, rectFromPoints } from './geometry';

describe('geometry', () => {
	it('clamps a value to a range', () => {
		expect(clamp(-5, 0, 10)).toBe(0);
		expect(clamp(5, 0, 10)).toBe(5);
		expect(clamp(15, 0, 10)).toBe(10);
	});

	it('keeps a rect inside the board', () => {
		const board = { width: 500, height: 400 };
		expect(clampToBoard({ x: -20, y: 390, width: 100, height: 50 }, board)).toEqual({
			x: 0,
			y: 350,
			width: 100,
			height: 50,
		});
	});

	it('builds the same rect whatever direction the user dragged in', () => {
		const expected = { x: 10, y: 20, width: 90, height: 60 };
		expect(rectFromPoints({ x: 10, y: 20 }, { x: 100, y: 80 })).toEqual(expected);
		expect(rectFromPoints({ x: 100, y: 80 }, { x: 10, y: 20 })).toEqual(expected);
	});

	it('measures the distance to a rect, 0 when inside', () => {
		const rect = { x: 0, y: 0, width: 100, height: 100 };
		expect(distanceToRect({ x: 50, y: 50 }, rect)).toBe(0);
		expect(distanceToRect({ x: 130, y: 50 }, rect)).toBe(30);
		expect(distanceToRect({ x: 103, y: 104 }, rect)).toBe(5);
	});
});
