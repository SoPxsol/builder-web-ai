/**
 * SeoGeoSuiteView.tsx — Layout principal de la Suite SEO/GEO con sub-navegación.
 * WEB-737 | Rama: sofia/web-737-gestor-redes-sociales
 *
 * Reemplaza la vista simple SeoGeoView.tsx para el id de nav "seo".
 * Gestiona el estado de sub-vista activa localmente (sin React Router).
 * Envuelve a SeoGeoProvider para que todas las sub-vistas compartan contexto.
 *
 * Sub-vistas disponibles:
 *   dashboard   → SeoDashboard
 *   assistant   → SeoAssistant
 *   geo-tracker → SeoGeoTracker
 *   seo         → SeoAnalyticsView
 *   sources     → SourcesView
 *   generator   → GeneratorView
 *   suggestions → SuggestionsView
 *   reports     → ReportsView
 *
 * Accesibilidad:
 * - Sub-nav con role="tablist" + aria-selected en cada tab.
 * - Panel activo con role="tabpanel" + aria-labelledby.
 * - Navegación con teclas ← → en el tablist.
 */

import { useCallback, useId, useRef, useState } from "react";
import {
  BarChart2, Bot, FileText, Globe,
  LayoutDashboard, Lightbulb, Link2, Sparkles,
} from "lucide-react";
import { SeoGeoProvider } from "./SeoGeoContext";
import { SeoDashboard } from "./SeoDashboard";
import { SeoAssistant } from "./SeoAssistant";
import { SeoGeoTracker } from "./SeoGeoTracker";
import { SeoAnalyticsView } from "./SeoAnalyticsView";
import { SourcesView } from "./SourcesView";
import { GeneratorView } from "./GeneratorView";
import { SuggestionsView } from "./SuggestionsView";
import { ReportsView } from "./ReportsView";

/* ────────────────────────────────────────────────────────────────────────────
 * Sub-vistas
 * ──────────────────────────────────────────────────────────────────────────── */

type SubView =
  | "dashboard"
  | "assistant"
  | "geo-tracker"
  | "seo"
  | "sources"
  | "generator"
  | "suggestions"
  | "reports";

const SUB_VIEWS: Array<{ id: SubView; label: string; icon: React.ReactNode }> = [
  { id: "dashboard",   label: "Dashboard",    icon: <LayoutDashboard size={14} aria-hidden="true" /> },
  { id: "assistant",   label: "Asistente IA", icon: <Bot size={14} aria-hidden="true" /> },
  { id: "geo-tracker", label: "GEO Tracker",  icon: <Globe size={14} aria-hidden="true" /> },
  { id: "seo",         label: "SEO Analytics",icon: <BarChart2 size={14} aria-hidden="true" /> },
  { id: "sources",     label: "Fuentes",      icon: <Link2 size={14} aria-hidden="true" /> },
  { id: "generator",   label: "Generador",    icon: <Sparkles size={14} aria-hidden="true" /> },
  { id: "suggestions", label: "Sugerencias",  icon: <Lightbulb size={14} aria-hidden="true" /> },
  { id: "reports",     label: "Reportes",     icon: <FileText size={14} aria-hidden="true" /> },
];

/* ────────────────────────────────────────────────────────────────────────────
 * Props
 * ──────────────────────────────────────────────────────────────────────────── */

