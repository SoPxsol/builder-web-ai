/**
 * EmailMarketingView.tsx — Gestor de Email Marketing
 * WEB-737 | Rama: sofia/web-737-gestor-redes-sociales
 *
 * Vista nativa del Builder. Portada y re-estilada desde
 * pxsol-home-mkt-division/src/screens/channels/EmailMarketing.jsx.
 * Adopción total del DS del Builder (tokens, componentes UI, shell).
 *
 * NOTA: el preview de email replica el aspecto de un cliente de correo.
 * Los colores del cuerpo del email (primary: #1A3C5E, accent: #D4A853)
 * son colores de marca del hotel demo — NO tokens del DS del Builder.
 * Se mantienen igual que cualquier color de plataforma externa.
 *
 * Accesibilidad carry-over:
 * - Tabs de campaña como tablist accesible (role/aria/flechas de teclado).
 * - aria-current en ítem activo de la lista de campañas.
 * - Badges con tone según status semántico.
 */

import { useRef, useState } from "react";
import { Pencil, Copy, Download, Mail, ChevronRight } from "lucide-react";
import type { View } from "../../types";
import { ViewHeader } from "../ui/view-header";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  emailCampaigns,
  emailMetrics,
  hotelEmailBrand,
  type EmailCampaign,
  type CampaignStatus,
} from "../../data/email-demo";
import { hotelImages } from "../../data/social-demo";

/* ────────────────────────────────────────────────────────────────────────────
 * Props
 * ──────────────────────────────────────────────────────────────────────────── */

interface Props {
  siteName: string;
  navigate: (view: View, siteId?: number) => void;
}

/* ────────────────────────────────────────────────────────────────────────────
 * StatusBadge — tone semántico por estado de campaña
 * ──────────────────────────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: CampaignStatus }) {
  const tone =
    status === "Listo"   ? "positive" as const :
    status === "Enviado" ? "neutral"  as const :
    "warning" as const; // Borrador
  return <Badge tone={tone}>{status}</Badge>;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Componente principal
 * ──────────────────────────────────────────────────────────────────────────── */

