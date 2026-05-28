interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  ariaLabel: string;
  /** Si el toggle no debe poder desactivarse (ej: idioma español). */
  disabled?: boolean;
}

export function Toggle({ checked, onChange, ariaLabel, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => {
        if (!disabled) onChange(!checked);
      }}
      disabled={disabled}
      className="transition-colors duration-200 flex-shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        width: 28,
        height: 16,
        borderRadius: 999,
        // Verde cuando activo, gris cuando inactivo. El brand/coral se reserva
        // para CTAs primarios — los toggles comunican estado, no son acción.
        background: checked ? "var(--status-active)" : "var(--border-ui)",
        border: "none",
        padding: 0,
        position: "relative",
        cursor: disabled ? "not-allowed" : "pointer",
        outlineColor: "var(--status-active)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 2,
          left: 0,
          width: 12,
          height: 12,
          background: "#fff",
          borderRadius: "50%",
          boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
          transition: "transform 0.2s ease",
          transform: `translateX(${checked ? 14 : 2}px)`,
        }}
      />
    </button>
  );
}
