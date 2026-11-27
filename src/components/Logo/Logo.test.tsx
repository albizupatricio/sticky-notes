import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Logo } from './Logo';

describe('Logo', () => {
	it('is decorative, so screen readers skip it', () => {
		expect(renderToStaticMarkup(<Logo />)).toContain('aria-hidden="true"');
	});

	it('scales with the size prop', () => {
		expect(renderToStaticMarkup(<Logo size={64} />)).toContain('--size:64px');
	});
});
