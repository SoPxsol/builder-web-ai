import { WizardCard, Button } from "@figma/my-make-file";

const noop = () => {};

// Tarjeta de paso con contenido de formulario y footer de navegación.
export const ConFooter = () => (
  <div style={{ width: 420, height: 360, display: "flex", border: "1px solid var(--border-ui)", borderRadius: 8, overflow: "hidden" }}>
    <WizardCard
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12 }}>
          <Button variant="ghost" size="sm" onClick={noop}>Atrás</Button>
          <Button variant="primary" size="sm" onClick={noop}>Continuar</Button>
        </div>
      }
    >
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        <h3 style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
          Perfil del hotel
        </h3>
        <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
          Contanos lo esencial del Hotel Diplomatic: nombre, categoría y una breve
          descripción para que los huéspedes sepan qué los espera.
        </p>
        <div style={{ height: 1, background: "var(--border-ui)", margin: "4px 0" }} />
        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-tertiary)" }}>
          Hotel Diplomatic · 4 estrellas · Buenos Aires
        </span>
      </div>
    </WizardCard>
  </div>
);

// Tarjeta sin footer (solo contenido scrolleable).
export const SinFooter = () => (
  <div style={{ width: 420, height: 280, display: "flex", border: "1px solid var(--border-ui)", borderRadius: 8, overflow: "hidden" }}>
    <WizardCard>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 6 }}>
        <h3 style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
          Resumen de configuración
        </h3>
        <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
          Revisá los datos antes de publicar el sitio del Hotel Diplomatic.
        </p>
      </div>
    </WizardCard>
  </div>
);
