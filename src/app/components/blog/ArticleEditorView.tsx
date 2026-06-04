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
  Monitor,
  MoreVertical,
  Pencil,
  Plus,
  RotateCw,
  Send,
  SlidersHorizontal,
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
import { generateDraft } from "./generateDraft";
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
  // Dos quiebres (ver brief §5):
  //  · isCompact (≤1023): tablet → el editor colapsa a pestañas.
  //  · isMobile  (≤768):  celular → una columna, Ajustes en bottom sheet,
  //    barra superior compacta y ajuste fino (DnD) diferido a desktop.
  // isMobile ⊂ isCompact, así que el flujo mobile siempre se evalúa primero.
  const isCompact = useMediaQuery("(max-width: 1023px)");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = isCompact && !isMobile;
  const [rightTab, setRightTab] = useState<"content" | "chat">("content");
  const [mobileTab, setMobileTab] = useState<"blocks" | "body" | "content" | "chat">("body");
  // En mobile, Ajustes/Componentes/Chat viven en un bottom sheet (uno por vez).
  const [sheet, setSheet] = useState<null | "blocks" | "settings" | "chat">(null);

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
  // El flujo de 3 columnas / pestañas es para desktop y tablet; en mobile se
  // usa el cuerpo dedicado (una columna + bottom sheets), así que estas zonas
  // se apagan con !isMobile.
  const isEdit = viewMode === "edit";
  // "Vacío" = sin bloques o un único párrafo en blanco. En mobile, ese estado
  // muestra el generador IA inline (brief §2).
  const looksEmpty =
    blocks.length === 0 ||
    (blocks.length === 1 && blocks[0].type === "paragraph" && !blocks[0].text.trim());
  const showPalette = isEdit && !isMobile && (!isCompact || mobileTab === "blocks");
  const showCanvas = isEdit && !isMobile && (!isCompact || mobileTab === "body");
  const showRight = isEdit && !isMobile && (!isCompact || mobileTab === "content" || mobileTab === "chat");
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
          position: "relative",
          width: isMobile ? "100vw" : "98vw",
          height: isMobile ? "100vh" : "98vh",
          background: "var(--surface-page)",
          borderRadius: isMobile ? 0 : 12,
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

          {/* Derecha: autosave · pill estado · vista previa · publicar.
              En mobile (≤768) el cluster se compacta: solo autosave (icono),
              pill, Publicar y un kebab con el resto (brief §1). */}
          {isMobile ? (
            <div className="flex items-center flex-shrink-0" style={{ gap: 8 }}>
              <SaveIndicator status={autosave.status} onRetry={autosave.flush} compact />
              <StatusPill status={article.status} />
              <button
                type="button"
                onClick={handlePublish}
                className="flex items-center transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  height: 32,
                  padding: "0 14px",
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
              <MobileMoreMenu
                viewMode={viewMode}
                onViewMode={setViewMode}
                isPublished={isPublished}
                onHistory={() => setShowHistory(true)}
                onUnpublish={onUnpublish}
              />
            </div>
          ) : (
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
          )}
        </header>

        {/* ── Tabs Componentes / Cuerpo / Contenido / Chat (solo tablet, modo edición) ── */}
        {isTablet && isEdit && (
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

          {/* EDICIÓN MOBILE — una sola columna; el contenido es el foco (brief §1).
              Generación IA inline arriba, editor sin DnD, aviso de ajuste fino. */}
          {isEdit && isMobile && (
            <div className="flex-1 overflow-y-auto" style={{ minWidth: 0, background: "var(--surface-page)" }}>
              <div style={{ padding: "16px 14px 24px" }}>
                {looksEmpty && (
                  <MobileAiGenerate
                    onGenerated={(draft) => setBlocks(draft)}
                  />
                )}
                <ContentEditor
                  article={article}
                  blocks={blocks}
                  onPatch={onPatch}
                  onBlocksChange={setBlocks}
                  dragEnabled={false}
                />
                <DesktopFineTuneHint />
              </div>
            </div>
          )}
        </div>

        {/* ── Barra inferior mobile (modo edición): abre los bottom sheets ── */}
        {isMobile && isEdit && (
          <MobileBottomBar active={sheet} onOpen={(s) => setSheet(s)} />
        )}

        {/* ── Bottom sheet mobile (Componentes / Ajustes / Chat) ── */}
        {isMobile && sheet && (
          <BottomSheet
            title={sheet === "blocks" ? "Componentes" : sheet === "settings" ? "Ajustes" : "Asistente IA"}
            onClose={() => setSheet(null)}
          >
            {sheet === "blocks" && (
              <BlockPalette
                onAdd={(type) => {
                  addBlock(type);
                  setSheet(null);
                }}
                dragEnabled={false}
              />
            )}
            {sheet === "settings" && <div style={{ padding: 16 }}>{settingsZone}</div>}
            {sheet === "chat" && (
              <div style={{ padding: 12, height: "100%" }}>
                <ChatPanel articleTitle={article.title} />
              </div>
            )}
          </BottomSheet>
        )}
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
  dragEnabled = true,
}: {
  article: BlogArticle;
  blocks: ArticleBlock[];
  onPatch: (patch: Partial<BlogArticle>) => void;
  onBlocksChange: (blocks: ArticleBlock[]) => void;
  dragEnabled?: boolean;
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
      <BlockCanvas blocks={blocks} onChange={onBlocksChange} dragEnabled={dragEnabled} />
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

function SaveIndicator({ status, onRetry, compact }: { status: AutosaveStatus; onRetry: () => void; compact?: boolean }) {
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
        <Loader2 size={compact ? 14 : 12} className="animate-spin" style={{ color: "var(--text-tertiary)" }} aria-hidden="true" />
        {!compact && "Guardando…"}
      </span>
    );
  }

  if (status.kind === "saved") {
    return (
      <span
        role="status"
        aria-live="polite"
        className="flex items-center"
        style={{ gap: 6, fontSize: 11, color: "var(--text-secondary)" }}
        title={compact ? `Guardado ${formatSavedAgo(status.savedAt)}` : undefined}
      >
        <CheckCircle2 size={compact ? 14 : 12} style={{ color: "var(--status-active)" }} aria-hidden="true" />
        {!compact && <>Guardado {formatSavedAgo(status.savedAt)}</>}
      </span>
    );
  }

  return (
    <span role="status" aria-live="assertive" className="flex items-center" style={{ gap: 6, fontSize: 11, color: "var(--destructive)" }}>
      <TriangleAlert size={compact ? 14 : 12} aria-hidden="true" />
      {!compact && "No se pudo guardar"}
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

/* ════════════════════════════════════════════════════════════════════════
 * Piezas mobile (≤768px)
 * ════════════════════════════════════════════════════════════════════════ */

/**
 * Kebab de la barra superior en mobile: agrupa lo que no entra en fila a 390px
 * (cambiar de vista, historial, pasar a borrador). `Publicar` queda afuera,
 * siempre visible (brief §1).
 */
function MobileMoreMenu({
  viewMode,
  onViewMode,
  isPublished,
  onHistory,
  onUnpublish,
}: {
  viewMode: "edit" | "preview" | "code";
  onViewMode: (v: "edit" | "preview" | "code") => void;
  isPublished: boolean;
  onHistory: () => void;
  onUnpublish: () => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    // ESC en captura: cierra el menú sin dejar que el editor (que escucha ESC en
    // burbuja sobre document) se cierre también.
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  function run(action: () => void) {
    setOpen(false);
    action();
  }

  const viewOpts = [
    { id: "edit" as const, label: "Editar", Icon: SquarePen },
    { id: "preview" as const, label: "Vista previa", Icon: Eye },
    { id: "code" as const, label: "Código", Icon: Code2 },
  ];

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Más opciones"
        className="flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
        style={{
          width: 36,
          height: 32,
          background: open ? "var(--surface-page)" : "transparent",
          border: "0.5px solid var(--border-ui)",
          borderRadius: 6,
          cursor: "pointer",
          outlineColor: "var(--accent-info)",
        }}
      >
        <MoreVertical size={16} style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute"
          style={{
            top: 38,
            right: 0,
            zIndex: 120,
            background: "var(--surface-card)",
            borderRadius: "var(--radius-card)",
            border: "0.5px solid var(--border-ui)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
            minWidth: 200,
            overflow: "hidden",
            padding: "4px 0",
          }}
        >
          <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-tertiary)", padding: "6px 12px 2px", margin: 0 }}>
            Ver como
          </p>
          {viewOpts.map(({ id, label, Icon }) => {
            const active = viewMode === id;
            return (
              <button
                key={id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => run(() => onViewMode(id))}
                className="flex items-center gap-2.5 w-full px-3 transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                style={{ height: 40, background: "transparent", fontSize: 13, color: "var(--text-primary)", textAlign: "left", border: "none", cursor: "pointer", outlineColor: "var(--accent-info)", fontWeight: active ? 600 : 400 }}
              >
                <Icon size={14} style={{ color: active ? "var(--text-primary)" : "var(--text-secondary)" }} aria-hidden="true" />
                {label}
                {active && <Check size={13} style={{ marginLeft: "auto", color: "var(--status-active)" }} aria-hidden="true" />}
              </button>
            );
          })}
          <div style={{ height: "0.5px", background: "var(--border-ui)", margin: "4px 0" }} />
          <button
            type="button"
            role="menuitem"
            onClick={() => run(onHistory)}
            className="flex items-center gap-2.5 w-full px-3 transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
            style={{ height: 40, background: "transparent", fontSize: 13, color: "var(--text-primary)", textAlign: "left", border: "none", cursor: "pointer", outlineColor: "var(--accent-info)" }}
          >
            <History size={14} style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
            Historial de versiones
          </button>
          {isPublished && (
            <button
              type="button"
              role="menuitem"
              onClick={() => run(onUnpublish)}
              className="flex items-center gap-2.5 w-full px-3 transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
              style={{ height: 40, background: "transparent", fontSize: 13, color: "var(--text-primary)", textAlign: "left", border: "none", cursor: "pointer", outlineColor: "var(--accent-info)" }}
            >
              <ArrowLeft size={14} style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
              Pasar a borrador
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Barra inferior mobile (modo edición). El cuerpo del artículo es la pantalla;
 * Componentes / Ajustes / Chat se abren en bottom sheet desde acá (brief §3).
 */
function MobileBottomBar({
  active,
  onOpen,
}: {
  active: null | "blocks" | "settings" | "chat";
  onOpen: (s: "blocks" | "settings" | "chat") => void;
}) {
  const items = [
    { id: "blocks" as const, label: "Componentes", Icon: Plus },
    { id: "settings" as const, label: "Ajustes", Icon: SlidersHorizontal },
    { id: "chat" as const, label: "Asistente", Icon: Sparkles },
  ];
  return (
    <nav
      aria-label="Acciones del editor"
      className="flex items-stretch flex-shrink-0"
      style={{
        background: "#fff",
        borderTop: "0.5px solid var(--border-ui)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {items.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onOpen(id)}
            aria-pressed={isActive}
            className="flex-1 flex flex-col items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
            style={{
              gap: 3,
              minHeight: 54,
              background: isActive ? "var(--surface-page)" : "transparent",
              border: "none",
              cursor: "pointer",
              color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
              outlineColor: "var(--accent-info)",
            }}
          >
            <Icon size={18} aria-hidden="true" />
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500 }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/**
 * Bottom sheet mobile. Se monta DENTRO del modal del editor (no es un portal
 * nuevo): así queda dentro del focus trap y no toca `body.overflow` (que el
 * editor ya bloqueó). ESC en captura cierra el sheet sin cerrar el editor.
 */
function BottomSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    }
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <div
      className="absolute inset-0 flex flex-col justify-end"
      style={{ zIndex: 110 }}
    >
      {/* Scrim */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="flex flex-col"
        style={{
          position: "relative",
          maxHeight: "80%",
          minHeight: "40%",
          background: "#fff",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          boxShadow: "0 -8px 32px rgba(0,0,0,0.22)",
          outline: "none",
        }}
      >
        {/* Handle + header */}
        <div className="flex flex-col items-center flex-shrink-0" style={{ paddingTop: 8 }}>
          <span aria-hidden="true" style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border-ui)" }} />
          <div className="flex items-center justify-between w-full" style={{ padding: "10px 14px 8px" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{title}</p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
              style={{ width: 32, height: 32, background: "var(--surface-page)", border: "0.5px solid var(--border-ui)", borderRadius: 8, cursor: "pointer", outlineColor: "var(--accent-info)" }}
            >
              <X size={15} style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
            </button>
          </div>
          <div style={{ height: "0.5px", width: "100%", background: "var(--border-ui)" }} />
        </div>
        {/* Cuerpo scrolleable */}
        <div className="flex-1" style={{ minHeight: 0, overflowY: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Generación con IA inline (mobile). idle → generando… → (el borrador cae en la
 * zona de contenido) / error con reintentar. Mock: ver generateDraft (brief §8).
 */
function MobileAiGenerate({ onGenerated }: { onGenerated: (blocks: ArticleBlock[]) => void }) {
  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState<"idle" | "generating" | "error">("idle");

  async function run() {
    if (!prompt.trim() || phase === "generating") return;
    setPhase("generating");
    try {
      const draft = await generateDraft(prompt);
      onGenerated(draft);
      // Al resolver, `looksEmpty` pasa a false y este panel se desmonta solo.
    } catch {
      setPhase("error");
    }
  }

  return (
    <div
      className="flex flex-col"
      style={{
        gap: 10,
        marginBottom: 16,
        padding: 14,
        background: "var(--surface-card)",
        border: "0.5px solid var(--border-ui)",
        borderRadius: 12,
      }}
    >
      <div className="flex items-center" style={{ gap: 8 }}>
        <span
          aria-hidden="true"
          className="flex items-center justify-center"
          style={{ width: 28, height: 28, borderRadius: 8, background: "var(--ai-gradient)", color: "#fff", flexShrink: 0 }}
        >
          <Sparkles size={15} />
        </span>
        <div className="flex flex-col">
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Generá con IA</p>
          <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
            Describí el artículo y la IA arma el borrador.
          </p>
        </div>
      </div>

      {phase === "generating" ? (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-center"
          style={{ gap: 8, padding: "18px 0", fontSize: 13, color: "var(--text-secondary)" }}
        >
          <Loader2 size={16} className="animate-spin" style={{ color: "var(--brand)" }} aria-hidden="true" />
          Generando tu borrador…
        </div>
      ) : (
        <>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej: Una guía de los mejores miradores de la cordillera, tono cercano, para huéspedes del hotel."
            rows={3}
            aria-label="Describí el artículo para generar con IA"
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              width: "100%",
              padding: "10px 12px",
              background: "#fff",
              border: "0.5px solid var(--border-ui)",
              borderRadius: 8,
              fontSize: 13,
              lineHeight: 1.5,
              color: "var(--text-primary)",
              outline: "none",
              outlineColor: "var(--accent-info)",
              fontFamily: "inherit",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          {phase === "error" && (
            <p role="alert" className="flex items-center" style={{ gap: 6, fontSize: 12, color: "var(--destructive)", margin: 0 }}>
              <TriangleAlert size={13} aria-hidden="true" />
              No se pudo generar. Probá de nuevo.
            </p>
          )}
          <button
            type="button"
            onClick={run}
            disabled={!prompt.trim()}
            className="flex items-center justify-center transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40"
            style={{
              height: 42,
              gap: 8,
              background: "var(--brand)",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              cursor: prompt.trim() ? "pointer" : "not-allowed",
              outlineColor: "var(--brand)",
            }}
          >
            {phase === "error" ? <RotateCw size={15} aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
            {phase === "error" ? "Reintentar" : "Generar borrador"}
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Aviso no bloqueante (brief §4): el ajuste fino visual se difiere a desktop.
 * Es un hint → azul, nunca un botón (ver contrato de color de la app).
 */
function DesktopFineTuneHint() {
  return (
    <div
      className="flex items-start"
      style={{
        gap: 8,
        marginTop: 20,
        padding: "10px 12px",
        background: "var(--badge-blue-bg)",
        borderRadius: 8,
      }}
    >
      <Monitor size={14} style={{ color: "var(--badge-blue-text)", flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
      <p style={{ fontSize: 11.5, lineHeight: 1.5, color: "var(--badge-blue-text)", margin: 0 }}>
        El ajuste fino del diseño (reordenar y reacomodar bloques) se hace mejor desde una computadora.
      </p>
    </div>
  );
}
