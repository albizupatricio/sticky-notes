import type { Ref } from 'react';

import { combineStyles } from '../../lib/combineStyles';
import { TrashState } from './trashState';

import styles from './Trash.module.css';

type TrashProps = {
	ref: Ref<HTMLDivElement>;
	state: TrashState;
	zIndex: number;
};

/** Drop target for deleting notes. It grows when a dragged note gets close; the board does the hit testing. */
export function Trash({ ref, state, zIndex }: TrashProps) {
	const className = combineStyles(
		styles.trash,
		state !== TrashState.Idle && styles.expanded,
		state === TrashState.Active && styles.active,
	);

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
