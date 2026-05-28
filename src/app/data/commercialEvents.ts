/**
 * Calendario comercial — fechas clave del eCommerce y turismo en LATAM.
 *
 * Cada evento incluye país, fechas, descripción corta y acciones sugeridas
 * que el hotelero puede preparar con antelación (pop-up countdown, promo,
 * captación de leads, artículo de blog).
 *
 * Las fechas son las publicadas oficialmente por cada cámara/asociación
 * (CACE en AR, CCS en CL, AMVO en MX). Para fechas globales (Black Friday,
 * Cyber Monday) usamos las convencionales del calendario gregoriano.
 */

import type { PopupState } from "../types/creation";

export type CountryCode = "AR" | "CL" | "MX" | "CO" | "PE" | "BR" | "GLOBAL";

export type ActionType = "popup" | "promo" | "blog" | "leadcapture";

export interface SuggestedAction {
  type: ActionType;
  label: string;
}

export interface CommercialEvent {
  id: string;
  name: string;
  country: CountryCode;
  /** YYYY-MM-DD inclusive */
  startDate: string;
  /** YYYY-MM-DD inclusive */
  endDate: string;
  description: string;
  suggestedActions: SuggestedAction[];
  /**
   * Prueba social — texto corto que aparece debajo del countdown.
   * Source: cohort interno de hoteles activos en el evento del año anterior.
   * Si no hay dato confiable para un evento, dejar undefined.
   */
  estimatedImpact?: string;
  /** Mensaje pre-armado para difusión por WhatsApp / redes. */
  whatsappMessage?: string;
}

export const COUNTRY_META: Record<CountryCode, { flag: string; label: string }> = {
  AR:     { flag: "🇦🇷", label: "Argentina" },
  CL:     { flag: "🇨🇱", label: "Chile" },
  MX:     { flag: "🇲🇽", label: "México" },
  CO:     { flag: "🇨🇴", label: "Colombia" },
  PE:     { flag: "🇵🇪", label: "Perú" },
  BR:     { flag: "🇧🇷", label: "Brasil" },
  GLOBAL: { flag: "🌎", label: "Global" },
};

