/**
 * ReportsView.tsx — Configuración y preview de reporte mensual SEO/GEO
 * WEB-737 | Rama: sofia/web-737-gestor-redes-sociales
 *
 * Portado desde pxsol-home-mkt-division/src/screens/seoGeo/Reports.jsx.
 * Sin React Router.
 *
 * Accesibilidad carry-over:
 * - Labels explícitos en todos los controles.
 * - SimOverlay con role="status" + aria-live="polite".
 * - Estado programado anunciado via aria-live en el botón (texto cambia).
 * - Botón de upload a 44px mínimo.
 */

import { useId, useRef, useState } from "react";
import {
  Check, CheckCircle2, Clock, Download, FileText,
  Mail, UploadCloud,
} from "lucide-react";
import { Button } from "../ui/button";
import { SimOverlay } from "./_shared";
import { useSeoGeo, useSimulatedAsync } from "./SeoGeoContext";
import { reportPreview, visibilityOverview } from "../../data/seo-geo-demo";

/* ────────────────────────────────────────────────────────────────────────────
 * Frecuencias
 * ──────────────────────────────────────────────────────────────────────────── */

const FREQUENCIES = [
  { id: "monthly" as const, label: "Mensual" },
  { id: "weekly"  as const, label: "Semanal" },
];

/* ────────────────────────────────────────────────────────────────────────────
 * Componente principal
 * ──────────────────────────────────────────────────────────────────────────── */

