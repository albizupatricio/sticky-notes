import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { type Note as NoteModel, NoteColor } from '../../model/types';
import { Note } from './Note';

const note: NoteModel = {
	id: 'a',
	x: 40,
	y: 60,
	width: 200,
	height: 160,
	color: NoteColor.Sand,
	text: 'Buy milk',
};

/** Renders a note with no-op callbacks; only the markup matters here. */
const renderNote = (changes: Partial<NoteModel> = {}, startEditing = false) =>
	renderToStaticMarkup(
		<Note
			note={{ ...note, ...changes }}
			zIndex={1}
			dispatch={() => {}}
			getBoardSize={() => ({ width: 1000, height: 800 })}
			getTrashDistance={() => Infinity}
			onTrashStateChange={() => {}}
			startEditing={startEditing}
			helpId="help"
		/>,
	);

describe('Note', () => {
	it('shows its text and names itself after it for screen readers', () => {
		const html = renderNote();
		expect(html).toContain('Buy milk');
		expect(html).toContain('aria-label="Note: Buy milk"');
	});

	it('is placed, sized and colored from the model', () => {
		const html = renderNote();
		expect(html).toContain('translate:40px 60px');
		expect(html).toContain('width:200px');
		expect(html).toContain('var(--note-sand)');
	});

	it('is focusable and linked to the keyboard help', () => {
		const html = renderNote();
		expect(html).toContain('tabindex="0"');
		expect(html).toContain('aria-describedby="help"');
	});

	it('shows a placeholder when empty', () => {
		const html = renderNote({ text: '' });
		expect(html).toContain('Double-click to write');
		expect(html).toContain('aria-label="Empty note"');
	});

	it('opens in edit mode when created', () => {
		const html = renderNote({}, true);
		expect(html).toContain('<textarea');
	});
});
