import { Check } from "lucide-react";
import type { W2Section } from "../../types/wizard2";
import { SECTIONS } from "../../types/wizard2";

interface StepTrailW2Props {
  currentSection: W2Section;
  completedSections: Set<W2Section>;
  onNavigate: (section: W2Section) => void;
}

type ItemStatus = "done" | "active" | "pending";

export function StepTrailW2({ currentSection, completedSections, onNavigate }: StepTrailW2Props) {
  // Solo mostramos las 8 secciones (sin "final").
  const items = SECTIONS;

  return (
    <nav
      aria-label="Pasos del wizard"
      className="flex items-center"
      style={{
        height: 48,
        padding: "0 16px",
        borderBottom: "1px solid var(--border-ui)",
        background: "#fff",
        flexShrink: 0,
      }}
    >
      <ol className="flex items-center w-full" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {items.map((section, idx) => {
          const status: ItemStatus =
            section.id === currentSection
              ? "active"
              : completedSections.has(section.id)
              ? "done"
              : "pending";

          const isLast = idx === items.length - 1;

          const dotStyle =
            status === "active"
              ? // Negro neutro en lugar de coral (regla del 10%).
                { background: "var(--text-primary)", color: "#fff", border: "none" }
              : status === "done"
              ? { background: "var(--wizard-success-done)", color: "#fff", border: "none" }
              : {
                  background: "#efefef",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-ui)",
                };

          // Activo: el círculo coral basta para señalarlo — texto neutral.
          const labelColor =
            status === "active"
              ? "var(--text-primary)"
              : status === "done"
              ? "var(--wizard-success-done)"
              : "var(--text-secondary)";

          // Línea conectora: verde para tramos completados, gris para los pendientes.
          // Nunca coral — eso queda reservado al círculo del step actual.
          const lineColor =
            status === "done" ? "var(--wizard-success-done)" : "var(--border-ui)";

          return (
            <li
              key={section.id}
              className="flex items-center"
              style={{ flex: isLast ? "0 0 auto" : 1 }}
              aria-current={status === "active" ? "step" : undefined}
            >
              <button
                type="button"
                onClick={() => onNavigate(section.id)}
                className="flex items-center transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 2,
                  borderRadius: 4,
                  cursor: "pointer",
                  gap: 6,
                  outlineColor: "var(--accent-info)",
                }}
                title={section.label}
              >
                <span
                  aria-hidden="true"
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    fontSize: 10,
                    fontWeight: 500,
                    ...dotStyle,
                  }}
                >
                  {status === "done" ? <Check size={11} aria-hidden="true" /> : idx + 1}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: status === "active" ? 600 : 400,
                    color: labelColor,
                    whiteSpace: "nowrap",
                  }}
                >
                  {section.label}
                </span>
              </button>
              {!isLast && (
                <div
                  aria-hidden="true"
                  style={{
                    flex: 1,
                    height: 1,
                    margin: "0 6px",
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
