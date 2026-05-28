import type { SectionGroup } from "../../../types/wizard2";

interface SectionEyebrowProps {
  group: SectionGroup;
  id?: string;
}

export function SectionEyebrow({ group, id }: SectionEyebrowProps) {
  const isLaunch = group === "launch";
  const text = isLaunch ? "📅 Para lanzar esta semana" : "📈 Para crecer · Mes 1-3";
  return (
    <span
      id={id}
      className="inline-flex"
      style={{
        background: isLaunch ? "var(--wizard-red-light)" : "var(--wizard-success-light)",
        border: `1px solid ${isLaunch ? "var(--wizard-red-border)" : "var(--wizard-success-border)"}`,
        borderRadius: 4,
        fontSize: 9,
        color: isLaunch ? "var(--wizard-red-text)" : "var(--wizard-success-dark)",
        padding: "1px 8px",
        marginBottom: 6,
        alignSelf: "flex-start",
      }}
    >
      {text}
    </span>
  );
}
