import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { NoteColor } from '../../model/types';
import { ColorPicker } from './ColorPicker';

describe('ColorPicker', () => {
	it('renders one radio per color and marks the selected one', () => {
		const html = renderToStaticMarkup(
			<ColorPicker label="Note color" value={NoteColor.Sand} onChange={() => {}} />,
		);
		expect(html.match(/role="radio"/g)).toHaveLength(Object.values(NoteColor).length);
		expect(html).toContain('aria-checked="true" aria-label="sand"');
	});
});
