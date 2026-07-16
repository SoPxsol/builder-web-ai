import { useId, useRef, useState } from "react";
import {
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  Globe,
  GripVertical,
  Heart,
  KeyRound,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Plus,
  Slash,
  Sparkles,
  Star,
  Tag,
  Trash2,
  User,
  type LucideIcon,
} from "lucide-react";
import type { NavConfig, UtilityAction, NavSection, BottomBarSlot, ViewportMode } from "../../types/builder";
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
  outlineColor: "var(--accent-info)",
  fontFamily: "inherit",
};

/** Foco de teclado visible (WCAG 2.4.7): sin outline con mouse, anillo con teclado. */
const inputFocusClass =
  "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1";

/* ─── Subcomponentes locales (hermanos de los de ModuleEditPanel) ─────── */

/**
 * Sección colapsable del panel — encabezado uppercase (mismo look que el
 * "advancedLabel" de ModuleEditPanel) convertido en botón que expande/
 * colapsa su contenido. Arranca SIEMPRE abierta (`useState(true)`): nada se
 * esconde de entrada, es sólo una ayuda para enfocarse en una sección a la
 * vez. El estado abierto/cerrado es de UI local — no vive en navConfig ni
 * en el draft, así que no dispara autosave.
 *
 * Sin ícono rotado: se muestra ChevronDown (abierto) o ChevronRight
 * (cerrado) según el estado, evitando animación de transform — no hace
 * falta lidiar con `prefers-reduced-motion` si no hay movimiento.
 */
function CollapsibleSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const bodyId = useId();
  const Chevron = open ? ChevronDown : ChevronRight;

  return (
    <div className="flex flex-col" style={{ gap: open ? 10 : 0 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex items-center justify-between w-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
        style={{
          gap: 6,
          padding: "5px 2px",
          minHeight: 26,
          background: "transparent",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          outlineColor: "var(--accent-info)",
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--text-tertiary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {title}
        </span>
        <Chevron size={14} aria-hidden="true" style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
      </button>
      {open && (
        <div id={bodyId} className="flex flex-col" style={{ gap: 10 }}>
          {children}
        </div>
      )}
    </div>
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
        background: active ? "var(--control-selected-bg)" : "#fff",
        border: active ? "0.5px solid var(--control-selected-border)" : "0.5px solid var(--border-ui)",
        borderRadius: 5,
        fontSize: 11,
        fontWeight: 500,
        color: active ? "var(--control-selected-fg)" : disabled ? "var(--text-tertiary)" : "var(--text-secondary)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        outlineColor: "var(--accent-info)",
      }}
    >
      {label}
    </button>
  );
}

/**
 * Roving tabindex para grupos `role="radiogroup"` (patrón WAI-ARIA APG:
 * "Radio Group"). Las flechas mueven el foco Y seleccionan a la vez —
 * es el comportamiento esperado para radios nativos.
 */
function useRovingRadioGroup(count: number, onSelect: (index: number) => void) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const focusAt = (index: number) => {
    const wrapped = ((index % count) + count) % count;
    refs.current[wrapped]?.focus();
    onSelect(wrapped);
  };
  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      focusAt(index + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      focusAt(index - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusAt(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusAt(count - 1);
    }
  };
  return { refs, onKeyDown };
}

/**
 * Grupo de selección ÚNICA accesible — hermano de SegBtn, mismo look visual.
 * A diferencia de SegBtn suelto (aria-pressed), expone `role="radiogroup"` +
 * `role="radio"`/`aria-checked` por opción para que un lector de pantalla
 * entienda que las opciones son mutuamente excluyentes.
 * Usar SOLO para grupos de selección única (no para toggles multi-selección).
 */
function SegRadioGroup<T>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  ariaLabel: string;
}) {
  const { refs, onKeyDown } = useRovingRadioGroup(options.length, (i) => onChange(options[i].value));

  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex items-center flex-wrap" style={{ gap: 6 }}>
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <button
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className="transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{
              padding: "5px 10px",
              background: active ? "var(--control-selected-bg)" : "#fff",
              border: active ? "0.5px solid var(--control-selected-border)" : "0.5px solid var(--border-ui)",
              borderRadius: 5,
              fontSize: 11,
              fontWeight: 500,
              color: active ? "var(--control-selected-fg)" : "var(--text-secondary)",
              cursor: "pointer",
              outlineColor: "var(--accent-info)",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Mini-diagrama (CSS puro — divs con tokens, sin SVG/imágenes) de la
 * disposición mobile: representa una pantalla con barra(s) arriba y/o abajo
 * según la variante, para que la opción se entienda de un vistazo.
 */
function MobileLayoutDiagram({ variant }: { variant: "top" | "both" | "bottom" }) {
  const barHeight = variant === "both" ? 6 : 8;
  return (
    <div
      aria-hidden="true"
      className="flex flex-col shrink-0"
      style={{
        width: 36,
        height: 56,
        padding: 3,
        gap: 2,
        background: "var(--surface-page)",
        border: "0.5px solid var(--border-ui)",
        borderRadius: 6,
      }}
    >
      {variant !== "bottom" && (
        <div style={{ height: barHeight, borderRadius: 2, background: "var(--text-secondary)" }} />
      )}
      <div style={{ flex: 1, borderRadius: 2, background: "var(--surface-card)" }} />
      {variant !== "top" && (
        <div style={{ height: barHeight, borderRadius: 2, background: "var(--text-secondary)" }} />
      )}
    </div>
  );
}

/**
 * Mini-diagrama de disposición desktop: una sola fila (una barra) o dos
 * filas (franja utilitaria fina + barra principal más gruesa debajo).
 */
function DesktopLayoutDiagram({ variant }: { variant: "single-row" | "two-rows" }) {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col shrink-0"
      style={{
        width: 56,
        height: 40,
        padding: 3,
        gap: 2,
        background: "var(--surface-page)",
        border: "0.5px solid var(--border-ui)",
        borderRadius: 4,
      }}
    >
      {variant === "two-rows" && (
        <div style={{ height: 4, borderRadius: 1, background: "var(--border-ui)" }} />
      )}
      <div
        style={{
          height: variant === "two-rows" ? 8 : 10,
          borderRadius: 2,
          background: "var(--text-secondary)",
        }}
      />
      <div style={{ flex: 1, borderRadius: 2, background: "var(--surface-card)" }} />
    </div>
  );
}

/**
 * Radiogroup visual de disposición — hermano de SegRadioGroup, mismo
 * contrato a11y (radiogroup/radio, aria-checked, roving tabindex), pero cada
 * opción es una card con mini-diagrama + label + microcopy en vez de un
 * botón de solo texto. Se usa para "Disposición" (mobile/desktop) donde la
 * forma del layout es más clara mostrada que descrita con una palabra.
 * Las cards van en columna (una debajo de otra): a 300px de panel no entran
 * en fila sin sacrificar la legibilidad del diagrama + la descripción.
 */
