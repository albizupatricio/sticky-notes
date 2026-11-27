import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
	it('explains how to start and that notes are saved', () => {
		const html = renderToStaticMarkup(<EmptyState />);
		expect(html).toContain('<h2');
		expect(html).toContain('Start with a note');
		expect(html).toContain('saved in this browser automatically');
		expect(html).toContain('use Add note in the header');
	});
});
