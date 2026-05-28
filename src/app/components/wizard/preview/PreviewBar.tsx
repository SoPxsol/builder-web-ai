import { Monitor, Smartphone, Tablet, TrendingUp } from "lucide-react";
import type { PreviewBreakpoint } from "../../../types/wizard";

interface PreviewBarProps {
  breakpoint: PreviewBreakpoint;
  onChange: (b: PreviewBreakpoint) => void;
  roiVisible: boolean;
}

const BUTTONS: { id: PreviewBreakpoint; icon: React.ElementType; label: string }[] = [
  { id: "desktop", icon: Monitor, label: "Desktop" },
  { id: "tablet", icon: Tablet, label: "Tablet" },
  { id: "mobile", icon: Smartphone, label: "Mobile" },
];

export function PreviewBar({ breakpoint, onChange, roiVisible }: PreviewBarProps) {
  return (
    <div
      className="flex items-center"
      style={{
        height: 36,
        padding: "0 12px",
        borderBottom: "1px solid var(--border-ui)",
        background: "#fff",
        gap: 8,
        flexShrink: 0,
      }}
    >
      <div className="flex items-center" style={{ gap: 2 }}>
        {BUTTONS.map(({ id, icon: Icon, label }) => {
          const active = breakpoint === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-pressed={active}
              aria-label={`Vista ${label}`}
              title={label}
              className="flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                width: 28,
                height: 24,
                background: active ? "var(--accent-info-bg)" : "transparent",
                border: active ? "1px solid var(--accent-info)" : "1px solid transparent",
                borderRadius: 4,
                cursor: "pointer",
                outlineColor: "var(--accent-info)",
              }}
            >
              <Icon
                size={12}
                style={{ color: active ? "var(--accent-info)" : "var(--text-secondary)" }}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      <span style={{ flex: 1 }} />

      {/* ROI hint (fade + slide-in) */}
      <div
        role="status"
        aria-live="polite"
        style={{
          opacity: roiVisible ? 1 : 0,
          transform: roiVisible ? "translateY(0)" : "translateY(-4px)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
          pointerEvents: roiVisible ? "auto" : "none",
        }}
      >
        <span
          className="inline-flex items-center"
          style={{
            background: "var(--wizard-success-light)",
            border: "1px solid var(--wizard-success-border)",
            borderRadius: 999,
            padding: "2px 10px",
            fontSize: 9,
            fontWeight: 500,
            color: "var(--wizard-success-dark)",
            gap: 4,
          }}
        >
          <TrendingUp size={9} aria-hidden="true" />
          +38% reservas directas en promedio
        </span>
      </div>
    </div>
  );
}
