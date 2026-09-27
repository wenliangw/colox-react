/**
 * The drawer exit window: the runtime mirror of
 * `--colox-motion-duration-normal` — the Overlay keeps the layer
 * mounted for this long after the close edge and the panel plays its
 * slide-out across the window (the CSS duration must stay in
 * lockstep). The slide is a full-panel translation, so it rides the
 * normal (200ms) motion tier — longer than the Modal's 100ms fade.
 */
export const DRAWER_EXIT = 200;
