import {
  ArrowLeft,
  Code2,
  Eye,
  Monitor,
  Pencil,
  Plus,
  Settings,
  Smartphone,
  Sparkles,
  Tablet,
  Type as TypeIcon,
} from "lucide-react";
import type { BuilderTab, ViewportMode } from "../../types/builder";

interface BuilderToolbarProps {
  activeTab: BuilderTab;
  onTabChange: (tab: BuilderTab) => void;
  viewport: ViewportMode;
  onViewportChange: (v: ViewportMode) => void;
  canvasWidth: number;
  onCanvasWidthChange: (w: number) => void;
  componentsOpen: boolean;
  onToggleComponents: () => void;
  aiOpen: boolean;
  onToggleAi: () => void;
  onBack: () => void;
  onPreview: () => void;
  onPublish: () => void;
}

const chipStyle: React.CSSProperties = {
  height: 28,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "0.5px solid var(--border-ui)",
  borderRadius: 5,
  cursor: "pointer",
  color: "var(--text-secondary)",
  outline: "none",
  outlineColor: "var(--ring)",
};

const chipActiveStyle: React.CSSProperties = {
  background: "var(--text-primary)",
  border: "0.5px solid var(--text-primary)",
  color: "#fff",
};

export function BuilderToolbar({
  activeTab,
  onTabChange,
  viewport,
  onViewportChange,
  canvasWidth,
  onCanvasWidthChange,
  componentsOpen,
  onToggleComponents,
  aiOpen,
  onToggleAi,
  onBack,
  onPreview,
  onPublish,
}: BuilderToolbarProps) {
  return (
    <header
      className="flex items-center"
      style={{
        height: 48,
        padding: "0 12px",
        background: "#fff",
        borderBottom: "0.5px solid var(--border-ui)",
        gap: 8,
        flexShrink: 0,
      }}
    >
      {/* IZQUIERDA: navegación + iconos de acción */}
      <div className="flex items-center" style={{ gap: 4 }}>
        <ToolbarIconButton icon={ArrowLeft} label="Volver" onClick={onBack} />
        <div style={{ width: 1, height: 18, background: "var(--border-ui)", margin: "0 4px" }} aria-hidden="true" />
        <ToolbarIconButton
          icon={Plus}
          label="Agregar componente"
          onClick={onToggleComponents}
          active={componentsOpen}
        />
        <ToolbarIconButton icon={Settings} label="Configuración" />
        <ToolbarIconButton icon={Code2} label="Código" />
        <ToolbarIconButton icon={TypeIcon} label="Texto" />
        <ToolbarIconButton
          icon={Sparkles}
          label="Asistente AI"
          onClick={onToggleAi}
          active={aiOpen}
        />
      </div>

      {/* CENTRO: tabs Header/Página/Footer */}
      <div className="flex items-center flex-1 justify-center" style={{ minWidth: 0 }}>
        <div
          role="tablist"
          aria-label="Sección a editar"
          className="flex items-center"
          style={{
            background: "var(--surface-page)",
            border: "0.5px solid var(--border-ui)",
            borderRadius: 6,
            padding: 2,
            gap: 2,
            height: 28,
          }}
        >
          {(["header", "page", "footer"] as BuilderTab[]).map((tab) => {
            const active = activeTab === tab;
            const label = tab === "header" ? "Header" : tab === "page" ? "Página" : "Footer";
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onTabChange(tab)}
                className="transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  height: 24,
                  padding: "0 12px",
                  background: active ? "#fff" : "transparent",
                  border: "none",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: active ? 600 : 500,
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  cursor: "pointer",
                  boxShadow: active ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                  outlineColor: "var(--ring)",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* DERECHA: width + viewport + edit + avatar + preview + publicar */}
      <div className="flex items-center flex-shrink-0" style={{ gap: 6 }}>
        <label
          className="flex items-center"
          style={{
            ...chipStyle,
            padding: "0 8px",
            gap: 4,
            fontSize: 11,
            color: "var(--text-secondary)",
            cursor: "text",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--text-tertiary)" }}>W:</span>
          <input
            type="number"
            value={canvasWidth}
            onChange={(e) => onCanvasWidthChange(Math.max(320, Number(e.target.value) || 0))}
            aria-label="Ancho del canvas en píxeles"
            style={{
              width: 50,
              background: "transparent",
              border: "none",
              fontSize: 11,
              fontWeight: 500,
              color: "var(--text-primary)",
              outline: "none",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          />
        </label>

        <div
          role="radiogroup"
          aria-label="Viewport"
          className="flex items-center"
          style={{
            background: "var(--surface-page)",
            border: "0.5px solid var(--border-ui)",
            borderRadius: 5,
            padding: 1,
            gap: 1,
            height: 28,
          }}
        >
          {(
            [
              { id: "desktop" as const, icon: Monitor, label: "Desktop" },
              { id: "tablet" as const, icon: Tablet, label: "Tablet" },
              { id: "mobile" as const, icon: Smartphone, label: "Mobile" },
            ]
          ).map(({ id, icon: Icon, label }) => {
            const active = viewport === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={label}
                onClick={() => onViewportChange(id)}
                className="flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                style={{
                  width: 24,
                  height: 24,
                  background: active ? "#fff" : "transparent",
                  border: "none",
                  borderRadius: 3,
                  cursor: "pointer",
                  boxShadow: active ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                  outlineColor: "var(--ring)",
                }}
              >
                <Icon
                  size={12}
                  aria-hidden="true"
                  style={{
                    color: active ? "var(--text-primary)" : "var(--text-tertiary)",
                  }}
                />
              </button>
            );
          })}
        </div>

        <ToolbarIconButton icon={Pencil} label="Editar metadatos" />

        <div
          aria-hidden="true"
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 26,
            height: 26,
            background: "var(--avatar-bg)",
            borderRadius: "var(--radius-badge)",
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 500, color: "var(--avatar-text)" }}>SG</span>
        </div>

        <button
          type="button"
          onClick={onPreview}
          className="flex items-center transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            height: 28,
            padding: "0 12px",
            background: "transparent",
            border: "0.5px solid var(--border-ui)",
            borderRadius: 5,
            fontSize: 11,
            fontWeight: 500,
            color: "var(--text-secondary)",
            cursor: "pointer",
            gap: 4,
            outlineColor: "var(--ring)",
          }}
        >
          <Eye size={11} aria-hidden="true" />
          Previsualizar
        </button>

        <button
          type="button"
          onClick={onPublish}
          className="flex items-center transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            height: 28,
            padding: "0 14px",
            background: "var(--brand)",
            border: "none",
            borderRadius: 5,
            fontSize: 11,
            fontWeight: 600,
            color: "#fff",
            cursor: "pointer",
            outlineColor: "var(--wizard-coral)",
          }}
        >
          Publicar {activeTab === "header" ? "header" : activeTab === "footer" ? "footer" : "página"}
        </button>
      </div>
    </header>
  );
}

interface ToolbarIconButtonProps {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

function ToolbarIconButton({ icon: Icon, label, onClick, active }: ToolbarIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className="flex items-center justify-center transition-colors hover:bg-[var(--surface-page)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
      style={{
        width: 28,
        height: 28,
        background: active ? "var(--text-primary)" : "transparent",
        border: "none",
        borderRadius: 5,
        cursor: "pointer",
        outlineColor: "var(--ring)",
      }}
    >
      <Icon
        size={13}
        aria-hidden="true"
        style={{ color: active ? "#fff" : "var(--text-secondary)" }}
      />
    </button>
  );
}
