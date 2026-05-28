import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { PreviewBreakpoint, StepIndex, WizardProps, WizardState } from "../../types/wizard";
import { INITIAL_WIZARD_STATE, STEP_LABELS } from "../../types/wizard";
import { StepTrail } from "./StepTrail";
import { WizardCard } from "./shared/WizardCard";
import { WizardFooter } from "./WizardFooter";
import { AsesorPanel } from "./shared/AsesorPanel";
import { SitePreview } from "./preview/SitePreview";
import { PreviewBar } from "./preview/PreviewBar";
import { Step1Template } from "./steps/Step1Template";
import { Step2Identity } from "./steps/Step2Identity";
import { Step3InfoContact } from "./steps/Step3InfoContact";
import { Step4Rooms } from "./steps/Step4Rooms";
import { Step5Summary } from "./steps/Step5Summary";
import { FOCUSABLE_SELECTOR } from "../../utils/focus";

const ASESOR_TEXTS: Record<StepIndex, { text: string; cierreComercial?: string }> = {
  1: {
    text:
      "Mostrá los tres templates en la preview y que el hotelero elija. No lleva más de 1 minuto. Aclará que todo es editable después.",
  },
  2: {
    text:
      "Si el hotelero no tiene el logo a mano, avanzar igual — hay foto de ejemplo activa. El logo se puede subir después desde el editor en 2 minutos.",
  },
  3: {
    text:
      "Nombre, teléfono y email son los tres campos mínimos. Las redes después. Si no tiene dominio propio, el subdominio de demo queda activo.",
  },
  4: {
    text:
      "Solo nombre y cantidad de habitaciones por ahora. Amenities, fotos y precios van en la configuración completa.",
  },
  5: {
    text:
      "Antes de cerrar, mostrá el sitio desde el celular del hotelero. Ese momento es el que cierra la conversión.",
    cierreComercial:
      "[Nombre], tu sitio está listo. ¿Querés que veamos cómo activar el plan para que siga activo después del trial? Si pregunta por precio: ¿Cuántas reservas recibís por mes? Con 3 reservas directas que antes iban a Booking, el plan ya se paga.",
  },
};

function mergeW1Initial(
  initial: Partial<WizardState> | undefined,
  initialStep: StepIndex | undefined,
): WizardState {
  return {
    ...INITIAL_WIZARD_STATE,
    ...(initial ?? {}),
    currentStep: initialStep ?? initial?.currentStep ?? 1,
    identity: { ...INITIAL_WIZARD_STATE.identity, ...(initial?.identity ?? {}) },
    info: { ...INITIAL_WIZARD_STATE.info, ...(initial?.info ?? {}) },
    rooms: { ...INITIAL_WIZARD_STATE.rooms, ...(initial?.rooms ?? {}) },
    summary: { ...INITIAL_WIZARD_STATE.summary, ...(initial?.summary ?? {}) },
  };
}

