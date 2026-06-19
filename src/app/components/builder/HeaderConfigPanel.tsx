import { GripVertical, Plus, Trash2 } from "lucide-react";
import type { NavConfig, UtilityAction, NavSection, BottomBarSlot } from "../../types/builder";
import { BUILDER_COPY } from "./copy";

const H = BUILDER_COPY.headerConfig;

/* ─── Estilos compartidos (mismo criterio que ModuleEditPanel) ──────────── */
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

/* ─── Subcomponentes locales (hermanos de los de ModuleEditPanel) ─────── */

/** Encabezado de sección uppercase — replica el "advancedLabel" de ModuleEditPanel. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 10,
        fontWeight: 600,
        color: "var(--text-tertiary)",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        paddingTop: 4,
      }}
    >
      {children}
    </p>
  );
}

/** Field con label — replica el de ModuleEditPanel (sin el badge de tipo). */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col" style={{ gap: 5 }}>
      <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-secondary)" }}>{label}</span>
      {children}
    </label>
  );
}

/** Botón segmentado — mismo look que SegBtn de ModuleEditPanel. */
function SegBtn({
  label,
  active,
  onClick,
  disabled,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      disabled={disabled}
      className="transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
      style={{
        padding: "5px 10px",
        background: active ? "var(--accent-info)" : "#fff",
        border: active ? "0.5px solid var(--accent-info)" : "0.5px solid var(--border-ui)",
        borderRadius: 5,
        fontSize: 11,
        fontWeight: 500,
        color: active ? "#fff" : disabled ? "var(--text-tertiary)" : "var(--text-secondary)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        outlineColor: "var(--accent-info)",
      }}
    >
      {label}
    </button>
  );
}

/** Separador horizontal entre secciones. */
function Divider() {
  return (
    <div
      aria-hidden="true"
      style={{ borderTop: "0.5px solid var(--border-ui)", margin: "4px 0" }}
    />
  );
}

/** Hint de texto pequeño en gris. */
function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 10, color: "var(--text-tertiary)", lineHeight: 1.5 }}>{children}</p>
  );
}

