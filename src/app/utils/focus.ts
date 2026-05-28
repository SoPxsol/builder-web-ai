/**
 * Selectores y helpers para focus management en modales/dialogs/popovers.
 *
 * Centralizado para evitar drift entre Wizard1, Wizard2, BuilderView y CreationShell —
 * todos implementan focus trap manualmente y antes mantenían copias locales del selector.
 */

export const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Devuelve los elementos focusables visibles dentro de un contenedor.
 * Filtra los que tienen `offsetParent === null` (ej: dentro de `display: none`).
 */
export function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null,
  );
}

/**
 * Maneja el foco circular dentro de un contenedor al presionar Tab.
 * Llamar desde un handler de keydown — solo actúa cuando la tecla es Tab.
 * Retorna true si interceptó el evento (el caller debe llamar preventDefault).
 */
export function trapTabKey(e: KeyboardEvent, container: HTMLElement | null): boolean {
  if (e.key !== "Tab" || !container) return false;
  const focusables = getFocusableElements(container);
  if (focusables.length === 0) return false;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const current = document.activeElement;
  if (e.shiftKey && current === first) {
    last.focus();
    return true;
  }
  if (!e.shiftKey && current === last) {
    first.focus();
    return true;
  }
  return false;
}
