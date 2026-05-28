import { HOTEL_IMAGES } from "../../../wizard/preview/hotelImages";
import type { PageSection, PageState } from "../../../../types/creation";

interface Props {
  state: PageState;
}

interface SectionRender {
  id: PageSection;
  label: string;
}

const SECTION_LABELS: Record<PageSection, string> = {
  hero: "Hero · imagen + título",
  gallery: "Galería de fotos",
  "text-image": "Texto & imagen",
  "contact-form": "Formulario de contacto",
  rooms: "Habitaciones",
  cta: "CTA",
};

export function PagePreview({ state }: Props) {
  const sections = state.sections;
  const hasSections = sections.length > 0;

  return (
    <div className="flex items-start justify-center w-full h-full" style={{ padding: 24 }}>
      <div
        className="overflow-hidden flex flex-col"
        style={{
          width: 360,
          maxWidth: "100%",
          background: "#fff",
          borderRadius: 8,
          border: "0.5px solid var(--border-ui)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        {/* Site nav */}
        <div
          className="flex items-center justify-between"
          style={{
            background: "#fff",
            height: 32,
            padding: "0 12px",
            borderBottom: "0.5px solid #f0f0f0",
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--brand)" }}>HOTEL</span>
          <div className="flex items-center" style={{ gap: 10, fontSize: 8, color: "var(--text-secondary)" }}>
            <span>INICIO</span>
            <span>HABITACIONES</span>
            <span>{state.name || "Nueva página"}</span>
            <span>CONTACTO</span>
          </div>
        </div>

        {/* URL bar */}
        <div
          className="flex items-center"
          style={{
            background: "#f6f6f6",
            padding: "4px 12px",
            borderBottom: "0.5px solid #f0f0f0",
            fontSize: 8,
            color: "var(--text-tertiary)",
          }}
        >
          academiapx.com/{state.slug || "tu-pagina"}
        </div>

        {/* Contenido — si no hay secciones, muestra placeholder */}
        {!hasSections ? (
          <div
            className="flex items-center justify-center"
            style={{
              minHeight: 280,
              padding: 16,
            }}
          >
            <div
              aria-hidden="true"
              className="flex items-center justify-center text-center"
              style={{
                width: "100%",
                minHeight: 200,
                border: "1.5px dashed var(--border-ui)",
                borderRadius: 6,
                padding: 16,
                background: "var(--surface-page)",
              }}
            >
              <p style={{ fontSize: 10, color: "var(--text-tertiary)", lineHeight: 1.5 }}>
                Tu nueva página aparecerá aquí.
                <br />
                Agregá secciones en el paso 2.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {sections.map((sec, idx) => (
              <SectionPreviewBlock key={`${sec}-${idx}`} section={sec} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionPreviewBlock({ section }: { section: PageSection }) {
  if (section === "hero") {
    return (
      <div
        className="relative flex flex-col items-center justify-center"
        style={{
          minHeight: 90,
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
        <div className="relative" style={{ padding: 12, textAlign: "center", zIndex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
            {SECTION_LABELS.hero.split("·")[0].trim()}
          </p>
        </div>
      </div>
    );
  }
  if (section === "gallery") {
    return (
      <div style={{ padding: 8, borderBottom: "0.5px solid #f0f0f0" }}>
        <p style={{ fontSize: 7, color: "var(--text-tertiary)", letterSpacing: "0.08em", marginBottom: 4, textTransform: "uppercase" }}>
          Galería
        </p>
        <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {HOTEL_IMAGES.gallery.map((src, i) => (
            <div
              key={i}
              aria-hidden="true"
              style={{
                aspectRatio: "1",
                backgroundImage: `url(${src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: 3,
              }}
            />
          ))}
        </div>
      </div>
    );
  }
  if (section === "rooms") {
    return (
      <div style={{ padding: 8, borderBottom: "0.5px solid #f0f0f0" }}>
        <p style={{ fontSize: 7, color: "var(--text-tertiary)", letterSpacing: "0.08em", marginBottom: 4, textTransform: "uppercase" }}>
          Habitaciones
        </p>
        <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{
                background: "var(--surface-page)",
                borderRadius: 3,
                padding: 4,
                fontSize: 7,
                color: "var(--text-secondary)",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  height: 28,
                  backgroundImage: `url(${HOTEL_IMAGES.rooms[i]})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: 2,
                  marginBottom: 3,
                }}
              />
              Habitación
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (section === "text-image") {
    return (
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: "1fr 1fr", padding: 8, borderBottom: "0.5px solid #f0f0f0" }}
      >
        <div
          aria-hidden="true"
          style={{
            aspectRatio: "1.4",
            backgroundImage: `url(${HOTEL_IMAGES.gallery[2]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: 3,
          }}
        />
        <div className="flex flex-col" style={{ gap: 2 }}>
          <span style={{ height: 4, width: "70%", background: "#d1d1d1", borderRadius: 1 }} />
          <span style={{ height: 3, width: "100%", background: "#e5e5e5", borderRadius: 1 }} />
          <span style={{ height: 3, width: "95%", background: "#e5e5e5", borderRadius: 1 }} />
          <span style={{ height: 3, width: "60%", background: "#e5e5e5", borderRadius: 1 }} />
        </div>
      </div>
    );
  }
  if (section === "contact-form") {
    return (
      <div style={{ padding: 8, borderBottom: "0.5px solid #f0f0f0" }}>
        <p style={{ fontSize: 7, color: "var(--text-tertiary)", letterSpacing: "0.08em", marginBottom: 4, textTransform: "uppercase" }}>
          Contacto
        </p>
        <div className="flex flex-col" style={{ gap: 3 }}>
          <div style={{ height: 14, background: "var(--surface-page)", border: "0.5px solid #e5e5e5", borderRadius: 2 }} />
          <div style={{ height: 14, background: "var(--surface-page)", border: "0.5px solid #e5e5e5", borderRadius: 2 }} />
          <div style={{ height: 28, background: "var(--surface-page)", border: "0.5px solid #e5e5e5", borderRadius: 2 }} />
          <div style={{ height: 18, background: "var(--brand)", borderRadius: 2 }} />
        </div>
      </div>
    );
  }
  // cta
  return (
    <div
      className="flex flex-col items-center"
      style={{
        padding: 12,
        background: "var(--text-primary)",
        gap: 4,
        textAlign: "center",
      }}
    >
      <span style={{ fontSize: 9, fontWeight: 600, color: "#fff" }}>Reservá directo</span>
      <span
        style={{
          background: "var(--brand)",
          color: "#fff",
          fontSize: 8,
          fontWeight: 600,
          padding: "3px 8px",
          borderRadius: 10,
        }}
      >
        Ver habitaciones
      </span>
    </div>
  );
}