export function OnboardingWizard({
  isOpen,
  onClose,
  onComplete,
  onGoToWizard2,
  initialStep,
  initialState,
}: WizardProps) {
  const [state, setState] = useState<WizardState>(() => mergeW1Initial(initialState, initialStep));
  const [breakpoint, setBreakpoint] = useState<PreviewBreakpoint>("desktop");
  const [roiVisible, setRoiVisible] = useState(false);
  const [attemptedNext, setAttemptedNext] = useState(0);
  const [confirmClose, setConfirmClose] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const prevLogoStateRef = useRef(state.identity.logoState);
  // Snapshot del initial al abrir; usado para detectar si el usuario hizo cambios.
  const initialSnapshotRef = useRef<string>("");

  // Al abrir: sembrar con initialState/initialStep. Al cerrar: limpiar.
  useEffect(() => {
    if (isOpen) {
      const seeded = mergeW1Initial(initialState, initialStep);
      setState(seeded);
      initialSnapshotRef.current = JSON.stringify(seeded);
      setBreakpoint("desktop");
      setRoiVisible(false);
      setAttemptedNext(0);
      setConfirmClose(false);
    } else {
      setState(INITIAL_WIZARD_STATE);
      setBreakpoint("desktop");
      setRoiVisible(false);
      setAttemptedNext(0);
      setConfirmClose(false);
    }
  }, [isOpen, initialState, initialStep]);

  // ROI hint: aparece 1s después de que logoState pasa a "loaded", desaparece a los 6s.
  useEffect(() => {
    const prev = prevLogoStateRef.current;
    const curr = state.identity.logoState;
    prevLogoStateRef.current = curr;
    if (prev !== "loaded" && curr === "loaded") {
      const showTimer = setTimeout(() => setRoiVisible(true), 1000);
      const hideTimer = setTimeout(() => setRoiVisible(false), 7000);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [state.identity.logoState]);

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
        const focusables = Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
          (el) => el.offsetParent !== null,
        );
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function update(patch: Partial<WizardState>) {
    setState((s) => ({ ...s, ...patch }));
  }

  function hasUnsavedChanges() {
    return JSON.stringify(state) !== initialSnapshotRef.current;
  }

  function attemptClose() {
    if (hasUnsavedChanges()) {
      setConfirmClose(true);
    } else {
      onClose();
    }
  }

  function next() {
    // Validación: paso 3 requiere hotelName.
    if (state.currentStep === 3 && !state.info.hotelName.trim()) {
      setAttemptedNext((n) => n + 1);
      return;
    }
    if (state.currentStep === 5) {
      onComplete(state);
      onClose();
      return;
    }
    setState((s) => ({ ...s, currentStep: (s.currentStep + 1) as StepIndex }));
  }

  function back() {
    if (state.currentStep === 1) return;
    setState((s) => ({ ...s, currentStep: (s.currentStep - 1) as StepIndex }));
  }

  const stepProps = { state, update };
  const stepNode = (() => {
    switch (state.currentStep) {
      case 1:
        return <Step1Template {...stepProps} />;
      case 2:
        return <Step2Identity {...stepProps} />;
      case 3:
        return <Step3InfoContact {...stepProps} attemptedNext={attemptedNext} />;
      case 4:
        return <Step4Rooms {...stepProps} />;
      case 5:
        return (
          <Step5Summary
            {...stepProps}
            onGoToWizard2={
              onGoToWizard2
                ? () => {
                    onGoToWizard2(state);
                    onClose();
                  }
                : undefined
            }
          />
        );
    }
  })();

  // Footer sticky en TODOS los pasos para consistencia. Step 5 usa el mismo
  // chrome pero el CTA cierra el wizard ("Ver mi sitio funcionando").
  const footer = (
    <WizardFooter
      onBack={state.currentStep > 1 ? back : undefined}
      onSkip={state.currentStep < 5 ? next : undefined}
      onNext={next}
      nextLabel={
        state.currentStep === 5
          ? "Ver mi sitio funcionando →"
          : state.currentStep === 4
          ? "Ver resumen →"
          : "Continuar →"
      }
    />
  );

  const asesor = ASESOR_TEXTS[state.currentStep];

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
        aria-labelledby="wizard-title"
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
              style={{
                fontSize: "var(--font-size-md)",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              PXSOL Web
            </span>
          </div>
          <h2
            id="wizard-title"
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
            Configuración inicial · paso {state.currentStep} de 5: {STEP_LABELS[state.currentStep]}
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

        {/* Step trail */}
        <StepTrail currentStep={state.currentStep} />

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* Left column: wizard card + asesor */}
          <div
            className="flex flex-col flex-shrink-0"
            style={{ width: "58%", borderRight: "1px solid var(--border-ui)" }}
          >
            <WizardCard footer={footer}>{stepNode}</WizardCard>
            <AsesorPanel text={asesor.text} cierreComercial={asesor.cierreComercial} />
          </div>

          {/* Right column: preview bar + site preview */}
          <div className="flex-1 flex flex-col min-w-0" style={{ background: "var(--surface-page)" }}>
            <PreviewBar
              breakpoint={breakpoint}
              onChange={setBreakpoint}
              roiVisible={roiVisible}
            />
            <div className="flex-1 min-h-0 overflow-y-auto">
              <SitePreview state={state} breakpoint={breakpoint} />
            </div>
          </div>
        </div>
      </div>

      {/* Confirm exit dialog: aparece si hay cambios sin guardar */}
      {confirmClose && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="w1-confirm-title"
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
              width: 380,
              background: "#fff",
              borderRadius: 10,
              padding: 20,
              boxShadow: "0 16px 48px rgba(0,0,0,0.24)",
              gap: 16,
            }}
          >
            <div>
              <p
                id="w1-confirm-title"
                style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}
              >
                ¿Salir sin guardar?
              </p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Perderás los cambios que hiciste en este onboarding.
              </p>
            </div>
            <div className="flex justify-end" style={{ gap: 8 }}>
              <button
                type="button"
                onClick={() => setConfirmClose(false)}
                autoFocus
                className="transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  height: 30,
                  padding: "0 14px",
                  background: "#efefef",
                  border: "1px solid var(--border-ui)",
                  borderRadius: 6,
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  outlineColor: "var(--ring)",
                }}
              >
                Seguir editando
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmClose(false);
                  onClose();
                }}
                className="transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  height: 30,
                  padding: "0 14px",
                  background: "var(--destructive)",
                  border: "none",
                  borderRadius: 6,
                  fontSize: "var(--font-size-sm)",
                  fontWeight: 500,
                  color: "var(--destructive-foreground)",
                  cursor: "pointer",
                  outlineColor: "var(--destructive)",
                }}
              >
                Salir sin guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modal, document.body);
}
