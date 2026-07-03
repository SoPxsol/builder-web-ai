/**
 * SocialEditorView.tsx — Editor de piezas de Redes Sociales (v1)
 * WEB-737 | Rama: sofia/web-737-social-editor
 *
 * Arquitectura calcada de ArticleEditorView (blog): modal full-screen vía
 * createPortal, focus trap + ESC + body scroll lock + retorno de foco,
 * autosave con useAutosave, responsive con bottom sheets en mobile.
 *
 * v1 alcance: el elemento editable es el overlay de texto (título + subtítulo)
 * sobre la imagen, más caption/hashtags del posteo, formato, imagen y "aplicar
 * marca". Logo / Etiqueta / CTA quedan como stubs "Próximamente" (ver Elementos).
 * La IA es un MOCK de co-creación: propone variantes de texto, nunca reemplaza
 * sola — el usuario elige "Usar esta" o "Descarta".
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Palette,
  Plus,
  Send,
  Sparkles,
  SquarePen,
  Tag,
  Type as TypeIcon,
  Eye,
  RotateCw,
  TriangleAlert,
  X,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { hotelImages } from "../../data/social-demo";
import type { SocialPost } from "../../data/social-demo";
import { SocialPhonePreview } from "./SocialPhonePreview";
import { useAutosave, formatSavedAgo, type AutosaveStatus } from "../builder/useAutosave";
import { FOCUSABLE_SELECTOR } from "../../utils/focus";
import { useMediaQuery } from "../../hooks/useMediaQuery";

/* ──────────────────────────────────────────────────────────────────────────────
 * Props
 * ────────────────────────────────────────────────────────────────────────────── */

interface Props {
  post: SocialPost;
  network: string;
  connected: boolean;
  /** Aplica cambios a la pieza en el store (single source of truth). */
  onPatch: (patch: Partial<SocialPost>) => void;
  onClose: () => void;
  onDownload?: () => void;
}

/* ──────────────────────────────────────────────────────────────────────────────
 * Utilidades
 * ────────────────────────────────────────────────────────────────────────────── */

function aspectFor(size: string): string {
  if (!size) return "aspect-square";
  const [w, h] = size.split("×").map(Number);
  if (!w || !h) return "aspect-square";
  const ratio = w / h;
  if (ratio > 1.3) return "aspect-video";
  if (ratio < 0.75) return "aspect-[9/16]";
  if (ratio < 0.95) return "aspect-[4/5]";
  return "aspect-square";
}

const MAX_PROMPTS = 200;

/** Variantes mock que la IA "propone" para el overlay, según el pedido. */
const MOCK_VARIANTS: { overlay: string; sub: string }[] = [
  { overlay: "Mañanas sin apuro.", sub: "Hotel Azul Marino" },
  { overlay: "El mar, a pasos tuyos.", sub: "Cartagena de Indias" },
  { overlay: "Tu próxima pausa.", sub: "Reservá directo" },
];

function pickVariant(seed: number) {
  return MOCK_VARIANTS[seed % MOCK_VARIANTS.length];
}

/**
 * Editor unificado de pieza social — barra superior + 3 zonas (mobile: 1
 * columna + bottom sheets). Ver brief en el pase para el detalle de cada zona.
 */
