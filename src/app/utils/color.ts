/**
 * Utilidades de color para contraste texto-sobre-imagen.
 *
 * Usado por el editor de Redes Sociales (SocialEditorView) para decidir el
 * color del texto del overlay según la luminancia del color de scrim
 * efectivo — evita texto blanco ilegible sobre scrims claros.
 */

/** Convierte un hex (#fff, #ffffff) a componentes RGB 0-255. Undefined si es inválido. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | undefined {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean;
  if (full.length !== 6 || /[^0-9a-fA-F]/.test(full)) return undefined;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** Luminancia relativa (WCAG 2.x), 0 (negro) a 1 (blanco). */
export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Color de texto legible (dinámico) para superponer sobre un color de fondo dado.
 * Umbral ~0.6: por encima, fondo claro → texto oscuro; si no, texto blanco.
 * `darkToken`/`lightToken` permiten inyectar tokens del DS en vez de hex fijos.
 */
export function readableTextColor(
  backgroundHex: string,
  { light = "#ffffff", dark = "var(--text-primary)" }: { light?: string; dark?: string } = {},
): string {
  return relativeLuminance(backgroundHex) > 0.6 ? dark : light;
}
