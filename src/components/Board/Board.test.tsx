import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { type Note, NoteColor } from '../../model/types';
import { Board } from './Board';

const note = (id: string): Note => ({
	id,
	x: 0,
	y: 0,
	width: 200,
	height: 160,
	color: NoteColor.Green,
	text: id,
});

const renderBoard = (notes: Note[], isLoading = false) =>
	renderToStaticMarkup(
		<Board
			notes={notes}
			dispatch={() => {}}
			newNoteColor={NoteColor.Green}
			isLoading={isLoading}
		/>,
	);

describe('Board', () => {
	it('shows the loading state while notes load', () => {
		const html = renderBoard([], true);
		expect(html).toContain('Loading your notes');
		expect(html).not.toContain('Start with a note');
	});

	it('shows the empty state when there are no notes', () => {
		expect(renderBoard([])).toContain('Start with a note');
	});

	it('renders one note per item, without the empty state', () => {
		const html = renderBoard([note('a'), note('b')]);
		expect(html.match(/<article/g)).toHaveLength(2);
		expect(html).not.toContain('Start with a note');
	});

	it('always offers the keyboard way to add a note', () => {
		expect(renderBoard([])).toContain('Add note');
	});
});
