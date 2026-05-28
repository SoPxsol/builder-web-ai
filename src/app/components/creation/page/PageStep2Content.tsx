import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from "lucide-react";
import type { PageSection, PageState } from "../../../types/creation";

interface Props {
  state: PageState;
  update: (patch: Partial<PageState>) => void;
}

interface SectionMeta {
  id: PageSection;
  emoji: string;
  label: string;
  description: string;
}

const SECTIONS: SectionMeta[] = [
  { id: "hero", emoji: "🖼", label: "Hero / Banner", description: "Imagen + título + CTA" },
  { id: "gallery", emoji: "🏞", label: "Galería", description: "Grilla de fotos del hotel" },
  { id: "text-image", emoji: "📄", label: "Texto & imagen", description: "Bloque editorial" },
  { id: "contact-form", emoji: "✉️", label: "Formulario de contacto", description: "Formulario con campos básicos" },
  { id: "rooms", emoji: "🛏", label: "Habitaciones", description: "Cards con foto + precio" },
  { id: "cta", emoji: "🚀", label: "CTA final", description: "Llamada a reserva o acción" },
];

export function PageStep2Content({ state, update }: Props) {
  function addSection(id: PageSection) {
    update({ sections: [...state.sections, id] });
  }

  function removeSection(index: number) {
    update({ sections: state.sections.filter((_, i) => i !== index) });
  }

  function moveSection(index: number, dir: -1 | 1) {
    const next = [...state.sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    update({ sections: next });
  }

  function labelOf(id: PageSection): string {
    return SECTIONS.find((s) => s.id === id)?.label ?? id;
  }
  function emojiOf(id: PageSection): string {
    return SECTIONS.find((s) => s.id === id)?.emoji ?? "📄";
  }

  return (
    <div className="flex flex-col" style={{ padding: 20, gap: 18 }}>
      {/* Secciones disponibles */}
      <div>
        <p
          style={{
            fontSize: 10,
            color: "var(--text-secondary)",
            marginBottom: 8,
          }}
        >
          Secciones disponibles
        </p>
        <div className="flex flex-col" style={{ gap: 6 }}>
          {SECTIONS.map((sec) => (
            <div
              key={sec.id}
              className="flex items-center"
              style={{
                gap: 10,
                padding: 10,
                background: "var(--surface-page)",
                border: "0.5px solid var(--border-ui)",
                borderRadius: 6,
              }}
            >
              <span aria-hidden="true" style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>
                {sec.emoji}
              </span>
              <div className="flex flex-col flex-1 min-w-0" style={{ gap: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-primary)" }}>
                  {sec.label}
                </span>
                <span style={{ fontSize: 10, color: "var(--text-tertiary)", lineHeight: 1.3 }}>
                  {sec.description}
                </span>
              </div>
              <button
                type="button"
                onClick={() => addSection(sec.id)}
                aria-label={`Agregar ${sec.label}`}
                className="flex items-center justify-center transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  width: 24,
                  height: 24,
                  background: "var(--accent-info)",
                  border: "none",
                  borderRadius: 5,
                  cursor: "pointer",
                  flexShrink: 0,
                  outlineColor: "var(--accent-info)",
                }}
              >
                <Plus size={12} style={{ color: "#fff" }} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Orden de secciones */}
      <div>
        <p
          style={{
            fontSize: 10,
            color: "var(--text-secondary)",
            marginBottom: 8,
          }}
        >
          Orden en la página ({state.sections.length})
        </p>
        {state.sections.length === 0 ? (
          <div
            className="flex items-center justify-center"
            style={{
              padding: 16,
              border: "1px dashed var(--border-ui)",
              borderRadius: 6,
              background: "var(--surface-page)",
              fontSize: 11,
              color: "var(--text-tertiary)",
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            Tocá el botón + en una sección para agregarla acá.
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: 4 }}>
            {state.sections.map((sec, idx) => (
              <div
                key={`${sec}-${idx}`}
                className="flex items-center"
                style={{
                  gap: 8,
                  padding: "6px 10px",
                  background: "#fff",
                  border: "0.5px solid var(--border-ui)",
                  borderRadius: 5,
                }}
              >
                <GripVertical
                  size={12}
                  aria-hidden="true"
                  style={{ color: "var(--text-tertiary)", flexShrink: 0, cursor: "grab" }}
                />
                <span aria-hidden="true" style={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}>
                  {emojiOf(sec)}
                </span>
                <span
                  className="flex-1"
                  style={{ fontSize: 11, fontWeight: 500, color: "var(--text-primary)" }}
                >
                  {labelOf(sec)}
                </span>
                <button
                  type="button"
                  onClick={() => moveSection(idx, -1)}
                  disabled={idx === 0}
                  aria-label="Subir sección"
                  className="flex items-center justify-center transition-opacity hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    width: 22,
                    height: 22,
                    background: "transparent",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    outlineColor: "var(--accent-info)",
                  }}
                >
                  <ChevronUp size={11} aria-hidden="true" style={{ color: "var(--text-secondary)" }} />
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(idx, 1)}
                  disabled={idx === state.sections.length - 1}
                  aria-label="Bajar sección"
                  className="flex items-center justify-center transition-opacity hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    width: 22,
                    height: 22,
                    background: "transparent",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    outlineColor: "var(--accent-info)",
                  }}
                >
                  <ChevronDown size={11} aria-hidden="true" style={{ color: "var(--text-secondary)" }} />
                </button>
                <button
                  type="button"
                  onClick={() => removeSection(idx)}
                  aria-label="Eliminar sección"
                  className="flex items-center justify-center transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    width: 22,
                    height: 22,
                    background: "transparent",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    outlineColor: "var(--accent-info)",
                  }}
                >
                  <Trash2 size={11} aria-hidden="true" style={{ color: "var(--text-tertiary)" }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
