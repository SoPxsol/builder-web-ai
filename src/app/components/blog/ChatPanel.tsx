import { useState } from "react";
import { Send, Sparkles } from "lucide-react";

interface Props {
  articleTitle: string;
}

interface Msg {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  "Escribí una introducción para este artículo",
  "Sugerí 3 subtítulos",
  "Mejorá el último párrafo",
  "Generá un consejo del concierge",
];

/**
 * ChatPanel — asistente de IA del editor de artículo (shell).
 *
 * Es la interfaz del flujo "editar con IA", equivalente al chat del builder.
 * TODO(backend): no hay endpoint de generación todavía. Por ahora responde con
 * un mensaje placeholder para que el flujo de conversación sea visible; cuando
 * exista el servicio, reemplazar `respond()` por la llamada real.
 */
export function ChatPanel({ articleTitle }: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");

  function send(text: string) {
    const clean = text.trim();
    if (!clean) return;
    setMessages((m) => [
      ...m,
      { role: "user", text: clean },
      {
        role: "assistant",
        text:
          "Pronto voy a poder ayudarte a redactar y mejorar este artículo. La generación con IA todavía no está conectada en el prototipo.",
      },
    ]);
    setDraft("");
  }

  return (
    <div className="flex flex-col" style={{ height: "100%" }}>
      {/* Cuerpo del chat */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "4px 2px" }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center" style={{ textAlign: "center", padding: "24px 8px", gap: 10 }}>
            <span
              aria-hidden="true"
              className="flex items-center justify-center"
              style={{ width: 40, height: 40, borderRadius: 10, background: "var(--ai-gradient)", color: "#fff" }}
            >
              <Sparkles size={18} />
            </span>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Editor IA</p>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
              Pedile a la IA que escriba o mejore "{articleTitle || "tu artículo"}". Te va a hacer preguntas antes de
              generar.
            </p>
            <div className="flex flex-col" style={{ gap: 6, width: "100%", marginTop: 6 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                  style={{
                    textAlign: "left",
                    padding: "8px 10px",
                    background: "var(--surface-page)",
                    border: "0.5px solid var(--border-ui)",
                    borderRadius: 7,
                    fontSize: 11,
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    outlineColor: "var(--accent-info)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: 10 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  padding: "8px 11px",
                  borderRadius: 10,
                  fontSize: 12,
                  lineHeight: 1.5,
                  background: m.role === "user" ? "var(--text-primary)" : "var(--surface-page)",
                  color: m.role === "user" ? "#fff" : "var(--text-primary)",
                  border: m.role === "user" ? "none" : "0.5px solid var(--border-ui)",
                }}
              >
                {m.text}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
        className="flex items-end"
        style={{
          gap: 8,
          marginTop: 10,
          padding: 8,
          background: "var(--surface-page)",
          border: "0.5px solid var(--border-ui)",
          borderRadius: 10,
          flexShrink: 0,
        }}
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(draft);
            }
          }}
          placeholder="Describí lo que necesitás…"
          rows={1}
          aria-label="Mensaje para la IA"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            fontSize: 12,
            lineHeight: 1.5,
            color: "var(--text-primary)",
            fontFamily: "inherit",
            maxHeight: 120,
          }}
        />
        <button
          type="submit"
          aria-label="Enviar"
          disabled={!draft.trim()}
          className="flex items-center justify-center transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            width: 30,
            height: 30,
            flexShrink: 0,
            background: draft.trim() ? "var(--brand)" : "var(--border-ui)",
            border: "none",
            borderRadius: 7,
            cursor: draft.trim() ? "pointer" : "default",
            outlineColor: "var(--brand)",
          }}
        >
          <Send size={14} style={{ color: "#fff" }} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
