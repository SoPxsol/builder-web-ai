/**
 * SeoAssistant.tsx — Asistente IA para SEO/GEO (chat simplificado)
 * WEB-737 | Rama: sofia/web-737-gestor-redes-sociales
 *
 * Portado desde pxsol-home-mkt-division/src/screens/seoGeo/Assistant.jsx.
 * La fuente usaba <ChatFlow> (componente externo no disponible en el Builder);
 * acá se implementa un chat inline equivalente con datos del demo.
 *
 * Accesibilidad carry-over:
 * - role="log" + aria-live="polite" en el hilo de mensajes.
 * - Sugerencias rápidas como botones con texto descriptivo.
 * - Focus en el input tras enviar.
 * - Indicador de "escribiendo" con role="status".
 */

import { useEffect, useId, useRef, useState } from "react";
import { Bot, CornerDownLeft, Sparkles, User } from "lucide-react";
import { Button } from "../ui/button";
import { useSeoGeo } from "./SeoGeoContext";

/* ────────────────────────────────────────────────────────────────────────────
 * Tipos
 * ──────────────────────────────────────────────────────────────────────────── */

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Respuestas de demo
 * ──────────────────────────────────────────────────────────────────────────── */

const QUICK_PROMPTS = [
  "¿Cómo mejoro mi visibilidad en ChatGPT?",
  "¿Qué keywords tengo como oportunidad?",
  "Explicame qué es GEO y cómo impacta en mi hotel",
  "¿Cuál debería ser mi próxima acción?",
];

const DEMO_RESPONSES: Record<string, string> = {
  "¿Cómo mejoro mi visibilidad en ChatGPT?":
    "Para mejorar tu visibilidad en ChatGPT hay tres palancas principales: **1) Fuentes de alta autoridad** — estar listado en TripAdvisor, Condé Nast, Booking y medios editoriales que ChatGPT indexa. **2) Contenido semántico** — páginas con preguntas y respuestas que coincidan con cómo los viajeros le hablan a la IA. **3) Consistencia de datos** — el nombre, teléfono y dirección tienen que ser iguales en todos tus listados. Tu hotel ya tiene buenas fuentes; la brecha está en el FAQ y en keywords de parejas (luna de miel, jacuzzi) donde no tenés landing dedicada.",
  "¿Qué keywords tengo como oportunidad?":
    "Basándome en tu GSC, tenés 8 keywords en posición 6-15 con volumen real. Las más interesantes: **\"hotel cartagena dentro muralla\"** (pos. 4.1, 12.7k impresiones — una landing específica puede llevarte al top 3), **\"hoteles cartagena con jacuzzi\"** (pos. 8.2, 7.1k impresiones — la Suite Master ya tiene jacuzzi pero no hay landing dedicada), **\"luna de miel cartagena hotel\"** (pos. 14.6, 3.2k — mucho potencial, muy poca competencia directa). Las tres juntas representan un potencial de +400 clics/mes.",
  "Explicame qué es GEO y cómo impacta en mi hotel":
    "**GEO = Generative Engine Optimization.** Mientras el SEO clásico te posiciona en Google para que el humano haga clic, el GEO te posiciona para que los motores de IA (ChatGPT, Perplexity, Google AI Overviews) te mencionen directamente en sus respuestas. Para un hotel boutique en Cartagena, cuando alguien le pregunta a ChatGPT \"¿dónde hospedarse en la ciudad amurallada?\" queremos que diga: Hotel Azul Marino — no que devuelva un link a Booking. Eso se logra con fuentes de autoridad, contenido semántico y datos estructurados (Schema.org). Tu score GEO actual es 64 — podemos llevarlo a 78+ en 3 meses con las acciones correctas.",
  "¿Cuál debería ser mi próxima acción?":
    "La acción de mayor impacto inmediato es **crear una landing dedicada para \"hotel con jacuzzi privado en Cartagena\"**. Razones: (1) La Suite Master ya tiene jacuzzi — el producto existe, solo falta la página. (2) La keyword está en posición 8 con buen volumen. (3) ChatGPT ya te menciona en esta intención pero cita la homepage; con una landing específica, la mención será más precisa y el CTR subirá. Tiempo estimado de implementación: 1 día. Tiempo para ver resultado en GSC: 3-4 semanas.",
};

function getResponse(input: string): string {
  const normalized = input.trim().toLowerCase();
  for (const [key, val] of Object.entries(DEMO_RESPONSES)) {
    if (key.toLowerCase() === normalized) return val;
  }
  if (normalized.includes("jacuzzi") || normalized.includes("suite"))
    return "La Suite Master con Terraza es tu habitación insignia y uno de los mayores activos para GEO. La keyword \"hotel jacuzzi privado cartagena\" tiene potencial. Creá una landing dedicada y verás un salto en posición y en menciones de IA en 3-4 semanas.";
  if (normalized.includes("competidor") || normalized.includes("competencia"))
    return "Tu principal competidor en GEO es Casa San Agustín (score 71, igual que vos). La diferencia está en el volumen de fuentes: ellos tienen mención en NYT Travel que vos todavía no. Ese es tu gap más importante para cerrar en autoridad editorial.";
  if (normalized.includes("blog") || normalized.includes("contenido"))
    return "El blog es una de las mejores herramientas para GEO porque genera el tipo de texto conversacional que los LLMs leen. Priorizá guías de destino largas (1.500+ palabras) con preguntas frecuentes integradas. Tu primer artículo sugerido: \"Dónde hospedarse en Cartagena — guía honesta\" — ya está en el generador listo para publicar.";
  return "Esa es una buena pregunta para analizar. Basándome en tus datos actuales (score global 71, GEO 64, 14 menciones en IA esta semana), tu foco principal debería estar en ampliar tus fuentes de autoridad editorial y crear contenido de long-tail semántico. ¿Querés que profundice en alguno de esos dos ejes?";
}

