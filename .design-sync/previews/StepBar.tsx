import { StepBar } from "@figma/my-make-file";

const noop = () => {};

const STEPS = [
  { id: "design", label: "Diseño" },
  { id: "config", label: "Configuración" },
  { id: "rules", label: "Reglas" },
];

const wrap = (children: React.ReactNode) => (
  <div style={{ width: 560, background: "#fff" }}>{children}</div>
);

export const PasoIntermedio = () => wrap(<StepBar steps={STEPS} activeIndex={1} onStepClick={noop} />);

export const PrimerPaso = () => wrap(<StepBar steps={STEPS} activeIndex={0} onStepClick={noop} />);

export const UltimoPaso = () => wrap(<StepBar steps={STEPS} activeIndex={2} onStepClick={noop} />);
