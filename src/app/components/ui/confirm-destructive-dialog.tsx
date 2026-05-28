import { useEffect, useRef } from "react";

interface ConfirmDestructiveDialogProps {
  open: boolean;
  title: string;
  description?: string;
  resourceName?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDestructiveDialog({
  open,
  title,
  description,
  resourceName,
  cancelLabel = "Cancelar",
  confirmLabel = "Eliminar",
  onCancel,
  onConfirm,
}: ConfirmDestructiveDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCancel();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-destructive-title"
      aria-describedby="confirm-destructive-desc"
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col"
        style={{
          width: 400,
          background: "#fff",
          borderRadius: 10,
          padding: 20,
          boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
          gap: 16,
        }}
      >
        <div>
          <p
            id="confirm-destructive-title"
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            {title}
          </p>
          <p
            id="confirm-destructive-desc"
            style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}
          >
            {description}
            {resourceName && (
              <>
                {" "}
                <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  {resourceName}
                </strong>
              </>
            )}
            {description || resourceName ? " Esta acción no se puede deshacer." : null}
          </p>
        </div>
        <div className="flex justify-end" style={{ gap: 8 }}>
          <button
            ref={cancelRef}
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
              color: "var(--destructive-foreground)",
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