function LayoutRadioGroup<T>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string; description: string; diagram: React.ReactNode }[];
  value: T;
  onChange: (next: T) => void;
  ariaLabel: string;
}) {
  const { refs, onKeyDown } = useRovingRadioGroup(options.length, (i) => onChange(options[i].value));

  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-col" style={{ gap: 6 }}>
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <button
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className="flex items-center text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{
              gap: 10,
              minHeight: 44,
              padding: "7px 10px",
              background: active ? "var(--control-selected-bg)" : "#fff",
              border: active ? "0.5px solid var(--control-selected-border)" : "0.5px solid var(--border-ui)",
              borderRadius: 6,
              cursor: "pointer",
              outlineColor: "var(--accent-info)",
            }}
          >
            {opt.diagram}
            <span className="flex flex-col" style={{ gap: 2 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: active ? "var(--control-selected-fg)" : "var(--text-primary)",
                }}
              >
                {opt.label}
              </span>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)", lineHeight: 1.4 }}>
                {opt.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
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

/* ─── Selector visual de ícono (reemplaza el input de texto libre) ─────────
 * Mismo set curado que NAV_ICON_MAP en Canvas.tsx — si agregás un ícono acá,
 * agregalo también ahí (o el preview del canvas no lo va a resolver). */
const ICON_OPTIONS: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: "calendar-check", label: "Reservas", Icon: CalendarCheck },
  { value: "message-circle", label: "WhatsApp", Icon: MessageCircle },
  { value: "sparkles", label: "Asistente IA", Icon: Sparkles },
  { value: "key-round", label: "Check-in", Icon: KeyRound },
  { value: "user", label: "Usuario", Icon: User },
  { value: "phone", label: "Teléfono", Icon: Phone },
  { value: "mail", label: "Correo", Icon: Mail },
  { value: "map-pin", label: "Ubicación", Icon: MapPin },
  { value: "star", label: "Destacado", Icon: Star },
  { value: "menu", label: "Menú", Icon: Menu },
  { value: "globe", label: "Idioma", Icon: Globe },
  { value: "tag", label: "Oferta", Icon: Tag },
  { value: "heart", label: "Favorito", Icon: Heart },
];

/** Tamaño mínimo táctil del botón de ícono del grid (WCAG 2.5.5 ~ target size). */
const ICON_BTN_SIZE = 26;

