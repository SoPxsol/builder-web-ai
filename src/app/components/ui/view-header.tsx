import type { ReactNode } from "react";
import type { View } from "../../types";
import { BackButton } from "./back-button";

interface ViewHeaderProps {
  /** Vista a la que vuelve el back. Si no se pasa, no se renderiza el back. */
  backTo?: View;
  backLabel?: string;
  /** Texto pequeño sobre el título (típicamente el nombre del sitio activo). */
  eyebrow?: string;
  title: string;
  description?: string;
  navigate: (view: View, siteId?: number) => void;
  /** Acción primaria a la derecha (botón, badge o cualquier nodo). */
  action?: ReactNode;
}

/**
 * Header estándar de vista. Patrón unificado con TemplatesView:
 * back cuadrado a la izquierda, título 22/700, descripción opcional, acción a la derecha.
 * Vive inline dentro del padding del contenido (no es una barra sticky con border-b).
 */
export function ViewHeader({
  backTo,
  backLabel,
  eyebrow,
  title,
  description,
  navigate,
  action,
}: ViewHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {backTo && (
          <div style={{ marginTop: 4 }}>
            <BackButton to={backTo} navigate={navigate} label={backLabel} />
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-tertiary)", marginBottom: 2 }}>
              {eyebrow}
            </p>
          )}
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, lineHeight: 1.2 }}>
            {title}
          </h1>
          {description && (
            <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.5 }}>
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
