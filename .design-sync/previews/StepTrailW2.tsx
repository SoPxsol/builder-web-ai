import { StepTrailW2 } from "@figma/my-make-file";

const noop = () => {};

// "profile" activo, ninguna completada todavía.
export const Inicio = () => (
  <div style={{ width: 760, background: "var(--surface-page)" }}>
    <StepTrailW2
      currentSection="profile"
      completedSections={new Set()}
      onNavigate={noop}
    />
  </div>
);

// A mitad de camino: las primeras secciones hechas, "seo" activa.
export const EnProgreso = () => (
  <div style={{ width: 760, background: "var(--surface-page)" }}>
    <StepTrailW2
      currentSection="seo"
      completedSections={new Set(["profile", "social", "location"])}
      onNavigate={noop}
    />
  </div>
);

// Casi listo para lanzar: solo falta la sección de "launch".
export const CasiCompleto = () => (
  <div style={{ width: 760, background: "var(--surface-page)" }}>
    <StepTrailW2
      currentSection="launch"
      completedSections={
        new Set(["profile", "social", "location", "seo", "languages", "pages", "policies"])
      }
      onNavigate={noop}
    />
  </div>
);
