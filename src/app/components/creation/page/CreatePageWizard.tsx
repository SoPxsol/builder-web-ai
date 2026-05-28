import { useEffect, useState } from "react";
import type { PageState } from "../../../types/creation";
import { INITIAL_PAGE_STATE } from "../../../types/creation";
import { CreationShell } from "../shared/CreationShell";
import { PageStep1Basic } from "./PageStep1Basic";
import { PageStep2Content } from "./PageStep2Content";
import { PageStep3Seo } from "./PageStep3Seo";
import { PagePreview } from "./preview/PagePreview";

interface Props {
  isOpen: boolean;
  contextLabel?: string;
  onClose: () => void;
  onPublish: (state: PageState) => void;
}

const STEPS = [
  { id: "basic", label: "Info básica" },
  { id: "content", label: "Contenido" },
  { id: "seo", label: "SEO y publicación" },
];

export function CreatePageWizard({ isOpen, contextLabel, onClose, onPublish }: Props) {
  const [state, setState] = useState<PageState>(INITIAL_PAGE_STATE);

  useEffect(() => {
    if (!isOpen) setState(INITIAL_PAGE_STATE);
  }, [isOpen]);

  function update(patch: Partial<PageState>) {
    setState((s) => ({ ...s, ...patch }));
  }

  const activeIndex = state.currentStep - 1;

  function next() {
    if (state.currentStep === 3) {
      onPublish(state);
      onClose();
      return;
    }
    setState((s) => ({ ...s, currentStep: (s.currentStep + 1) as PageState["currentStep"] }));
  }

  function goToStep(idx: number) {
    setState((s) => ({ ...s, currentStep: (idx + 1) as PageState["currentStep"] }));
  }

  const hasUnsaved =
    state.name.trim() !== "" || state.sections.length > 0 || state.seoTitle.trim() !== "";

  const step1Valid = state.name.trim() !== "";
  const primaryDisabled = state.currentStep === 1 && !step1Valid;

  const stepNode = (() => {
    switch (state.currentStep) {
      case 1:
        return <PageStep1Basic state={state} update={update} />;
      case 2:
        return <PageStep2Content state={state} update={update} />;
      case 3:
        return <PageStep3Seo state={state} update={update} />;
    }
  })();

  const primaryLabel =
    state.currentStep === 3
      ? state.publish === "now"
        ? "Publicar página"
        : "Programar publicación"
      : "Continuar →";

  return (
    <CreationShell
      isOpen={isOpen}
      resourceName="Nueva página"
      contextLabel={contextLabel}
      steps={STEPS}
      activeStepIndex={activeIndex}
      onStepClick={goToStep}
      hasUnsavedChanges={hasUnsaved}
      onClose={onClose}
      onPrimary={next}
      primaryLabel={primaryLabel}
      primaryDisabled={primaryDisabled}
      leftPanel={stepNode}
      preview={<PagePreview state={state} />}
    />
  );
}
