/**
 * _shared.tsx — Componentes compartidos de la Suite SEO/GEO.
 * WEB-737 | Rama: sofia/web-737-gestor-redes-sociales
 *
 * Portado desde pxsol-home-mkt-division/src/screens/seoGeo/_shared.jsx.
 * Tipado completo. Estilos al DS del Builder.
 *
 * Accesibilidad carry-over:
 * - TrendArrow: no depende solo del color (ícono de dirección presente, WCAG 1.4.1).
 * - Delta: aria-label descriptivo.
 * - SimOverlay: role="status" + aria-live="polite".
 */

import { useMemo } from "react";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import type { SeriesPoint } from "../../data/seo-geo-demo";

/* ────────────────────────────────────────────────────────────────────────────
 * LineChart — SVG nativo, sin dependencias de charting.
 * Colores: SEO usa var(--brand), GEO usa #5B8FBF (color del motor, se mantiene).
 * ──────────────────────────────────────────────────────────────────────────── */

export function LineChart({ series, height = 220 }: { series: SeriesPoint[]; height?: number }) {
  const { width, paths, ticks } = useMemo(() => {
    if (!series?.length)
      return { width: 0, paths: { seo: "", geo: "", seoArea: "", geoArea: "" }, ticks: [] };

    const w = 800;
    const padX = 12;
    const padY = 18;
    const usableW = w - padX * 2;
    const usableH = height - padY * 2;

    const seo = series.map((d) => d.seo);
    const geo = series.map((d) => d.geo);
    const allVals = [...seo, ...geo];
    const min = Math.min(...allVals) - 4;
    const max = Math.max(...allVals) + 4;

    const x = (i: number) => padX + (i / (series.length - 1)) * usableW;
    const y = (v: number) => padY + (1 - (v - min) / (max - min)) * usableH;

    const buildLine = (arr: number[]) =>
      arr.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

    const buildArea = (arr: number[]) =>
      `${buildLine(arr)} L${x(arr.length - 1).toFixed(1)},${(padY + usableH).toFixed(1)} L${x(0).toFixed(1)},${(padY + usableH).toFixed(1)} Z`;

    const tickIdx = [0, Math.floor(series.length / 2), series.length - 1];
    const ticks = tickIdx.map((i) => ({ x: x(i), label: series[i].date }));

    return {
      width: w,
      paths: {
        seo: buildLine(seo),
        geo: buildLine(geo),
        seoArea: buildArea(seo),
        geoArea: buildArea(geo),
      },
      ticks,
    };
  }, [series, height]);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height + 22}`}
        className="w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="seoGeo-brandFade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor="var(--brand)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0"    />
          </linearGradient>
          <linearGradient id="seoGeo-coolFade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor="#5B8FBF" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#5B8FBF" stopOpacity="0"    />
          </linearGradient>
        </defs>
        <path d={paths.seoArea} fill="url(#seoGeo-brandFade)" />
        <path d={paths.geoArea} fill="url(#seoGeo-coolFade)" />
        <path d={paths.seo} fill="none" style={{ stroke: "var(--brand)" }} strokeWidth="2" />
        <path d={paths.geo} fill="none" stroke="#5B8FBF" strokeWidth="2" />
        {ticks.map((t) => (
          <text
            key={t.label}
            x={t.x}
            y={height + 14}
            fontSize="10"
            fill="var(--text-tertiary)"
            textAnchor="middle"
            fontFamily="monospace"
          >
            {t.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * SimOverlay — "IA pensando" durante simulaciones
 * ──────────────────────────────────────────────────────────────────────────── */

export function SimOverlay({ active, message }: { active: boolean; message: string }) {
  if (!active) return null;
  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center rounded-lg"
      style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="flex flex-col items-center gap-3"
        role="status"
        aria-live="polite"
      >
        <div
          style={{
            width: 48, height: 48,
            borderRadius: "50%",
            background: "var(--surface-page)",
            border: "0.5px solid var(--border-ui)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Loader2 size={20} className="animate-spin" style={{ color: "var(--brand)" }} aria-hidden="true" />
        </div>
        <div style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", fontWeight: 500 }}>
          {message}
        </div>
        <span className="sr-only">Procesando…</span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * AuthorityBadge — nivel de autoridad LLM para fuentes
 * ──────────────────────────────────────────────────────────────────────────── */

type AuthorityLevel = "high" | "medium" | "low";

const AUTHORITY_MAP: Record<AuthorityLevel, { label: string; bg: string; color: string }> = {
  high:   { label: "Alta",  bg: "#dcfce7", color: "#15803d" },
  medium: { label: "Media", bg: "#dbeafe", color: "#1d4ed8" },
  low:    { label: "Baja",  bg: "var(--surface-page)", color: "var(--text-secondary)" },
};

export function AuthorityBadge({ level }: { level: AuthorityLevel }) {
  const cfg = AUTHORITY_MAP[level] || AUTHORITY_MAP.low;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        borderRadius: 99,
        padding: "2px 8px",
        fontSize: "var(--font-size-xs)",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        background: cfg.bg,
        color: cfg.color,
      }}
    >
      {cfg.label} autoridad
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * EngineBadge — identifica el motor de IA.
 * Colores de plataforma (ChatGPT verde, Perplexity azul, Google amarillo) — se mantienen.
 * ──────────────────────────────────────────────────────────────────────────── */

type Engine = "chatgpt" | "perplexity" | "google_ai";

const ENGINE_MAP: Record<Engine, { label: string; color: string }> = {
  chatgpt:    { label: "ChatGPT",   color: "#10A37F" },
  perplexity: { label: "Perplexity", color: "#5B8FBF" },
  google_ai:  { label: "Google AI",  color: "#D4A853" },
};

export function EngineBadge({ engine }: { engine: string }) {
  const cfg = ENGINE_MAP[engine as Engine] || { label: engine, color: "#6b7280" };
  return (
    <span className="inline-flex items-center gap-1.5" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-primary)" }}>
      <span
        style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, flexShrink: 0 }}
        aria-hidden="true"
      />
      {cfg.label}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * TrendArrow — no depende solo del color (WCAG 1.4.1).
 * "down" usa amber (no rojo) para no colisionar con la marca.
 * ──────────────────────────────────────────────────────────────────────────── */

export function TrendArrow({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up")
    return (
      <span
        className="inline-flex items-center gap-0.5"
        style={{ color: "var(--status-active)", fontSize: "var(--font-size-sm)" }}
        aria-label="Tendencia al alza"
      >
        <TrendingUp size={12} aria-hidden="true" />
      </span>
    );
  if (trend === "down")
    return (
      <span
        className="inline-flex items-center gap-0.5"
        style={{ color: "#8B6F1F", fontSize: "var(--font-size-sm)" }}
        aria-label="Tendencia a la baja"
      >
        <TrendingDown size={12} aria-hidden="true" />
      </span>
    );
  return <span className="inline-flex items-center" style={{ color: "var(--text-tertiary)", fontSize: "var(--font-size-sm)" }} aria-label="Tendencia estable">·</span>;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Delta — variación numérica con ícono de dirección
 * ──────────────────────────────────────────────────────────────────────────── */

export function Delta({ value, suffix = "" }: { value: number; suffix?: string }) {
  const positive = value > 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span
      className="inline-flex items-center gap-0.5"
      style={{
        fontSize: "var(--font-size-sm)",
        fontWeight: 500,
        color: positive ? "var(--status-active)" : "#8B6F1F",
      }}
      aria-label={`${positive ? "Subió" : "Bajó"} ${Math.abs(value)}${suffix}`}
    >
      <Icon size={11} aria-hidden="true" />
      {positive ? "+" : ""}
      {value}
      {suffix}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * ScoreBar — barra de progreso accesible con role="progressbar"
 * ──────────────────────────────────────────────────────────────────────────── */

type BarTone = "brand" | "cool" | "positive" | "warning" | "neutral";

const BAR_COLORS: Record<BarTone, string> = {
  brand:    "var(--brand)",
  cool:     "#5B8FBF",
  positive: "var(--status-active)",
  warning:  "var(--status-warning)",
  neutral:  "var(--text-secondary)",
};

export function ScoreBar({
  value,
  tone = "brand",
  label,
}: {
  value: number;
  tone?: BarTone;
  label?: string;
}) {
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
        aria-label={label ?? `${value}%`}
        style={{
          height: "100%",
          width: `${value}%`,
          background: BAR_COLORS[tone],
          borderRadius: 99,
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * MiniSpark — sparkline SVG inline
 * ──────────────────────────────────────────────────────────────────────────── */

export function MiniSpark({ data, color }: { data: number[]; color?: string }) {
  if (!data?.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * 80},${20 - ((v - min) / (max - min || 1)) * 18 - 1}`,
    )
    .join(" ");
  return (
    <svg viewBox="0 0 80 20" style={{ width: 80, height: 20 }} aria-hidden="true">
      <polyline
        points={pts}
        fill="none"
        style={{ stroke: color ?? "var(--brand)" }}
        strokeWidth="1.5"
      />
    </svg>
  );
}
