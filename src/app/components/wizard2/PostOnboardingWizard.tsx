import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { W2Props, W2Section, W2State } from "../../types/wizard2";
import { ASESOR_TEXTS_W2, INITIAL_W2_STATE, SECTIONS } from "../../types/wizard2";
import { StepTrailW2 } from "./StepTrailW2";
import { AsesorPanel } from "../wizard/shared/AsesorPanel";
import { SitePreview2 } from "./preview/SitePreview2";
import { S1Profile } from "./sections/S1Profile";
import { S2Languages } from "./sections/S2Languages";
import { S3SocialMedia } from "./sections/S3SocialMedia";
import { S4Location } from "./sections/S4Location";
import { S5Seo } from "./sections/S5Seo";
import { S6AdditionalPages } from "./sections/S6AdditionalPages";
import { S7Policies } from "./sections/S7Policies";
import { S8Launch } from "./sections/S8Launch";
import { SFinal } from "./sections/SFinal";
import { FOCUSABLE_SELECTOR } from "../../utils/focus";

function mergeInitial(initial: Partial<W2State> | undefined): W2State {
  if (!initial) return { ...INITIAL_W2_STATE, completedSections: new Set() };
  return {
    ...INITIAL_W2_STATE,
    ...initial,
    completedSections: new Set(initial.completedSections ?? []),
    profile: { ...INITIAL_W2_STATE.profile, ...(initial.profile ?? {}) },
    languages: { ...INITIAL_W2_STATE.languages, ...(initial.languages ?? {}) },
    social: { ...INITIAL_W2_STATE.social, ...(initial.social ?? {}) },
    location: { ...INITIAL_W2_STATE.location, ...(initial.location ?? {}) },
    seo: { ...INITIAL_W2_STATE.seo, ...(initial.seo ?? {}) },
    additionalPages: { ...INITIAL_W2_STATE.additionalPages, ...(initial.additionalPages ?? {}) },
    policies: { ...INITIAL_W2_STATE.policies, ...(initial.policies ?? {}) },
    launch: { ...INITIAL_W2_STATE.launch, ...(initial.launch ?? {}) },
  };
}

