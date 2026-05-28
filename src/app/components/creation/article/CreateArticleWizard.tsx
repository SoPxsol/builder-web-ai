import { useEffect, useState } from "react";
import type { ArticleState } from "../../../types/creation";
import { INITIAL_ARTICLE_STATE } from "../../../types/creation";
import { CreationShell } from "../shared/CreationShell";
import { ArticleStep1Content } from "./ArticleStep1Content";
import { ArticleStep2Seo } from "./ArticleStep2Seo";

interface Props {
  isOpen: boolean;
  contextLabel?: string;
  onClose: () => void;
  onPublish: (state: ArticleState) => void;
}

const STEPS = [
  { id: "content", label: "Contenido" },
  { id: "seo", label: "SEO y publicación" },
];

const PUBLISH_LABELS: Record<ArticleState["publish"], string> = {
  now: "Publicar artículo",
  draft: "Guardar borrador",
  scheduled: "Programar publicación",
};

export function CreateArticleWizard({ isOpen, contextLabel, onClose, onPublish }: Props) {
  const [state, setState] = useState<ArticleState>(INITIAL_ARTICLE_STATE);

  useEffect(() => {
    if (!isOpen) setState(INITIAL_ARTICLE_STATE);
  }, [isOpen]);

  function update(patch: Partial<ArticleState>) {
    setState((s) => ({ ...s, ...patch }));
  }

  const activeIndex = state.currentStep - 1;

  function next() {
    if (state.currentStep === 2) {
      onPublish(state);
      onClose();
      return;
    }
    setState((s) => ({ ...s, currentStep: (s.currentStep + 1) as ArticleState["currentStep"] }));
  }

  function goToStep(idx: number) {
    setState((s) => ({ ...s, currentStep: (idx + 1) as ArticleState["currentStep"] }));
  }

  const hasUnsaved =
    state.title.trim() !== "" ||
    state.excerpt.trim() !== "" ||
    state.body.trim() !== "" ||
    state.categories.length > 0 ||
    state.tags.length > 0 ||
    state.coverImageUrl !== "";

  const step1Valid = state.title.trim() !== "";
  const primaryDisabled = state.currentStep === 1 && !step1Valid;

  const stepNode = (() => {
    switch (state.currentStep) {
      case 1:
        return <ArticleStep1Content state={state} update={update} />;
      case 2:
        return <ArticleStep2Seo state={state} update={update} />;
    }
  })();

  const primaryLabel =
    state.currentStep === 2 ? PUBLISH_LABELS[state.publish] : "Continuar →";

  return (
    <CreationShell
      isOpen={isOpen}
      resourceName="Nuevo artículo"
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
      centeredLayout
    />
  );
}
