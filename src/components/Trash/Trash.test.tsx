import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Trash } from './Trash';
import { TrashState } from './trashState';

const markupFor = (state: TrashState) =>
	renderToStaticMarkup(<Trash ref={null} state={state} zIndex={1} />);

describe('Trash', () => {
	it('shows no label while idle', () => {
		expect(markupFor(TrashState.Idle)).not.toContain('delete</span>');
	});

	it('invites a drop when a note is near', () => {
		expect(markupFor(TrashState.Ready)).toContain('Drop here to delete');
	});

	it('warns before deleting when a note is over it', () => {
		expect(markupFor(TrashState.Active)).toContain('Release to delete');
	});
});
