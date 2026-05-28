import { Calendar, FileEdit, Rocket, Upload } from "lucide-react";
import type { ArticleState } from "../../../types/creation";

interface Props {
  state: ArticleState;
  update: (patch: Partial<ArticleState>) => void;
}

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 8,
  border: "0.5px solid var(--border-ui)",
  padding: 20,
};

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

export function ArticleStep2Seo({ state, update }: Props) {
  // Pre-rellenar seo title con title y meta con excerpt en el primer render del paso.
  const seoTitle = state.seoTitle || state.title;
  const metaDescription = state.metaDescription || state.excerpt;
  const slug = state.slug || slugify(state.title);

  return (
    <div className="flex flex-col" style={{ gap: 14, padding: 8 }}>
      {/* Card SEO */}
      <div style={card}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
          SEO
        </p>

        <div className="flex flex-col" style={{ gap: 12 }}>
          <div className="flex flex-col">
            <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
              <label htmlFor="art-seo-title" style={{ ...labelStyle, marginBottom: 0 }}>
                Título SEO <span style={{ color: "var(--accent-info)" }}>*</span>
              </label>
              <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
                {seoTitle.length}/60
              </span>
            </div>
            <input
              id="art-seo-title"
              type="text"
              value={seoTitle}
              onChange={(e) => update({ seoTitle: e.target.value.slice(0, 70) })}
              placeholder="Aparece en Google y motores de IA"
              maxLength={70}
              style={inputStyle}
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
              <label htmlFor="art-meta" style={{ ...labelStyle, marginBottom: 0 }}>
                Meta descripción
              </label>
              <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
                {metaDescription.length}/160
              </span>
            </div>
            <textarea
              id="art-meta"
              value={metaDescription}
              onChange={(e) => update({ metaDescription: e.target.value.slice(0, 170) })}
              placeholder="Resumen que aparece en resultados de búsqueda."
              rows={2}
              maxLength={170}
              style={{
                ...inputStyle,
                height: "auto",
                minHeight: 56,
                padding: "6px 8px",
                resize: "none",
                lineHeight: 1.4,
              }}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="art-slug" style={labelStyle}>
              URL del artículo
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
                academiapx.com/blog/
              </span>
              <input
                id="art-slug"
                type="text"
                value={slug}
                onChange={(e) => update({ slug: slugify(e.target.value) })}
                placeholder="tu-articulo"
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
        </div>
      </div>

      {/* Card Imagen OG */}
      <div style={card}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
          Imagen para compartir
        </p>
        <p style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 12 }}>
          Si no subís imagen, se usará la portada del artículo.
        </p>
        <button
          type="button"
          onClick={() =>
            update({
              ogImage: state.ogImage
                ? ""
                : "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=70&w=1200",
            })
          }
          className="flex flex-col items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            width: "100%",
            height: 80,
            background: state.ogImage
              ? `url(${state.ogImage}) center/cover, var(--wizard-success-light)`
              : "var(--surface-page)",
            border: state.ogImage
              ? "0.5px solid var(--wizard-success-border)"
              : "0.5px dashed var(--border-ui)",
            borderRadius: 6,
            cursor: "pointer",
            gap: 4,
            outlineColor: "var(--accent-info)",
          }}
        >
          {state.ogImage ? (
            <span
              style={{
                background: "rgba(0,0,0,0.55)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 500,
                padding: "4px 10px",
                borderRadius: 4,
              }}
            >
              ✓ OG cargada · click para quitar
            </span>
          ) : (
            <>
              <Upload size={16} aria-hidden="true" style={{ color: "var(--text-tertiary)" }} />
              <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-secondary)" }}>
                Subir imagen OG (1200×630)
              </span>
            </>
          )}
        </button>
      </div>

      {/* Card Publicación */}
      <div style={card}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
          Publicación
        </p>

        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div className="flex flex-col">
            <label htmlFor="art-author" style={labelStyle}>
              Autor
            </label>
            <select
              id="art-author"
              value={state.author}
              onChange={(e) => update({ author: e.target.value })}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="Sofía García">Sofía García</option>
              <option value="Equipo del hotel">Equipo del hotel</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="art-date" style={labelStyle}>
              Fecha
            </label>
            <input
              id="art-date"
              type="date"
              value={state.publishDate}
              onChange={(e) => update({ publishDate: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>

        <div className="flex flex-col" style={{ gap: 6 }}>
          {(
            [
              {
                value: "now" as const,
                icon: Rocket,
                label: "Publicar ahora",
                description: "Visible al instante en el blog",
              },
              {
                value: "draft" as const,
                icon: FileEdit,
                label: "Guardar como borrador",
                description: "Lo terminás más tarde",
              },
              {
                value: "scheduled" as const,
                icon: Calendar,
                label: "Programar",
                description: "Se publica en la fecha elegida",
              },
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
                className="flex items-center text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  gap: 10,
                  padding: 10,
                  background: selected ? "var(--accent-info-bg)" : "var(--surface-page)",
                  border: selected
                    ? "1px solid var(--accent-info)"
                    : "0.5px solid var(--border-ui)",
                  borderRadius: 6,
                  cursor: "pointer",
                  outlineColor: "var(--accent-info)",
                }}
              >
                <span
                  aria-hidden="true"
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: selected ? "var(--accent-info)" : "#fff",
                    border: selected ? "none" : "1.5px solid var(--border-ui)",
                  }}
                >
                  {selected && (
                    <span
                      style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }}
                    />
                  )}
                </span>
                <Icon
                  size={13}
                  aria-hidden="true"
                  style={{
                    color: selected ? "var(--accent-info)" : "var(--text-secondary)",
                    flexShrink: 0,
                  }}
                />
                <div className="flex flex-col">
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "var(--text-primary)",
                    }}
                  >
                    {label}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>
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
