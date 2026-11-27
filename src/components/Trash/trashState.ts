/** What the trash shows: hidden-ish, ready for a drop, or about to delete. */
export const TrashState = { Idle: 'idle', Ready: 'ready', Active: 'active' } as const;
export type TrashState = (typeof TrashState)[keyof typeof TrashState];