function IconPicker({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (next: string | undefined) => void;
}) {
  // "Ninguno" se representa como value undefined; se agrega como primera opción del grupo.
  const total = ICON_OPTIONS.length + 1;
  const activeIndex = value ? ICON_OPTIONS.findIndex((o) => o.value === value) + 1 : 0;
  const { refs, onKeyDown } = useRovingRadioGroup(total, (i) =>
    onChange(i === 0 ? undefined : ICON_OPTIONS[i - 1].value),
  );

  const btnStyle = (active: boolean): React.CSSProperties => ({
    width: ICON_BTN_SIZE,
    height: ICON_BTN_SIZE,
    minWidth: ICON_BTN_SIZE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: active ? "var(--control-selected-bg)" : "#fff",
    border: active ? "0.5px solid var(--control-selected-border)" : "0.5px solid var(--border-ui)",
    borderRadius: 5,
    color: active ? "var(--control-selected-fg)" : "var(--text-secondary)",
    cursor: "pointer",
    padding: 0,
    outlineColor: "var(--accent-info)",
  });

  return (
    <div
      role="radiogroup"
      aria-label={H.action.iconPickerAria}
      className="flex flex-wrap"
      style={{ gap: 4 }}
    >
      <button
        key="none"
        ref={(el) => {
          refs.current[0] = el;
        }}
        type="button"
        role="radio"
        aria-checked={activeIndex === 0}
        aria-label={H.action.iconNone}
        title={H.action.iconNone}
        tabIndex={activeIndex === 0 ? 0 : -1}
        onClick={() => onChange(undefined)}
        onKeyDown={(e) => onKeyDown(e, 0)}
        className="transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
        style={btnStyle(activeIndex === 0)}
      >
        <Slash size={16} aria-hidden="true" />
      </button>
      {ICON_OPTIONS.map(({ value: v, label, Icon }, idx) => {
        const i = idx + 1;
        const active = activeIndex === i;
        return (
          <button
            key={v}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(v)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className="transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            style={btnStyle(active)}
          >
            <Icon size={16} aria-hidden="true" />
          </button>
        );
      })}
    </div>
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
          className={inputFocusClass}
        />
      </Field>

      <Field label={H.action.icon}>
        <IconPicker value={action.icon} onChange={(next) => set("icon", next)} />
      </Field>

      <Field label={H.action.type}>
        <SegRadioGroup
          ariaLabel={H.action.type}
          value={action.actionType}
          onChange={(next) => set("actionType", next)}
          options={(["link", "booking-engine", "whatsapp", "ai-chat"] as const).map((t) => ({
            value: t,
            label: ACTION_TYPE_LABELS[t],
          }))}
        />
      </Field>

      {action.actionType === "link" && (
        <Field label={H.action.href}>
          <input
            type="url"
            value={action.href ?? ""}
            onChange={(e) => set("href", e.target.value || undefined)}
            placeholder="https://..."
            aria-label={H.action.href}
            style={textInputStyle}
            className={inputFocusClass}
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
            className={inputFocusClass}
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
/** MIME interno del drag & drop de filas — mismo criterio que ModuleTree.tsx. */
const REORDER_MIME = "application/x-header-config-item";

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
  /**
   * Arrastre real con puntero (además de las flechas ▲▼, que siguen siendo
   * la vía accesible por teclado — WCAG 2.5.7, no se quitan). `toIndex` es
   * la posición final dentro del array YA SIN el item movido — mismo
   * criterio que `onReorderModule` en ModuleTree.tsx.
   */
  onReorder: (key: string, toIndex: number) => void;
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
  onReorder,
  renderItem,
}: ReorderableListProps<T>) {
  /* ─── Estado de drag & drop (puntero) ──────────────────────────────────── */
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  // Índice de inserción en el array ORIGINAL (0..length). La línea indicadora
  // se dibuja antes de la fila `dropIndex`.
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  function resetDrag() {
    setDraggingKey(null);
    setDropIndex(null);
  }

  /** Calcula el índice de inserción según la mitad de la fila bajo el puntero. */
  function handleRowDragOver(e: React.DragEvent, index: number) {
    if (!e.dataTransfer.types.includes(REORDER_MIME)) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const after = e.clientY - rect.top > rect.height / 2;
    setDropIndex(after ? index + 1 : index);
  }

  function handleListDrop(e: React.DragEvent) {
    e.preventDefault();
    const key = e.dataTransfer.getData(REORDER_MIME);
    const fromIndex = items.findIndex((item) => keyOf(item) === key);
    if (fromIndex >= 0 && dropIndex !== null) {
      const finalIndex = dropIndex > fromIndex ? dropIndex - 1 : dropIndex;
      if (finalIndex !== fromIndex) onReorder(key, finalIndex);
    }
    resetDrag();
  }

  return (
    <div
      className="flex flex-col"
      style={{ gap: 6 }}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes(REORDER_MIME)) e.preventDefault();
      }}
      onDragLeave={(e) => {
        // Sólo limpiar si salimos del contenedor entero (no entre filas).
        if (!e.currentTarget.contains(e.relatedTarget as Node)) resetDrag();
      }}
      onDrop={handleListDrop}
    >
      {items.map((item, idx) => (
        <div key={keyOf(item)}>
          <DropLine active={dropIndex === idx} />
          <div
            className="flex flex-col"
            onDragOver={(e) => handleRowDragOver(e, idx)}
            style={{
              border: "0.5px solid var(--border-ui)",
              borderRadius: 6,
              overflow: "hidden",
              opacity: draggingKey === keyOf(item) ? 0.4 : 1,
              transition: "opacity 0.1s ease",
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
              {/* Handle de arrastre — affordance visual + drag source real.
                  Las flechas ▲▼ siguen siendo la vía accesible por teclado. */}
              <button
                type="button"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(REORDER_MIME, keyOf(item));
                  e.dataTransfer.effectAllowed = "move";
                  setDraggingKey(keyOf(item));
                }}
                onDragEnd={resetDrag}
                aria-label={`${H.list.dragHandle}: ${idx + 1} / ${items.length}`}
                className="flex items-center justify-center flex-shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                style={{
                  width: 20,
                  height: 26,
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "grab",
                  color: "var(--text-tertiary)",
                  outlineColor: "var(--accent-info)",
                  touchAction: "none",
                }}
              >
                <GripVertical size={13} aria-hidden="true" />
              </button>
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
        </div>
      ))}
      {/* Línea indicadora al final de la lista. */}
      <DropLine active={dropIndex === items.length} />

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

