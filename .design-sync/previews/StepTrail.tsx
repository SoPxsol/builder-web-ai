import { StepTrail } from "@figma/my-make-file";

const wrap = (children: React.ReactNode) => (
  <div style={{ width: 640, background: "#fff" }}>{children}</div>
);

export const PasoIntermedio = () => wrap(<StepTrail currentStep={3} />);

export const PrimerPaso = () => wrap(<StepTrail currentStep={1} />);

export const UltimoPaso = () => wrap(<StepTrail currentStep={5} />);
