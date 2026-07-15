import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  MoreHorizontal,
  Pencil,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import type { BuilderModule, ModulePropType } from "../../types/builder";
import { Badge } from "../ui/badge";
import { BUILDER_COPY } from "./copy";
import { deriveAlias, displayAlias, sectionIcon, sectionSubtitle } from "./sectionMeta";

const MIME_MODULE = "application/x-module-id";
const MIME_COMPONENT = "application/x-component-id";

const T = BUILDER_COPY.tree;

interface ModuleTreeProps {
  modules: BuilderModule[];
  /** Values editados — se usan para derivar el alias de cada fila. */
  propertyValues: Record<string, string>;
  pageName: string;
  selectedId: string | null;
  selectedPropertyName: string | null;
  onSelectModule: (id: string) => void;
  onSelectProperty: (moduleId: string, propertyName: string) => void;
  onToggleExpand: (id: string) => void;
  /**
   * Único motor de reordenamiento. Mueve `fromId` a la posición final
   * `toIndex` (0-based, en el array resultante tras quitar el elemento).
   * Lo usan las dos superficies (panel y canvas) y el teclado.
   */
  onReorderModule: (fromId: string, toIndex: number) => void;
  /** Drop de un componente del palette → insertar en `atIndex` (o al final). */
  onAddFromPalette: (componentId: string, atIndex?: number) => void;
  /** Abre el panel de edición (Contenido/Sección) de la sección. */
  onEditModule: (id: string) => void;
  /** Renombra el alias de la sección. */
  onRenameModule: (id: string, alias: string) => void;
  /** Alterna oculto/visible. */
  onToggleHidden: (id: string) => void;
  /** Duplica la sección (clon insertado debajo). */
  onDuplicateModule: (id: string) => void;
  /** Solicita eliminar (la confirmación destructiva vive en el padre). */
  onRequestDeleteModule: (id: string) => void;
  /**
   * Slot superior del aside. Acá vive el AddModulePicker (input siempre
   * visible + catálogo desplegable + "Crear con IA"), encima del panel de
   * estructura: primero agregar, después editar lo existente.
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
  propertyValues,
  pageName,
  selectedId,
  selectedPropertyName,
  onSelectModule,
  onSelectProperty,
  onToggleExpand,
  onReorderModule,
  onAddFromPalette,
  onEditModule,
  onRenameModule,
  onToggleHidden,
  onDuplicateModule,
  onRequestDeleteModule,
  header,
}: ModuleTreeProps) {
  const sectionCount = modules.length;

  /* ─── Estado de drag & drop (puntero) ──────────────────────────────────── */
  const [draggingId, setDraggingId] = useState<string | null>(null);
  // Índice de inserción en el array ORIGINAL (0..length). La línea indicadora
  // se dibuja antes de la fila `dropIndex`.
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [paletteDropActive, setPaletteDropActive] = useState(false);

  /* ─── Estado de reordenamiento por teclado ─────────────────────────────── */
  const [grabbedId, setGrabbedId] = useState<string | null>(null);
  const grabbedOriginRef = useRef<number>(0);

  /* ─── Edición inline del alias ─────────────────────────────────────────── */
  const [renamingId, setRenamingId] = useState<string | null>(null);

  /* ─── Menú de acciones por fila ────────────────────────────────────────── */
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  /* ─── Live region para anunciar movimientos ────────────────────────────── */
  const [announcement, setAnnouncement] = useState("");

  function resetDrag() {
    setDraggingId(null);
    setDropIndex(null);
    setPaletteDropActive(false);
  }

  /** Drop a nivel de lista: aplica reordenamiento o alta desde palette. */
  function handleListDrop(e: React.DragEvent) {
    e.preventDefault();
    const moduleId = e.dataTransfer.getData(MIME_MODULE);
    const componentId = e.dataTransfer.getData(MIME_COMPONENT);
    const idx = dropIndex ?? modules.length;

    if (moduleId) {
      const fromIndex = modules.findIndex((m) => m.id === moduleId);
      if (fromIndex >= 0) {
        const finalIndex = idx > fromIndex ? idx - 1 : idx;
        if (finalIndex !== fromIndex) onReorderModule(moduleId, finalIndex);
      }
    } else if (componentId) {
      onAddFromPalette(componentId, idx);
    }
    resetDrag();
  }

