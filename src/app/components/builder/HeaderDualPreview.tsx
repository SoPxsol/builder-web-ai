import { Menu, Search } from "lucide-react";
import { BUILDER_COPY } from "./copy";
import { hasBottomBar, type HeaderConfig, type MobileLayout } from "./HeaderPanel";

const H = BUILDER_COPY.header;

interface HeaderDualPreviewProps {
  config: HeaderConfig;
}

/**
 * Preview dual de la pestaña Header: muestra escritorio y mobile a la vez,
 * sin usar el switcher de dispositivos. La vista escritorio NO cambia con las
 * opciones de mobile; el frame mobile refleja en vivo la disposición elegida.
 */
export function HeaderDualPreview({ config }: HeaderDualPreviewProps) {
  const { disposicion, busquedaColapsable } = config.mobile;

  return (
    <div
      className="flex-1 overflow-auto"
      style={{ background: "var(--editor-canvas, #f0f0f0)", padding: 24 }}
    >
      <div className="flex flex-col items-center" style={{ gap: 28, maxWidth: 920, margin: "0 auto" }}>
        {/* ── Vista escritorio ───────────────────────────────────────────── */}
        <section className="flex flex-col w-full" style={{ gap: 8 }}>
          <PreviewLabel icon="🖥" text={H.preview.desktop} />
          <div
            style={{
              width: "100%",
              background: "#fff",
              borderRadius: 8,
              border: "0.5px solid var(--border-ui)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              overflow: "hidden",
            }}
          >
            <DesktopHeader />
            <FakeBody height={120} />
          </div>
        </section>

        {/* ── Vista mobile ───────────────────────────────────────────────── */}
        <section className="flex flex-col items-center" style={{ gap: 8 }}>
          <PreviewLabel icon="📱" text={H.preview.mobile} />
          <PhoneFrame>
            <MobileHeader layout={disposicion} searchCollapsed={busquedaColapsable} />
          </PhoneFrame>
        </section>
      </div>
    </div>
  );
}

/* ─── Etiqueta de cada preview ───────────────────────────────────────────── */
function PreviewLabel({ icon, text }: { icon: string; text: string }) {
  return (
    <p className="flex items-center" style={{ gap: 6, fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>
      <span aria-hidden="true">{icon}</span>
      {text}
    </p>
  );
}

/* ─── Header escritorio (no cambia con mobile) ───────────────────────────── */
function DesktopHeader() {
  return (
    <div
      className="flex items-center justify-between"
      style={{ height: 52, padding: "0 28px", borderBottom: "0.5px solid var(--border-ui)" }}
    >
      <span style={{ fontSize: 16, fontWeight: 700, color: "var(--brand)" }}>HOTEL</span>
      <div className="flex items-center" style={{ gap: 22, fontSize: 11, color: "var(--text-secondary)" }}>
        <span>INICIO</span>
        <span>HABITACIONES</span>
        <span>EXPERIENCIAS</span>
        <span>CONTACTO</span>
      </div>
      <span style={brandPillStyle}>Reservar</span>
    </div>
  );
}

/* ─── Frame de teléfono ──────────────────────────────────────────────────── */
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-hidden="false"
      style={{
        width: 300,
        height: 500,
        background: "#fff",
        border: "8px solid #1a1a1a",
        borderRadius: 30,
        overflow: "hidden",
        boxShadow: "0 8px 28px rgba(0,0,0,0.22)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Notch decorativo */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 90,
          height: 16,
          background: "#1a1a1a",
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          zIndex: 2,
        }}
      />
      {children}
    </div>
  );
}

