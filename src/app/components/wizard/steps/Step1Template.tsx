import type { TemplateId, WizardState } from "../../../types/wizard";
import { TEMPLATES } from "../../../types/wizard";

interface Props {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

const TEMPLATE_ORDER: TemplateId[] = ["boutique", "resort", "urbano"];

export function Step1Template({ state, update }: Props) {
  function handleSelect(id: TemplateId) {
    const template = TEMPLATES[id];
    update({
      selectedTemplate: id,
      identity: {
        ...state.identity,
        colorPrimary: template.accent,
        colorSecondary: template.dark,
      },
    });
  }

  return (
    <div className="flex flex-col gap-4" style={{ padding: "20px 24px" }}>
      <div>
        <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)" }}>
          Elegí el estilo de tu sitio
        </p>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", marginTop: 4 }}>
          Estos templates son la base. Todo el contenido y los colores son editables después.
        </p>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        {TEMPLATE_ORDER.map((id) => {
          const template = TEMPLATES[id];
          const selected = state.selectedTemplate === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleSelect(id)}
              aria-pressed={selected}
              className="flex flex-col overflow-hidden text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: "#fff",
                border: selected ? "2px solid var(--accent-info)" : "1px solid var(--border-ui)",
                borderRadius: 8,
                cursor: "pointer",
                outlineColor: "var(--accent-info)",
                padding: 0,
              }}
            >
              {/* Thumbnail */}
              <div
                aria-hidden="true"
                style={{
                  height: 80,
                  background: `linear-gradient(135deg, ${template.dark}, ${template.accent})`,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: 8,
                    left: 8,
                    right: 8,
                    height: 12,
                    background: "rgba(255,255,255,0.85)",
                    borderRadius: 2,
                  }}
                />
              </div>

              {/* Label + description */}
              <div className="flex flex-col" style={{ padding: "10px 12px", gap: 2 }}>
                <p style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--text-primary)" }}>
                  {template.label}
                </p>
                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  {template.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
