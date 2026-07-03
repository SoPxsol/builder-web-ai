/**
 * SocialEditorView.tsx — Editor de piezas de Redes Sociales (v1)
 * WEB-737 | Rama: sofia/web-737-social-editor-logo-cta (encadenada desde -tag)
 *
 * Arquitectura calcada de ArticleEditorView (blog): modal full-screen vía
 * createPortal, focus trap + ESC + body scroll lock + retorno de foco,
 * autosave con useAutosave, responsive con bottom sheets en mobile.
 *
 * v1 alcance: overlay de texto (título + subtítulo) sobre la imagen, caption/
 * hashtags del posteo, formato, imagen, "aplicar marca" + capa de tinte, y tres
 * elementos "slot" sobre el lienzo (posición por mini-grid cerrado, nunca drag
 * libre): Etiqueta (oferta), Logo (origen: marca del sitio, no se sube acá) y
 * CTA (visual, sin URL/tracking — el link real vive en la bio del perfil).
 * Los tres comparten `ElementPosition`/`PositionPicker` y resuelven choques de
 * posición entre sí (ver `resolvePositionClaim`). La IA es un MOCK de
 * co-creación: propone variantes de texto, nunca reemplaza sola — el usuario
 * elige "Usar esta" o "Descarta".
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
import {
  hotelImages,
  DEFAULT_SCRIM,
  DEFAULT_TAG,
  DEFAULT_LOGO,
  DEFAULT_CTA,
  ELEMENT_POSITIONS,
  CTA_POSITIONS,
  SITE_LOGO_URL,
} from "../../data/social-demo";
import type { SocialPost, ScrimConfig, TagElement, LogoElement, CtaElement, ElementPosition, CtaPosition } from "../../data/social-demo";
import { SocialPhonePreview } from "./SocialPhonePreview";
import { useAutosave, formatSavedAgo, type AutosaveStatus } from "../builder/useAutosave";
import { FOCUSABLE_SELECTOR } from "../../utils/focus";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { readableTextColor } from "../../utils/color";

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
  /**
   * Prompts que quedan del pool mensual de 200 — fuente de verdad única,
   * compartida con "Generar nuevos assets" en RedesSocialesView. Si no se
   * pasa, el panel de IA cae a MAX_PROMPTS (retrocompatible con otros callers).
   */
  remainingPrompts?: number;
  onSpendPrompt?: () => void;
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

/**
 * Color de marca del hotel — en este mock usamos el token de marca del Builder
 * (`--brand`) como proxy, igual que ya hacía el borde del canvas. En producción
 * esto vendría del color de marca configurado por el sitio (Nexus/CMS).
 */
const SITE_BRAND_COLOR = "#e84a2c";
const NEUTRAL_SCRIM_COLOR = "#000000";

/** Resuelve el scrim efectivo del post: retrocompatible si `post.scrim` no existe. */
function resolveScrim(post: SocialPost): ScrimConfig {
  return post.scrim ?? DEFAULT_SCRIM;
}

/** Resuelve la etiqueta efectiva del post: retrocompatible si `post.tag` no existe. */
function resolveTag(post: SocialPost): TagElement {
  return post.tag ?? DEFAULT_TAG;
}

/** Resuelve el logo efectivo del post: retrocompatible si `post.logo` no existe. */
function resolveLogo(post: SocialPost): LogoElement {
  return post.logo ?? DEFAULT_LOGO;
}

/** Resuelve el CTA efectivo del post: retrocompatible si `post.cta` no existe. */
function resolveCta(post: SocialPost): CtaElement {
  return post.cta ?? DEFAULT_CTA;
}

/* ──────────────────────────────────────────────────────────────────────────────
 * Resolución de choques de posición — Etiqueta, Logo y CTA comparten el mismo
 * set de slots. Regla: al mover un elemento a una posición P ya ocupada por
 * otro elemento habilitado, reubicamos automáticamente al ocupante al slot
 * libre más cercano. El elemento recién movido "gana" el slot. No hay
 * configuración manual de colisión — es determinístico y sin motor de layout.
 * ────────────────────────────────────────────────────────────────────────────── */

type SlotKey = "tag" | "logo" | "cta";

/** Orden de cercanía por slot — primer libre de esta lista es el destino del desalojado. */
const NEAREST_SLOTS: Record<ElementPosition, ElementPosition[]> = {
  "top-left": ["top-right", "bottom-left", "center", "bottom-right"],
  "top-right": ["top-left", "bottom-right", "center", "bottom-left"],
  "bottom-left": ["bottom-right", "top-left", "center", "top-right"],
  "bottom-right": ["bottom-left", "top-right", "center", "top-left"],
  center: ["bottom-right", "bottom-left", "top-right", "top-left"],
};

/**
 * Dado el estado de los 3 elementos y cuál se acaba de mover a `position`,
 * devuelve el patch de `SocialPost` con la posición ganada + el reacomodo del
 * ocupante anterior (si lo había). El CTA nunca "compite" por top-*: si un
 * elemento fue desalojado hacia una posición no válida para su propio tipo, se
 * salta esa opción (ver `allowedFor`).
 */