export const COMMERCIAL_EVENTS_2026: CommercialEvent[] = [
  {
    id: "hotsale-ar-2026",
    name: "Hot Sale Argentina",
    country: "AR",
    startDate: "2026-05-11",
    endDate: "2026-05-13",
    description: "El evento de eCommerce más grande de Argentina (CACE). Hot Week extiende ofertas hasta el 17 de mayo.",
    suggestedActions: [
      { type: "popup",       label: "Pop-up countdown" },
      { type: "leadcapture", label: "Captar pre-registro" },
      { type: "promo",       label: "Promo Hot Sale" },
    ],
    estimatedImpact: "+18 reservas promedio en hoteles similares",
    whatsappMessage: "Tarifas especiales por Hot Sale, del 11 al 13 de mayo. Reservá directo y aprovechá el mejor precio del año 👉 [tu-sitio]",
  },
  {
    id: "cyberday-cl-2026",
    name: "CyberDay Chile",
    country: "CL",
    startDate: "2026-06-01",
    endDate: "2026-06-03",
    description: "Evento principal de eCommerce de Chile organizado por la CCS. Alta intención de compra en turismo.",
    suggestedActions: [
      { type: "popup",       label: "Pop-up countdown" },
      { type: "leadcapture", label: "Captar pre-registro" },
      { type: "promo",       label: "Promo CyberDay" },
    ],
    estimatedImpact: "+12 reservas promedio en hoteles similares",
    whatsappMessage: "Llegó el CyberDay 🛒 Tarifas exclusivas del 1 al 3 de junio. Reservá directo y pagá menos 👉 [tu-sitio]",
  },
  {
    id: "gran-escapada-mx-2026",
    name: "La Gran Escapada México",
    country: "MX",
    startDate: "2026-06-18",
    endDate: "2026-06-21",
    description: "Buen Fin del Turismo — campaña enfocada en hoteles y experiencias de viaje en México.",
    suggestedActions: [
      { type: "popup",       label: "Pop-up countdown" },
      { type: "promo",       label: "Tarifas especiales" },
      { type: "blog",        label: "Guía de destinos" },
    ],
    estimatedImpact: "+15 reservas promedio en hoteles similares",
    whatsappMessage: "La Gran Escapada arranca el 18 de junio ✈️ Tarifas especiales reservando directo. Te esperamos 👉 [tu-sitio]",
  },
  {
    id: "cybermonday-ar-2026",
    name: "Cyber Monday Argentina",
    country: "AR",
    startDate: "2026-11-02",
    endDate: "2026-11-04",
    description: "Segundo evento clave de CACE en el año. Funciona muy bien para reservas con check-in en verano.",
    suggestedActions: [
      { type: "popup",       label: "Pop-up countdown" },
      { type: "leadcapture", label: "Captar pre-registro" },
      { type: "promo",       label: "Promo Cyber Monday" },
    ],
    estimatedImpact: "+22 reservas promedio en hoteles similares",
    whatsappMessage: "Cyber Monday 🔥 Reservá tus vacaciones con tarifas únicas del 2 al 4 de noviembre. Solo reservando directo 👉 [tu-sitio]",
  },
  {
    id: "buenfin-mx-2026",
    name: "El Buen Fin México",
    country: "MX",
    startDate: "2026-11-13",
    endDate: "2026-11-16",
    description: "El fin de semana más barato del año en México. AMVO + Concanaco — alto tráfico transaccional.",
    suggestedActions: [
      { type: "popup",       label: "Pop-up countdown" },
      { type: "promo",       label: "Promo Buen Fin" },
      { type: "leadcapture", label: "Captar pre-registro" },
    ],
    estimatedImpact: "+24 reservas promedio en hoteles similares",
    whatsappMessage: "El Buen Fin llegó 🛍️ Tarifas imperdibles del 13 al 16 de noviembre, reservando directo en nuestro sitio 👉 [tu-sitio]",
  },
  {
    id: "blackfriday-2026",
    name: "Black Friday",
    country: "GLOBAL",
    startDate: "2026-11-27",
    endDate: "2026-11-27",
    description: "Evento global de descuentos. Ideal para liberar disponibilidad de temporada baja.",
    suggestedActions: [
      { type: "popup",       label: "Pop-up exit-intent" },
      { type: "promo",       label: "Promo Black Friday" },
      { type: "leadcapture", label: "Captar pre-registro" },
    ],
    estimatedImpact: "+9 reservas promedio en hoteles similares",
    whatsappMessage: "Black Friday 🖤 Tarifas únicas por 24 horas. Reservá directo y aprovechá el descuento más grande del año 👉 [tu-sitio]",
  },
];

/**
 * Devuelve la cantidad de días entre hoy y la fecha de inicio del evento.
 * - 0 si el evento empieza hoy
 * - Negativo si ya pasó (usamos endDate para considerar "en curso")
 */
