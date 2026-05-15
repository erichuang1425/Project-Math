export function LimitIllustration() {
  return (
    <svg
      viewBox="0 0 240 120"
      width="100%"
      height="100%"
      role="img"
      aria-label="A graph approaching a limit value from both sides"
      preserveAspectRatio="xMidYMid meet"
    >
      <line x1="10" y1="65" x2="230" y2="65" stroke="var(--pm-color-rule)" strokeWidth="1" />
      <line x1="120" y1="10" x2="120" y2="115" stroke="var(--pm-color-rule)" strokeWidth="1" />
      <path
        d="M 20 100 C 60 80 90 50 115 40"
        fill="none"
        stroke="var(--pm-color-accent)"
        strokeWidth="2.5"
      />
      <path
        d="M 125 40 C 150 50 180 80 220 100"
        fill="none"
        stroke="var(--pm-color-accent)"
        strokeWidth="2.5"
      />
      <circle
        cx="120"
        cy="40"
        r="4"
        fill="var(--pm-color-app-bg)"
        stroke="var(--pm-color-accent)"
        strokeWidth="2"
      />
      <line
        x1="120"
        y1="40"
        x2="180"
        y2="40"
        stroke="var(--pm-color-highlight)"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <text
        x="184"
        y="42"
        fontSize="11"
        fill="var(--pm-color-highlight)"
        fontFamily="var(--pm-font-mono)"
      >
        L
      </text>
      <text
        x="124"
        y="80"
        fontSize="11"
        fill="var(--pm-color-text-muted)"
        fontFamily="var(--pm-font-mono)"
      >
        a
      </text>
    </svg>
  );
}