function resolvePositionClaim(
  post: SocialPost,
  mover: SlotKey,
  position: ElementPosition,
): Pick<SocialPost, "tag" | "logo" | "cta"> {
  const tag = resolveTag(post);
  const logo = resolveLogo(post);
  const cta = resolveCta(post);
  const state: Record<SlotKey, { enabled: boolean; position: ElementPosition }> = { tag, logo, cta };

  function allowedFor(slot: SlotKey, pos: ElementPosition): boolean {
    // El CTA no tiene semántica en top-* — nunca lo reubicamos ahí.
    if (slot === "cta") return pos === "bottom-left" || pos === "bottom-right" || pos === "center";
    return true;
  }

  // ¿Quién más (habilitado, distinto del que se mueve) ya está en esa posición?
  const occupant = (Object.keys(state) as SlotKey[]).find(
    (key) => key !== mover && state[key].enabled && state[key].position === position,
  );

  let occupantNewPosition: ElementPosition | null = null;
  if (occupant) {
    const candidates = NEAREST_SLOTS[position].filter((p) => allowedFor(occupant, p));
    const takenByOthers = new Set(
      (Object.keys(state) as SlotKey[])
        .filter((key) => key !== occupant && key !== mover)
        .filter((key) => state[key].enabled)
        .map((key) => state[key].position),
    );
    occupantNewPosition = candidates.find((p) => p !== position && !takenByOthers.has(p)) ?? candidates[0];
  }

  return {
    tag: mover === "tag" ? { ...tag, position } : occupant === "tag" && occupantNewPosition ? { ...tag, position: occupantNewPosition } : tag,
    logo: mover === "logo" ? { ...logo, position } : occupant === "logo" && occupantNewPosition ? { ...logo, position: occupantNewPosition } : logo,
    cta:
      mover === "cta"
        ? { ...cta, position: position as CtaPosition }
        : occupant === "cta" && occupantNewPosition
          ? { ...cta, position: occupantNewPosition as CtaPosition }
          : cta,
  };
}

/** Id del input de Título en ElementsPanel — usado por el texto del lienzo para enfocarlo (click-to-edit). */
const TITLE_INPUT_ID = "title-text-input";

/** Id del input de Subtítulo en ElementsPanel — usado por el texto del lienzo para enfocarlo (click-to-edit). */
const SUB_INPUT_ID = "sub-text-input";

/** Límite suave de caracteres de la Etiqueta — más chico en Historia (9:16, menos ancho útil). */
const TAG_MAX_CHARS = 24;
const TAG_MAX_CHARS_STORY = 18;

/** Id del input de texto de la Etiqueta en ElementsPanel — usado por el chip del lienzo para enfocarlo (click-to-edit). */
const TAG_TEXT_INPUT_ID = "tag-text-input";

/** Límite suave de caracteres del label del CTA — corto a propósito, es un botón, no una frase. */
const CTA_MAX_CHARS = 20;

/** Id del input de label del CTA en ElementsPanel — usado por el CTA del lienzo para enfocarlo (click-to-edit). */
const CTA_LABEL_INPUT_ID = "cta-label-input";

/** Id del primer control (segmented Sm/Md) del Logo en ElementsPanel — el logo no tiene campo de texto que enfocar. */
const LOGO_SIZE_SM_BUTTON_ID = "logo-size-sm-button";