export function SocialEditorView({ post, network, connected, onPatch, onClose, onDownload }: Props) {
  const isStory = post.type === "Historia" || post.type === "Story";

  /* ─── Autosave ────────────────────────────────────────────────────────── */
  const save = useCallback(
    () =>
      new Promise<{ ok: boolean; updatedAt: string }>((resolve) => {
        window.setTimeout(() => resolve({ ok: true, updatedAt: new Date().toISOString() }), 450);
      }),
    [],
  );
  const watched = `${post.overlay} ${post.sub} ${post.caption ?? ""} ${post.hashtags ?? ""} ${post.image} ${post.brandApplied}`;
  const autosave = useAutosave({ value: watched, save });

  /* ─── UI ephemeral ────────────────────────────────────────────────────── */
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [rightTab, setRightTab] = useState<"content" | "ia">("content");
  const [publishMenuOpen, setPublishMenuOpen] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [sheet, setSheet] = useState<null | "elements" | "content" | "ia">(null);

  const isMobile = useMediaQuery("(max-width: 768px)");

  /* ─── Focus trap + ESC + body scroll lock + retorno de foco ──────────── */
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

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

  const contentZone = (
    <ContentPanel
      post={post}
      isStory={isStory}
      onPatch={onPatch}
      onOpenGallery={() => setGalleryOpen(true)}
    />
  );

  const iaZone = <IaPanel post={post} onPatch={onPatch} />;

  const overlay = (
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
        aria-label={`Editor de ${post.type} — ${post.overlay || "sin título"}`}
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
          <button
            type="button"
            onClick={onClose}
            aria-label="Volver a redes sociales"
            title="Volver a redes sociales"
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
            <span style={{ fontSize: 12, color: "var(--text-tertiary)", flexShrink: 0 }}>Redes</span>
            <ChevronRight size={12} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} aria-hidden="true" />
            <span style={{ fontSize: 12, color: "var(--text-tertiary)", flexShrink: 0 }}>{network}</span>
            <ChevronRight size={12} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} aria-hidden="true" />
            <span
              className="truncate"
              style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", maxWidth: 200 }}
              title={post.type}
            >
              {post.type}
            </span>
          </nav>

          <div className="flex-1" />

          <div className="flex items-center flex-shrink-0" style={{ gap: 8 }}>
            {!isMobile && <SaveIndicator status={autosave.status} onRetry={autosave.flush} />}
            <StatusPill status={post.status ?? "draft"} scheduledAt={post.scheduledAt} />
            {!isMobile && (
              <ViewModeSwitch value={viewMode} onChange={setViewMode} />
            )}
            <PublishMenu
              open={publishMenuOpen}
              onOpenChange={setPublishMenuOpen}
              isStory={isStory}
              onPublishNow={() => {
                setPublishMenuOpen(false);
                setConfirmPublish(true);
              }}
              onSchedule={() => {
                setPublishMenuOpen(false);
                setScheduling(true);
              }}
              onDownload={() => {
                setPublishMenuOpen(false);
                onDownload?.();
                setDownloadDone(true);
              }}
            />
          </div>
        </header>

        {/* ── Cuerpo ── */}
        <div className="flex flex-1 min-h-0">
          {viewMode === "preview" ? (
            <div className="flex-1 overflow-y-auto flex items-center justify-center" style={{ minWidth: 0, background: "#e9e2d3" }}>
              <SocialPhonePreview network={network} />
            </div>
          ) : isMobile ? (
            <div className="flex-1 overflow-y-auto" style={{ minWidth: 0, background: "var(--surface-page)" }}>
              <div style={{ padding: "16px 14px 24px" }}>
                <Canvas post={post} isStory={isStory} onPatch={onPatch} />
              </div>
            </div>
          ) : (
            <>
              {/* IZQUIERDA — Elementos */}
              <ElementsPanel post={post} onPatch={onPatch} />

              {/* CENTRO — Lienzo */}
              <div className="flex-1 overflow-y-auto flex flex-col items-center" style={{ minWidth: 0, background: "var(--surface-page)", padding: "28px 24px" }}>
                <Canvas post={post} isStory={isStory} onPatch={onPatch} />
              </div>

              {/* DERECHA — Contenido / IA */}
              <aside
                aria-label="Panel de la pieza"
                className="flex flex-col"
                style={{
                  width: 320,
                  flexShrink: 0,
                  background: "#fff",
                  borderLeft: "0.5px solid var(--border-ui)",
                  minHeight: 0,
                }}
              >
                <div
                  role="tablist"
                  aria-label="Panel"
                  className="flex items-center flex-shrink-0"
                  style={{ gap: 2, padding: 8, borderBottom: "0.5px solid var(--border-ui)" }}
                >
                  {(
                    [
                      { id: "content" as const, label: "Contenido" },
                      { id: "ia" as const, label: "IA" },
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
                        {t.id === "ia" && <Sparkles size={12} aria-hidden="true" />}
                        {t.id === "ia" ? "IA ✨" : t.label}
                      </button>
                    );
                  })}
                </div>

                <div
                  className="flex-1"
                  style={{
                    padding: rightTab === "ia" ? 12 : 20,
                    minHeight: 0,
                    overflowY: rightTab === "ia" ? "hidden" : "auto",
                  }}
                >
                  {rightTab === "ia" ? iaZone : contentZone}
                </div>
              </aside>
            </>
          )}
        </div>

        {/* ── Barra inferior mobile ── */}
        {isMobile && viewMode === "edit" && (
          <MobileBottomBar active={sheet} onOpen={setSheet} />
        )}

        {/* ── Bottom sheets mobile ── */}
        {isMobile && sheet && (
          <BottomSheet
            title={sheet === "elements" ? "Elementos" : sheet === "content" ? "Contenido" : "Asistente IA"}
            onClose={() => setSheet(null)}
          >
            {sheet === "elements" && (
              <div style={{ padding: 16 }}>
                <ElementsPanel post={post} onPatch={onPatch} inSheet />
              </div>
            )}
            {sheet === "content" && <div style={{ padding: 16 }}>{contentZone}</div>}
            {sheet === "ia" && <div style={{ padding: 12, height: "100%" }}>{iaZone}</div>}
          </BottomSheet>
        )}
      </div>

      {/* ── Modales de publicación ── */}
      {confirmPublish && (
        <PublishConfirmModal
          post={post}
          network={network}
          connected={connected}
          onCancel={() => setConfirmPublish(false)}
          onConfirm={() => {
            onPatch({ status: "published", scheduledAt: undefined });
            setConfirmPublish(false);
            onClose();
          }}
        />
      )}

      {scheduling && (
        <ScheduleModal
          onCancel={() => setScheduling(false)}
          onConfirm={(iso) => {
            onPatch({ status: "scheduled", scheduledAt: iso });
            setScheduling(false);
          }}
        />
      )}

      {downloadDone && (
        <SimpleModal
          title="Descarga iniciada"
          body="Generamos un .zip con la pieza en todas las variantes (PNG, JPG, formato vertical y cuadrado)."
          tone="success"
          onClose={() => setDownloadDone(false)}
        />
      )}

      {galleryOpen && (
        <GalleryModal
          onClose={() => setGalleryOpen(false)}
          onSelect={(url) => {
            onPatch({ image: url });
            setGalleryOpen(false);
          }}
        />
      )}
    </div>
  );

  return createPortal(overlay, document.body);
}

