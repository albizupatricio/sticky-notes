import type { CSSProperties } from 'react';

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
			className={className ? `${styles.logo} ${className}` : styles.logo}
			style={{ '--size': `${size}px` } as CSSProperties}
			aria-hidden="true"
		/>
	);
}
