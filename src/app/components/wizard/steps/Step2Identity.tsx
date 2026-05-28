import { Check, Palette } from "lucide-react";
import type { WizardState } from "../../../types/wizard";
import { UploadZone } from "../shared/UploadZone";
import { ColorPicker } from "../shared/ColorPicker";

interface Props {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

// Colores detectados al simular extracción del logo.
const DETECTED_PRIMARY = "#c4923a";
const DETECTED_SECONDARY = "#2a1f1a";

function MicroLogroBanner() {
  return (
    <div
      role="status"
      className="flex items-center gap-2"
      style={{
        background: "var(--wizard-success-light)",
        border: "1px solid var(--wizard-success-border)",
        borderRadius: 6,
        padding: 12,
        marginBottom: 14,
      }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        aria-hidden="true"
        style={{
          width: 20,
          height: 20,
          background: "var(--wizard-success-done)",
          borderRadius: "50%",
        }}
      >
        <Check size={12} style={{ color: "#fff" }} />
      </div>
      <span
        style={{
          fontSize: "var(--font-size-sm)",
          fontWeight: 500,
          color: "var(--wizard-success-dark)",
        }}
      >
        ¡Tu hotel tiene cara propia! El logo ya está aplicado.
      </span>
    </div>
  );
}

export function Step2Identity({ state, update }: Props) {
  const { identity } = state;

  function setLogoState(loaded: boolean) {
    update({
      identity: { ...identity, logoState: loaded ? "loaded" : "empty" },
    });
  }

  function setPhotoState(loaded: boolean) {
    update({
      identity: { ...identity, photoState: loaded ? "loaded" : "placeholder" },
    });
  }

  function detectColors() {
    update({
      identity: {
        ...identity,
        colorPrimary: DETECTED_PRIMARY,
        colorSecondary: DETECTED_SECONDARY,
      },
    });
  }

  return (
    <div className="flex flex-col" style={{ padding: "20px 24px", gap: 14 }}>
      <div>
        <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)" }}>
          Identidad visual del hotel
        </p>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", marginTop: 4 }}>
          Subí el logo y la foto de portada. Definí los colores de tu marca.
        </p>
      </div>

      {/* MicroLogroBanner aparece solo cuando hay logo cargado */}
      {identity.logoState === "loaded" && <MicroLogroBanner />}

      {/* Upload zones: logo + foto */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
        <div className="flex flex-col" style={{ gap: 6 }}>
          <label style={{ fontSize: 10, color: "var(--text-secondary)" }}>Logo del hotel</label>
          <UploadZone
            state={identity.logoState}
            onUpload={() => setLogoState(true)}
            type="logo"
          />
          {identity.logoState === "loaded" && (
            <button
              type="button"
              onClick={() => setLogoState(false)}
              className="self-start transition-opacity hover:opacity-70"
              style={{
                fontSize: 10,
                color: "var(--text-tertiary)",
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Quitar logo
            </button>
          )}
        </div>
        <div className="flex flex-col" style={{ gap: 6 }}>
          <label style={{ fontSize: 10, color: "var(--text-secondary)" }}>Foto de portada</label>
          <UploadZone
            state={identity.photoState}
            onUpload={() => setPhotoState(true)}
            type="photo"
          />
          {identity.photoState === "loaded" && (
            <button
              type="button"
              onClick={() => setPhotoState(false)}
              className="self-start transition-opacity hover:opacity-70"
              style={{
                fontSize: 10,
                color: "var(--text-tertiary)",
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Quitar foto
            </button>
          )}
        </div>
      </div>

      {/* Detectar colores + ColorPickers */}
      <div className="flex flex-col" style={{ gap: 8 }}>
        <button
          type="button"
          onClick={detectColors}
          disabled={identity.logoState !== "loaded"}
          className="flex items-center self-start gap-1 transition-opacity hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: 500,
            color: "var(--accent-info)",
            background: "transparent",
            border: "none",
            padding: "2px 4px",
            cursor: "pointer",
            outlineColor: "var(--accent-info)",
            borderRadius: 4,
          }}
          title={identity.logoState !== "loaded" ? "Subí un logo para detectar colores" : undefined}
        >
          <Palette size={12} />
          Detectar colores del logo
        </button>

        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          <ColorPicker
            label="Color primario"
            value={identity.colorPrimary}
            onChange={(hex) => update({ identity: { ...identity, colorPrimary: hex } })}
          />
          <ColorPicker
            label="Color secundario"
            value={identity.colorSecondary}
            onChange={(hex) => update({ identity: { ...identity, colorSecondary: hex } })}
          />
        </div>
      </div>
    </div>
  );
}
