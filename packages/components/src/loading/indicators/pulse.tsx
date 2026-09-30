/**
 * The pulse figure: three concentric filled discs stacked largest-
 * first — no gaps, no strokes, no blur. The core is a solid
 * `currentColor` disc, the mid band a lighter filled area and the
 * outer band the lightest, so the whole thing reads as one continuous
 * "solid → light → lightest" target. Each disc breathes on its own,
 * the peak traveling outward (core → mid → outer) as a ripple; the
 * figure is sized in `em` so the footprint rides the size axis and
 * follows `currentColor` in both themes.
 */
export const LoadingPulseFigure = () => (
  <svg
    className="colox-loading__pulse"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle className="colox-loading__pulse-ring-outer" cx="12" cy="12" r="10" />
    <circle className="colox-loading__pulse-ring-inner" cx="12" cy="12" r="6.5" />
    <circle className="colox-loading__pulse-core" cx="12" cy="12" r="3" />
  </svg>
);
