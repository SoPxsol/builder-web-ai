import { Calendar, Rocket, Upload } from "lucide-react";
import type { PageState } from "../../../types/creation";
import { Toggle } from "../../wizard2/shared/Toggle";

interface Props {
  state: PageState;
  update: (patch: Partial<PageState>) => void;
}

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

export function PageStep3Seo({ state, update }: Props) {
  return (
    <div className="flex flex-col" style={{ padding: 20, gap: 16 }}>
      {/* Título SEO */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
          <label htmlFor="page-seo-title" style={{ ...labelStyle, marginBottom: 0 }}>
            Título SEO
          </label>
          <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
            {state.seoTitle.length}/60
          </span>
        </div>
        <input
          id="page-seo-title"
          type="text"
          value={state.seoTitle}
          onChange={(e) => update({ seoTitle: e.target.value.slice(0, 70) })}
          placeholder={state.name || "Aparece en Google y motores de IA"}
          maxLength={70}
          style={inputStyle}
        />
      </div>

      {/* Meta description */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
          <label htmlFor="page-meta" style={{ ...labelStyle, marginBottom: 0 }}>
            Meta descripción
          </label>
          <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
            {state.metaDescription.length}/160
          </span>
        </div>
        <textarea
          id="page-meta"
          value={state.metaDescription}
          onChange={(e) => update({ metaDescription: e.target.value.slice(0, 170) })}
          placeholder="Descripción que aparece en resultados de búsqueda. 120–160 caracteres."
          rows={3}
          maxLength={170}
          style={{
            ...inputStyle,
            height: "auto",
            minHeight: 60,
            padding: "6px 8px",
            resize: "none",
            lineHeight: 1.4,
          }}
        />
      </div>

      {/* URL canónica */}
      <div className="flex flex-col">
        <label htmlFor="page-canonical" style={labelStyle}>
          URL canónica
        </label>
        <input
          id="page-canonical"
          type="text"
          value={state.canonicalUrl || `academiapx.com/${state.slug || "tu-pagina"}`}
          onChange={(e) => update({ canonicalUrl: e.target.value })}
          style={inputStyle}
        />
      </div>

      {/* Imagen OG */}
      <div className="flex flex-col">
        <label style={labelStyle}>Imagen para compartir (OG image)</label>
        <button
          type="button"
          onClick={() =>
            update({
              ogImage: state.ogImage
                ? ""
                : "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=70&w=800",
            })
          }
          className="flex flex-col items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            width: "100%",
            height: 80,
            background: state.ogImage ? "var(--wizard-success-light)" : "var(--surface-page)",
            border: state.ogImage
              ? "0.5px dashed var(--wizard-success-border)"
              : "0.5px dashed var(--border-ui)",
            borderRadius: 6,
            cursor: "pointer",
            gap: 4,
            outlineColor: "var(--accent-info)",
          }}
        >
          <Upload
            size={16}
            aria-hidden="true"
            style={{
              color: state.ogImage ? "var(--wizard-success)" : "var(--text-tertiary)",
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: state.ogImage ? "var(--wizard-success)" : "var(--text-secondary)",
            }}
          >
            {state.ogImage ? "Imagen cargada ✓ (click para quitar)" : "Subir imagen OG"}
          </span>
          {!state.ogImage && (
            <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
              1200×630 recomendado
            </span>
          )}
        </button>
      </div>

      {/* Toggles */}
      <div className="flex flex-col" style={{ gap: 6 }}>
        <div
          className="flex items-center"
          style={{
            gap: 10,
            padding: 10,
            background: "var(--surface-page)",
            border: "0.5px solid var(--border-ui)",
            borderRadius: 5,
          }}
        >
          <div className="flex flex-col flex-1" style={{ gap: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-primary)" }}>
              Indexar en buscadores
            </span>
            <span style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.4 }}>
              Permite que Google y otros motores la encuentren.
            </span>
          </div>
          <Toggle
            checked={state.indexable}
            onChange={(v) => update({ indexable: v })}
            ariaLabel="Indexar en buscadores"
          />
        </div>
        <div
          className="flex items-center"
          style={{
            gap: 10,
            padding: 10,
            background: "var(--surface-page)",
            border: "0.5px solid var(--border-ui)",
            borderRadius: 5,
          }}
        >
          <div className="flex flex-col flex-1" style={{ gap: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-primary)" }}>
              Mostrar en menú de navegación
            </span>
            <span style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.4 }}>
              Aparece como link en la nav principal del sitio.
            </span>
          </div>
          <Toggle
            checked={state.showInNav}
            onChange={(v) => update({ showInNav: v })}
            ariaLabel="Mostrar en menú"
          />
        </div>
      </div>

      {/* Cuándo publicar */}
      <div>
        <p style={labelStyle}>Cuándo publicar</p>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {(
            [
              { value: "now" as const, icon: Rocket, label: "Publicar ahora", description: "Visible al instante" },
              { value: "scheduled" as const, icon: Calendar, label: "Programar", description: "Elegir fecha y hora" },
            ]
          ).map(({ value, icon: Icon, label, description }) => {
            const selected = state.publish === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => update({ publish: value })}
                className="flex items-start text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  gap: 8,
                  padding: 10,
                  background: selected ? "var(--accent-info-bg)" : "#fff",
                  border: selected
                    ? "1.5px solid var(--accent-info)"
                    : "0.5px solid var(--border-ui)",
                  borderRadius: 6,
                  cursor: "pointer",
                  outlineColor: "var(--accent-info)",
                }}
              >
                <Icon
                  size={14}
                  aria-hidden="true"
                  style={{
                    color: selected ? "var(--accent-info)" : "var(--text-secondary)",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />
                <div className="flex flex-col">
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: selected ? "var(--accent-info)" : "var(--text-primary)",
                    }}
                  >
                    {label}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.3 }}>
                    {description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
