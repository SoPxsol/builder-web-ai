/**
 * SectionTabs — componente primitivo de PXSOL Web DS (navegación)
 *
 * Barra de tabs del nivel más profundo del nav del sitio, renderizada arriba
 * del contenido. Los grupos del hub Sitios (Formatos, Contenido, Configuración)
 * exponen sus ítems como TABS (no como un 3er nivel de columna), unificando el
 * patrón con Redes Sociales y la Suite SEO/GEO.
 *
 * Extraído de App.tsx (RITUAL DS 2026-07-03, TOP 3) como primera pieza del
 * sistema de navegación. Es autocontenido: no cierra sobre estado de App.
 *
 * Contrato de accesibilidad (WCAG 2.2 AA):
 *   - role="tablist" con aria-label; cada tab con role="tab" y aria-selected.
 *   - Navegación por flechas ← → entre tabs habilitadas (roving tabindex:
 *     solo la tab activa es tabbable, el resto tabIndex=-1). 4.1.2 / 2.1.1.
 *   - Tabs deshabilitadas: <button disabled> + aria-disabled + title
 *     "Próximamente" (no entran al roving ni son activables). 4.1.2.
 *   - Selección NO depende solo del color: borde inferior --brand + fontWeight
 *     600 + cambio de color de texto. 1.4.1.
 *   - Foco visible via outline (focus-visible) con --ring. 2.4.7 / 1.4.11.
 *
 * Deuda conocida (ver reporte DS 2026-07-03, A11Y-04): el patrón usa role="tab"
 * pero no expone role="tabpanel"/aria-controls porque las tabs NAVEGAN de vista
 * (son navegación, no paneles co-presentes). Decisión de patrón pendiente de
 * gate: completar el contrato ARIA de tabs, o migrar a <nav>+aria-current.
 */

import { useRef, type KeyboardEvent } from "react";
import { Lock } from "lucide-react";
import type { View, SiteNavItem } from "../../types";

export function SectionTabs({
  items,
  view,
  navigate,
}: {
  items: SiteNavItem[];
  view: View;
  navigate: (v: View) => void;
}) {
  const tablistRef = useRef<HTMLDivElement>(null);

  function onKeyDown(e: KeyboardEvent) {
    const tabs = tablistRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])');
    if (!tabs || tabs.length === 0) return;
    const enabled = Array.from(tabs);
    const currentPos = enabled.findIndex((t) => t === e.currentTarget);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      enabled[(currentPos + 1) % enabled.length].focus();
      enabled[(currentPos + 1) % enabled.length].click();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = (currentPos - 1 + enabled.length) % enabled.length;
      enabled[prev].focus();
      enabled[prev].click();
    }
  }

  return (
    <div
      style={{
        background: "var(--surface-card)",
        borderBottom: "0.5px solid var(--border-ui)",
        padding: "0 var(--space-5)",
        flexShrink: 0,
      }}
    >
      <div
        ref={tablistRef}
        role="tablist"
        aria-label="Secciones"
        className="flex items-center gap-1 overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((item) => {
          const target = (item.nav ?? item.id) as View;
          const isActive = ((item.nav ?? item.id) as string) === view;
          if (item.disabled) {
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                disabled
                aria-disabled="true"
                title="Próximamente"
                className="flex items-center gap-2 whitespace-nowrap cursor-not-allowed"
                style={{
                  padding: "11px 12px",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: 400,
                  color: "var(--text-tertiary)",
                  background: "transparent",
                  border: "none",
                  borderBottom: "2px solid transparent",
                  flexShrink: 0,
                }}
              >
                {item.label}
                <Lock size={11} aria-hidden="true" style={{ flexShrink: 0 }} />
              </button>
            );
          }
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => navigate(target)}
              onKeyDown={onKeyDown}
              className="flex items-center gap-2 whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all"
              style={{
                padding: "11px 12px",
                fontSize: "var(--font-size-sm)",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                background: "transparent",
                border: "none",
                borderBottom: isActive ? "2px solid var(--brand)" : "2px solid transparent",
                cursor: "pointer",
                outlineColor: "var(--ring)",
                flexShrink: 0,
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
