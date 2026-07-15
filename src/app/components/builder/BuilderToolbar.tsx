import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  Database,
  FilePlus,
  Loader2,
  Monitor,
  MoreHorizontal,
  Plus,
  RotateCw,
  Settings,
  Smartphone,
  Sparkles,
  Tablet,
  TriangleAlert,
  Type as TypeIcon,
} from "lucide-react";
import type { BuilderTab, ViewportMode } from "../../types/builder";
import { BUILDER_COPY } from "./copy";
import type { EntityPublishStatus } from "./draftStore";
import { formatSavedAgo, type AutosaveStatus } from "./useAutosave";

/* ─── Tipos públicos ───────────────────────────────────────────────────── */

/**
 * Idiomas disponibles para edición en el builder.
 * Se mantienen acotados al set que ya soporta el sitio (es/en/pt/fr) —
 * coincide con los chips del Dashboard ("Activá inglés y multiplicá ×3").
 */
export type EditorLanguage = "es" | "en" | "pt" | "fr";

const LANGUAGE_LABELS: Record<EditorLanguage, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
  fr: "Français",
};

interface BuilderToolbarProps {
  activeTab: BuilderTab;
  onTabChange: (tab: BuilderTab) => void;
  viewport: ViewportMode;
  onViewportChange: (v: ViewportMode) => void;
  canvasWidth: number;
  onCanvasWidthChange: (w: number) => void;
  componentsOpen: boolean;
  onToggleComponents: () => void;
  aiOpen: boolean;
  onToggleAi: () => void;
  onBack: () => void;
  onPublish: () => void;
  /** Estado de publicación de la entidad activa — define el label del botón. */
  publishStatus: EntityPublishStatus;
  /** Estado del autosave — alimenta el chip a la izquierda del avatar. */
  autosaveStatus: AutosaveStatus;
  /** Handler para el botón "Reintentar" en estado error. */
  onAutosaveRetry: () => void;
  /** Toggle Modo edición / Vista previa. */
  previewMode: boolean;
  onTogglePreview: () => void;
  /** Idioma activo de edición + handler de cambio. */
  language: EditorLanguage;
  onLanguageChange: (l: EditorLanguage) => void;
  /** Handlers nuevos del inventario — hoy no-op, ver BuilderView TODO. */
  onOpenPageSettings: () => void;
  onOpenGlobalState: () => void;
  onOpenFontSelector: () => void;
  onCreateTemplate: () => void;
  onOpenCode: () => void;
}

/* ─── Estilos compartidos ──────────────────────────────────────────────── */

const chipStyle: React.CSSProperties = {
  height: 28,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "0.5px solid var(--border-ui)",
  borderRadius: 5,
  cursor: "pointer",
  color: "var(--text-secondary)",
  outline: "none",
  outlineColor: "var(--ring)",
};

/* ─── Componente principal ─────────────────────────────────────────────── */

