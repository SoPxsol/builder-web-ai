import { useState } from "react";
import {
  Bed,
  Check,
  Clock,
  Image as ImageIcon,
  Link as LinkIcon,
  MessageCircle,
  Palette,
  Settings,
} from "lucide-react";
import type { StepIndex, WizardState } from "../../../types/wizard";
import { TEMPLATES } from "../../../types/wizard";

interface Props {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  /** Trigger del CTA secundario "Ir a configuración completa" → abre W2. */
  onGoToWizard2?: () => void;
  trialDay?: number;
  trialTotalDays?: number;
}

const NPS_LABELS: Record<number, string> = {
  0: "Tocá una estrella",
  1: "Muy difícil",
  2: "Difícil",
  3: "Regular",
  4: "Fácil",
  5: "¡Muy fácil!",
};

const WIZARD2_ITEMS = [
  "Fotos de cada habitación",
  "Amenities y servicios incluidos",
  "Tarifas por temporada",
  "Términos y condiciones de reserva",
  "Conectar pasarela de pagos",
];

export function Step5Summary({ state, update, onGoToWizard2, trialDay = 1, trialTotalDays = 14 }: Props) {
  const trialProgress = Math.round((trialDay / trialTotalDays) * 100);
  const [copied, setCopied] = useState(false);
  const template = TEMPLATES[state.selectedTemplate];

  function setNps(rating: number) {
    if (rating < 0 || rating > 5) return;
    update({ summary: { ...state.summary, npsRating: rating as 0 | 1 | 2 | 3 | 4 | 5 } });
  }

  function copyLink() {
    const slug = state.info.domain || "tu-hotel";
    void navigator.clipboard?.writeText(`https://${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    update({ summary: { ...state.summary, shared: true } });
  }

  const roomsLabel =
    state.rooms.count === 1 ? "1 tipo" : `${state.rooms.count} tipos`;

  return (
    <div className="flex flex-col" style={{ padding: "20px 24px", gap: 14 }}>
      <div>
        <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)" }}>
          Tu sitio está listo 🎉
        </p>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", marginTop: 4 }}>
          Revisá el resumen, compartilo con tu equipo y publicalo.
        </p>
      </div>

      {/* Trial counter */}
      <div
        className="flex items-center"
        style={{
          background: "var(--wizard-amber-light)",
          border: "1px solid var(--wizard-amber-border-strong)",
          borderRadius: 6,
          padding: "8px 12px",
          gap: 10,
        }}
      >
        <Clock size={13} aria-hidden="true" style={{ color: "var(--wizard-amber-accent)", flexShrink: 0 }} />
        <div
          role="progressbar"
          aria-valuenow={trialDay}
          aria-valuemin={0}
          aria-valuemax={trialTotalDays}
          aria-label={`Día ${trialDay} de ${trialTotalDays} del trial`}
          className="flex-1"
          style={{ height: 4, background: "var(--wizard-amber-border)", borderRadius: 2, overflow: "hidden" }}
        >
          <div style={{ width: `${trialProgress}%`, height: "100%", background: "var(--wizard-amber-accent)" }} />
        </div>
        <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--wizard-amber-text)" }}>
          Día {trialDay} de {trialTotalDays} del trial
        </span>
      </div>

      {/* Summary block */}
      <div
        style={{
          border: "1px solid var(--border-ui)",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        {([
          { icon: Palette,   label: "Plantilla",    value: template.label,                                                       step: 1 as StepIndex },
          { icon: ImageIcon, label: "Logo",         value: state.identity.logoState === "loaded" ? "Cargado" : "Pendiente",     step: 2 as StepIndex },
          { icon: Settings,  label: "Hotel",        value: state.info.hotelName || "Sin nombre",                                step: 3 as StepIndex },
          { icon: Bed,       label: "Habitaciones", value: roomsLabel,                                                          step: 4 as StepIndex },
        ]).map((row, idx, arr) => (
          <div
            key={row.label}
            className="flex items-center"
            style={{
              padding: "8px 12px",
              gap: 8,
              borderBottom: idx < arr.length - 1 ? "1px solid var(--border-ui)" : "none",
            }}
          >
            <row.icon size={13} style={{ color: "var(--text-secondary)", flexShrink: 0 }} aria-hidden="true" />
            <span style={{ width: 80, fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
              {row.label}
            </span>
            <span
              style={{
                flex: 1,
                fontSize: "var(--font-size-sm)",
                fontWeight: 500,
                color: "var(--text-primary)",
              }}
            >
              {row.value}
            </span>
            <button
              type="button"
              onClick={() => update({ currentStep: row.step })}
              aria-label={`Editar ${row.label} — volver al paso ${row.step}`}
              className="transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: "transparent",
                border: "none",
                fontSize: "var(--font-size-sm)",
                color: "var(--accent-info)",
                cursor: "pointer",
                padding: "2px 4px",
                borderRadius: 3,
                outlineColor: "var(--accent-info)",
              }}
            >
              Editar
            </button>
          </div>
        ))}
      </div>

      {/* Share */}
      <div
        style={{
          border: "1px solid var(--border-ui)",
          borderRadius: 6,
          padding: 12,
          background: "var(--surface-page)",
        }}
      >
        <p
          style={{
            fontSize: "var(--font-size-md)",
            fontWeight: 500,
            color: "var(--text-primary)",
            marginBottom: 8,
          }}
        >
          ¿Querés que alguien de tu equipo lo vea?
        </p>
        <div className="flex" style={{ gap: 8 }}>
          <button
            type="button"
            onClick={copyLink}
            className="flex items-center justify-center flex-1 transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              height: 30,
              padding: "0 12px",
              background: "#fff",
              border: "1px solid var(--border-ui)",
              borderRadius: 5,
              fontSize: "var(--font-size-sm)",
              fontWeight: 500,
              color: "var(--text-primary)",
              cursor: "pointer",
              gap: 6,
              outlineColor: "var(--accent-info)",
            }}
          >
            <LinkIcon size={11} aria-hidden="true" />
            {copied ? "¡Copiado! ✓" : "Copiar link"}
          </button>
          <button
            type="button"
            onClick={shareWhatsApp}
            className="flex items-center justify-center flex-1 transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              height: 30,
              padding: "0 12px",
              background: "var(--wizard-wa-bg)",
              border: "1px solid var(--wizard-wa-border)",
              borderRadius: 5,
              fontSize: "var(--font-size-sm)",
              fontWeight: 500,
              color: "var(--wizard-wa-text)",
              cursor: "pointer",
              gap: 6,
              outlineColor: "var(--accent-info)",
            }}
          >
            <MessageCircle size={11} aria-hidden="true" />
            Compartir por WhatsApp
          </button>
        </div>
      </div>

      {/* NPS */}
      <div
        style={{
          border: "1px solid var(--border-ui)",
          borderRadius: 6,
          padding: 12,
          background: "var(--surface-page)",
        }}
      >
        <p
          style={{
            fontSize: "var(--font-size-md)",
            fontWeight: 500,
            color: "var(--text-primary)",
            marginBottom: 8,
          }}
        >
          ¿Cómo fue el proceso de configuración?
        </p>
        <div className="flex items-center" style={{ gap: 2 }}>
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= state.summary.npsRating;
            return (
              <button
                key={star}
                type="button"
                onClick={() => setNps(star)}
                aria-label={`${star} ${star === 1 ? "estrella" : "estrellas"}`}
                aria-pressed={filled}
                className="transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 22,
                  lineHeight: 1,
                  color: filled ? "var(--wizard-amber-accent)" : "var(--border-ui)",
                  cursor: "pointer",
                  padding: 2,
                  outlineColor: "var(--accent-info)",
                  borderRadius: 4,
                }}
              >
                ★
              </button>
            );
          })}
        </div>
        <p
          aria-live="polite"
          style={{ marginTop: 4, fontSize: 10, color: "var(--text-secondary)" }}
        >
          {NPS_LABELS[state.summary.npsRating]}
        </p>
      </div>

      {/* Entry Wizard 2 */}
      <div style={{ border: "1px solid var(--border-ui)", borderRadius: 6, overflow: "hidden" }}>
        <div
          className="flex items-center"
          style={{
            background: "var(--surface-page)",
            padding: "8px 12px",
            gap: 8,
            borderBottom: "1px solid var(--border-ui)",
          }}
        >
          <Settings size={13} style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
          <span style={{ fontSize: "var(--font-size-md)", fontWeight: 500, color: "var(--text-primary)" }}>
            Configuración completa · ~25 min
          </span>
          <span
            style={{
              marginLeft: "auto",
              background: "var(--accent-info-bg)",
              border: "1px solid var(--accent-info)",
              borderRadius: 3,
              fontSize: 9,
              fontWeight: 500,
              color: "var(--accent-info)",
              padding: "1px 6px",
            }}
          >
            Wizard 2
          </span>
        </div>
        <div style={{ padding: "10px 12px", fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
          <ul className="flex flex-col" style={{ gap: 4, listStyle: "none", padding: 0, margin: 0 }}>
            {WIZARD2_ITEMS.map((item) => (
              <li key={item} className="flex items-center" style={{ gap: 6 }}>
                <Check size={10} style={{ color: "var(--text-tertiary)" }} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onGoToWizard2}
            disabled={!onGoToWizard2}
            className="flex items-center justify-center w-full transition-opacity hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              marginTop: 10,
              height: 30,
              background: "var(--text-primary)",
              border: "none",
              borderRadius: 5,
              fontSize: "var(--font-size-sm)",
              fontWeight: 500,
              color: "#fff",
              cursor: "pointer",
              outlineColor: "var(--accent-info)",
            }}
          >
            Ir a configuración completa
          </button>
        </div>
      </div>
    </div>
  );
}
