import type { CSSProperties } from 'react';

import { combineStyles } from '../../lib/combineStyles';

import styles from './Logo.module.css';

type LogoProps = {
	/** Width and height of the front note, in pixels. */
	size?: number;
	className?: string;
};

/** Two stacked notes. Every measure scales with `size`, so the header and the empty board share one mark. */
export function Logo({ size = 16, className }: LogoProps) {
	return (
		<span
			className={combineStyles(styles.logo, className)}
			style={{ '--size': `${size}px` } as CSSProperties}
			aria-hidden="true"
		/>
	);
}
