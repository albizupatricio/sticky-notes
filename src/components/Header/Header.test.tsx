import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { NoteColor } from '../../model/types';
import { Header } from './Header';

describe('Header', () => {
	const html = renderToStaticMarkup(
		<Header noteCount={3} newNoteColor={NoteColor.Rose} onNewNoteColorChange={() => {}} />,
	);

	it('shows the title as the page heading', () => {
		expect(html).toContain('<h1');
		expect(html).toContain('Sticky notes');
	});

	it('shows the note count', () => {
		expect(html).toContain('>3</span>');
	});

	it('includes the picker for the new note color, with the current one selected', () => {
		expect(html).toContain('aria-label="New note color"');
		expect(html).toContain('aria-checked="true" aria-label="rose"');
	});
});
