/**
 * SeoAnalyticsView.tsx — SEO Analytics (datos de Google Search Console)
 * WEB-737 | Rama: sofia/web-737-gestor-redes-sociales
 *
 * Portado desde pxsol-home-mkt-division/src/screens/seoGeo/SeoAnalytics.jsx.
 * Sin React Router. Ordenamiento local por columna.
 *
 * Accesibilidad carry-over:
 * - Encabezados de tabla como <th scope="col"> con aria-sort.
 * - role="progressbar" en ScoreBar.
 * - Delta con aria-label descriptivo.
 */

import { useState } from "react";
import {
  ArrowDown, ArrowUp, ArrowUpDown, ExternalLink,
  TrendingUp, Zap,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Delta, MiniSpark, TrendArrow } from "./_shared";
import {
  gscSummary, keywords, organicPages,
  type Keyword,
} from "../../data/seo-geo-demo";

/* ────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────────────────────── */

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

type SortCol = "term" | "impressions" | "clicks" | "ctr" | "position";
type SortDir = "asc" | "desc";

function sortedKeywords(list: Keyword[], col: SortCol, dir: SortDir): Keyword[] {
  return [...list].sort((a, b) => {
    let av: string | number = a[col];
    let bv: string | number = b[col];
    if (col === "position") { av = -av as number; bv = -bv as number; } // menor posición = mejor
    if (dir === "asc") return av < bv ? -1 : av > bv ? 1 : 0;
    return av > bv ? -1 : av < bv ? 1 : 0;
  });
}

/* ────────────────────────────────────────────────────────────────────────────
 * KPI card
 * ──────────────────────────────────────────────────────────────────────────── */

