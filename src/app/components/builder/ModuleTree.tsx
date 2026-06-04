import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Component } from "lucide-react";
import type { BuilderModule, ModulePropType } from "../../types/builder";

const MIME_MODULE = "application/x-module-id";
const MIME_COMPONENT = "application/x-component-id";

interface ModuleTreeProps {
  modules: BuilderModule[];
  pageName: string;
  selectedId: string | null;
  selectedPropertyName: string | null;
  onSelectModule: (id: string) => void;
  onSelectProperty: (moduleId: string, propertyName: string) => void;
  onToggleExpand: (id: string) => void;
  /** Drop de un módulo del tree sobre otro → reordenar. */
  onReorderModule: (fromId: string, toId: string) => void;
  /** Drop de un componente del palette → agregar al tree. */
  onAddFromPalette: (componentId: string) => void;
  /**
   * Slot superior del aside. Acá vive el AddModulePicker (input siempre
   * visible + catálogo desplegable + "Crear con IA"). Se renderiza encima
   * del header "Árbol de módulos" para reflejar el flujo de la tarea
   * principal del hotelero: primero agregar, después editar lo existente.
   */
  header?: ReactNode;
}

function badgeStyle(type: ModulePropType): React.CSSProperties {
  return {
    fontSize: 9,
    padding: "1px 6px",
    background: "var(--surface-page)",
    border: "0.5px solid var(--border-ui)",
    borderRadius: 3,
    color: "var(--text-secondary)",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontWeight: 500,
    letterSpacing: "0.02em",
    flexShrink: 0,
  };
}

