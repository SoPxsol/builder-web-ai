/**
 * TextField — componente primitivo de PXSOL Web DS
 *
 * Patrón extraído de PropiedadesView.tsx (función Field interna + fieldStyle).
 * Es un drop-in exacto: mismas medidas, mismo focus ring azul (--accent-info),
 * mismo estado invalid (border --destructive + aria-invalid + mensaje de error
 * con icono AlertCircle), misma estructura label → input → error-message.
 *
 * Por qué --accent-info para el focus ring del input:
 *   El contrato semántico define --accent-info (azul) para hints, selección y
 *   focus rings de inputs. El --brand (coral) se reserva para CTAs primarios.
 *   PropiedadesView usaba outlineColor: "var(--brand)" en el focus — eso era un
 *   error de consistencia ya detectado. Este componente lo corrige.
 *
 * Limitación de scope:
 *   Solo cubre el input estándar de una línea. Los casos especiales (slug con
 *   prefijo pxsol.com/, search embed, select, textarea) quedan como patrones
 *   de composición ad-hoc — demasiado divergentes para un solo componente.
 */

import { AlertCircle } from "lucide-react";
import type { InputHTMLAttributes } from "react";

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  /** Texto del label visible. */
  label: string;
  /** id del input — conecta label, aria-describedby y el mensaje de error. */
  id: string;
  /** Valor controlado. */
  value: string;
  /** Handler de cambio de valor. Recibe el string directamente (sin SyntheticEvent). */
  onChange: (value: string) => void;
  /** Mensaje de error. Si está presente activa el estado invalid. */
  error?: string;
  /** Marca el campo como requerido (asterisco en label + required en input). */
  required?: boolean;
  /** type del input. Default: "text". */
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  /** placeholder del input. */
  placeholder?: string;
  /** Modo de teclado virtual en mobile. */
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  /** onBlur opcional (ej: para validación touch). */
  onBlur?: () => void;
}

/* ─── Estilos ────────────────────────────────────────────────────────────── */

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
  color: "var(--text-secondary)",
  marginBottom: 5,
};

const requiredMarkStyle: React.CSSProperties = {
  color: "var(--destructive)",
  marginLeft: 2,
  // No forma parte de la accesibilidad del required — el input tiene
  // el atributo required nativo que los lectores de pantalla anuncian.
  // El asterisco es solo indicación visual.
};

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    // Dimensiones — calibradas contra PropiedadesView.fieldStyle()
    height: 34,
    width: "100%",
    paddingLeft: 10,
    paddingRight: 10,
    // Forma
    borderRadius: "var(--radius-nav)", // 6px
    border: hasError ? "1px solid var(--destructive)" : "0.5px solid var(--border-ui)",
    // Superficie
    background: "var(--surface-page)",
    // Tipografía
    fontSize: "var(--font-size-md)",
    color: "var(--text-primary)",
    fontFamily: "var(--font-sans)",
    // Focus ring — --accent-info (azul) según contrato semántico.
    // La clase "focus-visible:outline focus-visible:outline-2" en el input
    // activa el outline; outlineColor lo colorea.
    outlineColor: hasError ? "var(--destructive)" : "var(--accent-info)",
    outlineOffset: 2,
    // Resets
    boxSizing: "border-box",
  };
}

const errorStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  marginTop: 4,
  fontSize: "var(--font-size-xs)",
  color: "var(--destructive)",
  lineHeight: 1.4,
};

/* ─── Componente ─────────────────────────────────────────────────────────── */

export function TextField({
  label,
  id,
  value,
  onChange,
  error,
  required,
  type = "text",
  placeholder,
  inputMode,
  onBlur,
  // Capturamos el resto de props del input para pasarlo con spread
  ...rest
}: TextFieldProps) {
  const hasError = !!error;
  const errorId = `${id}-err`;

  return (
    <div>
      <label htmlFor={id} style={labelStyle}>
        {label}
        {required && (
          <span aria-hidden="true" style={requiredMarkStyle}>
            *
          </span>
        )}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        inputMode={inputMode}
        required={required}
        aria-invalid={hasError ? true : undefined}
        aria-describedby={hasError ? errorId : undefined}
        aria-required={required ? true : undefined}
        /**
         * focus-visible:outline + focus-visible:outline-2 activan el ring
         * del navegador usando outlineColor definido en el style inline.
         * Patrón idéntico al de PropiedadesView para que el swap sea invisible.
         */
        className="focus-visible:outline focus-visible:outline-2"
        style={inputStyle(hasError)}
        {...rest}
      />

      {hasError && (
        <p id={errorId} role="alert" style={errorStyle}>
          <AlertCircle
            size={10}
            aria-hidden="true"
            style={{ flexShrink: 0 }}
          />
          {error}
        </p>
      )}
    </div>
  );
}
