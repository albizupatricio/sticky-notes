import type { Ref } from 'react';

import { TrashState } from './trashState';

import styles from './Trash.module.css';

type TrashProps = {
	ref: Ref<HTMLDivElement>;
	state: TrashState;
	zIndex: number;
};

/** Drop target for deleting notes. It grows while a note is dragged; the board does the hit testing. */
export function Trash({ ref, state, zIndex }: TrashProps) {
	const className = [
		styles.trash,
		state !== TrashState.Idle && styles.expanded,
		state === TrashState.Active && styles.active,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div
			ref={ref}
			className={className}
			style={{ zIndex }}
			role="img"
			aria-label="Trash: drop a note here to delete it"
		>
			<span className={styles.icon} aria-hidden="true" />
			{state !== TrashState.Idle && (
				<span className={styles.label}>
					{state === TrashState.Active ? 'Release to delete' : 'Drop here to delete'}
				</span>
			)}
		</div>
	);
}
