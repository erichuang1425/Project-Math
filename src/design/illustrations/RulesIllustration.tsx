export function RulesIllustration() {
  return (
    <svg
      viewBox="0 0 240 120"
      width="100%"
      height="100%"
      role="img"
      aria-label="Stacked tiles representing differentiation rules"
      preserveAspectRatio="xMidYMid meet"
    >
      <g fontFamily="var(--pm-font-serif)" fontSize="13">
        <rect
          x="20"
          y="20"
          width="60"
          height="36"
          rx="6"
          fill="var(--pm-color-accent-soft)"
          stroke="var(--pm-color-accent)"
        />
        <text x="50" y="43" textAnchor="middle" fill="var(--pm-color-accent)">
          x²′
        </text>

        <rect
          x="92"
          y="20"
          width="60"
          height="36"
          rx="6"
          fill="var(--pm-color-highlight-soft)"
          stroke="var(--pm-color-highlight)"
        />
        <text x="122" y="43" textAnchor="middle" fill="var(--pm-color-highlight)">
          f·g
        </text>

        <rect
          x="164"
          y="20"
          width="60"
          height="36"
          rx="6"
          fill="var(--pm-color-correct-soft)"
          stroke="var(--pm-color-correct)"
        />
        <text x="194" y="43" textAnchor="middle" fill="var(--pm-color-correct)">
          f/g
        </text>

        <rect
          x="56"
          y="68"
          width="60"
          height="36"
          rx="6"
          fill="var(--pm-color-info-soft)"
          stroke="var(--pm-color-info)"
        />
        <text x="86" y="91" textAnchor="middle" fill="var(--pm-color-info)">
          f∘g
        </text>

        <rect
          x="128"
          y="68"
          width="60"
          height="36"
          rx="6"
          fill="var(--pm-color-warning-soft)"
          stroke="var(--pm-color-warning)"
        />
        <text x="158" y="91" textAnchor="middle" fill="var(--pm-color-warning)">
          y − y₀
        </text>
      </g>
    </svg>
  );
}
