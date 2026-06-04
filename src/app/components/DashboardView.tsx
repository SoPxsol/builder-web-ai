import { useState } from "react";
import {
  ArrowRight,
  AppWindow,
  Eye,
  FilePlus,
  FileText,
  Globe,
  Languages,
  Megaphone,
  MessageSquarePlus,
  Newspaper,
  Pencil,
  PenLine,
  ExternalLink,
  Plus,
  Search,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { View, Site } from "../types";
import type { StepIndex } from "../types/wizard";
import type { W2State } from "../types/wizard2";
import type { PopupState } from "../types/creation";
import { SetupProgressCard } from "./SetupProgressCard";
import { CommercialCalendarCard } from "./CommercialCalendarCard";
import { SitePickerDialog } from "./SitePickerDialog";

/**
 * Acciones rápidas del Dashboard. Apuntan a CONTEXTO DE SITIO, así que al
 * elegir una se pregunta primero "¿en qué sitio?" (SitePickerDialog).
 *
 * Dos grupos:
 *  - "create": abren un wizard de creación directo en el sitio elegido.
 *  - "nav":    navegan a la vista (listado) de ese sitio.
 */
type QuickAction =
  | { kind: "create"; create: "article" | "popup" | "page"; label: string; Icon: LucideIcon }
  | { kind: "nav"; view: View; label: string; Icon: LucideIcon };

const CREATE_ACTIONS: QuickAction[] = [
  { kind: "create", create: "article", label: "Crear artículo", Icon: PenLine },
  { kind: "create", create: "popup", label: "Crear pop-up", Icon: MessageSquarePlus },
  { kind: "create", create: "page", label: "Crear página", Icon: FilePlus },
];

const NAV_ACTIONS: QuickAction[] = [
  { kind: "nav", view: "paginas", label: "Páginas", Icon: FileText },
  { kind: "nav", view: "blog", label: "Blog", Icon: Newspaper },
  { kind: "nav", view: "popups", label: "Pop-ups", Icon: AppWindow },
  { kind: "nav", view: "promociones", label: "Promociones", Icon: Megaphone },
];

/**
 * Variante visual del StatCard. Define el color del icono + fondo del icono.
 * - neutral: métrica de inventario sin valencia (sitios totales)
 * - success: estado completado / positivo (sitios activos, schema activo)
 * - info:    métrica accionable que invita a completar configuración
 * - warning: estado que requiere atención del usuario (1 idioma → activá más)
 */
type StatTone = "neutral" | "success" | "info" | "warning";

const TONE_STYLES: Record<StatTone, { iconColor: string; iconBg: string }> = {
  neutral: { iconColor: "var(--text-secondary)",   iconBg: "var(--surface-page)" },
  success: { iconColor: "var(--badge-green-text)", iconBg: "var(--badge-green-bg)" },
  info:    { iconColor: "var(--accent-info)",      iconBg: "var(--accent-info-bg)" },
  warning: { iconColor: "var(--badge-orange-text)", iconBg: "var(--badge-orange-bg)" },
};

interface Props {
  sites: Site[];
  navigate: (view: View, siteId?: number) => void;
  openWizard: () => void;
  /** Retomar el W1 en un paso específico, sembrado con datos del sitio (pending). */
  openWizardAt: (step: StepIndex, site?: Site) => void;
  /** Draft del W2 — si existe y no está al 100%, se muestra la SetupProgressCard. */
  wizard2Draft: W2State | null;
  openWizard2: () => void;
  /**
   * Abre el CreatePopupWizard con un preset. Lo usa el Calendario Comercial
   * para disparar pop-up countdown / lead capture / exit-intent pre-cargado.
   */
  openCreatePopupWith: (preset: Partial<PopupState>) => void;
  /** Abre un wizard de creación directo en el sitio elegido (acciones rápidas). */
  onCreateInSite: (kind: "article" | "popup" | "page", siteId: number) => void;
  /** Día actual del trial (1-indexed). */
  trialDay?: number;
  trialTotalDays?: number;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  /** Variante visual del icono. Default: neutral. */
  tone?: StatTone;
  /** Variación vs. período previo (número con signo). 0 = sin cambio (no se renderiza flecha). */
  trend?: number;
  /** Visualización de progreso "current de total". Ej: 1 de 3 buscadores activos. */
  progress?: { current: number; total: number };
  /** Texto secundario con tono opcional (modo comercial). */
  hint?: { text: string; tone: "positive" | "actionable" };
  onHintClick?: () => void;
}

/**
 * Dots de progreso "X de N" — N dots, los primeros X rellenos con color de tono.
 * Para N pequeño (≤ 5) son dots; para N mayor caemos a una barra de progreso.
 */
function ProgressDots({ current, total, tone }: { current: number; total: number; tone: StatTone }) {
  const fillColor = TONE_STYLES[tone].iconColor;
  const emptyColor = "var(--border-ui)";

  if (total > 5) {
    const pct = total > 0 ? Math.round((current / total) * 100) : 0;
    return (
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${current} de ${total}`}
        className="mt-2"
        style={{ width: "100%", height: 6, background: emptyColor, borderRadius: 3, overflow: "hidden" }}
      >
        <div style={{ width: `${pct}%`, height: "100%", background: fillColor, borderRadius: 3 }} />
      </div>
    );
  }

  return (
    <div
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`${current} de ${total}`}
      className="flex items-center gap-1.5 mt-2"
    >
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            width: 18,
            height: 6,
            borderRadius: 3,
            background: i < current ? fillColor : emptyColor,
            transition: "background 0.2s ease",
          }}
        />
      ))}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone = "neutral", trend, progress, hint, onHintClick }: StatCardProps) {
  const hasTrend = typeof trend === "number" && trend !== 0;
  const trendUp = (trend ?? 0) > 0;
  const { iconColor, iconBg } = TONE_STYLES[tone];
  const isClickable = !!onHintClick;
  // Color del hint: "actionable" usa --accent-info (azul) para evitar confusión
  // con --destructive (rojo); "positive" usa verde de estado activo.
  const hintColor = hint?.tone === "actionable" ? "var(--accent-info)" : "var(--status-active)";

  return (
    <div
      className="flex flex-col p-4 transition-colors"
      style={{
        background: "var(--surface-card)",
        borderRadius: "var(--radius-card)",
        border: "0.5px solid var(--border-ui)",
        height: "100%",
      }}
    >
      {/* Icono prominente + label */}
      <div className="flex items-center gap-2.5 mb-3">
        <div
          aria-hidden="true"
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 36, height: 36, background: iconBg, borderRadius: "var(--radius-icon)" }}
        >
          <Icon size={18} style={{ color: iconColor }} />
        </div>
        <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", lineHeight: 1.3 }}>{label}</p>
      </div>

      {/* Valor principal */}
      <p style={{ fontSize: "var(--font-size-2xl)", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
        {value}
      </p>

      {/* Visualización de progreso (dots/bar) */}
      {progress && <ProgressDots current={progress.current} total={progress.total} tone={tone} />}

      {/* Trend (delta vs período previo) */}
      {hasTrend && (
        <p
          className="flex items-center gap-1 mt-2"
          style={{ fontSize: "var(--font-size-sm)", color: trendUp ? "var(--status-active)" : "var(--destructive)" }}
        >
          <span aria-hidden="true">{trendUp ? "↑" : "↓"}</span>
          <span>{trendUp ? `+${trend}` : trend}</span>
        </p>
      )}

      {/* Hint accionable o positivo */}
      {hint && (
        <button
          type="button"
          onClick={onHintClick}
          disabled={!isClickable}
          className="flex items-center gap-1 mt-2 transition-opacity hover:opacity-80 disabled:cursor-default focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
          style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: 500,
            color: hintColor,
            background: "transparent",
            border: "none",
            padding: 0,
            textAlign: "left",
            cursor: isClickable ? "pointer" : "default",
            lineHeight: 1.3,
            outlineColor: hintColor,
            borderRadius: 3,
          }}
        >
          <span>{hint.text}</span>
          {isClickable && <ArrowRight size={11} aria-hidden="true" style={{ flexShrink: 0 }} />}
        </button>
      )}
    </div>
  );
}

function SiteGradientCard({ site, onEdit }: { site: Site; onEdit: () => void }) {
  const isPending = site.status === "pending";
  const gradient = isPending
    ? "linear-gradient(135deg, #c9cdd4, #e2e5ea)"
    : `linear-gradient(140deg, ${site.thumbLeft}, ${site.thumbRight})`;

  return (
    <div
      className="flex flex-col justify-between p-3 cursor-pointer transition-opacity hover:opacity-90"
      style={{
        background: gradient,
        borderRadius: "var(--radius-card)",
        minHeight: 110,
        border: isPending ? "0.5px dashed rgba(255,255,255,0.4)" : "none",
      }}
      onClick={onEdit}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-1">
        <p
          className="truncate"
          style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "#fff", lineHeight: 1.3 }}
          title={site.name}
        >
          {site.name}
        </p>
        <span
          className="px-2 h-[18px] flex items-center flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.25)",
            borderRadius: "var(--radius-dot)",
            fontSize: "var(--font-size-xs)",
            fontWeight: 500,
            color: "#fff",
            backdropFilter: "blur(4px)",
          }}
        >
          {isPending ? "pendiente" : "Activo"}
        </span>
      </div>

      {/* Domain */}
      <p style={{ fontSize: "var(--font-size-sm)", color: "rgba(255,255,255,0.72)", marginTop: 4 }}>
        {site.domain || "sin dominio"}
      </p>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-auto pt-3">
        <span style={{ fontSize: "var(--font-size-sm)", color: "rgba(255,255,255,0.72)" }}>
          {site.pages ?? 0} páginas
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            aria-label="Editar sitio"
            className="flex items-center justify-center transition-opacity hover:opacity-70"
            style={{ width: 28, height: 28, background: "rgba(255,255,255,0.22)", borderRadius: "var(--radius-dot)" }}
          >
            <Pencil size={13} style={{ color: "#fff" }} />
          </button>
          <button
            aria-label="Abrir sitio en nueva pestaña"
            className="flex items-center justify-center transition-opacity hover:opacity-70"
            style={{ width: 28, height: 28, background: "rgba(255,255,255,0.22)", borderRadius: "var(--radius-dot)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={13} style={{ color: "#fff" }} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Grupo de acciones rápidas (Crear / Ir a) con su rótulo. */
function QuickActionGroup({
  title,
  subtitle,
  actions,
  onRun,
}: {
  title: string;
  subtitle: string;
  actions: QuickAction[];
  onRun: (a: QuickAction) => void;
}) {
  return (
    <div>
      <p
        style={{
          fontSize: "var(--font-size-xs)",
          fontWeight: 600,
          color: "var(--text-tertiary)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          margin: "0 0 8px",
        }}
      >
        {title}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {actions.map((action) => {
          const Icon = action.Icon;
          return (
            <button
              key={action.label}
              type="button"
              onClick={() => onRun(action)}
              className="flex items-center gap-3 p-3 transition-colors hover:border-[var(--accent-info)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: "var(--surface-card)",
                border: "0.5px solid var(--border-ui)",
                borderRadius: "var(--radius-card)",
                cursor: "pointer",
                textAlign: "left",
                outlineColor: "var(--accent-info)",
              }}
            >
              <span
                aria-hidden="true"
                className="flex items-center justify-center flex-shrink-0"
                style={{ width: 36, height: 36, background: "var(--accent-info-bg)", borderRadius: "var(--radius-icon)" }}
              >
                <Icon size={18} style={{ color: "var(--accent-info)" }} />
              </span>
              <span className="flex flex-col min-w-0" style={{ gap: 1 }}>
                <span style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--text-primary)" }}>
                  {action.label}
                </span>
                <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)" }}>
                  {subtitle}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardView({ sites, navigate, openWizard, openWizardAt, wizard2Draft, openWizard2, openCreatePopupWith, onCreateInSite, trialDay, trialTotalDays }: Props) {
  const isEmpty = sites.length === 0;
  const activeSites = sites.filter((s) => s.status === "active");

  // Cards comerciales — refleja el valor real del SaaS, no las metrics operacionales.
  // Buscadores activos: Google siempre = 1. +1 si Schema.org está activo (ChatGPT, Perplexity).
  const schemaActive = wizard2Draft?.seo.schemaOrgEnabled ?? false;
  const buscadoresCurrent = schemaActive ? 3 : 1;
  const buscadoresTotal = 3;
  const buscadoresHint = schemaActive
    ? { text: "Google, ChatGPT y Perplexity te encuentran", tone: "positive" as const }
    : { text: "Activá Schema.org", tone: "actionable" as const };

  // Idiomas: lo que tenga el draft del W2, o 1 (español) por default.
  const idiomasCount = wizard2Draft?.languages.active.length ?? 1;
  // Mostramos progreso sobre un total razonable de idiomas relevantes (es/en/pt/fr).
  const idiomasTotal = 4;
  const idiomasHint =
    idiomasCount === 1
      ? { text: "Activá inglés y multiplicá ×3 tu alcance", tone: "actionable" as const }
      : { text: `Multilenguaje activo · ${idiomasCount} variantes`, tone: "positive" as const };

  const previewSites = sites.slice(0, 6);

  // Acciones rápidas: solo aplican a sitios activos (los pending no tienen
  // contenido todavía). Si hay un único sitio activo, vamos directo; si hay
  // varios, abrimos el selector "¿en qué sitio?".
  const [pendingAction, setPendingAction] = useState<QuickAction | null>(null);

  function dispatchAction(action: QuickAction, siteId: number) {
    if (action.kind === "create") onCreateInSite(action.create, siteId);
    else navigate(action.view, siteId);
  }

  function runQuickAction(action: QuickAction) {
    if (activeSites.length === 1) {
      dispatchAction(action, activeSites[0].id);
      return;
    }
    setPendingAction(action);
  }

  return (
    <main className="flex-1 overflow-y-auto" style={{ background: "var(--surface-page)" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 border-b"
        style={{ background: "var(--surface-card)", borderColor: "var(--border-ui)", height: "var(--view-header-h-lg)" }}
      >
        <div>
          <h1 style={{ fontSize: "var(--font-size-xl)", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3, margin: 0 }}>
            {isEmpty ? "¡Bienvenido a PXSOL Web! 👋" : "¡Bienvenido, Sofía! 👋"}
          </h1>
          <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)" }}>
            {isEmpty
              ? "Empezá creando el sitio web de tu hotel."
              : "Aquí tienes un resumen de PXSOL Web hoy."}
          </p>
        </div>
        {!isEmpty && (
          <button
            onClick={openWizard}
            className="flex items-center gap-1.5 px-4 h-9 transition-opacity hover:opacity-85"
            style={{ background: "var(--brand)", borderRadius: "var(--radius-nav)", fontSize: "var(--font-size-md)", fontWeight: 500, color: "#fff" }}
          >
            <Plus size={13} />
            Crear nuevo sitio
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="flex items-center justify-center" style={{ padding: "var(--space-5)", minHeight: "calc(100vh - var(--view-header-h-lg) - 40px)" }}>
          <div
            className="flex flex-col items-center text-center"
            style={{
              background: "var(--surface-card)",
              borderRadius: "var(--radius-card)",
              border: "0.5px solid var(--border-ui)",
              padding: "48px 32px",
              maxWidth: 480,
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 56,
                height: 56,
                background: "var(--surface-page)",
                borderRadius: "var(--radius-icon)",
                marginBottom: 20,
              }}
              aria-hidden="true"
            >
              <Globe size={24} style={{ color: "var(--brand)" }} />
            </div>
            <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 600, color: "var(--text-primary)", marginBottom: 8, marginTop: 0 }}>
              Aún no tenés sitios
            </h2>
            <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.5 }}>
              Creá tu primer sitio web para tu hotel en pocos pasos. Te vamos a guiar durante todo el proceso.
            </p>
            <button
              onClick={openWizard}
              className="flex items-center gap-1.5 px-4 h-9 transition-opacity hover:opacity-85"
              style={{ background: "var(--brand)", borderRadius: "var(--radius-nav)", fontSize: "var(--font-size-md)", fontWeight: 500, color: "#fff" }}
            >
              <Plus size={13} />
              Crear primer sitio
            </button>
          </div>
        </div>
      ) : (
        <div style={{ padding: "var(--space-5)", maxWidth: 1080, margin: "0 auto" }}>
          {/* Stat cards — 2 operacionales + 2 comerciales que muestran valor del plan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard
              label="Sitios totales"
              value={sites.length}
              icon={Globe}
              tone="neutral"
            />
            <StatCard
              label="Sitios activos"
              value={activeSites.length}
              icon={Eye}
              tone="success"
            />
            <StatCard
              label="Buscadores activos"
              value={buscadoresCurrent}
              icon={Search}
              tone={schemaActive ? "success" : "info"}
              progress={{ current: buscadoresCurrent, total: buscadoresTotal }}
              hint={buscadoresHint}
              onHintClick={!schemaActive ? openWizard2 : undefined}
            />
            <StatCard
              label="Idiomas activos"
              value={idiomasCount}
              icon={idiomasCount > 1 ? Sparkles : Languages}
              tone={idiomasCount > 1 ? "success" : "warning"}
              progress={{ current: idiomasCount, total: idiomasTotal }}
              hint={idiomasHint}
              onHintClick={idiomasCount === 1 ? openWizard2 : undefined}
            />
          </div>

          {/* Acciones rápidas — dos grupos: Crear e Ir a (preguntan el sitio) */}
          <section aria-labelledby="quick-actions-title" className="mb-6">
            <h2
              id="quick-actions-title"
              style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 12px" }}
            >
              Acciones rápidas
            </h2>

            <QuickActionGroup
              title="Crear"
              actions={CREATE_ACTIONS}
              subtitle="Nuevo en un sitio"
              onRun={runQuickAction}
            />
            <div style={{ height: 12 }} />
            <QuickActionGroup
              title="Ir a"
              actions={NAV_ACTIONS}
              subtitle="Ir al sitio"
              onRun={runQuickAction}
            />
          </section>

          {/* Setup Progress Card — solo si hay draft del W2 */}
          {wizard2Draft && (
            <SetupProgressCard
              draft={wizard2Draft}
              onContinue={openWizard2}
              trialDay={trialDay}
              trialTotalDays={trialTotalDays}
            />
          )}

          {/* Calendario comercial — fechas clave del eCommerce para preparar campañas */}
          <CommercialCalendarCard navigate={navigate} openCreatePopupWith={openCreatePopupWith} />

          {/* Sites section */}
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
              Tus Sitios
            </h2>
            <button
              onClick={() => navigate("mis-sitios")}
              className="px-3 h-7 transition-opacity hover:opacity-75"
              style={{ background: "var(--surface-card)", border: "0.5px solid var(--border-ui)", borderRadius: "var(--radius-nav)", fontSize: "var(--font-size-md)", color: "var(--text-secondary)" }}
            >
              Ver todos
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {previewSites.map((site) => (
              <SiteGradientCard
                key={site.id}
                site={site}
                onEdit={() =>
                  site.status === "pending"
                    ? openWizardAt(site.wizardStep ?? 1, site)
                    : navigate("paginas", site.id)
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Selector de sitio para acciones rápidas */}
      {pendingAction && (
        <SitePickerDialog
          action={{ label: pendingAction.label, Icon: pendingAction.Icon }}
          sites={activeSites}
          onPick={(siteId) => {
            dispatchAction(pendingAction, siteId);
            setPendingAction(null);
          }}
          onClose={() => setPendingAction(null)}
        />
      )}
    </main>
  );
}