export function BuilderToolbar({
  activeTab,
  onTabChange,
  viewport,
  onViewportChange,
  canvasWidth,
  onCanvasWidthChange,
  componentsOpen,
  onToggleComponents,
  aiOpen,
  onToggleAi,
  onBack,
  onPublish,
  publishStatus,
  autosaveStatus,
  onAutosaveRetry,
  previewMode,
  onTogglePreview,
  language,
  onLanguageChange,
  onOpenPageSettings,
  onOpenGlobalState,
  onOpenFontSelector,
  onCreateTemplate,
  onOpenCode,
}: BuilderToolbarProps) {
  /* ─── Derivados de publish ─────────────────────────────────────────── */
  // El label es siempre "Publicar" salvo que la entidad esté limpia
  // (sin cambios pendientes), en cuyo caso muestra "Publicado" + disabled.
  const publishDisabled = publishStatus === "published-clean";
  const publishLabel = publishDisabled
    ? BUILDER_COPY.toolbar.publish.clean
    : BUILDER_COPY.toolbar.publish.active;

  return (
    <header
      className="flex items-center"
      style={{
        height: 48,
        padding: "0 12px",
        background: "#fff",
        borderBottom: "0.5px solid var(--border-ui)",
        gap: 8,
        flexShrink: 0,
      }}
    >
      {/* IZQUIERDA: back + bloque de acciones del inventario */}
      <div className="flex items-center" style={{ gap: 4 }}>
        <ToolbarIconButton icon={ArrowLeft} label={BUILDER_COPY.toolbar.back} onClick={onBack} />
        <div style={{ width: 1, height: 18, background: "var(--border-ui)", margin: "0 4px" }} aria-hidden="true" />

        <ToolbarIconButton
          icon={Plus}
          label={BUILDER_COPY.toolbar.components}
          onClick={onToggleComponents}
          active={componentsOpen}
        />
        <ToolbarIconButton
          icon={Sparkles}
          label={BUILDER_COPY.toolbar.ai}
          onClick={onToggleAi}
          active={aiOpen}
        />
        <ToolbarIconButton
          icon={Settings}
          label={BUILDER_COPY.toolbar.pageSettings}
          onClick={onOpenPageSettings}
        />
        <EditorToolsMenu
          onOpenGlobalState={onOpenGlobalState}
          onOpenFontSelector={onOpenFontSelector}
          onCreateTemplate={onCreateTemplate}
          onOpenCode={onOpenCode}
        />
      </div>

      {/* CENTRO: tabs Header/Página/Footer + status chip de la entidad activa */}
      <div className="flex items-center flex-1 justify-center" style={{ minWidth: 0, gap: 8 }}>
        <div
          role="tablist"
          aria-label="Sección a editar"
          className="flex items-center"
          style={{
            background: "var(--surface-page)",
            border: "0.5px solid var(--border-ui)",
            borderRadius: 6,
            padding: 2,
            gap: 2,
            height: 28,
          }}
        >
          {(["header", "page", "footer"] as BuilderTab[]).map((tab) => {
            const active = activeTab === tab;
            const label = tab === "header" ? "Header" : tab === "page" ? "Página" : "Footer";
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onTabChange(tab)}
                className="transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  height: 24,
                  padding: "0 12px",
                  background: active ? "#fff" : "transparent",
                  border: "none",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: active ? 600 : 500,
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  cursor: "pointer",
                  boxShadow: active ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                  outlineColor: "var(--ring)",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
        <EntityStatusChip status={publishStatus} />
      </div>

      {/* DERECHA: width · viewport · idioma · toggle modo · autosave · menú "⋯" · avatar · publicar */}
      <div className="flex items-center flex-shrink-0" style={{ gap: 6 }}>
        <label
          className="flex items-center"
          style={{
            ...chipStyle,
            padding: "0 8px",
            gap: 4,
            fontSize: 11,
            color: "var(--text-secondary)",
            cursor: "text",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--text-tertiary)" }}>W:</span>
          <input
            type="number"
            value={canvasWidth}
            onChange={(e) => onCanvasWidthChange(Math.max(320, Number(e.target.value) || 0))}
            aria-label="Ancho del canvas en píxeles"
            style={{
              width: 50,
              background: "transparent",
              border: "none",
              fontSize: 11,
              fontWeight: 500,
              color: "var(--text-primary)",
              outline: "none",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          />
        </label>

        <div
          role="radiogroup"
          aria-label="Viewport"
          className="flex items-center"
          style={{
            background: "var(--surface-page)",
            border: "0.5px solid var(--border-ui)",
            borderRadius: 5,
            padding: 1,
            gap: 1,
            height: 28,
          }}
        >
          {(
            [
              { id: "desktop" as const, icon: Monitor, label: "Desktop" },
              { id: "tablet" as const, icon: Tablet, label: "Tablet" },
              { id: "mobile" as const, icon: Smartphone, label: "Mobile" },
            ]
          ).map(({ id, icon: Icon, label }) => {
            const active = viewport === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={label}
                onClick={() => onViewportChange(id)}
                className="flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                style={{
                  width: 24,
                  height: 24,
                  background: active ? "#fff" : "transparent",
                  border: "none",
                  borderRadius: 3,
                  cursor: "pointer",
                  boxShadow: active ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                  outlineColor: "var(--ring)",
                }}
              >
                <Icon
                  size={12}
                  aria-hidden="true"
                  style={{
                    color: active ? "var(--text-primary)" : "var(--text-tertiary)",
                  }}
                />
              </button>
            );
          })}
        </div>

        <LanguageSelector value={language} onChange={onLanguageChange} />

        <button
          type="button"
          onClick={onTogglePreview}
          aria-pressed={previewMode}
          aria-label={previewMode ? BUILDER_COPY.toolbar.toggleToEdit : BUILDER_COPY.toolbar.toggleToPreview}
          title={previewMode ? BUILDER_COPY.toolbar.toggleToEdit : BUILDER_COPY.toolbar.toggleToPreview}
          className="flex items-center transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            height: 28,
            padding: "0 12px",
            background: previewMode ? "var(--text-primary)" : "transparent",
            border: previewMode ? "0.5px solid var(--text-primary)" : "0.5px solid var(--border-ui)",
            borderRadius: 5,
            fontSize: 11,
            fontWeight: 500,
            color: previewMode ? "#fff" : "var(--text-secondary)",
            cursor: "pointer",
            gap: 4,
            outlineColor: "var(--ring)",
          }}
        >
          {previewMode ? BUILDER_COPY.toolbar.toggleToEdit : BUILDER_COPY.toolbar.toggleToPreview}
        </button>

        <SaveStatusIndicator status={autosaveStatus} onRetry={onAutosaveRetry} />

        <div
          aria-hidden="true"
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 26,
            height: 26,
            background: "var(--avatar-bg)",
            borderRadius: "var(--radius-badge)",
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 500, color: "var(--avatar-text)" }}>SG</span>
        </div>

        <button
          type="button"
          onClick={onPublish}
          disabled={publishDisabled}
          aria-label={publishLabel}
          className="flex items-center transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            height: 28,
            padding: "0 14px",
            background: publishDisabled ? "var(--border-ui)" : "var(--brand)",
            border: "none",
            borderRadius: 5,
            fontSize: 11,
            fontWeight: 600,
            color: publishDisabled ? "var(--text-tertiary)" : "#fff",
            cursor: publishDisabled ? "not-allowed" : "pointer",
            outlineColor: "var(--wizard-coral)",
          }}
        >
          {publishLabel}
        </button>
      </div>
    </header>
  );
}

