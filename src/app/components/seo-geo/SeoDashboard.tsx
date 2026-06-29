/**
 * SeoDashboard.tsx — Dashboard de visibilidad SEO/GEO
 * WEB-737 | Rama: sofia/web-737-gestor-redes-sociales
 *
 * Portado desde pxsol-home-mkt-division/src/screens/seoGeo/Dashboard.jsx.
 * Adaptado al DS del Builder: tokens, ViewHeader, Badge, Button.
 * Sin React Router — navegación interna vía prop onSubNav (subnav id string).
 *
 * Accesibilidad carry-over:
 * - Delta con aria-label descriptivo.
 * - KpiCards y QuickLinks como buttons en lugar de <Link> (no hay router).
 * - Alertas con lista semántica.
 */

import { useState } from "react";
import {
  TrendingUp, TrendingDown, ArrowUpRight,
  Bot, Hash, FileText, AlertTriangle, Sparkles, Bell,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { LineChart, Delta, ScoreBar } from "./_shared";
import {
  visibilityOverview,
  type VisibilityAlert,
} from "../../data/seo-geo-demo";

/* ────────────────────────────────────────────────────────────────────────────
 * Props
 * ──────────────────────────────────────────────────────────────────────────── */

interface Props {
  onSubNav: (id: string) => void;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────────────────────── */

const rangeOptions = [
  { id: "30d", label: "30 días" },
  { id: "90d", label: "90 días" },
];

function alertIcon(type: VisibilityAlert["type"]) {
  if (type === "ai_mention") return <Bot size={14} aria-hidden="true" />;
  if (type === "new_keyword") return <Hash size={14} aria-hidden="true" />;
  if (type === "drop") return <AlertTriangle size={14} aria-hidden="true" />;
  return <Bell size={14} aria-hidden="true" />;
}

const ALERT_TONE: Record<string, { bg: string; color: string }> = {
  // Tokens del DS en lugar de hex hardcodeados
  green:  { bg: "var(--badge-green-bg)",    color: "var(--badge-green-text)"  },
  cool:   { bg: "var(--badge-blue-bg)",     color: "var(--badge-blue-text)"   },
  brand:  { bg: "var(--surface-page)",      color: "var(--brand)"             },
  amber:  { bg: "var(--badge-orange-bg)",   color: "var(--badge-orange-text)" },
};

/* ────────────────────────────────────────────────────────────────────────────
 * Sub-componentes
 * ──────────────────────────────────────────────────────────────────────────── */

function KpiCard({
  label, value, deltaLabel, deltaTone, icon: Icon, accentBg, accentColor, onClick,
}: {
  label: string;
  value: number | string;
  deltaLabel: string;
  deltaTone: "positive" | "warning";
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  accentBg: string;
  accentColor: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left w-full transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        background: "var(--surface-card)",
        borderRadius: "var(--radius-card)",
        border: "0.5px solid var(--border-ui)",
        padding: "var(--space-4) var(--space-4)",
        cursor: "pointer",
        outlineColor: "var(--ring)",
      }}
      aria-label={`${label}: ${value}. ${deltaLabel}. Ver detalle`}
    >
      <div className="flex items-start justify-between mb-3">
        <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
          {label}
        </p>
        <span
          style={{
            width: 32, height: 32,
            borderRadius: "var(--radius-nav)",
            background: accentBg,
            color: accentColor,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={15} aria-hidden={true} />
        </span>
      </div>
      <div style={{ fontFamily: "monospace", fontSize: 34, color: "var(--text-primary)", lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: "var(--font-size-sm)", color: deltaTone === "positive" ? "var(--status-active)" : "#8B6F1F" }}>
        {deltaLabel}
      </div>
    </button>
  );
}

function QuickLink({ title, desc, onClick }: { title: string; desc: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left w-full transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        background: "var(--surface-card)",
        borderRadius: "var(--radius-card)",
        border: "0.5px solid var(--border-ui)",
        padding: "var(--space-4)",
        cursor: "pointer",
        outlineColor: "var(--ring)",
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)" }}>
          {title}
        </span>
        <ArrowUpRight size={14} aria-hidden="true" style={{ color: "var(--text-secondary)" }} />
      </div>
      <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
        {desc}
      </p>
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Componente principal
 * ──────────────────────────────────────────────────────────────────────────── */

export function SeoDashboard({ onSubNav }: Props) {
  const [range, setRange] = useState<"30d" | "90d">("30d");
  const series = range === "30d" ? visibilityOverview.series30d : visibilityOverview.series90d;

  return (
    <div style={{ padding: "var(--space-5)", maxWidth: 1200, margin: "0 auto" }}>

      {/* ── Score global + chart ── */}
      <div
        className="grid gap-6 mb-6"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          alignItems: "start",
        }}
      >
        {/* Score global */}
        <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", padding: "var(--space-4)" }}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Score global de visibilidad
              </p>
              <div className="flex items-baseline gap-3">
                <span style={{ fontFamily: "monospace", fontSize: 56, color: "var(--text-primary)", lineHeight: 1 }}>
                  {visibilityOverview.globalScore}
                </span>
                <span style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)" }}>/ 100</span>
                <Delta value={visibilityOverview.delta.global} />
              </div>
            </div>
            <Badge tone="success">en mejora</Badge>
          </div>

          <div className="grid grid-cols-2 gap-5 pt-5" style={{ borderTop: "0.5px solid var(--border-ui)" }}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>SEO orgánico</span>
                <div className="flex items-baseline gap-2">
                  <span style={{ fontFamily: "monospace", fontSize: 20, color: "var(--text-primary)" }}>
                    {visibilityOverview.seoScore}
                  </span>
                  <Delta value={visibilityOverview.delta.seo} />
                </div>
              </div>
              <ScoreBar value={visibilityOverview.seoScore} tone="brand" label="Score SEO orgánico" />
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)", marginTop: 6 }}>Google · Bing · Yandex</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>GEO (IA)</span>
                <div className="flex items-baseline gap-2">
                  <span style={{ fontFamily: "monospace", fontSize: 20, color: "var(--text-primary)" }}>
                    {visibilityOverview.geoScore}
                  </span>
                  <Delta value={visibilityOverview.delta.geo} />
                </div>
              </div>
              <ScoreBar value={visibilityOverview.geoScore} tone="cool" label="Score GEO (motores de IA)" />
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)", marginTop: 6 }}>ChatGPT · Perplexity · Google AI</p>
            </div>
          </div>
        </div>

        {/* Chart SEO vs GEO */}
        <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", padding: "var(--space-4)" }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                Evolución
              </p>
              <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                SEO vs GEO
              </p>
            </div>
            {/* Selector de rango */}
            <div
              className="inline-flex"
              style={{ background: "var(--surface-page)", borderRadius: "var(--radius-nav)", padding: 2 }}
              role="group"
              aria-label="Rango de tiempo"
            >
              {rangeOptions.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRange(r.id as "30d" | "90d")}
                  aria-pressed={range === r.id}
                  style={{
                    padding: "0 10px",
                    height: 28,
                    fontSize: "var(--font-size-sm)",
                    borderRadius: "var(--radius-nav)",
                    border: "none",
                    cursor: "pointer",
                    background: range === r.id ? "var(--surface-card)" : "transparent",
                    color: range === r.id ? "var(--text-primary)" : "var(--text-secondary)",
                    fontWeight: range === r.id ? 500 : 400,
                    boxShadow: range === r.id ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                    transition: "all 0.15s",
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <LineChart series={series} height={160} />
          <div className="flex items-center gap-4 mt-2" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
            <span className="inline-flex items-center gap-1.5">
              <span style={{ width: 10, height: 2, background: "var(--brand)", borderRadius: 99, display: "inline-block" }} /> SEO
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span style={{ width: 10, height: 2, background: "var(--geo-cool)", borderRadius: 99, display: "inline-block" }} /> GEO
            </span>
          </div>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))" }}>
        <KpiCard
          label="Menciones en IA esta semana"
          value={visibilityOverview.kpis.aiMentionsThisWeek}
          deltaLabel="+4 vs. semana pasada"
          deltaTone="positive"
          icon={Bot}
          accentBg="var(--badge-blue-bg)"
          accentColor="var(--badge-blue-text)"
          onClick={() => onSubNav("geo-tracker")}
        />
        <KpiCard
          label="Posición promedio en Google"
          value={visibilityOverview.kpis.avgGooglePosition}
          deltaLabel="-1.2 puestos (mejora)"
          deltaTone="positive"
          icon={TrendingUp}
          accentBg="var(--surface-page)"
          accentColor="var(--brand)"
          onClick={() => onSubNav("seo-analytics")}
        />
        <KpiCard
          label="Páginas indexadas"
          value={visibilityOverview.kpis.indexedPages}
          deltaLabel="+2 esta semana"
          deltaTone="positive"
          icon={FileText}
          accentBg="var(--badge-green-bg)"
          accentColor="var(--badge-green-text)"
          onClick={() => onSubNav("seo-analytics")}
        />
      </div>

      {/* ── Alertas automáticas ── */}
      <div
        style={{
          background: "var(--surface-card)",
          borderRadius: "var(--radius-card)",
          border: "0.5px solid var(--border-ui)",
          overflow: "hidden",
          marginBottom: "var(--space-5)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "0.5px solid var(--border-ui)" }}
        >
          <div>
            <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px" }}>
              Alertas automáticas
            </p>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", margin: 0 }}>
              Lo que cambió en tu visibilidad — hacé clic para ver el detalle.
            </p>
          </div>
          <Badge tone="neutral">
            <Sparkles size={11} aria-hidden="true" /> Generadas por IA
          </Badge>
        </div>
        <ul role="list">
          {visibilityOverview.alerts.map((a) => {
            const tc = ALERT_TONE[a.tone] || ALERT_TONE.amber;
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => onSubNav(a.link)}
                  className="w-full text-left transition-colors hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "14px 20px",
                    borderBottom: "0.5px solid var(--border-ui)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    borderBottomWidth: 0.5,
                    borderBottomStyle: "solid",
                    borderBottomColor: "var(--border-ui)",
                    outlineColor: "var(--ring)",
                  }}
                >
                  <span
                    style={{
                      width: 28, height: 28, borderRadius: "var(--radius-nav)",
                      background: tc.bg, color: tc.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 2,
                    }}
                  >
                    {alertIcon(a.type)}
                  </span>
                  <div className="flex-1">
                    <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-primary)", margin: "0 0 2px" }}>
                      {a.text}
                    </p>
                    <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", margin: 0 }}>
                      {a.time}
                    </p>
                  </div>
                  <ArrowUpRight size={14} aria-hidden="true" style={{ color: "var(--text-secondary)", marginTop: 4 }} />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Quick links ── */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))" }}>
        <QuickLink
          title="GEO Tracker"
          desc="Dónde y cómo aparece tu hotel en motores de IA."
          onClick={() => onSubNav("geo-tracker")}
        />
        <QuickLink
          title="Generador de contenido"
          desc="Borradores SEO/GEO con tu tono, listos para publicar."
          onClick={() => onSubNav("generador")}
        />
        <QuickLink
          title="Reporte del mes"
          desc="PDF para vos o tu agencia — exportable y programable."
          onClick={() => onSubNav("reportes")}
        />
      </div>
    </div>
  );
}
