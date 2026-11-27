import type { CSSProperties } from 'react';

import { NoteColor } from '../../model/types';

import styles from './ColorPicker.module.css';

const COLORS = Object.values(NoteColor);

type ColorPickerProps = {
	value: NoteColor;
	onChange: (color: NoteColor) => void;
};

/** Row of color swatches. Stops pointer events so using it never drags or edits the note. */
export function ColorPicker({ value, onChange }: ColorPickerProps) {
	return (
		<div
			className={styles.picker}
			role="radiogroup"
			aria-label="Note color"
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
					style={{ '--swatch': `var(--note-${color})` } as CSSProperties}
					onClick={() => onChange(color)}
				>
					<span className={styles.dot} />
				</button>
			))}
		</div>
	);
}
