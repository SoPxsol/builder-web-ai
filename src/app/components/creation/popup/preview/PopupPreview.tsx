import { X } from "lucide-react";
import type { PopupState } from "../../../../types/creation";

interface Props {
  state: PopupState;
}

const POSITION_STYLES: Record<PopupState["position"], React.CSSProperties> = {
  "top-left": { top: 16, left: 16 },
  "top-center": { top: 16, left: "50%", transform: "translateX(-50%)" },
  "top-right": { top: 16, right: 16 },
  "middle-left": { top: "50%", left: 16, transform: "translateY(-50%)" },
  center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
  "middle-right": { top: "50%", right: 16, transform: "translateY(-50%)" },
  "bottom-left": { bottom: 16, left: 16 },
  "bottom-center": { bottom: 16, left: "50%", transform: "translateX(-50%)" },
  "bottom-right": { bottom: 16, right: 16 },
};

export function PopupPreview({ state }: Props) {
  return (
    <div
      className="flex items-center justify-center w-full h-full"
      style={{ padding: 24 }}
    >
      <div
        className="relative overflow-hidden flex flex-col"
        style={{
          width: 480,
          maxWidth: "100%",
          height: 360,
          background: "linear-gradient(135deg, #4a90c4 0%, #1a365d 100%)",
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        {/* Site navbar */}
        <div
          className="flex items-center justify-between"
          style={{
            background: "#fff",
            height: 36,
            padding: "0 16px",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--brand)" }}>HOTEL</span>
          <div className="flex items-center" style={{ gap: 12, fontSize: 9, color: "var(--text-secondary)" }}>
            <span>INICIO</span>
            <span>HABITACIONES</span>
            <span>RESERVAS</span>
            <span>CONTACTO</span>
          </div>
        </div>

        {/* Overlay */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 36,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(180,190,210,0.68)",
          }}
        />

        {/* Popup card */}
        <div
          style={{
            position: "absolute",
            ...POSITION_STYLES[state.position],
            width: 190,
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          }}
        >
          {/* Close button */}
          <button
            type="button"
            aria-label="Cerrar popup (preview)"
            tabIndex={-1}
            style={{
              position: "absolute",
              top: -12,
              right: -12,
              width: 22,
              height: 22,
              background: "#fff",
              border: "0.5px solid var(--border-ui)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "default",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <X size={11} style={{ color: "var(--text-secondary)" }} />
          </button>

          {/* Imagen top */}
          {state.imageUrl ? (
            <img
              src={state.imageUrl}
              alt=""
              style={{
                width: "100%",
                height: 90,
                objectFit: "cover",
                borderTopLeftRadius: 14,
                borderTopRightRadius: 14,
              }}
            />
          ) : (
            <div
              aria-hidden="true"
              style={{
                width: "100%",
                height: 90,
                background: "#d9dde3",
                borderTopLeftRadius: 14,
                borderTopRightRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                fontWeight: 600,
                color: "#737373",
                letterSpacing: "0.1em",
              }}
            >
              ELI
            </div>
          )}

          <div className="flex flex-col" style={{ padding: "12px 14px 14px", gap: 6 }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-primary)",
                lineHeight: 1.3,
              }}
            >
              {state.title || "Título del popup"}
            </p>
            {state.description && (
              <p style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                {state.description}
              </p>
            )}
            <button
              type="button"
              tabIndex={-1}
              style={{
                marginTop: 4,
                height: 28,
                background: "#2C6E5E",
                border: "none",
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 500,
                color: "#fff",
                cursor: "default",
              }}
            >
              {state.ctaText || "Reservar ahora"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
