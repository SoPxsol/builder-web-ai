import { PromocionesView } from "@figma/my-make-file";

const noop = () => {};

// Vista "Próximamente" — hero coming-soon + previews de features. Datos internos.
export const Pantalla = () => (
  <div style={{ height: 560, display: "flex", background: "var(--surface-page)" }}>
    <PromocionesView siteName="Hotel Diplomatic" navigate={noop} />
  </div>
);
