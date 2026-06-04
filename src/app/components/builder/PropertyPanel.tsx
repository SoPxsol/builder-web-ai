import { useEffect, useState } from "react";
import { Braces, ChevronRight, X } from "lucide-react";
import type { BuilderModule, ModuleProperty } from "../../types/builder";

interface PropertyPanelProps {
  module: BuilderModule;
  property: ModuleProperty;
  /** Valor actual (ya committed) de la propiedad. El panel edita un buffer
   *  local y solo lo escribe al draft al apretar Aplicar. */
  initialValue: string;
  /** Commit del buffer local al state del editor. NO publica. */
  onApply: (value: string) => void;
  onClose: () => void;
}

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  color: "var(--text-secondary)",
  marginBottom: 4,
  display: "block",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
};

const baseInputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--surface-page)",
  border: "0.5px solid var(--border-ui)",
  borderRadius: 5,
  padding: "6px 8px",
  fontSize: 11,
  color: "var(--text-primary)",
  outline: "none",
  outlineColor: "var(--accent-info)",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
};

/**
 * Panel de edición de una propiedad. Patrón Aplicar/Cancelar:
 *
 *   - El input edita un buffer LOCAL. El canvas/draft NO cambia con cada tecla.
 *   - "Aplicar" hace commit del buffer al draft global. El autosave global
 *     se encarga de persistir (≤1.5 s después).
 *   - "Cancelar" descarta el buffer y restaura el valor original.
 *   - "Aplicar" queda deshabilitado si el buffer es igual al valor original
 *     (no hay nada que aplicar).
 *
 * Las palabras "Guardar" y "Publicar" NO aparecen en este panel — ese
 * vocabulario vive solo en los controles globales de la barra superior.
 */
export function PropertyPanel({ module, property, initialValue, onApply, onClose }: PropertyPanelProps) {
  const [draft, setDraft] = useState(initialValue);

  // Si el caller cambia la propiedad seleccionada (módulo distinto, prop
  // distinta) sin desmontar el panel, refrescamos el buffer.
  useEffect(() => {
    setDraft(initialValue);
  }, [module.id, property.name, initialValue]);

  const dirty = draft !== initialValue;

  function handleApply() {
    if (!dirty) return;
    onApply(draft);
  }

  function handleCancel() {
    setDraft(initialValue);
  }

  const renderEditor = () => {
    switch (property.type) {
      case "STRING":
        return (
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Valor de ${property.name}`}
            aria-label={`Editar ${property.name}`}
            style={baseInputStyle}
            autoFocus
          />
        );
      case "NUMBER":
        return (
          <input
            type="number"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-label={`Editar ${property.name}`}
            style={baseInputStyle}
            autoFocus
          />
        );
      case "BOOLEAN":
        return (
          <div className="flex items-center" style={{ gap: 6 }}>
            {["true", "false"].map((opt) => {
              const selected = draft === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setDraft(opt)}
                  className="transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                  style={{
                    padding: "4px 12px",
                    background: selected ? "var(--accent-info)" : "var(--surface-page)",
                    border: selected
                      ? "0.5px solid var(--accent-info)"
                      : "0.5px solid var(--border-ui)",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 500,
                    color: selected ? "#fff" : "var(--text-secondary)",
                    cursor: "pointer",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    outlineColor: "var(--accent-info)",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        );
      case "OBJECT":
      case "ARRAY":
        return (
          <div className="flex flex-col" style={{ gap: 6 }}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label={`Editar ${property.name}`}
              placeholder={property.type === "ARRAY" ? "[ … ]" : "{ … }"}
              rows={5}
              style={{
                ...baseInputStyle,
                minHeight: 100,
                resize: "vertical",
                lineHeight: 1.5,
              }}
              autoFocus
            />
            <p
              className="flex items-center"
              style={{
                fontSize: 10,
                color: "var(--text-tertiary)",
                lineHeight: 1.4,
                gap: 4,
              }}
            >
              <Braces size={9} aria-hidden="true" />
              JSON {property.type.toLowerCase()}. Se valida al aplicar.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <aside
      role="complementary"
      aria-label={`Propiedades de ${module.name} · ${property.name}`}
      className="flex flex-col flex-shrink-0"
      style={{
        width: 300,
        background: "#fff",
        borderLeft: "0.5px solid var(--border-ui)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center"
        style={{
          padding: "10px 14px",
          borderBottom: "0.5px solid var(--border-ui)",
          gap: 6,
        }}
      >
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center" style={{ gap: 4, color: "var(--text-secondary)", fontSize: 9 }}>
            <span
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontWeight: 500,
              }}
            >
              {module.name}
            </span>
            <ChevronRight size={9} aria-hidden="true" />
            <span
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                color: "var(--text-tertiary)",
              }}
            >
              propiedad
            </span>
          </div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-primary)",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              marginTop: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {property.name}
          </p>
        </div>
        <span
          style={{
            fontSize: 9,
            padding: "1px 6px",
            background: "var(--surface-page)",
            border: "0.5px solid var(--border-ui)",
            borderRadius: 3,
            color: "var(--text-secondary)",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          {property.type}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel de propiedades"
          className="flex items-center justify-center transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
          style={{
            width: 22,
            height: 22,
            background: "transparent",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            outlineColor: "var(--ring)",
          }}
        >
          <X size={12} aria-hidden="true" style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto" style={{ padding: 14 }}>
        <label htmlFor={`prop-${property.name}`} style={labelStyle}>
          Valor
        </label>
        {renderEditor()}
      </div>

      {/* Footer Aplicar / Cancelar.
          "Aplicar" no guarda ni publica: solo confirma el cambio en el draft
          del editor. El autosave global persiste; la publicación es explícita
          desde la barra superior. */}
      <div
        className="flex items-center justify-end"
        style={{
          padding: "10px 14px",
          borderTop: "0.5px solid var(--border-ui)",
          gap: 8,
          background: "var(--surface-page)",
        }}
      >
        <button
          type="button"
          onClick={handleCancel}
          disabled={!dirty}
          className="transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            height: 28,
            padding: "0 12px",
            background: "transparent",
            border: "0.5px solid var(--border-ui)",
            borderRadius: 5,
            fontSize: 11,
            fontWeight: 500,
            color: "var(--text-secondary)",
            cursor: dirty ? "pointer" : "not-allowed",
            outlineColor: "var(--ring)",
          }}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleApply}
          disabled={!dirty}
          className="transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            height: 28,
            padding: "0 14px",
            background: dirty ? "var(--accent-info)" : "var(--border-ui)",
            border: "none",
            borderRadius: 5,
            fontSize: 11,
            fontWeight: 600,
            color: dirty ? "#fff" : "var(--text-tertiary)",
            cursor: dirty ? "pointer" : "not-allowed",
            outlineColor: "var(--accent-info)",
          }}
        >
          Aplicar
        </button>
      </div>
    </aside>
  );
}
