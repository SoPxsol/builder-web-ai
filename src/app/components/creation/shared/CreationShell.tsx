import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, X } from "lucide-react";
import type { ReactNode } from "react";
import type { StepDef } from "../../../types/creation";
import { StepBar } from "./StepBar";
import { ExitConfirmDialog } from "./ExitConfirmDialog";
import { FOCUSABLE_SELECTOR } from "../../../utils/focus";

export interface CreationShellProps {
  isOpen: boolean;
  /** Nombre del recurso que se está creando (ej: "Nuevo popup"). */
  resourceName: string;
  /** Contexto opcional al lado del nombre (ej: "academiapx.com"). */
  contextLabel?: string;
  /** Steps del wizard. Si no se pasan, no se muestra la StepBar. */
  steps?: StepDef[];
  /** Index del paso actual (0-based). */
  activeStepIndex?: number;
  /** Click en step completado → volver a ese paso. */
  onStepClick?: (index: number) => void;
  /** Si hay cambios sin guardar, "Cancelar" pide confirmación. */
  hasUnsavedChanges?: boolean;
  /** Cerrar el modal. */
  onClose: () => void;
  /** Click en el botón primario (Continuar / Publicar / Activar). */
  onPrimary: () => void;
  /** Label del CTA principal del footer. */
  primaryLabel: string;
  /** Si está deshabilitado el primary (validación). */
  primaryDisabled?: boolean;
  /** Panel izquierdo (formulario). Scrollea internamente. */
  leftPanel: ReactNode;
  /** Preview / canvas a la derecha. Si es null, el leftPanel ocupa todo el ancho. */
  preview?: ReactNode;
  /** Si true, el preview/canvas no se renderiza y el leftPanel queda centrado con max-width. */
  centeredLayout?: boolean;
}

export function CreationShell({
  isOpen,
  resourceName,
  contextLabel,
  steps,
  activeStepIndex = 0,
  onStepClick,
  hasUnsavedChanges = false,
  onClose,
  onPrimary,
  primaryLabel,
  primaryDisabled = false,
  leftPanel,
  preview,
  centeredLayout = false,
}: CreationShellProps) {
  const [confirmExit, setConfirmExit] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setConfirmExit(false);
      return;
    }

    previouslyFocusedRef.current = (document.activeElement as HTMLElement) ?? null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const modal = modalRef.current;
    if (modal) {
      const first = modal.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      first?.focus();
    }

    function attemptClose() {
      if (hasUnsavedChanges) setConfirmExit(true);
      else onClose();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        if (confirmExit) setConfirmExit(false);
        else attemptClose();
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
  }, [isOpen, hasUnsavedChanges, onClose, confirmExit]);

  if (!isOpen) return null;

  function attemptCloseClick() {
    if (hasUnsavedChanges) setConfirmExit(true);
    else onClose();
  }

  const totalSteps = steps?.length ?? 0;
  const showBack = activeStepIndex > 0 && onStepClick && totalSteps > 0;

  const overlay = (
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
        aria-labelledby="creation-title"
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
        {/* Header del modal — patrón W1/W2 */}
        <div
          className="flex items-center"
          style={{
            height: 48,
            padding: "0 16px",
            borderBottom: "1px solid var(--border-ui)",
            background: "#fff",
            flexShrink: 0,
            position: "relative",
          }}
        >
          <div className="flex items-center" style={{ gap: 8 }}>
            <div
              aria-hidden="true"
              style={{
                width: 18,
                height: 18,
                background: "var(--brand)",
                borderRadius: "var(--radius-dot)",
              }}
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
            id="creation-title"
            className="absolute"
            style={{
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "var(--font-size-md)",
              fontWeight: 600,
              color: "var(--text-primary)",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>{resourceName}</span>
            {contextLabel && (
              <>
                <span aria-hidden="true" style={{ color: "var(--border-ui)" }}>
                  ›
                </span>
                <span
                  style={{
                    fontSize: "var(--font-size-sm)",
                    fontWeight: 400,
                    color: "var(--text-tertiary)",
                  }}
                >
                  {contextLabel}
                </span>
              </>
            )}
          </h2>
          <button
            type="button"
            onClick={attemptCloseClick}
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

        {/* Steps Bar */}
        {steps && (
          <StepBar
            steps={steps}
            activeIndex={activeStepIndex}
            onStepClick={onStepClick}
          />
        )}

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {centeredLayout ? (
            <div
              className="flex-1 overflow-y-auto"
              style={{
                background: "var(--surface-page)",
                padding: 24,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div style={{ width: "100%", maxWidth: 760 }}>{leftPanel}</div>
            </div>
          ) : (
            <>
              <div
                className="flex flex-col flex-shrink-0 overflow-y-auto"
                style={{
                  width: "42%",
                  background: "#fff",
                  borderRight: "1px solid var(--border-ui)",
                }}
              >
                {leftPanel}
              </div>
              <div
                className="flex-1 overflow-y-auto"
                style={{ background: "var(--surface-page)" }}
              >
                {preview}
              </div>
            </>
          )}
        </div>

        {/* Footer del modal — patrón W1/W2 */}
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
          <div className="flex items-center gap-3">
            {showBack ? (
              <button
                type="button"
                onClick={() => onStepClick(activeStepIndex - 1)}
                className="flex items-center transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  height: 28,
                  padding: "0 12px",
                  background: "#efefef",
                  border: "1px solid var(--border-ui)",
                  borderRadius: 5,
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  gap: 4,
                  outlineColor: "var(--ring)",
                }}
              >
                <ArrowLeft size={11} aria-hidden="true" />
                Atrás
              </button>
            ) : (
              <span />
            )}
          </div>

          <div className="flex items-center" style={{ gap: 12 }}>
            <button
              type="button"
              onClick={attemptCloseClick}
              className="transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: "transparent",
                border: "none",
                padding: "4px 6px",
                fontSize: "var(--font-size-sm)",
                color: "var(--text-tertiary)",
                cursor: "pointer",
                borderRadius: 4,
                outlineColor: "var(--ring)",
                textDecoration: "underline",
                textUnderlineOffset: 2,
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onPrimary}
              disabled={primaryDisabled}
              className="transition-opacity hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
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
              {primaryLabel}
            </button>
          </div>
        </div>
      </div>

      <ExitConfirmDialog
        open={confirmExit}
        onCancel={() => setConfirmExit(false)}
        onConfirm={() => {
          setConfirmExit(false);
          onClose();
        }}
      />
    </div>
  );

  return createPortal(overlay, document.body);
}