/* ─── EntityStatusChip ─────────────────────────────────────────────────── */

function EntityStatusChip({ status }: { status: EntityPublishStatus }) {
  const { label, bg, color } = (() => {
    if (status === "published-clean") {
      return {
        label: BUILDER_COPY.toolbar.statusChip.published,
        bg: "var(--badge-green-bg)",
        color: "var(--badge-green-text)",
      };
    }
    if (status === "published-dirty") {
      return {
        label: BUILDER_COPY.toolbar.statusChip.dirty,
        bg: "var(--badge-orange-bg)",
        color: "var(--badge-orange-text)",
      };
    }
    return {
      label: BUILDER_COPY.toolbar.statusChip.draft,
      bg: "var(--badge-neutral-bg)",
      color: "var(--text-secondary)",
    };
  })();

  return (
    <span
      role="status"
      aria-live="polite"
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 20,
        padding: "0 8px",
        background: bg,
        color,
        borderRadius: "var(--radius-dot)",
        fontSize: 10,
        fontWeight: 500,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  );
}

/* ─── SaveStatusIndicator ──────────────────────────────────────────────── */

interface SaveStatusIndicatorProps {
  status: AutosaveStatus;
  onRetry: () => void;
}

/**
 * Indicador del autosave a la izquierda del avatar.
 *
 * Estados visibles:
 *   - idle    : oculto (no hay nada que decir).
 *   - saving  : "Guardando…" con spinner.
 *   - saved   : "Guardado hace X" con check verde. Texto se refresca cada 10 s.
 *   - error   : "No se pudo guardar" + botón "Reintentar" en rojo.
 *
 * `aria-live` polite anuncia los cambios a lectores sin interrumpir.
 */
