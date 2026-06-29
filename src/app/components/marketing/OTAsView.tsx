/**
 * OTAsView.tsx — Gestor de OTAs / Booking
 * WEB-737 | Rama: sofia/web-737-gestor-redes-sociales
 *
 * Vista nativa del Builder. Portada y re-estilada desde
 * pxsol-home-mkt-division/src/screens/channels/OTAs.jsx.
 * Adopción total del DS del Builder (tokens, componentes UI, shell).
 *
 * Accesibilidad carry-over:
 * - Tabs como tablist accesible (role/aria/flechas de teclado, WCAG 2.2).
 * - role="progressbar" en barras de completitud.
 * - Labels explícitos en todos los campos de edición.
 * - Chips de amenidad con botón de remoción accesible.
 */

import { useMemo, useRef, useState } from "react";
import {
  Sparkles, AlertCircle, Plus, X,
} from "lucide-react";
import type { View } from "../../types";
import { ViewHeader } from "../ui/view-header";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  otaProfiles,
  otaRooms,
  defaultPolicies,
  otaList,
  type OtaProfile,
  type OtaRoom,
  type OtaPolicies,
} from "../../data/otas-demo";

/* ────────────────────────────────────────────────────────────────────────────
 * Props
 * ──────────────────────────────────────────────────────────────────────────── */

interface Props {
  siteName: string;
  navigate: (view: View, siteId?: number) => void;
}

/* ────────────────────────────────────────────────────────────────────────────
 * ScoreBar — barra de progreso accesible con role="progressbar"
 * ──────────────────────────────────────────────────────────────────────────── */

