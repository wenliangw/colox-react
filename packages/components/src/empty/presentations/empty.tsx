import { useId } from 'react';

/**
 * The "no data" scene figure: a soft folder with paper pages peeking
 * out and a data sheet drifting off, resting on a soft ground shadow
 * under an ambient sky. The subject stays close to the "no data"
 * story — files, folders, data: the flying sheet carries a tiny
 * bar-chart. Decorative as a whole: no labels, no interaction; the
 * prose carries the meaning, the scene paints the mood. Colors ride
 * `--colox-empty-*` (blue + orange tones) so light and dark adapt for
 * free; the gradient id rides `useId` so instances never collide.
 */
export const EmptyDataFigure = () => {
  const folder = useId();
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
        <linearGradient
          id={`${folder}-folder`}
          x1="44"
          y1="58"
          x2="44"
          y2="110"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="var(--colox-empty-panel)" />
          <stop offset="1" stopColor="var(--colox-empty-faint)" />
        </linearGradient>
      </defs>
      {/* ambient halos */}
      <circle cx="34" cy="30" r="42" fill="var(--colox-empty-wash-blue)" fillOpacity="0.5" />
      <circle cx="128" cy="126" r="30" fill="var(--colox-empty-wash-orange)" fillOpacity="0.45" />
      {/* ground shadow */}
      <ellipse
        cx="80"
        cy="138"
        rx="46"
        ry="7"
        fill="var(--colox-empty-shadow)"
        fillOpacity="0.35"
      />
      {/* the folder: back panel with pages tucked in, front pocket with tab */}
      <rect x="44" y="58" width="72" height="52" rx="6" fill={`url(#${folder}-folder)`} />
      <rect
        x="66"
        y="54"
        width="42"
        height="32"
        rx="4"
        fill="var(--colox-color-bg-default)"
        stroke="var(--colox-empty-faint)"
        strokeOpacity="0.9"
      />
      <rect
        x="54"
        y="50"
        width="42"
        height="32"
        rx="4"
        fill="var(--colox-color-bg-default)"
        stroke="var(--colox-empty-faint)"
        strokeOpacity="0.9"
      />
      <rect x="59" y="56" width="32" height="3" rx="1.5" fill="var(--colox-empty-faint)" />
      <rect x="59" y="62" width="24" height="3" rx="1.5" fill="var(--colox-empty-faint)" />
      <rect x="44" y="76" width="72" height="34" rx="4" fill="var(--colox-empty-faint)" />
      <rect x="52" y="69" width="20" height="7" rx="2" fill="var(--colox-empty-faint)" />
      {/* the drifting data sheet with its mini bar-chart */}
      <g transform="rotate(12 115 40)">
        <rect
          x="100"
          y="28"
          width="36"
          height="28"
          rx="4"
          fill="var(--colox-empty-panel)"
          stroke="var(--colox-empty-faint)"
          strokeOpacity="0.9"
        />
        <rect x="107" y="44" width="4" height="7" rx="1" fill="var(--colox-empty-solid-blue)" />
        <rect x="114" y="40" width="4" height="11" rx="1" fill="var(--colox-empty-solid-orange)" />
        <rect x="121" y="45" width="4" height="6" rx="1" fill="var(--colox-empty-solid-blue)" />
      </g>
      {/* ambient data particles: few, soft and deliberate — one floats
          above the drifting sheet, two balance the open corners */}
      <circle cx="118" cy="16" r="5" fill="var(--colox-empty-solid-blue)" fillOpacity="0.5" />
      <circle cx="140" cy="42" r="3.5" fill="var(--colox-empty-solid-orange)" fillOpacity="0.5" />
      <circle cx="30" cy="116" r="4.5" fill="var(--colox-empty-solid-orange)" fillOpacity="0.4" />
    </svg>
  );
};
