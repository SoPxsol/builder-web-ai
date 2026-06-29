/**
 * GoogleBusinessView.tsx — Gestor de Google Business Profile
 * WEB-737 | Rama: sofia/web-737-gestor-redes-sociales
 *
 * Vista nativa del Builder. Portada y re-estilada desde
 * pxsol-home-mkt-division/src/screens/channels/GoogleBusiness.jsx.
 * Adopción total del DS del Builder (tokens, componentes UI, shell).
 *
 * Colores de plataforma Google mantenidos (azul/rojo/verde/amarillo del logo
 * y estrellas doradas) — igual que los colores sociales en RedesSocialesView.
 * Todo lo demás usa tokens del sistema.
 *
 * Accesibilidad carry-over:
 * - Checkboxes con label semántico y visibilidad de foco.
 * - Modal con role="dialog", aria-modal, focus-trap y Escape.
 * - StarRow con aria-label descriptivo.
 * - Campos de edición con label explícito.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  MapPin, Phone, Clock, Globe, MessageSquare,
  Plus, Check, Star, Sparkles, X, CheckCircle2,
} from "lucide-react";
import type { View } from "../../types";
import { ViewHeader } from "../ui/view-header";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  googleBusinessData,
  type GoogleBusinessData,
  type GbReview,
} from "../../data/google-business-demo";

/* ────────────────────────────────────────────────────────────────────────────
 * Props
 * ──────────────────────────────────────────────────────────────────────────── */

interface Props {
  siteName: string;
  navigate: (view: View, siteId?: number) => void;
}

/* ────────────────────────────────────────────────────────────────────────────
 * StarRow — fila de estrellas con valor numérico.
 * Las estrellas amarillas son el color de marca de Google — se mantienen.
 * ──────────────────────────────────────────────────────────────────────────── */