/* ────────────────────────────────────────────────────────────────────────────
 * Bubble de mensaje
 * ──────────────────────────────────────────────────────────────────────────── */

function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      style={{ maxWidth: "100%" }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 32, height: 32, borderRadius: "50%",
          background: isUser ? "var(--surface-page)" : "var(--brand)",
          border: isUser ? "0.5px solid var(--border-ui)" : "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        {isUser
          ? <User size={14} style={{ color: "var(--text-secondary)" }} />
          : <Bot size={14} style={{ color: "#fff" }} />
        }
      </div>
      {/* Burbuja */}
      <div
        style={{
          maxWidth: "75%",
          padding: "var(--space-3) var(--space-3)",
          borderRadius: "var(--radius-card)",
          background: isUser ? "var(--surface-page)" : "var(--surface-card)",
          border: "0.5px solid var(--border-ui)",
          fontSize: "var(--font-size-md)",
          color: "var(--text-primary)",
          lineHeight: 1.65,
          /* Markdown-ish: bold via CSS no dinámico en JSX — texto se muestra tal cual */
        }}
      >
        {msg.content}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Componente principal
 * ──────────────────────────────────────────────────────────────────────────── */

export function SeoAssistant() {
  const { geoQueries, suggestions } = useSeoGeo();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hola, soy tu asistente de SEO y GEO. Puedo ayudarte a entender los datos de tu hotel, sugerirte acciones concretas y explicarte cómo mejorar tu visibilidad tanto en Google como en los motores de IA como ChatGPT y Perplexity.\n\nTu score global actual es 71/100 — hay espacio concreto para subir. ¿Por dónde querés empezar?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const logId = useId();
  const typingId = useId();

  // Auto-scroll al final cuando llegan mensajes
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = { id: `u${Date.now()}`, role: "user", content: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    const delay = 800 + Math.floor(trimmed.length * 6);
    setTimeout(() => {
      const assistantMsg: Message = {
        id: `a${Date.now()}`,
        role: "assistant",
        content: getResponse(trimmed),
      };
      setMessages((m) => [...m, assistantMsg]);
      setTyping(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }, Math.min(delay, 2200));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    // Antes: height: calc(100vh - 160px) — asumía viewport completo.
    // En el Builder el contenedor ya es flex-1 overflow-y-auto (SeoGeoSuiteView).
    // Altura fija razonable para evitar overflow doble y scroll invisible.
    <div
      style={{
        display: "flex", flexDirection: "column",
        height: 640, minHeight: 480,
        maxWidth: 800, margin: "0 auto",
        padding: "var(--space-5)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "var(--brand)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <Sparkles size={16} style={{ color: "#fff" }} />
        </div>
        <div>
          <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Asistente SEO/GEO
          </p>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", margin: 0 }}>
            {geoQueries.filter((q) => q.mentioned).length} queries con mención · {suggestions.length} sugerencias activas
          </p>
        </div>
      </div>

      {/* Sugerencias rápidas */}
      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => send(p)}
            disabled={typing}
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 hover:opacity-70 transition-opacity"
            style={{
              padding: "4px 12px",
              fontSize: "var(--font-size-xs)",
              fontWeight: 500,
              borderRadius: "var(--radius-badge)",
              border: "0.5px solid var(--border-ui)",
              background: "var(--surface-card)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              outlineColor: "var(--ring)",
              transition: "opacity 0.15s",
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Hilo de mensajes */}
      <div
        ref={logRef}
        id={logId}
        role="log"
        aria-live="polite"
        aria-label="Hilo de conversación"
        className="flex-1 overflow-y-auto space-y-4"
        style={{
          background: "var(--surface-page)",
          borderRadius: "var(--radius-card)",
          border: "0.5px solid var(--border-ui)",
          padding: "var(--space-4)",
          marginBottom: "var(--space-3)",
        }}
      >
        {messages.map((m) => <Bubble key={m.id} msg={m} />)}
        {typing && (
          <div className="flex gap-3">
            <div
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "var(--brand)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}
              aria-hidden="true"
            >
              <Bot size={14} style={{ color: "#fff" }} />
            </div>
            <div
              id={typingId}
              role="status"
              aria-label="El asistente está escribiendo"
              style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "10px var(--space-3)",
                background: "var(--surface-card)",
                border: "0.5px solid var(--border-ui)",
                borderRadius: "var(--radius-card)",
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: "var(--text-tertiary)",
                    display: "inline-block",
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div
        style={{
          display: "flex", gap: "var(--space-2)",
          background: "var(--surface-card)",
          borderRadius: "var(--radius-card)",
          border: "0.5px solid var(--border-ui)",
          padding: "var(--space-2)",
        }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Preguntá sobre keywords, GEO, fuentes, contenido…"
          aria-label="Escribir mensaje al asistente"
          disabled={typing}
          style={{
            flex: 1,
            padding: "8px var(--space-3)",
            fontSize: "var(--font-size-md)",
            color: "var(--text-primary)",
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            lineHeight: 1.6,
            maxHeight: 120,
            overflowY: "auto",
          }}
        />
        <Button
          variant="primary"
          onClick={() => send(input)}
          disabled={!input.trim() || typing}
          aria-label="Enviar mensaje"
          rightIcon={<CornerDownLeft size={13} aria-hidden="true" />}
        >
          Enviar
        </Button>
      </div>
      <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)", textAlign: "center", marginTop: 6 }}>
        Intro para enviar · Shift+Intro para nueva línea
      </p>

      {/* Keyframes de bouncing para el indicador de typing */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
