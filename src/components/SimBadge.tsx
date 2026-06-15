/** Mono test-mode tag. Stripe calls run against a test-mode key. */
export function SimBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`label ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        color: "var(--text-2)",
        border: "1px solid var(--line-2)",
        borderRadius: 6,
        padding: "0.26rem 0.5rem",
      }}
    >
      <span
        aria-hidden
        style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--warn)" }}
      />
      Test mode
    </span>
  );
}
