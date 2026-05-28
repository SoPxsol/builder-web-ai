import { useEffect, useState } from "react";
import type { PopupState } from "../../../types/creation";
import { INITIAL_POPUP_STATE } from "../../../types/creation";
import { CreationShell } from "../shared/CreationShell";
import { PopupStep1Design } from "./PopupStep1Design";
import { PopupStep2Config } from "./PopupStep2Config";
import { PopupStep3Rules } from "./PopupStep3Rules";
import { PopupPreview } from "./preview/PopupPreview";

interface Props {
  isOpen: boolean;
  contextLabel?: string;
  /**
   * Preset opcional para abrir el wizard pre-cargado (ej: desde Calendario
   * Comercial → "Pop-up countdown CyberDay"). Se mergea con INITIAL_POPUP_STATE
   * al abrir y se descarta al cerrar.
   */
  initialState?: Partial<PopupState>;
  onClose: () => void;
  onPublish: (state: PopupState) => void;
}

const STEPS = [
  { id: "design", label: "Diseño" },
  { id: "config", label: "Configuración" },
  { id: "rules", label: "Reglas de display" },
];

export function CreatePopupWizard({ isOpen, contextLabel, initialState, onClose, onPublish }: Props) {
  const [state, setState] = useState<PopupState>(() => ({
    ...INITIAL_POPUP_STATE,
    ...initialState,
  }));

  // Reset al cerrar; al abrir aplicamos el preset (si cambió) sobre INITIAL.
  useEffect(() => {
    if (isOpen) {
      setState({ ...INITIAL_POPUP_STATE, ...initialState });
    } else {
      setState(INITIAL_POPUP_STATE);
    }
  }, [isOpen, initialState]);

  function update(patch: Partial<PopupState>) {
    setState((s) => ({ ...s, ...patch }));
  }

  const activeIndex = state.currentStep - 1;

  function next() {
    if (state.currentStep === 3) {
      onPublish(state);
      onClose();
      return;
    }
    setState((s) => ({ ...s, currentStep: (s.currentStep + 1) as PopupState["currentStep"] }));
  }

  function goToStep(idx: number) {
    setState((s) => ({ ...s, currentStep: (idx + 1) as PopupState["currentStep"] }));
  }

  // Detectar si hay cambios sin guardar (alguno de los campos clave tocado).
  const hasUnsaved =
    state.internalName.trim() !== "" ||
    state.title.trim() !== "" ||
    state.description.trim() !== "" ||
    state.ctaText.trim() !== "" ||
    state.ctaUrl.trim() !== "" ||
    state.imageUrl !== "";

  // Validación mínima para habilitar el primary del paso 1.
  const step1Valid =
    state.internalName.trim() !== "" &&
    state.title.trim() !== "" &&
    state.ctaText.trim() !== "" &&
    state.ctaUrl.trim() !== "";

  const primaryDisabled = state.currentStep === 1 && !step1Valid;

  const stepNode = (() => {
    switch (state.currentStep) {
      case 1:
        return <PopupStep1Design state={state} update={update} />;
      case 2:
        return <PopupStep2Config state={state} update={update} />;
      case 3:
        return <PopupStep3Rules state={state} update={update} />;
    }
  })();

  return (
    <CreationShell
      isOpen={isOpen}
      resourceName="Nuevo popup"
      contextLabel={contextLabel}
      steps={STEPS}
      activeStepIndex={activeIndex}
      onStepClick={goToStep}
      hasUnsavedChanges={hasUnsaved}
      onClose={onClose}
      onPrimary={next}
      primaryLabel={state.currentStep === 3 ? "Publicar ahora" : "Siguiente →"}
      primaryDisabled={primaryDisabled}
      leftPanel={stepNode}
      preview={<PopupPreview state={state} />}
    />
  );
}
