import { useEffect, useMemo, useRef, useState } from "react";
import {
  Braces,
  Code2,
  Columns3,
  FileCode,
  GripVertical,
  Images,
  Layout,
  LayoutGrid,
  Mail,
  Package,
  PaintBucket,
  Quote,
  Search,
  Type as TypeIcon,
  X,
  type LucideIcon,
} from "lucide-react";
import type { ComponentCategory, ComponentDef } from "../../types/builder";
import { COMPONENT_CATEGORY_COUNTS, COMPONENT_LIBRARY } from "../../types/builder";

interface ComponentsPanelProps {
  onClose: () => void;
  onSelectComponent: (component: ComponentDef) => void;
}

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

export function ComponentsPanel({ onClose, onSelectComponent }: ComponentsPanelProps) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ComponentCategory>("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Focus en search al abrir + click fuera y ESC cierran.
  useEffect(() => {
    searchRef.current?.focus();

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    // Pequeño delay para que el click del trigger no cierre inmediatamente.
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);
    document.addEventListener("keydown", handleKey);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

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

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-label="Biblioteca de componentes"
      className="flex flex-col"
      style={{
        position: "absolute",
        top: 56,
        left: 8,
        zIndex: 60,
        width: 340,
        maxHeight: "calc(100% - 64px)",
        background: "#fff",
        borderRadius: 8,
        border: "0.5px solid var(--border-ui)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.16)",
        overflow: "hidden",
      }}
    >
      {/* Header con título + close */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: "10px 12px",
          borderBottom: "0.5px solid var(--border-ui)",
        }}
      >
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
          Componentes
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel de componentes"
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

      {/* Search */}
      <div style={{ padding: "8px 12px", borderBottom: "0.5px solid var(--border-ui)" }}>
        <label
          className="flex items-center"
          style={{
            background: "var(--surface-page)",
            border: "0.5px solid var(--border-ui)",
            borderRadius: 5,
            padding: "0 8px",
            gap: 6,
            height: 28,
          }}
        >
          <Search size={11} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} aria-hidden="true" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar componentes…"
            aria-label="Buscar componentes"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 11,
              color: "var(--text-primary)",
              fontFamily: "inherit",
            }}
          />
        </label>
      </div>

      {/* Filter tabs */}
      <div
        role="tablist"
        aria-label="Filtrar por categoría"
        className="flex items-center"
        style={{
          padding: "6px 8px",
          gap: 2,
          borderBottom: "0.5px solid var(--border-ui)",
          overflowX: "auto",
        }}
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
                padding: "4px 10px",
                background: active ? "var(--text-primary)" : "transparent",
                border: "none",
                borderRadius: 4,
                fontSize: 11,
                fontWeight: active ? 600 : 500,
                color: active ? "#fff" : "var(--text-secondary)",
                cursor: "pointer",
                gap: 6,
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

      {/* Lista */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "4px 0" }}>
        {filtered.length === 0 ? (
          <div
            className="flex items-center justify-center"
            style={{
              padding: 24,
              fontSize: 11,
              color: "var(--text-tertiary)",
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            {query
              ? `Sin resultados para “${query}”`
              : "No hay componentes en esta categoría todavía."}
          </div>
        ) : (
          filtered.map((comp) => {
            const Icon = ICON_MAP[comp.icon] ?? Layout;
            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => onSelectComponent(comp)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("application/x-component-id", comp.id);
                  e.dataTransfer.effectAllowed = "copy";
                }}
                className="flex items-center w-full transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                style={{
                  padding: "8px 12px",
                  background: "transparent",
                  border: "none",
                  cursor: "grab",
                  textAlign: "left",
                  gap: 10,
                  outlineColor: "var(--ring)",
                }}
              >
                <div
                  aria-hidden="true"
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 28,
                    height: 28,
                    background: "var(--surface-page)",
                    border: "0.5px solid var(--border-ui)",
                    borderRadius: 5,
                    color: "var(--text-secondary)",
                  }}
                >
                  <Icon size={13} />
                </div>
                <div className="flex flex-col flex-1 min-w-0" style={{ gap: 1 }}>
                  <div className="flex items-baseline" style={{ gap: 6 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {comp.name}
                    </span>
                    {comp.tag && (
                      <span
                        style={{
                          fontSize: 9,
                          color: "var(--text-tertiary)",
                          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                          fontWeight: 400,
                          letterSpacing: "0.02em",
                          flexShrink: 0,
                        }}
                      >
                        |{comp.tag}
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 10,
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
                <GripVertical
                  size={12}
                  aria-hidden="true"
                  style={{ color: "var(--text-tertiary)", flexShrink: 0, cursor: "grab" }}
                />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
