interface WizardFooterProps {
  onBack?: () => void;
  onSkip?: () => void;
  skipLabel?: string;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}

export function WizardFooter({
  onBack,
  onSkip,
  skipLabel = "Completar después",
  onNext,
  nextLabel = "Continuar →",
  nextDisabled = false,
}: WizardFooterProps) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ height: 52, padding: "0 24px", background: "#fff" }}
    >
      <div className="flex items-center gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              height: 28,
              padding: "0 12px",
              background: "#efefef",
              border: "1px solid var(--border-ui)",
              borderRadius: 5,
              fontSize: "var(--font-size-sm)",
              color: "var(--text-secondary)",
              outlineColor: "var(--ring)",
            }}
          >
            ← Atrás
          </button>
        ) : (
          <span />
        )}
      </div>

      <div className="flex items-center gap-4">
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:rounded-sm"
            style={{
              background: "transparent",
              border: "none",
              fontSize: "var(--font-size-sm)",
              color: "var(--text-tertiary)",
              padding: "4px 6px",
              outlineColor: "var(--ring)",
              textDecoration: "underline",
              textUnderlineOffset: 2,
            }}
          >
            {skipLabel}
          </button>
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            height: 28,
            padding: "0 14px",
            background: "var(--wizard-coral)",
            borderRadius: 6,
            fontSize: "var(--font-size-sm)",
            fontWeight: 500,
            color: "#fff",
            border: "none",
            outlineColor: "var(--wizard-coral)",
            outlineOffset: 2,
          }}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
