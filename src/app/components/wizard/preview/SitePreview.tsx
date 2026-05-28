import type { PreviewBreakpoint, WizardState } from "../../../types/wizard";
import { HOTEL_IMAGES, getRoomImage } from "./hotelImages";

interface Props {
  state: WizardState;
  breakpoint: PreviewBreakpoint;
}

const FRAME_WIDTH: Record<PreviewBreakpoint, number> = {
  desktop: 380,
  tablet: 280,
  mobile: 175,
};

export function SitePreview({ state, breakpoint }: Props) {
  const width = FRAME_WIDTH[breakpoint];
  const { identity, info } = state;
  const showPhotoBadge = identity.photoState !== "loaded";

  return (
    <div className="flex items-start justify-center w-full h-full overflow-y-auto" style={{ padding: 24 }}>
      <div
        className="overflow-hidden flex flex-col"
        style={{
          width,
          maxWidth: "100%",
          background: "#fff",
          borderRadius: 8,
          border: "1px solid var(--border-ui)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{
            background: identity.colorSecondary,
            height: 32,
            padding: "0 12px",
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: "var(--font-size-sm)",
              fontWeight: 600,
              maxWidth: "60%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {info.hotelName || "Tu hotel"}
          </span>
          {breakpoint !== "mobile" && (
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 8, letterSpacing: "0.05em" }}>
              INICIO · ROOMS · CONTACTO
            </span>
          )}
        </div>

        {/* Hero con foto real + overlay del color primario */}
        <div
          className="relative flex flex-col items-center justify-center"
          style={{
            minHeight: 160,
            backgroundImage: `url(${HOTEL_IMAGES.hero})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(150deg, ${identity.colorSecondary}d9, ${identity.colorPrimary}b3)`,
            }}
          />
          {showPhotoBadge && (
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                background: "rgba(255,255,255,0.9)",
                color: "var(--wizard-amber-text)",
                fontSize: 8,
                fontWeight: 500,
                padding: "2px 6px",
                borderRadius: 3,
                border: "1px solid var(--wizard-amber-border-strong)",
                zIndex: 2,
              }}
            >
              Foto de ejemplo
            </span>
          )}
          <div
            className="relative flex flex-col items-center"
            style={{ padding: 16, textAlign: "center", color: "#fff", zIndex: 1 }}
          >
            <p style={{ fontSize: "var(--font-size-md)", fontWeight: 700, lineHeight: 1.2, textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
              {info.hotelName || "Tu hotel"}
            </p>
            {breakpoint !== "mobile" && (
              <p style={{ fontSize: 9, opacity: 0.95, marginTop: 4, lineHeight: 1.3, textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
                Reservá directo y obtené el mejor precio
              </p>
            )}
            <span
              className="inline-flex items-center"
              style={{
                marginTop: 10,
                background: "#fff",
                color: identity.colorPrimary,
                fontSize: 9,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 12,
              }}
            >
              Reservar ahora
            </span>
          </div>
        </div>

        {/* Habitaciones con foto real cuando hay nombres cargados */}
        {state.rooms.names.some((n) => n.trim()) && (
          <div style={{ padding: 12, borderBottom: "1px solid var(--border-ui)" }}>
            <p style={{ fontSize: 8, color: "var(--text-tertiary)", letterSpacing: "0.08em", marginBottom: 6 }}>
              HABITACIONES
            </p>
            <div className="flex flex-col" style={{ gap: 6 }}>
              {state.rooms.names
                .map((n, originalIdx) => ({ name: n, originalIdx }))
                .filter(({ name }) => name.trim())
                .slice(0, 3)
                .map(({ name, originalIdx }) => (
                  <div
                    key={originalIdx}
                    className="flex items-center overflow-hidden"
                    style={{
                      background: "var(--surface-page)",
                      borderRadius: 4,
                      gap: 8,
                    }}
                  >
                    <div
                      aria-hidden="true"
                      style={{
                        width: 44,
                        height: 32,
                        backgroundImage: `url(${getRoomImage(originalIdx)})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ flex: 1, fontSize: 9, color: "var(--text-primary)", padding: "4px 0" }}>
                      {name}
                    </span>
                    <span
                      style={{
                        color: identity.colorPrimary,
                        fontWeight: 600,
                        fontSize: 9,
                        paddingRight: 6,
                      }}
                    >
                      Ver →
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Galería con imágenes reales de hotelería */}
        <div style={{ padding: 12 }}>
          <p style={{ fontSize: 8, color: "var(--text-tertiary)", letterSpacing: "0.08em", marginBottom: 6 }}>
            GALERÍA
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
                  background:
                    /* Fallback de color del template si la imagen no carga */
                    `url(${src}) center/cover, ${identity.colorPrimary}22`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Contacto (si hay email o phone) */}
        {(info.email || info.phone) && (
          <div style={{ padding: 12, borderTop: "1px solid var(--border-ui)" }}>
            <p style={{ fontSize: 8, color: "var(--text-tertiary)", letterSpacing: "0.08em", marginBottom: 4 }}>
              CONTACTO
            </p>
            {info.email && <p style={{ fontSize: 9, color: "var(--text-secondary)" }}>{info.email}</p>}
            {info.phone && <p style={{ fontSize: 9, color: "var(--text-secondary)" }}>{info.phone}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