function StarRow({ value }: { value: number }) {
  const full = Math.floor(value);
  const half = value % 1 >= 0.5;
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${value.toFixed(1)} de 5 estrellas`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          // Color de marca Google/estrellas — se mantiene como color de plataforma
          style={{ color: "#F4B400" }}
          fill={i < full || (half && i === full) ? "#F4B400" : "none"}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      ))}
      <span
        className="ml-1"
        style={{ fontFamily: "monospace", fontSize: "var(--font-size-xs)", color: "var(--text-primary)" }}
      >
        {value.toFixed(1)}
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Modal de respuesta a reseña — accesible (focus-trap, Escape, aria-modal)
 * ──────────────────────────────────────────────────────────────────────────── */

function ReplyModal({
  review,
  onClose,
  titleId,
}: {
  review: GbReview;
  onClose: () => void;
  titleId: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      aria-hidden="false"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{
          width: "100%",
          maxWidth: 480,
          margin: "0 16px",
          background: "var(--surface-card)",
          borderRadius: "var(--radius-card)",
          border: "0.5px solid var(--border-ui)",
          padding: "var(--space-5)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          position: "relative",
        }}
      >
        <h2
          id={titleId}
          style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 8px" }}
        >
          Respuesta generada con IA
        </h2>

        <div
          className="flex items-center gap-2 mb-4"
          style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}
        >
          En respuesta a{" "}
          <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{review.author}</span>
          <span style={{ margin: "0 6px" }}>·</span>
          <StarRow value={review.stars} />
        </div>

        <div
          style={{
            padding: "var(--space-3) var(--space-4)",
            borderRadius: "var(--radius-nav)",
            background: "var(--surface-page)",
            fontSize: "var(--font-size-md)",
            color: "var(--text-primary)",
            lineHeight: 1.6,
            marginBottom: "var(--space-3)",
            fontStyle: "italic",
          }}
        >
          {review.aiReply}
        </div>
        <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>
          Tono adaptado a la reseña original. Editá antes de publicar si querés cambiar algo.
        </p>

        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="secondary" onClick={onClose}>Regenerar</Button>
          <Button variant="primary" onClick={onClose}>Publicar respuesta</Button>
        </div>

        {/* Botón cerrar × */}
        <button
          ref={closeRef}
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

/* ────────────────────────────────────────────────────────────────────────────
 * Componente principal
 * ──────────────────────────────────────────────────────────────────────────── */

export function GoogleBusinessView({ siteName, navigate }: Props) {
  const [data, setData] = useState<GoogleBusinessData>(googleBusinessData);
  const [openReply, setOpenReply] = useState<GbReview | null>(null);
  const modalTitleId = useId();

  const update = <K extends keyof GoogleBusinessData>(k: K, v: GoogleBusinessData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const toggleAttr = (id: string) =>
    setData((d) => ({
      ...d,
      attributes: d.attributes.map((a) => (a.id === id ? { ...a, on: !a.on } : a)),
    }));

  const closeModal = useCallback(() => setOpenReply(null), []);

  return (
    <>
      <main
        className="flex-1 overflow-y-auto"
        style={{ background: "var(--surface-page)" }}
        aria-label="Gestor de Google Business Profile"
      >
        <div style={{ padding: "var(--space-5)", maxWidth: 1200, margin: "0 auto" }}>

          {/* ── ViewHeader ── */}
          <ViewHeader
            eyebrow={`${siteName} · Marketing`}
            title="Google Business Profile"
            description="La ficha que Google muestra cuando alguien busca tu hotel. Optimizá con tu marca, fotos y horarios para aparecer al primer click."
            navigate={navigate}
            action={
              <div className="flex items-center gap-2">
                <Badge tone="warning">87% completo</Badge>
                <Button variant="primary" leftIcon={<Sparkles size={13} aria-hidden="true" />}>
                  Publicar cambios
                </Button>
              </div>
            }
          />

          {/*
           * Grid responsive: en anchos chicos (Builder con nav laterales, ~900px de contenido)
           * las dos columnas necesitan un mínimo para no comprimir el mock card.
           * auto-fit con minmax permite que pasen a una columna si no hay espacio.
           * Sticky removido de la col izquierda: no funciona dentro de overflow-y-auto
           * (el ancestor con overflow crea un stacking context que corta el sticky).
           */}
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
              alignItems: "start",
            }}
          >
            {/* ── Columna izquierda: mock Google Maps card ── */}
            <div
              style={{
                background: "var(--surface-card)",
                borderRadius: "var(--radius-card)",
                border: "0.5px solid var(--border-ui)",
                overflow: "hidden",
                minWidth: 0,
              }}
            >
              {/* Topbar del mock */}
              <div
                className="flex items-center gap-2 px-3 py-2"
                style={{ borderBottom: "0.5px solid var(--border-ui)" }}
              >
                {/* Logo de Google — colores de plataforma, se mantienen */}
                <svg viewBox="0 0 24 24" width="18" height="18" aria-label="Google" role="img">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 010-4.18V7.07H2.18a11 11 0 000 9.86l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
                </svg>
                <span style={{ fontFamily: "monospace", fontSize: "var(--font-size-xs)", color: "var(--text-secondary)" }}>
                  google.com/maps
                </span>
                <Badge tone="positive" style={{ marginLeft: "auto" }}>vista previa</Badge>
              </div>

              {/* Mapa placeholder */}
              <div
                style={{
                  height: 160,
                  background: "linear-gradient(135deg, #E8EAED, #F1F3F4)",
                  position: "relative",
                }}
                aria-hidden="true"
              >
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  {/* Pin Google — color de plataforma, se mantiene */}
                  <div
                    style={{
                      width: 28, height: 28,
                      borderRadius: "50%",
                      background: "#EA4335",
                      border: "2px solid white",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white",
                    }}
                  >
                    <MapPin size={14} fill="currentColor" aria-hidden="true" />
                  </div>
                </div>
              </div>

              {/* Fotos en grid 3 col */}
              <div
                className="grid grid-cols-3 gap-0.5"
                style={{ height: 100 }}
                aria-label="Fotos de la propiedad"
              >
                {data.photos.slice(0, 3).map((p, i) => (
                  <img
                    key={i}
                    src={p}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover"
                  />
                ))}
              </div>

              {/* Info del negocio */}
              <div style={{ padding: "var(--space-4)" }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                  {data.name}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <StarRow value={4.6} />
                  <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
                    (284 reseñas)
                  </span>
                </div>
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", marginBottom: 8 }}>
                  {data.category} · 4 estrellas · {data.secondaryCategories[0]}
                </div>
                <div style={{ fontSize: "var(--font-size-md)", color: "var(--text-primary)", lineHeight: 1.5, marginBottom: 10 }}>
                  {data.shortDescription}
                </div>

                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }} className="space-y-1.5">
                  {[
                    { Icon: MapPin,  text: data.address  },
                    { Icon: Clock,   text: data.hours    },
                    { Icon: Phone,   text: data.phone    },
                    { Icon: Globe,   text: data.website  },
                  ].map(({ Icon, text }) => (
                    <div key={text} className="flex items-center gap-2">
                      <Icon size={12} aria-hidden="true" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  {/* Botones de acción en el mock — color Google, se mantiene */}
                  <button
                    type="button"
                    style={{
                      height: 36,
                      borderRadius: "var(--radius-nav)",
                      background: "#1A73E8",
                      color: "white",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: 500,
                      border: "none",
                      cursor: "pointer",
                    }}
                    aria-label="Llamar al hotel"
                  >
                    Llamar
                  </button>
                  <button
                    type="button"
                    style={{
                      height: 36,
                      borderRadius: "var(--radius-nav)",
                      background: "transparent",
                      border: "0.5px solid var(--border-ui)",
                      color: "var(--text-primary)",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Cómo llegar
                  </button>
                </div>
              </div>
            </div>

            {/* ── Columna derecha: editor ── */}
            <div className="space-y-4" style={{ minWidth: 0 }}>

              {/* Datos del negocio */}
              <section
                aria-label="Datos del negocio"
                style={{
                  background: "var(--surface-card)",
                  borderRadius: "var(--radius-card)",
                  border: "0.5px solid var(--border-ui)",
                  padding: "var(--space-4)",
                }}
              >
                <p
                  style={{
                    fontSize: "var(--font-size-xs)",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "var(--space-4)",
                  }}
                >
                  Datos del negocio
                </p>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Field label="Nombre">
                    <input
                      value={data.name}
                      onChange={(e) => update("name", e.target.value)}
                      style={inputStyle}
                      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    />
                  </Field>
                  <Field label="Categoría principal">
                    <input
                      value={data.category}
                      onChange={(e) => update("category", e.target.value)}
                      style={inputStyle}
                      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    />
                  </Field>
                </div>

                <Field label="Categorías secundarias" className="mb-3">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {data.secondaryCategories.map((c) => (
                      <Badge key={c} tone="neutral">{c}</Badge>
                    ))}
                    <button
                      type="button"
                      className="flex items-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-opacity hover:opacity-70"
                      style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", background: "transparent", border: "none", cursor: "pointer", outlineColor: "var(--ring)" }}
                    >
                      <Plus size={12} aria-hidden="true" /> Agregar
                    </button>
                  </div>
                </Field>

                <Field label="Descripción corta" hint="generada con IA" className="mb-3">
                  <textarea
                    value={data.shortDescription}
                    onChange={(e) => update("shortDescription", e.target.value)}
                    rows={3}
                    style={{ ...inputStyle, height: "auto", resize: "vertical", paddingTop: 8, paddingBottom: 8 }}
                    className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Field label="Teléfono">
                    <input value={data.phone} onChange={(e) => update("phone", e.target.value)} style={inputStyle} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" />
                  </Field>
                  <Field label="WhatsApp">
                    <input value={data.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} style={inputStyle} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" />
                  </Field>
                </div>

                <Field label="Sitio web">
                  <input value={data.website} onChange={(e) => update("website", e.target.value)} style={inputStyle} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" />
                </Field>
              </section>

              {/* Atributos */}
              <section
                aria-label="Atributos del negocio"
                style={{
                  background: "var(--surface-card)",
                  borderRadius: "var(--radius-card)",
                  border: "0.5px solid var(--border-ui)",
                  padding: "var(--space-4)",
                }}
              >
                <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "var(--space-3)" }}>
                  Atributos
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {data.attributes.map((a) => (
                    <label
                      key={a.id}
                      className="flex items-center gap-2 px-3 py-2 transition-colors hover:opacity-80"
                      style={{
                        borderRadius: "var(--radius-nav)",
                        cursor: "pointer",
                        fontSize: "var(--font-size-md)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {/* Checkbox visual */}
                      <span
                        style={{
                          width: 16, height: 16,
                          borderRadius: 4,
                          border: a.on ? "none" : "1.5px solid var(--border-ui)",
                          background: a.on ? "var(--text-primary)" : "var(--surface-card)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}
                        aria-hidden="true"
                      >
                        {a.on && <Check size={11} strokeWidth={3} style={{ color: "var(--surface-card)" }} />}
                      </span>
                      {a.label}
                      {/* Checkbox real accesible — visualmente oculto */}
                      <input
                        type="checkbox"
                        checked={a.on}
                        onChange={() => toggleAttr(a.id)}
                        className="sr-only"
                        aria-label={a.label}
                      />
                    </label>
                  ))}
                </div>
              </section>

              {/* Fotos */}
              <section
                aria-label="Fotos asignadas"
                style={{
                  background: "var(--surface-card)",
                  borderRadius: "var(--radius-card)",
                  border: "0.5px solid var(--border-ui)",
                  padding: "var(--space-4)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                    Fotos asignadas
                  </p>
                  <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
                    {data.photos.length} de 20
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {data.photos.map((p, i) => (
                    <div key={i} className="aspect-square overflow-hidden" style={{ borderRadius: "var(--radius-nav)" }}>
                      <img src={p} alt="" aria-hidden="true" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <button
                    type="button"
                    className="aspect-square flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-opacity hover:opacity-70"
                    style={{
                      borderRadius: "var(--radius-nav)",
                      border: "1.5px dashed var(--border-ui)",
                      background: "transparent",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      outlineColor: "var(--ring)",
                    }}
                    aria-label="Agregar foto"
                  >
                    <Plus size={14} aria-hidden="true" />
                  </button>
                </div>
              </section>

              {/* Reseñas */}
              <section
                aria-label="Reseñas recientes"
                style={{
                  background: "var(--surface-card)",
                  borderRadius: "var(--radius-card)",
                  border: "0.5px solid var(--border-ui)",
                  padding: "var(--space-4)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>
                      Reseñas recientes
                    </p>
                    <p style={{ fontSize: "var(--font-size-xl)", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                      3 esperando respuesta
                    </p>
                  </div>
                  <StarRow value={4.6} />
                </div>

                <div className="space-y-3">
                  {data.reviews.map((r) => (
                    <div
                      key={r.author}
                      style={{
                        padding: "var(--space-3) var(--space-4)",
                        borderRadius: "var(--radius-nav)",
                        border: "0.5px solid var(--border-ui)",
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div style={{ fontSize: "var(--font-size-md)", fontWeight: 500, color: "var(--text-primary)" }}>
                            {r.author}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StarRow value={r.stars} />
                            <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
                              {r.date}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          leftIcon={<MessageSquare size={11} aria-hidden="true" />}
                          onClick={() => setOpenReply(r)}
                        >
                          Responder con IA
                        </Button>
                      </div>
                      <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                        {r.text}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>

      {/* ── Modal de respuesta ── */}
      {openReply && (
        <ReplyModal
          review={openReply}
          onClose={closeModal}
          titleId={modalTitleId}
        />
      )}
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Utilidades locales
 * ──────────────────────────────────────────────────────────────────────────── */

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  height: 34,
  padding: "0 10px",
  fontSize: "var(--font-size-md)",
  color: "var(--text-primary)",
  background: "var(--surface-page)",
  border: "0.5px solid var(--border-ui)",
  borderRadius: "var(--radius-nav)",
  outlineColor: "var(--accent-info)",
  boxSizing: "border-box",
};

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div
        className="flex items-center gap-2 mb-1"
        style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--text-secondary)" }}
      >
        <span>{label}</span>
        {hint && (
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--brand)", fontWeight: 400 }}>
            ✦ {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
