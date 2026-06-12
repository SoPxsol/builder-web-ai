/**
 * sectionMeta — derivación de la identidad legible de una sección del árbol.
 *
 * Centraliza tres cosas que consumen tanto el panel de estructura (ModuleTree)
 * como el canvas (Canvas):
 *   - el ícono por tipo de sección,
 *   - el alias mostrado (editable → derivado del contenido → typeLabel),
 *   - el subtítulo (tipo · origen).
 *
 * Regla del brief: una fila NUNCA arranca como "Custom component" genérico.
 * El alias se deriva del primer heading/título del contenido; si no hay
 * contenido aún, cae al `typeLabel` legible, jamás al `name` técnico.
 */

import {
  Columns3,
  Component,
  Image,
  Images,
  Layout,
  LayoutGrid,
  Mail,
  Quote,
  Sparkles,
  Type as TypeIcon,
  type LucideIcon,
} from "lucide-react";
import type { BuilderModule } from "../../types/builder";
import { BUILDER_COPY } from "./copy";

/* ─── Íconos por tipo de sección ──────────────────────────────────────────
 * Clave = `module.icon` (nombre lógico). Fallback a `Component` (genérico).
 * Espejo del ICON_MAP del AddModulePicker; se mantiene acá para que el árbol
 * y el canvas no dependan del picker. */
export const SECTION_ICONS: Record<string, LucideIcon> = {
  layout: Layout,
  "layout-grid": LayoutGrid,
  images: Images,
  image: Image,
  columns: Columns3,
  type: TypeIcon,
  quote: Quote,
  mail: Mail,
  sparkles: Sparkles,
  component: Component,
};

export function sectionIcon(module: BuilderModule): LucideIcon {
  return SECTION_ICONS[module.icon ?? ""] ?? Component;
}

/**
 * Nombres de propiedad que, si tienen valor, sirven como heading del que
 * derivar el alias. En orden de prioridad.
 */
const HEADING_PROP_NAMES = [
  "titulo",
  "title",
  "headline",
  "headline1",
  "kicker",
  "name",
  "nombre",
];

/**
 * Deriva el alias a mostrar de una sección, en orden:
 *   1. alias editado por el usuario,
 *   2. primer heading con valor en propertyValues,
 *   3. typeLabel legible ("Hero", "Galería"),
 *   4. cadena vacía → el caller muestra el placeholder "Sin nombre".
 */
export function deriveAlias(
  module: BuilderModule,
  propertyValues: Record<string, string>,
): string {
  if (module.alias && module.alias.trim()) return module.alias.trim();

  for (const propName of HEADING_PROP_NAMES) {
    const value = propertyValues[`${module.id}::${propName}`];
    if (value && value.trim()) return value.trim();
  }

  return module.typeLabel?.trim() ?? "";
}

/** Igual que deriveAlias pero garantiza un texto visible (placeholder si vacío). */
export function displayAlias(
  module: BuilderModule,
  propertyValues: Record<string, string>,
): string {
  return deriveAlias(module, propertyValues) || BUILDER_COPY.tree.aliasPlaceholder;
}

/**
 * Subtítulo muted de la fila:
 *   - ai     → "Generada con IA"
 *   - global → "Sección global"
 *   - manual → "{typeLabel} · Custom" (o sólo typeLabel si no hay)
 */
export function sectionSubtitle(module: BuilderModule): string {
  const { subtitleAi, subtitleGlobal, subtitleCustomSuffix } = BUILDER_COPY.tree;
  if (module.origin === "ai") return subtitleAi;
  if (module.origin === "global") return subtitleGlobal;
  const type = module.typeLabel?.trim();
  if (!type) return subtitleCustomSuffix;
  return `${type} · ${subtitleCustomSuffix}`;
}
