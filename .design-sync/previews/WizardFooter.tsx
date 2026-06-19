import { WizardFooter } from "@figma/my-make-file";

const noop = () => {};

const wrap = (children: React.ReactNode) => (
  <div style={{ width: 560, border: "1px solid var(--border-ui)", borderRadius: 8, background: "#fff" }}>
    {children}
  </div>
);

export const Canonico = () =>
  wrap(<WizardFooter onBack={noop} onSkip={noop} onNext={noop} />);

export const PrimerPaso = () =>
  wrap(<WizardFooter onSkip={noop} onNext={noop} nextLabel="Continuar →" />);

export const PasoFinal = () =>
  wrap(<WizardFooter onBack={noop} onNext={noop} nextLabel="Publicar sitio" />);

export const SiguienteDeshabilitado = () =>
  wrap(<WizardFooter onBack={noop} onSkip={noop} onNext={noop} nextDisabled />);
