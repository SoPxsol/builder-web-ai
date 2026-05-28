/**
 * Button — componente primitivo de PXSOL Web DS
 *
 * Medidas calibradas contra los call-sites reales:
 *   sm → h-28 (WizardFooter, CreationShell footer, VersionesView "Restaurar")
 *   md → h-32..34 (ViewHeader actions: PaginasView, PopupsView, DashboardView)
 *
 * Variantes alineadas con el contrato de colores semánticos de theme.css:
 *   primary     → --brand (coral). Solo UNA acción primaria visible por pantalla.
 *   secondary   → #efefef / --border-ui. Acciones neutras, "Atrás", dialogs cancel.
 *   ghost       → transparent + --accent-info. Links secundarios, "Cancelar", skip.
 *   destructive → --destructive. Solo para eliminar/acciones irreversibles.
 *
 * El componente es un drop-in visual para los inline existentes: mismos tokens,
 * mismo hover/focus/disabled, sin nueva dependencia de estilado.
 */

import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/* ─── Estilos base inline ──────────────────────────────────────────────────── */

/**
 * Alturas calibradas contra los componentes existentes:
 * - sm: h=28 → WizardFooter, CreationShell footer, ConfirmDestructiveDialog
 * - md: h=32 → ViewHeader actions (PaginasView h-8, PopupsView h-8, DashboardView h-9≈36)
 *
 * Nota: los call-sites usan h-8 (32px) y h-9 (36px) con Tailwind. Elegimos 32
 * como tamaño estándar md y dejamos que el caller ajuste height vía style si
 * necesita la variante h-9 (DashboardView welcome banner — caso aislado).
 */
const SIZE: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    height: 28,
    padding: "0 12px",
    fontSize: "var(--font-size-sm)",
    borderRadius: "var(--radius-nav)", // 6px — igual que WizardFooter y CreationShell
  },
  md: {
    height: 32,
    padding: "0 14px",
    fontSize: "var(--font-size-md)",
    borderRadius: "var(--radius-nav)",
  },
};

/**
 * Colores por variante. outlineColor coincide con el color de fondo del botón
 * para que el focus ring sea coherente con el contexto visual — patrón usado
 * en todos los call-sites existentes.
 */
const VARIANT_STYLE: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "var(--brand)",
    color: "#ffffff",
    border: "none",
    outlineColor: "var(--brand)",
  },
  secondary: {
    background: "#efefef",
    color: "var(--text-secondary)",
    border: "1px solid var(--border-ui)",
    outlineColor: "var(--ring)",
  },
  ghost: {
    background: "transparent",
    color: "var(--accent-info)",
    border: "none",
    outlineColor: "var(--accent-info)",
    textDecoration: "underline",
    textDecorationThickness: "1px",
    textUnderlineOffset: "2px",
  },
  destructive: {
    background: "var(--destructive)",
    color: "var(--destructive-foreground)", // #ffffff — definido en theme.css
    border: "none",
    outlineColor: "var(--destructive)",
  },
};

/* ─── Componente ────────────────────────────────────────────────────────────── */

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  children,
  style,
  ...rest
}: ButtonProps) {
  const variantStyle = VARIANT_STYLE[variant];
  const sizeStyle = SIZE[size];

  const computedStyle: React.CSSProperties = {
    // Layout
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexShrink: 0,
    width: fullWidth ? "100%" : undefined,
    // Resets — los `<button>` heredan estilos del @layer base de theme.css
    fontFamily: "var(--font-sans)",
    fontWeight: 500,
    lineHeight: 1,
    cursor: disabled ? "not-allowed" : "pointer",
    userSelect: "none",
    // outlineOffset: los call-sites usan 2px de forma consistente
    outlineOffset: 2,
    // Merge orden: size → variant → caller override
    ...sizeStyle,
    ...variantStyle,
    ...style,
  };

  return (
    <button
      type="button"
      disabled={disabled}
      /**
       * Las clases de Tailwind manejan los estados interactivos que no pueden
       * expresarse con style={{ }} inline (pseudo-clases hover, focus-visible,
       * disabled). Este es el único uso de clases en el componente — coherente
       * con el patrón existente en WizardFooter, CreationShell, PropiedadesView.
       */
      className="transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      style={computedStyle}
      {...rest}
    >
      {leftIcon && (
        <span aria-hidden="true" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          {leftIcon}
        </span>
      )}
      {children}
      {rightIcon && (
        <span aria-hidden="true" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          {rightIcon}
        </span>
      )}
    </button>
  );
}
