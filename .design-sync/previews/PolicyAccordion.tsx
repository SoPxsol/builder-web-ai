import { PolicyAccordion } from "@figma/my-make-file";
import { Clock, XCircle, CreditCard } from "lucide-react";

const noop = () => {};

// Acordeón abierto: política de check-in con su contenido visible.
export const Abierto = () => (
  <div style={{ width: 420, padding: 16, background: "#fff" }}>
    <PolicyAccordion
      icon={Clock}
      title="Check-in y check-out"
      badge={{ text: "Obligatorio", variant: "required" }}
      isOpen={true}
      onToggle={noop}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
        <span>Check-in: a partir de las 15:00 hs.</span>
        <span>Check-out: hasta las 11:00 hs.</span>
        <span>Late check-out sujeto a disponibilidad, con cargo adicional.</span>
      </div>
    </PolicyAccordion>
  </div>
);

// Acordeón cerrado con badge recomendado.
export const Cerrado = () => (
  <div style={{ width: 420, padding: 16, background: "#fff" }}>
    <PolicyAccordion
      icon={XCircle}
      title="Política de cancelación"
      badge={{ text: "Recomendado", variant: "recommended" }}
      isOpen={false}
      onToggle={noop}
    >
      <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
        Cancelación gratuita hasta 48 hs antes del check-in.
      </span>
    </PolicyAccordion>
  </div>
);

// Varios acordeones apilados como en la sección de políticas.
export const Lista = () => (
  <div style={{ width: 420, padding: 16, background: "#fff" }}>
    <PolicyAccordion
      icon={Clock}
      title="Check-in y check-out"
      badge={{ text: "Obligatorio", variant: "required" }}
      isOpen={true}
      onToggle={noop}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
        <span>Check-in: desde las 15:00 hs.</span>
        <span>Check-out: hasta las 11:00 hs.</span>
      </div>
    </PolicyAccordion>
    <PolicyAccordion
      icon={XCircle}
      title="Política de cancelación"
      badge={{ text: "Recomendado", variant: "recommended" }}
      isOpen={false}
      onToggle={noop}
    >
      <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
        Cancelación gratuita hasta 48 hs antes.
      </span>
    </PolicyAccordion>
    <PolicyAccordion
      icon={CreditCard}
      title="Medios de pago"
      isOpen={false}
      onToggle={noop}
    >
      <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
        Aceptamos tarjetas de crédito, débito y transferencia.
      </span>
    </PolicyAccordion>
  </div>
);
