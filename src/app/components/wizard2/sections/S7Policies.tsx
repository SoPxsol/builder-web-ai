import { useState } from "react";
import { Banknote, CreditCard, FileText, Loader2, Sparkles, Wallet } from "lucide-react";
import type { W2Policies, W2State } from "../../../types/wizard2";
import { POLICY_AI_TEXT } from "../../../types/wizard2";
import { SectionEyebrow } from "../shared/SectionEyebrow";
import { PolicyAccordion } from "../shared/PolicyAccordion";
import { Toggle } from "../shared/Toggle";

interface Props {
  state: W2State;
  update: (patch: Partial<W2State>) => void;
}

const POLICY_TYPES: { value: "flexible" | "moderada" | "estricta"; label: string; subtitle: string }[] = [
  { value: "flexible", label: "Flexible", subtitle: "Cancelación gratuita hasta 72hs antes" },
  { value: "moderada", label: "Moderada", subtitle: "Hasta 48hs · luego cargo parcial" },
  { value: "estricta", label: "Estricta", subtitle: "Sin reembolso después de la reserva" },
];

const PAYMENTS: { key: keyof W2Policies["payments"]; label: string; icon: React.ElementType }[] = [
  { key: "transferencia", label: "Transferencia bancaria", icon: Banknote },
  { key: "efectivo", label: "Efectivo", icon: Wallet },
  { key: "mercadopago", label: "MercadoPago", icon: CreditCard },
  { key: "payway", label: "Payway", icon: CreditCard },
];