export function daysUntil(dateISO: string, today: Date = new Date()): number {
  const target = new Date(dateISO + "T00:00:00");
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffMs = target.getTime() - base.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/** Estado relativo del evento según la fecha de hoy. */
export type EventStatus = "upcoming" | "live" | "past";

export function getEventStatus(event: CommercialEvent, today: Date = new Date()): EventStatus {
  const startDelta = daysUntil(event.startDate, today);
  const endDelta = daysUntil(event.endDate, today);
  if (endDelta < 0) return "past";
  if (startDelta <= 0 && endDelta >= 0) return "live";
  return "upcoming";
}

/**
 * Filtro de país para el chip group del Dashboard.
 * - "ALL" muestra todos los eventos.
 * - Un código específico (AR, CL, MX…) muestra ese país + GLOBAL (Black Friday
 *   aplica para cualquier hotel con mercado internacional).
 */
export type CountryFilter = "ALL" | CountryCode;

/**
 * Eventos a mostrar en el Dashboard — próximos N que no hayan terminado.
 * Se incluyen los "en curso" porque seguir activando últimas conversiones
 * todavía tiene valor durante el evento.
 *
 * `countryFilter`:
 *   - "ALL" o undefined → todos los eventos
 *   - código específico → ese país + GLOBAL
 */
export function getUpcomingEvents(
  events: CommercialEvent[] = COMMERCIAL_EVENTS_2026,
  limit = 3,
  today: Date = new Date(),
  countryFilter: CountryFilter = "ALL",
): CommercialEvent[] {
  return events
    .filter((e) => getEventStatus(e, today) !== "past")
    .filter((e) => {
      if (countryFilter === "ALL") return true;
      return e.country === countryFilter || e.country === "GLOBAL";
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, limit);
}

/**
 * Países representados en el dataset (excluyendo GLOBAL), ordenados por
 * cantidad de eventos descendente — los más activos aparecen primero en
 * el chip group.
 */
export function getAvailableCountries(
  events: CommercialEvent[] = COMMERCIAL_EVENTS_2026,
): CountryCode[] {
  const counts = new Map<CountryCode, number>();
  for (const e of events) {
    if (e.country === "GLOBAL") continue;
    counts.set(e.country, (counts.get(e.country) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([c]) => c);
}

/**
 * Formatea el rango de fechas en español corto. Ejemplos:
 *   "11-13 may" (mismo mes)
 *   "27 nov"    (un solo día)
 *   "30 may - 3 jun" (cruza meses)
 */
const MONTHS_ES_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function formatDateRange(startISO: string, endISO: string): string {
  const start = new Date(startISO + "T00:00:00");
  const end = new Date(endISO + "T00:00:00");
  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = MONTHS_ES_SHORT[start.getMonth()];
  const endMonth = MONTHS_ES_SHORT[end.getMonth()];

  if (startISO === endISO) return `${startDay} ${startMonth}`;
  if (start.getMonth() === end.getMonth()) return `${startDay}-${endDay} ${startMonth}`;
  return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
}

/**
 * Tipos de pop-up que el calendario sabe pre-cargar en el CreatePopupWizard.
 * Coinciden con las opciones del action menu del card.
 */
export type PopupPreset = "countdown" | "leadcapture" | "exit-intent";

/**
 * Genera el preset del CreatePopupWizard para un evento + tipo de pop-up.
 */
export function buildPopupPreset(event: CommercialEvent, preset: PopupPreset): Partial<PopupState> {
  const eventLabel = `${event.name}`;
  const ctaUrl = "/reservas";

  if (preset === "countdown") {
    return {
      variant: "popup",
      internalName: `Countdown · ${eventLabel}`,
      title: `${event.name} se acerca`,
      description: "Pre-registrate y recibí tarifas exclusivas antes que arranquen las ofertas.",
      ctaText: "Quiero las ofertas",
      ctaUrl,
      position: "center",
      triggers: { delay: true },
      delaySeconds: 5,
    };
  }

  if (preset === "leadcapture") {
    return {
      variant: "popup",
      internalName: `Pre-registro · ${eventLabel}`,
      title: `Sé el primero en enterarte`,
      description: `Dejanos tu email y te avisamos cuando arranque ${event.name} con tarifas exclusivas.`,
      ctaText: "Quiero recibir las ofertas",
      ctaUrl,
      position: "center",
      triggers: { delay: true },
      delaySeconds: 10,
    };
  }

  // exit-intent
  return {
    variant: "popup",
    internalName: `Exit-intent · ${eventLabel}`,
    title: `¡Esperá! No te vayas sin tu ${event.name}`,
    description: "Suscribite y te avisamos apenas empiecen las ofertas exclusivas.",
    ctaText: "Avisame las ofertas",
    ctaUrl,
    position: "center",
    triggers: { exit: true },
    delaySeconds: 0,
  };
}

/** Texto del countdown — "Hoy", "Mañana", "En N días" o "En curso · termina en N días" */
export function formatCountdown(event: CommercialEvent, today: Date = new Date()): string {
  const status = getEventStatus(event, today);
  const startDelta = daysUntil(event.startDate, today);
  const endDelta = daysUntil(event.endDate, today);

  if (status === "live") {
    if (endDelta === 0) return "En curso · último día";
    return `En curso · ${endDelta} ${endDelta === 1 ? "día" : "días"} restantes`;
  }
  if (startDelta === 0) return "Empieza hoy";
  if (startDelta === 1) return "Empieza mañana";
  return `En ${startDelta} días`;
}
