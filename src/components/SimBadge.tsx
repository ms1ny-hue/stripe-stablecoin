/** Honest-by-default badge. Every money figure in this app is simulated. */
export function SimBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`eyebrow inline-flex items-center gap-1.5 ${className}`}
      style={{
        color: "var(--gold)",
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
          background: "var(--gold-bright)",
          boxShadow: "0 0 0 3px rgba(200,162,74,0.18)",
        }}
      />
      Simulated
    </span>
  );
}