export function S7Policies({ state, update }: Props) {
  const { policies } = state;
  const [openAccordion, setOpenAccordion] = useState<string | null>("cancellation");
  const [generatingPolicy, setGeneratingPolicy] = useState(false);

  function setCancellation<K extends keyof W2Policies["cancellation"]>(
    key: K,
    value: W2Policies["cancellation"][K],
  ) {
    update({
      policies: {
        ...policies,
        cancellation: { ...policies.cancellation, [key]: value },
      },
    });
  }

  function togglePayment(key: keyof W2Policies["payments"], value: boolean) {
    update({
      policies: {
        ...policies,
        payments: { ...policies.payments, [key]: value },
      },
    });
  }

  function generatePolicyText() {
    setGeneratingPolicy(true);
    setTimeout(() => {
      setCancellation("text", POLICY_AI_TEXT);
      setGeneratingPolicy(false);
    }, 800);
  }

  return (
    <div className="flex flex-col" style={{ padding: "20px 24px" }}>
      <SectionEyebrow group="grow" id="s7-eyebrow" />

      <div style={{ marginBottom: 14 }} aria-describedby="s7-eyebrow">
        <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)" }}>
          Políticas y medios de pago
        </p>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", marginTop: 4 }}>
          La política flexible aumenta la conversión. Los huéspedes reservan más cuando pueden cancelar sin cargo.
        </p>
      </div>

      <PolicyAccordion
        icon={FileText}
        title="Política de cancelación"
        badge={{ text: "Recomendada", variant: "recommended" }}
        isOpen={openAccordion === "cancellation"}
        onToggle={() => setOpenAccordion((v) => (v === "cancellation" ? null : "cancellation"))}
      >
        {/* Tipo de política */}
        <p style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 6 }}>
          Tipo de política
        </p>
        <div role="radiogroup" aria-label="Tipo de cancelación" className="flex flex-col" style={{ gap: 6, marginBottom: 12 }}>
          {POLICY_TYPES.map((type) => {
            const selected = policies.cancellation.type === type.value;
            return (
              <button
                key={type.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setCancellation("type", type.value)}
                className="flex items-center text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  gap: 10,
                  padding: 8,
                  background: selected ? "var(--accent-info-bg)" : "var(--surface-page)",
                  border: selected ? "1px solid var(--accent-info)" : "1px solid var(--border-ui)",
                  borderRadius: 5,
                  cursor: "pointer",
                  outlineColor: "var(--accent-info)",
                }}
              >
                <span
                  aria-hidden="true"
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: selected ? "var(--accent-info)" : "#fff",
                    border: selected ? "none" : "1.5px solid var(--border-ui)",
                  }}
                >
                  {selected && (
                    <span
                      style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }}
                    />
                  )}
                </span>
                <div className="flex flex-col">
                  <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-primary)" }}>
                    {type.label}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>{type.subtitle}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Hours + penalty */}
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          <div className="flex flex-col" style={{ gap: 4 }}>
            <label htmlFor="s7-hours" style={{ fontSize: 10, color: "var(--text-secondary)" }}>
              Horas de antelación
            </label>
            <input
              id="s7-hours"
              type="text"
              value={policies.cancellation.hoursInAdvance}
              onChange={(e) => setCancellation("hoursInAdvance", e.target.value)}
              placeholder="72"
              className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                height: 26,
                padding: "0 8px",
                background: "var(--surface-page)",
                border: "1px solid var(--border-ui)",
                borderRadius: 4,
                fontSize: 11,
                color: "var(--text-primary)",
                outline: "none",
                outlineColor: "var(--accent-info)",
              }}
            />
          </div>
          <div className="flex flex-col" style={{ gap: 4 }}>
            <label htmlFor="s7-penalty" style={{ fontSize: 10, color: "var(--text-secondary)" }}>
              Penalidad por no-show
            </label>
            <input
              id="s7-penalty"
              type="text"
              value={policies.cancellation.penalty}
              onChange={(e) => setCancellation("penalty", e.target.value)}
              placeholder="1 noche"
              className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                height: 26,
                padding: "0 8px",
                background: "var(--surface-page)",
                border: "1px solid var(--border-ui)",
                borderRadius: 4,
                fontSize: 11,
                color: "var(--text-primary)",
                outline: "none",
                outlineColor: "var(--accent-info)",
              }}
            />
          </div>
        </div>

        {/* Texto de política */}
        <div className="flex flex-col" style={{ gap: 4 }}>
          <div className="flex items-center justify-between">
            <label htmlFor="s7-text" style={{ fontSize: 10, color: "var(--text-secondary)" }}>
              Texto de la política
            </label>
            <button
              type="button"
              onClick={generatePolicyText}
              disabled={generatingPolicy}
              className="inline-flex items-center transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "var(--wizard-amber-light)",
                border: "1px solid var(--wizard-amber-border-strong)",
                borderRadius: 3,
                fontSize: 9,
                fontWeight: 500,
                color: "var(--wizard-amber-text)",
                padding: "1px 6px",
                gap: 2,
                cursor: "pointer",
                outlineColor: "var(--accent-info)",
              }}
            >
              {generatingPolicy ? (
                <Loader2 size={9} className="animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles size={9} aria-hidden="true" />
              )}
              {generatingPolicy ? "Generando…" : "Generar con IA"}
            </button>
          </div>
          <textarea
            id="s7-text"
            value={policies.cancellation.text}
            onChange={(e) => setCancellation("text", e.target.value)}
            placeholder="Describí tu política de cancelación con tus propias palabras."
            rows={3}
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              padding: "6px 8px",
              background: "var(--surface-page)",
              border: "1px solid var(--border-ui)",
              borderRadius: 4,
              fontSize: 11,
              color: "var(--text-primary)",
              resize: "none",
              lineHeight: 1.4,
              outline: "none",
              outlineColor: "var(--accent-info)",
              fontFamily: "inherit",
            }}
          />
        </div>
      </PolicyAccordion>

      <PolicyAccordion
        icon={CreditCard}
        title="Medios de pago"
        badge={{ text: "Al menos 1 requerido", variant: "required" }}
        isOpen={openAccordion === "payments"}
        onToggle={() => setOpenAccordion((v) => (v === "payments" ? null : "payments"))}
      >
        <div className="flex flex-col" style={{ gap: 6 }}>
          {PAYMENTS.map(({ key, label, icon: Icon }) => (
            <div
              key={key}
              className="flex items-center"
              style={{
                gap: 10,
                padding: 8,
                background: "var(--surface-page)",
                border: "1px solid var(--border-ui)",
                borderRadius: 5,
              }}
            >
              <Icon size={14} style={{ color: "var(--text-secondary)", flexShrink: 0 }} aria-hidden="true" />
              <span className="flex-1" style={{ fontSize: 11, color: "var(--text-primary)" }}>
                {label}
              </span>
              <Toggle
                checked={policies.payments[key]}
                onChange={(v) => togglePayment(key, v)}
                ariaLabel={label}
              />
            </div>
          ))}
        </div>
      </PolicyAccordion>
    </div>
  );
}