function ScoreBar({
  value,
  tone = "brand",
}: {
  value: number;
  tone?: "brand" | "positive" | "warning";
}) {
  const colors = {
    brand:    "var(--brand)",
    positive: "var(--status-active)",
    warning:  "var(--status-warning)",
  };
  return (
    <div
      style={{
        height: 6,
        borderRadius: 99,
        background: "var(--border-ui)",
        overflow: "hidden",
      }}
    >
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${value}% completo`}
        style={{
          height: "100%",
          width: `${value}%`,
          background: colors[tone],
          borderRadius: 99,
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * AmenityChip — chip de amenidad con botón de remoción
 * ──────────────────────────────────────────────────────────────────────────── */

function AmenityChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1"
      style={{
        background: "var(--surface-page)",
        border: "0.5px solid var(--border-ui)",
        borderRadius: 99,
        padding: "3px 10px",
        fontSize: "var(--font-size-sm)",
        color: "var(--text-secondary)",
      }}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 transition-opacity hover:opacity-70"
        style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center", outlineColor: "var(--ring)" }}
        aria-label={`Quitar ${label}`}
      >
        <X size={10} aria-hidden="true" />
      </button>
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Componente principal
 * ──────────────────────────────────────────────────────────────────────────── */

export function OTAsView({ siteName, navigate }: Props) {
  const [activeOta, setActiveOta] = useState<string>(otaList[0]);
  const [otaData, setOtaData] = useState<Record<string, OtaProfile>>(otaProfiles);
  const [rooms, setRooms] = useState<OtaRoom[]>(otaRooms);
  const [policies, setPolicies] = useState<OtaPolicies>(defaultPolicies);
  const tablistRef = useRef<HTMLDivElement>(null);

  const ota = otaData[activeOta];

  const updateOtaDesc = (text: string) =>
    setOtaData((d) => ({
      ...d,
      [activeOta]: { ...d[activeOta], description: text },
    }));

  const removeAmenity = (roomIdx: number, amenity: string) =>
    setRooms((rs) =>
      rs.map((r, i) =>
        i === roomIdx
          ? { ...r, amenities: r.amenities.filter((a) => a !== amenity) }
          : r,
      ),
    );

  // Navegación por flechas en el tablist (WCAG 2.2)
  function handleTabKey(e: React.KeyboardEvent<HTMLButtonElement>, idx: number) {
    const tabs = tablistRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    if (!tabs) return;
    if (e.key === "ArrowRight") { e.preventDefault(); tabs[(idx + 1) % tabs.length].focus(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); tabs[(idx - 1 + tabs.length) % tabs.length].focus(); }
    else if (e.key === "Home") { e.preventDefault(); tabs[0].focus(); }
    else if (e.key === "End") { e.preventDefault(); tabs[tabs.length - 1].focus(); }
  }

  const scoreTone = useMemo(
    () => (ota.completeness > 85 ? "positive" as const : "warning" as const),
    [ota.completeness],
  );

  return (
    <main
      className="flex-1 overflow-y-auto"
      style={{ background: "var(--surface-page)" }}
      aria-label="Gestor de OTAs"
    >
      <div style={{ padding: "var(--space-5)", maxWidth: 1200, margin: "0 auto" }}>

        {/* ── ViewHeader ── */}
        <ViewHeader
          eyebrow={`${siteName} · Marketing`}
          title="OTAs / Booking"
          description="Cada OTA tiene su lenguaje. Descripción, fotos y políticas optimizadas para cada plataforma desde un solo lugar."
          navigate={navigate}
          action={
            <Button variant="primary" leftIcon={<Sparkles size={13} aria-hidden="true" />}>
              Sincronizar cambios
            </Button>
          }
        />

        {/* ── Tabs de OTA ── */}
        <div
          style={{ borderBottom: "0.5px solid var(--border-ui)", marginBottom: "var(--space-5)" }}
        >
          <div ref={tablistRef} role="tablist" aria-label="Plataformas OTA" className="flex items-center">
            {otaList.map((name, idx) => {
              const active = name === activeOta;
              return (
                <button
                  key={name}
                  role="tab"
                  id={`ota-tab-${name}`}
                  aria-selected={active}
                  aria-controls={`ota-panel-${name}`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => setActiveOta(name)}
                  onKeyDown={(e) => handleTabKey(e, idx)}
                  className="relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors"
                  style={{
                    height: 44,
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
                  {name}
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
        </div>

        {/* ── Contenido del tab activo ── */}
        {otaList.map((name) => (
          <div
            key={name}
            role="tabpanel"
            id={`ota-panel-${name}`}
            aria-labelledby={`ota-tab-${name}`}
            hidden={name !== activeOta}
          >
            {name === activeOta && (
              <div
                className="grid gap-6"
                style={{ gridTemplateColumns: "1.4fr 1fr", alignItems: "start" }}
              >
                {/* ── Columna izquierda ── */}
                <div className="space-y-4">

                  {/* Descripción */}
                  <section
                    aria-label="Descripción generada"
                    style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", padding: "var(--space-4)" }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                        Descripción generada
                      </p>
                      <Badge tone="neutral">{ota.badge}</Badge>
                    </div>
                    <textarea
                      value={ota.description}
                      onChange={(e) => updateOtaDesc(e.target.value)}
                      rows={6}
                      aria-label="Descripción de la propiedad en esta OTA"
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "8px 10px",
                        fontSize: "var(--font-size-md)",
                        color: "var(--text-primary)",
                        background: "var(--surface-page)",
                        border: "0.5px solid var(--border-ui)",
                        borderRadius: "var(--radius-nav)",
                        outlineColor: "var(--accent-info)",
                        resize: "vertical",
                        boxSizing: "border-box",
                        lineHeight: 1.5,
                      }}
                      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)" }}>
                        {ota.description.length} caracteres
                      </span>
                      <button
                        type="button"
                        className="flex items-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 transition-opacity hover:opacity-70"
                        style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", background: "transparent", border: "none", cursor: "pointer", outlineColor: "var(--ring)" }}
                      >
                        <Sparkles size={11} aria-hidden="true" /> Regenerar con IA
                      </button>
                    </div>
                  </section>

                  {/* Habitaciones */}
                  <section
                    aria-label="Tipos de habitación"
                    style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", padding: "var(--space-4)" }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>
                          Tipos de habitación
                        </p>
                        <p style={{ fontSize: "var(--font-size-xl)", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                          3 categorías publicadas
                        </p>
                      </div>
                      <Button variant="secondary" leftIcon={<Plus size={11} aria-hidden="true" />}>
                        Agregar tipo
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {rooms.map((r, roomIdx) => (
                        <article
                          key={r.name}
                          style={{
                            border: "0.5px solid var(--border-ui)",
                            borderRadius: "var(--radius-nav)",
                            overflow: "hidden",
                            display: "flex",
                          }}
                        >
                          <div style={{ width: 120, flexShrink: 0 }}>
                            <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
                          </div>
                          <div style={{ flex: 1, padding: "var(--space-3)" }}>
                            <div className="flex items-start justify-between mb-1">
                              <div style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)" }}>
                                {r.name}
                              </div>
                              <div className="flex items-baseline gap-1">
                                <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)" }}>desde</span>
                                <span style={{ fontFamily: "monospace", fontSize: "var(--font-size-md)", color: "var(--text-primary)", fontWeight: 600 }}>
                                  USD {r.price}
                                </span>
                              </div>
                            </div>
                            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 8 }}>
                              {r.description}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {r.amenities.map((a) => (
                                <AmenityChip
                                  key={a}
                                  label={a}
                                  onRemove={() => removeAmenity(roomIdx, a)}
                                />
                              ))}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>

                  {/* Políticas */}
                  <section
                    aria-label="Políticas de la propiedad"
                    style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", padding: "var(--space-4)" }}
                  >
                    <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "var(--space-4)" }}>
                      Políticas
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <PolicyField label="Cancelación">
                        <select
                          value={policies.cancellation}
                          onChange={(e) => setPolicies((p) => ({ ...p, cancellation: e.target.value }))}
                          aria-label="Política de cancelación"
                          style={selectStyle}
                          className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                          <option>Flexible</option>
                          <option>Moderada</option>
                          <option>Estricta</option>
                        </select>
                      </PolicyField>

                      <div className="grid grid-cols-2 gap-2">
                        <PolicyField label="Check-in">
                          <input type="time" value={policies.checkin} onChange={(e) => setPolicies((p) => ({ ...p, checkin: e.target.value }))} aria-label="Hora de check-in" style={inputStyle} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" />
                        </PolicyField>
                        <PolicyField label="Check-out">
                          <input type="time" value={policies.checkout} onChange={(e) => setPolicies((p) => ({ ...p, checkout: e.target.value }))} aria-label="Hora de check-out" style={inputStyle} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" />
                        </PolicyField>
                      </div>

                      <PolicyField label="Mascotas">
                        <input value={policies.pets} onChange={(e) => setPolicies((p) => ({ ...p, pets: e.target.value }))} aria-label="Política de mascotas" style={inputStyle} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" />
                      </PolicyField>

                      <PolicyField label="Fumadores">
                        <input value={policies.smoking} onChange={(e) => setPolicies((p) => ({ ...p, smoking: e.target.value }))} aria-label="Política de fumadores" style={inputStyle} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" />
                      </PolicyField>
                    </div>
                  </section>
                </div>

                {/* ── Sidebar: completitud ── */}
                <aside className="space-y-4 sticky top-4" aria-label="Estado de completitud del perfil">

                  {/* Score */}
                  <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", padding: "var(--space-4)" }}>
                    <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                      Score de completitud
                    </p>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span style={{ fontFamily: "monospace", fontSize: 36, color: "var(--text-primary)", lineHeight: 1 }}>
                        {ota.completeness}
                      </span>
                      <span style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)" }}>% completo</span>
                    </div>
                    <ScoreBar value={ota.completeness} tone={scoreTone} />
                    <div style={{ marginTop: 8, fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
                      Perfil <strong style={{ color: "var(--text-primary)" }}>{activeOta}</strong>
                    </div>
                  </div>

                  {/* Falta completar */}
                  <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", padding: "var(--space-4)" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle size={14} aria-hidden="true" style={{ color: "var(--text-secondary)" }} />
                      <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Falta completar
                      </span>
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: "0 0 12px" }} className="space-y-2">
                      {ota.missing.map((m) => (
                        <li key={m} className="flex items-start gap-2" style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)" }}>
                          <span aria-hidden="true" style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--text-tertiary)", flexShrink: 0, marginTop: 7 }} />
                          {m}
                        </li>
                      ))}
                    </ul>
                    <Button variant="secondary" style={{ width: "100%" }}>
                      Completar pendientes
                    </Button>
                  </div>

                  {/* Performance estimada */}
                  <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", padding: "var(--space-4)" }}>
                    <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "var(--space-3)" }}>
                      Performance estimada
                    </p>
                    <div className="space-y-3">
                      {[
                        { label: "Visibilidad",  value: "+34%", pct: 68 },
                        { label: "CTR",          value: "+22%", pct: 55 },
                        { label: "Conversión",   value: "+12%", pct: 42 },
                      ].map((m) => (
                        <div key={m.label}>
                          <div className="flex items-baseline justify-between mb-1">
                            <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>{m.label}</span>
                            <span style={{ fontFamily: "monospace", fontSize: "var(--font-size-sm)", color: "var(--text-primary)", fontWeight: 600 }}>{m.value}</span>
                          </div>
                          <ScoreBar value={m.pct} tone="brand" />
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)", marginTop: 10 }}>
                      vs benchmark de hoteles boutique en LATAM
                    </p>
                  </div>
                </aside>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
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

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "auto",
  cursor: "pointer",
};

function PolicyField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
        {label}
      </p>
      {children}
    </div>
  );
}
