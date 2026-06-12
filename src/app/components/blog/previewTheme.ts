/**
 * Tema del SITIO PUBLICADO para la vista previa del artículo.
 *
 * No son tokens de la app (PXSOL = coral). Representan la identidad del sitio
 * del hotel (serif editorial, crema, acento dorado). Vive en su propio módulo
 * —sin componentes— para no romper el Fast Refresh de ArticlePreviewFull.
 *
 * Es inyectable: cuando el modelo de Sitio exponga colores reales, se pasan
 * por la prop `theme` de ArticlePreviewFull.
 */
export interface PreviewTheme {
  bg: string;
  surface: string;
  ink: string;
  inkSoft: string;
  inkFaint: string;
  /** Color de acento de la marca del sitio (botones, detalles). */
  accent: string;
  /** Color de contraste sobre el acento. */
  accentInk: string;
  /** Superficie oscura (callouts, CTA, tarjeta lateral). */
  dark: string;
  border: string;
  serif: string;
  sans: string;
}

export const DEFAULT_PREVIEW_THEME: PreviewTheme = {
  bg: "#e9e2d3",
  surface: "#efe9dc",
  ink: "#2b2722",
  inkSoft: "#6f685c",
  inkFaint: "#9a9183",
  accent: "#9a8a5f",
  accentInk: "#1c1a17",
  dark: "#1c1a17",
  border: "rgba(43, 39, 34, 0.14)",
  serif: "Georgia, 'Times New Roman', serif",
  sans: "var(--font-sans)",
};