/* ════════════════════════════════════════════════════════════════════════
 * Lienzo — protagonista, overlay editable inline
 * ════════════════════════════════════════════════════════════════════════ */

function Canvas({
  post,
  isStory,
  onPatch,
}: {
  post: SocialPost;
  isStory: boolean;
  onPatch: (patch: Partial<SocialPost>) => void;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSub, setEditingSub] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const subRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTitle) titleRef.current?.focus();
  }, [editingTitle]);
  useEffect(() => {
    if (editingSub) subRef.current?.focus();
  }, [editingSub]);

  return (
    <div className="flex flex-col items-center" style={{ gap: 8, width: "100%", maxWidth: isStory ? 320 : 460 }}>
      <div
        className={`${aspectFor(post.size)} relative overflow-hidden w-full`}
        style={{
          borderRadius: 10,
          border: post.brandApplied ? "3px solid var(--brand)" : "0.5px solid var(--border-ui)",
          background: "#111",
        }}
      >
        <img src={post.image} alt="" className="w-full h-full object-cover" />
        <div
          className="absolute inset-0 flex flex-col justify-end"
          style={{ padding: 16, background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.65))" }}
        >
          {editingTitle ? (
            <textarea
              ref={titleRef}
              value={post.overlay}
              onChange={(e) => onPatch({ overlay: e.target.value })}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  setEditingTitle(false);
                }
                if (e.key === "Escape") {
                  e.stopPropagation();
                  setEditingTitle(false);
                }
              }}
              rows={2}
              aria-label="Título sobre la imagen"
              className="w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: "rgba(0,0,0,0.35)",
                border: "1px dashed rgba(255,255,255,0.6)",
                borderRadius: 6,
                padding: "6px 8px",
                color: "#fff",
                fontWeight: 600,
                fontSize: 15,
                lineHeight: 1.25,
                resize: "vertical",
                outlineColor: "var(--accent-info)",
                fontFamily: "inherit",
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingTitle(true)}
              aria-label="Editar título sobre la imagen"
              className="text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 hover:opacity-90"
              style={{
                background: "transparent",
                border: "none",
                padding: "4px 6px",
                margin: "-4px -6px",
                borderRadius: 6,
                color: "#fff",
                fontWeight: 600,
                fontSize: 15,
                lineHeight: 1.25,
                cursor: "text",
                outlineColor: "var(--accent-info)",
                minHeight: 44,
              }}
            >
              {post.overlay || "Toca para escribir el título…"}
            </button>
          )}

          {!isStory &&
            (editingSub ? (
              <input
                ref={subRef}
                type="text"
                value={post.sub}
                onChange={(e) => onPatch({ sub: e.target.value })}
                onBlur={() => setEditingSub(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setEditingSub(false);
                  if (e.key === "Escape") {
                    e.stopPropagation();
                    setEditingSub(false);
                  }
                }}
                aria-label="Subtítulo sobre la imagen"
                className="w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  marginTop: 4,
                  background: "rgba(0,0,0,0.35)",
                  border: "1px dashed rgba(255,255,255,0.6)",
                  borderRadius: 6,
                  padding: "5px 8px",
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 12.5,
                  outlineColor: "var(--accent-info)",
                  fontFamily: "inherit",
                }}
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditingSub(true)}
                aria-label="Editar subtítulo sobre la imagen"
                className="text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 hover:opacity-90"
                style={{
                  marginTop: 2,
                  background: "transparent",
                  border: "none",
                  padding: "3px 6px",
                  borderRadius: 6,
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 12.5,
                  cursor: "text",
                  outlineColor: "var(--accent-info)",
                  minHeight: 44,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {post.sub || "Toca para escribir el subtítulo…"}
              </button>
            ))}

          {isStory && (
            <div className="flex flex-col" style={{ gap: 6, marginTop: 8 }}>
              <StubPill label="Sticker de link" />
              <StubPill label="Deslizá ↑" />
            </div>
          )}
        </div>
      </div>
      <span
        style={{
          fontSize: "var(--font-size-xs)",
          color: "var(--text-secondary)",
          fontFamily: "monospace",
        }}
      >
        {post.size}
      </span>
    </div>
  );
}

