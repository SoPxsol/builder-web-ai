import { Check } from "lucide-react";
import type { StepIndex } from "../../types/wizard";
import { STEP_LABELS } from "../../types/wizard";

interface StepTrailProps {
  currentStep: StepIndex;
}

const STEPS: StepIndex[] = [1, 2, 3, 4, 5];

export function StepTrail({ currentStep }: StepTrailProps) {
  return (
    <nav
      aria-label="Pasos del wizard"
      className="flex items-center"
      style={{
        height: 48,
        padding: "0 24px",
        borderBottom: "1px solid var(--border-ui)",
        background: "#fff",
      }}
    >
      <ol className="flex items-center w-full" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {STEPS.map((step, idx) => {
          const status: "done" | "active" | "pending" =
            step < currentStep ? "done" : step === currentStep ? "active" : "pending";
          const isLast = idx === STEPS.length - 1;

          const dotStyle =
            status === "active"
              ? {
                  // Negro neutro en lugar de coral: el círculo "actual" destaca
                  // por contraste/peso, no por color de marca (regla del 10%).
                  background: "var(--text-primary)",
                  color: "#fff",
                  border: "none",
                }
              : status === "done"
              ? {
                  background: "var(--wizard-success-done)",
                  color: "#fff",
                  border: "none",
                }
              : {
                  background: "#efefef",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-ui)",
                };

          // Activo: el círculo coral ya marca el "estás acá" — el texto va neutral
          // para no saturar la interfaz de rojo (regla del 10%).
          const labelColor =
            status === "active"
              ? "var(--text-primary)"
              : status === "done"
              ? "var(--wizard-success-done)"
              : "var(--text-secondary)";

          // Línea conectora: verde para tramos de progreso completado, gris para futuros.
          // Nunca coral: el rojo se reserva para la posición actual (un solo punto).
          const lineColor =
            status === "done" ? "var(--wizard-success-done)" : "var(--border-ui)";

          return (
            <li
              key={step}
              className="flex items-center"
              style={{ flex: isLast ? "0 0 auto" : 1 }}
              aria-current={status === "active" ? "step" : undefined}
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    fontSize: "var(--font-size-xs)",
                    fontWeight: 500,
                    ...dotStyle,
                  }}
                >
                  {status === "done" ? <Check size={12} aria-hidden="true" /> : step}
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: status === "active" ? 600 : 400,
                    color: labelColor,
                    whiteSpace: "nowrap",
                  }}
                >
                  {STEP_LABELS[step]}
                </span>
              </div>
              {!isLast && (
                <div
                  aria-hidden="true"
                  style={{
                    flex: 1,
                    height: 1,
                    margin: "0 8px",
                    background: lineColor,
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
