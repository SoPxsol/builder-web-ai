import { useEffect, useMemo, useRef, useState } from "react";
import {
  Braces,
  Code2,
  Columns3,
  FileCode,
  Images,
  Layout,
  LayoutGrid,
  Mail,
  Package,
  PaintBucket,
  Quote,
  Search,
  Sparkles,
  Type as TypeIcon,
  type LucideIcon,
} from "lucide-react";
import type { ComponentCategory, ComponentDef } from "../../types/builder";
import { COMPONENT_CATEGORY_COUNTS, COMPONENT_LIBRARY } from "../../types/builder";
import { BUILDER_COPY } from "./copy";

/* ─── Mapeo de íconos lucide ──────────────────────────────────────────── */
const ICON_MAP: Record<string, LucideIcon> = {
  code: Code2,
  package: Package,
  "file-code": FileCode,
  "paint-bucket": PaintBucket,
  braces: Braces,
  layout: Layout,
  images: Images,
  "layout-grid": LayoutGrid,
  columns: Columns3,
  mail: Mail,
  type: TypeIcon,
  quote: Quote,
};

const TABS: { id: ComponentCategory; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "layout", label: "Layout" },
  { id: "content", label: "Contenido" },
  { id: "code", label: "Código" },
];

interface AddModulePickerProps {
  /** Agrega un componente al tree (handler ya existente en BuilderView). */
  onAddComponent: (component: ComponentDef) => void;
  /**
   * Dispara el flujo de IA. Hoy abre el AiAssistantPanel con un prompt
   * pre-cargado. Cuando exista endpoint real, este handler debe llamar a
   * un servicio de generación de módulos.
   *
   * TODO(backend): no hay endpoint de generación de módulos por IA.
   * El handler actual sólo abre el panel de prompt con un texto sugerido.
   */
  onCreateWithAi: () => void;
}

/**
 * AddModulePicker — primero del panel lateral del editor.
 *
 * Patrón: progressive disclosure.
 *   - Estado colapsado: solo el input "Buscar módulo o componente".
 *   - Estado expandido (focus o query no vacía): filtros por categoría +
 *     catálogo + botón "Crear con IA" debajo.
 *   - Se colapsa al perder foco (si la query está vacía) o al elegir un
 *     componente.
 *
 * No reemplaza al ComponentsPanel actual (que sigue siendo el catálogo
 * "completo" accesible vía el botón "+" de la toolbar para drag-to-canvas).
 * Esta versión inline está pensada para el flujo "voy a sumar un módulo
 * a esta página" que es el más frecuente.
 */
export function AddModulePicker({ onAddComponent, onCreateWithAi }: AddModulePickerProps) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ComponentCategory>("all");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cerrar al click afuera (si la query está vacía — si hay query la dejamos
  // abierta para no perder el contexto de búsqueda) y al ESC.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        if (!query) setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        inputRef.current?.blur();
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COMPONENT_LIBRARY.filter((c) => {
      const matchesTab = activeTab === "all" || c.category === activeTab;
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.tag ?? "").toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [query, activeTab]);

  function handleSelect(comp: ComponentDef) {
    onAddComponent(comp);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  function handleAi() {
    onCreateWithAi();
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  return (
    <div
      ref={wrapperRef}
      style={{
        padding: "12px 12px 10px",
        borderBottom: "0.5px solid var(--border-ui)",
        background: "var(--surface-page)",
      }}
    >
      {/* Input siempre visible */}
      <label
        className="flex items-center"
        style={{
          background: "#fff",
          border: `0.5px solid ${open ? "var(--accent-info)" : "var(--border-ui)"}`,
          borderRadius: 5,
          padding: "0 8px",
          gap: 6,
          height: 30,
          transition: "border-color 0.15s ease",
        }}
      >
        <Search
          size={11}
          aria-hidden="true"
          style={{ color: open ? "var(--accent-info)" : "var(--text-tertiary)", flexShrink: 0 }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={BUILDER_COPY.addModule.searchPlaceholder}
          aria-label={BUILDER_COPY.addModule.searchAriaLabel}
          aria-expanded={open}
          aria-controls="add-module-picker-list"
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

      {/* Área desplegada — solo cuando open */}
      {open && (
        <div
          id="add-module-picker-list"
          style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}
        >
          {/* Filtros por categoría */}
          <div
            role="tablist"
            aria-label="Filtrar componentes por categoría"
            className="flex items-center"
            style={{ gap: 2, overflowX: "auto" }}
          >
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              const count = COMPONENT_CATEGORY_COUNTS[tab.id];
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                  style={{
                    padding: "3px 8px",
                    background: active ? "var(--text-primary)" : "#fff",
                    border: active ? "none" : "0.5px solid var(--border-ui)",
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: active ? 600 : 500,
                    color: active ? "#fff" : "var(--text-secondary)",
                    cursor: "pointer",
                    gap: 4,
                    whiteSpace: "nowrap",
                    outlineColor: "var(--ring)",
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 500,
                      color: active ? "rgba(255,255,255,0.7)" : "var(--text-tertiary)",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Lista de componentes */}
          <div
            role="listbox"
            aria-label="Componentes disponibles"
            style={{
              maxHeight: 260,
              overflowY: "auto",
              background: "#fff",
              border: "0.5px solid var(--border-ui)",
              borderRadius: 6,
            }}
          >
            {filtered.length === 0 ? (
              <p
                style={{
                  padding: "16px 12px",
                  fontSize: 10,
                  color: "var(--text-tertiary)",
                  textAlign: "center",
                  lineHeight: 1.4,
                }}
              >
                {query ? `Sin resultados para "${query}"` : "No hay componentes en esta categoría."}
              </p>
            ) : (
              filtered.map((comp) => {
                const Icon = ICON_MAP[comp.icon] ?? Layout;
                return (
                  <button
                    key={comp.id}
                    type="button"
                    role="option"
                    aria-selected={false}
                    onClick={() => handleSelect(comp)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("application/x-component-id", comp.id);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    className="flex items-center w-full transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                    style={{
                      padding: "6px 8px",
                      background: "transparent",
                      border: "none",
                      cursor: "grab",
                      textAlign: "left",
                      gap: 8,
                      outlineColor: "var(--ring)",
                    }}
                  >
                    <div
                      aria-hidden="true"
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: 22,
                        height: 22,
                        background: "var(--surface-page)",
                        border: "0.5px solid var(--border-ui)",
                        borderRadius: 4,
                        color: "var(--text-secondary)",
                      }}
                    >
                      <Icon size={11} />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0" style={{ gap: 1 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          lineHeight: 1.2,
                        }}
                      >
                        {comp.name}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          color: "var(--text-tertiary)",
                          lineHeight: 1.3,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {comp.description}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Botón "Crear con IA" — camino alternativo */}
          <button
            type="button"
            onClick={handleAi}
            className="flex items-center justify-center transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              height: 30,
              padding: "0 12px",
              gap: 6,
              background: "#fff",
              border: "0.5px solid var(--border-ui)",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 500,
              color: "var(--text-primary)",
              cursor: "pointer",
              outlineColor: "var(--accent-info)",
            }}
          >
            <Sparkles
              size={12}
              aria-hidden="true"
              style={{ color: "#8b5cf6" }}
            />
            <span>{BUILDER_COPY.addModule.createWithAi}</span>
          </button>
        </div>
      )}
    </div>
  );
}
