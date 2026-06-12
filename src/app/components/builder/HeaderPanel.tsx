import { useRef } from "react";
import { Globe, Image, LayoutPanelTop, Menu, MousePointerClick } from "lucide-react";
import { BUILDER_COPY } from "./copy";

const H = BUILDER_COPY.header;

/** Disposición de la navegación en mobile. */
export type MobileLayout = "superior" | "ambas" | "inferior";

/**
 * Configuración del header (spike, estado local en memoria).
 * `contenido` se deja abierto: el prototipo no tiene un modelo real de campos
 * del header (logo/páginas/CTA viven hoy como mock en el canvas). El foco del
 * spike es `mobile`.
 */
export interface HeaderConfig {
  mobile: {
    disposicion: MobileLayout;
    busquedaColapsable: boolean;
  };
}

export const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  mobile: { disposicion: "superior", busquedaColapsable: false },
};

/** ¿La disposición incluye barra inferior? (Ambas / Inferior) */
export function hasBottomBar(layout: MobileLayout): boolean {
  return layout === "ambas" || layout === "inferior";
}

interface HeaderPanelProps {
  config: HeaderConfig;
  onChangeLayout: (layout: MobileLayout) => void;
  onToggleSearch: (value: boolean) => void;
}

const LAYOUT_ORDER: MobileLayout[] = ["superior", "ambas", "inferior"];

export function HeaderPanel({ config, onChangeLayout, onToggleSearch }: HeaderPanelProps) {
  const showConditional = hasBottomBar(config.mobile.disposicion);

  return (
    <aside
      role="complementary"
      aria-label={H.title}
      className="flex flex-col flex-shrink-0 overflow-y-auto"
      style={{
        width: 264,
        background: "var(--surface-page)",
        borderRight: "0.5px solid var(--border-ui)",
      }}
    >
      {/* Encabezado del panel + aviso de alcance. */}
      <div style={{ padding: "14px 14px 12px", borderBottom: "0.5px solid var(--border-ui)" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{H.title}</p>
        <p className="flex items-center" style={{ gap: 5, marginTop: 4, fontSize: 11, color: "var(--text-secondary)" }}>
          <Globe size={12} aria-hidden="true" style={{ color: "var(--accent-info)", flexShrink: 0 }} />
          {H.scopeNote}
        </p>
      </div>

      {/* SECCIÓN 1 — Contenido (campos existentes; mock en el spike). */}
      <Section title={H.sections.content}>
        <ContentRow icon={Image} label={H.contentItems.logo} />
        <ContentRow icon={Menu} label={H.contentItems.pages} />
        <ContentRow icon={MousePointerClick} label={H.contentItems.cta} />
      </Section>

      {/* SECCIÓN 2 — Escritorio (informativa). */}
      <Section title={H.sections.desktop} icon={<LayoutPanelTop size={12} aria-hidden="true" />}>
        <div
          className="flex items-center"
          style={{
            gap: 8,
            padding: "10px 12px",
            background: "#fff",
            border: "0.5px solid var(--border-ui)",
            borderRadius: 7,
            fontSize: 11,
            color: "var(--text-secondary)",
          }}
        >
          <span
            aria-hidden="true"
            style={{ width: 28, height: 16, borderRadius: 3, background: "var(--surface-page)", border: "0.5px solid var(--border-ui)", position: "relative", flexShrink: 0 }}
          >
            <span style={{ position: "absolute", top: 2, left: 2, right: 2, height: 4, borderRadius: 1, background: "var(--text-tertiary)" }} />
          </span>
          {H.desktopInfo}
        </div>
      </Section>

      {/* SECCIÓN 3 — Mobile · Disposición. */}
      <Section title={H.sections.mobile} icon={<span aria-hidden="true" style={{ fontSize: 12 }}>📱</span>}>
        <LayoutRadioGroup
          value={config.mobile.disposicion}
          onChange={onChangeLayout}
        />

        {showConditional && (
          <div className="flex flex-col" style={{ gap: 10, marginTop: 12 }}>
            {/* Aviso de reubicación del menú. */}
            <p
              className="flex items-start"
              style={{
                gap: 6,
                padding: "8px 10px",
                background: "var(--accent-info-bg)",
                borderRadius: 6,
                fontSize: 10.5,
                lineHeight: 1.4,
                color: "var(--accent-info)",
              }}
            >
              <Menu size={12} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
              {H.bottomBarHint}
            </p>

            {/* Toggle Búsqueda colapsable. */}
            <SearchToggle
              checked={config.mobile.busquedaColapsable}
              onChange={onToggleSearch}
            />
          </div>
        )}
      </Section>
    </aside>
  );
}

/* ─── Sección con encabezado uppercase ───────────────────────────────────── */
function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ padding: "12px 14px", borderBottom: "0.5px solid var(--border-ui)" }}>
      <p
        className="flex items-center"
        style={{
          gap: 5,
          fontSize: 10,
          fontWeight: 600,
          color: "var(--text-tertiary)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 10,
        }}
      >
        {icon && <span style={{ color: "var(--text-tertiary)", display: "inline-flex" }}>{icon}</span>}
        {title}
      </p>
      {children}
    </div>
  );
}

