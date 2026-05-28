import { useState } from "react";
import { Send, Sparkles, X } from "lucide-react";
import { AI_SUGGESTION_CHIPS } from "../../types/builder";

interface AiAssistantPanelProps {
  onClose: () => void;
  onSubmit: (prompt: string) => void;
}

export function AiAssistantPanel({ onClose, onSubmit }: AiAssistantPanelProps) {
  const [prompt, setPrompt] = useState("");

  function handleSubmit() {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setPrompt("");
  }

  function handleChipClick(chip: string) {
    setPrompt(chip);
  }

  return (
    <aside
      role="complementary"
      aria-label="Asistente de IA"
      className="flex flex-col flex-shrink-0"
      style={{
        width: 320,
        background: "#fff",
        borderLeft: "0.5px solid var(--border-ui)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center"
        style={{
          padding: "10px 14px",
          borderBottom: "0.5px solid var(--border-ui)",
          gap: 10,
        }}
      >
        <div
          aria-hidden="true"
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 24,
            height: 24,
            background: "var(--ai-gradient)",
            borderRadius: 6,
          }}
        >
          <Sparkles size={12} style={{ color: "#fff" }} aria-hidden="true" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-primary)",
              lineHeight: 1.2,
            }}
          >
            AI Assistant
          </p>
          <p
            style={{
              fontSize: 9,
              color: "var(--text-tertiary)",
              lineHeight: 1.2,
              marginTop: 1,
            }}
          >
            Pxsol — sin límite mensual
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar asistente"
          className="flex items-center justify-center transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
          style={{
            width: 22,
            height: 22,
            background: "transparent",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            outlineColor: "var(--ring)",
          }}
        >
          <X size={12} aria-hidden="true" style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>

      {/* Empty state */}
      <div
        className="flex-1 overflow-y-auto flex flex-col items-center"
        style={{ padding: "40px 20px 24px", gap: 12 }}
      >
        <div
          aria-hidden="true"
          className="flex items-center justify-center"
          style={{
            width: 56,
            height: 56,
            background: "var(--ai-gradient)",
            borderRadius: "50%",
            boxShadow: "0 4px 16px var(--ai-glow)",
            marginBottom: 4,
          }}
        >
          <Sparkles size={22} style={{ color: "#fff" }} aria-hidden="true" />
        </div>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-primary)",
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          Pedidos con sugerencias de IA
        </p>
        <p
          style={{
            fontSize: 11,
            color: "var(--text-secondary)",
            textAlign: "center",
            lineHeight: 1.5,
            maxWidth: 240,
            marginBottom: 8,
          }}
        >
          Pedile cambios, propuestas o revisiones en lenguaje natural.
        </p>

        {/* Chips de sugerencia */}
        <div className="flex flex-col w-full" style={{ gap: 6, marginTop: 4 }}>
          {AI_SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChipClick(chip)}
              className="text-left transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
              style={{
                padding: "8px 10px",
                background: "var(--surface-page)",
                border: "0.5px solid var(--border-ui)",
                borderRadius: 6,
                fontSize: 11,
                color: "var(--text-primary)",
                lineHeight: 1.4,
                cursor: "pointer",
                outlineColor: "var(--ring)",
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Input + footer */}
      <div
        style={{
          padding: "10px 12px 8px",
          borderTop: "0.5px solid var(--border-ui)",
        }}
      >
        <label
          className="flex items-end"
          style={{
            background: "var(--surface-page)",
            border: "0.5px solid var(--border-ui)",
            borderRadius: 8,
            padding: "6px 8px",
            gap: 6,
          }}
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Pedí cambios al asistente…"
            aria-label="Mensaje para el asistente"
            rows={1}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 11,
              color: "var(--text-primary)",
              fontFamily: "inherit",
              resize: "none",
              lineHeight: 1.4,
              minHeight: 18,
              maxHeight: 96,
            }}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!prompt.trim()}
            aria-label="Enviar mensaje"
            className="flex items-center justify-center transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{
              width: 24,
              height: 24,
              background: prompt.trim()
                ? "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)"
                : "var(--border-ui)",
              border: "none",
              borderRadius: 5,
              cursor: prompt.trim() ? "pointer" : "not-allowed",
              flexShrink: 0,
              outlineColor: "var(--ring)",
            }}
          >
            <Send size={10} style={{ color: "#fff" }} aria-hidden="true" />
          </button>
        </label>
        <p
          style={{
            fontSize: 9,
            color: "var(--text-tertiary)",
            textAlign: "center",
            marginTop: 6,
            lineHeight: 1.3,
          }}
        >
          Pxsol: prompts sin límite mensual
        </p>
      </div>
    </aside>
  );
}