export function PostOnboardingWizard({ isOpen, onClose, onPublish, initialState, onChange }: W2Props) {
  const [state, setState] = useState<W2State>(() => mergeInitial(initialState));
  const [confirmClose, setConfirmClose] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const formScrollRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Reset al abrir. Solo depende de isOpen — el initialState se lee fresh
  // en cada apertura, pero NO se observa después. Si lo observáramos, el
  // onChange→draft→initialState→reset crearía un loop que causa flicker visible.
  useEffect(() => {
    if (isOpen) {
      setState(mergeInitial(initialState));
      setConfirmClose(false);
    }
    // No reseteo al cerrar — el draft del W2 puede persistirse desde fuera.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Emitir cambios del state al padre para persistencia del draft.
  // onChange viene como prop; si el padre lo recrea inline en cada render,
  // este efecto se dispararía en cada render del padre. App.tsx debe envolverlo
  // en useCallback para mantener referencia estable.
  useEffect(() => {
    if (isOpen) onChange?.(state);
  }, [state, isOpen, onChange]);

  // Body scroll lock + focus management + Escape + focus trap.
  useEffect(() => {
    if (!isOpen) return;
    previouslyFocusedRef.current = (document.activeElement as HTMLElement) ?? null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const modal = modalRef.current;
    if (modal) {
      const first = modal.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      first?.focus();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        attemptClose();
        return;
      }
      if (e.key === "Tab" && modal) {
        const focusables = Array.from(
          modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        ).filter((el) => el.offsetParent !== null);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const current = document.activeElement;
        if (e.shiftKey && current === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && current === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocusedRef.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Scroll del panel formulario al top al cambiar de sección.
  useEffect(() => {
    formScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [state.currentSection]);

  if (!isOpen) return null;

  function update(patch: Partial<W2State>) {
    setState((s) => ({ ...s, ...patch }));
  }

  function navigate(section: W2Section) {
    setState((s) => ({ ...s, currentSection: section }));
  }

  function completeAndAdvance() {
    setState((s) => {
      const completed = new Set(s.completedSections);
      completed.add(s.currentSection);
      const idx = SECTIONS.findIndex((sec) => sec.id === s.currentSection);
      const nextSection: W2Section =
        idx >= 0 && idx < SECTIONS.length - 1 ? SECTIONS[idx + 1].id : "final";
      return { ...s, completedSections: completed, currentSection: nextSection };
    });
  }

  function attemptClose() {
    if (state.completedSections.size > 0 && state.currentSection !== "final") {
      setConfirmClose(true);
      return;
    }
    onClose();
  }

  function confirmAndClose() {
    setConfirmClose(false);
    onClose();
  }

  const currentIdx = SECTIONS.findIndex((s) => s.id === state.currentSection);
  const headerLabel =
    state.currentSection === "final"
      ? "Resumen y publicación"
      : `Sección ${currentIdx + 1} de ${SECTIONS.length} · ${SECTIONS[currentIdx]?.label ?? ""}`;

  const sectionProps = { state, update };
  const sectionNode = (() => {
    switch (state.currentSection) {
      case "profile":
        return <S1Profile {...sectionProps} />;
      case "languages":
        return <S2Languages {...sectionProps} />;
      case "social":
        return <S3SocialMedia {...sectionProps} />;
      case "location":
        return <S4Location {...sectionProps} />;
      case "seo":
        return <S5Seo {...sectionProps} />;
      case "pages":
        return <S6AdditionalPages {...sectionProps} />;
      case "policies":
        return <S7Policies {...sectionProps} />;
      case "launch":
        return <S8Launch {...sectionProps} />;
      case "final":
        return (
          <SFinal
            {...sectionProps}
            onEdit={(section) => navigate(section)}
          />
        );
    }
  })();

  const asesor = ASESOR_TEXTS_W2[state.currentSection];

  // Footer sticky en TODAS las secciones (incluida "final") para consistencia
  // con el W1 y para que el CTA primario tenga siempre la misma posición.
  const isFinal = state.currentSection === "final";
  function handleFooterPrimary() {
    if (isFinal) {
      onPublish(state);
      onClose();
    } else {
      completeAndAdvance();
    }
  }

  const modal = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "var(--wizard-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="w2-wizard-title"
        className="flex flex-col"
        style={{
          width: "calc(100vw - 120px)",
          maxWidth: 1160,
          height: 740,
          maxHeight: "calc(100vh - 48px)",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.24)",
          overflow: "hidden",
          fontFamily: "var(--font-sans)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center"
          style={{
            height: 48,
            padding: "0 16px",
            borderBottom: "1px solid var(--border-ui)",
            background: "#fff",
            flexShrink: 0,
          }}
        >
          <div className="flex items-center gap-2">
            <div
              aria-hidden="true"
              style={{ width: 18, height: 18, background: "var(--brand)", borderRadius: "var(--radius-dot)" }}
            />
            <span
              style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--text-primary)" }}
            >
              PXSOL Web
            </span>
          </div>
          <h2
            id="w2-wizard-title"
            className="absolute"
            style={{
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "var(--font-size-md)",
              fontWeight: 600,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            Configuración completa · {headerLabel}
          </h2>
          <button
            type="button"
            onClick={attemptClose}
            aria-label="Cerrar wizard"
            className="ml-auto transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
              outlineColor: "var(--ring)",
            }}
          >
            <X size={16} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        {/* Step trail horizontal (consistente con W1) */}
        {state.currentSection !== "final" && (
          <StepTrailW2
            currentSection={state.currentSection}
            completedSections={state.completedSections}
            onNavigate={navigate}
          />
        )}

        {/* Body: form + preview */}
        <div className="flex flex-1 min-h-0">
          {/* Form panel */}
          <div
            className="flex flex-col flex-shrink-0"
            style={{ width: "58%", borderRight: "1px solid var(--border-ui)" }}
          >
            <div ref={formScrollRef} className="flex-1 overflow-y-auto" style={{ background: "#fff" }}>
              {sectionNode}
            </div>

            <div
              className="flex items-center justify-between"
              style={{
                height: 52,
                padding: "0 24px",
                background: "#fff",
                borderTop: "1px solid var(--border-ui)",
                flexShrink: 0,
              }}
            >
              {isFinal ? (
                <button
                  type="button"
                  onClick={() => navigate("launch")}
                  className="flex items-center gap-1 transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    height: 28,
                    padding: "0 12px",
                    background: "#efefef",
                    border: "1px solid var(--border-ui)",
                    borderRadius: 5,
                    fontSize: "var(--font-size-sm)",
                    color: "var(--text-secondary)",
                    outlineColor: "var(--ring)",
                    cursor: "pointer",
                  }}
                >
                  ← Revisar configuración
                </button>
              ) : (
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-tertiary)" }}>
                  Sección {SECTIONS.findIndex((s) => s.id === state.currentSection) + 1} de {SECTIONS.length}
                  {state.completedSections.size > 0 && (
                    <>
                      <span style={{ margin: "0 6px" }}>·</span>
                      {state.completedSections.size} completadas
                    </>
                  )}
                </span>
              )}
              <button
                type="button"
                onClick={handleFooterPrimary}
                className="transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  height: 28,
                  padding: "0 14px",
                  background: "var(--wizard-coral)",
                  border: "none",
                  borderRadius: 6,
                  fontSize: "var(--font-size-sm)",
                  fontWeight: 500,
                  color: "#fff",
                  cursor: "pointer",
                  outlineColor: "var(--wizard-coral)",
                  outlineOffset: 2,
                }}
              >
                {isFinal ? "Publicar sitio →" : "Continuar →"}
              </button>
            </div>

            <AsesorPanel text={asesor.text} cierreComercial={asesor.cierre} />
          </div>

          {/* Preview column */}
          <div className="flex-1 flex flex-col min-w-0" style={{ background: "var(--surface-page)" }}>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <SitePreview2 state={state} />
            </div>
          </div>
        </div>
      </div>

      {/* Confirm dialog */}
      {confirmClose && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="w2-confirm-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="flex flex-col"
            style={{
              width: 360,
              background: "#fff",
              borderRadius: 8,
              padding: 20,
              boxShadow: "0 8px 32px rgba(0,0,0,0.24)",
              gap: 16,
            }}
          >
            <div>
              <p
                id="w2-confirm-title"
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 4,
                }}
              >
                ¿Salir de la configuración?
              </p>
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
                Tu progreso se guardará como borrador.
              </p>
            </div>
            <div className="flex justify-end" style={{ gap: 8 }}>
              <button
                type="button"
                onClick={() => setConfirmClose(false)}
                className="transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  height: 30,
                  padding: "0 14px",
                  background: "#efefef",
                  border: "1px solid var(--border-ui)",
                  borderRadius: 5,
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  outlineColor: "var(--ring)",
                }}
              >
                Continuar configurando
              </button>
              <button
                type="button"
                onClick={confirmAndClose}
                className="transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  height: 30,
                  padding: "0 14px",
                  background: "var(--wizard-coral)",
                  border: "none",
                  borderRadius: 5,
                  fontSize: "var(--font-size-sm)",
                  fontWeight: 500,
                  color: "#fff",
                  cursor: "pointer",
                  outlineColor: "var(--wizard-coral)",
                }}
              >
                Salir y guardar borrador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modal, document.body);
}