interface Props {
  /** Nombre del sitio activo — pasado desde App.tsx igual que en la vista original. */
  siteName?: string;
  /** navigate principal del Builder — no se usa internamente pero se acepta para compatibilidad. */
  navigate?: (view: string) => void;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Inner — necesita acceso al contexto ya montado
 * ──────────────────────────────────────────────────────────────────────────── */

function SeoGeoInner({ siteName = "" }: { siteName?: string }) {
  const [active, setActive] = useState<SubView>("dashboard");
  const [generatorTopic, setGeneratorTopic] = useState("");
  const tablistRef = useRef<HTMLDivElement>(null);
  // panelId único por tab para la relación aria-controls correcta (WCAG 1.3.1)
  const tabIds = useId();
  // El panel tiene id dinámico basado en la vista activa
  const panelBaseId = useId();

  const navigate = useCallback((id: string) => {
    if (SUB_VIEWS.some((v) => v.id === id)) setActive(id as SubView);
  }, []);

  const onSubNav = (id: string) => {
    if (id === "generator" || SUB_VIEWS.some((v) => v.id === id)) {
      navigate(id);
    }
  };

  // Cuando Sugerencias pide generar con un tópico, navegamos al generador
  const onGeneratorWithTopic = (topic: string) => {
    setGeneratorTopic(topic);
    setActive("generator");
  };

  // Navegación por teclado en el tablist
  const onTabKeyDown = (e: React.KeyboardEvent, idx: number) => {
    const tabs = tablistRef.current?.querySelectorAll<HTMLButtonElement>("[role='tab']");
    if (!tabs) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = (idx + 1) % tabs.length;
      tabs[next].focus();
      setActive(SUB_VIEWS[next].id);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = (idx - 1 + tabs.length) % tabs.length;
      tabs[prev].focus();
      setActive(SUB_VIEWS[prev].id);
    }
  };

  const activeIdx = SUB_VIEWS.findIndex((v) => v.id === active);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Sub-nav */}
      <div
        style={{
          background: "var(--surface-card)",
          borderBottom: "0.5px solid var(--border-ui)",
          padding: "0 var(--space-5)",
          flexShrink: 0,
        }}
      >
        {siteName && (
          <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", paddingTop: 12, marginBottom: 8 }}>
            {siteName} — Suite SEO/GEO
          </p>
        )}
        <div
          ref={tablistRef}
          role="tablist"
          aria-label="Secciones de la Suite SEO/GEO"
          className="flex items-center gap-1 overflow-x-auto"
          style={{ paddingBottom: 0, scrollbarWidth: "none" }}
        >
          {SUB_VIEWS.map((v, idx) => {
            const isActive = v.id === active;
            const tabId = `${tabIds}-${v.id}`;
            return (
              <button
                key={v.id}
                id={tabId}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${panelBaseId}-${v.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActive(v.id)}
                onKeyDown={(e) => onTabKeyDown(e, idx)}
                className="flex items-center gap-2 whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all"
                style={{
                  padding: "11px 12px",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: isActive ? 600 : 400,
                  // Regla del 10%: texto activo en --text-primary, no en --brand.
                  // El brand se reserva solo para la línea inferior indicadora.
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  background: "transparent",
                  border: "none",
                  borderBottom: isActive ? "2px solid var(--brand)" : "2px solid transparent",
                  cursor: "pointer",
                  outlineColor: "var(--ring)",
                  borderRadius: "0",
                  flexShrink: 0,
                }}
              >
                {v.icon}
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel activo — id único por tab (WCAG 1.3.1: relación controls↔panel) */}
      <div
        id={`${panelBaseId}-${active}`}
        role="tabpanel"
        aria-labelledby={`${tabIds}-${active}`}
        tabIndex={0}
        className="flex-1 overflow-y-auto focus-visible:outline-none"
        style={{ background: "var(--surface-page)" }}
      >
        {active === "dashboard"   && <SeoDashboard onSubNav={onSubNav} />}
        {active === "assistant"   && <SeoAssistant />}
        {active === "geo-tracker" && <SeoGeoTracker onSubNav={onSubNav} />}
        {active === "seo"         && <SeoAnalyticsView />}
        {active === "sources"     && <SourcesView />}
        {active === "generator"   && <GeneratorView initialTopic={generatorTopic} />}
        {active === "suggestions" && <SuggestionsView onSubNav={onSubNav} onGeneratorWithTopic={onGeneratorWithTopic} />}
        {active === "reports"     && <ReportsView />}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Export principal (envuelve el provider)
 * ──────────────────────────────────────────────────────────────────────────── */

export function SeoGeoSuiteView({ siteName, navigate }: Props) {
  return (
    <SeoGeoProvider>
      <SeoGeoInner siteName={siteName} />
    </SeoGeoProvider>
  );
}
