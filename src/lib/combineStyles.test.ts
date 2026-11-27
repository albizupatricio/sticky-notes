import { describe, expect, it } from 'vitest';

import { combineStyles } from './combineStyles';

describe('combineStyles', () => {
	it('keeps only the classes whose condition is true', () => {
		expect(combineStyles('note', false, 'dragging', null, undefined)).toBe('note dragging');
	});

	it('returns an empty string when nothing applies', () => {
		expect(combineStyles(false, undefined)).toBe('');
	});
});
