export type View =
  | "dashboard"
  | "mis-sitios"
  | "templates"
  | "interno"
  | "onboarding"
  | "config-hub"
  | "post-onboarding"
  // site-context views
  | "paginas"
  | "editor"
  | "info-sitio"
  | "seo"
  | "ai"
  | "discovery"
  | "datos-basicos"
  | "versiones"
  | "blog"
  | "popups"
  | "promociones"
  | "idioma"
  | "multilenguaje"
  | "propiedades"
  | "integraciones"
  | "redes"
  | "google-business"
  | "otas"
  | "email";

export interface Site {
  id: number;
  name: string;
  domain: string;
  stats: string;
  status: "active" | "pending";
  action: string;
  thumbLeft: string;
  thumbRight: string;
  watermark: string;
  pages?: number;
  language?: string;
  /** Si el sitio está pending, indica el paso del W1 donde quedó (1–5). */
  wizardStep?: 1 | 2 | 3 | 4 | 5;
}
