import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Loading } from './Loading';

describe('Loading', () => {
	it('announces the loading state to screen readers', () => {
		const html = renderToStaticMarkup(<Loading />);
		expect(html).toContain('role="status"');
		expect(html).toContain('Loading your notes');
	});
});
