import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

interface SeoCardProps {
  pageName: string;
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onGenerateWithAI: () => void;
}

export function SeoCard({
  pageName,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onGenerateWithAI,
}: SeoCardProps) {
  const [generating, setGenerating] = useState(false);

  function handleGenerate() {
    setGenerating(true);
    setTimeout(() => {
      onGenerateWithAI();
      setGenerating(false);
    }, 800);
  }

  return (
    <div
      style={{
        border: "1px solid var(--border-ui)",
        borderRadius: 5,
        overflow: "hidden",
        marginBottom: 8,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{
          height: 32,
          background: "var(--surface-page)",
          borderBottom: "1px solid var(--border-ui)",
          padding: "0 10px",
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-primary)" }}>
          {pageName}
        </span>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center transition-colors hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: "var(--wizard-amber-light)",
            border: "1px solid var(--wizard-amber-border-strong)",
            borderRadius: 3,
            fontSize: 9,
            fontWeight: 500,
            color: "var(--wizard-amber-text)",
            padding: "1px 6px",
            gap: 2,
            cursor: "pointer",
            outlineColor: "var(--accent-info)",
          }}
        >
          {generating ? (
            <Loader2 size={9} className="animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles size={9} aria-hidden="true" />
          )}
          {generating ? "Generando…" : "Generar con IA"}
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col" style={{ padding: 8, gap: 6 }}>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Título · máx. 60 caracteres · aparece en Google"
          aria-label={`Meta title de ${pageName}`}
          maxLength={70}
          className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            width: "100%",
            height: 26,
            background: "#fff",
            border: "1px solid var(--border-ui)",
            borderRadius: 4,
            padding: "0 8px",
            fontSize: 11,
            color: "var(--text-primary)",
            outline: "none",
            outlineColor: "var(--accent-info)",
          }}
        />
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Descripción · máx. 155 caracteres · resumen en Google"
          aria-label={`Meta description de ${pageName}`}
          maxLength={170}
          rows={2}
          className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            width: "100%",
            background: "#fff",
            border: "1px solid var(--border-ui)",
            borderRadius: 4,
            padding: "6px 8px",
            fontSize: 11,
            color: "var(--text-primary)",
            resize: "none",
            lineHeight: 1.4,
            outline: "none",
            outlineColor: "var(--accent-info)",
            fontFamily: "inherit",
          }}
        />
      </div>
    </div>
  );
}
