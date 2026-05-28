/**
 * Tipos del Módulo de Creación. Cubre los 4 flujos: Popup, Página, Blog, Promoción.
 * Cada uno tiene su propio state y N pasos. Comparten el shell ("modo creación").
 */

export type CreationFlow = "popup" | "page" | "article" | "promotion";

export interface StepDef {
  id: string;
  label: string;
}

/** Estado visual de un step en la StepBar. */
export type StepStatus = "completed" | "active" | "pending";

// ──────────────────────────────────────────────────────────────────────────
// POPUP
// ──────────────────────────────────────────────────────────────────────────

export type PopupVariant = "popup" | "toast";

export type PopupPosition =
  | "top-left" | "top-center" | "top-right"
  | "middle-left" | "center" | "middle-right"
  | "bottom-left" | "bottom-center" | "bottom-right";

export type PopupTrigger = "delay" | "exit" | "scroll" | "click" | "inactivity" | "js";

export type PopupFrequency = "once-per-session" | "always";

export interface PopupState {
  currentStep: 1 | 2 | 3;
  // Paso 1 — diseño
  variant: PopupVariant;
  internalName: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaUrl: string;
  openIn: "new-tab" | "same-tab";
  // Paso 2 — configuración
  position: PopupPosition;
  pages: string[]; // ids: "inicio" | "reservas" | "habitaciones" | "galeria" | "contacto" | "blog"
  // Paso 3 — reglas
  triggers: Partial<Record<PopupTrigger, boolean>>;
  delaySeconds: number;
  scrollPercent: number;
  inactivitySeconds: number;
  devices: { desktop: boolean; mobile: boolean };
  frequency: PopupFrequency;
}

export const INITIAL_POPUP_STATE: PopupState = {
  currentStep: 1,
  variant: "popup",
  internalName: "",
  title: "",
  description: "",
  imageUrl: "",
  ctaText: "",
  ctaUrl: "",
  openIn: "new-tab",
  position: "center",
  pages: ["inicio"],
  triggers: { delay: true },
  delaySeconds: 5,
  scrollPercent: 50,
  inactivitySeconds: 30,
  devices: { desktop: true, mobile: true },
  frequency: "once-per-session",
};

// ──────────────────────────────────────────────────────────────────────────
// PÁGINA
// ──────────────────────────────────────────────────────────────────────────

export type PageTemplate = "blank" | "from-template" | "duplicate";

export type PageSection =
  | "hero" | "gallery" | "text-image" | "contact-form" | "rooms" | "cta";

export interface PageState {
  currentStep: 1 | 2 | 3;
  // Paso 1
  name: string;
  slug: string;
  template: PageTemplate;
  language: string;
  // Paso 2
  sections: PageSection[];
  // Paso 3
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogImage: string;
  indexable: boolean;
  showInNav: boolean;
  publish: "now" | "scheduled";
}

export const INITIAL_PAGE_STATE: PageState = {
  currentStep: 1,
  name: "",
  slug: "",
  template: "blank",
  language: "es",
  sections: [],
  seoTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  ogImage: "",
  indexable: true,
  showInNav: true,
  publish: "now",
};

// ──────────────────────────────────────────────────────────────────────────
// BLOG (Artículo)
// ──────────────────────────────────────────────────────────────────────────

export type ArticlePublishMode = "now" | "draft" | "scheduled";

export interface ArticleState {
  currentStep: 1 | 2;
  // Paso 1
  title: string;
  excerpt: string;
  coverImageUrl: string;
  body: string; // HTML / texto
  categories: string[];
  tags: string[];
  // Paso 2
  seoTitle: string;
  metaDescription: string;
  slug: string;
  ogImage: string;
  author: string;
  publishDate: string; // ISO yyyy-mm-dd
  publish: ArticlePublishMode;
}

export const INITIAL_ARTICLE_STATE: ArticleState = {
  currentStep: 1,
  title: "",
  excerpt: "",
  coverImageUrl: "",
  body: "",
  categories: [],
  tags: [],
  seoTitle: "",
  metaDescription: "",
  slug: "",
  ogImage: "",
  author: "Sofía García",
  publishDate: new Date().toISOString().slice(0, 10),
  publish: "now",
};

// ──────────────────────────────────────────────────────────────────────────
// PROMOCIÓN
// ──────────────────────────────────────────────────────────────────────────

export type PromoType = "percent" | "fixed" | "free-night";

export type PromoCurrency = "ARS" | "USD" | "EUR";

export interface PromoChannels {
  bookingEngine: boolean;
  homepage: boolean;
  sitePopup: { enabled: boolean; popupId: string };
  topBanner: boolean;
  emailMarketing: boolean;
  socialMedia: boolean;
}

export interface PromotionState {
  currentStep: 1 | 2 | 3;
  // Paso 1 — detalle
  internalName: string;
  visibleName: string;
  promoType: PromoType;
  percentValue: number;
  fixedValue: number;
  fixedCurrency: PromoCurrency;
  freeNightsBuy: number;
  freeNightsGet: number;
  description: string;
  // Paso 2 — condiciones
  dateFrom: string;
  dateTo: string;
  noExpiry: boolean;
  minAdvanceEnabled: boolean;
  minAdvanceDays: number;
  minStayEnabled: boolean;
  minStayNights: number;
  rooms: "all" | string[];
  limitEnabled: boolean;
  maxReservations: number;
  // Paso 3 — distribución
  channels: PromoChannels;
  promoCodeEnabled: boolean;
  promoCode: string;
}

export const INITIAL_PROMO_STATE: PromotionState = {
  currentStep: 1,
  internalName: "",
  visibleName: "",
  promoType: "percent",
  percentValue: 15,
  fixedValue: 0,
  fixedCurrency: "ARS",
  freeNightsBuy: 2,
  freeNightsGet: 1,
  description: "",
  dateFrom: "",
  dateTo: "",
  noExpiry: false,
  minAdvanceEnabled: false,
  minAdvanceDays: 7,
  minStayEnabled: false,
  minStayNights: 2,
  rooms: "all",
  limitEnabled: false,
  maxReservations: 100,
  channels: {
    bookingEngine: true,
    homepage: true,
    sitePopup: { enabled: false, popupId: "" },
    topBanner: false,
    emailMarketing: false,
    socialMedia: false,
  },
  promoCodeEnabled: false,
  promoCode: "",
};
