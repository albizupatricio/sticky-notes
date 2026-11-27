/**
 * Combines CSS Module classes, skipping the ones whose condition is false:
 * combineStyles(styles.note, isDragging && styles.dragging) → 'note dragging'.
 */
export function combineStyles(...classes: (string | false | null | undefined)[]): string {
	return classes.filter(Boolean).join(' ');
}