/** Mini botón de icono (eliminar / agregar). */
function IconBtn({
  onClick,
  label,
  disabled,
  children,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className="flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
      style={{
        width: 26,
        height: 26,
        minWidth: 26,
        background: "transparent",
        border: "0.5px solid var(--border-ui)",
        borderRadius: 5,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        color: "var(--text-secondary)",
        outlineColor: "var(--accent-info)",
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}

/* ─── Editor de UtilityAction (reutilizado en varios lugares) ──────────── */
const ACTION_TYPE_LABELS: Record<UtilityAction["actionType"], string> = {
  link: "Enlace",
  "booking-engine": "Motor de reservas",
  whatsapp: "WhatsApp",
  "ai-chat": "Asistente IA",
};

function UtilityActionEditor({
  action,
  onChange,
}: {
  action: UtilityAction;
  onChange: (next: UtilityAction) => void;
}) {
  const set = <K extends keyof UtilityAction>(key: K, value: UtilityAction[K]) =>
    onChange({ ...action, [key]: value });

  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      <Field label={H.action.label}>
        <input
          type="text"
          value={action.label}
          onChange={(e) => set("label", e.target.value)}
          placeholder={H.action.labelPlaceholder}
          aria-label={H.action.label}
          style={textInputStyle}
        />
      </Field>

      <Field label={H.action.icon}>
        <input
          type="text"
          value={action.icon ?? ""}
          onChange={(e) => set("icon", e.target.value || undefined)}
          placeholder={H.action.iconPlaceholder}
          aria-label={H.action.icon}
          style={textInputStyle}
        />
      </Field>

      {/* Tipo de acción como SegBtns en dos filas para que quepan */}
      <div className="flex flex-col" style={{ gap: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-secondary)" }}>
          {H.action.type}
        </span>
        <div className="flex flex-wrap" style={{ gap: 4 }}>
          {(["link", "booking-engine", "whatsapp", "ai-chat"] as const).map((t) => (
            <SegBtn
              key={t}
              label={ACTION_TYPE_LABELS[t]}
              active={action.actionType === t}
              onClick={() => set("actionType", t)}
            />
          ))}
        </div>
      </div>

      {action.actionType === "link" && (
        <Field label={H.action.href}>
          <input
            type="url"
            value={action.href ?? ""}
            onChange={(e) => set("href", e.target.value || undefined)}
            placeholder="https://..."
            aria-label={H.action.href}
            style={textInputStyle}
          />
        </Field>
      )}

      {action.actionType === "whatsapp" && (
        <Field label={H.action.phone}>
          <input
            type="tel"
            value={action.phone ?? ""}
            onChange={(e) => set("phone", e.target.value || undefined)}
            placeholder="+54 9 11 1234-5678"
            aria-label={H.action.phone}
            style={textInputStyle}
          />
        </Field>
      )}
    </div>
  );
}

/* ─── Editor de slot opcional de la barra utilitaria ──────────────────── */
function UtilitySlotEditor({
  slotLabel,
  action,
  onToggle,
  onChange,
}: {
  slotLabel: string;
  action: UtilityAction | undefined;
  onToggle: (enabled: boolean) => void;
  onChange: (next: UtilityAction) => void;
}) {
  const enabled = action !== undefined;
  const defaultAction: UtilityAction = {
    id: `slot-${Date.now()}`,
    label: "",
    actionType: "link",
  };

  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      <div className="flex items-center" style={{ gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-secondary)", flex: 1 }}>
          {slotLabel}
        </span>
        <SegBtn
          label={H.visible}
          active={enabled}
          onClick={() => onToggle(!enabled)}
        />
      </div>
      {enabled && (
        <div style={{ paddingLeft: 8, borderLeft: "2px solid var(--border-ui)" }}>
          <UtilityActionEditor
            action={action ?? defaultAction}
            onChange={onChange}
          />
        </div>
      )}
    </div>
  );
}

/* ─── Editor de lista ordenable con agregar/eliminar ───────────────────── */
type ReorderableListProps<T> = {
  items: T[];
  keyOf: (item: T) => string;
  canAdd: boolean;
  canRemove: boolean;
  addLabel: string;
  addDisabledHint?: string;
  removeDisabledHint?: string;
  onAdd: () => void;
  onRemove: (key: string) => void;
  onMoveUp: (key: string) => void;
  onMoveDown: (key: string) => void;
  renderItem: (item: T, idx: number, total: number) => React.ReactNode;
};

function ReorderableList<T>({
  items,
  keyOf,
  canAdd,
  canRemove,
  addLabel,
  addDisabledHint,
  removeDisabledHint,
  onAdd,
  onRemove,
  onMoveUp,
  onMoveDown,
  renderItem,
}: ReorderableListProps<T>) {
  return (
    <div className="flex flex-col" style={{ gap: 6 }}>
      {items.map((item, idx) => (
        <div
          key={keyOf(item)}
          className="flex flex-col"
          style={{
            border: "0.5px solid var(--border-ui)",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          {/* Barra de controles de la fila */}
          <div
            className="flex items-center"
            style={{
              padding: "4px 8px",
              background: "var(--surface-page)",
              borderBottom: "0.5px solid var(--border-ui)",
              gap: 4,
            }}
          >
            <GripVertical
              size={13}
              aria-hidden="true"
              style={{ color: "var(--text-tertiary)", flexShrink: 0 }}
            />
            <span style={{ fontSize: 10, color: "var(--text-tertiary)", flex: 1 }}>
              {idx + 1} / {items.length}
            </span>
            <IconBtn
              onClick={() => onMoveUp(keyOf(item))}
              label={H.list.moveUp}
              disabled={idx === 0}
            >
              <span style={{ fontSize: 10, lineHeight: 1 }}>▲</span>
            </IconBtn>
            <IconBtn
              onClick={() => onMoveDown(keyOf(item))}
              label={H.list.moveDown}
              disabled={idx === items.length - 1}
            >
              <span style={{ fontSize: 10, lineHeight: 1 }}>▼</span>
            </IconBtn>
            <IconBtn
              onClick={() => onRemove(keyOf(item))}
              label={canRemove ? H.list.remove : (removeDisabledHint ?? H.list.remove)}
              disabled={!canRemove}
            >
              <Trash2 size={11} aria-hidden="true" />
            </IconBtn>
          </div>
          {/* Contenido del item */}
          <div style={{ padding: 10 }}>{renderItem(item, idx, items.length)}</div>
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        disabled={!canAdd}
        aria-label={addLabel}
        title={!canAdd ? (addDisabledHint ?? "") : undefined}
        className="flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
        style={{
          gap: 5,
          padding: "6px 10px",
          background: "transparent",
          border: "0.5px dashed var(--border-ui)",
          borderRadius: 6,
          fontSize: 11,
          color: canAdd ? "var(--accent-info)" : "var(--text-tertiary)",
          cursor: canAdd ? "pointer" : "not-allowed",
          outlineColor: "var(--accent-info)",
        }}
      >
        <Plus size={12} aria-hidden="true" />
        {addLabel}
      </button>
      {!canAdd && addDisabledHint && <Hint>{addDisabledHint}</Hint>}
    </div>
  );
}

/* ─── Helpers de reordenamiento inmutables ──────────────────────────────── */
function moveUp<T>(arr: T[], keyOf: (i: T) => string, key: string): T[] {
  const idx = arr.findIndex((i) => keyOf(i) === key);
  if (idx <= 0) return arr;
  const next = [...arr];
  [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
  return next;
}

function moveDown<T>(arr: T[], keyOf: (i: T) => string, key: string): T[] {
  const idx = arr.findIndex((i) => keyOf(i) === key);
  if (idx < 0 || idx >= arr.length - 1) return arr;
  const next = [...arr];
  [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
  return next;
}

function removeById<T>(arr: T[], keyOf: (i: T) => string, key: string): T[] {
  return arr.filter((i) => keyOf(i) !== key);
}

/* ─── Componente principal ──────────────────────────────────────────────── */
interface HeaderConfigPanelProps {
  navConfig: NavConfig;
  onChange: (next: NavConfig) => void;
}

export function HeaderConfigPanel({ navConfig: cfg, onChange }: HeaderConfigPanelProps) {
  const set = <K extends keyof NavConfig>(key: K, value: NavConfig[K]) =>
    onChange({ ...cfg, [key]: value });

  /* ── Logo ── */
  const setLogo = <K extends keyof NavConfig["logo"]>(k: K, v: NavConfig["logo"][K]) =>
    set("logo", { ...cfg.logo, [k]: v });

  /* ── Utility bar ── */
  const setUtilityBar = <K extends keyof NavConfig["utilityBar"]>(
    k: K,
    v: NavConfig["utilityBar"][K],
  ) => set("utilityBar", { ...cfg.utilityBar, [k]: v });

  /* ── Main bar ── */
  const setMainBar = <K extends keyof NavConfig["mainBar"]>(k: K, v: NavConfig["mainBar"][K]) =>
    set("mainBar", { ...cfg.mainBar, [k]: v });

  /* ── Bottom bar ── */
  const setBottomBar = <K extends keyof NavConfig["bottomBar"]>(
    k: K,
    v: NavConfig["bottomBar"][K],
  ) => set("bottomBar", { ...cfg.bottomBar, [k]: v });

  const BOTTOM_MIN = 2;
  const BOTTOM_MAX = 4;

  /* ── Drawer sections ── */
  const addDrawerSection = () => {
    const id = `nav-${Date.now()}`;
    const newSection: NavSection = {
      id,
      label: "",
      href: "",
      visible: true,
      order: cfg.drawerSections.length,
    };
    set("drawerSections", [...cfg.drawerSections, newSection]);
  };

  const updateDrawerSection = (id: string, patch: Partial<NavSection>) =>
    set(
      "drawerSections",
      cfg.drawerSections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );

  /* ── Drawer utility ── */
  const addDrawerUtility = () => {
    const id = `drawer-${Date.now()}`;
    const newAction: UtilityAction = { id, label: "", actionType: "link" };
    set("drawerUtility", [...cfg.drawerUtility, newAction]);
  };

  const updateDrawerUtility = (id: string, next: UtilityAction) =>
    set(
      "drawerUtility",
      cfg.drawerUtility.map((a) => (a.id === id ? next : a)),
    );

  /* ── Bottom bar slots ── */
  const addBottomSlot = () => {
    if (cfg.bottomBar.slots.length >= BOTTOM_MAX) return;
    const id = `bottom-${Date.now()}`;
    const newSlot: BottomBarSlot = {
      id,
      order: cfg.bottomBar.slots.length,
      action: { id: `action-${Date.now()}`, label: "", actionType: "link" },
    };
    setBottomBar("slots", [...cfg.bottomBar.slots, newSlot]);
  };

  const updateBottomSlot = (slotId: string, next: BottomBarSlot) =>
    setBottomBar(
      "slots",
      cfg.bottomBar.slots.map((s) => (s.id === slotId ? next : s)),
    );

  return (
    <aside
      role="complementary"
      aria-label={H.panelAria}
      className="flex flex-col flex-shrink-0"
      style={{
        width: 300,
        background: "var(--surface-page)",
        borderRight: "0.5px solid var(--border-ui)",
      }}
    >
      {/* Cabecera del panel */}
      <div
        className="flex items-center"
        style={{
          padding: "12px 14px",
          borderBottom: "0.5px solid var(--border-ui)",
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          {H.title}
        </span>
      </div>

      {/* Cuerpo scrolleable */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}
      >

        {/* ── LOGO ─────────────────────────────────────────────────────── */}
        <SectionLabel>{H.sections.logo}</SectionLabel>

        <Field label={H.logo.type}>
          <div className="flex items-center" style={{ gap: 6 }}>
            <SegBtn
              label={H.logo.typeImage}
              active={cfg.logo.type === "image"}
              onClick={() => setLogo("type", "image")}
            />
            <SegBtn
              label={H.logo.typeText}
              active={cfg.logo.type === "text"}
              onClick={() => setLogo("type", "text")}
            />
          </div>
        </Field>

        {cfg.logo.type === "image" && (
          <>
            <Field label={H.logo.imageUrl}>
              <input
                type="url"
                value={cfg.logo.imageUrl ?? ""}
                onChange={(e) => setLogo("imageUrl", e.target.value || undefined)}
                placeholder="https://..."
                aria-label={H.logo.imageUrl}
                style={textInputStyle}
              />
            </Field>
            <Field label={H.logo.imageAlt}>
              <input
                type="text"
                value={cfg.logo.imageAlt ?? ""}
                onChange={(e) => setLogo("imageAlt", e.target.value || undefined)}
                placeholder={H.logo.imageAltPlaceholder}
                aria-label={H.logo.imageAlt}
                style={textInputStyle}
              />
            </Field>
          </>
        )}

        <Field label={H.logo.textFallback}>
          <input
            type="text"
            value={cfg.logo.textFallback ?? ""}
            onChange={(e) => setLogo("textFallback", e.target.value || undefined)}
            placeholder={H.logo.textFallbackPlaceholder}
            aria-label={H.logo.textFallback}
            style={textInputStyle}
          />
        </Field>

        <Divider />

        {/* ── DISPOSICIÓN ──────────────────────────────────────────────── */}
        <SectionLabel>{H.sections.layout}</SectionLabel>

        <Field label={H.layout.mobile}>
          <div className="flex items-center" style={{ gap: 6 }}>
            <SegBtn
              label={H.layout.mobileTop}
              active={cfg.mobileLayout === "top"}
              onClick={() => set("mobileLayout", "top")}
            />
            <SegBtn
              label={H.layout.mobileBoth}
              active={cfg.mobileLayout === "both"}
              onClick={() => set("mobileLayout", "both")}
            />
            <SegBtn
              label={H.layout.mobileBottom}
              active={cfg.mobileLayout === "bottom"}
              onClick={() => set("mobileLayout", "bottom")}
            />
          </div>
        </Field>

        <Field label={H.layout.desktop}>
          <div className="flex items-center" style={{ gap: 6 }}>
            <SegBtn
              label={H.layout.desktopSingle}
              active={cfg.desktopLayout === "single-row"}
              onClick={() => set("desktopLayout", "single-row")}
            />
            <SegBtn
              label={H.layout.desktopTwo}
              active={cfg.desktopLayout === "two-rows"}
              onClick={() => set("desktopLayout", "two-rows")}
            />
          </div>
        </Field>

        <Divider />

        {/* ── BARRA UTILITARIA ─────────────────────────────────────────── */}
        <SectionLabel>{H.sections.utilityBar}</SectionLabel>

        <Field label={H.utilityBar.visible}>
          <div className="flex items-center" style={{ gap: 6 }}>
            <SegBtn
              label={H.visible}
              active={cfg.utilityBar.visible}
              onClick={() => setUtilityBar("visible", true)}
            />
            <SegBtn
              label={H.hidden}
              active={!cfg.utilityBar.visible}
              onClick={() => setUtilityBar("visible", false)}
            />
          </div>
        </Field>

        {cfg.utilityBar.visible && (
          <>
            <UtilitySlotEditor
              slotLabel={H.utilityBar.leftSlot}
              action={cfg.utilityBar.leftSlot}
              onToggle={(enabled) =>
                setUtilityBar(
                  "leftSlot",
                  enabled
                    ? { id: `slot-left-${Date.now()}`, label: "", actionType: "link" }
                    : undefined,
                )
              }
              onChange={(next) => setUtilityBar("leftSlot", next)}
            />
            <UtilitySlotEditor
              slotLabel={H.utilityBar.rightSlot}
              action={cfg.utilityBar.rightSlot}
              onToggle={(enabled) =>
                setUtilityBar(
                  "rightSlot",
                  enabled
                    ? { id: `slot-right-${Date.now()}`, label: "", actionType: "link" }
                    : undefined,
                )
              }
              onChange={(next) => setUtilityBar("rightSlot", next)}
            />
          </>
        )}

        <Divider />

        {/* ── BARRA PRINCIPAL ──────────────────────────────────────────── */}
        <SectionLabel>{H.sections.mainBar}</SectionLabel>

        <Field label={H.mainBar.sticky}>
          <div className="flex items-center" style={{ gap: 6 }}>
            <SegBtn
              label={H.yes}
              active={cfg.mainBar.sticky}
              onClick={() => setMainBar("sticky", true)}
            />
            <SegBtn
              label={H.no}
              active={!cfg.mainBar.sticky}
              onClick={() => setMainBar("sticky", false)}
            />
          </div>
        </Field>

        <Field label={H.mainBar.showBookingButton}>
          <div className="flex items-center" style={{ gap: 6 }}>
            <SegBtn
              label={H.yes}
              active={cfg.mainBar.showBookingButton}
              onClick={() => setMainBar("showBookingButton", true)}
            />
            <SegBtn
              label={H.no}
              active={!cfg.mainBar.showBookingButton}
              onClick={() => setMainBar("showBookingButton", false)}
            />
          </div>
        </Field>

        {cfg.mainBar.showBookingButton && (
          <Field label={H.mainBar.bookingButtonLabel}>
            <input
              type="text"
              value={cfg.mainBar.bookingButtonLabel ?? ""}
              onChange={(e) => setMainBar("bookingButtonLabel", e.target.value || undefined)}
              placeholder={H.mainBar.bookingButtonLabelPlaceholder}
              aria-label={H.mainBar.bookingButtonLabel}
              style={textInputStyle}
            />
          </Field>
        )}

        <Divider />

        {/* ── BARRA INFERIOR (MOBILE) ───────────────────────────────────── */}
        <SectionLabel>{H.sections.bottomBar}</SectionLabel>

        <Field label={H.bottomBar.visible}>
          <div className="flex items-center" style={{ gap: 6 }}>
            <SegBtn
              label={H.visible}
              active={cfg.bottomBar.visible}
              onClick={() => setBottomBar("visible", true)}
            />
            <SegBtn
              label={H.hidden}
              active={!cfg.bottomBar.visible}
              onClick={() => setBottomBar("visible", false)}
            />
          </div>
        </Field>

        {cfg.bottomBar.visible && (
          <>
            <Field label={H.bottomBar.backdropBlur}>
              <div className="flex items-center" style={{ gap: 6 }}>
                <SegBtn
                  label={H.yes}
                  active={cfg.bottomBar.backdropBlur}
                  onClick={() => setBottomBar("backdropBlur", true)}
                />
                <SegBtn
                  label={H.no}
                  active={!cfg.bottomBar.backdropBlur}
                  onClick={() => setBottomBar("backdropBlur", false)}
                />
              </div>
            </Field>

            <div className="flex flex-col" style={{ gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-secondary)" }}>
                {H.bottomBar.slots}
              </span>
              <ReorderableList
                items={cfg.bottomBar.slots}
                keyOf={(s) => s.id}
                canAdd={cfg.bottomBar.slots.length < BOTTOM_MAX}
                canRemove={cfg.bottomBar.slots.length > BOTTOM_MIN}
                addLabel={H.bottomBar.addSlot}
                addDisabledHint={H.bottomBar.maxSlotsHint}
                removeDisabledHint={H.bottomBar.minSlotsHint}
                onAdd={addBottomSlot}
                onRemove={(key) =>
                  setBottomBar(
                    "slots",
                    removeById(cfg.bottomBar.slots, (s) => s.id, key).map((s, i) => ({
                      ...s,
                      order: i,
                    })),
                  )
                }
                onMoveUp={(key) =>
                  setBottomBar(
                    "slots",
                    moveUp(cfg.bottomBar.slots, (s) => s.id, key).map((s, i) => ({
                      ...s,
                      order: i,
                    })),
                  )
                }
                onMoveDown={(key) =>
                  setBottomBar(
                    "slots",
                    moveDown(cfg.bottomBar.slots, (s) => s.id, key).map((s, i) => ({
                      ...s,
                      order: i,
                    })),
                  )
                }
                renderItem={(slot) => (
                  <UtilityActionEditor
                    action={slot.action}
                    onChange={(nextAction) =>
                      updateBottomSlot(slot.id, { ...slot, action: nextAction })
                    }
                  />
                )}
              />
            </div>
          </>
        )}

        <Divider />

        {/* ── SECCIONES DEL MENÚ (DRAWER) ──────────────────────────────── */}
        <SectionLabel>{H.sections.drawerSections}</SectionLabel>

        <ReorderableList
          items={cfg.drawerSections}
          keyOf={(s) => s.id}
          canAdd
          canRemove={cfg.drawerSections.length > 1}
          addLabel={H.drawer.addSection}
          onAdd={addDrawerSection}
          onRemove={(key) =>
            set(
              "drawerSections",
              removeById(cfg.drawerSections, (s) => s.id, key).map((s, i) => ({
                ...s,
                order: i,
              })),
            )
          }
          onMoveUp={(key) =>
            set(
              "drawerSections",
              moveUp(cfg.drawerSections, (s) => s.id, key).map((s, i) => ({ ...s, order: i })),
            )
          }
          onMoveDown={(key) =>
            set(
              "drawerSections",
              moveDown(cfg.drawerSections, (s) => s.id, key).map((s, i) => ({ ...s, order: i })),
            )
          }
          renderItem={(section) => (
            <div className="flex flex-col" style={{ gap: 8 }}>
              <Field label={H.drawer.sectionLabel}>
                <input
                  type="text"
                  value={section.label}
                  onChange={(e) => updateDrawerSection(section.id, { label: e.target.value })}
                  placeholder={H.drawer.sectionLabelPlaceholder}
                  aria-label={H.drawer.sectionLabel}
                  style={textInputStyle}
                />
              </Field>
              <Field label={H.drawer.sectionHref}>
                <input
                  type="text"
                  value={section.href}
                  onChange={(e) => updateDrawerSection(section.id, { href: e.target.value })}
                  placeholder="#seccion"
                  aria-label={H.drawer.sectionHref}
                  style={textInputStyle}
                />
              </Field>
              <div className="flex items-center" style={{ gap: 6 }}>
                <span
                  style={{ fontSize: 11, fontWeight: 500, color: "var(--text-secondary)", flex: 1 }}
                >
                  {H.drawer.sectionVisible}
                </span>
                <SegBtn
                  label={H.visible}
                  active={section.visible}
                  onClick={() => updateDrawerSection(section.id, { visible: true })}
                />
                <SegBtn
                  label={H.hidden}
                  active={!section.visible}
                  onClick={() => updateDrawerSection(section.id, { visible: false })}
                />
              </div>
            </div>
          )}
        />

        <Divider />

        {/* ── UTILIDAD DEL DRAWER ───────────────────────────────────────── */}
        <SectionLabel>{H.sections.drawerUtility}</SectionLabel>

        <ReorderableList
          items={cfg.drawerUtility}
          keyOf={(a) => a.id}
          canAdd
          canRemove={cfg.drawerUtility.length > 1}
          addLabel={H.drawerUtility.add}
          onAdd={addDrawerUtility}
          onRemove={(key) =>
            set("drawerUtility", removeById(cfg.drawerUtility, (a) => a.id, key))
          }
          onMoveUp={(key) =>
            set("drawerUtility", moveUp(cfg.drawerUtility, (a) => a.id, key))
          }
          onMoveDown={(key) =>
            set("drawerUtility", moveDown(cfg.drawerUtility, (a) => a.id, key))
          }
          renderItem={(action) => (
            <UtilityActionEditor
              action={action}
              onChange={(next) => updateDrawerUtility(action.id, next)}
            />
          )}
        />

        <Divider />

        {/* ── IDIOMAS ──────────────────────────────────────────────────── */}
        <SectionLabel>{H.sections.languages}</SectionLabel>

        <div className="flex flex-col" style={{ gap: 6 }}>
          {cfg.languages.map((lang) => (
            <div key={lang.code} className="flex items-center" style={{ gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-primary)",
                  fontWeight: 500,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {lang.label}
                <span
                  style={{
                    marginLeft: 5,
                    fontSize: 10,
                    color: "var(--text-tertiary)",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  }}
                >
                  {lang.code}
                </span>
              </span>
              <SegBtn
                label={H.enabled}
                active={lang.enabled}
                onClick={() =>
                  set(
                    "languages",
                    cfg.languages.map((l) =>
                      l.code === lang.code ? { ...l, enabled: !l.enabled } : l,
                    ),
                  )
                }
              />
            </div>
          ))}
        </div>

        <Divider />

        {/* ── MONEDAS ──────────────────────────────────────────────────── */}
        <SectionLabel>{H.sections.currencies}</SectionLabel>

        <div className="flex flex-col" style={{ gap: 6 }}>
          {cfg.currencies.map((cur) => (
            <div key={cur.code} className="flex items-center" style={{ gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-primary)",
                  fontWeight: 500,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {cur.code}
                <span
                  style={{
                    marginLeft: 5,
                    fontSize: 10,
                    color: "var(--text-tertiary)",
                  }}
                >
                  {cur.symbol}
                </span>
              </span>
              <SegBtn
                label={H.enabled}
                active={cur.enabled}
                onClick={() =>
                  set(
                    "currencies",
                    cfg.currencies.map((c) =>
                      c.code === cur.code ? { ...c, enabled: !c.enabled } : c,
                    ),
                  )
                }
              />
            </div>
          ))}
        </div>

        {/* Espacio al pie para que el último item no quede pegado al borde del scroll */}
        <div style={{ height: 8 }} aria-hidden="true" />
      </div>
    </aside>
  );
}
