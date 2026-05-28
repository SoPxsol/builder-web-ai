import { Toggle } from "./Toggle";

export type ToggleBadgeVariant = "priority" | "recommended";

export interface ToggleRowBadge {
  text: string;
  variant: ToggleBadgeVariant;
}

interface ToggleRowProps {
  label: string;
  sublabel: string;
  badge?: ToggleRowBadge;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function badgeStyle(variant: ToggleBadgeVariant) {
  if (variant === "priority") {
    return {
      background: "var(--wizard-purple-light)",
      border: "1px solid var(--wizard-purple-border)",
      color: "var(--wizard-purple-text)",
    };
  }
  return {
    background: "var(--wizard-amber-light)",
    border: "1px solid var(--wizard-amber-border-strong)",
    color: "var(--wizard-amber-text)",
  };
}

export function ToggleRow({ label, sublabel, badge, checked, onChange }: ToggleRowProps) {
  return (
    <div
      className="flex items-center transition-colors"
      style={{
        gap: 10,
        padding: 10,
        background: "var(--surface-page)",
        border: "1px solid var(--border-ui)",
        borderRadius: 5,
        marginBottom: 6,
      }}
    >
      <div className="flex flex-col flex-1 min-w-0" style={{ gap: 2 }}>
        <div className="flex items-center" style={{ gap: 4, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "var(--font-size-md)",
              fontWeight: 500,
              color: "var(--text-primary)",
            }}
          >
            {label}
          </span>
          {badge && (
            <span
              style={{
                fontSize: 9,
                padding: "1px 6px",
                borderRadius: 3,
                ...badgeStyle(badge.variant),
              }}
            >
              {badge.text}
            </span>
          )}
        </div>
        <span style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.4 }}>
          {sublabel}
        </span>
      </div>
      <Toggle checked={checked} onChange={onChange} ariaLabel={label} />
    </div>
  );
}
