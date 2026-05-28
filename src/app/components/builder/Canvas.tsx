import type { BuilderTab, ViewportMode } from "../../types/builder";
import { HOTEL_IMAGES } from "../wizard/preview/hotelImages";

interface CanvasProps {
  canvasWidth: number;
  viewport: ViewportMode;
  activeTab: BuilderTab;
  pageName: string;
}

export function Canvas({ canvasWidth, viewport, activeTab, pageName }: CanvasProps) {
  return (
    <div
      className="flex-1 overflow-auto"
      style={{
        background: "var(--bg-canvas, #f0f0f0)",
        padding: 24,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: Math.min(canvasWidth, 1268),
          maxWidth: "100%",
          background: "#fff",
          borderRadius: 8,
          border: "0.5px solid var(--border-ui)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          overflow: "hidden",
          minHeight: 600,
          fontFamily: "var(--font-sans)",
        }}
      >
        {/* Header del sitio simulado */}
        {(activeTab === "header" || activeTab === "page") && <SiteHeader highlighted={activeTab === "header"} />}

        {/* Cuerpo según tab */}
        {activeTab === "page" && <PageBody pageName={pageName} viewport={viewport} />}

        {activeTab === "footer" && <PlaceholderBody label="Editando el footer global del sitio" />}

        {activeTab === "header" && <PlaceholderBody label="Editando el header global del sitio" />}

        {/* Footer del sitio simulado */}
        {(activeTab === "footer" || activeTab === "page") && <SiteFooter highlighted={activeTab === "footer"} />}
      </div>
    </div>
  );
}

function SiteHeader({ highlighted }: { highlighted: boolean }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        height: 56,
        padding: "0 32px",
        background: "#fff",
        borderBottom: "0.5px solid var(--border-ui)",
        outline: highlighted ? "2px solid var(--accent-info)" : "none",
        outlineOffset: -2,
      }}
    >
      <span style={{ fontSize: 16, fontWeight: 700, color: "var(--brand)" }}>HOTEL</span>
      <div className="flex items-center" style={{ gap: 24, fontSize: 11, color: "var(--text-secondary)" }}>
        <span>INICIO</span>
        <span>HABITACIONES</span>
        <span>EXPERIENCIAS</span>
        <span>CONTACTO</span>
      </div>
      <button
        type="button"
        style={{
          height: 28,
          padding: "0 14px",
          background: "var(--brand)",
          border: "none",
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 600,
          color: "#fff",
          cursor: "default",
        }}
      >
        Reservar
      </button>
    </div>
  );
}

function PageBody({ pageName, viewport }: { pageName: string; viewport: ViewportMode }) {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <div
        className="relative flex flex-col items-center justify-center"
        style={{
          minHeight: viewport === "mobile" ? 220 : 320,
          backgroundImage: `url(${HOTEL_IMAGES.hero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#fff",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(150deg, #1a1a2ed9, #e84a2c99)",
          }}
        />
        <div className="relative" style={{ padding: 32, textAlign: "center", zIndex: 1 }}>
          <p style={{ fontSize: 11, opacity: 0.85, letterSpacing: "0.1em", marginBottom: 8, textTransform: "uppercase" }}>
            {pageName === "Inicio" ? "Hotel boutique · Buenos Aires" : pageName}
          </p>
          <h1 style={{ fontSize: viewport === "mobile" ? 22 : 32, fontWeight: 700, textShadow: "0 1px 6px rgba(0,0,0,0.3)", marginBottom: 10 }}>
            Reservá directo, mejor precio
          </h1>
          <p style={{ fontSize: 13, opacity: 0.95, marginBottom: 18, textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
            Desayuno gourmet y atención personalizada en el corazón de Palermo.
          </p>
          <button
            type="button"
            style={{
              height: 36,
              padding: "0 24px",
              background: "#fff",
              border: "none",
              borderRadius: 18,
              fontSize: 12,
              fontWeight: 600,
              color: "var(--brand)",
              cursor: "default",
            }}
          >
            Ver disponibilidad
          </button>
        </div>
      </div>

      {/* Habitaciones */}
      <div style={{ padding: 32 }}>
        <p
          style={{
            fontSize: 10,
            color: "var(--text-tertiary)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Habitaciones
        </p>
        <div
          className="grid"
          style={{
            gridTemplateColumns: viewport === "mobile" ? "1fr" : "repeat(3, 1fr)",
            gap: 14,
          }}
        >
          {HOTEL_IMAGES.rooms.slice(0, 3).map((src, i) => (
            <div
              key={i}
              style={{
                background: "var(--surface-page)",
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  height: 120,
                  backgroundImage: `url(${src})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div style={{ padding: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                  {["Suite Premium", "Habitación Estándar", "Suite Familiar"][i]}
                </p>
                <p style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 2 }}>
                  Desde {["$180", "$120", "$240"][i]}/noche
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Galería */}
      <div style={{ padding: "0 32px 32px" }}>
        <p
          style={{
            fontSize: 10,
            color: "var(--text-tertiary)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Galería
        </p>
        <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {HOTEL_IMAGES.gallery.map((src, i) => (
            <div
              key={i}
              aria-hidden="true"
              style={{
                aspectRatio: "1.2",
                backgroundImage: `url(${src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: 4,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SiteFooter({ highlighted }: { highlighted: boolean }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: "20px 32px",
        background: "var(--text-primary)",
        color: "#fff",
        outline: highlighted ? "2px solid var(--accent-info)" : "none",
        outlineOffset: -2,
      }}
    >
      <div className="flex flex-col" style={{ gap: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--brand)" }}>HOTEL</span>
        <span style={{ fontSize: 10, opacity: 0.7 }}>© 2026 · Todos los derechos reservados</span>
      </div>
      <div className="flex items-center" style={{ gap: 16, fontSize: 10, opacity: 0.8 }}>
        <span>Términos</span>
        <span>Privacidad</span>
        <span>Contacto</span>
      </div>
    </div>
  );
}

function PlaceholderBody({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        minHeight: 280,
        padding: 24,
        background: "var(--surface-page)",
      }}
    >
      <p
        style={{
          fontSize: 12,
          color: "var(--text-tertiary)",
          textAlign: "center",
          maxWidth: 360,
          lineHeight: 1.5,
        }}
      >
        {label}. Los cambios se aplican a todas las páginas del sitio.
      </p>
    </div>
  );
}
