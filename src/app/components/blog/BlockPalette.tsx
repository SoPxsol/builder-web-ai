import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  BLOCK_GROUPS,
  MIME_BLOCK_TYPE,
  type BlockType,
} from "../../types/articleBlocks";

interface Props {
  /** Agrega un bloque al final del artículo (click rápido). */
  onAdd: (type: BlockType) => void;
  /**
   * Habilita arrastrar ítems al lienzo. En mobile se apaga (el ajuste fino con
   * el dedo es la fricción que evitamos; ver brief §4): el tap-para-agregar
   * sigue funcionando.
   */
  dragEnabled?: boolean;
}

/**
 * BlockPalette — panel izquierdo del editor de artículo.
 *
 * Lista los componentes que el hotelero puede sumar al cuerpo del artículo,
 * agrupados (Texto · Media · Destacados · Estructura). Cada ítem es:
 *   - draggable  → se arrastra al lienzo (BlockCanvas) e inserta en la posición
 *                  donde se suelta.
 *   - clickable  → lo agrega al final (atajo sin arrastrar).
 *
 * Mismo patrón de DnD que el builder (setData con un MIME propio), para que
 * ambos editores se sientan parte del mismo producto.
 */
export function BlockPalette({ onAdd, dragEnabled = true }: Props) {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BLOCK_GROUPS;
    return BLOCK_GROUPS.map((g) => ({
      ...g,
      blocks: g.blocks.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q),
      ),
    })).filter((g) => g.blocks.length > 0);
  }, [query]);

  return (
    <aside
      aria-label="Componentes del artículo"
      className="flex flex-col flex-shrink-0"
      style={{
        width: dragEnabled ? 232 : "100%",
        background: "var(--surface-page)",
        borderRight: dragEnabled ? "0.5px solid var(--border-ui)" : "none",
      }}
    >
      {/* Header + buscador */}
      <div
        style={{
          padding: "12px 12px 10px",
          borderBottom: "0.5px solid var(--border-ui)",
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--text-tertiary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            margin: "0 0 8px",
          }}
        >
          Componentes
        </p>
        <label
          className="flex items-center"
          style={{
            background: "#fff",
            border: "0.5px solid var(--border-ui)",
            borderRadius: 5,
            padding: "0 8px",
            gap: 6,
            height: 30,
          }}
        >
          <Search size={11} aria-hidden="true" style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar componente"
            aria-label="Buscar componente"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 11,
              color: "var(--text-primary)",
              fontFamily: "inherit",
              minWidth: 0,
            }}
          />
        </label>
        <p style={{ fontSize: 10, color: "var(--text-tertiary)", margin: "8px 0 0", lineHeight: 1.4 }}>
          {dragEnabled ? "Arrastrá al artículo o hacé clic para agregar." : "Tocá un componente para agregarlo."}
        </p>
      </div>

      {/* Grupos */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "8px 0" }}>
        {groups.length === 0 ? (
          <p
            style={{
              padding: "16px 12px",
              fontSize: 10,
              color: "var(--text-tertiary)",
              textAlign: "center",
            }}
          >
            Sin resultados para "{query}"
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.id} style={{ marginBottom: 6 }}>
              <p
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "6px 12px 4px",
                  margin: 0,
                }}
              >
                {group.label}
              </p>
              {group.blocks.map((b) => {
                const Icon = b.Icon;
                return (
                  <button
                    key={b.type}
                    type="button"
                    onClick={() => onAdd(b.type)}
                    draggable={dragEnabled}
                    onDragStart={
                      dragEnabled
                        ? (e) => {
                            e.dataTransfer.setData(MIME_BLOCK_TYPE, b.type);
                            e.dataTransfer.effectAllowed = "copy";
                          }
                        : undefined
                    }
                    title={`Agregar ${b.name}`}
                    className="flex items-center w-full transition-colors hover:bg-[#fff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                    style={{
                      padding: dragEnabled ? "6px 12px" : "10px 12px",
                      background: "transparent",
                      border: "none",
                      cursor: dragEnabled ? "grab" : "pointer",
                      textAlign: "left",
                      gap: 9,
                      outlineColor: "var(--ring)",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: 24,
                        height: 24,
                        background: "#fff",
                        border: "0.5px solid var(--border-ui)",
                        borderRadius: 5,
                        color: "var(--text-secondary)",
                      }}
                    >
                      <Icon size={12} />
                    </span>
                    <span className="flex flex-col min-w-0" style={{ gap: 1 }}>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          lineHeight: 1.2,
                        }}
                      >
                        {b.name}
                      </span>
                      <span
                        className="truncate"
                        style={{ fontSize: 9.5, color: "var(--text-tertiary)", lineHeight: 1.3 }}
                      >
                        {b.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