export function ReportsView() {
  const { reportConfig, scheduleReport, updateReport } = useSeoGeo();
  const { loading, message, run } = useSimulatedAsync();
  const [localEmail, setLocalEmail] = useState(reportConfig.email);
  const [justScheduled, setJustScheduled] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const emailId = useId();
  const freqId = useId();

  const onSchedule = () => {
    run("Programando reporte…", () => {
      scheduleReport({ email: localEmail, frequency: reportConfig.frequency });
      setJustScheduled(true);
      setTimeout(() => setJustScheduled(false), 3000);
    }, { min: 800, max: 1200 });
  };

  const onDownload = () => {
    run("Generando PDF…", undefined, { min: 1000, max: 1600 });
  };

  const inputStyle: React.CSSProperties = {
    display: "block", width: "100%", height: 34,
    padding: "0 10px",
    fontSize: "var(--font-size-md)",
    color: "var(--text-primary)",
    background: "var(--surface-page)",
    border: "0.5px solid var(--border-ui)",
    borderRadius: "var(--radius-nav)",
    outlineColor: "var(--accent-info)",
    boxSizing: "border-box",
  };

  return (
    <div style={{ padding: "var(--space-5)", maxWidth: 1200, margin: "0 auto", position: "relative" }}>
      <SimOverlay active={loading} message={message} />

      {/* Header */}
      <div className="mb-5">
        <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          Reporte de visibilidad
        </p>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", margin: "4px 0 0", lineHeight: 1.5 }}>
          Generá y programá un PDF con el resumen de SEO + GEO para compartir con el equipo o la dirección del hotel.
        </p>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "320px 1fr" }}>
        {/* Panel izq.: configuración */}
        <div className="space-y-4">
          <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", padding: "var(--space-4)" }}>
            <p style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>
              Configurar reporte
            </p>

            {/* Logo */}
            <div className="mb-4">
              <p style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                Logo del hotel (opcional)
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                aria-label="Subir logo del hotel"
                onChange={() => { /* en demo no procesamos */ }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 hover:opacity-80 transition-opacity"
                style={{
                  minHeight: 80,
                  border: "1.5px dashed var(--border-ui)",
                  borderRadius: "var(--radius-nav)",
                  background: "var(--surface-page)",
                  cursor: "pointer",
                  outlineColor: "var(--ring)",
                }}
                aria-label="Subir logo del hotel"
              >
                <UploadCloud size={20} aria-hidden="true" style={{ color: "var(--text-tertiary)" }} />
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
                  {reportConfig.logoUrl ? "Logo cargado" : "Arrastrá o hacé clic para subir"}
                </span>
              </button>
            </div>

            {/* Frecuencia */}
            <div className="mb-4">
              <fieldset>
                <legend
                  id={freqId}
                  style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}
                >
                  Frecuencia
                </legend>
                <div className="flex gap-2">
                  {FREQUENCIES.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={reportConfig.frequency === f.id}
                      onClick={() => updateReport({ frequency: f.id })}
                      style={{
                        flex: 1, padding: "8px 0",
                        fontSize: "var(--font-size-sm)",
                        fontWeight: reportConfig.frequency === f.id ? 600 : 400,
                        borderRadius: "var(--radius-nav)",
                        border: reportConfig.frequency === f.id ? "1.5px solid var(--brand)" : "0.5px solid var(--border-ui)",
                        background: reportConfig.frequency === f.id ? "rgba(232,74,44,0.07)" : "var(--surface-page)",
                        color: reportConfig.frequency === f.id ? "var(--brand)" : "var(--text-secondary)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* Email */}
            <div className="mb-5">
              <label
                htmlFor={emailId}
                style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}
              >
                Email para envío automático
              </label>
              <input
                id={emailId}
                type="email"
                value={localEmail}
                onChange={(e) => setLocalEmail(e.target.value)}
                placeholder="gerencia@hotelazulmarino.com"
                style={inputStyle}
                className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              />
            </div>

            {/* Botones */}
            <div className="space-y-2">
              <Button
                variant="primary"
                onClick={onSchedule}
                disabled={!localEmail.trim() || loading}
                leftIcon={
                  reportConfig.scheduled && justScheduled
                    ? <CheckCircle2 size={13} aria-hidden="true" />
                    : <Clock size={13} aria-hidden="true" />
                }
                style={{ width: "100%" }}
                aria-label={reportConfig.scheduled ? "Actualizar programación del reporte" : "Programar envío automático del reporte"}
              >
                {reportConfig.scheduled && !justScheduled ? "Actualizar programación" : justScheduled ? "¡Programado!" : "Programar envío"}
              </Button>
              <Button
                variant="secondary"
                onClick={onDownload}
                disabled={loading}
                leftIcon={<Download size={13} aria-hidden="true" />}
                style={{ width: "100%" }}
              >
                Descargar PDF ahora
              </Button>
            </div>

            {/* Estado de programación */}
            {reportConfig.scheduled && (
              <div
                aria-live="polite"
                className="flex items-center gap-2 mt-4"
                style={{
                  padding: "8px 10px",
                  borderRadius: "var(--radius-nav)",
                  background: "#dcfce7",
                  fontSize: "var(--font-size-sm)",
                  color: "#15803d",
                }}
              >
                <Check size={13} aria-hidden="true" />
                Envío {reportConfig.frequency === "monthly" ? "mensual" : "semanal"} programado para {reportConfig.email}
              </div>
            )}
          </div>

          {/* Qué incluye */}
          <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", padding: "var(--space-4)" }}>
            <p style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              Qué incluye el reporte
            </p>
            <ul className="space-y-2" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                "Score de visibilidad global, SEO y GEO",
                "Evolución mensual de clics e impresiones",
                "Menciones en ChatGPT, Perplexity y Google AI",
                "Top 5 keywords con mayor tráfico",
                "Páginas orgánicas destacadas",
                "Recomendaciones de la IA para el mes siguiente",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check size={12} aria-hidden="true" style={{ color: "var(--status-active)", marginTop: 3, flexShrink: 0 }} />
                  <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", lineHeight: 1.5 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Panel der.: preview del PDF */}
        <div
          style={{
            background: "var(--surface-card)",
            borderRadius: "var(--radius-card)",
            border: "0.5px solid var(--border-ui)",
            overflow: "hidden",
          }}
        >
          <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "0.5px solid var(--border-ui)", background: "var(--surface-page)" }}>
            <FileText size={16} aria-hidden="true" style={{ color: "var(--text-secondary)" }} />
            <p style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
              Preview del reporte — {reportPreview.period}
            </p>
            <span style={{ marginLeft: "auto", fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)" }}>
              Vista previa · no descargable desde aquí
            </span>
          </div>

          <div className="p-6" style={{ maxHeight: 640, overflowY: "auto" }}>
            {/* Cabecera del PDF */}
            <div className="flex items-center justify-between mb-6 pb-5" style={{ borderBottom: "2px solid var(--brand)" }}>
              <div>
                <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 2px" }}>
                  Reporte de visibilidad digital
                </p>
                <p style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Hotel Azul Marino
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", margin: "0 0 2px" }}>
                  Período
                </p>
                <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  {reportPreview.period}
                </p>
              </div>
            </div>

            {/* Highlights */}
            <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
              Métricas destacadas
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {reportPreview.highlights.map((h) => (
                <div
                  key={h.label}
                  style={{
                    background: "var(--surface-page)",
                    borderRadius: "var(--radius-item)",
                    padding: "var(--space-3) var(--space-3)",
                    border: "0.5px solid var(--border-ui)",
                  }}
                >
                  <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", margin: "0 0 4px", lineHeight: 1.3 }}>
                    {h.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span style={{ fontFamily: "monospace", fontSize: "var(--font-size-xl)", color: "var(--text-primary)" }}>
                      {h.value}
                    </span>
                    <span
                      style={{
                        fontSize: "var(--font-size-xs)",
                        fontWeight: 600,
                        color: h.delta.startsWith("+") ? "var(--status-active)" : "#8B6F1F",
                      }}
                    >
                      {h.delta}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Top contenidos */}
            <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              Contenidos con más tráfico
            </p>
            <div className="space-y-2 mb-6">
              {reportPreview.topContents.map((c, i) => (
                <div
                  key={c.title}
                  className="flex items-center gap-3"
                  style={{ padding: "8px 12px", background: "var(--surface-page)", borderRadius: "var(--radius-nav)", border: "0.5px solid var(--border-ui)" }}
                >
                  <span style={{ fontFamily: "monospace", fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)", minWidth: 16 }}>
                    {i + 1}
                  </span>
                  <span style={{ flex: 1, fontSize: "var(--font-size-sm)", color: "var(--text-primary)" }}>{c.title}</span>
                  <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)" }}>{c.date}</span>
                  <span style={{ fontFamily: "monospace", fontSize: "var(--font-size-sm)", color: "var(--text-primary)", fontWeight: 600 }}>
                    {c.clicks.toLocaleString("es")}
                  </span>
                </div>
              ))}
            </div>

            {/* Recomendaciones */}
            <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              Recomendaciones del mes
            </p>
            <div className="space-y-2 mb-6">
              {reportPreview.recommendations.map((r, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3"
                  style={{ padding: "8px 12px", background: "rgba(232,74,44,0.05)", borderRadius: "var(--radius-nav)", border: "0.5px solid rgba(232,74,44,0.15)" }}
                >
                  <span style={{ fontFamily: "monospace", fontSize: "var(--font-size-xs)", color: "var(--brand)", fontWeight: 700, minWidth: 16 }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-primary)", lineHeight: 1.55 }}>{r}</span>
                </div>
              ))}
            </div>

            {/* Footer del PDF */}
            <div
              className="flex items-center justify-between pt-4"
              style={{ borderTop: "0.5px solid var(--border-ui)" }}
            >
              <div className="flex items-center gap-2">
                <Mail size={12} aria-hidden="true" style={{ color: "var(--text-tertiary)" }} />
                <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)" }}>
                  Enviado a: {reportConfig.email}
                </span>
              </div>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)" }}>
                Generado por PXSOL Web
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