/* ─── Header mobile según disposición ────────────────────────────────────── */
function MobileHeader({ layout, searchCollapsed }: { layout: MobileLayout; searchCollapsed: boolean }) {
  const topBar = layout === "superior" || layout === "ambas";
  const bottomBar = hasBottomBar(layout);
  const hamburgerTop = layout === "superior";

  return (
    <div className="flex flex-col" style={{ flex: 1, minHeight: 0 }}>
      {/* Barra superior */}
      {topBar ? (
        <div
          className="flex items-center justify-between"
          style={{ height: 44, padding: "0 14px", paddingTop: 14, borderBottom: "0.5px solid var(--border-ui)", flexShrink: 0 }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--brand)" }}>HOTEL</span>
          {/* ☰ arriba sólo en "Superior"; en "Ambas" el menú está abajo. */}
          <span
            aria-hidden="true"
            className="flex items-center justify-center"
            style={{ width: 26, height: 26, transition: "opacity 0.2s ease", opacity: hamburgerTop ? 1 : 0 }}
          >
            <Menu size={16} style={{ color: "var(--text-primary)" }} />
          </span>
        </div>
      ) : (
        // "Inferior": top mínimo, sólo logo.
        <div className="flex items-center" style={{ height: 40, padding: "14px 14px 0", flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--brand)" }}>HOTEL</span>
        </div>
      )}

      {/* Cuerpo simulado */}
      <FakeBody grow />

      {/* Barra inferior (Ambas / Inferior) */}
      {bottomBar && (
        <div
          role="navigation"
          aria-label="Barra de navegación inferior"
          className="flex items-center justify-around"
          style={{
            height: 52,
            padding: "0 8px",
            borderTop: "0.5px solid var(--border-ui)",
            background: "#fff",
            flexShrink: 0,
          }}
        >
          <BottomItem icon={<Menu size={16} aria-hidden="true" />} label={H.bottomBar.menu} />
          {searchCollapsed ? (
            <BottomItem icon={<Search size={16} aria-hidden="true" />} label={H.bottomBar.search} />
          ) : (
            <ExpandedSearch />
          )}
          <BottomItem label={H.bottomBar.reservar} brand />
          <BottomItem label={H.bottomBar.contacto} />
        </div>
      )}
    </div>
  );
}

function BottomItem({ icon, label, brand }: { icon?: React.ReactNode; label: string; brand?: boolean }) {
  return (
    <span
      className="flex flex-col items-center"
      style={{ gap: 2, flex: brand ? "0 0 auto" : "1 1 0", minWidth: 0 }}
    >
      {brand ? (
        <span style={{ ...brandPillStyle, height: 26, fontSize: 10, padding: "0 12px" }}>{label}</span>
      ) : (
        <>
          <span style={{ color: "var(--text-secondary)", display: "inline-flex" }}>
            {icon ?? <span style={{ width: 16, height: 16, display: "inline-block" }} />}
          </span>
          <span style={{ fontSize: 8.5, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{label}</span>
        </>
      )}
    </span>
  );
}

/** Buscador expandido (cuando la búsqueda NO es colapsable). */
function ExpandedSearch() {
  return (
    <span
      className="flex items-center"
      style={{
        flex: "2 1 0",
        gap: 5,
        height: 26,
        padding: "0 8px",
        margin: "0 4px",
        background: "var(--surface-page)",
        border: "0.5px solid var(--border-ui)",
        borderRadius: 13,
        color: "var(--text-tertiary)",
        minWidth: 0,
      }}
    >
      <Search size={12} aria-hidden="true" />
      <span style={{ fontSize: 9, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {H.bottomBar.search}
      </span>
    </span>
  );
}

/* ─── Cuerpo simulado (placeholder neutro) ───────────────────────────────── */
function FakeBody({ height, grow }: { height?: number; grow?: boolean }) {
  return (
    <div
      aria-hidden="true"
      style={{
        flex: grow ? "1 1 0" : undefined,
        height,
        background: "var(--surface-page)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 14,
      }}
    >
      <span style={{ height: 10, width: "60%", background: "var(--border-ui)", borderRadius: 3 }} />
      <span style={{ height: 8, width: "85%", background: "var(--border-ui)", borderRadius: 3, opacity: 0.7 }} />
      <span style={{ height: 8, width: "75%", background: "var(--border-ui)", borderRadius: 3, opacity: 0.5 }} />
    </div>
  );
}

const brandPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 28,
  padding: "0 14px",
  background: "var(--brand)",
  borderRadius: 14,
  fontSize: 11,
  fontWeight: 600,
  color: "#fff",
  whiteSpace: "nowrap",
};