function KpiCard({
  label, value, delta, suffix = "", note,
}: { label: string; value: string | number; delta: number; suffix?: string; note?: string }) {
  const isPositive = (delta > 0 && suffix !== "pos") || (delta < 0 && suffix === "pos");
  return (
    <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", padding: "var(--space-4)" }}>
      <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>
        {label}
      </p>
      <p style={{ fontFamily: "monospace", fontSize: 28, color: "var(--text-primary)", lineHeight: 1, margin: "0 0 8px" }}>
        {value}
      </p>
      <span
        className="inline-flex items-center gap-0.5"
        style={{
          fontSize: "var(--font-size-sm)", fontWeight: 500,
          color: isPositive ? "var(--status-active)" : "#8B6F1F",
        }}
        aria-label={`Variación: ${delta > 0 ? "+" : ""}${delta}${suffix}`}
      >
        {delta > 0
          ? <TrendingUp size={11} aria-hidden="true" />
          : <ArrowDown size={11} aria-hidden="true" />
        }
        {delta > 0 ? "+" : ""}{delta}{suffix}
      </span>
      {note && <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)", margin: "6px 0 0" }}>{note}</p>}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Componente principal
 * ──────────────────────────────────────────────────────────────────────────── */

export function SeoAnalyticsView() {
  const [col, setCol] = useState<SortCol>("clicks");
  const [dir, setDir] = useState<SortDir>("desc");
  const [showOpportunities, setShowOpportunities] = useState(false);

  const list = sortedKeywords(
    showOpportunities ? keywords.filter((k) => k.isOpportunity) : keywords,
    col,
    dir,
  );

  const toggleSort = (c: SortCol) => {
    if (col === c) { setDir((d) => (d === "asc" ? "desc" : "asc")); }
    else { setCol(c); setDir("desc"); }
  };

  const SortIcon = ({ c }: { c: SortCol }) => {
    if (col !== c) return <ArrowUpDown size={11} aria-hidden="true" style={{ opacity: 0.35 }} />;
    return dir === "desc"
      ? <ArrowDown size={11} aria-hidden="true" style={{ color: "var(--brand)" }} />
      : <ArrowUp size={11} aria-hidden="true" style={{ color: "var(--brand)" }} />;
  };

  const fakeSparkData = [42, 55, 48, 63, 71, 68, 80];

  return (
    <div style={{ padding: "var(--space-5)", maxWidth: 1200, margin: "0 auto" }}>
      {/* Sección header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p style={{ fontSize: "var(--font-size-xl)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            SEO Analytics
          </p>
          <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", margin: "4px 0 0", lineHeight: 1.5 }}>
            Datos reales de Google Search Console. Qué términos te traen visitas, en qué posición rankeás y dónde están las oportunidades.
          </p>
        </div>
        {gscSummary.connected && (
          <div
            className="flex items-center gap-1.5 flex-shrink-0"
            style={{
              padding: "4px 12px", borderRadius: "var(--radius-badge)",
              background: "var(--badge-green-bg)", fontSize: "var(--font-size-xs)",
              fontWeight: 600, color: "var(--badge-green-text)",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--status-active)", flexShrink: 0 }} aria-hidden="true" />
            GSC conectado · {gscSummary.lastSync}
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))" }}>
        <KpiCard
          label="Impresiones"
          value={fmt(gscSummary.impressions)}
          delta={gscSummary.deltas.impressions}
          suffix="%"
          note="últimos 28 días"
        />
        <KpiCard
          label="Clics orgánicos"
          value={fmt(gscSummary.clicks)}
          delta={gscSummary.deltas.clicks}
          suffix="%"
          note="vs. período anterior"
        />
        <KpiCard
          label="CTR"
          value={`${gscSummary.ctr}%`}
          delta={gscSummary.deltas.ctr}
          suffix="%"
        />
        <KpiCard
          label="Posición media"
          value={gscSummary.avgPosition}
          delta={gscSummary.deltas.avgPosition}
          suffix="pos"
          note="menor = mejor"
        />
      </div>

      {/* Sparklines de tendencia */}
      <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
        <div className="flex items-center gap-4">
          <div>
            <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              Clics orgánicos — evolución
            </p>
            <MiniSpark data={fakeSparkData} color="var(--brand)" />
          </div>
          <div>
            <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              Impresiones
            </p>
            <MiniSpark data={[3200, 4100, 3800, 5200, 6100, 5800, 7200]} color="var(--geo-cool)" />
          </div>
          <div className="flex-1" />
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)" }}>
            Últimos 7 días / semana anterior
          </p>
        </div>
      </div>

      {/* Tabla de keywords */}
      <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", overflow: "hidden", marginBottom: "var(--space-4)" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "0.5px solid var(--border-ui)" }}>
          <div>
            <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px" }}>
              Palabras clave
            </p>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", margin: 0 }}>
              {fmt(gscSummary.impressions)} impresiones en {keywords.length} términos activos.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowOpportunities((v) => !v)}
            aria-pressed={showOpportunities}
            className="flex items-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              padding: "0 12px", height: 30,
              fontSize: "var(--font-size-sm)", fontWeight: 500,
              borderRadius: "var(--radius-badge)",
              border: showOpportunities ? "1.5px solid var(--brand)" : "0.5px solid var(--border-ui)",
              background: showOpportunities ? "rgba(232,74,44,0.08)" : "var(--surface-page)",
              color: showOpportunities ? "var(--brand)" : "var(--text-secondary)",
              cursor: "pointer", outlineColor: "var(--ring)",
              transition: "all 0.15s",
            }}
          >
            <Zap size={12} aria-hidden="true" />
            Solo oportunidades
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid var(--border-ui)" }}>
                {[
                  { key: "term",        label: "Término",     align: "left"  },
                  { key: "impressions", label: "Impresiones", align: "right" },
                  { key: "clicks",      label: "Clics",       align: "right" },
                  { key: "ctr",         label: "CTR",         align: "right" },
                  { key: "position",    label: "Posición",    align: "right" },
                  { key: null,          label: "Tendencia",   align: "center"},
                  { key: null,          label: "",            align: "center"},
                ].map((h, i) => (
                  <th
                    key={i}
                    scope="col"
                    aria-sort={col === h.key ? (dir === "asc" ? "ascending" : "descending") : undefined}
                    tabIndex={h.key ? 0 : undefined}
                    style={{
                      padding: "10px 20px",
                      fontSize: "var(--font-size-xs)",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      textAlign: h.align as CanvasTextAlign,
                      whiteSpace: "nowrap",
                      cursor: h.key ? "pointer" : "default",
                      outline: "none",
                    }}
                    onClick={() => h.key && toggleSort(h.key as SortCol)}
                    onKeyDown={(e) => { if (h.key && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); toggleSort(h.key as SortCol); } }}
                  >
                    <span className="inline-flex items-center gap-1">
                      {h.label}
                      {h.key && <SortIcon c={h.key as SortCol} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                /* Estado vacío — sin keywords en el filtro activo */
                <tr>
                  <td colSpan={7} style={{ padding: "var(--space-5)", textAlign: "center" }}>
                    <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", margin: "0 0 4px" }}>
                      No hay oportunidades detectadas todavía.
                    </p>
                    <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-tertiary)", margin: 0 }}>
                      Cuando Google Search Console identifique términos con potencial de mejora, aparecerán aquí.
                    </p>
                  </td>
                </tr>
              ) : (
                list.map((kw) => (
                  <tr
                    key={kw.term}
                    style={{ borderBottom: "0.5px solid var(--border-ui)", transition: "background 0.1s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-page)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 20px", fontSize: "var(--font-size-md)", color: "var(--text-primary)", maxWidth: 280 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={kw.term}>
                        {kw.term}
                      </div>
                    </td>
                    <td style={{ padding: "12px 20px", fontFamily: "monospace", fontSize: "var(--font-size-md)", color: "var(--text-primary)", textAlign: "right" }}>
                      {fmt(kw.impressions)}
                    </td>
                    <td style={{ padding: "12px 20px", fontFamily: "monospace", fontSize: "var(--font-size-md)", color: "var(--text-primary)", textAlign: "right" }}>
                      {fmt(kw.clicks)}
                    </td>
                    <td style={{ padding: "12px 20px", fontFamily: "monospace", fontSize: "var(--font-size-md)", color: "var(--text-primary)", textAlign: "right" }}>
                      {kw.ctr}%
                    </td>
                    <td style={{ padding: "12px 20px", fontFamily: "monospace", fontSize: "var(--font-size-md)", color: "var(--text-primary)", textAlign: "right" }}>
                      #{kw.position}
                    </td>
                    <td style={{ padding: "12px 20px", textAlign: "center" }}>
                      <TrendArrow trend={kw.trend} />
                    </td>
                    <td style={{ padding: "12px 20px", textAlign: "center" }}>
                      {kw.isOpportunity && (
                        <Badge tone="info">
                          <Zap size={10} aria-hidden="true" /> Oportunidad
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Páginas orgánicas */}
      <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", overflow: "hidden" }}>
        <div className="px-5 py-4" style={{ borderBottom: "0.5px solid var(--border-ui)" }}>
          <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px" }}>
            Páginas con más clics orgánicos
          </p>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", margin: 0 }}>
            Qué URLs están atrayendo tráfico de búsqueda real.
          </p>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "0.5px solid var(--border-ui)" }}>
              <th scope="col" style={{ padding: "10px 20px", fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "left" }}>URL</th>
              <th scope="col" style={{ padding: "10px 20px", fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right" }}>Clics</th>
              <th scope="col" style={{ padding: "10px 20px", fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right" }}>Impresiones</th>
              <th scope="col" style={{ padding: "10px 20px", fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right" }}>CTR</th>
            </tr>
          </thead>
          <tbody>
            {organicPages.map((p, i) => {
              const ctr = ((p.clicks / p.impressions) * 100).toFixed(1);
              const maxClicks = organicPages[0].clicks;
              return (
                <tr
                  key={p.url}
                  style={{ borderBottom: i < organicPages.length - 1 ? "0.5px solid var(--border-ui)" : "none", transition: "background 0.1s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-page)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px 20px" }}>
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          width: `${Math.round((p.clicks / maxClicks) * 80)}px`,
                          height: 3,
                          borderRadius: 99,
                          background: "var(--brand)",
                          opacity: 0.5,
                          flexShrink: 0,
                        }}
                        aria-hidden="true"
                      />
                      <span style={{ fontSize: "var(--font-size-sm)", fontFamily: "monospace", color: "var(--text-primary)" }}>
                        {p.url}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 20px", fontFamily: "monospace", fontSize: "var(--font-size-md)", color: "var(--text-primary)", textAlign: "right" }}>
                    {fmt(p.clicks)}
                  </td>
                  <td style={{ padding: "12px 20px", fontFamily: "monospace", fontSize: "var(--font-size-md)", color: "var(--text-secondary)", textAlign: "right" }}>
                    {fmt(p.impressions)}
                  </td>
                  <td style={{ padding: "12px 20px", fontFamily: "monospace", fontSize: "var(--font-size-md)", color: "var(--text-primary)", textAlign: "right" }}>
                    {ctr}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-5 py-3 flex justify-end" style={{ borderTop: "0.5px solid var(--border-ui)" }}>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 hover:opacity-70 transition-opacity"
            style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", background: "transparent", border: "none", cursor: "pointer", outlineColor: "var(--ring)" }}
          >
            <ExternalLink size={12} aria-hidden="true" />
            Abrir en Google Search Console
          </button>
        </div>
      </div>

      {/* Resumen de keywords de oportunidad */}
      <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", padding: "var(--space-4)", marginTop: "var(--space-4)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Zap size={14} aria-hidden="true" style={{ color: "var(--brand)" }} />
          <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
            Resumen de oportunidades
          </p>
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))" }}>
          {keywords.filter((k) => k.isOpportunity).slice(0, 3).map((kw) => (
            <div
              key={kw.term}
              style={{
                background: "var(--surface-page)",
                borderRadius: "var(--radius-item)",
                padding: "var(--space-3) var(--space-3)",
                border: "0.5px solid var(--border-ui)",
              }}
            >
              <p style={{ fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--text-primary)", margin: "0 0 6px", lineHeight: 1.4 }}>
                "{kw.term}"
              </p>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)" }}>
                  Posición <span style={{ fontFamily: "monospace", color: "var(--text-primary)" }}>#{kw.position}</span>
                </span>
                <Delta value={Math.round((kw.impressions / 100) * 0.1)} suffix=" clics pot." />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