/* ─── Línea indicadora de zona de drop (mismo criterio que ModuleTree.tsx) ─ */
function DropLine({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div aria-hidden="true" className="flex items-center" style={{ padding: "0 2px", height: 0 }}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--drop-indicator)",
          marginLeft: -3,
          flexShrink: 0,
        }}
      />
      <span style={{ flex: 1, height: 2, background: "var(--drop-indicator)", borderRadius: 1 }} />
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

/**
 * Mueve `key` a la posición `toIndex` del array resultante (ya sin el
 * elemento movido) — es el equivalente de moveUp/moveDown para el
 * drag & drop, donde el destino puede ser cualquier índice, no sólo el
 * vecino inmediato.
 */
function moveTo<T>(arr: T[], keyOf: (i: T) => string, key: string, toIndex: number): T[] {
  const fromIndex = arr.findIndex((i) => keyOf(i) === key);
  if (fromIndex < 0) return arr;
  const next = [...arr];
  const [item] = next.splice(fromIndex, 1);
  const clamped = Math.max(0, Math.min(toIndex, next.length));
  next.splice(clamped, 0, item);
  return next;
}

function removeById<T>(arr: T[], keyOf: (i: T) => string, key: string): T[] {
  return arr.filter((i) => keyOf(i) !== key);
}

/* ─── Componente principal ──────────────────────────────────────────────── */
interface HeaderConfigPanelProps {
  navConfig: NavConfig;
  onChange: (next: NavConfig) => void;
  /** Viewport activo en el canvas — se usa para derivar el tab activo del panel. */
  viewport: ViewportMode;
  /** Callback para cambiar el viewport desde el panel (sincroniza con el toolbar). */
  onViewportChange: (v: ViewportMode) => void;
}

