import type { LucideIcon } from "lucide-react";
import { Toggle } from "./Toggle";

interface PageCardProps {
  icon: LucideIcon;
  label: string;
  sublabel: string;
  badgeVariant: "recommended" | "optional";
  timing: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

export function PageCard({
  icon: Icon,
  label,
  sublabel,
  badgeVariant,
  timing,
  checked,
  onChange,
}: PageCardProps) {
  return (
    <div
      className="flex items-start transition-colors"
      style={{
        gap: 10,
        padding: 10,
        background: checked ? "var(--wizard-success-light)" : "var(--surface-page)",
        border: checked ? "1px solid var(--wizard-success-border)" : "1px solid var(--border-ui)",
        borderRadius: 5,
        marginBottom: 6,
      }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        aria-hidden="true"
        style={{
          width: 28,
          height: 28,
          background: checked ? "var(--wizard-success-light)" : "#fff",
          border: checked ? "1px solid var(--wizard-success-border)" : "1px solid var(--border-ui)",
          borderRadius: 4,
          color: checked ? "var(--wizard-success)" : "var(--text-secondary)",
        }}
      >
        <Icon size={14} />
      </div>
      <div className="flex flex-col flex-1 min-w-0" style={{ gap: 2 }}>
        <div className="flex items-center" style={{ gap: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: "var(--font-size-md)", fontWeight: 500, color: "var(--text-primary)" }}>
            {label}
          </span>
          <span
            style={{
              fontSize: 9,
              padding: "1px 6px",
              borderRadius: 3,
              background:
                badgeVariant === "recommended"
                  ? "var(--wizard-amber-light)"
                  : "var(--surface-page)",
              border:
                badgeVariant === "recommended"
                  ? "1px solid var(--wizard-amber-border-strong)"
                  : "1px solid var(--border-ui)",
              color:
                badgeVariant === "recommended"
                  ? "var(--wizard-amber-text)"
                  : "var(--text-secondary)",
            }}
          >
            {badgeVariant === "recommended" ? "Recomendado" : "Opcional"}
          </span>
          <span
            style={{
              fontSize: 9,
              padding: "1px 6px",
              borderRadius: 3,
              background: "var(--wizard-amber-light)",
              border: "1px solid var(--wizard-amber-border-strong)",
              color: "var(--wizard-amber-text)",
            }}
          >
            {timing}
          </span>
        </div>
        <span style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.4 }}>
          {sublabel}
        </span>
      </div>
      <Toggle checked={checked} onChange={onChange} ariaLabel={label} />
    </div>
  );
}
