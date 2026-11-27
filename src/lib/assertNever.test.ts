import { describe, expect, it } from 'vitest';

import { assertNever } from './assertNever';

describe('assertNever', () => {
	it('throws with the unexpected value in the message', () => {
		// At runtime a value can still slip through (for example, bad data); the cast simulates that.
		expect(() => assertNever({ type: 'unknown' } as never)).toThrow(
			'Unhandled value: {"type":"unknown"}',
		);
	});
});
