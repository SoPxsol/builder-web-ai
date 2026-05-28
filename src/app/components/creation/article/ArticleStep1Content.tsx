import { useState } from "react";
import {
  Bold,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Underline,
  Upload,
  X,
} from "lucide-react";
import type { ArticleState } from "../../../types/creation";

interface Props {
  state: ArticleState;
  update: (patch: Partial<ArticleState>) => void;
}

const CATEGORIES_OPTIONS = [
  "Experiencias",
  "Gastronomía",
  "Eventos",
  "Tips de viaje",
  "Cultura local",
  "Familia",
];

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 8,
  border: "0.5px solid var(--border-ui)",
  padding: 28,
};

const inputBase: React.CSSProperties = {
  width: "100%",
  background: "var(--surface-page)",
  border: "0.5px solid var(--border-ui)",
  borderRadius: 6,
  padding: "8px 10px",
  fontSize: 12,
  color: "var(--text-primary)",
  outline: "none",
  outlineColor: "var(--accent-info)",
  fontFamily: "inherit",
};

export function ArticleStep1Content({ state, update }: Props) {
  const [tagDraft, setTagDraft] = useState("");

  function addTag() {
    const t = tagDraft.trim();
    if (!t || state.tags.includes(t)) return;
    update({ tags: [...state.tags, t] });
    setTagDraft("");
  }

  function removeTag(tag: string) {
    update({ tags: state.tags.filter((t) => t !== tag) });
  }

  function toggleCategory(cat: string) {
    const next = state.categories.includes(cat)
      ? state.categories.filter((c) => c !== cat)
      : [...state.categories, cat];
    update({ categories: next });
  }

  return (
    <div className="flex flex-col" style={{ gap: 20, padding: 8 }}>
      <div style={card}>
        {/* Título grande sin label */}
        <input
          type="text"
          value={state.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Título del artículo *"
          aria-label="Título del artículo"
          className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            padding: "4px 0 12px",
            fontSize: 22,
            fontWeight: 600,
            color: "var(--text-primary)",
            outline: "none",
            outlineColor: "var(--accent-info)",
            fontFamily: "inherit",
            borderBottom: "0.5px solid var(--border-ui)",
            marginBottom: 16,
          }}
        />

        {/* Extracto */}
        <label htmlFor="art-excerpt" style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>
          Extracto / descripción corta
        </label>
        <textarea
          id="art-excerpt"
          value={state.excerpt}
          onChange={(e) => update({ excerpt: e.target.value })}
          placeholder="Breve resumen que aparece en el listado de artículos y en redes sociales."
          rows={2}
          style={{ ...inputBase, minHeight: 50, resize: "none", lineHeight: 1.4, marginBottom: 18 }}
        />

        {/* Upload de portada */}
        <label style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>
          Imagen de portada
        </label>
        <button
          type="button"
          onClick={() =>
            update({
              coverImageUrl: state.coverImageUrl
                ? ""
                : "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=70&w=1200",
            })
          }
          className="flex flex-col items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            width: "100%",
            height: 120,
            marginBottom: 20,
            background: state.coverImageUrl
              ? `url(${state.coverImageUrl}) center/cover, var(--wizard-success-light)`
              : "var(--surface-page)",
            border: state.coverImageUrl
              ? "0.5px solid var(--wizard-success-border)"
              : "0.5px dashed var(--border-ui)",
            borderRadius: 6,
            cursor: "pointer",
            gap: 4,
            outlineColor: "var(--accent-info)",
            position: "relative",
          }}
          aria-label={state.coverImageUrl ? "Quitar imagen de portada" : "Subir imagen de portada"}
        >
          {state.coverImageUrl ? (
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
              ✓ Portada cargada · click para quitar
            </span>
          ) : (
            <>
              <Upload size={20} style={{ color: "var(--text-tertiary)" }} aria-hidden="true" />
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>
                Subir imagen de portada
              </span>
              <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
                JPG o PNG · 1200×800 recomendado
              </span>
            </>
          )}
        </button>

        {/* Editor texto rico */}
        <label htmlFor="art-body" style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>
          Contenido del artículo
        </label>
        <div
          style={{
            border: "0.5px solid var(--border-ui)",
            borderRadius: 6,
            overflow: "hidden",
            background: "var(--surface-page)",
          }}
        >
          {/* Toolbar */}
          <div
            className="flex items-center"
            style={{
              gap: 2,
              padding: "6px 8px",
              borderBottom: "0.5px solid var(--border-ui)",
              background: "#fff",
              flexWrap: "wrap",
            }}
          >
            {[
              { Icon: Bold, label: "Negrita" },
              { Icon: Italic, label: "Cursiva" },
              { Icon: Underline, label: "Subrayado" },
            ].map(({ Icon, label }) => (
              <ToolbarButton key={label} Icon={Icon} label={label} />
            ))}
            <span style={{ width: 1, height: 16, background: "var(--border-ui)", margin: "0 4px" }} aria-hidden="true" />
            {["H1", "H2", "H3"].map((h) => (
              <button
                key={h}
                type="button"
                aria-label={`Encabezado ${h}`}
                className="flex items-center justify-center transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  width: 24,
                  height: 24,
                  background: "transparent",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  outlineColor: "var(--accent-info)",
                }}
              >
                {h}
              </button>
            ))}
            <span style={{ width: 1, height: 16, background: "var(--border-ui)", margin: "0 4px" }} aria-hidden="true" />
            {[
              { Icon: List, label: "Lista" },
              { Icon: ListOrdered, label: "Lista numerada" },
              { Icon: Link2, label: "Enlace" },
              { Icon: ImageIcon, label: "Imagen" },
              { Icon: Quote, label: "Cita" },
            ].map(({ Icon, label }) => (
              <ToolbarButton key={label} Icon={Icon} label={label} />
            ))}
          </div>
          <textarea
            id="art-body"
            value={state.body}
            onChange={(e) => update({ body: e.target.value })}
            placeholder="Empezá a escribir tu artículo…"
            rows={8}
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              ...inputBase,
              minHeight: 200,
              border: "none",
              background: "transparent",
              padding: "12px 14px",
              resize: "vertical",
              lineHeight: 1.6,
              fontSize: 13,
            }}
          />
        </div>
      </div>

      {/* Categorías y Tags */}
      <div style={card}>
        <label style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
          Categorías
        </label>
        <div className="flex flex-wrap" style={{ gap: 4, marginBottom: 18 }}>
          {CATEGORIES_OPTIONS.map((cat) => {
            const selected = state.categories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                aria-pressed={selected}
                className="inline-flex items-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  padding: "4px 10px",
                  background: selected ? "var(--accent-info)" : "#fff",
                  border: selected
                    ? "1px solid var(--accent-info)"
                    : "0.5px solid var(--border-ui)",
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 500,
                  color: selected ? "#fff" : "var(--text-secondary)",
                  cursor: "pointer",
                  gap: 4,
                  outlineColor: "var(--accent-info)",
                }}
              >
                {cat}
                {selected && <X size={10} aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        <label htmlFor="art-tag" style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>
          Etiquetas (Enter para agregar)
        </label>
        <input
          id="art-tag"
          type="text"
          value={tagDraft}
          onChange={(e) => setTagDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="Ej: verano, escapada, gastronomía"
          style={{ ...inputBase, marginBottom: state.tags.length ? 8 : 0 }}
        />
        {state.tags.length > 0 && (
          <div className="flex flex-wrap" style={{ gap: 4 }}>
            {state.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center"
                style={{
                  padding: "3px 8px",
                  background: "var(--surface-page)",
                  border: "0.5px solid var(--border-ui)",
                  borderRadius: 12,
                  fontSize: 10,
                  color: "var(--text-secondary)",
                  gap: 4,
                }}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  aria-label={`Eliminar etiqueta ${tag}`}
                  className="flex items-center justify-center transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    width: 14,
                    height: 14,
                    background: "transparent",
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                    outlineColor: "var(--accent-info)",
                  }}
                >
                  <X size={9} aria-hidden="true" style={{ color: "var(--text-tertiary)" }} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolbarButton({ Icon, label }: { Icon: React.ElementType; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex items-center justify-center transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        width: 24,
        height: 24,
        background: "transparent",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        outlineColor: "var(--accent-info)",
      }}
    >
      <Icon size={13} style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
    </button>
  );
}
