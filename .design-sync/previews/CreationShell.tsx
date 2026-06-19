import { CreationShell } from "@figma/my-make-file";

const noop = () => {};

const STEPS = [
  { id: "contenido", label: "Contenido" },
  { id: "publicacion", label: "Publicación" },
];

/* Glue del leftPanel/preview con tokens del DS (no son props del shell). */
const Field = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div style={{ display: "grid", gap: 6 }}>
    <label style={{ fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--text-secondary)" }}>
      {label}
    </label>
    <div
      style={{
        height: 38,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        background: "var(--surface-page)",
        border: "0.5px solid var(--border-ui)",
        borderRadius: 8,
        fontSize: 14,
        color: "var(--text-primary)",
      }}
    >
      {value}
    </div>
    {hint && <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{hint}</span>}
  </div>
);

const LeftPanel = () => (
  <div style={{ padding: 24, display: "grid", gap: 18 }}>
    <Field label="Título del artículo" value="Guía gastronómica de Buenos Aires" />
    <Field
      label="Descripción corta"
      value="Bodegones, parrillas y cafés notables cerca del hotel."
      hint="58 / 160 caracteres"
    />
    <Field label="Categoría" value="Gastronomía" />
  </div>
);

const Preview = () => (
  <div style={{ padding: 32, display: "flex", justifyContent: "center" }}>
    <div
      style={{
        width: "100%",
        maxWidth: 420,
        background: "#fff",
        border: "0.5px solid var(--border-ui)",
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          height: 160,
          backgroundImage:
            "url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=70&w=800)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div style={{ padding: 16, display: "grid", gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--brand)", textTransform: "uppercase" }}>
          Gastronomía
        </span>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
          Guía gastronómica de Buenos Aires
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          Bodegones, parrillas y cafés notables cerca del hotel.
        </p>
      </div>
    </div>
  </div>
);

// Shell de creación (paso 1 de 2) con formulario + preview. Modal full-screen vía portal.
export const Paso1 = () => (
  <div style={{ position: "relative", width: 1240, height: 800 }}>
    <CreationShell
      isOpen={true}
      resourceName="Nuevo artículo"
      contextLabel="hoteldiplomatic.com"
      steps={STEPS}
      activeStepIndex={0}
      onStepClick={noop}
      onClose={noop}
      onPrimary={noop}
      primaryLabel="Continuar"
      leftPanel={<LeftPanel />}
      preview={<Preview />}
    />
  </div>
);

// Layout centrado (sin preview) — el formulario queda centrado con max-width.
export const Centrado = () => (
  <div style={{ position: "relative", width: 1240, height: 800 }}>
    <CreationShell
      isOpen={true}
      resourceName="Nuevo artículo"
      contextLabel="hoteldiplomatic.com"
      steps={STEPS}
      activeStepIndex={1}
      onStepClick={noop}
      hasUnsavedChanges={true}
      onClose={noop}
      onPrimary={noop}
      primaryLabel="Publicar"
      centeredLayout={true}
      leftPanel={<LeftPanel />}
    />
  </div>
);
