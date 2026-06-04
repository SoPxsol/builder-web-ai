import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  Eye,
  History,
  Loader2,
  Pencil,
  RotateCw,
  Sparkles,
  SquarePen,
  TriangleAlert,
  Upload,
  X,
} from "lucide-react";
import type { BlogArticle, ArticleVersion } from "../../types/article";
import { ARTICLE_CATEGORIES, BLOG_URL_PREFIX, EXCERPT_LIMIT, slugify } from "../../types/article";
import {
  bodyToBlocks,
  blocksToPlainText,
  DEFAULT_LAYOUT,
  type ArticleBlock,
  type ArticleLayout,
  type BlockType,
  createBlock,
} from "../../types/articleBlocks";
import { BlockPalette } from "./BlockPalette";
import { BlockCanvas } from "./BlockCanvas";
import { ArticlePreviewFull } from "./ArticlePreviewFull";
import { CodeView } from "./CodeView";
import { ChatPanel } from "./ChatPanel";
import { VersionHistoryDialog } from "./VersionHistoryDialog";
import { useAutosave, formatSavedAgo, type AutosaveStatus } from "../builder/useAutosave";
import { FOCUSABLE_SELECTOR } from "../../utils/focus";
import { useMediaQuery } from "../../hooks/useMediaQuery";

interface Props {
  article: BlogArticle;
  /** Dominio del sitio activo, para el prefijo de la URL (ej. "hotel.com"). */
  contextLabel?: string;
  /** Aplica cambios al artículo en el store (single source of truth). */
  onPatch: (patch: Partial<BlogArticle>) => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onClose: () => void;
}

const DEMO_COVER =
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=70&w=1200";

/**
 * Editor unificado de artículo — una sola pantalla, dos zonas.
 *
 * El contenido es el protagonista (zona izquierda ancha); los ajustes
 * (URL, portada, categoría, descripción corta) viven a mano en el panel
 * derecho. Antes esto obligaba a editar "por otro lado": ahora es el mismo
 * objeto, misma pantalla (ver brief §3).
 *
 * Autoguardar (borrador) y publicar son acciones separadas: tipear dispara
 * el autosave vía useAutosave; publicar es explícito con el botón primario.
 */
