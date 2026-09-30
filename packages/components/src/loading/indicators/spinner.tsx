/**
 * The spinner figure: a single long round-cap arc turning at a
 * constant pace — the classic busy wheel. Drawn as a dashed circle (a
 * single dash spanning about two thirds of the ring) so the arc keeps
 * its geometry at every footprint; the rotation itself is pure CSS (a
 * steady linear turn reads "running", an eased one reads "stuck").
 */
export const LoadingSpinnerFigure = () => (
  <svg
    className="colox-loading__spin"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      className="colox-loading__spin-arc"
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="38 18.55"
    />
  </svg>
);
