import { useState } from "react";
import { ChevronDown, Headphones } from "lucide-react";

interface AsesorPanelProps {
  text: string;
  cierreComercial?: string;
}

export function AsesorPanel({ text, cierreComercial }: AsesorPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        background: "var(--wizard-blue-light)",
        borderTop: "1px solid var(--wizard-blue-border)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 w-full select-none cursor-pointer"
        style={{
          padding: "7px 20px",
          background: "transparent",
          border: "none",
          textAlign: "left",
        }}
      >
        <Headphones size={12} style={{ color: "var(--wizard-blue-text)", flexShrink: 0 }} aria-hidden="true" />
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            color: "var(--wizard-blue-text)",
            letterSpacing: "0.02em",
          }}
        >
          Nota del asesor
        </span>
        <ChevronDown
          size={10}
          className="ml-auto"
          aria-hidden="true"
          style={{
            color: "var(--wizard-blue-text)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      <div
        style={{
          maxHeight: open ? 400 : 0,
          overflow: "hidden",
          transition: "max-height 0.25s ease",
        }}
      >
        <div
          style={{
            padding: "0 20px 10px",
            fontSize: "var(--font-size-sm)",
            color: "var(--wizard-blue-text)",
            lineHeight: 1.55,
          }}
        >
          <p>{text}</p>
          {cierreComercial && (
            <div
              className="mt-1.5"
              style={{
                background: "var(--wizard-amber-light)",
                border: "1px solid var(--wizard-amber-border-strong)",
                borderRadius: 6,
                padding: 10,
                fontSize: "var(--font-size-sm)",
                color: "var(--wizard-amber-text)",
                lineHeight: 1.55,
              }}
            >
              {cierreComercial}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
