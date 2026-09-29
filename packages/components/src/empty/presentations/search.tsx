import { useId } from 'react';

/**
 * The "no matches" scene figure: a magnifier hovering over two floating
 * documents, resting on a soft ground shadow under an ambient sky. A
 * rich, multi-color scene — green + blue pastel halos, sparkle stars,
 * a translucent glass lens with a rim highlight — decorative as a
 * whole: no labels, no interaction; the prose carries the meaning, the
 * scene paints the mood. Colors ride `--colox-empty-*` so light and
 * dark adapt for free; the gradient id rides `useId` so instances
 * never collide.
 */
export const SearchEmptyFigure = () => {
  const glass = useId();
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
        <radialGradient id={`${glass}-glass`} cx="0.35" cy="0.35" r="0.9">
          <stop offset="0" stopColor="var(--colox-empty-wash-blue)" />
          <stop offset="1" stopColor="var(--colox-color-bg-default)" stopOpacity="0.25" />
        </radialGradient>
      </defs>
      {/* ambient halos */}
      <circle cx="30" cy="36" r="36" fill="var(--colox-empty-wash-green)" fillOpacity="0.5" />
      <circle cx="128" cy="116" r="32" fill="var(--colox-empty-wash-blue)" fillOpacity="0.5" />
      {/* ground shadow */}
      <ellipse
        cx="84"
        cy="134"
        rx="46"
        ry="8"
        fill="var(--colox-empty-shadow)"
        fillOpacity="0.35"
      />
      {/* the floating documents */}
      <g transform="rotate(-8 52 84)">
        <rect x="30" y="56" width="44" height="56" rx="8" fill="var(--colox-empty-panel)" />
        <rect x="38" y="68" width="28" height="5" rx="2.5" fill="var(--colox-empty-faint)" />
        <rect x="38" y="79" width="20" height="5" rx="2.5" fill="var(--colox-empty-faint)" />
        <rect x="38" y="90" width="24" height="5" rx="2.5" fill="var(--colox-empty-faint)" />
      </g>
      <g transform="rotate(6 116 90)">
        <rect
          x="96"
          y="62"
          width="40"
          height="52"
          rx="7"
          fill="var(--colox-empty-faint)"
          fillOpacity="0.9"
        />
        <rect
          x="104"
          y="74"
          width="24"
          height="5"
          rx="2.5"
          fill="var(--colox-empty-panel)"
          fillOpacity="0.85"
        />
        <rect
          x="104"
          y="85"
          width="16"
          height="5"
          rx="2.5"
          fill="var(--colox-empty-panel)"
          fillOpacity="0.85"
        />
      </g>
      {/* the lens glow, glass, highlight and handle */}
      <circle cx="90" cy="66" r="30" fill="var(--colox-empty-wash-blue)" fillOpacity="0.55" />
      <circle
        cx="90"
        cy="66"
        r="22"
        fill={`url(#${glass}-glass)`}
        stroke="var(--colox-empty-solid-blue)"
        strokeWidth="4"
      />
      <path
        d="M74 60 A 18 18 0 0 1 103 55"
        stroke="var(--colox-color-bg-default)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M106 82 L123 99"
        stroke="var(--colox-empty-solid-blue)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* sparkle stars */}
      <path
        d="M38 26 L40.4 31.6 L46 34 L40.4 36.4 L38 42 L35.6 36.4 L30 34 L35.6 31.6 Z"
        fill="var(--colox-empty-solid-green)"
        fillOpacity="0.6"
      />
      <path
        d="M138 40 L139.9 44.4 L144 46 L139.9 47.6 L138 52 L136.1 47.6 L132 46 L136.1 44.4 Z"
        fill="var(--colox-empty-solid-blue)"
        fillOpacity="0.6"
      />
      <path
        d="M130 136 L132.4 141.6 L138 144 L132.4 146.4 L130 152 L127.6 146.4 L122 144 L127.6 141.6 Z"
        fill="var(--colox-empty-solid-green)"
        fillOpacity="0.5"
      />
      <path
        d="M24 118 L25.9 122.4 L30 124 L25.9 125.6 L24 130 L22.1 125.6 L18 124 L22.1 122.4 Z"
        fill="var(--colox-empty-solid-blue)"
        fillOpacity="0.5"
      />
      {/* tiny ambience dots */}
      <circle cx="148" cy="86" r="2.5" fill="var(--colox-empty-solid-blue)" fillOpacity="0.5" />
      <circle cx="52" cy="122" r="2.5" fill="var(--colox-empty-solid-green)" fillOpacity="0.4" />
    </svg>
  );
};