/** Genera el `background` CSS de la capa de tinte según tipo/color/opacidad. */
function scrimBackground(scrim: ScrimConfig): string {
  if (!scrim.enabled) return "transparent";
  const alpha = Math.max(0, Math.min(100, scrim.opacity)) / 100;
  const rgb = hexToRgba(scrim.color, alpha);
  if (scrim.type === "flat") return rgb;
  // Degradé desde abajo: transparente arriba, color a la opacidad elegida abajo.
  return `linear-gradient(180deg, ${hexToRgba(scrim.color, 0)} 40%, ${rgb})`;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Piso mínimo de legibilidad, no configurable: un degradé sutil que garantiza
 * contraste bajo el texto incluso si el usuario baja la opacidad del scrim a 0.
 */
const MIN_LEGIBILITY_GRADIENT = "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.45) 100%)";

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
export function SocialEditorView({
  post,
  network,
  connected,
  onPatch,
  onClose,
  onDownload,
  remainingPrompts = MAX_PROMPTS,
  onSpendPrompt = () => {},
}: Props) {
  const isStory = post.type === "Historia" || post.type === "Story";

  /* ─── Autosave ────────────────────────────────────────────────────────── */
  const save = useCallback(
    () =>
      new Promise<{ ok: boolean; updatedAt: string }>((resolve) => {
        window.setTimeout(() => resolve({ ok: true, updatedAt: new Date().toISOString() }), 450);
      }),
    [],
  );
  const watched = `${post.overlay} ${post.sub} ${post.caption ?? ""} ${post.hashtags ?? ""} ${post.image} ${post.brandApplied} ${JSON.stringify(post.scrim)} ${JSON.stringify(post.tag)} ${JSON.stringify(post.logo)} ${JSON.stringify(post.cta)}`;
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

  const iaZone = (
    <IaPanel post={post} onPatch={onPatch} remainingPrompts={remainingPrompts} onSpendPrompt={onSpendPrompt} />
  );

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
                <Canvas
                  post={post}
                  isStory={isStory}
                  onFocusTag={() => {
                    // Mobile: la Etiqueta se edita en el bottom sheet "Elementos" — lo abrimos
                    // y esperamos a que monte para poder enfocar su input de texto.
                    setSheet("elements");
                    window.setTimeout(() => document.getElementById(TAG_TEXT_INPUT_ID)?.focus(), 80);
                  }}
                  onFocusLogo={() => {
                    setSheet("elements");
                    window.setTimeout(() => document.getElementById(LOGO_SIZE_SM_BUTTON_ID)?.focus(), 80);
                  }}
                  onFocusCta={() => {
                    setSheet("elements");
                    window.setTimeout(() => document.getElementById(CTA_LABEL_INPUT_ID)?.focus(), 80);
                  }}
                  onFocusTitle={() => {
                    setSheet("elements");
                    window.setTimeout(() => document.getElementById(TITLE_INPUT_ID)?.focus(), 80);
                  }}
                  onFocusSub={() => {
                    setSheet("elements");
                    window.setTimeout(() => document.getElementById(SUB_INPUT_ID)?.focus(), 80);
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              {/* IZQUIERDA — Elementos */}
              <ElementsPanel post={post} onPatch={onPatch} />

              {/* CENTRO — Lienzo */}
              <div className="flex-1 overflow-y-auto flex flex-col items-center" style={{ minWidth: 0, background: "var(--surface-page)", padding: "28px 24px" }}>
                <Canvas
                  post={post}
                  isStory={isStory}
                  onFocusTag={() => document.getElementById(TAG_TEXT_INPUT_ID)?.focus()}
                  onFocusLogo={() => document.getElementById(LOGO_SIZE_SM_BUTTON_ID)?.focus()}
                  onFocusCta={() => document.getElementById(CTA_LABEL_INPUT_ID)?.focus()}
                  onFocusTitle={() => document.getElementById(TITLE_INPUT_ID)?.focus()}
                  onFocusSub={() => document.getElementById(SUB_INPUT_ID)?.focus()}
                />
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
 * Lienzo — protagonista, solo visualización de texto (click-to-edit hacia el panel)
 * ════════════════════════════════════════════════════════════════════════ */

function Canvas({
  post,
  isStory,
  onFocusTag,
  onFocusLogo,
  onFocusCta,
  onFocusTitle,
  onFocusSub,
}: {
  post: SocialPost;
  isStory: boolean;
  /** Click-to-edit: la Etiqueta se edita en el panel, no inline — este callback le pasa el foco. */
  onFocusTag: () => void;
  /** Click-to-edit: el Logo se edita en el panel — este callback le pasa el foco. */
  onFocusLogo: () => void;
  /** Click-to-edit: el CTA se edita en el panel — este callback le pasa el foco. */
  onFocusCta: () => void;
  /** Click-to-edit: el Título se edita en el panel — este callback le pasa el foco. */
  onFocusTitle: () => void;
  /** Click-to-edit: el Subtítulo se edita en el panel — este callback le pasa el foco. */
  onFocusSub: () => void;
}) {
  const scrim = resolveScrim(post);
  // Color de texto dinámico: se calcula sobre el color del scrim cuando está
  // activo y con opacidad relevante; si no, cae al piso oscuro no-configurable
  // (que siempre garantiza texto blanco legible).
  const effectiveBg = scrim.enabled && scrim.opacity >= 35 ? scrim.color : NEUTRAL_SCRIM_COLOR;
  const overlayTextColor = readableTextColor(effectiveBg);
  const overlaySubColor = overlayTextColor === "var(--text-primary)" ? "var(--text-secondary)" : "rgba(255,255,255,0.85)";

  return (
    <div className="flex flex-col items-center" style={{ gap: 8, width: "100%", maxWidth: isStory ? 320 : 460 }}>
      <div
        className={`${aspectFor(post.size)} relative overflow-hidden w-full`}
        style={{
          borderRadius: 10,
          border: "0.5px solid var(--border-ui)",
          background: "#111",
        }}
      >
        <img src={post.image} alt="" className="w-full h-full object-cover" />
        {/* Piso mínimo de legibilidad — no configurable, garantiza contraste aunque el scrim esté en 0%. */}
        <div className="absolute inset-0" aria-hidden="true" style={{ background: MIN_LEGIBILITY_GRADIENT }} />
        {/* Capa de tinte configurable por el usuario (marca / neutro, parejo / degradé). */}
        <div className="absolute inset-0" aria-hidden="true" style={{ background: scrimBackground(scrim) }} />

        {/* Etiqueta (oferta) — slot posicionado, click-to-edit hacia el panel de Elementos. */}
        {resolveTag(post).enabled && (
          <TagChip tag={resolveTag(post)} onFocusEdit={onFocusTag} />
        )}

        {/* Logo (marca del sitio) — slot posicionado, click-to-edit hacia el panel de Elementos. */}
        {resolveLogo(post).enabled && SITE_LOGO_URL && (
          <LogoImage logo={resolveLogo(post)} onFocusEdit={onFocusLogo} />
        )}

        {/* CTA — slot posicionado (solo bottom-izq/der/centro), click-to-edit hacia el panel de Elementos. */}
        {resolveCta(post).enabled && (
          <CtaChip cta={resolveCta(post)} onFocusEdit={onFocusCta} />
        )}

        <div
          className="absolute inset-0 flex flex-col justify-end"
          style={{ padding: 16 }}
        >
          {/* Título — solo visualización; click-to-edit pasa el foco al input del panel de Elementos. */}
          <button
            type="button"
            onClick={onFocusTitle}
            aria-label="Editar título — se edita en el panel de Elementos"
            className="text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 hover:opacity-90"
            style={{
              background: "transparent",
              border: "none",
              padding: "4px 6px",
              margin: "-4px -6px",
              borderRadius: 6,
              color: overlayTextColor,
              fontWeight: 600,
              fontSize: 15,
              lineHeight: 1.25,
              cursor: "pointer",
              outlineColor: "var(--ring-on-dark)",
              minHeight: 44,
            }}
          >
            {post.overlay || "Sin título — click para escribirlo en el panel"}
          </button>

          {!isStory && (
            <button
              type="button"
              onClick={onFocusSub}
              aria-label="Editar subtítulo — se edita en el panel de Elementos"
              className="text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 hover:opacity-90"
              style={{
                marginTop: 2,
                background: "transparent",
                border: "none",
                padding: "3px 6px",
                borderRadius: 6,
                color: overlaySubColor,
                fontSize: 12.5,
                cursor: "pointer",
                outlineColor: "var(--ring-on-dark)",
                minHeight: 44,
                display: "flex",
                alignItems: "center",
              }}
            >
              {post.sub || "Sin subtítulo — click para escribirlo en el panel"}
            </button>
          )}

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

/**
 * Resuelve el `style` de posicionamiento absoluto para un slot dado — genérico,
 * lo va a reusar cualquier elemento superpuesto al lienzo (Etiqueta, Logo, CTA).
 * `bottomOffset` levanta el elemento por encima del borde inferior — lo usa el
 * CTA para no quedar pegado/tapando el overlay de título/subtítulo, que vive
 * siempre en la franja inferior.
 */
function positionStyle(position: ElementPosition, bottomOffset = 0): React.CSSProperties {
  const edge = 12;
  switch (position) {
    case "top-left":
      return { top: edge, left: edge };
    case "top-right":
      return { top: edge, right: edge };
    case "bottom-left":
      return { bottom: edge + bottomOffset, left: edge };
    case "bottom-right":
      return { bottom: edge + bottomOffset, right: edge };
    case "center":
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }
}

/** Alto aproximado de la franja del overlay de texto (título + subtítulo) que el CTA debe evitar tapar en bottom-*. */
const CTA_BOTTOM_CLEARANCE = 54;

/**
 * Chip real de la Etiqueta sobre el lienzo — clickeable, sin drag, pasa el foco
 * al panel. El botón usa padding "invisible" para llegar al target táctil de
 * 44px sin agrandar el chip visual (mismo recurso que el título/subtítulo).
 */
function TagChip({ tag, onFocusEdit }: { tag: TagElement; onFocusEdit: () => void }) {
  const solid = tag.style === "solid";
  return (
    <button
      type="button"
      onClick={onFocusEdit}
      aria-label={`Editar etiqueta: ${tag.text || "sin texto"}`}
      className="absolute inline-flex items-center transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        ...positionStyle(tag.position),
        maxWidth: "calc(100% - 24px)",
        padding: 8,
        margin: -8,
        minHeight: 44,
        minWidth: 44,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        outlineColor: "var(--ring-on-dark)",
      }}
    >
      <span
        className="inline-flex items-center"
        style={{
          padding: "6px 12px",
          maxWidth: "100%",
          background: solid ? "var(--brand)" : "rgba(0,0,0,0.28)",
          border: solid ? "none" : "1.5px solid #fff",
          borderRadius: "var(--radius-dot)",
          color: solid ? readableTextColor("#e84a2c") : "#fff",
          fontSize: 12,
          fontWeight: 700,
          lineHeight: 1.3,
          boxShadow: solid ? "none" : "0 1px 3px rgba(0,0,0,0.25)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {tag.text || "Etiqueta"}
      </span>
    </button>
  );
}

/** Tamaño del logo en píxeles según `LogoElement.size`. */
const LOGO_SIZE_PX: Record<LogoElement["size"], number> = { sm: 32, md: 48 };

/**
 * Logo (marca del sitio) sobre el lienzo — clickeable, sin drag, pasa el foco
 * al panel. Contenedor con fondo translúcido + sombra sutil: piso mínimo de
 * legibilidad para que el logo no se pierda si cae sobre una zona clara de la foto.
 */
function LogoImage({ logo, onFocusEdit }: { logo: LogoElement; onFocusEdit: () => void }) {
  const size = LOGO_SIZE_PX[logo.size];
  return (
    <button
      type="button"
      onClick={onFocusEdit}
      aria-label="Editar logo"
      className="absolute inline-flex items-center justify-center transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        ...positionStyle(logo.position),
        padding: 8,
        margin: -8,
        minHeight: 44,
        minWidth: 44,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        outlineColor: "var(--ring-on-dark)",
      }}
    >
      <span
        className="flex items-center justify-center"
        style={{
          width: size,
          height: size,
          padding: 4,
          background: "rgba(255,255,255,0.85)",
          borderRadius: 8,
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }}
      >
        <img
          src={SITE_LOGO_URL ?? undefined}
          alt="Logo del hotel"
          className="w-full h-full object-contain"
          style={{ borderRadius: 4 }}
        />
      </span>
    </button>
  );
}

/**
 * CTA sobre el lienzo — clickeable, sin drag, pasa el foco al panel.
 * "button" = pill con fondo de marca; "text-link" = texto subrayado sobre la foto.
 */
function CtaChip({ cta, onFocusEdit }: { cta: CtaElement; onFocusEdit: () => void }) {
  const isButton = cta.style === "button";
  // El overlay de título/subtítulo vive siempre abajo — si el CTA cae en bottom-*,
  // le damos margen para no quedar pegado/tapándolo (ver CTA_BOTTOM_CLEARANCE).
  const bottomOffset = cta.position === "center" ? 0 : CTA_BOTTOM_CLEARANCE;
  return (
    <button
      type="button"
      onClick={onFocusEdit}
      aria-label={`Editar CTA: ${cta.label || "sin texto"}`}
      className="absolute inline-flex items-center transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        ...positionStyle(cta.position, bottomOffset),
        maxWidth: "calc(100% - 24px)",
        padding: 8,
        margin: -8,
        minHeight: 44,
        minWidth: 44,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        outlineColor: "var(--ring-on-dark)",
      }}
    >
      {isButton ? (
        <span
          className="inline-flex items-center"
          style={{
            padding: "8px 16px",
            maxWidth: "100%",
            background: "var(--brand)",
            borderRadius: "var(--radius-dot)",
            color: readableTextColor("#e84a2c"),
            fontSize: 12.5,
            fontWeight: 700,
            lineHeight: 1.3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
          }}
        >
          {cta.label || "Reservá ahora"}
        </span>
      ) : (
        <span
          className="inline-flex items-center"
          style={{
            maxWidth: "100%",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "underline",
            textUnderlineOffset: 3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textShadow: "0 1px 3px rgba(0,0,0,0.5)",
          }}
        >
          {cta.label || "Reservá ahora"}
        </span>
      )}
    </button>
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
  return (
    <aside
      aria-label="Elementos de la pieza"
      className={inSheet ? "flex flex-col" : "flex flex-col flex-shrink-0 overflow-y-auto"}
      style={{
        width: inSheet ? "100%" : 200,
        minHeight: 0,
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
        {/* Texto de la pieza (título + subtítulo) — siempre presente en el lienzo, se edita acá en vez de sobre la imagen. */}
        <TextCard post={post} onPatch={onPatch} isStory={post.type === "Historia" || post.type === "Story"} />

        {/* Logo (marca del sitio) — card con toggle + controles inline. Origen: logo de marca del sitio, no se sube acá. */}
        <LogoCard post={post} onPatch={onPatch} />

        {/* Etiqueta (oferta) — primer elemento "slot" real: card con toggle + controles inline. */}
        <TagCard post={post} onPatch={onPatch} />

        {/* CTA — card con toggle + controles inline (label, estilo, posición restringida). */}
        <CtaCard post={post} onPatch={onPatch} />
      </div>
    </aside>
  );
}

/**
 * Card de Texto de la pieza (Título + Subtítulo) en el panel de Elementos —
 * a diferencia de Etiqueta/Logo/CTA no lleva toggle: título y subtítulo son
 * parte fija de la pieza (siempre están en el lienzo), así que la card queda
 * siempre expandida. Reemplaza la edición inline sobre la imagen — el lienzo
 * ahora solo muestra el texto (click-to-edit vuelve acá).
 */
function TextCard({
  post,
  onPatch,
  isStory,
}: {
  post: SocialPost;
  onPatch: (patch: Partial<SocialPost>) => void;
  isStory: boolean;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid var(--border-ui)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <div
        className="flex items-center w-full"
        style={{ minHeight: 44, padding: "6px 8px", gap: 8 }}
      >
        <span
          aria-hidden="true"
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 26, height: 26, background: "var(--surface-page)", border: "0.5px solid var(--border-ui)", borderRadius: 6, color: "var(--text-secondary)" }}
        >
          <TypeIcon size={13} />
        </span>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", flex: 1 }}>
          Texto de la pieza
        </span>
      </div>

      <div className="flex flex-col" style={{ padding: "0 10px 12px", gap: 12, borderTop: "0.5px solid var(--border-ui)" }}>
        {/* Título */}
        <div style={{ marginTop: 10 }}>
          <label htmlFor={TITLE_INPUT_ID} style={settingLabel}>
            Título
          </label>
          <textarea
            id={TITLE_INPUT_ID}
            value={post.overlay}
            onChange={(e) => onPatch({ overlay: e.target.value })}
            placeholder="Ej: Mañanas que no se apuran."
            rows={2}
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              width: "100%",
              padding: "6px 10px",
              background: "var(--surface-page)",
              border: "0.5px solid var(--border-ui)",
              borderRadius: 6,
              fontSize: 12,
              lineHeight: 1.4,
              color: "var(--text-primary)",
              outline: "none",
              outlineColor: "var(--accent-info)",
              fontFamily: "inherit",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Subtítulo — no aplica a Historia (usa el slot de sticker/deslizá en su lugar) */}
        {!isStory && (
          <div>
            <label htmlFor={SUB_INPUT_ID} style={settingLabel}>
              Subtítulo
            </label>
            <input
              id={SUB_INPUT_ID}
              type="text"
              value={post.sub}
              onChange={(e) => onPatch({ sub: e.target.value })}
              placeholder="Ej: Hotel Azul Marino"
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
        )}
      </div>
    </div>
  );
}

/**
 * Card de la Etiqueta (oferta) en el panel de Elementos — patrón que van a
 * replicar Logo y CTA: header con toggle, y al activarse expande controles
 * inline (texto, estilo, posición). El toggle OFF saca la etiqueta del lienzo
 * pero conserva el texto ya cargado (no castiga el probar-y-volver).
 */
function TagCard({ post, onPatch }: { post: SocialPost; onPatch: (patch: Partial<SocialPost>) => void }) {
  const isStory = post.type === "Historia" || post.type === "Story";
  const tag = resolveTag(post);
  const maxChars = isStory ? TAG_MAX_CHARS_STORY : TAG_MAX_CHARS;
  const overLimit = tag.text.length > maxChars;

  function patchTag(partial: Partial<TagElement>) {
    onPatch({ tag: { ...tag, ...partial } });
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid var(--border-ui)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        role="switch"
        aria-checked={tag.enabled}
        onClick={() => patchTag({ enabled: !tag.enabled })}
        className="flex items-center w-full transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
        style={{ minHeight: 44, padding: "6px 8px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", gap: 8 }}
      >
        <span
          aria-hidden="true"
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 26, height: 26, background: "var(--surface-page)", border: "0.5px solid var(--border-ui)", borderRadius: 6, color: "var(--text-secondary)" }}
        >
          <Tag size={13} />
        </span>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", flex: 1 }}>
          {tag.enabled ? "Etiqueta (oferta)" : "+ Etiqueta (oferta)"}
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
            background: tag.enabled ? "var(--status-active)" : "var(--border-ui)",
            justifyContent: tag.enabled ? "flex-end" : "flex-start",
            transition: "background 0.15s ease",
          }}
        >
          <span style={{ width: 14, height: 14, borderRadius: 7, background: "#fff" }} />
        </span>
      </button>

      {tag.enabled && (
        <div className="flex flex-col" style={{ padding: "0 10px 12px", gap: 12, borderTop: "0.5px solid var(--border-ui)" }}>
          {/* Texto */}
          <div style={{ marginTop: 10 }}>
            <label htmlFor={TAG_TEXT_INPUT_ID} style={settingLabel}>
              Texto
            </label>
            <input
              id={TAG_TEXT_INPUT_ID}
              type="text"
              value={tag.text}
              onChange={(e) => patchTag({ text: e.target.value })}
              placeholder="Ej: 20% OFF"
              aria-describedby="tag-text-counter"
              className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                width: "100%",
                height: 34,
                padding: "0 10px",
                background: "var(--surface-page)",
                border: overLimit ? "1px solid var(--destructive)" : "0.5px solid var(--border-ui)",
                borderRadius: 6,
                fontSize: 12,
                color: "var(--text-primary)",
                outline: "none",
                outlineColor: "var(--accent-info)",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
            <p
              id="tag-text-counter"
              role={overLimit ? "alert" : undefined}
              style={{
                fontSize: 10,
                margin: "4px 0 0",
                textAlign: "right",
                color: overLimit ? "var(--destructive)" : "var(--text-tertiary)",
              }}
            >
              {overLimit
                ? `Un poco largo para verse bien — probá acortarlo (${tag.text.length}/${maxChars})`
                : `${tag.text.length}/${maxChars}`}
            </p>
          </div>

          {/* Estilo */}
          <div>
            <span style={settingLabel}>Estilo</span>
            <div
              role="tablist"
              aria-label="Estilo de la etiqueta"
              className="flex items-center"
              style={{ background: "var(--surface-page)", border: "0.5px solid var(--border-ui)", borderRadius: 7, padding: 2, gap: 2 }}
            >
              {(
                [
                  { id: "solid" as const, label: "Sólido" },
                  { id: "outline" as const, label: "Outline" },
                ]
              ).map((opt) => {
                const active = tag.style === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => patchTag({ style: opt.id })}
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
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Posición — mini-grid genérico, reusable por Logo/CTA. Resuelve choques con otros elementos habilitados. */}
          <div>
            <span style={settingLabel}>Posición</span>
            <PositionPicker
              value={tag.position}
              onChange={(position) => onPatch(resolvePositionClaim(post, "tag", position))}
              ariaLabel="Posición de la etiqueta sobre la imagen"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Card del Logo en el panel de Elementos — mismo patrón que TagCard: header
 * con toggle, controles inline al activarse (tamaño + posición, sin campo de
 * texto porque es una imagen). Origen del logo: "Marca del sitio" — NO se sube
 * ad-hoc acá. Si el sitio no tiene logo cargado (`SITE_LOGO_URL` null), el
 * toggle queda disabled con tooltip explicando dónde cargarlo.
 */
function LogoCard({ post, onPatch }: { post: SocialPost; onPatch: (patch: Partial<SocialPost>) => void }) {
  const logo = resolveLogo(post);
  const hasSiteLogo = !!SITE_LOGO_URL;

  function patchLogo(partial: Partial<LogoElement>) {
    onPatch({ logo: { ...logo, ...partial } });
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid var(--border-ui)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        role="switch"
        aria-checked={logo.enabled}
        disabled={!hasSiteLogo}
        title={hasSiteLogo ? undefined : "Subí tu logo en Marca del sitio"}
        onClick={() => patchLogo({ enabled: !logo.enabled })}
        className="flex items-center w-full transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent"
        style={{ minHeight: 44, padding: "6px 8px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", gap: 8 }}
      >
        <span
          aria-hidden="true"
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 26, height: 26, background: "var(--surface-page)", border: "0.5px solid var(--border-ui)", borderRadius: 6, color: "var(--text-secondary)" }}
        >
          <ImageIcon size={13} />
        </span>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", flex: 1 }}>
          {logo.enabled ? "Logo" : "+ Logo"}
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
            background: logo.enabled ? "var(--status-active)" : "var(--border-ui)",
            justifyContent: logo.enabled ? "flex-end" : "flex-start",
            transition: "background 0.15s ease",
          }}
        >
          <span style={{ width: 14, height: 14, borderRadius: 7, background: "#fff" }} />
        </span>
      </button>

      {!hasSiteLogo && (
        <p style={{ fontSize: 10, color: "var(--text-tertiary)", margin: "0 10px 10px", lineHeight: 1.4 }}>
          Subí tu logo en Marca del sitio para poder agregarlo a las piezas.
        </p>
      )}

      {logo.enabled && hasSiteLogo && (
        <div className="flex flex-col" style={{ padding: "0 10px 12px", gap: 12, borderTop: "0.5px solid var(--border-ui)" }}>
          {/* Tamaño */}
          <div style={{ marginTop: 10 }}>
            <span style={settingLabel}>Tamaño</span>
            <div
              role="tablist"
              aria-label="Tamaño del logo"
              className="flex items-center"
              style={{ background: "var(--surface-page)", border: "0.5px solid var(--border-ui)", borderRadius: 7, padding: 2, gap: 2 }}
            >
              {(
                [
                  { id: "sm" as const, label: "Sm" },
                  { id: "md" as const, label: "Md" },
                ]
              ).map((opt) => {
                const active = logo.size === opt.id;
                return (
                  <button
                    key={opt.id}
                    id={opt.id === "sm" ? LOGO_SIZE_SM_BUTTON_ID : undefined}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => patchLogo({ size: opt.id })}
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
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Posición — mismo mini-grid genérico */}
          <div>
            <span style={settingLabel}>Posición</span>
            <PositionPicker
              value={logo.position}
              onChange={(position) => onPatch(resolvePositionClaim(post, "logo", position))}
              ariaLabel="Posición del logo sobre la imagen"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Card del CTA en el panel de Elementos — mismo patrón: header con toggle,
 * controles inline (label con contador, estilo, posición restringida a
 * bottom-izq/der/centro porque no compite con el overlay de título/subtítulo).
 */
function CtaCard({ post, onPatch }: { post: SocialPost; onPatch: (patch: Partial<SocialPost>) => void }) {
  const cta = resolveCta(post);
  const overLimit = cta.label.length > CTA_MAX_CHARS;

  function patchCta(partial: Partial<CtaElement>) {
    onPatch({ cta: { ...cta, ...partial } });
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid var(--border-ui)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        role="switch"
        aria-checked={cta.enabled}
        onClick={() => patchCta({ enabled: !cta.enabled })}
        className="flex items-center w-full transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
        style={{ minHeight: 44, padding: "6px 8px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", gap: 8 }}
      >
        <span
          aria-hidden="true"
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 26, height: 26, background: "var(--surface-page)", border: "0.5px solid var(--border-ui)", borderRadius: 6, color: "var(--text-secondary)" }}
        >
          <LinkIcon size={13} />
        </span>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", flex: 1 }}>
          {cta.enabled ? "CTA" : "+ CTA"}
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
            background: cta.enabled ? "var(--status-active)" : "var(--border-ui)",
            justifyContent: cta.enabled ? "flex-end" : "flex-start",
            transition: "background 0.15s ease",
          }}
        >
          <span style={{ width: 14, height: 14, borderRadius: 7, background: "#fff" }} />
        </span>
      </button>

      {cta.enabled && (
        <div className="flex flex-col" style={{ padding: "0 10px 12px", gap: 12, borderTop: "0.5px solid var(--border-ui)" }}>
          {/* Label */}
          <div style={{ marginTop: 10 }}>
            <label htmlFor={CTA_LABEL_INPUT_ID} style={settingLabel}>
              Texto del botón
            </label>
            <input
              id={CTA_LABEL_INPUT_ID}
              type="text"
              value={cta.label}
              onChange={(e) => patchCta({ label: e.target.value })}
              placeholder="Ej: Reservá ahora"
              aria-describedby="cta-label-counter"
              className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                width: "100%",
                height: 34,
                padding: "0 10px",
                background: "var(--surface-page)",
                border: overLimit ? "1px solid var(--destructive)" : "0.5px solid var(--border-ui)",
                borderRadius: 6,
                fontSize: 12,
                color: "var(--text-primary)",
                outline: "none",
                outlineColor: "var(--accent-info)",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
            <p
              id="cta-label-counter"
              role={overLimit ? "alert" : undefined}
              style={{
                fontSize: 10,
                margin: "4px 0 0",
                textAlign: "right",
                color: overLimit ? "var(--destructive)" : "var(--text-tertiary)",
              }}
            >
              {overLimit
                ? `Un poco largo para verse bien — probá acortarlo (${cta.label.length}/${CTA_MAX_CHARS})`
                : `${cta.label.length}/${CTA_MAX_CHARS}`}
            </p>
          </div>

          {/* Estilo */}
          <div>
            <span style={settingLabel}>Estilo</span>
            <div
              role="tablist"
              aria-label="Estilo del CTA"
              className="flex items-center"
              style={{ background: "var(--surface-page)", border: "0.5px solid var(--border-ui)", borderRadius: 7, padding: 2, gap: 2 }}
            >
              {(
                [
                  { id: "button" as const, label: "Botón" },
                  { id: "text-link" as const, label: "Texto" },
                ]
              ).map((opt) => {
                const active = cta.style === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => patchCta({ style: opt.id })}
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
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Posición — restringida a bottom-izq/der/centro, no compite con el overlay de título/subtítulo. */}
          <div>
            <span style={settingLabel}>Posición</span>
            <PositionPicker
              value={cta.position}
              onChange={(position) => onPatch(resolvePositionClaim(post, "cta", position))}
              ariaLabel="Posición del CTA sobre la imagen"
              allowedPositions={CTA_POSITIONS.map((p) => p.id)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Mini-grid visual de posición — GENÉRICO, no atado a la Etiqueta. Logo y CTA
 * van a reusar este mismo selector. Radiogroup accesible: flechas para mover
 * entre celdas, aria-checked, celdas ≥44px (touch-friendly).
 */
function PositionPicker({
  value,
  onChange,
  ariaLabel,
  allowedPositions,
}: {
  value: ElementPosition;
  onChange: (position: ElementPosition) => void;
  ariaLabel: string;
  /** Subset habilitado — ej. el CTA no ofrece top-*. Si no se pasa, las 5 posiciones están disponibles. */
  allowedPositions?: ElementPosition[];
}) {
  // Layout fijo 3x2 que mapea a las 5 posiciones del modelo (centro ocupa el medio de la fila del medio).
  const grid: (ElementPosition | null)[][] = [
    ["top-left", null, "top-right"],
    [null, "center", null],
    ["bottom-left", null, "bottom-right"],
  ];

  function isAllowed(pos: ElementPosition): boolean {
    return !allowedPositions || allowedPositions.includes(pos);
  }

  function move(delta: [number, number]) {
    const flat = ELEMENT_POSITIONS.map((p) => p.id).filter(isAllowed);
    const idx = flat.indexOf(value);
    const next = flat[(idx + delta[0] + flat.length) % flat.length];
    onChange(next);
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="grid"
      style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 4, maxWidth: 160 }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          move([1, 0]);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          move([-1, 0]);
        }
      }}
    >
      {grid.flatMap((row, ri) =>
        row.map((cell, ci) => {
          if (!cell) {
            return <span key={`${ri}-${ci}`} aria-hidden="true" style={{ width: 44, height: 44 }} />;
          }
          const meta = ELEMENT_POSITIONS.find((p) => p.id === cell)!;
          const active = value === cell;
          const disabled = !isAllowed(cell);
          return (
            <button
              key={cell}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={disabled ? `${meta.label} (no disponible para este elemento)` : meta.label}
              title={disabled ? `${meta.label} — no disponible para este elemento` : meta.label}
              tabIndex={active ? 0 : -1}
              disabled={disabled}
              onClick={() => onChange(cell)}
              className="flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 disabled:cursor-not-allowed"
              style={{
                width: 44,
                height: 44,
                background: disabled ? "var(--surface-page)" : active ? "var(--badge-blue-bg)" : "var(--surface-page)",
                border: active ? "1.5px solid var(--accent-info)" : "0.5px solid var(--border-ui)",
                borderRadius: 6,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.35 : 1,
                outlineColor: "var(--accent-info)",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: active ? "var(--accent-info)" : "var(--text-tertiary)",
                }}
              />
            </button>
          );
        }),
      )}
    </div>
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

      {/* Marca + capa sobre la imagen (mismo bloque: la marca define el color del tinte) */}
      <div>
        <ChromeToggle
          label="Aplicar marca"
          on={!!post.brandApplied}
          onChange={(v) => {
            const scrim = resolveScrim(post);
            onPatch({
              brandApplied: v,
              scrim: { ...scrim, color: v ? SITE_BRAND_COLOR : NEUTRAL_SCRIM_COLOR },
            });
          }}
        />
        <p style={{ fontSize: 10, color: "var(--text-tertiary)", margin: "6px 0 0", lineHeight: 1.4 }}>
          Tiñe el degradé sobre la imagen con el color de marca del hotel en vez de negro neutro.
        </p>

        {/* Capa sobre la imagen — siempre disponible, independiente de la marca */}
        {resolveScrim(post).enabled && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "0.5px solid var(--border-ui)" }}>
            <span style={settingLabel}>Capa sobre la imagen</span>

            {/* Segmented control Parejo | Degradé — mismo patrón que el selector de Formato */}
            <div
              role="tablist"
              aria-label="Tipo de capa sobre la imagen"
              className="flex items-center"
              style={{ background: "var(--surface-page)", border: "0.5px solid var(--border-ui)", borderRadius: 7, padding: 2, gap: 2, marginBottom: 12 }}
            >
              {(
                [
                  { id: "flat" as const, label: "Parejo" },
                  { id: "gradient" as const, label: "Degradé" },
                ]
              ).map((opt) => {
                const scrim = resolveScrim(post);
                const active = scrim.type === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => onPatch({ scrim: { ...scrim, type: opt.id } })}
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
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Slider de intensidad */}
            <label htmlFor="scrim-opacity" style={settingLabel}>
              Intensidad
            </label>
            <input
              id="scrim-opacity"
              type="range"
              min={0}
              max={100}
              step={5}
              value={resolveScrim(post).opacity}
              onChange={(e) => onPatch({ scrim: { ...resolveScrim(post), opacity: Number(e.target.value) } })}
              aria-label="Intensidad de la capa sobre la imagen"
              className="w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ width: "100%", accentColor: "var(--brand)", outlineColor: "var(--accent-info)", minHeight: 24 }}
            />
            <div className="flex items-center justify-between" style={{ marginTop: 2 }}>
              <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>Transparente</span>
              <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>Cubre todo</span>
            </div>
          </div>
        )}
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

function IaPanel({
  post,
  onPatch,
  remainingPrompts,
  onSpendPrompt,
}: {
  post: SocialPost;
  onPatch: (patch: Partial<SocialPost>) => void;
  /** Prompts que quedan del pool mensual — fuente de verdad única, elevada a RedesSocialesView. */
  remainingPrompts: number;
  /** Descuenta 1 prompt del pool compartido (generador de assets + chat IA gastan del mismo total). */
  onSpendPrompt: () => void;
}) {
  const [messages, setMessages] = useState<IaMsg[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<{ overlay: string; sub: string } | null>(null);
  const seedRef = useRef(0);

  const exhausted = remainingPrompts <= 0;

  function send() {
    const clean = draft.trim();
    if (!clean || loading || exhausted) return;
    setMessages((m) => [...m, { role: "user", text: clean }]);
    setDraft("");
    onSpendPrompt();
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
          Te quedan <strong style={{ color: "var(--text-primary)" }}>{remainingPrompts} / {MAX_PROMPTS}</strong> prompts este mes
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
