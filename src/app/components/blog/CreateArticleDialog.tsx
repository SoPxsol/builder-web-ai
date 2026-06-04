import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../ui/button";

interface Props {
  open: boolean;
  /** Dominio del sitio activo — se muestra para anticipar la URL del artículo. */
  contextLabel?: string;
  onCancel: () => void;
  /** Confirma la creación. Recibe el título ya recortado (no vacío). */
  onCreate: (title: string) => void;
}

/**
 * Diálogo de creación de artículo — mínima fricción.
 *
 * Solo pide el título (ver brief §2). Al confirmar, el caller hace el
 * optimistic update en la lista de Blog y rutea directo al editor; este
 * diálogo no conoce nada de ese flujo, solo entrega el título.
 */
export function CreateArticleDialog({ open, contextLabel, onCancel, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset + autofocus al abrir.
  useEffect(() => {
    if (!open) return;
    setTitle("");
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Foco diferido para que el input ya esté montado.
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
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
      window.clearTimeout(id);
    };
  }, [open, onCancel]);

  if (!open) return null;

  const trimmed = title.trim();
  const canCreate = trimmed.length > 0;

  function submit() {
    if (!canCreate) return;
    onCreate(trimmed);
  }

  const overlay = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-article-title"
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col"
        style={{
          width: 440,
          maxWidth: "calc(100vw - 32px)",
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
          gap: 18,
        }}
      >
        <div>
          <p
            id="create-article-title"
            style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}
          >
            Crear nuevo artículo
          </p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Empezá con un título. Después podés ajustar contenido, portada, URL y
            categoría en el editor.
          </p>
        </div>

        <div>
          <label
            htmlFor="create-article-input"
            style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}
          >
            Título del artículo
          </label>
          <input
            ref={inputRef}
            id="create-article-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Ej: Los mejores miradores de la cordillera"
            className="focus-visible:outline focus-visible:outline-2"
            style={{
              width: "100%",
              height: 38,
              padding: "0 12px",
              background: "var(--surface-page)",
              border: "0.5px solid var(--border-ui)",
              borderRadius: 8,
              fontSize: 14,
              color: "var(--text-primary)",
              outline: "none",
              outlineColor: "var(--accent-info)",
              outlineOffset: 2,
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
          {contextLabel && (
            <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 8 }}>
              Se publicará en{" "}
              <span style={{ color: "var(--text-secondary)" }}>
                {contextLabel}/blog/…
              </span>
            </p>
          )}
        </div>

        <div className="flex justify-end" style={{ gap: 8 }}>
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={submit} disabled={!canCreate}>
            Crear
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