function StubPill({ label }: { label: string }) {
  return (
    <div
      className="inline-flex items-center self-start"
      style={{
        gap: 6,
        padding: "3px 8px",
        background: "rgba(255,255,255,0.16)",
        border: "1px dashed rgba(255,255,255,0.5)",
        borderRadius: "var(--radius-dot)",
        color: "#fff",
        fontSize: 11,
      }}
    >
      {label}
      <Badge tone="warning" style={{ height: 15, fontSize: 8.5 }}>Próximamente</Badge>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Elementos (izquierda) — solo "+ Texto" funcional en v1
 * ════════════════════════════════════════════════════════════════════════ */

function ElementsPanel({
  post,
  onPatch,
  inSheet = false,
}: {
  post: SocialPost;
  onPatch: (patch: Partial<SocialPost>) => void;
  inSheet?: boolean;
}) {
  const items = [
    { id: "text", label: "Texto", Icon: TypeIcon, enabled: true },
    { id: "logo", label: "Logo", Icon: ImageIcon, enabled: false },
    { id: "tag", label: "Etiqueta (oferta)", Icon: Tag, enabled: false },
    { id: "cta", label: "CTA", Icon: LinkIcon, enabled: false },
  ];

  return (
    <aside
      aria-label="Elementos de la pieza"
      className="flex flex-col flex-shrink-0"
      style={{
        width: inSheet ? "100%" : 200,
        background: "var(--surface-page)",
        borderRight: inSheet ? "none" : "0.5px solid var(--border-ui)",
      }}
    >
      <div style={{ padding: "12px 12px 8px" }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--text-tertiary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            margin: 0,
          }}
        >
          Elementos
        </p>
      </div>
      <div className="flex flex-col" style={{ padding: "0 8px 8px", gap: 4 }}>
        {items.map(({ id, label, Icon, enabled }) => (
          <button
            key={id}
            type="button"
            disabled={!enabled}
            onClick={() => {
              if (id === "text") {
                // v1: agrega texto significa asegurar que el subtítulo tenga contenido editable.
                if (!post.sub) onPatch({ sub: "Nuevo texto" });
              }
            }}
            className="flex items-center w-full transition-colors hover:bg-[#fff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              minHeight: 44,
              padding: "6px 8px",
              background: "transparent",
              border: "none",
              cursor: enabled ? "pointer" : "not-allowed",
              textAlign: "left",
              gap: 8,
              borderRadius: 6,
              outlineColor: "var(--ring)",
            }}
          >
            <span
              aria-hidden="true"
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 26,
                height: 26,
                background: "#fff",
                border: "0.5px solid var(--border-ui)",
                borderRadius: 6,
                color: "var(--text-secondary)",
              }}
            >
              <Icon size={13} />
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", flex: 1 }}>
              + {label}
            </span>
            {!enabled && <Badge tone="warning" style={{ height: 16, fontSize: 8.5 }}>Próximamente</Badge>}
          </button>
        ))}
      </div>
    </aside>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Panel Contenido (derecha, tab a)
 * ════════════════════════════════════════════════════════════════════════ */

const settingLabel: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-primary)",
  marginBottom: 6,
};

