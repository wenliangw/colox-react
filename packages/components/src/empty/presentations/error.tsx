import { useId } from 'react';

/**
 * The "failed" scene figure: a ringed planet with its moon, drifting
 * on a dashed orbit under a starfield. The subject stays far from
 * reality — a service anomaly read as a signal lost in space: the
 * glowing red planet, the translucent orange ring, the little moon on
 * the orbit, a starfield read by its sparseness — one keen bright star
 * and two soft distant ones. Decorative as a whole: no labels,
 * no interaction; the prose carries the meaning, the scene paints the
 * mood. Colors ride `--colox-empty-*` (red + orange tones) so light
 * and dark adapt for free; the gradient id rides `useId` so instances
 * never collide.
 */
export const ErrorEmptyFigure = () => {
  const planet = useId();
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 160 160"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${planet}-planet`} cx="0.5" cy="0.42" r="0.75">
          <stop offset="0" stopColor="var(--colox-empty-solid-red)" />
          <stop offset="1" stopColor="var(--colox-empty-wash-red)" />
        </radialGradient>
      </defs>
      {/* ambient halos */}
      <circle cx="34" cy="34" r="38" fill="var(--colox-empty-wash-red)" fillOpacity="0.5" />
      <circle cx="128" cy="128" r="30" fill="var(--colox-empty-wash-orange)" fillOpacity="0.45" />
      {/* the dashed orbit */}
      <circle
        cx="92"
        cy="66"
        r="48"
        stroke="var(--colox-empty-solid-orange)"
        strokeWidth="1.5"
        strokeDasharray="2 7"
        opacity="0.45"
      />
      {/* the ring: back band behind the planet, front band over it */}
      <path
        d="M48 66 A44 13 0 0 1 136 66 A37 9 0 0 0 48 66 Z"
        fill="var(--colox-empty-solid-orange)"
        fillOpacity="0.4"
      />
      <circle cx="92" cy="66" r="26" fill={`url(#${planet}-planet)`} />
      <path
        d="M136 66 A44 13 0 0 1 48 66 A37 9 0 0 0 136 66 Z"
        fill="var(--colox-empty-solid-orange)"
        fillOpacity="0.4"
      />
      {/* planet highlight */}
      <path
        d="M74 57 A20 20 0 0 1 108 54"
        stroke="var(--colox-color-bg-default)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* the little moon on the orbit */}
      <circle cx="50" cy="90" r="7" fill="var(--colox-empty-solid-orange)" />
      {/* the stars: one keen bright star and two soft distant ones —
          a starfield reads by its emptiness, so the sky stays sparse */}
      <path
        d="M118 18 L119.9 22.4 L124 24 L119.9 25.6 L118 30 L116.1 25.6 L112 24 L116.1 22.4 Z"
        fill="var(--colox-empty-solid-red)"
        fillOpacity="0.55"
      />
      <circle cx="34" cy="112" r="4" fill="var(--colox-empty-solid-orange)" fillOpacity="0.5" />
      <circle cx="146" cy="80" r="3" fill="var(--colox-empty-solid-orange)" fillOpacity="0.45" />
    </svg>
  );
};
