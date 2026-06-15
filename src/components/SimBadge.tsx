/** Honest-by-default badge. Stripe calls run against a test-mode key. */
export function SimBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`eyebrow inline-flex items-center gap-1.5 ${className}`}
      style={{
        color: "var(--good)",
        border: "1px solid var(--line)",
        borderRadius: "999px",
        padding: "0.28rem 0.6rem",
        background: "#fff",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--good)",
          boxShadow: "0 0 0 3px rgba(31,122,85,0.16)",
        }}
      />
      Stripe test mode
    </span>
  );
}
