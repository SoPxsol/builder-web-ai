/**
 * Badge — componente primitivo de PXSOL Web DS
 *
 * Medidas calibradas contra los call-sites reales (PaginasView, PopupsView,
 * SeoGeoView, VersionesView, MisSitiosView, DashboardView):
 *   - height: 18px (la gran mayoría usa h-[18px] / h-[17px] / h-[20px])
 *   - fontSize: --font-size-xs (10px)
 *   - borderRadius: --radius-dot (4px)
 *   - padding horizontal: 8px (px-2 en Tailwind)
 *   - fontWeight: 500
 *
 * Tones alineados con el contrato semántico de theme.css:
 *   success     → badge-green-* ("Activo", "Publicado", "Actual", "Sitemap activo")
 *   info        → badge-blue-*  ("Principal" en páginas, hints de selección)
 *   warning     → badge-orange-*("Borrador", "Próximamente", "pendiente", Premium)
 *   neutral     → badge-neutral-bg + text-secondary ("Inactivo", "Preview")
 *   destructive → badge-red-bg + --destructive (errores en badges — poco frecuente)
 *
 * NOTA: El tone "neutral" del badge "Activo" en MisSitiosView usa fondo oscuro
 * (#1a1a1a, texto blanco) — ese es un caso de diseño específico de la SiteCard
 * que no se generaliza aquí. Si necesitás ese estilo, usá style={{ }} override.
 */

import type { ReactNode } from "react";

export type BadgeTone = "success" | "info" | "warning" | "neutral" | "destructive";

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  /** Permite overrides de estilo puntuales sin romper el token system. */
  style?: React.CSSProperties;
}

const TONE_STYLE: Record<BadgeTone, React.CSSProperties> = {
  success: {
    background: "var(--badge-green-bg)",
    color: "var(--badge-green-text)",
  },
  info: {
    background: "var(--badge-blue-bg)",
    color: "var(--badge-blue-text)",
  },
  warning: {
    background: "var(--badge-orange-bg)",
    color: "var(--badge-orange-text)",
  },
  neutral: {
    background: "var(--badge-neutral-bg)",
    color: "var(--badge-neutral-text, var(--text-secondary))",
  },
  destructive: {
    background: "var(--badge-red-bg)",
    color: "var(--destructive)",
  },
};

export function Badge({ tone = "neutral", children, style }: BadgeProps) {
  return (
    <span
      style={{
        // Layout — display inline-flex para alinear iconos opcionales si el
        // caller envía un nodo mixto (texto + icono SVG).
        display: "inline-flex",
        alignItems: "center",
        // Medidas calibradas
        height: 18,
        padding: "0 8px",
        borderRadius: "var(--radius-dot)",
        // Tipografía
        fontSize: "var(--font-size-xs)",
        fontWeight: 500,
        lineHeight: 1,
        // Evita wrapping en nombres de estado cortos
        whiteSpace: "nowrap",
        flexShrink: 0,
        // Tone
        ...TONE_STYLE[tone],
        // Override del caller (ej: height puntual, border extra)
        ...style,
      }}
    >
      {children}
    </span>
  );
}