export function ModuleTree({
  modules,
  pageName,
  selectedId,
  selectedPropertyName,
  onSelectModule,
  onSelectProperty,
  onToggleExpand,
  onReorderModule,
  onAddFromPalette,
  header,
}: ModuleTreeProps) {
  const componentCount = modules.length;
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [paletteDropActive, setPaletteDropActive] = useState(false);

  function handleDrop(e: React.DragEvent, targetModuleId?: string) {
    e.preventDefault();
    const moduleId = e.dataTransfer.getData(MIME_MODULE);
    const componentId = e.dataTransfer.getData(MIME_COMPONENT);
    setDragOverId(null);
    setPaletteDropActive(false);

    if (moduleId && targetModuleId && moduleId !== targetModuleId) {
      onReorderModule(moduleId, targetModuleId);
      return;
    }
    if (componentId) {
      onAddFromPalette(componentId);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    // Aceptar el drop si trae uno de nuestros MIME types.
    const types = Array.from(e.dataTransfer.types);
    if (types.includes(MIME_MODULE) || types.includes(MIME_COMPONENT)) {
      e.preventDefault();
      if (types.includes(MIME_COMPONENT)) setPaletteDropActive(true);
    }
  }

  return (
    <aside
      className="flex flex-col flex-shrink-0"
      style={{
        width: 240,
        background: "var(--surface-page)",
        borderRight: "0.5px solid var(--border-ui)",
      }}
    >
      {/* Slot superior — AddModulePicker (catálogo + Crear con IA).
          Prioriza la tarea principal: agregar un módulo a la página. */}
      {header}

      {/* Header del árbol — reducido, ahora secundario al picker de arriba. */}
      <div style={{ padding: "12px 14px 8px", borderBottom: "0.5px solid var(--border-ui)" }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--text-tertiary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Árbol de módulos
        </p>
        <div className="flex items-baseline" style={{ gap: 6, marginTop: 3 }}>
          <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>{pageName}</span>
          <span style={{ fontSize: 9, color: "var(--text-tertiary)" }}>
            {componentCount} {componentCount === 1 ? "componente" : "componentes"}
          </span>
        </div>
      </div>

      {/* Tree */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          padding: "6px 0",
          background: paletteDropActive ? "var(--accent-info-bg)" : "transparent",
          transition: "background 0.15s ease",
        }}
        onDragOver={handleDragOver}
        onDragLeave={() => setPaletteDropActive(false)}
        onDrop={(e) => handleDrop(e)}
      >
        {modules.map((mod) => {
          const selected = mod.id === selectedId && !selectedPropertyName;
          const isDragOver = dragOverId === mod.id;
          return (
            <div key={mod.id}>
              {/* Parent node */}
              <button
                type="button"
                onClick={() => onSelectModule(mod.id)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(MIME_MODULE, mod.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  const types = Array.from(e.dataTransfer.types);
                  if (types.includes(MIME_MODULE) || types.includes(MIME_COMPONENT)) {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOverId(mod.id);
                  }
                }}
                onDragLeave={(e) => {
                  e.stopPropagation();
                  setDragOverId((curr) => (curr === mod.id ? null : curr));
                }}
                onDrop={(e) => {
                  e.stopPropagation();
                  handleDrop(e, mod.id);
                }}
                aria-expanded={mod.expanded}
                className="flex items-center w-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                style={{
                  padding: "5px 10px",
                  background: selected
                    ? "var(--accent-info-bg)"
                    : isDragOver
                    ? "var(--wizard-amber-light)"
                    : "transparent",
                  border: "none",
                  borderLeft: selected
                    ? "2px solid var(--accent-info)"
                    : isDragOver
                    ? "2px solid var(--wizard-amber-accent)"
                    : "2px solid transparent",
                  cursor: "grab",
                  textAlign: "left",
                  gap: 4,
                  outlineColor: "var(--accent-info)",
                }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand(mod.id);
                  }}
                  aria-label={mod.expanded ? "Colapsar" : "Expandir"}
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 16,
                    height: 16,
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  {mod.expanded ? (
                    <ChevronDown size={11} style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
                  ) : (
                    <ChevronRight size={11} style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
                  )}
                </button>
                <Component
                  size={11}
                  style={{ color: selected ? "var(--accent-info)" : "var(--text-secondary)", flexShrink: 0 }}
                  aria-hidden="true"
                />
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontWeight: selected ? 600 : 500,
                    color: selected ? "var(--accent-info)" : "var(--text-primary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {mod.name}
                </span>
              </button>

              {/* Children (properties) */}
              {mod.expanded && (
                <div style={{ position: "relative", paddingLeft: 26 }}>
                  {/* Línea vertical conector */}
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: 22,
                      top: 0,
                      bottom: 4,
                      width: 1,
                      background: "var(--border-ui)",
                    }}
                  />
                  {mod.properties.map((prop) => {
                    const isSelectedProp =
                      mod.id === selectedId && prop.name === selectedPropertyName;
                    return (
                      <button
                        key={prop.name}
                        type="button"
                        onClick={() => onSelectProperty(mod.id, prop.name)}
                        className="flex items-center justify-between w-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                        style={{
                          position: "relative",
                          padding: "3px 10px 3px 8px",
                          background: isSelectedProp ? "var(--accent-info-bg)" : "transparent",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                          gap: 6,
                          outlineColor: "var(--accent-info)",
                        }}
                      >
                        {/* Conector horizontal */}
                        <span
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            left: -4,
                            top: "50%",
                            width: 8,
                            height: 1,
                            background: "var(--border-ui)",
                          }}
                        />
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                            color: isSelectedProp ? "var(--accent-info)" : "var(--text-secondary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            flex: 1,
                            fontWeight: isSelectedProp ? 600 : 400,
                          }}
                        >
                          {prop.name}
                        </span>
                        <span style={badgeStyle(prop.type)}>{prop.type}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/*
        Bottom-bar "Páginas del sitio + Crear página" removida:
        son acciones de nivel sitio que generan confusión de modo dentro
        del editor de una página. Acceso preservado en PaginasView (botón
        "Nueva página") y en la nav secundaria del sitio.
      */}
    </aside>
  );
}
