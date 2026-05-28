export type TemplateId = "boutique" | "resort" | "urbano";

export type UploadZoneState = "empty" | "placeholder" | "loaded";

export type PreviewBreakpoint = "desktop" | "tablet" | "mobile";

export type StepIndex = 1 | 2 | 3 | 4 | 5;

export interface WizardIdentity {
  logoState: UploadZoneState;
  photoState: UploadZoneState;
  colorPrimary: string;
  colorSecondary: string;
}

export interface WizardInfo {
  hotelName: string;
  domain: string;
  phone: string;
  email: string;
  instagram: string;
  facebook: string;
  whatsapp: string;
  importedFromOTA: boolean;
}

export interface WizardRooms {
  count: number;
  names: string[];
}

export interface WizardSummary {
  npsRating: 0 | 1 | 2 | 3 | 4 | 5;
  shared: boolean;
}

export interface WizardState {
  currentStep: StepIndex;
  selectedTemplate: TemplateId;
  identity: WizardIdentity;
  info: WizardInfo;
  rooms: WizardRooms;
  summary: WizardSummary;
}

export interface WizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (state: WizardState) => void;
  /** Trigger del botón "Ir a configuración completa" del Step 5. */
  onGoToWizard2?: (state: WizardState) => void;
  /** Si se pasa, el wizard arranca en este paso (útil para retomar sitios pending). */
  initialStep?: StepIndex;
  /** Pre-llenado parcial del state (ej: nombre del hotel cuando se retoma un setup). */
  initialState?: Partial<WizardState>;
}

export interface TemplateConfig {
  label: string;
  description: string;
  accent: string;
  dark: string;
}

export const TEMPLATES: Record<TemplateId, TemplateConfig> = {
  boutique: {
    label: "Boutique",
    description: "Clásico · tonos cálidos y madera",
    accent: "#c4923a",
    dark: "#2a1f1a",
  },
  resort: {
    label: "Resort",
    description: "Vacacional · verdes y playa",
    accent: "#1d9e75",
    dark: "#0d3349",
  },
  urbano: {
    label: "Urbano",
    description: "Moderno · alto contraste",
    accent: "#e84a2c",
    dark: "#1a1a2e",
  },
};

export const STEP_LABELS: Record<StepIndex, string> = {
  1: "Plantilla",
  2: "Identidad",
  3: "Info & contacto",
  4: "Habitaciones",
  5: "Lanzamiento",
};

export const INITIAL_WIZARD_STATE: WizardState = {
  currentStep: 1,
  selectedTemplate: "urbano",
  identity: {
    logoState: "empty",
    photoState: "placeholder",
    colorPrimary: "#e84a2c",
    colorSecondary: "#1a1a2e",
  },
  info: {
    hotelName: "",
    domain: "",
    phone: "",
    email: "",
    instagram: "",
    facebook: "",
    whatsapp: "",
    importedFromOTA: false,
  },
  rooms: {
    count: 1,
    names: [""],
  },
  summary: {
    npsRating: 0,
    shared: false,
  },
};
