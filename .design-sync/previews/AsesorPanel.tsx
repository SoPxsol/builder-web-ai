import { AsesorPanel } from "@figma/my-make-file";

// Nota del asesor para la sección SEO (colapsada por default).
export const Default = () => (
  <div
    style={{
      maxWidth: 420,
      background: "var(--surface-card)",
      border: "0.5px solid var(--border-ui)",
      borderRadius: "var(--radius-card)",
      overflow: "hidden",
    }}
  >
    <AsesorPanel text="Schema.org Hotel es la diferencia entre aparecer o no en los resultados de IA (ChatGPT, Perplexity). Si hay que priorizar una sola acción de SEO, es esta." />
  </div>
);