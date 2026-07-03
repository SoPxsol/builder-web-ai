/**
 * RedesSocialesView.tsx — Gestor de Redes Sociales
 * WEB-737 | Rama: sofia/web-737-gestor-redes-sociales
 *
 * Vista nativa del Builder. Portada y re-estilada desde pxsol-mkt-qa;
 * adopción total del DS del Builder (tokens, componentes UI, shell).
 *
 * Bugs del QA original corregidos:
 * - Acciones de asset SIEMPRE visibles (no opacity-0 group-hover).
 * - Tabs implementados como tablist accesible (role/aria/flechas de teclado).
 * - Modal con focus-trap, aria-modal y retorno de foco al cerrar.
 * - Estados de carga, vacío y error contemplados.
 * - aria-live para anunciar assets listos.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  Camera, Users, Download, Pencil, Sparkles, Loader2,
  Smartphone, EyeOff, X, CheckCircle2, AlertCircle,
  Link as LinkIcon,
} from "lucide-react";
import type { View } from "../../types";
import { ViewHeader } from "../ui/view-header";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { SocialPhonePreview } from "./SocialPhonePreview";
import { SocialEditorView } from "./SocialEditorView";
import { socialPosts, campaignOptions } from "../../data/social-demo";
import type { SocialPost } from "../../data/social-demo";

/* ──────────────────────────────────────────────────────────────────────────────
 * Props
 * ────────────────────────────────────────────────────────────────────────────── */

interface Props {
  siteName: string;
  navigate: (view: View, siteId?: number) => void;
}

/* ──────────────────────────────────────────────────────────────────────────────
 * Constantes de red
 * ────────────────────────────────────────────────────────────────────────────── */

interface NetworkDef {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: string | boolean }> | null;
  /** Color de marca oficial — solo para el phone preview y el dot de estado. */
  brandColor: string;
  connected: boolean;
}

const NETWORKS: NetworkDef[] = [
  { id: "Instagram", label: "Instagram", icon: Camera,   brandColor: "#0095F6", connected: true  },
  { id: "Facebook",  label: "Facebook",  icon: Users,    brandColor: "#1877F2", connected: true  },
  { id: "TikTok",   label: "TikTok",   icon: null,     brandColor: "#FE2C55", connected: false },
];

/* ──────────────────────────────────────────────────────────────────────────────
 * Utilidades
 * ────────────────────────────────────────────────────────────────────────────── */

function aspectFor(size: string): string {
  if (!size) return "aspect-square";
  const [w, h] = size.split("×").map(Number);
  if (!w || !h) return "aspect-square";
  const ratio = w / h;
  if (ratio > 1.3) return "aspect-video";      // ~16/9
  if (ratio < 0.75) return "aspect-[9/16]";
  if (ratio < 0.95) return "aspect-[4/5]";
  return "aspect-square";
}

/* ──────────────────────────────────────────────────────────────────────────────
 * Modal genérico accesible
 * ────────────────────────────────────────────────────────────────────────────── */

interface ModalInfo {
  title: string;
  body: string;
  tone?: "default" | "success" | "error";
}

