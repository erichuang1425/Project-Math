export function TangentCurveIllustration() {
  return (
    <svg
      viewBox="0 0 240 120"
      width="100%"
      height="100%"
      role="img"
      aria-label="A curve with a tangent line at one point"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="tc-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--pm-color-accent-soft)" stopOpacity="0.6" />
          <stop offset="1" stopColor="var(--pm-color-accent-soft)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="240" height="120" rx="12" fill="transparent" />
      <line x1="10" y1="110" x2="230" y2="110" stroke="var(--pm-color-rule)" strokeWidth="1" />
      <line x1="20" y1="10" x2="20" y2="115" stroke="var(--pm-color-rule)" strokeWidth="1" />
      <path
        d="M 20 100 Q 80 5 220 80"
        fill="none"
        stroke="var(--pm-color-accent)"
        strokeWidth="2.5"
      />
      <path
        d="M 20 100 Q 80 5 220 80 L 220 110 L 20 110 Z"
        fill="url(#tc-grad)"
        opacity="0.8"
      />
      <line
        x1="60"
        y1="78"
        x2="200"
        y2="22"
        stroke="var(--pm-color-highlight)"
        strokeWidth="2"
        strokeDasharray="5 4"
      />
      <circle cx="130" cy="50" r="5" fill="var(--pm-color-highlight)" />
    </svg>
  );
}
