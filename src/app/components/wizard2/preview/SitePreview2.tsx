import { memo } from "react";
import type { W2State } from "../../../types/wizard2";
import { HOTEL_IMAGES } from "../../wizard/preview/hotelImages";

interface Props {
  state: W2State;
}

const COLOR_PRIMARY = "#e84a2c";
const COLOR_SECONDARY = "#1a1a2e";

function SitePreview2Inner({ state }: Props) {
  const hotelName = state.profile.hotelName || "Tu hotel";
  const hasMultipleLanguages = state.languages.active.length > 1;
  const hasSeo = !!state.seo.pages.inicio.title;
  const additionalActive = Object.entries(state.additionalPages)
    .filter(([, v]) => v)
    .map(([k]) => k);
  const policyType = state.policies.cancellation.type;
  const anyPayment = Object.values(state.policies.payments).some(Boolean);

  return (
    <div className="flex items-start justify-center w-full h-full overflow-y-auto" style={{ padding: 16 }}>
      <div
        className="overflow-hidden flex flex-col"
        style={{
          width: 280,
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
            background: COLOR_SECONDARY,
            height: 28,
            padding: "0 10px",
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: "var(--font-size-xs)",
              fontWeight: 600,
              maxWidth: "70%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {hotelName}
          </span>
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 7, letterSpacing: "0.05em" }}>
            INICIO · ROOMS · CONTACTO
          </span>
        </div>

        {/* Hero con foto real + overlay */}
        <div
          className="relative flex flex-col items-center justify-center"
          style={{
            minHeight: 120,
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
              background: `linear-gradient(150deg, ${COLOR_SECONDARY}d9, ${COLOR_PRIMARY}99)`,
            }}
          />
          <div
            className="relative flex flex-col items-center"
            style={{ padding: 14, textAlign: "center", color: "#fff", zIndex: 1 }}
          >
            <p style={{ fontSize: "var(--font-size-sm)", fontWeight: 700, textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
              {hotelName}
            </p>
            <span
              className="inline-flex items-center"
              style={{
                marginTop: 8,
                background: "#fff",
                color: COLOR_PRIMARY,
                fontSize: 8,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 12,
              }}
            >
              Reservar ahora
            </span>
          </div>
        </div>

        {/* Idiomas activos */}
        {hasMultipleLanguages && (
          <div
            style={{
              borderTop: "1px solid #f0f0f0",
              padding: 6,
              textAlign: "center",
              background: "#fff",
            }}
          >
            <p style={{ fontSize: 8, fontWeight: 600, color: "#444", marginBottom: 4 }}>
              Disponible en
            </p>
            <div className="flex items-center justify-center flex-wrap" style={{ gap: 3 }}>
              {state.languages.active.map((lang) => (
                <span
                  key={lang}
                  style={{
                    fontSize: 7,
                    padding: "1px 5px",
                    border: "1px solid #eee",
                    borderRadius: 3,
                    color: "#666",
                  }}
                >
                  {lang.toUpperCase()}
                </span>
              ))}
              <span
                style={{
                  fontSize: 7,
                  padding: "1px 5px",
                  border: "1px solid #eee",
                  borderRadius: 3,
                  color: "#666",
                  background: "var(--wizard-blue-light)",
                }}
              >
                {state.languages.currency}
              </span>
            </div>
          </div>
        )}

        {/* Páginas adicionales */}
        {additionalActive.length > 0 && (
          <div
            style={{
              borderTop: "1px solid #f0f0f0",
              padding: 8,
              textAlign: "center",
              background: "#fff",
            }}
          >
            <p style={{ fontSize: 8, fontWeight: 600, color: "#444", marginBottom: 4 }}>Páginas</p>
            <div className="flex items-center justify-center flex-wrap" style={{ gap: 3 }}>
              {["Inicio", "Habitaciones", "Contacto"].map((p) => (
                <span
                  key={p}
                  style={{
                    fontSize: 7,
                    padding: "1px 5px",
                    background: "#f6f6f6",
                    border: "1px solid #eee",
                    borderRadius: 3,
                    color: "#666",
                  }}
                >
                  {p}
                </span>
              ))}
              {additionalActive.map((p) => (
                <span
                  key={p}
                  style={{
                    fontSize: 7,
                    padding: "1px 5px",
                    background: "var(--wizard-success-light)",
                    border: "1px solid var(--wizard-success-border)",
                    borderRadius: 3,
                    color: "var(--wizard-success-dark)",
                    textTransform: "capitalize",
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Galería con imágenes reales */}
        <div style={{ padding: 10, borderTop: "1px solid #f0f0f0" }}>
          <p
            style={{
              fontSize: 7,
              color: "var(--text-tertiary)",
              letterSpacing: "0.08em",
              marginBottom: 4,
              textTransform: "uppercase",
            }}
          >
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
                  background: `url(${src}) center/cover, ${COLOR_PRIMARY}22`,
                }}
              />
            ))}
          </div>
        </div>

        {/* SEO result preview (Google-style) */}
        {hasSeo && (
          <div style={{ borderTop: "1px solid #f0f0f0", padding: 8, background: "#f9f9f9" }}>
            <p
              style={{
                fontSize: 7,
                color: "var(--wizard-google-blue)",
                fontWeight: 500,
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {state.seo.pages.inicio.title}
            </p>
            <p
              style={{
                fontSize: 6,
                color: "var(--wizard-google-green)",
                marginTop: 2,
              }}
            >
              {state.profile.hotelName ? `${state.profile.hotelName.toLowerCase().replace(/\s+/g, "")}.com` : "tu-hotel.com"}
            </p>
            {state.seo.pages.inicio.description && (
              <p
                style={{
                  fontSize: 6,
                  color: "#555",
                  lineHeight: 1.35,
                  marginTop: 2,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {state.seo.pages.inicio.description}
              </p>
            )}
            {state.seo.schemaOrgEnabled && (
              <span
                className="inline-flex items-center"
                style={{
                  marginTop: 4,
                  background: "var(--wizard-success-light)",
                  border: "1px solid var(--wizard-success-border)",
                  borderRadius: 3,
                  padding: "1px 5px",
                  fontSize: 6,
                  color: "var(--wizard-success-dark)",
                  fontWeight: 500,
                }}
              >
                ✓ Schema.org Hotel activo
              </span>
            )}
          </div>
        )}

        {/* Políticas */}
        {policyType && anyPayment && (
          <div style={{ borderTop: "1px solid #f0f0f0", padding: 8, background: "#fffbf5" }}>
            <p style={{ fontSize: 8, fontWeight: 600, color: "#444", marginBottom: 2 }}>Políticas</p>
            <p style={{ fontSize: 7, color: "#666" }}>
              Cancelación {policyType} ·{" "}
              {Object.entries(state.policies.payments)
                .filter(([, v]) => v)
                .map(([k]) => k)
                .map((k) => k.charAt(0).toUpperCase() + k.slice(1))
                .join(" · ")}
            </p>
          </div>
        )}

        {/* Contacto */}
        {(state.profile.email || state.profile.phone) && (
          <div style={{ borderTop: "1px solid #f0f0f0", padding: 8 }}>
            <p
              style={{
                fontSize: 7,
                color: "var(--text-tertiary)",
                letterSpacing: "0.08em",
                marginBottom: 2,
                textTransform: "uppercase",
              }}
            >
              Contacto
            </p>
            {state.profile.email && (
              <p style={{ fontSize: 7, color: "var(--text-secondary)" }}>{state.profile.email}</p>
            )}
            {state.profile.phone && (
              <p style={{ fontSize: 7, color: "var(--text-secondary)" }}>{state.profile.phone}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Memoizado: el preview se re-renderiza solo si la prop `state` cambia por
// referencia. App.tsx + W2 ya mantienen referencias estables, así que navegar
// entre secciones sin tocar el state no re-renderiza el preview.
export const SitePreview2 = memo(SitePreview2Inner);