function Modal({
  info,
  onClose,
  titleId,
}: {
  info: ModalInfo;
  onClose: () => void;
  titleId: string;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef   = useRef<HTMLButtonElement>(null);

  // Focus trap: al montar, mueve el foco al botón de cierre.
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Cerrar con Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        // Focus trap simple: un solo elemento focusable (el botón cerrar).
        e.preventDefault();
        closeRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      aria-hidden="false"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex flex-col"
        style={{
          width: "100%",
          maxWidth: 440,
          margin: "0 16px",
          background: "var(--surface-card)",
          borderRadius: "var(--radius-card)",
          border: "0.5px solid var(--border-ui)",
          padding: "var(--space-5)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        }}
      >
        {/* Icono de tono */}
        {info.tone === "success" && (
          <CheckCircle2 size={20} aria-hidden="true" style={{ color: "var(--status-active)", marginBottom: 8 }} />
        )}
        {info.tone === "error" && (
          <AlertCircle size={20} aria-hidden="true" style={{ color: "var(--destructive)", marginBottom: 8 }} />
        )}

        <h2
          id={titleId}
          style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 8px" }}
        >
          {info.title}
        </h2>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
          {info.body}
        </p>

        <div className="flex justify-end mt-5">
          <Button ref={closeRef} variant="primary" onClick={onClose}>
            Entendido
          </Button>
        </div>

        {/* Cerrar × */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-opacity hover:opacity-70"
          style={{
            top: 14, right: 14,
            width: 28, height: 28,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--surface-page)",
            border: "0.5px solid var(--border-ui)",
            borderRadius: "var(--radius-nav)",
            cursor: "pointer",
            outlineColor: "var(--ring)",
          }}
        >
          <X size={13} aria-hidden="true" style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
 * PostCard — asset individual con acciones siempre visibles
 * ────────────────────────────────────────────────────────────────────────────── */

interface PostCardProps {
  post: SocialPost;
  onAction: (action: "edit" | "download") => void;
}

/** Pill de estado sobre la card (badge sobre la imagen) — solo si no es "draft". */
function PostStatusBadge({ post }: { post: SocialPost }) {
  if (!post.status || post.status === "draft") return null;
  if (post.status === "published") {
    return <Badge tone="success">Publicado</Badge>;
  }
  const shortDate = post.scheduledAt
    ? new Date(post.scheduledAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })
    : "";
  return <Badge tone="info">Programado{shortDate ? ` ${shortDate}` : ""}</Badge>;
}

function PostCard({ post, onAction }: PostCardProps) {
  return (
    <article
      style={{
        background: "var(--surface-card)",
        borderRadius: "var(--radius-card)",
        border: "0.5px solid var(--border-ui)",
        overflow: "hidden",
      }}
    >
      {/* Imagen */}
      <div className={`${aspectFor(post.size)} relative overflow-hidden`}>
        <img
          src={post.image}
          alt={`${post.type} — ${post.overlay}`}
          className="w-full h-full object-cover"
        />
        {/* Overlay de texto */}
        <div
          className="absolute inset-0 flex flex-col justify-end p-3"
          style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6))" }}
          aria-hidden="true"
        >
          <div className="text-white font-semibold text-[13px] leading-tight">{post.overlay}</div>
          <div className="text-white/80 text-[11px] mt-0.5">{post.sub}</div>
        </div>
        {/* Badge de tipo */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <Badge tone="neutral" style={{ background: "rgba(255,255,255,0.9)", color: "var(--text-primary)" }}>
            {post.type}
          </Badge>
          <PostStatusBadge post={post} />
        </div>
      </div>

      {/* Pie de card */}
      <div
        className="flex items-center justify-between gap-2 px-3 py-2"
        style={{ borderTop: "0.5px solid var(--border-ui)" }}
      >
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
            fontFamily: "monospace",
            flexShrink: 0,
          }}
        >
          {post.size}
        </span>
        {/*
          Acciones SIEMPRE visibles — bug crítico del QA original era
          opacity-0/group-hover que las hacía inaccesibles por teclado.
          flex-shrink-0 en el wrapper impide que los botones se compriman;
          el span de tamaño cede espacio si la card es angosta.
        */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => onAction("edit")}
            className="flex items-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-opacity hover:opacity-70"
            style={{
              height: 28,
              padding: "0 8px",
              fontSize: "var(--font-size-sm)",
              color: "var(--text-secondary)",
              background: "var(--surface-page)",
              border: "0.5px solid var(--border-ui)",
              borderRadius: "var(--radius-nav)",
              cursor: "pointer",
              outlineColor: "var(--ring)",
              whiteSpace: "nowrap",
            }}
            aria-label={`Editar ${post.type} — ${post.overlay}`}
          >
            <Pencil size={11} aria-hidden="true" />
            <span>Editar</span>
          </button>
          <button
            type="button"
            onClick={() => onAction("download")}
            className="flex items-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-opacity hover:opacity-70"
            style={{
              height: 28,
              padding: "0 8px",
              fontSize: "var(--font-size-sm)",
              color: "var(--text-secondary)",
              background: "var(--surface-page)",
              border: "0.5px solid var(--border-ui)",
              borderRadius: "var(--radius-nav)",
              cursor: "pointer",
              outlineColor: "var(--ring)",
              whiteSpace: "nowrap",
            }}
            aria-label={`Descargar ${post.type} — ${post.overlay}`}
          >
            <Download size={11} aria-hidden="true" />
            <span>Descargar</span>
          </button>
        </div>
      </div>
    </article>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
 * Componente principal
 * ────────────────────────────────────────────────────────────────────────────── */

export function RedesSocialesView({ siteName, navigate }: Props) {
  const [activeNetwork, setActiveNetwork] = useState("Instagram");
  const [campaign, setCampaign] = useState(campaignOptions[0]);
  const [generating, setGenerating] = useState(false);
  const [modal, setModal] = useState<ModalInfo | null>(null);
  const [showPhone, setShowPhone] = useState(true);
  // Anuncio accesible de assets listos
  const [liveMessage, setLiveMessage] = useState("");
  // Referencia al wrapper del botón Generar para retorno de foco al cerrar modal
  const generateBtnWrapRef = useRef<HTMLDivElement>(null);
  // Referencia al tablist para navegación por flechas
  const tablistRef = useRef<HTMLDivElement>(null);

  const modalTitleId = useId();

  // Posts elevados a estado local (single source of truth): editar/publicar/
  // programar se reflejan en la grilla y en el preview del teléfono.
  const [postsByNetwork, setPostsByNetwork] = useState<Record<string, SocialPost[]>>(socialPosts);
  // Pieza abierta en el editor: { network, index } — null = editor cerrado.
  const [editing, setEditing] = useState<{ network: string; index: number } | null>(null);

  const posts: SocialPost[] = postsByNetwork[activeNetwork] ?? [];

  /** Aplica un patch a un post puntual (por red + índice) — pasado al editor como onPatch. */
  const patchPost = useCallback((network: string, index: number, patch: Partial<SocialPost>) => {
    setPostsByNetwork((prev) => {
      const list = prev[network] ?? [];
      if (!list[index]) return prev;
      const nextList = list.slice();
      nextList[index] = { ...nextList[index], ...patch };
      return { ...prev, [network]: nextList };
    });
  }, []);

  // Retorno de foco al cerrar modal
  const closeModal = useCallback(() => {
    setModal(null);
    // Timeout mínimo para que el DOM actualice antes de mover el foco
    setTimeout(() => {
      const btn = generateBtnWrapRef.current?.querySelector<HTMLButtonElement>("button");
      btn?.focus();
    }, 0);
  }, []);

  function triggerGenerate() {
    if (generating) return;
    setGenerating(true);
    setLiveMessage("");
    setTimeout(() => {
      setGenerating(false);
      const msg = `6 nuevos assets listos para ${activeNetwork}`;
      setLiveMessage(msg);
      setModal({
        title: "Assets listos",
        body: `Generamos 6 piezas para "${campaign}" en ${activeNetwork}. En la versión completa esto se sincroniza con tu calendario editorial.`,
        tone: "success",
      });
    }, 1800);
  }

  // Navegación por flechas dentro del tablist (WCAG 2.2 — Keyboard)
  function handleTabKeydown(e: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const tabs = tablistRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    if (!tabs) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      tabs[(index + 1) % tabs.length].focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      tabs[(index - 1 + tabs.length) % tabs.length].focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      tabs[0].focus();
    } else if (e.key === "End") {
      e.preventDefault();
      tabs[tabs.length - 1].focus();
    }
  }

  return (
    <>
      <main
        className="flex-1 overflow-y-auto"
        style={{ background: "var(--surface-page)" }}
        aria-label="Gestor de redes sociales"
      >
        <div style={{ padding: "var(--space-5)", maxWidth: 1000, margin: "0 auto" }}>

          {/* ── ViewHeader ── */}
          <ViewHeader
            eyebrow={`${siteName} · Marketing`}
            title="Redes sociales"
            description={(() => {
              const net = NETWORKS.find((n) => n.id === activeNetwork);
              const count = (postsByNetwork[activeNetwork] ?? []).length;
              const label = net?.label ?? activeNetwork;
              return `${count} piezas generadas para ${label} — feed, stories y más. Editá lo que necesites y descargá cuando quieras.`;
            })()}
            navigate={navigate}
            action={
              <Button
                variant="primary"
                leftIcon={<LinkIcon size={13} aria-hidden="true" />}
              >
                Conectar cuenta
              </Button>
            }
          />

          {/* ── Cuentas conectadas ── */}
          <section aria-label="Cuentas conectadas" className="mb-5">
            <div
              className="flex items-center gap-3 flex-wrap"
              style={{
                background: "var(--surface-card)",
                borderRadius: "var(--radius-card)",
                border: "0.5px solid var(--border-ui)",
                padding: "var(--space-3) var(--space-4)",
              }}
            >
              <span
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  flexShrink: 0,
                }}
              >
                Cuentas
              </span>

              {NETWORKS.map((net) => {
                const Icon = net.icon;
                return net.connected ? (
                  /* Cuenta conectada */
                  <div
                    key={net.id}
                    className="flex items-center gap-1.5"
                    style={{
                      padding: "3px 10px",
                      borderRadius: "var(--radius-dot)",
                      background: "var(--surface-page)",
                      border: "0.5px solid var(--border-ui)",
                    }}
                  >
                    {Icon && <Icon size={13} aria-hidden="true" style={{ color: net.brandColor }} />}
                    {!Icon && (
                      <span aria-hidden="true" style={{ fontSize: "var(--font-size-xs)", fontWeight: 700, color: net.brandColor }}>TT</span>
                    )}
                    <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-primary)", fontWeight: 500 }}>
                      {net.label}
                    </span>
                    {/* Dot verde = conectado */}
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "var(--status-active)",
                        flexShrink: 0,
                      }}
                      aria-label="Conectado"
                    />
                  </div>
                ) : (
                  /* Cuenta desconectada — borde dashed */
                  <button
                    key={net.id}
                    type="button"
                    className="flex items-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-opacity hover:opacity-70"
                    style={{
                      padding: "3px 10px",
                      borderRadius: "var(--radius-dot)",
                      background: "transparent",
                      border: "1.5px dashed var(--border-ui)",
                      cursor: "pointer",
                      outlineColor: "var(--ring)",
                    }}
                    aria-label={`Conectar ${net.label}`}
                    onClick={() =>
                      setModal({
                        title: `Conectar ${net.label}`,
                        body: `Para conectar tu cuenta de ${net.label}, necesitás autorizar el acceso desde la configuración de tu página. En la versión completa este flujo estará integrado aquí.`,
                      })
                    }
                  >
                    {Icon && <Icon size={13} aria-hidden="true" style={{ color: net.brandColor }} />}
                    {!Icon && (
                      <span aria-hidden="true" style={{ fontSize: "var(--font-size-xs)", fontWeight: 700, color: net.brandColor }}>TT</span>
                    )}
                    <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
                      {net.label}
                    </span>
                    <span style={{ fontSize: "var(--font-size-xs)", color: "var(--accent-info)" }}>
                      Conectar
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Toolbar de campaña ── */}
          <section
            aria-label="Generar assets"
            className="flex items-end gap-3 flex-wrap mb-5"
            style={{
              background: "var(--surface-card)",
              borderRadius: "var(--radius-card)",
              border: "0.5px solid var(--border-ui)",
              padding: "var(--space-4)",
            }}
          >
            {/* Select de campaña */}
            <div className="flex-1" style={{ minWidth: 240 }}>
              <label
                htmlFor="campaign-select"
                style={{
                  display: "block",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 6,
                }}
              >
                ¿Qué querés comunicar?
              </label>
              <select
                id="campaign-select"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                disabled={generating}
                style={{
                  display: "block",
                  width: "100%",
                  height: 34,
                  padding: "0 10px",
                  fontSize: "var(--font-size-md)",
                  color: "var(--text-primary)",
                  background: "var(--surface-page)",
                  border: "0.5px solid var(--border-ui)",
                  borderRadius: "var(--radius-nav)",
                  cursor: generating ? "not-allowed" : "pointer",
                  appearance: "auto",
                  outlineColor: "var(--accent-info)",
                }}
                className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {campaignOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Botón generar — div wrapper para retorno de foco al cerrar modal */}
            <div ref={generateBtnWrapRef}>
            <Button
              variant="primary"
              disabled={generating}
              onClick={triggerGenerate}
              leftIcon={
                generating
                  ? <Loader2 size={13} aria-hidden="true" className="animate-spin" />
                  : <Sparkles size={13} aria-hidden="true" />
              }
              aria-busy={generating}
              aria-live="polite"
            >
              {generating ? "Generando…" : "Generar nuevos assets"}
            </Button>
            </div>
          </section>

          {/* Anuncio aria-live para screen readers */}
          <div
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          >
            {liveMessage}
          </div>

          {/* ── Tabs de red + botón de preview ── */}
          <div
            className="flex items-center gap-0 mb-5"
            style={{ borderBottom: "0.5px solid var(--border-ui)" }}
          >
            <div
              ref={tablistRef}
              role="tablist"
              aria-label="Redes sociales"
              className="flex items-center"
            >
              {NETWORKS.map((net, index) => {
                const Icon = net.icon;
                const active = activeNetwork === net.id;
                return (
                  <button
                    key={net.id}
                    role="tab"
                    id={`tab-${net.id}`}
                    aria-selected={active}
                    aria-controls={`panel-${net.id}`}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setActiveNetwork(net.id)}
                    onKeyDown={(e) => handleTabKeydown(e, index)}
                    className="relative flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors"
                    style={{
                      height: 44,          // target táctil ≥44px (WCAG 2.2)
                      padding: "0 16px",
                      fontSize: "var(--font-size-md)",
                      fontWeight: active ? 600 : 400,
                      color: active ? "var(--text-primary)" : "var(--text-secondary)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      outlineColor: "var(--accent-info)",
                      borderRadius: "var(--radius-nav) var(--radius-nav) 0 0",
                    }}
                  >
                    {Icon
                      ? <Icon size={14} aria-hidden="true" />
                      : <span aria-hidden="true" style={{ fontSize: "var(--font-size-xs)", fontWeight: 700 }}>TT</span>
                    }
                    <span>{net.label}</span>
                    <Badge tone="neutral" style={{ marginLeft: 2 }}>
                      {postsByNetwork[net.id]?.length ?? 0}
                    </Badge>
                    {/* Indicador de tab activo */}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-0 left-0 right-0 h-[2px]"
                        style={{ background: "var(--brand)" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Botón "Ver previsualización" cuando el phone está oculto */}
            {!showPhone && (
              <button
                type="button"
                onClick={() => setShowPhone(true)}
                className="ml-auto flex items-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-opacity hover:opacity-70"
                style={{
                  height: 44,
                  padding: "0 12px",
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-secondary)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  outlineColor: "var(--ring)",
                }}
              >
                <Smartphone size={14} aria-hidden="true" />
                Ver previsualización
              </button>
            )}
          </div>

          {/* ── Contenido del tab activo ── */}
          {NETWORKS.map((net) => {
            const tabPosts = postsByNetwork[net.id] ?? [];
            const isActive = activeNetwork === net.id;

            return (
              <div
                key={net.id}
                role="tabpanel"
                id={`panel-${net.id}`}
                aria-labelledby={`tab-${net.id}`}
                hidden={!isActive}
              >
                {isActive && (
                  <div className="flex gap-6 items-start">
                    {/* ── Grid de assets ── */}
                    <div
                      className="flex-1 min-w-0"
                      style={{ minWidth: 0 }}
                    >
                      {/* Estado: red no conectada */}
                      {!net.connected && (
                        <div
                          className="flex flex-col items-center text-center py-12 px-6"
                          style={{
                            background: "var(--surface-card)",
                            borderRadius: "var(--radius-card)",
                            border: "1.5px dashed var(--border-ui)",
                          }}
                        >
                          <div
                            style={{
                              width: 44, height: 44,
                              borderRadius: "var(--radius-icon)",
                              background: "var(--surface-page)",
                              border: "0.5px solid var(--border-ui)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              marginBottom: 12,
                            }}
                          >
                            <LinkIcon size={20} aria-hidden="true" style={{ color: "var(--text-secondary)" }} />
                          </div>
                          <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 6px" }}>
                            {net.label} no está conectado
                          </p>
                          <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", maxWidth: 320, lineHeight: 1.5, margin: "0 0 16px" }}>
                            Conectá tu cuenta para ver y publicar los assets generados.
                          </p>
                          <Button
                            variant="secondary"
                            leftIcon={<LinkIcon size={13} aria-hidden="true" />}
                            onClick={() =>
                              setModal({
                                title: `Conectar ${net.label}`,
                                body: `Para conectar tu cuenta de ${net.label}, necesitás autorizar el acceso. En la versión completa este flujo estará integrado aquí.`,
                              })
                            }
                          >
                            Conectar {net.label}
                          </Button>
                        </div>
                      )}

                      {/* Estado: generando */}
                      {net.connected && generating && (
                        <div
                          className="flex flex-col items-center text-center py-12"
                          style={{
                            background: "var(--surface-card)",
                            borderRadius: "var(--radius-card)",
                            border: "0.5px solid var(--border-ui)",
                          }}
                          aria-live="polite"
                          aria-busy="true"
                        >
                          <Loader2
                            size={28}
                            aria-hidden="true"
                            className="animate-spin"
                            style={{ color: "var(--brand)", marginBottom: 12 }}
                          />
                          <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)" }}>
                            Generando assets para {net.label}…
                          </p>
                        </div>
                      )}

                      {/* Estado: red conectada + posts vacíos */}
                      {net.connected && !generating && tabPosts.length === 0 && (
                        <div
                          className="flex flex-col items-center text-center py-12 px-6"
                          style={{
                            background: "var(--surface-card)",
                            borderRadius: "var(--radius-card)",
                            border: "0.5px solid var(--border-ui)",
                          }}
                        >
                          <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 6px" }}>
                            Todavía no hay assets
                          </p>
                          <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", maxWidth: 320, lineHeight: 1.5 }}>
                            Seleccioná una campaña y hacé clic en "Generar nuevos assets" para crear piezas para {net.label}.
                          </p>
                        </div>
                      )}

                      {/* Estado: red conectada + posts disponibles */}
                      {net.connected && !generating && tabPosts.length > 0 && (
                        <div
                          className="grid gap-4"
                          style={{
                            /*
                             * minmax aumentado a 240px (con phone) / 220px (sin phone)
                             * para que ambos botones Editar+Descargar quepan sin clippearse.
                             * El pie de card necesita al menos ~220px para dos botones con
                             * icono+texto a padding: 0 10px c/u + gap-1 + espacio de tamaño.
                             */
                            gridTemplateColumns: showPhone
                              ? "repeat(auto-fill, minmax(240px, 1fr))"
                              : "repeat(auto-fill, minmax(220px, 1fr))",
                          }}
                        >
                          {tabPosts.map((post, i) => (
                            <PostCard
                              key={i}
                              post={post}
                              onAction={(action) => {
                                if (action === "edit") {
                                  // Abre el editor real de la pieza (WEB-737 — reemplaza el modal placeholder).
                                  setEditing({ network: net.id, index: i });
                                  return;
                                }
                                setModal({
                                  title: "Descarga iniciada",
                                  body: "Generamos un .zip con la pieza en todas las variantes (PNG, JPG, formato vertical y cuadrado).",
                                  tone: "success",
                                });
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ── Phone preview (oculto en <lg) ── */}
                    {showPhone && net.connected && (
                      <aside
                        className="hidden lg:flex flex-col flex-shrink-0 sticky top-4"
                        style={{ width: 320 }}
                        aria-label={`Previsualización móvil de ${net.label}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1.5" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
                            <Smartphone size={14} aria-hidden="true" style={{ color: "var(--brand)" }} />
                            Previsualización · {net.label}
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowPhone(false)}
                            className="flex items-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-opacity hover:opacity-70"
                            style={{
                              height: 28,
                              padding: "0 10px",
                              fontSize: "var(--font-size-xs)",
                              color: "var(--text-secondary)",
                              background: "var(--surface-page)",
                              border: "0.5px solid var(--border-ui)",
                              borderRadius: "var(--radius-nav)",
                              cursor: "pointer",
                              outlineColor: "var(--ring)",
                            }}
                          >
                            <EyeOff size={12} aria-hidden="true" />
                            Ocultar
                          </button>
                        </div>

                        <SocialPhonePreview network={net.id} />

                        <p
                          className="mt-3 text-center leading-relaxed"
                          style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)" }}
                          aria-hidden="true"
                        >
                          Tocá una publicación para previsualizarla.
                        </p>
                      </aside>
                    )}
                  </div>
                )}
              </div>
            );
          })}

        </div>
      </main>

      {/* ── Modal ── */}
      {modal && (
        <Modal
          info={modal}
          onClose={closeModal}
          titleId={modalTitleId}
        />
      )}

      {/* ── Editor de piezas de Redes Sociales (WEB-737) ── */}
      {editing && postsByNetwork[editing.network]?.[editing.index] && (
        <SocialEditorView
          post={postsByNetwork[editing.network][editing.index]}
          network={editing.network}
          connected={NETWORKS.find((n) => n.id === editing.network)?.connected ?? false}
          onPatch={(patch) => patchPost(editing.network, editing.index, patch)}
          onClose={() => setEditing(null)}
          onDownload={() =>
            setModal({
              title: "Descarga iniciada",
              body: "Generamos un .zip con la pieza en todas las variantes (PNG, JPG, formato vertical y cuadrado).",
              tone: "success",
            })
          }
        />
      )}
    </>
  );
}
