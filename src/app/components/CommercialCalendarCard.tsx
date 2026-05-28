import { useEffect, useRef, useState } from "react";
import { Calendar, ArrowRight, Sparkles, Timer, UserPlus, LogOut, Tag, Share2, Check, Bell, BellRing } from "lucide-react";
import type { View } from "../types";
import type { PopupState } from "../types/creation";
import {
  buildPopupPreset,
  COUNTRY_META,
  formatCountdown,
  formatDateRange,
  getAvailableCountries,
  getEventStatus,
  getUpcomingEvents,
  type CommercialEvent,
  type CountryFilter,
} from "../data/commercialEvents";

interface Props {
  navigate: (view: View, siteId?: number) => void;
  /**
   * Abre el CreatePopupWizard con un preset. El card lo invoca para los 3
   * tipos de pop-up del menú (countdown / leadcapture / exit-intent).
   */
  openCreatePopupWith: (preset: Partial<PopupState>) => void;
  /** Permite inyectar "hoy" para tests/storybook. Default: new Date(). */
  today?: Date;
}

/* ─── Recordatorios persistidos en localStorage ────────────────────────── */
const REMINDERS_STORAGE_KEY = "pxsol.commercialReminders.v1";

function readReminders(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(REMINDERS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function writeReminders(value: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Quota lleno o privacy mode — silent fail.
  }
}

/**
 * Calendario comercial — surface el calendario de fechas clave del eCommerce
 * directo en el Dashboard. Cada evento incluye countdown en días, prueba
 * social ("+12 reservas promedio") y un menú de acciones one-click que
 * dispara la creación de pop-up countdown / lead capture / exit-intent /
 * promo, o copia un mensaje pre-armado para difundir por WhatsApp.
 *
 * El filtro de país (chips arriba) por default está en "Todos" — el hotelero
 * que opera solo en LATAM puede ocultar Black Friday Global con un clic.
 */
export function CommercialCalendarCard({ navigate, openCreatePopupWith, today = new Date() }: Props) {
  const [country, setCountry] = useState<CountryFilter>("ALL");
  const [reminders, setReminders] = useState<Record<string, boolean>>(() => readReminders());
  const events = getUpcomingEvents(undefined, 3, today, country);
  const availableCountries = getAvailableCountries();

  function toggleReminder(eventId: string) {
    setReminders((prev) => {
      const next = { ...prev, [eventId]: !prev[eventId] };
      writeReminders(next);
      return next;
    });
  }

  return (
    <section
      aria-labelledby="commercial-calendar-heading"
      className="mb-6"
      style={{
        background: "var(--surface-card)",
        borderRadius: "var(--radius-card)",
        border: "0.5px solid var(--border-ui)",
        padding: 16,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div
            aria-hidden="true"
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 36,
              height: 36,
              background: "var(--accent-info-bg)",
              borderRadius: "var(--radius-icon)",
            }}
          >
            <Calendar size={18} style={{ color: "var(--accent-info)" }} />
          </div>
          <div className="min-w-0">
            <h2
              id="commercial-calendar-heading"
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: 600,
                color: "var(--text-primary)",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              Calendario comercial
            </h2>
            <p
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--text-secondary)",
                marginTop: 2,
                lineHeight: 1.4,
              }}
            >
              Preparate con antelación y capturá más reservas directas en las fechas de mayor demanda.
            </p>
          </div>
        </div>

        {/* Filtro por país */}
        <CountryFilterChips
          available={availableCountries}
          value={country}
          onChange={setCountry}
        />
      </div>

      {/* Grid de eventos o empty state */}
      {events.length === 0 ? (
        <EmptyState country={country} onClear={() => setCountry("ALL")} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              today={today}
              navigate={navigate}
              openCreatePopupWith={openCreatePopupWith}
              reminderOn={!!reminders[event.id]}
              onToggleReminder={() => toggleReminder(event.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ─── Country filter chips ─────────────────────────────────────────────── */

interface CountryFilterChipsProps {
  available: ReturnType<typeof getAvailableCountries>;
  value: CountryFilter;
  onChange: (v: CountryFilter) => void;
}

function CountryFilterChips({ available, value, onChange }: CountryFilterChipsProps) {
  const options: Array<{ value: CountryFilter; label: string }> = [
    { value: "ALL", label: "Todos" },
    ...available.map((c) => ({ value: c, label: COUNTRY_META[c].label })),
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Filtrar por país"
      className="flex items-center gap-1 flex-wrap"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 transition-colors"
            style={{
              height: 24,
              padding: "0 10px",
              background: active ? "var(--accent-info-bg)" : "transparent",
              color: active ? "var(--accent-info)" : "var(--text-secondary)",
              border: `1px solid ${active ? "var(--accent-info)" : "var(--border-ui)"}`,
              borderRadius: "var(--radius-nav)",
              fontSize: "var(--font-size-xs)",
              fontWeight: 500,
              cursor: "pointer",
              outlineColor: "var(--accent-info)",
              whiteSpace: "nowrap",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Empty state ──────────────────────────────────────────────────────── */

function EmptyState({ country, onClear }: { country: CountryFilter; onClear: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{
        background: "var(--surface-page)",
        borderRadius: "var(--radius-item)",
        border: "0.5px dashed var(--border-ui)",
        padding: "24px 16px",
      }}
    >
      <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", marginBottom: 6 }}>
        {country === "ALL"
          ? "No hay eventos próximos en el calendario."
          : "Sin eventos próximos para este país."}
      </p>
      {country !== "ALL" && (
        <button
          type="button"
          onClick={onClear}
          className="transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            fontSize: "var(--font-size-sm)",
            fontWeight: 500,
            color: "var(--accent-info)",
            cursor: "pointer",
            outlineColor: "var(--accent-info)",
            borderRadius: 3,
          }}
        >
          Ver todos los países
        </button>
      )}
    </div>
  );
}

/* ─── Event card ───────────────────────────────────────────────────────── */

interface EventCardProps {
  event: CommercialEvent;
  today: Date;
  navigate: (view: View, siteId?: number) => void;
  openCreatePopupWith: (preset: Partial<PopupState>) => void;
  reminderOn: boolean;
  onToggleReminder: () => void;
}

function EventCard({ event, today, navigate, openCreatePopupWith, reminderOn, onToggleReminder }: EventCardProps) {
  const country = COUNTRY_META[event.country];
  const status = getEventStatus(event, today);
  const isLive = status === "live";

  const startDelta = Math.max(
    0,
    Math.round(
      (new Date(event.startDate + "T00:00:00").getTime() -
        new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );
  const countdownColor = isLive
    ? "var(--status-active)"
    : startDelta <= 7
      ? "var(--accent-info)"
      : "var(--text-secondary)";

  return (
    <div
      className="flex flex-col p-3"
      style={{
        background: "var(--surface-page)",
        borderRadius: "var(--radius-item)",
        border: "0.5px solid var(--border-ui)",
        minHeight: 180,
      }}
    >
      {/* Top: país + status + bell */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span aria-hidden="true" style={{ fontSize: 14, lineHeight: 1 }}>
            {country.flag}
          </span>
          <span
            className="truncate"
            style={{
              fontSize: "var(--font-size-xs)",
              fontWeight: 500,
              color: "var(--text-tertiary)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {country.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isLive && (
            <span
              className="px-1.5 h-[16px] flex items-center"
              style={{
                background: "var(--badge-green-bg)",
                color: "var(--badge-green-text)",
                borderRadius: "var(--radius-dot)",
                fontSize: "var(--font-size-xs)",
                fontWeight: 500,
              }}
            >
              En curso
            </span>
          )}
          <button
            type="button"
            onClick={onToggleReminder}
            aria-pressed={reminderOn}
            aria-label={reminderOn ? `Desactivar recordatorio para ${event.name}` : `Activar recordatorio para ${event.name}`}
            title={reminderOn ? "Recordatorio activo · te avisaremos 7 días antes" : "Activar recordatorio"}
            className="flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{
              width: 24,
              height: 24,
              background: reminderOn ? "var(--accent-info-bg)" : "transparent",
              border: `1px solid ${reminderOn ? "var(--accent-info)" : "var(--border-ui)"}`,
              borderRadius: "var(--radius-dot)",
              color: reminderOn ? "var(--accent-info)" : "var(--text-tertiary)",
              cursor: "pointer",
              outlineColor: "var(--accent-info)",
            }}
          >
            {reminderOn
              ? <BellRing size={11} aria-hidden="true" />
              : <Bell size={11} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Nombre del evento */}
      <p
        style={{
          fontSize: "var(--font-size-md)",
          fontWeight: 600,
          color: "var(--text-primary)",
          lineHeight: 1.3,
          marginBottom: 4,
        }}
      >
        {event.name}
      </p>

      {/* Fechas + countdown */}
      <p
        style={{
          fontSize: "var(--font-size-sm)",
          color: "var(--text-secondary)",
          lineHeight: 1.3,
        }}
      >
        {formatDateRange(event.startDate, event.endDate)}
      </p>
      <p
        className="mt-1"
        style={{
          fontSize: "var(--font-size-sm)",
          fontWeight: 500,
          color: countdownColor,
          lineHeight: 1.3,
        }}
      >
        {formatCountdown(event, today)}
      </p>

      {/* Prueba social */}
      {event.estimatedImpact && (
        <div
          className="flex items-center gap-1.5 mt-2"
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
            lineHeight: 1.3,
          }}
        >
          <Sparkles size={11} aria-hidden="true" style={{ color: "var(--badge-orange-text)", flexShrink: 0 }} />
          <span>{event.estimatedImpact}</span>
        </div>
      )}

      {/* Confirmación del recordatorio activo */}
      {reminderOn && (
        <p
          className="mt-2"
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--accent-info)",
            lineHeight: 1.3,
          }}
        >
          Te avisaremos 7 días antes
        </p>
      )}

      {/* CTA con menú de acciones */}
      <div className="mt-auto pt-3" style={{ position: "relative" }}>
        <EventActionMenu
          event={event}
          navigate={navigate}
          openCreatePopupWith={openCreatePopupWith}
        />
      </div>
    </div>
  );
}

/* ─── Event action menu ────────────────────────────────────────────────── */

interface EventActionMenuProps {
  event: CommercialEvent;
  navigate: (view: View, siteId?: number) => void;
  openCreatePopupWith: (preset: Partial<PopupState>) => void;
}

function EventActionMenu({ event, navigate, openCreatePopupWith }: EventActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Cerrar al click afuera + ESC
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Auto-reset del feedback "copiado"
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  function goTo(view: View) {
    setOpen(false);
    navigate(view);
  }

  function openPreset(preset: "countdown" | "leadcapture" | "exit-intent") {
    setOpen(false);
    openCreatePopupWith(buildPopupPreset(event, preset));
  }

  async function shareWhatsApp() {
    if (!event.whatsappMessage) return;
    try {
      await navigator.clipboard.writeText(event.whatsappMessage);
      setCopied(true);
    } catch {
      // Fallback silencioso — algunos browsers bloquean clipboard sin gesture.
      setCopied(true);
    }
  }

  const menuId = `event-menu-${event.id}`;

  return (
    <div ref={wrapperRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Preparar campaña para ${event.name}`}
        className="focus-ring-dark flex items-center gap-1 transition-opacity hover:opacity-75"
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          fontSize: "var(--font-size-sm)",
          fontWeight: 500,
          color: "var(--accent-info)",
          cursor: "pointer",
          textAlign: "left",
          outlineColor: "var(--accent-info)",
          borderRadius: 3,
        }}
      >
        <span>Preparar campaña</span>
        <ArrowRight
          size={11}
          aria-hidden="true"
          style={{
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
          }}
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={`Acciones para ${event.name}`}
          style={{
            position: "absolute",
            bottom: "calc(100% + 4px)",
            left: 0,
            zIndex: 20,
            minWidth: 220,
            background: "var(--surface-card)",
            borderRadius: "var(--radius-item)",
            border: "0.5px solid var(--border-ui)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            padding: 4,
          }}
        >
          <MenuItem
            icon={<Timer size={13} />}
            label="Pop-up countdown"
            description="Pre-cargado con tu evento"
            onClick={() => openPreset("countdown")}
          />
          <MenuItem
            icon={<UserPlus size={13} />}
            label="Captar pre-registro"
            description="Pre-cargado con tu evento"
            onClick={() => openPreset("leadcapture")}
          />
          <MenuItem
            icon={<LogOut size={13} />}
            label="Pop-up exit-intent"
            description="Pre-cargado con tu evento"
            onClick={() => openPreset("exit-intent")}
          />
          <MenuItem
            icon={<Tag size={13} />}
            label="Crear promo"
            description="Tarifa especial del evento"
            onClick={() => goTo("promociones")}
          />

          {event.whatsappMessage && (
            <>
              <div style={{ height: 1, background: "var(--border-ui)", margin: "4px 0" }} />
              <MenuItem
                icon={copied ? <Check size={13} /> : <Share2 size={13} />}
                label={copied ? "Mensaje copiado" : "Compartir por WhatsApp"}
                description={copied ? "Pegalo en tu WhatsApp" : "Texto pre-armado"}
                onClick={shareWhatsApp}
                tone={copied ? "success" : "default"}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  description,
  onClick,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  tone?: "default" | "success";
}) {
  const iconColor = tone === "success" ? "var(--status-active)" : "var(--accent-info)";
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex items-start gap-2 w-full text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
      style={{
        background: "transparent",
        border: "none",
        padding: "8px 10px",
        borderRadius: "var(--radius-nav)",
        cursor: "pointer",
        outlineColor: "var(--accent-info)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-page)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span
        aria-hidden="true"
        className="flex items-center justify-center flex-shrink-0"
        style={{ width: 18, height: 18, color: iconColor, marginTop: 1 }}
      >
        {icon}
      </span>
      <span className="flex flex-col min-w-0">
        <span
          style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: 500,
            color: "var(--text-primary)",
            lineHeight: 1.3,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-tertiary)",
            lineHeight: 1.3,
            marginTop: 1,
          }}
        >
          {description}
        </span>
      </span>
    </button>
  );
}