function SaveStatusIndicator({ status, onRetry }: SaveStatusIndicatorProps) {
  // Re-render cada 10s para refrescar el "hace X" del estado saved.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (status.kind !== "saved") return;
    const id = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(id);
  }, [status.kind]);

  if (status.kind === "idle") {
    // Reservamos un mínimo de espacio para que el avatar no salte al cambiar
    // de idle → saving la primera vez. Mejor sería skeleton, pero el chip
    // aparece a los pocos segundos del primer cambio.
    return <div aria-hidden="true" style={{ width: 0 }} />;
  }

  if (status.kind === "saving") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center"
        style={{
          height: 28,
          padding: "0 8px",
          gap: 6,
          fontSize: 11,
          color: "var(--text-secondary)",
        }}
      >
        <Loader2
          size={12}
          aria-hidden="true"
          style={{ color: "var(--text-tertiary)", animation: "spin 1s linear infinite" }}
        />
        <span>{BUILDER_COPY.toolbar.autosave.saving}</span>
      </div>
    );
  }

  if (status.kind === "saved") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center"
        style={{
          height: 28,
          padding: "0 8px",
          gap: 6,
          fontSize: 11,
          color: "var(--text-secondary)",
        }}
      >
        <CheckCircle2 size={12} aria-hidden="true" style={{ color: "var(--status-active)" }} />
        <span>
          {BUILDER_COPY.toolbar.autosave.saved} {formatSavedAgo(status.savedAt)}
        </span>
      </div>
    );
  }

  // error
  return (
    <div
      role="status"
      aria-live="assertive"
      className="flex items-center"
      style={{
        height: 28,
        padding: "0 8px",
        gap: 6,
        fontSize: 11,
        color: "var(--destructive)",
      }}
    >
      <TriangleAlert size={12} aria-hidden="true" />
      <span>{BUILDER_COPY.toolbar.autosave.error}</span>
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
        style={{
          background: "transparent",
          border: "none",
          padding: "0 4px",
          gap: 4,
          fontSize: 11,
          fontWeight: 600,
          color: "var(--destructive)",
          cursor: "pointer",
          textDecoration: "underline",
          textUnderlineOffset: 2,
          outlineColor: "var(--destructive)",
          borderRadius: 3,
        }}
      >
        <RotateCw size={10} aria-hidden="true" />
        <span>{BUILDER_COPY.toolbar.autosave.retry}</span>
      </button>
    </div>
  );
}

/* ─── ToolbarIconButton ────────────────────────────────────────────────── */

interface ToolbarIconButtonProps {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

function ToolbarIconButton({ icon: Icon, label, onClick, active }: ToolbarIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className="flex items-center justify-center transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
      style={{
        width: 28,
        height: 28,
        background: active ? "var(--text-primary)" : "transparent",
        border: "none",
        borderRadius: 5,
        cursor: "pointer",
        outlineColor: "var(--ring)",
      }}
    >
      <Icon
        size={13}
        aria-hidden="true"
        style={{ color: active ? "#fff" : "var(--text-secondary)" }}
      />
    </button>
  );
}

/* ─── LanguageSelector ─────────────────────────────────────────────────── */

interface LanguageSelectorProps {
  value: EditorLanguage;
  onChange: (l: EditorLanguage) => void;
}