/* ─── Fila de contenido (mock) ───────────────────────────────────────────── */
function ContentRow({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button
      type="button"
      className="flex items-center w-full transition-colors hover:bg-[#fff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
      style={{
        gap: 8,
        padding: "8px 10px",
        background: "#fff",
        border: "0.5px solid var(--border-ui)",
        borderRadius: 7,
        marginBottom: 6,
        cursor: "pointer",
        textAlign: "left",
        outlineColor: "var(--accent-info)",
      }}
    >
      <Icon size={13} aria-hidden="true" style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 12, color: "var(--text-primary)" }}>{label}</span>
      <span aria-hidden="true" style={{ fontSize: 12, color: "var(--text-tertiary)" }}>›</span>
    </button>
  );
}

/* ─── Radiogroup de disposición con miniaturas ───────────────────────────── */
function LayoutRadioGroup({ value, onChange }: { value: MobileLayout; onChange: (l: MobileLayout) => void }) {
  const refs = useRef<Record<MobileLayout, HTMLButtonElement | null>>({
    superior: null,
    ambas: null,
    inferior: null,
  });

  function handleKeyDown(e: React.KeyboardEvent) {
    const idx = LAYOUT_ORDER.indexOf(value);
    let nextIdx: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") nextIdx = (idx + 1) % LAYOUT_ORDER.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") nextIdx = (idx - 1 + LAYOUT_ORDER.length) % LAYOUT_ORDER.length;
    if (nextIdx !== null) {
      e.preventDefault();
      const next = LAYOUT_ORDER[nextIdx];
      onChange(next);
      refs.current[next]?.focus();
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={H.layoutGroupAria}
      className="grid"
      style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}
      onKeyDown={handleKeyDown}
    >
      {LAYOUT_ORDER.map((layout) => {
        const selected = value === layout;
        return (
          <button
            key={layout}
            ref={(el) => {
              refs.current[layout] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(layout)}
            className="flex flex-col items-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              gap: 6,
              padding: "10px 6px 8px",
              background: selected ? "var(--accent-info-bg)" : "#fff",
              border: selected ? "1.5px solid var(--accent-info)" : "0.5px solid var(--border-ui)",
              borderRadius: 8,
              cursor: "pointer",
              outlineColor: "var(--accent-info)",
            }}
          >
            <LayoutThumb layout={layout} selected={selected} />
            <span
              style={{
                fontSize: 10.5,
                fontWeight: selected ? 600 : 500,
                color: selected ? "var(--accent-info)" : "var(--text-secondary)",
              }}
            >
              {H.layouts[layout]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Miniatura esquemática de cada disposición ──────────────────────────── */
function LayoutThumb({ layout, selected }: { layout: MobileLayout; selected: boolean }) {
  const bar = selected ? "var(--accent-info)" : "var(--text-tertiary)";
  const frame = selected ? "var(--accent-info)" : "var(--border-ui)";
  const topBar = layout === "superior" || layout === "ambas";
  const bottomBar = layout === "ambas" || layout === "inferior";

  return (
    <span
      aria-hidden="true"
      className="flex flex-col"
      style={{
        width: 34,
        height: 46,
        border: `1px solid ${frame}`,
        borderRadius: 5,
        overflow: "hidden",
        background: "#fff",
        justifyContent: "space-between",
      }}
    >
      <span style={{ height: 7, background: topBar ? bar : "transparent", borderBottom: topBar ? "none" : undefined }} />
      <span style={{ flex: 1 }} />
      <span style={{ height: 7, background: bottomBar ? bar : "transparent" }} />
    </span>
  );
}

/* ─── Toggle Búsqueda colapsable ─────────────────────────────────────────── */
function SearchToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label
      className="flex items-center justify-between"
      style={{
        gap: 8,
        padding: "8px 10px",
        background: "#fff",
        border: "0.5px solid var(--border-ui)",
        borderRadius: 7,
        cursor: "pointer",
      }}
    >
      <span style={{ fontSize: 11.5, color: "var(--text-primary)" }}>{H.searchToggle}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={H.searchToggleAria}
        onClick={() => onChange(!checked)}
        className="flex items-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          width: 34,
          height: 20,
          borderRadius: 10,
          border: "none",
          padding: 2,
          background: checked ? "var(--status-active)" : "var(--border-ui)",
          cursor: "pointer",
          justifyContent: checked ? "flex-end" : "flex-start",
          outlineColor: "var(--accent-info)",
          flexShrink: 0,
        }}
      >
        <span
          aria-hidden="true"
          style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
        />
      </button>
    </label>
  );
}
