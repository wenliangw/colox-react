// The component contract map: every declaration under types/ in one
// barrel, split by the capability layer that owns it — component.ts
// (the root contract), hooks.ts, children.ts, utils.ts (context.ts /
// reducers.ts join when their layers appear). Internal barrel: units
// import from '../types'; the PUBLIC surface stays with the selective
// named exports in select/index.ts, so none of these internal names
// leak into @colox/react.
export * from './component';
export * from './hooks';
export * from './children';
export * from './utils';
