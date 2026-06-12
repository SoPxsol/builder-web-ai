import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import type { BlogArticle } from "../../types/article";
import type { ArticleBlock, ArticleLayout } from "../../types/articleBlocks";
import { blocksToHtml } from "./blocksToHtml";

interface Props {
  article: BlogArticle;
  blocks: ArticleBlock[];
  layout: ArticleLayout;
}

/**
 * CodeView — muestra el artículo como HTML semántico (solo lectura).
 *
 * Pensado para el hotelero técnico / dev que quiere ver "cómo queda el código"
 * del artículo, equivalente al toggle Preview/Código del builder. No es
 * editable: la fuente de verdad siguen siendo los bloques.
 */
export function CodeView({ article, blocks, layout }: Props) {
  const html = useMemo(() => blocksToHtml(article, blocks, layout), [article, blocks, layout]);
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(html).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      },
      () => {},
    );
  }

  return (
    <div
      className="flex flex-col"
      style={{ height: "100%", background: "#1e1e1e", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
    >
      {/* Barra superior del code view */}
      <div
        className="flex items-center justify-between"
        style={{
          height: 38,
          padding: "0 12px",
          background: "#252526",
          borderBottom: "0.5px solid #333",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 11, color: "#9da5b4", letterSpacing: "0.03em" }}>
          articulo.html · solo lectura
        </span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            height: 26,
            padding: "0 10px",
            gap: 6,
            background: "#333",
            border: "0.5px solid #444",
            borderRadius: 5,
            fontSize: 11,
            fontWeight: 500,
            color: copied ? "#4ec9b0" : "#d4d4d4",
            cursor: "pointer",
            outlineColor: "#4ec9b0",
          }}
        >
          {copied ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>

      {/* Código */}
      <pre
        className="flex-1 overflow-auto"
        style={{ margin: 0, padding: "16px 18px", fontSize: 12.5, lineHeight: 1.7, color: "#d4d4d4", tabSize: 2 }}
      >
        <code>{html}</code>
      </pre>
    </div>
  );
}
