import type { CSSProperties } from 'react';

import { NoteColor } from '../../model/types';

import styles from './ColorPicker.module.css';

const COLORS = Object.values(NoteColor);

type ColorPickerProps = {
	value: NoteColor;
	onChange: (color: NoteColor) => void;
	/** Accessible name of the group, read by screen readers. */
	label: string;
};

/** Row of color swatches. Stops pointer events so using it never drags or edits a note. */
export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
	return (
		<div
			className={styles.picker}
			role="radiogroup"
			aria-label={label}
			onPointerDown={(event) => event.stopPropagation()}
			onDoubleClick={(event) => event.stopPropagation()}
		>
			{COLORS.map((color) => (
				<button
					key={color}
					type="button"
					role="radio"
					aria-checked={color === value}
					aria-label={color}
					className={styles.swatch}
					// One variable per swatch, used by both the dot and its selection ring.
					style={{ '--swatch': `var(--note-${color})` } as CSSProperties}
					onClick={() => onChange(color)}
				>
					<span className={styles.dot} />
				</button>
			))}
		</div>
	);
}
