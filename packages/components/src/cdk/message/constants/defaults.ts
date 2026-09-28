/** The default auto-dismiss window (ms). Overridable per message. */
export const DEFAULT_DURATION = 3000;

/**
 * The exit window (ms): after a dismiss the message stays mounted for
 * this long while the CSS plays the out-animation, then the store
 * removes it. The runtime mirror of `--colox-motion-duration-normal`;
 * the CSS duration must stay in lockstep.
 */
export const DEFAULT_EXIT = 200;

/**
 * The default scope: the screen-wide container the imperative faces
 * (`Toast.…` / `Notify.…`) route into when no `{ scope }` is given.
 */
export const ROOT_SCOPE = 'root';
