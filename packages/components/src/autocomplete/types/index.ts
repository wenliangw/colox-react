// The component contract map: every declaration under types/ in one
// barrel, split by the capability layer that owns it — component.ts
// (the root contract), controls.ts (rendered units), hooks.ts,
// children.ts and utils.ts. Internal barrel: units import from
// '../types'; the PUBLIC surface stays with the selective named
// exports in autocomplete/index.ts, so none of these internal names
// leak into @colox/react.
export * from './component';
export * from './children';
export * from './controls';
export * from './hooks';
export * from './utils';
