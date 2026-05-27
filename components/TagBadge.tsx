interface TagBadgeProps {
  tag: string;
}

const tagStyles: Record<string, { bg: string; color: string }> = {
  VEG: { bg: "var(--tag-veg)", color: "var(--tag-veg-text)" },
  "NON-VEG": { bg: "var(--tag-nonveg)", color: "var(--tag-nonveg-text)" },
  QUICK: { bg: "var(--tag-quick)", color: "var(--tag-quick-text)" },
  HEALTHY: { bg: "var(--tag-healthy)", color: "var(--tag-healthy-text)" },
  FESTIVE: { bg: "var(--tag-festive)", color: "var(--tag-festive-text)" },
};

export default function TagBadge({ tag }: TagBadgeProps) {
  const style = tagStyles[tag] ?? { bg: "#e8e0d4", color: "#6b6560" };
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        borderRadius: 20,
        padding: "2px 10px",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.02em",
      }}
    >
      {tag}
    </span>
  );
}