  /** Calcula el índice de inserción según la mitad de la fila bajo el puntero. */
  function handleRowDragOver(e: React.DragEvent, index: number) {
    const types = Array.from(e.dataTransfer.types);
    const isModule = types.includes(MIME_MODULE);
    const isComponent = types.includes(MIME_COMPONENT);
    if (!isModule && !isComponent) return;
    e.preventDefault();
    e.stopPropagation();
    if (isComponent) setPaletteDropActive(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const after = e.clientY - rect.top > rect.height / 2;
    setDropIndex(after ? index + 1 : index);
  }

  /* ─── Teclado: tomar / mover / soltar / cancelar ───────────────────────── */
  function handleHandleKeyDown(e: React.KeyboardEvent, mod: BuilderModule, index: number) {
    const alias = displayAlias(mod, propertyValues);
    const total = modules.length;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (grabbedId === mod.id) {
        setGrabbedId(null);
        setAnnouncement(T.announce.dropped(alias, index + 1, total));
      } else {
        setGrabbedId(mod.id);
        grabbedOriginRef.current = index;
        setAnnouncement(T.announce.grabbed(alias, index + 1, total));
      }
      return;
    }

    if (grabbedId !== mod.id) return;

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (index > 0) {
        onReorderModule(mod.id, index - 1);
        setAnnouncement(T.announce.moved(alias, index, total));
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (index < total - 1) {
        onReorderModule(mod.id, index + 1);
        setAnnouncement(T.announce.moved(alias, index + 2, total));
      }
    } else if (e.key === "Escape") {
      // stopPropagation evita que el listener de Escape del editor (BuilderView)
      // cierre el modal completo al cancelar un reordenamiento.
      e.preventDefault();
      e.stopPropagation();
      onReorderModule(mod.id, grabbedOriginRef.current);
      setGrabbedId(null);
      setAnnouncement(T.announce.cancelled(alias));
    }
  }

