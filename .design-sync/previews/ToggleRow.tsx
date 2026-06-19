import { ToggleRow } from "@figma/my-make-file";

const noop = () => {};

const wrap = (children: React.ReactNode) => (
  <div style={{ width: 380, padding: 16, background: "var(--surface-page)" }}>{children}</div>
);

export const Canonico = () =>
  wrap(
    <ToggleRow
      label="Reserva directa en el motor"
      sublabel="Permití que los huéspedes reserven sin pasar por Booking.com."
      checked={true}
      onChange={noop}
    />,
  );

export const Apagado = () =>
  wrap(
    <ToggleRow
      label="Mostrar precios con impuestos"
      sublabel="Incluye el IVA en las tarifas visibles del sitio."
      checked={false}
      onChange={noop}
    />,
  );

export const BadgePrioridad = () =>
  wrap(
    <ToggleRow
      label="Schema.org Hotel"
      sublabel="Aparecé en resultados de IA como ChatGPT y Perplexity."
      badge={{ text: "Prioridad", variant: "priority" }}
      checked={true}
      onChange={noop}
    />,
  );

export const BadgeRecomendado = () =>
  wrap(
    <ToggleRow
      label="Idioma inglés"
      sublabel="Sumá posiciones en búsquedas de turistas extranjeros."
      badge={{ text: "Recomendado", variant: "recommended" }}
      checked={false}
      onChange={noop}
    />,
  );
