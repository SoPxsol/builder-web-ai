import { ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type PolicyBadgeVariant = "required" | "recommended";

interface PolicyAccordionProps {
  icon: LucideIcon;
  title: string;
  badge?: { text: string; variant: PolicyBadgeVariant };
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

function badgeStyle(v: PolicyBadgeVariant) {
  if (v === "required") {
    return {
      background: "var(--wizard-red-light)",
      border: "1px solid var(--wizard-red-border)",
      color: "var(--wizard-red-text)",
    };
  }
  return {
    background: "var(--wizard-amber-light)",
    border: "1px solid var(--wizard-amber-border-strong)",
    color: "var(--wizard-amber-text)",
  };
}

export function PolicyAccordion({
  icon: Icon,
  title,
  badge,
  isOpen,
  onToggle,
  children,
}: PolicyAccordionProps) {
  return (
    <div
      style={{
        border: "1px solid var(--border-ui)",
        borderRadius: 5,
        overflow: "hidden",
        marginBottom: 8,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex items-center w-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          background: "var(--surface-page)",
          border: "none",
          padding: 12,
          cursor: "pointer",
          gap: 8,
          textAlign: "left",
          borderBottom: isOpen ? "1px solid var(--border-ui)" : "none",
          outlineColor: "var(--accent-info)",
        }}
      >
        <Icon size={14} style={{ color: "var(--text-secondary)", flexShrink: 0 }} aria-hidden="true" />
        <span
          className="flex-1"
          style={{ fontSize: "var(--font-size-md)", fontWeight: 500, color: "var(--text-primary)" }}
        >
          {title}
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
        <ChevronDown
          size={14}
          aria-hidden="true"
          style={{
            color: "var(--text-secondary)",
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.2s ease",
          }}
        />
      </button>
      {isOpen && <div style={{ padding: 12, background: "#fff" }}>{children}</div>}
    </div>
  );
}