  return (
    <aside
      className="flex flex-col flex-shrink-0"
      style={{
        width: 248,
        background: "var(--surface-page)",
        borderRight: "0.5px solid var(--border-ui)",
      }}
    >
      {/* Slot superior — AddModulePicker (catálogo + Crear con IA). */}
      {header}

      {/* Header del panel de estructura. */}
      <div
        className="flex items-center justify-between"
        style={{ padding: "12px 14px 8px", borderBottom: "0.5px solid var(--border-ui)", gap: 8 }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--text-tertiary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {T.panelTitle}
        </p>
        <span style={{ fontSize: 9, color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>
          {T.sectionCount(sectionCount)}
        </span>
      </div>

      {/* Live region — anuncios del reordenamiento por teclado. */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
        }}
      >
        {announcement}
      </div>

      {/* Árbol */}
      <div
        className="flex-1 overflow-y-auto"
        role="list"
        aria-label={`${T.panelTitle} · ${pageName}`}
        style={{
          padding: "6px 0",
          background: paletteDropActive ? "var(--drop-indicator-bg)" : "transparent",
          transition: "background 0.15s ease",
        }}
        onDragOver={(e) => {
          const types = Array.from(e.dataTransfer.types);
          if (types.includes(MIME_MODULE) || types.includes(MIME_COMPONENT)) e.preventDefault();
        }}
        onDragLeave={(e) => {
          // Sólo limpiar si salimos del contenedor entero.
          if (!e.currentTarget.contains(e.relatedTarget as Node)) resetDrag();
        }}
        onDrop={handleListDrop}
      >
        {modules.map((mod, index) => (
          <div key={mod.id} role="listitem">
            {/* Línea indicadora de drop antes de esta fila. */}
            <DropLine active={dropIndex === index} />

            <SectionRow
              mod={mod}
              alias={displayAlias(mod, propertyValues)}
              aliasRaw={deriveAlias(mod, propertyValues)}
              subtitle={sectionSubtitle(mod)}
              selected={mod.id === selectedId && !selectedPropertyName}
              dragging={draggingId === mod.id}
              grabbed={grabbedId === mod.id}
              renaming={renamingId === mod.id}
              menuOpen={menuOpenId === mod.id}
              onSelect={() => onSelectModule(mod.id)}
              onToggleExpand={() => onToggleExpand(mod.id)}
              onDragStartHandle={(e) => {
                e.dataTransfer.setData(MIME_MODULE, mod.id);
                e.dataTransfer.effectAllowed = "move";
                setDraggingId(mod.id);
              }}
              onDragEndHandle={resetDrag}
              onRowDragOver={(e) => handleRowDragOver(e, index)}
              onHandleKeyDown={(e) => handleHandleKeyDown(e, mod, index)}
              onStartRename={() => {
                setMenuOpenId(null);
                setRenamingId(mod.id);
              }}
              onCommitRename={(value) => {
                onRenameModule(mod.id, value.trim());
                setRenamingId(null);
              }}
              onCancelRename={() => setRenamingId(null)}
              onToggleMenu={() => setMenuOpenId((curr) => (curr === mod.id ? null : mod.id))}
              onCloseMenu={() => setMenuOpenId(null)}
              onEdit={() => {
                setMenuOpenId(null);
                onEditModule(mod.id);
              }}
              onDuplicate={() => {
                setMenuOpenId(null);
                onDuplicateModule(mod.id);
              }}
              onToggleHidden={() => {
                setMenuOpenId(null);
                onToggleHidden(mod.id);
              }}
              onDelete={() => {
                setMenuOpenId(null);
                onRequestDeleteModule(mod.id);
              }}
            />

            {/* Drill-down de properties: al clickear una prop se abre el panel
                de edición a la izquierda en la pestaña que corresponde. */}
            {mod.expanded && (
              <div style={{ position: "relative", paddingLeft: 34 }}>
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: 30,
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
                        background: isSelectedProp ? "var(--control-selected-bg)" : "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        gap: 6,
                        outlineColor: "var(--accent-info)",
                      }}
                    >
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
                          color: isSelectedProp ? "var(--control-selected-fg)" : "var(--text-secondary)",
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
        ))}

        {/* Línea indicadora al final de la lista. */}
        <DropLine active={dropIndex === modules.length} />
      </div>
    </aside>
  );
}

/* ─── Línea indicadora de zona de drop ───────────────────────────────────── */
function DropLine({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div aria-hidden="true" className="flex items-center" style={{ padding: "0 10px", height: 0 }}>
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "var(--drop-indicator)",
          marginLeft: -3,
          flexShrink: 0,
        }}
      />
      <span style={{ flex: 1, height: 2, background: "var(--drop-indicator)", borderRadius: 1 }} />
    </div>
  );
}

/* ─── Fila de sección ─────────────────────────────────────────────────────── */
interface SectionRowProps {
  mod: BuilderModule;
  alias: string;
  aliasRaw: string;
  subtitle: string;
  selected: boolean;
  dragging: boolean;
  grabbed: boolean;
  renaming: boolean;
  menuOpen: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  onDragStartHandle: (e: React.DragEvent) => void;
  onDragEndHandle: () => void;
  onRowDragOver: (e: React.DragEvent) => void;
  onHandleKeyDown: (e: React.KeyboardEvent) => void;
  onStartRename: () => void;
  onCommitRename: (value: string) => void;
  onCancelRename: () => void;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onToggleHidden: () => void;
  onDelete: () => void;
}