function ContentPanel({
  post,
  isStory,
  onPatch,
  onOpenGallery,
}: {
  post: SocialPost;
  isStory: boolean;
  onPatch: (patch: Partial<SocialPost>) => void;
  onOpenGallery: () => void;
}) {
  return (
    <div className="flex flex-col" style={{ gap: 22 }}>
      {/* Formato */}
      <div>
        <span style={settingLabel}>Formato</span>
        <div
          role="tablist"
          aria-label="Formato de la pieza"
          className="flex items-center"
          style={{ background: "var(--surface-page)", border: "0.5px solid var(--border-ui)", borderRadius: 7, padding: 2, gap: 2 }}
        >
          {(
            [
              { id: "Post", label: "Post (1:1)" },
              { id: "Historia", label: "Historia (9:16)" },
            ]
          ).map((f) => {
            const active = (f.id === "Historia") === isStory;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onPatch({ type: f.id, size: f.id === "Historia" ? "1080×1920" : "1080×1080" })}
                className="flex-1 flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                style={{
                  height: 30,
                  background: active ? "#fff" : "transparent",
                  border: "none",
                  borderRadius: 5,
                  fontSize: 11.5,
                  fontWeight: active ? 600 : 500,
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  cursor: "pointer",
                  outlineColor: "var(--accent-info)",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Imagen */}
      <div>
        <span style={settingLabel}>Imagen</span>
        <div
          style={{
            width: "100%",
            height: 90,
            background: `url(${post.image}) center/cover`,
            borderRadius: 8,
            border: "0.5px solid var(--border-ui)",
            marginBottom: 8,
          }}
          role="img"
          aria-label="Imagen actual de la pieza"
        />
        <div className="flex items-center" style={{ gap: 10 }}>
          <button
            type="button"
            onClick={onOpenGallery}
            className="transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{ background: "transparent", border: "none", fontSize: 11, fontWeight: 500, color: "var(--accent-info)", cursor: "pointer", padding: 0, outlineColor: "var(--accent-info)" }}
          >
            Cambiar
          </button>
          <span aria-hidden="true" style={{ width: 1, height: 10, background: "var(--border-ui)" }} />
          <span
            title="Próximamente"
            className="inline-flex items-center"
            style={{ gap: 4, fontSize: 11, color: "var(--text-tertiary)" }}
          >
            Subir archivo
            <Badge tone="warning" style={{ height: 15, fontSize: 8.5 }}>Próximamente</Badge>
          </span>
        </div>
      </div>

      {/* Marca */}
      <div>
        <ChromeToggle
          label="Aplicar marca"
          on={!!post.brandApplied}
          onChange={(v) => onPatch({ brandApplied: v })}
        />
        <p style={{ fontSize: 10, color: "var(--text-tertiary)", margin: "6px 0 0", lineHeight: 1.4 }}>
          Agrega el acento de marca del hotel sobre el lienzo.
        </p>
      </div>

      {/* Caption — solo Post */}
      {!isStory ? (
        <div style={{ paddingTop: 4, borderTop: "0.5px solid var(--border-ui)" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: "14px 0 2px" }}>
            Texto del posteo
          </p>
          <p style={{ fontSize: 10, color: "var(--text-tertiary)", margin: "0 0 10px", lineHeight: 1.4 }}>
            Va debajo de la imagen al publicar — distinto del texto sobre la imagen.
          </p>
          <label htmlFor="post-caption" style={settingLabel}>
            Epígrafe
          </label>
          <textarea
            id="post-caption"
            value={post.caption ?? ""}
            onChange={(e) => onPatch({ caption: e.target.value })}
            placeholder="Escribí el texto que acompaña la publicación…"
            rows={4}
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              width: "100%",
              padding: "8px 10px",
              background: "var(--surface-page)",
              border: "0.5px solid var(--border-ui)",
              borderRadius: 6,
              fontSize: 12,
              lineHeight: 1.5,
              color: "var(--text-primary)",
              outline: "none",
              outlineColor: "var(--accent-info)",
              fontFamily: "inherit",
              resize: "vertical",
              boxSizing: "border-box",
              marginBottom: 12,
            }}
          />
          <label htmlFor="post-hashtags" style={settingLabel}>
            Hashtags
          </label>
          <input
            id="post-hashtags"
            type="text"
            value={post.hashtags ?? ""}
            onChange={(e) => onPatch({ hashtags: e.target.value })}
            placeholder="#hotel #cartagena"
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              width: "100%",
              height: 34,
              padding: "0 10px",
              background: "var(--surface-page)",
              border: "0.5px solid var(--border-ui)",
              borderRadius: 6,
              fontSize: 12,
              color: "var(--text-primary)",
              outline: "none",
              outlineColor: "var(--accent-info)",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>
      ) : (
        <div style={{ paddingTop: 4, borderTop: "0.5px solid var(--border-ui)" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: "14px 0 10px" }}>
            Elementos de historia
          </p>
          <div className="flex flex-col" style={{ gap: 8 }}>
            <StubRow icon={LinkIcon} label="Sticker de link" />
            <StubRow icon={ChevronRight} label="Deslizá ↑" />
          </div>
        </div>
      )}
    </div>
  );
}

function StubRow({ icon: Icon, label }: { icon: React.ComponentType<{ size?: number }>; label: string }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ padding: "8px 10px", background: "var(--surface-page)", border: "0.5px solid var(--border-ui)", borderRadius: 6 }}
    >
      <span className="flex items-center" style={{ gap: 8, fontSize: 12, color: "var(--text-secondary)" }}>
        <Icon size={13} />
        {label}
      </span>
      <Badge tone="warning">Próximamente</Badge>
    </div>
  );
}

