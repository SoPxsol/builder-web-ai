import { CommercialCalendarCard } from "@figma/my-make-file";

const noop = () => {};

// "Hoy" fijo para que el card muestre eventos estables y uno en curso.
const today = new Date("2026-06-19T12:00:00");

export const Canonical = () => (
  <div
    style={{
      maxWidth: 720,
      padding: 20,
      background: "var(--surface-page)",
      borderRadius: "var(--radius-card)",
    }}
  >
    <CommercialCalendarCard
      navigate={noop}
      openCreatePopupWith={noop}
      today={today}
    />
  </div>
);

// Vista angosta (columna de dashboard) — un solo evento por fila.
export const Angosto = () => (
  <div
    style={{
      maxWidth: 380,
      padding: 16,
      background: "var(--surface-page)",
      borderRadius: "var(--radius-card)",
    }}
  >
    <CommercialCalendarCard
      navigate={noop}
      openCreatePopupWith={noop}
      today={today}
    />
  </div>
);