function SectionRow({
  mod,
  alias,
  aliasRaw,
  subtitle,
  selected,
  dragging,
  grabbed,
  renaming,
  menuOpen,
  onSelect,
  onToggleExpand,
  onDragStartHandle,
  onDragEndHandle,
  onRowDragOver,
  onHandleKeyDown,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onToggleMenu,
  onCloseMenu,
  onEdit,
  onDuplicate,
  onToggleHidden,
  onDelete,
}: SectionRowProps) {
  const Icon = sectionIcon(mod);
  const isAi = mod.origin === "ai";
  const isGlobal = mod.origin === "global";
  const aliasEmpty = aliasRaw.trim() === "";

  const background = grabbed
    ? "var(--control-selected-bg)"
    : selected
    ? "var(--control-selected-bg)"
    : "transparent";
  const borderLeft = grabbed
    ? "2px solid var(--control-selected-border)"
    : selected
    ? "2px solid var(--control-selected-border)"
    : "2px solid transparent";

  return (
    <div
      className="flex items-center transition-colors"
      onDragOver={onRowDragOver}
      style={{
        position: "relative",
        padding: "5px 6px 5px 4px",
        gap: 2,
        background,
        borderLeft,
        opacity: dragging ? 0.4 : mod.hidden ? 0.55 : 1,
        boxShadow: grabbed ? "0 2px 8px rgba(0,0,0,0.12)" : "none",
      }}
    >
      {/* Handle de arrastre + reordenamiento por teclado. */}
      <button
        type="button"
        draggable
        onDragStart={onDragStartHandle}
        onDragEnd={onDragEndHandle}
        onKeyDown={onHandleKeyDown}
        aria-label={`${BUILDER_COPY.tree.dragHandleLabel}: ${alias}`}
        aria-roledescription="control de reordenamiento"
        className="flex items-center justify-center flex-shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
        style={{
          width: 16,
          height: 22,
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "grab",
          color: grabbed ? "var(--control-selected-fg)" : "var(--text-tertiary)",
          outlineColor: "var(--accent-info)",
          touchAction: "none",
        }}
      >
        <GripVertical size={13} aria-hidden="true" />
      </button>

      {/* Chevron expand/colapsar properties. */}
      <button
        type="button"
        onClick={onToggleExpand}
        aria-label={mod.expanded ? "Colapsar propiedades" : "Expandir propiedades"}
        aria-expanded={mod.expanded}
        className="flex items-center justify-center flex-shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
        style={{
          width: 14,
          height: 14,
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
          outlineColor: "var(--accent-info)",
        }}
      >
        {mod.expanded ? (
          <ChevronDown size={11} style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
        ) : (
          <ChevronRight size={11} style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
        )}
      </button>

      {/* Cuerpo clickeable: ícono + alias + subtítulo → selecciona la sección. */}
      {renaming ? (
        <RenameInput
          initial={mod.alias ?? aliasRaw}
          onCommit={onCommitRename}
          onCancel={onCancelRename}
        />
      ) : (
        <button
          type="button"
          onClick={onSelect}
          aria-current={selected ? "true" : undefined}
          className="flex items-center flex-1 min-w-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
          style={{
            background: "transparent",
            border: "none",
            padding: "0 2px",
            gap: 7,
            cursor: "pointer",
            textAlign: "left",
            outlineColor: "var(--accent-info)",
          }}
        >
          <Icon
            size={13}
            aria-hidden="true"
            style={{
              color: isAi
                ? "var(--wizard-purple-text)"
                : selected
                ? "var(--control-selected-fg)"
                : "var(--text-secondary)",
              flexShrink: 0,
            }}
          />
          <span className="flex flex-col min-w-0" style={{ gap: 1 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: selected ? 600 : 500,
                color: aliasEmpty
                  ? "var(--text-tertiary)"
                  : selected
                  ? "var(--control-selected-fg)"
                  : "var(--text-primary)",
                fontStyle: aliasEmpty ? "italic" : "normal",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.25,
              }}
            >
              {alias}
            </span>
            <span
              style={{
                fontSize: 9.5,
                color: "var(--text-tertiary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.2,
              }}
            >
              {mod.hidden ? `${subtitle} · ${BUILDER_COPY.tree.hiddenHint}` : subtitle}
            </span>
          </span>
        </button>
      )}

      {/* Pill de origen. */}
      {isAi && <AiPill />}
      {isGlobal && (
        <Badge tone="neutral" style={{ height: 16, fontSize: 9, flexShrink: 0 }}>
          {BUILDER_COPY.tree.pillGlobal}
        </Badge>
      )}

      {/* Kebab de acciones (no para secciones globales). */}
      {!isGlobal && !renaming && (
        <div
          style={{ position: "relative", flexShrink: 0 }}
          onKeyDown={(e) => {
            if (menuOpen && e.key === "Escape") {
              // Cerrar sólo el menú, sin propagar al Escape del editor.
              e.preventDefault();
              e.stopPropagation();
              onCloseMenu();
            }
          }}
        >
          <button
            type="button"
            onClick={onToggleMenu}
            aria-label={BUILDER_COPY.tree.rowActionsLabel}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{
              width: 22,
              height: 22,
              background: menuOpen ? "var(--surface-page)" : "transparent",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              color: "var(--text-secondary)",
              outlineColor: "var(--accent-info)",
            }}
          >
            <MoreHorizontal size={14} aria-hidden="true" />
          </button>
          {menuOpen && (
            <RowActionsMenu
              hidden={!!mod.hidden}
              onClose={onCloseMenu}
              onEdit={onEdit}
              onRename={onStartRename}
              onDuplicate={onDuplicate}
              onToggleHidden={onToggleHidden}
              onDelete={onDelete}
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Pill "IA" (origen IA) ──────────────────────────────────────────────── */
function AiPill() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 16,
        padding: "0 6px",
        borderRadius: "var(--radius-dot)",
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: "0.02em",
        background: "var(--wizard-purple-light)",
        color: "var(--wizard-purple-text)",
        flexShrink: 0,
      }}
    >
      {BUILDER_COPY.tree.pillAi}
    </span>
  );
}

/* ─── Input de renombrado inline ─────────────────────────────────────────── */
function RenameInput({
  initial,
  onCommit,
  onCancel,
}: {
  initial: string;
  onCommit: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  return (
    <input
      ref={ref}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onCommit(value);
        } else if (e.key === "Escape") {
          // No dejar que el Escape cierre el editor: sólo cancela el renombrado.
          e.preventDefault();
          e.stopPropagation();
          onCancel();
        }
      }}
      onBlur={() => onCommit(value)}
      aria-label={BUILDER_COPY.tree.rename.inputLabel}
      placeholder={BUILDER_COPY.tree.rename.placeholder}
      className="flex-1 min-w-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0"
      style={{
        height: 24,
        padding: "0 6px",
        fontSize: 12,
        fontWeight: 500,
        color: "var(--text-primary)",
        background: "#fff",
        border: "0.5px solid var(--accent-info)",
        borderRadius: 4,
        outlineColor: "var(--accent-info)",
        fontFamily: "inherit",
      }}
    />
  );
}

