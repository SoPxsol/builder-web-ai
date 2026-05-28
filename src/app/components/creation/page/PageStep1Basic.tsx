import { Copy, FileEdit, LayoutTemplate } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PageState, PageTemplate } from "../../../types/creation";

interface Props {
  state: PageState;
  update: (patch: Partial<PageState>) => void;
}

interface TemplateOption {
  id: PageTemplate;
  icon: LucideIcon;
  emoji: string;
  label: string;
  description: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: "blank",
    icon: FileEdit,
    emoji: "🏗",
    label: "En blanco",
    description: "Construyo la página desde cero con secciones.",
  },
  {
    id: "from-template",
    icon: LayoutTemplate,
    emoji: "📋",
    label: "Desde template",
    description: "Empezar con una plantilla profesional.",
  },
  {
    id: "duplicate",
    icon: Copy,
    emoji: "📄",
    label: "Duplicar página",
    description: "Copiar una página existente y modificarla.",
  },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 28,
  padding: "0 8px",
  background: "var(--surface-page)",
  border: "0.5px solid var(--border-ui)",
  borderRadius: 6,
  fontSize: 11,
  color: "var(--text-primary)",
  outline: "none",
  outlineColor: "var(--accent-info)",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  color: "var(--text-secondary)",
  marginBottom: 4,
  display: "block",
};

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function PageStep1Basic({ state, update }: Props) {
  function setName(value: string) {
    // Auto-genera slug si está vacío
    const slug = state.slug ? state.slug : slugify(value);
    update({ name: value, slug });
  }

  return (
    <div className="flex flex-col" style={{ padding: 20, gap: 16 }}>
      {/* Nombre */}
      <div className="flex flex-col">
        <label htmlFor="page-name" style={labelStyle}>
          Nombre de la página <span style={{ color: "var(--accent-info)" }}>*</span>
        </label>
        <input
          id="page-name"
          type="text"
          value={state.name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Experiencias en la zona"
          style={inputStyle}
        />
        <span style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 4 }}>
          Aparece en el menú de navegación
        </span>
      </div>

      {/* URL slug con prefix */}
      <div className="flex flex-col">
        <label htmlFor="page-slug" style={labelStyle}>
          URL
        </label>
        <div
          className="flex items-stretch"
          style={{
            border: "0.5px solid var(--border-ui)",
            borderRadius: 6,
            overflow: "hidden",
            background: "var(--surface-page)",
          }}
        >
          <span
            aria-hidden="true"
            className="flex items-center"
            style={{
              padding: "0 10px",
              background: "#efefef",
              fontSize: 11,
              color: "var(--text-secondary)",
              borderRight: "0.5px solid var(--border-ui)",
              whiteSpace: "nowrap",
            }}
          >
            academiapx.com /
          </span>
          <input
            id="page-slug"
            type="text"
            value={state.slug}
            onChange={(e) => update({ slug: slugify(e.target.value) })}
            placeholder="tu-pagina"
            className="flex-1"
            style={{
              ...inputStyle,
              width: "auto",
              border: "none",
              borderRadius: 0,
              background: "transparent",
            }}
          />
        </div>
      </div>

      {/* Template */}
      <div className="flex flex-col" style={{ gap: 6 }}>
        <span style={labelStyle}>Punto de partida</span>
        <div className="flex flex-col" style={{ gap: 6 }}>
          {TEMPLATES.map(({ id, emoji, label, description }) => {
            const selected = state.template === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => update({ template: id })}
                aria-pressed={selected}
                className="flex items-start text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  gap: 10,
                  padding: 10,
                  background: selected ? "var(--accent-info-bg)" : "#fff",
                  border: selected ? "1.5px solid var(--accent-info)" : "0.5px solid var(--border-ui)",
                  borderRadius: 6,
                  cursor: "pointer",
                  outlineColor: "var(--accent-info)",
                }}
              >
                <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>
                  {emoji}
                </span>
                <div className="flex flex-col" style={{ gap: 2 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: selected ? "var(--accent-info)" : "var(--text-primary)",
                    }}
                  >
                    {label}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                    {description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Idioma */}
      <div className="flex flex-col">
        <label htmlFor="page-lang" style={labelStyle}>
          Idioma
        </label>
        <select
          id="page-lang"
          value={state.language}
          onChange={(e) => update({ language: e.target.value })}
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          <option value="es">Español (ES)</option>
          <option value="en">Inglés (EN)</option>
          <option value="pt">Portugués (PT)</option>
        </select>
      </div>
    </div>
  );
}
