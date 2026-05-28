import { Check } from "lucide-react";

interface ChecklistItemProps {
  label: string;
  sublabel: string;
  badge: "required" | "recommended";
  checked: boolean;
  onChange: (value: boolean) => void;
}

export function ChecklistItem({ label, sublabel, badge, checked, onChange }: ChecklistItemProps) {
  const isRequired = badge === "required";
  return (
    <label
      className="flex items-start transition-colors"
      style={{
        gap: 8,
        padding: 10,
        background: checked ? "var(--wizard-success-light)" : "var(--surface-page)",
        border: checked ? "1px solid var(--wizard-success-border)" : "1px solid var(--border-ui)",
        borderRadius: 5,
        marginBottom: 6,
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
        aria-label={label}
      />
      <span
        aria-hidden="true"
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 16,
          height: 16,
          background: checked ? "var(--wizard-success)" : "#fff",
          border: checked ? "1.5px solid var(--wizard-success)" : "1.5px solid var(--border-ui)",
          borderRadius: 3,
          marginTop: 2,
        }}
      >
        {checked && <Check size={9} style={{ color: "#fff" }} />}
      </span>
      <div className="flex flex-col flex-1" style={{ gap: 2 }}>
        <div className="flex items-center" style={{ gap: 4, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "var(--font-size-md)",
              fontWeight: 500,
              color: checked ? "var(--text-tertiary)" : "var(--text-primary)",
              textDecoration: checked ? "line-through" : "none",
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontSize: 9,
              padding: "1px 6px",
              borderRadius: 3,
              background: isRequired ? "var(--wizard-red-light)" : "var(--wizard-amber-light)",
              border: isRequired
                ? "1px solid var(--wizard-red-border)"
                : "1px solid var(--wizard-amber-border-strong)",
              color: isRequired ? "var(--wizard-red-text)" : "var(--wizard-amber-text)",
            }}
          >
            {isRequired ? "Requerido" : "Recomendado"}
          </span>
        </div>
        <span style={{ fontSize: 10, color: "var(--text-tertiary)", lineHeight: 1.4 }}>
          {sublabel}
        </span>
      </div>
    </label>
  );
}