/** Toggle compacto — mismo patrón que ChromeToggle de ArticleEditorView. */
function ChromeToggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex items-center justify-between w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
      style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", gap: 8, outlineColor: "var(--accent-info)", minHeight: 44 }}
    >
      <span className="flex items-center" style={{ gap: 6, fontSize: 12, color: "var(--text-primary)", textAlign: "left" }}>
        <Palette size={13} style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
        {label}
      </span>
      <span
        aria-hidden="true"
        style={{
          width: 32,
          height: 18,
          borderRadius: 9,
          padding: 2,
          display: "flex",
          flexShrink: 0,
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
 * Panel IA (derecha, tab b) — co-creación mock
 * ════════════════════════════════════════════════════════════════════════ */

interface IaMsg {
  role: "user" | "assistant";
  text: string;
}

function IaPanel({ post, onPatch }: { post: SocialPost; onPatch: (patch: Partial<SocialPost>) => void }) {
  const [remaining, setRemaining] = useState(184);
  const [messages, setMessages] = useState<IaMsg[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<{ overlay: string; sub: string } | null>(null);
  const seedRef = useRef(0);

  const exhausted = remaining <= 0;

  function send() {
    const clean = draft.trim();
    if (!clean || loading || exhausted) return;
    setMessages((m) => [...m, { role: "user", text: clean }]);
    setDraft("");
    setRemaining((r) => Math.max(0, r - 1));
    setLoading(true);
    window.setTimeout(() => {
      const variant = pickVariant(seedRef.current++);
      setProposal(variant);
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Te propongo esta variante para el texto sobre la imagen:" },
      ]);
      setLoading(false);
    }, 1200);
  }

  return (
    <div className="flex flex-col" style={{ height: "100%" }}>
      {/* Contador de prompts */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{ padding: "6px 8px", marginBottom: 8, background: "var(--surface-page)", border: "0.5px solid var(--border-ui)", borderRadius: 8 }}
      >
        <span style={{ fontSize: 10.5, color: "var(--text-secondary)" }}>
          Te quedan <strong style={{ color: "var(--text-primary)" }}>{remaining} / {MAX_PROMPTS}</strong> prompts este mes
        </span>
      </div>

      {/* Cuerpo del chat */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "4px 2px" }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center" style={{ textAlign: "center", padding: "20px 8px", gap: 10 }}>
            <span
              aria-hidden="true"
              className="flex items-center justify-center"
              style={{ width: 40, height: 40, borderRadius: 10, background: "var(--ai-gradient)", color: "#fff" }}
            >
              <Sparkles size={18} />
            </span>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Editor IA</p>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
              Pedile a la IA que ajuste el texto de esta pieza. Nunca reemplaza sola: siempre elegís "Usar esta" antes de aplicar.
            </p>
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: 10 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "90%",
                  padding: "8px 11px",
                  borderRadius: 10,
                  fontSize: 12,
                  lineHeight: 1.5,
                  background: m.role === "user" ? "var(--text-primary)" : "var(--surface-page)",
                  color: m.role === "user" ? "#fff" : "var(--text-primary)",
                  border: m.role === "user" ? "none" : "0.5px solid var(--border-ui)",
                }}
              >
                {m.text}
              </div>
            ))}

            {loading && (
              <div
                role="status"
                aria-live="polite"
                className="flex items-center"
                style={{ alignSelf: "flex-start", gap: 8, fontSize: 12, color: "var(--text-secondary)" }}
              >
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                Generando propuesta…
              </div>
            )}

            {proposal && !loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  maxWidth: "95%",
                  padding: 10,
                  background: "var(--badge-blue-bg)",
                  border: "0.5px solid var(--border-ui)",
                  borderRadius: 10,
                }}
              >
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px" }}>
                  {proposal.overlay}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "0 0 8px" }}>{proposal.sub}</p>
                <div className="flex items-center" style={{ gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      onPatch({ overlay: proposal.overlay, sub: proposal.sub });
                      setMessages((m) => [...m, { role: "assistant", text: "Listo, apliqué esa variante." }]);
                      setProposal(null);
                    }}
                    className="flex items-center transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{ height: 28, padding: "0 10px", gap: 5, background: "var(--brand)", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "#fff", cursor: "pointer", outlineColor: "var(--brand)" }}
                  >
                    <Check size={12} aria-hidden="true" /> Usar esta
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMessages((m) => [...m, { role: "assistant", text: "Descartado. Seguimos con el texto actual." }]);
                      setProposal(null);
                    }}
                    className="flex items-center transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{ height: 28, padding: "0 10px", background: "transparent", border: "0.5px solid var(--border-ui)", borderRadius: 6, fontSize: 11, fontWeight: 500, color: "var(--text-secondary)", cursor: "pointer", outlineColor: "var(--ring)" }}
                  >
                    Descartar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input o bloqueo por agotamiento */}
      {exhausted ? (
        <div
          className="flex flex-col items-center flex-shrink-0"
          style={{ gap: 6, marginTop: 10, padding: 12, background: "var(--badge-orange-bg)", borderRadius: 10, textAlign: "center" }}
        >
          <p style={{ fontSize: 11.5, color: "var(--badge-orange-text)", margin: 0, fontWeight: 600 }}>
            Se agotaron tus prompts del mes
          </p>
          <button
            type="button"
            className="transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{ background: "transparent", border: "none", fontSize: 11, fontWeight: 600, color: "var(--accent-info)", cursor: "pointer", padding: 0, outlineColor: "var(--accent-info)" }}
          >
            Sumar pack extra
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-end flex-shrink-0"
          style={{ gap: 8, marginTop: 10, padding: 8, background: "var(--surface-page)", border: "0.5px solid var(--border-ui)", borderRadius: 10 }}
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ej: hacé el título más corto"
            rows={1}
            aria-label="Pedido para la IA"
            disabled={loading}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              fontSize: 12,
              lineHeight: 1.5,
              color: "var(--text-primary)",
              fontFamily: "inherit",
              maxHeight: 120,
            }}
          />
          <button
            type="submit"
            aria-label="Enviar pedido"
            disabled={!draft.trim() || loading}
            className="flex items-center justify-center transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              width: 30,
              height: 30,
              flexShrink: 0,
              background: draft.trim() && !loading ? "var(--brand)" : "var(--border-ui)",
              border: "none",
              borderRadius: 7,
              cursor: draft.trim() && !loading ? "pointer" : "default",
              outlineColor: "var(--brand)",
            }}
          >
            <Send size={14} style={{ color: "#fff" }} aria-hidden="true" />
          </button>
        </form>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Barra superior — indicadores y menú Publicar
 * ════════════════════════════════════════════════════════════════════════ */