export function EmailMarketingView({ siteName, navigate }: Props) {
  const [selected, setSelected] = useState<string>(emailCampaigns[0].id);
  const listRef = useRef<HTMLElement>(null);
  const campaign = emailCampaigns.find((c) => c.id === selected) as EmailCampaign;

  // Colores de marca del hotel para el preview de email (son de la marca del hotel, no del DS)
  const primary = hotelEmailBrand.primary;
  const accent  = hotelEmailBrand.accent;

  return (
    <main
      className="flex-1 overflow-y-auto"
      style={{ background: "var(--surface-page)" }}
      aria-label="Gestor de Email Marketing"
    >
      <div style={{ padding: "var(--space-5)", maxWidth: 1200, margin: "0 auto" }}>

        {/* ── ViewHeader ── */}
        <ViewHeader
          eyebrow={`${siteName} · Marketing`}
          title="Email Marketing"
          description="Cuatro campañas pre-armadas con tu tono y tu marca. Conectá tu lista y empezá a enviar."
          navigate={navigate}
          action={
            <Button variant="primary" leftIcon={<Mail size={13} aria-hidden="true" />}>
              Conectar lista
            </Button>
          }
        />

        {/*
         * Columna de lista: antes era "320px" fijo — en el Builder (~900px de contenido)
         * dejaba el preview demasiado estrecho. Ahora usa minmax para que en pantallas
         * angostas las columnas pasen a una sola fila.
         */}
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            alignItems: "start",
          }}
        >
          {/* ── Lista de campañas ── */}
          <aside
            ref={listRef}
            aria-label="Lista de campañas"
            style={{
              background: "var(--surface-card)",
              borderRadius: "var(--radius-card)",
              border: "0.5px solid var(--border-ui)",
              padding: "var(--space-2)",
              position: "sticky",
              top: 16,
            }}
          >
            <p
              style={{
                fontSize: "var(--font-size-xs)",
                fontWeight: 600,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "8px 12px 6px",
                margin: 0,
              }}
            >
              Campañas
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: 0 }} role="tablist" aria-label="Campañas de email">
              {emailCampaigns.map((c) => {
                const active = c.id === selected;
                return (
                  <li key={c.id} role="presentation">
                    <button
                      type="button"
                      role="tab"
                      id={`email-tab-${c.id}`}
                      aria-selected={active}
                      aria-controls={`email-panel-${c.id}`}
                      tabIndex={active ? 0 : -1}
                      onClick={() => setSelected(c.id)}
                      className="w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors"
                      style={{
                        padding: "10px 12px",
                        borderRadius: "var(--radius-nav)",
                        background: active ? "var(--surface-page)" : "transparent",
                        border: active ? "0.5px solid var(--border-ui)" : "0.5px solid transparent",
                        cursor: "pointer",
                        outlineColor: "var(--ring)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span style={{ fontSize: "var(--font-size-md)", fontWeight: 500, color: "var(--text-primary)" }}>
                          {c.name}
                        </span>
                        <ChevronRight
                          size={14}
                          aria-hidden="true"
                          style={{
                            flexShrink: 0,
                            marginTop: 2,
                            color: active ? "var(--brand)" : "var(--text-tertiary)",
                            transform: active ? "translateX(1px)" : "none",
                          }}
                        />
                      </div>
                      <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", marginBottom: 6 }}>
                        {c.detail}
                      </div>
                      <StatusBadge status={c.status} />
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Métricas */}
            <div style={{ borderTop: "0.5px solid var(--border-ui)", marginTop: 8, padding: "10px 12px 6px" }}>
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", marginBottom: 8 }}>
                Métricas estimadas
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {emailMetrics.map((m) => (
                  <div
                    key={m.k}
                    style={{
                      background: "var(--surface-page)",
                      borderRadius: "var(--radius-nav)",
                      padding: "8px 4px",
                    }}
                  >
                    <div style={{ fontFamily: "monospace", fontSize: "var(--font-size-md)", color: "var(--text-primary)", fontWeight: 600 }}>
                      {m.v}
                    </div>
                    <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {m.k}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Preview de email ── */}
          <div>
            {emailCampaigns.map((c) => (
              <div
                key={c.id}
                role="tabpanel"
                id={`email-panel-${c.id}`}
                aria-labelledby={`email-tab-${c.id}`}
                hidden={c.id !== selected}
              >
                {c.id === selected && (
                  <>
                    {/* Toolbar sobre el preview */}
                    <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "var(--font-size-xl)", fontWeight: 600, color: "var(--text-primary)" }}>
                          {c.name}
                        </div>
                        <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", marginTop: 2 }}>
                          Asunto: <span style={{ color: "var(--text-primary)" }}>{c.subject}</span>
                          <span style={{ margin: "0 8px" }}>·</span>
                          Preheader: {c.preheader}
                        </div>
                      </div>
                      {/* flex-wrap: los botones van a segunda línea si no hay espacio */}
                      <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                        <Button variant="secondary" leftIcon={<Pencil size={11} aria-hidden="true" />}>Editar</Button>
                        <Button variant="secondary" leftIcon={<Copy size={11} aria-hidden="true" />}>Duplicar</Button>
                        <Button variant="secondary" leftIcon={<Download size={11} aria-hidden="true" />}>Exportar HTML</Button>
                      </div>
                    </div>

                    {/* Email preview card */}
                    <article
                      style={{
                        background: "var(--surface-card)",
                        borderRadius: "var(--radius-card)",
                        border: "0.5px solid var(--border-ui)",
                        overflow: "hidden",
                      }}
                      aria-label={`Preview del email: ${c.name}`}
                    >
                      {/* Cliente de correo — topbar */}
                      <div
                        className="flex items-center gap-3 px-5 py-3"
                        style={{ borderBottom: "0.5px solid var(--border-ui)", background: "var(--surface-page)" }}
                      >
                        <div
                          style={{
                            width: 28, height: 28,
                            borderRadius: "50%",
                            background: "var(--border-ui)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "var(--font-size-xs)",
                            fontWeight: 500,
                            color: "var(--text-secondary)",
                          }}
                          aria-hidden="true"
                        >
                          HM
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-primary)", fontWeight: 500 }}>
                            {hotelEmailBrand.hotelName}{" "}
                            <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
                              &lt;{hotelEmailBrand.hotelEmail}&gt;
                            </span>
                          </div>
                          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)" }}>
                            {c.preheader}
                          </div>
                        </div>
                        <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", fontFamily: "monospace" }}>
                          11:42
                        </div>
                      </div>

                      {/* Cuerpo del email — usa colores de marca del hotel, no tokens del DS */}
                      <div style={{ background: "#FBFAF6" }}>
                        {/* Header de marca del hotel */}
                        <div
                          style={{ padding: "28px 0", textAlign: "center", background: primary }}
                          aria-hidden="true"
                        >
                          <div style={{ fontSize: 22, letterSpacing: "0.06em", color: "#fff", fontWeight: 600 }}>
                            {hotelEmailBrand.hotelName.toUpperCase()}
                          </div>
                          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.25em", color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
                            {hotelEmailBrand.hotelCity} · {hotelEmailBrand.hotelCountry}
                          </div>
                        </div>

                        {/* Imagen hero */}
                        <img
                          src={hotelImages.hero}
                          alt=""
                          aria-hidden="true"
                          style={{ width: "100%", height: 240, objectFit: "cover", display: "block" }}
                        />

                        {/* Contenido */}
                        <div style={{ padding: "32px", maxWidth: 560, margin: "0 auto" }}>
                          <h2 style={{ fontSize: 24, color: primary, lineHeight: 1.2, marginBottom: 16, fontWeight: 600 }}>
                            {c.subject}
                          </h2>
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {c.body.map((p, i) => (
                              <p key={i} style={{ fontSize: 14, lineHeight: 1.6, color: "#3a3a3a", margin: 0 }}>
                                {p}
                              </p>
                            ))}
                          </div>
                          <div style={{ marginTop: 28, textAlign: "center" }}>
                            <button
                              type="button"
                              style={{
                                padding: "14px 28px",
                                fontSize: 12,
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                color: "white",
                                background: primary,
                                border: "none",
                                borderRadius: 2,
                                cursor: "pointer",
                              }}
                              aria-label={c.cta}
                            >
                              {c.cta} →
                            </button>
                          </div>
                          <div
                            style={{
                              marginTop: 40,
                              paddingTop: 24,
                              borderTop: "1px solid #E5DDC9",
                              textAlign: "center",
                              fontSize: 10,
                              textTransform: "uppercase",
                              letterSpacing: "0.2em",
                              color: "#9a8e72",
                            }}
                          >
                            {hotelEmailBrand.hotelName} · {hotelEmailBrand.hotelAddress}
                          </div>
                          <div style={{ textAlign: "center", fontSize: 10, color: "#9a8e72", marginTop: 8 }}>
                            Si no querés recibir más estos correos,{" "}
                            <span style={{ color: accent }}>cancelá tu suscripción</span>.
                          </div>
                        </div>
                      </div>
                    </article>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
