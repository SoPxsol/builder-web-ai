interface ExitConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ExitConfirmDialog({
  open,
  title = "¿Salir sin guardar?",
  description = "Perderás los cambios que no guardaste.",
  cancelLabel = "Seguir editando",
  confirmLabel = "Salir sin guardar",
  onCancel,
  onConfirm,
}: ExitConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="exit-confirm-title"
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
          boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
          gap: 16,
        }}
      >
        <div>
          <p
            id="exit-confirm-title"
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            {title}
          </p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{description}</p>
        </div>
        <div className="flex justify-end" style={{ gap: 8 }}>
          <button
            type="button"
            onClick={onCancel}
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
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              height: 30,
              padding: "0 14px",
              background: "var(--destructive)",
              border: "none",
              borderRadius: 6,
              fontSize: "var(--font-size-sm)",
              fontWeight: 500,
              color: "#fff",
              cursor: "pointer",
              outlineColor: "var(--destructive)",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
