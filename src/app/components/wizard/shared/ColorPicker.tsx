interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  hint?: string;
}

export function ColorPicker({ label, value, onChange, hint }: ColorPickerProps) {
  return (
    <div className="flex flex-col" style={{ gap: 4 }}>
      <label style={{ fontSize: 10, color: "var(--text-secondary)" }}>{label}</label>
      <div className="flex items-center" style={{ gap: 6 }}>
        <div
          className="relative focus-within:outline focus-within:outline-2 focus-within:outline-offset-2"
          style={{
            width: 28,
            height: 28,
            borderRadius: 5,
            border: "1px solid var(--border-ui)",
            background: value,
            cursor: "pointer",
            overflow: "hidden",
            outlineColor: "var(--accent-info)",
          }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`${label}: seleccionar color`}
            style={{
              opacity: 0,
              width: "100%",
              height: "100%",
              cursor: "pointer",
              border: "none",
              padding: 0,
              background: "transparent",
            }}
          />
        </div>
        <div
          aria-hidden="true"
          className="flex items-center"
          style={{
            minWidth: 90,
            height: 28,
            background: "var(--surface-page)",
            border: "1px solid var(--border-ui)",
            borderRadius: 5,
            padding: "0 8px",
            fontSize: "var(--font-size-sm)",
            color: "var(--text-primary)",
            fontFamily: "monospace",
          }}
        >
          {value.toUpperCase()}
        </div>
      </div>
      {hint && (
        <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{hint}</span>
      )}
    </div>
  );
}