export function HeaderConfigPanel({ navConfig: cfg, onChange, viewport, onViewportChange }: HeaderConfigPanelProps) {
  /**
   * El tab activo DERIVA del viewport — no hay estado local propio.
   * mobile → tab "mobile"; desktop | tablet → tab "desktop".
   * Cambiar el tab llama onViewportChange para mantener la invariante.
   */
  const activeDevice: "mobile" | "desktop" = viewport === "mobile" ? "mobile" : "desktop";
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

  /* ── Handlers de cambio de tab (sincroniza con el viewport del canvas) ── */
  function handleTabClick(device: "mobile" | "desktop") {
    // Evita disparar onViewportChange si ya estamos en el device correcto
    // (no genera un ciclo de re-render innecesario ni afecta el autosave).
    if (device === activeDevice) return;
    onViewportChange(device === "mobile" ? "mobile" : "desktop");
  }

  /**
   * Roving tabindex para los tabs Mobile/Desktop (patrón WAI-ARIA APG "Tabs",
   * modelo de activación automática): las flechas mueven el foco Y activan
   * el tab de destino a la vez, reusando el mismo `useRovingRadioGroup` que
   * ya se usa para los radiogroups del panel.
   */
  const TAB_DEVICES = ["mobile", "desktop"] as const;
  const { refs: tabRefs, onKeyDown: onTabKeyDown } = useRovingRadioGroup(TAB_DEVICES.length, (i) =>
    handleTabClick(TAB_DEVICES[i]),
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

        {/* ══════════════════════════════════════════════════════════════
            BLOQUE COMÚN — aplica a mobile y escritorio
           ══════════════════════════════════════════════════════════════ */}

        {/* Rótulo de bloque común */}
        <div
          style={{
            padding: "5px 8px",
            background: "var(--surface-raised, #f5f5f5)",
            border: "0.5px solid var(--border-ui)",
            borderRadius: 5,
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "var(--text-tertiary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              margin: 0,
            }}
          >
            {H.deviceScope.common}
          </p>
        </div>

        {/* ── LOGO ─────────────────────────────────────────────────────── */}
        <CollapsibleSection title={H.sections.logo}>
          <Field label={H.logo.type}>
            <SegRadioGroup
              ariaLabel={H.logo.type}
              value={cfg.logo.type}
              onChange={(next) => setLogo("type", next)}
              options={[
                { value: "image", label: H.logo.typeImage },
                { value: "text", label: H.logo.typeText },
              ]}
            />
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
                  className={inputFocusClass}
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
                  className={inputFocusClass}
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
              className={inputFocusClass}
            />
          </Field>
        </CollapsibleSection>

        <Divider />

        {/* ── BARRA UTILITARIA ─────────────────────────────────────────── */}
        <CollapsibleSection title={H.sections.utilityBar}>
          <Field label={H.utilityBar.visible}>
            <SegRadioGroup
              ariaLabel={H.utilityBar.visible}
              value={cfg.utilityBar.visible}
              onChange={(next) => setUtilityBar("visible", next)}
              options={[
                { value: true, label: H.visible },
                { value: false, label: H.hidden },
              ]}
            />
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
        </CollapsibleSection>

        <Divider />

        {/* ── BOTÓN DE RESERVA (compartido) ────────────────────────────── */}
        <CollapsibleSection title={H.sections.bookingButton}>
          <Field label={H.mainBar.showBookingButton}>
            <SegRadioGroup
              ariaLabel={H.mainBar.showBookingButton}
              value={cfg.mainBar.showBookingButton}
              onChange={(next) => setMainBar("showBookingButton", next)}
              options={[
                { value: true, label: H.yes },
                { value: false, label: H.no },
              ]}
            />
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
                className={inputFocusClass}
              />
            </Field>
          )}
        </CollapsibleSection>

        <Divider />

        {/* ── IDIOMAS ──────────────────────────────────────────────────── */}
        <CollapsibleSection title={H.sections.languages}>
          <div className="flex flex-col" style={{ gap: 6 }}>
            {(() => {
              const enabledCount = cfg.languages.filter((l) => l.enabled).length;
              return cfg.languages.map((lang) => {
                // Guard: no se puede apagar el último idioma habilitado.
                const isLastEnabled = lang.enabled && enabledCount === 1;
                return (
                  <div key={lang.code} className="flex items-center" style={{ gap: 8 }}>
                    <div className="flex flex-col" style={{ flex: 1, minWidth: 0, gap: 2 }}>
                      <span style={{ fontSize: 11, color: "var(--text-primary)", fontWeight: 500 }}>
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
                      {isLastEnabled && <Hint>{H.minLanguageHint}</Hint>}
                    </div>
                    <SegBtn
                      label={H.enabled}
                      active={lang.enabled}
                      disabled={isLastEnabled}
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
                );
              });
            })()}
          </div>
        </CollapsibleSection>

        <Divider />

        {/* ── MONEDAS ──────────────────────────────────────────────────── */}
        <CollapsibleSection title={H.sections.currencies}>
          <div className="flex flex-col" style={{ gap: 6 }}>
            {(() => {
              const enabledCount = cfg.currencies.filter((c) => c.enabled).length;
              return cfg.currencies.map((cur) => {
                // Guard: no se puede apagar la última moneda habilitada.
                const isLastEnabled = cur.enabled && enabledCount === 1;
                return (
                  <div key={cur.code} className="flex items-center" style={{ gap: 8 }}>
                    <div className="flex flex-col" style={{ flex: 1, minWidth: 0, gap: 2 }}>
                      <span style={{ fontSize: 11, color: "var(--text-primary)", fontWeight: 500 }}>
                        {cur.code}
                        <span style={{ marginLeft: 5, fontSize: 10, color: "var(--text-tertiary)" }}>
                          {cur.symbol}
                        </span>
                      </span>
                      {isLastEnabled && <Hint>{H.minCurrencyHint}</Hint>}
                    </div>
                    <SegBtn
                      label={H.enabled}
                      active={cur.enabled}
                      disabled={isLastEnabled}
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
                );
              });
            })()}
          </div>
        </CollapsibleSection>

        <Divider />

        {/* ══════════════════════════════════════════════════════════════
            TABS DEVICE — Mobile | Desktop
            Sincronizados 1:1 con el viewport del canvas vía activeDevice.
           ══════════════════════════════════════════════════════════════ */}

        {/* Barra de tabs */}
        <div
          role="tablist"
          aria-label={H.deviceScope.tablistAria}
          className="flex"
          style={{
            borderBottom: "0.5px solid var(--border-ui)",
            gap: 0,
          }}
        >
          {TAB_DEVICES.map((device, i) => {
            const isActive = activeDevice === device;
            const label = device === "mobile" ? H.deviceScope.tabMobile : H.deviceScope.tabDesktop;
            return (
              <button
                key={device}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`header-tab-${device}`}
                aria-selected={isActive}
                aria-controls={`header-tabpanel-${device}`}
                tabIndex={isActive ? 0 : -1}
                type="button"
                onClick={() => handleTabClick(device)}
                onKeyDown={(e) => onTabKeyDown(e, i)}
                className="flex-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                style={{
                  padding: "7px 10px",
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--control-selected-fg)" : "var(--text-secondary)",
                  background: "transparent",
                  border: "none",
                  borderBottom: isActive
                    ? "2px solid var(--control-selected-border)"
                    : "2px solid transparent",
                  cursor: "pointer",
                  outlineColor: "var(--accent-info)",
                  marginBottom: -1,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Panel Mobile */}
        <div
          role="tabpanel"
          id="header-tabpanel-mobile"
          aria-labelledby="header-tab-mobile"
          hidden={activeDevice !== "mobile"}
          className="flex flex-col"
          style={{ gap: 14 }}
        >
          {/* ── DISPOSICIÓN MOBILE ───────────────────────────────────── */}
          <CollapsibleSection title={H.sections.layout}>
            <Field label={H.layout.mobile}>
              <LayoutRadioGroup
                ariaLabel={H.layout.mobile}
                value={cfg.mobileLayout}
                onChange={(next) => set("mobileLayout", next)}
                options={[
                  {
                    value: "top",
                    label: H.layout.mobileTop,
                    description: H.layout.mobileTopDesc,
                    diagram: <MobileLayoutDiagram variant="top" />,
                  },
                  {
                    value: "both",
                    label: H.layout.mobileBoth,
                    description: H.layout.mobileBothDesc,
                    diagram: <MobileLayoutDiagram variant="both" />,
                  },
                  {
                    value: "bottom",
                    label: H.layout.mobileBottom,
                    description: H.layout.mobileBottomDesc,
                    diagram: <MobileLayoutDiagram variant="bottom" />,
                  },
                ]}
              />
            </Field>
          </CollapsibleSection>

          <Divider />

          {/* ── BARRA INFERIOR (MOBILE) ──────────────────────────────── */}
          <CollapsibleSection title={H.sections.bottomBar}>
            <Field label={H.bottomBar.visible}>
              <SegRadioGroup
                ariaLabel={H.bottomBar.visible}
                value={cfg.bottomBar.visible}
                onChange={(next) => setBottomBar("visible", next)}
                options={[
                  { value: true, label: H.visible },
                  { value: false, label: H.hidden },
                ]}
              />
            </Field>

            {cfg.bottomBar.visible && (
              <>
                <Field label={H.bottomBar.backdropBlur}>
                  <SegRadioGroup
                    ariaLabel={H.bottomBar.backdropBlur}
                    value={cfg.bottomBar.backdropBlur}
                    onChange={(next) => setBottomBar("backdropBlur", next)}
                    options={[
                      { value: true, label: H.yes },
                      { value: false, label: H.no },
                    ]}
                  />
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
                    onReorder={(key, toIndex) =>
                      setBottomBar(
                        "slots",
                        moveTo(cfg.bottomBar.slots, (s) => s.id, key, toIndex).map((s, i) => ({
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
          </CollapsibleSection>

          <Divider />

          {/* ── SECCIONES DEL MENÚ (DRAWER) ─────────────────────────── */}
          <CollapsibleSection title={H.sections.drawerSections}>
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
                  moveUp(cfg.drawerSections, (s) => s.id, key).map((s, i) => ({
                    ...s,
                    order: i,
                  })),
                )
              }
              onMoveDown={(key) =>
                set(
                  "drawerSections",
                  moveDown(cfg.drawerSections, (s) => s.id, key).map((s, i) => ({
                    ...s,
                    order: i,
                  })),
                )
              }
              onReorder={(key, toIndex) =>
                set(
                  "drawerSections",
                  moveTo(cfg.drawerSections, (s) => s.id, key, toIndex).map((s, i) => ({
                    ...s,
                    order: i,
                  })),
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
                      className={inputFocusClass}
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
                      className={inputFocusClass}
                    />
                  </Field>
                  <div className="flex items-center" style={{ gap: 6 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: "var(--text-secondary)",
                        flex: 1,
                      }}
                    >
                      {H.drawer.sectionVisible}
                    </span>
                    <SegRadioGroup
                      ariaLabel={H.drawer.sectionVisible}
                      value={section.visible}
                      onChange={(next) => updateDrawerSection(section.id, { visible: next })}
                      options={[
                        { value: true, label: H.visible },
                        { value: false, label: H.hidden },
                      ]}
                    />
                  </div>
                </div>
              )}
            />
          </CollapsibleSection>

          <Divider />

          {/* ── UTILIDAD DEL DRAWER ─────────────────────────────────── */}
          <CollapsibleSection title={H.sections.drawerUtility}>
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
              onReorder={(key, toIndex) =>
                set("drawerUtility", moveTo(cfg.drawerUtility, (a) => a.id, key, toIndex))
              }
              renderItem={(action) => (
                <UtilityActionEditor
                  action={action}
                  onChange={(next) => updateDrawerUtility(action.id, next)}
                />
              )}
            />
          </CollapsibleSection>
        </div>

        {/* Panel Desktop */}
        <div
          role="tabpanel"
          id="header-tabpanel-desktop"
          aria-labelledby="header-tab-desktop"
          hidden={activeDevice !== "desktop"}
          className="flex flex-col"
          style={{ gap: 14 }}
        >
          {/* ── DISPOSICIÓN ESCRITORIO ───────────────────────────────── */}
          <CollapsibleSection title={H.sections.layout}>
            <Field label={H.layout.desktop}>
              <LayoutRadioGroup
                ariaLabel={H.layout.desktop}
                value={cfg.desktopLayout}
                onChange={(next) => set("desktopLayout", next)}
                options={[
                  {
                    value: "single-row",
                    label: H.layout.desktopSingle,
                    description: H.layout.desktopSingleDesc,
                    diagram: <DesktopLayoutDiagram variant="single-row" />,
                  },
                  {
                    value: "two-rows",
                    label: H.layout.desktopTwo,
                    description: H.layout.desktopTwoDesc,
                    diagram: <DesktopLayoutDiagram variant="two-rows" />,
                  },
                ]}
              />
            </Field>
          </CollapsibleSection>

          <Divider />

          {/* ── BARRA PRINCIPAL — sticky (desktop only) ──────────────── */}
          <CollapsibleSection title={H.sections.mainBar}>
            <Field label={H.mainBar.sticky}>
              <SegRadioGroup
                ariaLabel={H.mainBar.sticky}
                value={cfg.mainBar.sticky}
                onChange={(next) => setMainBar("sticky", next)}
                options={[
                  { value: true, label: H.yes },
                  { value: false, label: H.no },
                ]}
              />
            </Field>
          </CollapsibleSection>
        </div>

        {/* Espacio al pie para que el último item no quede pegado al borde del scroll */}
        <div style={{ height: 8 }} aria-hidden="true" />
      </div>
    </aside>
  );
}