function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleSelect(l: EditorLanguage) {
    onChange(l);
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${BUILDER_COPY.toolbar.languageSelector} — actualmente ${LANGUAGE_LABELS[value]}`}
        title={BUILDER_COPY.toolbar.languageSelector}
        className="flex items-center transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
        style={{
          height: 28,
          padding: "0 8px",
          gap: 4,
          background: open ? "var(--surface-page)" : "transparent",
          border: "0.5px solid var(--border-ui)",
          borderRadius: 5,
          fontSize: 11,
          fontWeight: 500,
          color: "var(--text-secondary)",
          cursor: "pointer",
          outlineColor: "var(--ring)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        <span>{value}</span>
        <span aria-hidden="true" style={{ fontSize: 8, color: "var(--text-tertiary)" }}>▾</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={BUILDER_COPY.toolbar.languageSelector}
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            zIndex: 70,
            minWidth: 140,
            background: "#fff",
            border: "0.5px solid var(--border-ui)",
            borderRadius: 6,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            padding: 4,
            margin: 0,
            listStyle: "none",
          }}
        >
          {(Object.keys(LANGUAGE_LABELS) as EditorLanguage[]).map((lang) => {
            const active = lang === value;
            return (
              <li key={lang}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => handleSelect(lang)}
                  className="flex items-center justify-between w-full text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                  style={{
                    padding: "6px 10px",
                    gap: 8,
                    background: active ? "var(--control-selected-bg)" : "transparent",
                    border: "none",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: active ? 600 : 500,
                    color: active ? "var(--control-selected-fg)" : "var(--text-primary)",
                    cursor: "pointer",
                    outlineColor: "var(--accent-info)",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = "var(--surface-page)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span>{LANGUAGE_LABELS[lang]}</span>
                  <span
                    aria-hidden="true"
                    style={{
                      fontSize: 9,
                      color: active ? "var(--control-selected-fg)" : "var(--text-tertiary)",
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                      textTransform: "uppercase",
                    }}
                  >
                    {lang}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ─── EditorToolsMenu (izquierda, kebab horizontal) ─────────────────────── */

interface EditorToolsMenuProps {
  onOpenGlobalState: () => void;
  onOpenFontSelector: () => void;
  onCreateTemplate: () => void;
  onOpenCode: () => void;
}

/**
 * Menú de herramientas del editor — vive a la izquierda de la barra, después
 * del bloque de acciones principales (Componentes · IA · Configuración).
 *
 * Trigger: ícono kebab horizontal (`MoreHorizontal`). Agrupa 4 acciones de
 * uso menos frecuente: Editor de estado global, Selector de fuentes, Crear
 * nueva plantilla, Editor de código.
 *
 * IA quedó FUERA del menú (al lado de Componentes) por ser uso frecuente.
 *
 * Navegación por teclado: ArrowUp/Down/Home/End mueven foco, Enter/Space
 * ejecuta, ESC cierra y devuelve foco al trigger.
 */
function EditorToolsMenu({
  onOpenGlobalState,
  onOpenFontSelector,
  onCreateTemplate,
  onOpenCode,
}: EditorToolsMenuProps) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const items = [
    {
      key: "globalState",
      label: BUILDER_COPY.toolsMenu.items.globalStateEditor,
      icon: Database,
      onClick: onOpenGlobalState,
    },
    {
      key: "fontSelector",
      label: BUILDER_COPY.toolsMenu.items.fontSelector,
      icon: TypeIcon,
      onClick: onOpenFontSelector,
    },
    {
      key: "createTemplate",
      label: BUILDER_COPY.toolsMenu.items.createTemplate,
      icon: FilePlus,
      onClick: onCreateTemplate,
    },
    {
      key: "code",
      label: BUILDER_COPY.toolsMenu.items.code,
      icon: Code2,
      onClick: onOpenCode,
    },
  ];

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    itemsRef.current[focusedIndex]?.focus();
  }, [open, focusedIndex]);

  function handleMenuKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setFocusedIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setFocusedIndex(items.length - 1);
    }
  }

  function handleItemClick(handler: () => void) {
    setOpen(false);
    handler();
  }

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setFocusedIndex(0);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={BUILDER_COPY.toolsMenu.triggerLabel}
        title={BUILDER_COPY.toolsMenu.triggerLabel}
        className="flex items-center justify-center transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
        style={{
          width: 28,
          height: 28,
          background: open ? "var(--surface-page)" : "transparent",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
          outlineColor: "var(--ring)",
        }}
      >
        <MoreHorizontal
          size={13}
          aria-hidden="true"
          style={{ color: "var(--text-secondary)" }}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={BUILDER_COPY.toolsMenu.menuLabel}
          onKeyDown={handleMenuKey}
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            zIndex: 70,
            minWidth: 220,
            background: "#fff",
            border: "0.5px solid var(--border-ui)",
            borderRadius: 6,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            padding: 4,
          }}
        >
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                ref={(el) => {
                  itemsRef.current[i] = el;
                }}
                type="button"
                role="menuitem"
                tabIndex={focusedIndex === i ? 0 : -1}
                onClick={() => handleItemClick(item.onClick)}
                onMouseEnter={() => setFocusedIndex(i)}
                className="flex items-center w-full text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                style={{
                  padding: "8px 10px",
                  gap: 10,
                  background: focusedIndex === i ? "var(--surface-page)" : "transparent",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  outlineColor: "var(--accent-info)",
                }}
              >
                <Icon
                  size={13}
                  aria-hidden="true"
                  style={{ color: "var(--text-secondary)", flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    lineHeight: 1.2,
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