export function ArticleEditorView({
  article,
  contextLabel = "tu-sitio.com",
  onPatch,
  onPublish,
  onUnpublish,
  onClose,
}: Props) {
  const isPublished = article.status === "published";

  /* ─── Cuerpo por bloques + chrome ──────────────────────────────────────
   * `blocks` es la fuente de verdad del editor. Si el artículo es legacy
   * (sin blocks) lo derivamos de `body` una sola vez. Cada cambio persiste
   * los bloques y un espejo plano en `body` (para SEO / compatibilidad). */
  const blocks: ArticleBlock[] = useMemo(
    () => article.blocks ?? bodyToBlocks(article.body),
    [article.blocks, article.body],
  );
  const layout: ArticleLayout = article.layout ?? DEFAULT_LAYOUT;

  const setBlocks = useCallback(
    (next: ArticleBlock[]) => onPatch({ blocks: next, body: blocksToPlainText(next) }),
    [onPatch],
  );
  const addBlock = useCallback(
    (type: BlockType) => setBlocks([...blocks, createBlock(type)]),
    [blocks, setBlocks],
  );
  const setLayout = useCallback(
    (patch: Partial<ArticleLayout>) => onPatch({ layout: { ...layout, ...patch } }),
    [layout, onPatch],
  );

  /* ─── Historial de versiones ───────────────────────────────────────────
   * Al publicar/actualizar guardamos un snapshot del artículo. Restaurar
   * vuelve a aplicar ese snapshot vía onPatch. (Mock client-side.) */
  const handlePublish = useCallback(() => {
    const version: ArticleVersion = {
      id: `v-${Date.now().toString(36)}`,
      savedAt: new Date().toISOString(),
      label: isPublished ? "Actualización" : "Publicación",
      snapshot: {
        title: article.title,
        slug: article.slug,
        category: article.category,
        excerpt: article.excerpt,
        coverImageUrl: article.coverImageUrl,
        blocks,
        layout,
      },
    };
    onPatch({ versions: [version, ...(article.versions ?? [])] });
    onPublish();
  }, [article, blocks, layout, isPublished, onPatch, onPublish]);

  const handleRestore = useCallback(
    (version: ArticleVersion) => {
      onPatch({ ...version.snapshot });
      setShowHistory(false);
    },
    [onPatch],
  );

  /* ─── Autosave del borrador ────────────────────────────────────────────
   * El store ya se actualiza sincrónicamente vía onPatch; useAutosave solo
   * orquesta el indicador "Guardando… → Guardado hace X". Simulamos una
   * latencia corta para que el estado intermedio sea visible. */
  const save = useCallback(
    () =>
      new Promise<{ ok: boolean; updatedAt: string }>((resolve) => {
        window.setTimeout(
          () => resolve({ ok: true, updatedAt: new Date().toISOString() }),
          450,
        );
      }),
    [],
  );
  // Observamos solo los campos editables (no `creation`/`status`), para que
  // la confirmación de la creación optimista no dispare un "Guardando…".
  const watched = `${article.title} ${article.slug} ${article.excerpt} ${article.category} ${article.coverImageUrl} ${JSON.stringify(blocks)} ${JSON.stringify(layout)}`;
  const autosave = useAutosave({ value: watched, save });

  /* ─── UI ephemeral ─────────────────────────────────────────────────────── */
  // Modo de visualización: edición (3 columnas) · vista previa fiel · código.
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "code">("edit");
  const [editingSlug, setEditingSlug] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  // En compact (<1024px) el panel de Ajustes pasa a pestaña.
  const isCompact = useMediaQuery("(max-width: 1023px)");
  const [rightTab, setRightTab] = useState<"content" | "chat">("content");
  const [mobileTab, setMobileTab] = useState<"blocks" | "body" | "content" | "chat">("body");

  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const slugInputRef = useRef<HTMLInputElement>(null);

  // Body scroll lock + ESC + focus trap + restauración de foco.
  useEffect(() => {
    previouslyFocusedRef.current = (document.activeElement as HTMLElement) ?? null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const modal = modalRef.current;
    modal?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && modal) {
        const focusables = Array.from(
          modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        ).filter((el) => el.offsetParent !== null);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocusedRef.current?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (editingSlug) slugInputRef.current?.focus();
  }, [editingSlug]);

  /* ─── Zonas ────────────────────────────────────────────────────────────── */
  // En preview/código ocupamos todo el ancho. En edición: paleta (izq) ·
  // lienzo (centro) · panel derecho con tabs Contenido/Chat. En compact cada
  // zona es una pestaña inferior (Componentes/Cuerpo/Contenido/Chat).
  const isEdit = viewMode === "edit";
  const showPalette = isEdit && (!isCompact || mobileTab === "blocks");
  const showCanvas = isEdit && (!isCompact || mobileTab === "body");
  const showRight = isEdit && (!isCompact || mobileTab === "content" || mobileTab === "chat");
  // En desktop el panel derecho alterna por su tab interno; en compact lo
  // determina la pestaña inferior elegida.
  const rightActive: "content" | "chat" = isCompact ? (mobileTab === "chat" ? "chat" : "content") : rightTab;

  const settingsZone = (
    <SettingsPanel
      article={article}
      contextLabel={contextLabel}
      layout={layout}
      editingSlug={editingSlug}
      slugInputRef={slugInputRef}
      onEditSlug={() => setEditingSlug(true)}
      onDoneSlug={() => setEditingSlug(false)}
      onPatch={onPatch}
      onLayout={setLayout}
    />
  );

  const overlay = (
    <>
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "var(--wizard-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Editor del artículo ${article.title || "sin título"}`}
        className="flex flex-col"
        style={{
          width: "98vw",
          height: "98vh",
          background: "var(--surface-page)",
          borderRadius: 12,
          boxShadow: "0 12px 40px rgba(0,0,0,0.32)",
          overflow: "hidden",
          fontFamily: "var(--font-sans)",
        }}
      >
        {/* ── Barra superior ── */}
        <header
          className="flex items-center"
          style={{
            minHeight: 52,
            padding: "0 12px",
            background: "#fff",
            borderBottom: "0.5px solid var(--border-ui)",
            gap: 10,
            flexShrink: 0,
          }}
        >
          {/* Izquierda: back + breadcrumb */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Volver al blog"
            title="Volver al blog"
            className="flex items-center justify-center transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{
              width: 30,
              height: 30,
              background: "transparent",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              outlineColor: "var(--ring)",
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={15} style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
          </button>

          <nav aria-label="Ruta" className="flex items-center min-w-0" style={{ gap: 4 }}>
            <span style={{ fontSize: 12, color: "var(--text-tertiary)", flexShrink: 0 }}>Blog</span>
            <ChevronRight size={12} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} aria-hidden="true" />
            <span
              className="truncate"
              style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", maxWidth: 280 }}
              title={article.title}
            >
              {article.title || "Artículo sin título"}
            </span>
          </nav>

          <div className="flex-1" />

          {/* Derecha: autosave · pill estado · vista previa · publicar */}
          <div className="flex items-center flex-shrink-0" style={{ gap: 8 }}>
            <SaveIndicator status={autosave.status} onRetry={autosave.flush} />

            <StatusPill status={article.status} />

            <ViewModeSwitch value={viewMode} onChange={setViewMode} />

            <span aria-hidden="true" style={{ width: 1, height: 20, background: "var(--border-ui)" }} />

            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="flex items-center transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                height: 30,
                padding: "0 10px",
                gap: 6,
                background: "transparent",
                border: "0.5px solid var(--border-ui)",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                color: "var(--text-secondary)",
                cursor: "pointer",
                outlineColor: "var(--accent-info)",
              }}
            >
              <History size={13} aria-hidden="true" />
              Historial
            </button>

            {isPublished && (
              <button
                type="button"
                onClick={onUnpublish}
                className="transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  height: 30,
                  padding: "0 6px",
                  background: "transparent",
                  border: "none",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--accent-info)",
                  cursor: "pointer",
                  outlineColor: "var(--accent-info)",
                  borderRadius: 6,
                }}
              >
                Pasar a borrador
              </button>
            )}

            <button
              type="button"
              onClick={handlePublish}
              className="flex items-center transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                height: 30,
                padding: "0 16px",
                background: "var(--brand)",
                border: "none",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                color: "#fff",
                cursor: "pointer",
                outlineColor: "var(--brand)",
              }}
            >
              {isPublished ? "Actualizar" : "Publicar"}
            </button>
          </div>
        </header>

        {/* ── Tabs Componentes / Cuerpo / Contenido / Chat (solo compact, modo edición) ── */}
        {isCompact && isEdit && (
          <div
            role="tablist"
            aria-label="Secciones del editor"
            className="flex items-center"
            style={{
              gap: 2,
              padding: 6,
              background: "#fff",
              borderBottom: "0.5px solid var(--border-ui)",
              flexShrink: 0,
            }}
          >
            {(
              [
                { id: "blocks" as const, label: "Componentes" },
                { id: "body" as const, label: "Cuerpo" },
                { id: "content" as const, label: "Contenido" },
                { id: "chat" as const, label: "Chat" },
              ]
            ).map((t) => {
              const active = mobileTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setMobileTab(t.id)}
                  className="flex-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                  style={{
                    height: 30,
                    background: active ? "var(--surface-page)" : "transparent",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: active ? 600 : 500,
                    color: active ? "var(--text-primary)" : "var(--text-secondary)",
                    cursor: "pointer",
                    outlineColor: "var(--accent-info)",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Cuerpo ── */}
        <div className="flex flex-1 min-h-0">
          {/* CÓDIGO — full width */}
          {viewMode === "code" && (
            <div className="flex-1" style={{ minWidth: 0 }}>
              <CodeView article={article} blocks={blocks} layout={layout} />
            </div>
          )}

          {/* VISTA PREVIA — full width */}
          {viewMode === "preview" && (
            <div className="flex-1 overflow-y-auto" style={{ minWidth: 0, background: "#e9e2d3" }}>
              <ArticlePreviewFull article={article} blocks={blocks} layout={layout} />
            </div>
          )}

          {/* EDICIÓN — paleta · lienzo · panel derecho (Contenido/Chat) */}
          {showPalette && (
            isCompact ? (
              <div className="flex-1 overflow-y-auto">
                <BlockPalette onAdd={addBlock} />
              </div>
            ) : (
              <BlockPalette onAdd={addBlock} />
            )
          )}

          {showCanvas && (
            <div className="flex-1 overflow-y-auto" style={{ minWidth: 0, background: "var(--surface-page)" }}>
              <div style={{ maxWidth: 760, margin: "0 auto", padding: isCompact ? 16 : "28px 32px" }}>
                <ContentEditor
                  article={article}
                  blocks={blocks}
                  onPatch={onPatch}
                  onBlocksChange={setBlocks}
                />
              </div>
            </div>
          )}

          {showRight && (
            <aside
              aria-label="Panel del artículo"
              className="flex flex-col"
              style={{
                width: isCompact ? "100%" : 320,
                flexShrink: 0,
                background: "#fff",
                borderLeft: isCompact ? "none" : "0.5px solid var(--border-ui)",
                minHeight: 0,
              }}
            >
              {/* Tabs internos (solo desktop; en compact los maneja la barra inferior) */}
              {!isCompact && (
                <div
                  role="tablist"
                  aria-label="Panel"
                  className="flex items-center flex-shrink-0"
                  style={{ gap: 2, padding: 8, borderBottom: "0.5px solid var(--border-ui)" }}
                >
                  {(
                    [
                      { id: "content" as const, label: "Contenido" },
                      { id: "chat" as const, label: "Chat" },
                    ]
                  ).map((t) => {
                    const active = rightTab === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setRightTab(t.id)}
                        className="flex-1 flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                        style={{
                          height: 30,
                          gap: 6,
                          background: active ? "var(--surface-page)" : "transparent",
                          border: "none",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: active ? 600 : 500,
                          color: active ? "var(--text-primary)" : "var(--text-secondary)",
                          cursor: "pointer",
                          outlineColor: "var(--accent-info)",
                        }}
                      >
                        {t.id === "chat" && <Sparkles size={12} aria-hidden="true" />}
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              )}

              <div
                className="flex-1"
                style={{
                  padding: rightActive === "chat" ? 12 : 20,
                  minHeight: 0,
                  overflowY: rightActive === "chat" ? "hidden" : "auto",
                }}
              >
                {rightActive === "chat" ? <ChatPanel articleTitle={article.title} /> : settingsZone}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
    {showHistory && (
      <VersionHistoryDialog
        versions={article.versions ?? []}
        onRestore={handleRestore}
        onClose={() => setShowHistory(false)}
      />
    )}
    </>
  );

  return createPortal(overlay, document.body);
}

/* ════════════════════════════════════════════════════════════════════════
 * Zona de contenido (izquierda)
 * ════════════════════════════════════════════════════════════════════════ */

function ContentEditor({
  article,
  blocks,
  onPatch,
  onBlocksChange,
}: {
  article: BlogArticle;
  blocks: ArticleBlock[];
  onPatch: (patch: Partial<BlogArticle>) => void;
  onBlocksChange: (blocks: ArticleBlock[]) => void;
}) {
  return (
    <div className="flex flex-col" style={{ gap: 12 }}>
      {/* Título grande inline */}
      <input
        type="text"
        value={article.title}
        onChange={(e) => onPatch({ title: e.target.value })}
        placeholder="Título del artículo"
        aria-label="Título del artículo"
        className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          padding: "0 12px",
          fontSize: 30,
          fontWeight: 700,
          lineHeight: 1.2,
          color: "var(--text-primary)",
          outline: "none",
          outlineColor: "var(--accent-info)",
          fontFamily: "inherit",
        }}
      />

      {/* Cuerpo por bloques */}
      <BlockCanvas blocks={blocks} onChange={onBlocksChange} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Panel de Ajustes (derecha)
 * ════════════════════════════════════════════════════════════════════════ */

const settingLabel: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-primary)",
  marginBottom: 6,
};

function SettingsPanel({
  article,
  contextLabel,
  layout,
  editingSlug,
  slugInputRef,
  onEditSlug,
  onDoneSlug,
  onPatch,
  onLayout,
}: {
  article: BlogArticle;
  contextLabel: string;
  layout: ArticleLayout;
  editingSlug: boolean;
  slugInputRef: React.RefObject<HTMLInputElement>;
  onEditSlug: () => void;
  onDoneSlug: () => void;
  onPatch: (patch: Partial<BlogArticle>) => void;
  onLayout: (patch: Partial<ArticleLayout>) => void;
}) {
  const excerptLen = article.excerpt.length;
  const overLimit = excerptLen > EXCERPT_LIMIT;

  return (
    <div className="flex flex-col" style={{ gap: 22 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
        Ajustes
      </p>

      {/* URL del artículo */}
      <div>
        <label htmlFor="art-slug" style={settingLabel}>
          URL del artículo
        </label>
        {editingSlug ? (
          <div
            className="flex items-stretch"
            style={{ border: "0.5px solid var(--accent-info)", borderRadius: 6, overflow: "hidden", background: "var(--surface-page)" }}
          >
            <span
              aria-hidden="true"
              className="flex items-center"
              style={{
                padding: "0 6px",
                background: "#efefef",
                fontSize: 11,
                color: "var(--text-tertiary)",
                borderRight: "0.5px solid var(--border-ui)",
                whiteSpace: "nowrap",
              }}
            >
              {BLOG_URL_PREFIX}
            </span>
            <input
              ref={slugInputRef}
              id="art-slug"
              type="text"
              value={article.slug}
              onChange={(e) => onPatch({ slug: slugify(e.target.value) })}
              onKeyDown={(e) => {
                if (e.key === "Enter") onDoneSlug();
              }}
              placeholder="mi-articulo"
              className="flex-1"
              style={{
                width: "auto",
                border: "none",
                background: "transparent",
                padding: "8px 8px",
                fontSize: 12,
                color: "var(--text-primary)",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <button
              type="button"
              onClick={onDoneSlug}
              aria-label="Confirmar URL"
              className="flex items-center justify-center transition-colors hover:bg-[var(--surface-card)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
              style={{ width: 32, background: "transparent", border: "none", borderLeft: "0.5px solid var(--border-ui)", cursor: "pointer", outlineColor: "var(--accent-info)" }}
            >
              <Check size={13} style={{ color: "var(--status-active)" }} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div
            className="flex items-center"
            style={{
              gap: 6,
              padding: "8px 10px",
              background: "var(--surface-page)",
              border: "0.5px solid var(--border-ui)",
              borderRadius: 6,
            }}
          >
            <span className="flex-1 truncate" style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              <span style={{ color: "var(--text-tertiary)" }}>
                {contextLabel}
                {BLOG_URL_PREFIX}
              </span>
              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                {article.slug || "…"}
              </span>
            </span>
            <button
              type="button"
              onClick={onEditSlug}
              aria-label="Editar URL"
              title="Editar URL"
              className="flex items-center justify-center transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
              style={{ width: 24, height: 24, background: "transparent", border: "none", borderRadius: 5, cursor: "pointer", flexShrink: 0, outlineColor: "var(--accent-info)" }}
            >
              <Pencil size={12} style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Portada */}
      <div>
        <span style={settingLabel}>Portada</span>
        {article.coverImageUrl ? (
          <div className="flex flex-col" style={{ gap: 8 }}>
            <div
              style={{
                width: "100%",
                height: 120,
                background: `url(${article.coverImageUrl}) center/cover`,
                borderRadius: 8,
                border: "0.5px solid var(--border-ui)",
              }}
              role="img"
              aria-label="Imagen de portada cargada"
            />
            <div className="flex items-center" style={{ gap: 8 }}>
              <button
                type="button"
                onClick={() => onPatch({ coverImageUrl: DEMO_COVER })}
                className="transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                style={{ background: "transparent", border: "none", fontSize: 11, fontWeight: 500, color: "var(--accent-info)", cursor: "pointer", padding: 0, outlineColor: "var(--accent-info)" }}
              >
                Cambiar
              </button>
              <span aria-hidden="true" style={{ width: 1, height: 10, background: "var(--border-ui)" }} />
              <button
                type="button"
                onClick={() => onPatch({ coverImageUrl: "" })}
                className="flex items-center transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                style={{ gap: 3, background: "transparent", border: "none", fontSize: 11, fontWeight: 500, color: "var(--destructive)", cursor: "pointer", padding: 0, outlineColor: "var(--destructive)" }}
              >
                <X size={11} aria-hidden="true" /> Quitar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onPatch({ coverImageUrl: DEMO_COVER })}
            className="flex flex-col items-center justify-center transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-label="Subir imagen de portada"
            style={{
              width: "100%",
              height: 120,
              background: "var(--surface-page)",
              border: "1px dashed var(--border-ui)",
              borderRadius: 8,
              cursor: "pointer",
              gap: 6,
              outlineColor: "var(--accent-info)",
            }}
          >
            <Upload size={18} style={{ color: "var(--text-tertiary)" }} aria-hidden="true" />
            <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-secondary)" }}>
              Arrastrá o subí una imagen
            </span>
            <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>JPG o PNG · 1200×800</span>
          </button>
        )}
      </div>

      {/* Categoría */}
      <div>
        <label htmlFor="art-category" style={settingLabel}>
          Categoría
        </label>
        <select
          id="art-category"
          value={article.category}
          onChange={(e) => onPatch({ category: e.target.value })}
          className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            width: "100%",
            height: 34,
            padding: "0 8px",
            background: "var(--surface-page)",
            border: "0.5px solid var(--border-ui)",
            borderRadius: 6,
            fontSize: 12,
            color: article.category ? "var(--text-primary)" : "var(--text-tertiary)",
            cursor: "pointer",
            outlineColor: "var(--accent-info)",
            fontFamily: "inherit",
          }}
        >
          <option value="">Sin categoría</option>
          {ARTICLE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Descripción corta */}
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
          <label htmlFor="art-excerpt" style={{ ...settingLabel, marginBottom: 0 }}>
            Descripción corta
          </label>
          <span
            aria-live="polite"
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: overLimit ? "var(--destructive)" : "var(--text-tertiary)",
            }}
          >
            {excerptLen} / {EXCERPT_LIMIT}
          </span>
        </div>
        <textarea
          id="art-excerpt"
          value={article.excerpt}
          onChange={(e) => onPatch({ excerpt: e.target.value })}
          placeholder="Resumen que aparece en Google y en la card del listado del blog."
          rows={4}
          aria-describedby="art-excerpt-hint"
          className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            width: "100%",
            padding: "8px 10px",
            background: "var(--surface-page)",
            border: overLimit ? "1px solid var(--destructive)" : "0.5px solid var(--border-ui)",
            borderRadius: 6,
            fontSize: 12,
            lineHeight: 1.5,
            color: "var(--text-primary)",
            outline: "none",
            outlineColor: overLimit ? "var(--destructive)" : "var(--accent-info)",
            fontFamily: "inherit",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
        <p
          id="art-excerpt-hint"
          style={{
            fontSize: 10,
            color: overLimit ? "var(--destructive)" : "var(--text-tertiary)",
            marginTop: 6,
            lineHeight: 1.4,
          }}
        >
          {overLimit
            ? `Te pasaste por ${excerptLen - EXCERPT_LIMIT}. Google recorta a ${EXCERPT_LIMIT} caracteres.`
            : "SEO · card del listado"}
        </p>
      </div>

      {/* ── Estructura de la página (chrome del artículo) ── */}
      <div style={{ height: 1, background: "var(--border-ui)" }} />
      <div className="flex flex-col" style={{ gap: 10 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          Estructura de la página
        </p>
        <p style={{ fontSize: 10, color: "var(--text-tertiary)", margin: "-4px 0 2px", lineHeight: 1.4 }}>
          Secciones fijas de la plantilla del artículo.
        </p>

        <ChromeToggle
          label="Columna lateral (sticky)"
          on={layout.sidebar}
          onChange={(v) => onLayout({ sidebar: v })}
        />
        {layout.sidebar && (
          <div className="flex flex-col" style={{ gap: 10, paddingLeft: 12, borderLeft: "2px solid var(--border-ui)" }}>
            <ChromeToggle
              label="Tarjeta de llamada a la acción"
              on={layout.sidebarCta}
              onChange={(v) => onLayout({ sidebarCta: v })}
            />
            {layout.sidebarCta && (
              <div className="flex flex-col" style={{ gap: 6 }}>
                <input
                  type="text"
                  value={layout.sidebarCtaTitle}
                  onChange={(e) => onLayout({ sidebarCtaTitle: e.target.value })}
                  placeholder="Título de la tarjeta"
                  aria-label="Título de la tarjeta CTA lateral"
                  style={chromeField}
                />
                <textarea
                  value={layout.sidebarCtaText}
                  onChange={(e) => onLayout({ sidebarCtaText: e.target.value })}
                  placeholder="Texto de apoyo"
                  aria-label="Texto de la tarjeta CTA lateral"
                  rows={2}
                  style={{ ...chromeField, resize: "vertical", lineHeight: 1.5 }}
                />
                <input
                  type="text"
                  value={layout.sidebarCtaButton}
                  onChange={(e) => onLayout({ sidebarCtaButton: e.target.value })}
                  placeholder="Texto del botón"
                  aria-label="Texto del botón de la tarjeta CTA lateral"
                  style={chromeField}
                />
              </div>
            )}
            <ChromeToggle
              label="También te puede interesar"
              on={layout.related}
              onChange={(v) => onLayout({ related: v })}
            />
            <ChromeToggle
              label="Newsletter"
              on={layout.newsletter}
              onChange={(v) => onLayout({ newsletter: v })}
            />
          </div>
        )}

        <ChromeToggle
          label="Más artículos para vos"
          on={layout.moreArticles}
          onChange={(v) => onLayout({ moreArticles: v })}
        />
      </div>
    </div>
  );
}

const chromeField: React.CSSProperties = {
  width: "100%",
  padding: "6px 9px",
  background: "var(--surface-page)",
  border: "0.5px solid var(--border-ui)",
  borderRadius: 6,
  fontSize: 11,
  color: "var(--text-primary)",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

/** Toggle compacto para activar/desactivar una sección del chrome. */
function ChromeToggle({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex items-center justify-between w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        gap: 8,
        outlineColor: "var(--accent-info)",
      }}
    >
      <span style={{ fontSize: 12, color: "var(--text-primary)", textAlign: "left" }}>{label}</span>
      <span
        aria-hidden="true"
        style={{
          width: 32,
          height: 18,
          borderRadius: 9,
          padding: 2,
          display: "flex",
          flexShrink: 0,
          // Verde = activo (estado), consistente con el switch canónico de la app.
          background: on ? "var(--status-active)" : "var(--border-ui)",
          justifyContent: on ? "flex-end" : "flex-start",
          transition: "background 0.15s ease",
        }}
      >
        <span style={{ width: 14, height: 14, borderRadius: 7, background: "#fff" }} />
      </span>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Indicadores de la barra superior
 * ════════════════════════════════════════════════════════════════════════ */

function ViewModeSwitch({
  value,
  onChange,
}: {
  value: "edit" | "preview" | "code";
  onChange: (v: "edit" | "preview" | "code") => void;
}) {
  const opts = [
    { id: "edit" as const, label: "Editar", Icon: SquarePen },
    { id: "preview" as const, label: "Vista previa", Icon: Eye },
    { id: "code" as const, label: "Código", Icon: Code2 },
  ];
  return (
    <div
      role="tablist"
      aria-label="Modo de vista"
      className="flex items-center"
      style={{ background: "var(--surface-page)", border: "0.5px solid var(--border-ui)", borderRadius: 7, padding: 2, gap: 2 }}
    >
      {opts.map(({ id, label, Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className="flex items-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{
              height: 26,
              padding: "0 10px",
              gap: 6,
              background: active ? "#fff" : "transparent",
              border: "none",
              borderRadius: 5,
              fontSize: 12,
              fontWeight: active ? 600 : 500,
              color: active ? "var(--text-primary)" : "var(--text-secondary)",
              cursor: "pointer",
              boxShadow: active ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
              outlineColor: "var(--accent-info)",
            }}
          >
            <Icon size={13} aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

function StatusPill({ status }: { status: BlogArticle["status"] }) {
  const published = status === "published";
  return (
    <span
      role="status"
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        padding: "0 10px",
        background: published ? "var(--badge-green-bg)" : "var(--badge-neutral-bg)",
        color: published ? "var(--badge-green-text)" : "var(--text-secondary)",
        borderRadius: "var(--radius-dot)",
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {published ? "Publicado" : "Borrador"}
    </span>
  );
}

function SaveIndicator({ status, onRetry }: { status: AutosaveStatus; onRetry: () => void }) {
  // Refresca el "hace X" cada 10s mientras está en saved.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (status.kind !== "saved") return;
    const id = window.setInterval(() => setTick((t) => t + 1), 10000);
    return () => window.clearInterval(id);
  }, [status.kind]);

  if (status.kind === "idle") return <span aria-hidden="true" style={{ width: 0 }} />;

  if (status.kind === "saving") {
    return (
      <span role="status" aria-live="polite" className="flex items-center" style={{ gap: 6, fontSize: 11, color: "var(--text-secondary)" }}>
        <Loader2 size={12} className="animate-spin" style={{ color: "var(--text-tertiary)" }} aria-hidden="true" />
        Guardando…
      </span>
    );
  }

  if (status.kind === "saved") {
    return (
      <span role="status" aria-live="polite" className="flex items-center" style={{ gap: 6, fontSize: 11, color: "var(--text-secondary)" }}>
        <CheckCircle2 size={12} style={{ color: "var(--status-active)" }} aria-hidden="true" />
        Guardado {formatSavedAgo(status.savedAt)}
      </span>
    );
  }

  return (
    <span role="status" aria-live="assertive" className="flex items-center" style={{ gap: 6, fontSize: 11, color: "var(--destructive)" }}>
      <TriangleAlert size={12} aria-hidden="true" />
      No se pudo guardar
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
        style={{ gap: 3, background: "transparent", border: "none", fontSize: 11, fontWeight: 600, color: "var(--destructive)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2, outlineColor: "var(--destructive)", borderRadius: 3, padding: "0 2px" }}
      >
        <RotateCw size={10} aria-hidden="true" />
        Reintentar
      </button>
    </span>
  );
}
