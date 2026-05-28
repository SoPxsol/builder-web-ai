import { Check } from "lucide-react";
import type { W2Section, W2State } from "../../../types/wizard2";
import { SECTIONS } from "../../../types/wizard2";

interface Props {
  state: W2State;
  update: (patch: Partial<W2State>) => void;
  /** Navega a una sección específica para editar. */
  onEdit?: (section: W2Section) => void;
}

const PLAN_ITEMS = [
  "SEO + GEO (AI Discovery)",
  "Control de versiones",
  "Multilenguaje",
  "200 prompts IA/mes",
  "Soporte de asesores especializados",
];

export function SFinal({ state, onEdit }: Props) {
  const completedCount = state.completedSections.size;
  const totalSections = SECTIONS.length;
  const progressPct = Math.round((completedCount / totalSections) * 100);
  const activeLanguages = state.languages.active.length;
  const enabledPages =
    Object.values(state.additionalPages).filter(Boolean).length + 3; // base: inicio, habitaciones, contacto

  const sectionStatus = SECTIONS.map((sec) => ({
    ...sec,
    done: state.completedSections.has(sec.id),
  }));

  return (
    <div className="flex flex-col" style={{ padding: "20px 24px", gap: 14 }}>
      {/* Header */}
      <div className="flex items-center" style={{ gap: 10 }}>
        <div
          aria-hidden="true"
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 32,
            height: 32,
            background: "var(--wizard-success)",
            borderRadius: "50%",
          }}
        >
          <Check size={14} style={{ color: "#fff" }} />
        </div>
        <div className="flex flex-col">
          <p style={{ fontSize: 17, fontWeight: 600, color: "var(--text-primary)" }}>
            Configuración completa
          </p>
          <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>
            Todo lo configurado ya está aplicado.
          </p>
        </div>
      </div>

      {/* Stats grid 2×2 */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 7 }}>
        {[
          { value: completedCount, label: "Secciones" },
          { value: `${progressPct}%`, label: "Del sitio" },
          { value: activeLanguages, label: "Idiomas" },
          { value: enabledPages, label: "Páginas" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="text-center"
            style={{
              background: "var(--surface-page)",
              border: "1px solid var(--border-ui)",
              borderRadius: 5,
              padding: 10,
            }}
          >
            <p style={{ fontSize: 18, fontWeight: 600, color: "var(--wizard-success)" }}>{stat.value}</p>
            <p style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Plan value */}
      <div
        style={{
          background: "var(--wizard-success-light)",
          border: "1px solid var(--wizard-success-border)",
          borderRadius: 5,
          padding: 12,
        }}
      >
        <p
          style={{
            fontSize: "var(--font-size-md)",
            fontWeight: 500,
            color: "var(--wizard-success-dark)",
            marginBottom: 6,
          }}
        >
          ✓ Tu Plan Web Base incluye
        </p>
        <ul className="flex flex-col" style={{ gap: 4, listStyle: "none", padding: 0, margin: 0 }}>
          {PLAN_ITEMS.map((item) => (
            <li key={item} className="flex items-center" style={{ gap: 6 }}>
              <Check size={10} style={{ color: "var(--wizard-success-dark)" }} aria-hidden="true" />
              <span style={{ fontSize: 11, color: "var(--wizard-success-dark)" }}>{item}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            marginTop: 8,
            background: "transparent",
            border: "none",
            padding: 0,
            fontSize: 11,
            color: "var(--wizard-success)",
            textDecoration: "underline",
            cursor: "pointer",
            outlineColor: "var(--wizard-success)",
            borderRadius: 4,
          }}
        >
          ¿Necesitás diseño a medida? → Ver Plan Custom
        </button>
      </div>

      {/* Resumen de secciones */}
      <div
        style={{
          border: "1px solid var(--border-ui)",
          borderRadius: 5,
          overflow: "hidden",
        }}
      >
        {sectionStatus.map((sec, idx) => (
          <div
            key={sec.id}
            className="flex items-center"
            style={{
              gap: 8,
              padding: "7px 12px",
              borderBottom: idx < sectionStatus.length - 1 ? "1px solid var(--border-ui)" : "none",
              fontSize: 11,
            }}
          >
            <Check
              size={12}
              style={{
                color: sec.done ? "var(--wizard-success)" : "var(--text-tertiary)",
                flexShrink: 0,
              }}
              aria-hidden="true"
            />
            <span className="flex-1" style={{ color: "var(--text-secondary)" }}>
              {sec.label}
            </span>
            <span style={{ color: sec.done ? "var(--wizard-success)" : "var(--text-tertiary)" }}>
              {sec.done ? "✓ Listo" : "Pendiente"}
            </span>
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(sec.id)}
                className="transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  fontSize: 10,
                  color: "var(--accent-info)",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  textDecoration: "underline",
                  outlineColor: "var(--accent-info)",
                }}
              >
                Editar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