/* ─── Menú de acciones de la fila ────────────────────────────────────────── */
interface RowActionsMenuProps {
  hidden: boolean;
  onClose: () => void;
  onEdit: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onToggleHidden: () => void;
  onDelete: () => void;
}

function RowActionsMenu({
  hidden,
  onClose,
  onEdit,
  onRename,
  onDuplicate,
  onToggleHidden,
  onDelete,
}: RowActionsMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cierre por click afuera. El Escape lo maneja el wrapper de la fila con
    // stopPropagation, para no cerrar el editor completo.
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [onClose]);

  const items = [
    { key: "edit", label: BUILDER_COPY.tree.actions.edit, icon: SlidersHorizontal, onClick: onEdit },
    { key: "rename", label: BUILDER_COPY.tree.actions.rename, icon: Pencil, onClick: onRename },
    { key: "duplicate", label: BUILDER_COPY.tree.actions.duplicate, icon: Copy, onClick: onDuplicate },
    {
      key: "hidden",
      label: hidden ? BUILDER_COPY.tree.actions.show : BUILDER_COPY.tree.actions.hide,
      icon: hidden ? Eye : EyeOff,
      onClick: onToggleHidden,
    },
    {
      key: "delete",
      label: BUILDER_COPY.tree.actions.delete,
      icon: Trash2,
      onClick: onDelete,
      destructive: true,
    },
  ];

  return (
    <div
      ref={ref}
      role="menu"
      aria-label={BUILDER_COPY.tree.rowActionsMenuLabel}
      style={{
        position: "absolute",
        top: 24,
        right: 0,
        zIndex: 20,
        minWidth: 150,
        background: "#fff",
        border: "0.5px solid var(--border-ui)",
        borderRadius: 7,
        boxShadow: "0 6px 20px rgba(0,0,0,0.14)",
        padding: 4,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      {items.map((item) => {
        const ItemIcon = item.icon;
        return (
          <button
            key={item.key}
            type="button"
            role="menuitem"
            onClick={item.onClick}
            className="flex items-center w-full transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
            style={{
              padding: "6px 8px",
              gap: 8,
              background: "transparent",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
              textAlign: "left",
              fontSize: 11,
              fontWeight: 500,
              color: item.destructive ? "var(--destructive)" : "var(--text-primary)",
              outlineColor: "var(--accent-info)",
            }}
          >
            <ItemIcon
              size={13}
              aria-hidden="true"
              style={{ color: item.destructive ? "var(--destructive)" : "var(--text-secondary)", flexShrink: 0 }}
            />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