function ViewModeSwitch({ value, onChange }: { value: "edit" | "preview"; onChange: (v: "edit" | "preview") => void }) {
  const opts = [
    { id: "edit" as const, label: "Editar", Icon: SquarePen },
    { id: "preview" as const, label: "Vista previa", Icon: Eye },
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

function StatusPill({ status, scheduledAt }: { status: "draft" | "published" | "scheduled"; scheduledAt?: string }) {
  const label =
    status === "published"
      ? "Publicado"
      : status === "scheduled"
        ? `Programado${scheduledAt ? ` · ${formatShortDate(scheduledAt)}` : ""}`
        : "Borrador";
  const tone = status === "published" ? "success" : status === "scheduled" ? "info" : "neutral";
  return (
    <Badge tone={tone as "success" | "info" | "neutral"} style={{ height: 22, fontSize: 11, padding: "0 10px" }}>
      {label}
    </Badge>
  );
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
}

function SaveIndicator({ status, onRetry }: { status: AutosaveStatus; onRetry: () => void }) {
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

/** Menú desplegable "Publicar ▾": Publicar ahora / Programar / Descargar. */
function PublishMenu({
  open,
  onOpenChange,
  isStory,
  onPublishNow,
  onSchedule,
  onDownload,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  isStory: boolean;
  onPublishNow: () => void;
  onSchedule: () => void;
  onDownload: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) onOpenChange(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onOpenChange(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          height: 32,
          padding: "0 14px",
          gap: 6,
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
        Publicar
        <ChevronDown size={13} aria-hidden="true" />
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
          <button
            type="button"
            role="menuitem"
            onClick={onPublishNow}
            className="flex items-center gap-2.5 w-full px-3 transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
            style={{ height: 40, background: "transparent", fontSize: 13, color: "var(--text-primary)", textAlign: "left", border: "none", cursor: "pointer", outlineColor: "var(--accent-info)" }}
          >
            <Send size={14} style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
            Publicar ahora
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={isStory ? undefined : onSchedule}
            disabled={isStory}
            className="flex items-center gap-2.5 w-full px-3 transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ height: 40, background: "transparent", fontSize: 13, color: "var(--text-primary)", textAlign: "left", border: "none", cursor: isStory ? "not-allowed" : "pointer", outlineColor: "var(--accent-info)" }}
          >
            <Calendar size={14} style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
            Programar
            {isStory && <Badge tone="warning" style={{ marginLeft: "auto" }}>Próximamente</Badge>}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={onDownload}
            className="flex items-center gap-2.5 w-full px-3 transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
            style={{ height: 40, background: "transparent", fontSize: 13, color: "var(--text-primary)", textAlign: "left", border: "none", cursor: "pointer", outlineColor: "var(--accent-info)" }}
          >
            <Download size={14} style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
            Descargar
          </button>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Modales: confirmar publicación / programar / éxito genérico / galería
 * ════════════════════════════════════════════════════════════════════════ */

function ModalShell({
  titleId,
  onClose,
  children,
  maxWidth = 440,
}: {
  titleId: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus trap simple: al montar, enfoca el primer elemento focusable del panel.
  useEffect(() => {
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusables = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
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
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 130, background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex flex-col"
        style={{
          width: "100%",
          maxWidth,
          margin: "0 16px",
          background: "var(--surface-card)",
          borderRadius: "var(--radius-card)",
          border: "0.5px solid var(--border-ui)",
          padding: "var(--space-5)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function PublishConfirmModal({
  post,
  network,
  connected,
  onCancel,
  onConfirm,
}: {
  post: SocialPost;
  network: string;
  connected: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const titleId = "publish-confirm-title";

  if (!connected) {
    return (
      <ModalShell titleId={titleId} onClose={onCancel}>
        <TriangleAlert size={20} aria-hidden="true" style={{ color: "var(--destructive)", marginBottom: 8 }} />
        <h2 id={titleId} style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 8px" }}>
          Conectá {network} para publicar
        </h2>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 16px" }}>
          Todavía no autorizaste el acceso a tu cuenta de {network}. Conectala para poder publicar directo desde acá.
        </p>
        <div className="flex justify-end" style={{ gap: 8 }}>
          <Button variant="secondary" onClick={onCancel}>Cerrar</Button>
          <Button variant="primary" leftIcon={<LinkIcon size={13} aria-hidden="true" />}>
            Conectar {network}
          </Button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell titleId={titleId} onClose={onCancel}>
      <h2 id={titleId} style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 8px" }}>
        Publicar en {network}
      </h2>
      <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 14px" }}>
        Revisá la pieza antes de publicarla. Esta acción la hace visible en tu cuenta.
      </p>
      <div
        className={`${aspectFor(post.size)} relative overflow-hidden`}
        style={{ borderRadius: 8, border: "0.5px solid var(--border-ui)", marginBottom: 16, maxWidth: 220 }}
      >
        <img src={post.image} alt="" className="w-full h-full object-cover" />
        <div
          className="absolute inset-0 flex flex-col justify-end p-2"
          style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6))" }}
        >
          <div className="text-white font-semibold text-[11px] leading-tight">{post.overlay}</div>
          <div className="text-white/80 text-[9px] mt-0.5">{post.sub}</div>
        </div>
      </div>
      <div className="flex justify-end" style={{ gap: 8 }}>
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" onClick={onConfirm}>
          Confirmar y publicar
        </Button>
      </div>
    </ModalShell>
  );
}

function ScheduleModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: (iso: string) => void }) {
  const titleId = "schedule-title";
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  function confirm() {
    if (!date || !time) return;
    onConfirm(new Date(`${date}T${time}`).toISOString());
  }

  return (
    <ModalShell titleId={titleId} onClose={onCancel}>
      <h2 id={titleId} style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 12px" }}>
        Programar publicación
      </h2>
      <div className="flex flex-col" style={{ gap: 12, marginBottom: 16 }}>
        <div>
          <label htmlFor="sched-date" style={settingLabel}>Fecha</label>
          <input
            id="sched-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ width: "100%", height: 38, padding: "0 10px", background: "var(--surface-page)", border: "0.5px solid var(--border-ui)", borderRadius: 6, fontSize: 13, color: "var(--text-primary)", outlineColor: "var(--accent-info)", boxSizing: "border-box" }}
          />
        </div>
        <div>
          <label htmlFor="sched-time" style={settingLabel}>Hora</label>
          <input
            id="sched-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ width: "100%", height: 38, padding: "0 10px", background: "var(--surface-page)", border: "0.5px solid var(--border-ui)", borderRadius: 6, fontSize: 13, color: "var(--text-primary)", outlineColor: "var(--accent-info)", boxSizing: "border-box" }}
          />
        </div>
      </div>
      <div className="flex justify-end" style={{ gap: 8 }}>
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" onClick={confirm} disabled={!date || !time}>
          Programar
        </Button>
      </div>
    </ModalShell>
  );
}

function SimpleModal({
  title,
  body,
  tone,
  onClose,
}: {
  title: string;
  body: string;
  tone?: "success" | "error";
  onClose: () => void;
}) {
  const titleId = "simple-modal-title";
  return (
    <ModalShell titleId={titleId} onClose={onClose}>
      {tone === "success" && <CheckCircle2 size={20} aria-hidden="true" style={{ color: "var(--status-active)", marginBottom: 8 }} />}
      <h2 id={titleId} style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 8px" }}>
        {title}
      </h2>
      <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 16px" }}>
        {body}
      </p>
      <div className="flex justify-end">
        <Button variant="primary" onClick={onClose}>
          Entendido
        </Button>
      </div>
    </ModalShell>
  );
}

function GalleryModal({ onClose, onSelect }: { onClose: () => void; onSelect: (url: string) => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = "gallery-title";
  const entries = Object.entries(hotelImages);

  return (
    <ModalShell titleId={titleId} onClose={onClose} maxWidth={560}>
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <h2 id={titleId} style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
          Elegí una imagen
        </h2>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-opacity hover:opacity-70"
          style={{ width: 28, height: 28, background: "var(--surface-page)", border: "0.5px solid var(--border-ui)", borderRadius: "var(--radius-nav)", cursor: "pointer", outlineColor: "var(--ring)" }}
        >
          <X size={13} aria-hidden="true" style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2" style={{ maxHeight: 360, overflowY: "auto" }}>
        {entries.map(([key, url]) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(url)}
            aria-label={`Usar imagen ${key}`}
            className="aspect-square overflow-hidden relative transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ borderRadius: 8, border: "0.5px solid var(--border-ui)", background: "transparent", padding: 0, cursor: "pointer", outlineColor: "var(--accent-info)" }}
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </ModalShell>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Piezas mobile (≤768px)
 * ════════════════════════════════════════════════════════════════════════ */

function MobileBottomBar({
  active,
  onOpen,
}: {
  active: null | "elements" | "content" | "ia";
  onOpen: (s: "elements" | "content" | "ia") => void;
}) {
  const items = [
    { id: "elements" as const, label: "Elementos", Icon: Plus },
    { id: "content" as const, label: "Contenido", Icon: SquarePen },
    { id: "ia" as const, label: "IA", Icon: Sparkles },
  ];
  return (
    <nav
      aria-label="Acciones del editor"
      className="flex items-stretch flex-shrink-0"
      style={{ background: "#fff", borderTop: "0.5px solid var(--border-ui)", paddingBottom: "env(safe-area-inset-bottom)" }}
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

function BottomSheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
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
    <div className="absolute inset-0 flex flex-col justify-end" style={{ zIndex: 110 }}>
      <div onClick={onClose} aria-hidden="true" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
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
        <div className="flex-1" style={{ minHeight: 0, overflowY: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
