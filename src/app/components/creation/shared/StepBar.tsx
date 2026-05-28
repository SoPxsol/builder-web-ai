import { Check } from "lucide-react";
import type { StepDef } from "../../../types/creation";

interface StepBarProps {
  steps: StepDef[];
  /** Index 0-based del paso activo. */
  activeIndex: number;
  onStepClick?: (index: number) => void;
}

export function StepBar({ steps, activeIndex, onStepClick }: StepBarProps) {
  return (
    <nav
      aria-label="Pasos"
      className="flex items-center justify-center"
      style={{
        height: 48,
        background: "#fff",
        borderBottom: "1px solid var(--border-ui)",
        padding: "0 16px",
        flexShrink: 0,
      }}
    >
      <ol className="flex items-center" style={{ listStyle: "none", margin: 0, padding: 0, gap: 0 }}>
        {steps.map((step, idx) => {
          const status =
            idx < activeIndex ? "completed" : idx === activeIndex ? "active" : "pending";
          const isLast = idx === steps.length - 1;
          const isClickable = status === "completed" && onStepClick;

          // Línea conectora: verde para tramos completados, gris para los pendientes.
          // El coral se reserva al círculo del step activo (single point of attention).
          const connectorColor =
            status === "completed" ? "var(--wizard-success-done)" : "var(--border-ui)";

          const dotStyle =
            status === "completed"
              ? {
                  background: "var(--wizard-success-done)",
                  color: "#fff",
                  border: "none",
                }
              : status === "active"
              ? {
                  // Negro neutro en lugar de coral (regla del 10%).
                  background: "var(--text-primary)",
                  color: "#fff",
                  border: "none",
                }
              : {
                  background: "#efefef",
                  color: "var(--text-secondary)",
                  border: "0.5px solid var(--border-ui)",
                };

          const labelColor =
            status === "completed"
              ? "var(--wizard-success-done)"
              : status === "active"
              ? "var(--text-primary)"
              : "var(--text-secondary)";

          const stepNode = (
            <div className="flex items-center" style={{ gap: 8 }}>
              <span
                aria-hidden="true"
                className="flex items-center justify-center"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  fontSize: 11,
                  fontWeight: 500,
                  ...dotStyle,
                }}
              >
                {status === "completed" ? <Check size={12} aria-hidden="true" /> : idx + 1}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: status === "active" ? 600 : 400,
                  color: labelColor,
                  opacity: status === "pending" ? 0.6 : 1,
                  whiteSpace: "nowrap",
                }}
              >
                {step.label}
              </span>
            </div>
          );

          return (
            <li
              key={step.id}
              className="flex items-center"
              aria-current={status === "active" ? "step" : undefined}
            >
              {isClickable ? (
                <button
                  type="button"
                  onClick={() => onStepClick(idx)}
                  className="transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: 2,
                    borderRadius: 4,
                    cursor: "pointer",
                    outlineColor: "var(--accent-info)",
                  }}
                  aria-label={`Volver a ${step.label}`}
                >
                  {stepNode}
                </button>
              ) : (
                <div style={{ padding: 2, cursor: status === "pending" ? "default" : "auto" }}>
                  {stepNode}
                </div>
              )}
              {!isLast && (
                <div
                  aria-hidden="true"
                  style={{
                    width: 52,
                    height: 1,
                    margin: "0 8px",
                    background: connectorColor,
                  }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
