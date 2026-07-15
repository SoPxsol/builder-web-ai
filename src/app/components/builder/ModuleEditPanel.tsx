import { ArrowLeft, Braces } from "lucide-react";
import type { BuilderModule, ModuleProperty, ModulePropType } from "../../types/builder";
import { BUILDER_COPY } from "./copy";
import { displayAlias, sectionIcon } from "./sectionMeta";

const E = BUILDER_COPY.edit;

export type EditTab = "content" | "section";

interface ModuleEditPanelProps {
  module: BuilderModule;
  propertyValues: Record<string, string>;
  activeTab: EditTab;
  onTabChange: (tab: EditTab) => void;
  /** Edición en vivo de una propiedad de contenido (persiste vía autosave). */
  onChangeProperty: (propName: string, value: string) => void;
  /** Renombra el alias de la sección. */
  onRename: (alias: string) => void;
  /** Alterna visible/oculta. */
  onToggleHidden: () => void;
  /** Vuelve al panel de estructura. */
  onBack: () => void;
}

/** Las propiedades estructurales (prefijo `__`) van a la pestaña "Sección". */
function isStructural(prop: ModuleProperty): boolean {
  return prop.name.startsWith("__");
}

export function ModuleEditPanel({
  module,
  propertyValues,
  activeTab,
  onTabChange,
  onChangeProperty,
  onRename,
  onToggleHidden,
  onBack,
}: ModuleEditPanelProps) {
  const Icon = sectionIcon(module);
  const alias = displayAlias(module, propertyValues);
  const contentProps = module.properties.filter((p) => !isStructural(p));
  const advancedProps = module.properties.filter(isStructural);

  const valueOf = (name: string) => propertyValues[`${module.id}::${name}`] ?? "";

  return (
    <aside
      role="complementary"
      aria-label={`${E.panelAria}: ${alias}`}
      className="flex flex-col flex-shrink-0"
      style={{
        width: 300,
        background: "var(--surface-page)",
        borderRight: "0.5px solid var(--border-ui)",
      }}
    >
      {/* Volver a la estructura. */}
      <div style={{ padding: "10px 12px 0" }}>
        <button
          type="button"
          onClick={onBack}
          aria-label={E.backAria}
          className="flex items-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
          style={{
            gap: 4,
            padding: "4px 6px",
            marginLeft: -6,
            background: "transparent",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
            color: "var(--accent-info)",
            fontSize: 11,
            fontWeight: 500,
            outlineColor: "var(--accent-info)",
          }}
        >
          <ArrowLeft size={13} aria-hidden="true" />
          {E.back}
        </button>
      </div>

      {/* Identidad de la sección que se está editando. */}
      <div
        className="flex items-center"
        style={{ gap: 8, padding: "8px 14px 10px", borderBottom: "0.5px solid var(--border-ui)" }}
      >
        <Icon
          size={15}
          aria-hidden="true"
          style={{ color: module.origin === "ai" ? "var(--wizard-purple-text)" : "var(--text-secondary)", flexShrink: 0 }}
        />
        <span className="flex flex-col min-w-0" style={{ gap: 1 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {alias}
          </span>
        </span>
      </div>

      {/* Pestañas Contenido / Sección. */}
      <div role="tablist" aria-label={E.panelAria} className="flex items-center" style={{ padding: "8px 12px 0", gap: 4 }}>
        <TabButton label={E.tabs.content} active={activeTab === "content"} onClick={() => onTabChange("content")} />
        <TabButton label={E.tabs.section} active={activeTab === "section"} onClick={() => onTabChange("section")} />
      </div>

      {/* Cuerpo. */}
      <div className="flex-1 overflow-y-auto" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
        {activeTab === "content" ? (
          contentProps.length === 0 ? (
            <EmptyHint>{E.contentEmpty}</EmptyHint>
          ) : (
            contentProps.map((prop) => (
              <Field key={prop.name} label={prop.name} type={prop.type}>
                <PropertyInput
                  prop={prop}
                  value={valueOf(prop.name)}
                  onChange={(v) => onChangeProperty(prop.name, v)}
                />
              </Field>
            ))
          )
        ) : (
          <>
            {/* Nombre de la sección (alias editable). */}
            <Field label={E.section.aliasLabel}>
              <input
                type="text"
                value={module.alias ?? ""}
                onChange={(e) => onRename(e.target.value)}
                placeholder={E.section.aliasPlaceholder}
                aria-label={E.section.aliasLabel}
                style={textInputStyle}
              />
            </Field>

            {/* Visibilidad. */}
            <Field label={E.section.visibilityLabel}>
              <div className="flex items-center" style={{ gap: 6 }}>
                <SegBtn label={E.section.visible} active={!module.hidden} onClick={() => { if (module.hidden) onToggleHidden(); }} />
                <SegBtn label={E.section.hidden} active={!!module.hidden} onClick={() => { if (!module.hidden) onToggleHidden(); }} />
              </div>
            </Field>

            {/* Meta read-only. */}
            <div className="flex flex-col" style={{ gap: 8 }}>
              {module.typeLabel && <ReadonlyRow label={E.section.typeLabel} value={module.typeLabel} />}
              <ReadonlyRow label={E.section.originLabel} value={E.originLabels[module.origin ?? "manual"]} />
            </div>

            {/* Propiedades estructurales avanzadas (si las hay). */}
            {advancedProps.length > 0 && (
              <div className="flex flex-col" style={{ gap: 14, marginTop: 4 }}>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--text-tertiary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {E.section.advancedLabel}
                </p>
                {advancedProps.map((prop) => (
                  <Field key={prop.name} label={prop.name} type={prop.type}>
                    <PropertyInput
                      prop={prop}
                      value={valueOf(prop.name)}
                      onChange={(v) => onChangeProperty(prop.name, v)}
                    />
                  </Field>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

/* ─── Subcomponentes ──────────────────────────────────────────────────────── */
function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
      style={{
        padding: "6px 10px",
        background: "transparent",
        border: "none",
        borderBottom: active ? "2px solid var(--control-selected-border)" : "2px solid transparent",
        marginBottom: -1,
        fontSize: 12,
        fontWeight: active ? 600 : 500,
        color: active ? "var(--control-selected-fg)" : "var(--text-secondary)",
        cursor: "pointer",
        outlineColor: "var(--accent-info)",
      }}
    >
      {label}
    </button>
  );
}

const textInputStyle: React.CSSProperties = {
  width: "100%",
  background: "#fff",
  border: "0.5px solid var(--border-ui)",
  borderRadius: 5,
  padding: "7px 9px",
  fontSize: 12,
  color: "var(--text-primary)",
  outline: "none",
  outlineColor: "var(--accent-info)",
  fontFamily: "inherit",
};

const monoInputStyle: React.CSSProperties = {
  ...textInputStyle,
  fontSize: 11,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
};

function Field({ label, type, children }: { label: string; type?: ModulePropType; children: React.ReactNode }) {
  return (
    <label className="flex flex-col" style={{ gap: 5 }}>
      <span className="flex items-center" style={{ gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-secondary)" }}>{label}</span>
        {type && (
          <span
            style={{
              fontSize: 9,
              padding: "1px 5px",
              background: "var(--surface-page)",
              border: "0.5px solid var(--border-ui)",
              borderRadius: 3,
              color: "var(--text-tertiary)",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontWeight: 500,
            }}
          >
            {type}
          </span>
        )}
      </span>
      {children}
    </label>
  );
}

/** Editor de una propiedad según su tipo (edición en vivo). */
function PropertyInput({
  prop,
  value,
  onChange,
}: {
  prop: ModuleProperty;
  value: string;
  onChange: (value: string) => void;
}) {
  switch (prop.type) {
    case "NUMBER":
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={prop.name}
          style={monoInputStyle}
        />
      );
    case "BOOLEAN":
      return (
        <div className="flex items-center" style={{ gap: 6 }}>
          {["true", "false"].map((opt) => (
            <SegBtn key={opt} label={opt} active={value === opt} onClick={() => onChange(opt)} mono />
          ))}
        </div>
      );
    case "OBJECT":
    case "ARRAY":
      return (
        <div className="flex flex-col" style={{ gap: 5 }}>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label={prop.name}
            placeholder={prop.type === "ARRAY" ? "[ … ]" : "{ … }"}
            rows={4}
            style={{ ...monoInputStyle, minHeight: 88, resize: "vertical", lineHeight: 1.5 }}
          />
          <span className="flex items-center" style={{ fontSize: 10, color: "var(--text-tertiary)", gap: 4 }}>
            <Braces size={9} aria-hidden="true" />
            JSON {prop.type.toLowerCase()}
          </span>
        </div>
      );
    case "STRING":
    default:
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Valor de ${prop.name}`}
          aria-label={prop.name}
          style={textInputStyle}
        />
      );
  }
}

function SegBtn({ label, active, onClick, mono }: { label: string; active: boolean; onClick: () => void; mono?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
      style={{
        padding: "5px 12px",
        background: active ? "var(--control-selected-bg)" : "#fff",
        border: active ? "0.5px solid var(--control-selected-border)" : "0.5px solid var(--border-ui)",
        borderRadius: 5,
        fontSize: 11,
        fontWeight: 500,
        color: active ? "var(--control-selected-fg)" : "var(--text-secondary)",
        cursor: "pointer",
        fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : "inherit",
        outlineColor: "var(--accent-info)",
      }}
    >
      {label}
    </button>
  );
}

function ReadonlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between" style={{ gap: 8 }}>
      <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, color: "var(--text-tertiary)", lineHeight: 1.5, textAlign: "center", padding: "20px 8px" }}>
      {children}
    </p>
  );
}
