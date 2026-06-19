/**
 * draftStore — capa de persistencia de drafts y versiones publicadas del editor.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * IMPORTANTE: ESTA ES UNA CAPA PENDIENTE DE BACKEND.
 * ──────────────────────────────────────────────────────────────────────────
 *
 * Hoy persistimos en `window.localStorage` para que el flujo funcione
 * end-to-end y el hotelero NO pierda cambios al navegar/recargar/cerrar.
 * Esto es un stand-in, NO la solución productiva. Limitaciones reales:
 *   - Por dispositivo (no sincroniza entre pestañas distintas del navegador
 *     en sesiones distintas, ni entre devices del mismo usuario).
 *   - Sin auditoría de quién publicó qué cuándo.
 *   - Sin resolución de conflictos si dos personas editan a la vez.
 *   - Si el usuario borra el storage del navegador, el draft se pierde.
 *
 * Lo que necesitamos del backend (handoff al equipo de plataforma):
 *
 *   - PUT  /sites/:siteId/entities/:entityType/draft
 *       Body: serialized entity tree + props.
 *       Idempotente. Sobrescribe el draft anterior. Devuelve `updatedAt`.
 *
 *   - GET  /sites/:siteId/entities/:entityType/draft
 *       Devuelve el draft actual o 404 si no hay.
 *
 *   - POST /sites/:siteId/entities/:entityType/publish
 *       Promueve el draft actual a versión publicada. Crea entrada en
 *       el historial de versiones (que ya tenemos en la UI: "Versiones").
 *       Devuelve la versión publicada con `publishedAt`.
 *
 *   - GET  /sites/:siteId/entities/:entityType/published
 *       Devuelve la versión publicada vigente.
 *
 *   - GET  /sites/:siteId/entities/status
 *       Devuelve para todas las entidades del sitio:
 *         { page: "draft" | "published-clean" | "published-dirty", ... }
 *       Donde "published-dirty" = hay draft posterior a la última publicación.
 *
 * Cuando exista el backend, reemplazar las funciones internas
 * `readFromStorage` / `writeToStorage` por fetch a esos endpoints y mantener
 * la misma API pública (save/load/clear/getStatus) para no tocar componentes.
 */

import type { BuilderModule, BuilderTab, NavConfig } from "../../types/builder";

/** Identificador de la entidad del editor. Coincide con los tabs Header/Página/Footer. */
export type EntityType = BuilderTab;

/** Snapshot serializable de una entidad editable. */
export interface EntityDraft {
  tree: BuilderModule[];
  /** Values editados, key `${moduleId}::${propertyName}`. */
  propertyValues: Record<string, string>;
  /** Timestamp ISO del último save. */
  updatedAt: string;
  /**
   * Configuración tipada del header/navegación (WEB-686).
   * Opcional para mantener compatibilidad con drafts previos serializados
   * en localStorage que no incluían este campo. El consumidor (HeaderConfigPanel)
   * es quien aplica DEFAULT_NAV_CONFIG cuando este campo llega como `undefined`.
   */
  navConfig?: NavConfig;
}

/** Estado publicado de una entidad. */
export interface EntityPublished {
  tree: BuilderModule[];
  propertyValues: Record<string, string>;
  publishedAt: string;
  /**
   * Configuración tipada del header/navegación (WEB-686).
   * Opcional para mantener compatibilidad con versiones publicadas previas
   * serializadas en localStorage sin este campo.
   */
  navConfig?: NavConfig;
}

/** Estado relativo de una entidad respecto a su versión publicada. */
export type EntityPublishStatus = "draft" | "published-clean" | "published-dirty";

/* ─── Claves de storage ─────────────────────────────────────────────────── */

const STORAGE_PREFIX = "pxsol.builder";

function draftKey(siteId: string | number, entity: EntityType): string {
  return `${STORAGE_PREFIX}.draft.${siteId}.${entity}`;
}

function publishedKey(siteId: string | number, entity: EntityType): string {
  return `${STORAGE_PREFIX}.published.${siteId}.${entity}`;
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function readFromStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeToStorage(key: string, value: unknown): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Quota lleno, privacy mode, etc. → autosave debe mostrar error.
    return false;
  }
}

/* ─── API pública ───────────────────────────────────────────────────────── */

/**
 * Guarda el draft de una entidad. Devuelve `false` si el storage falló
 * (importante para que el autosave muestre estado de error en lugar de
 * silenciar el problema).
 */
export function saveDraft(
  siteId: string | number,
  entity: EntityType,
  draft: Omit<EntityDraft, "updatedAt">,
): { ok: boolean; updatedAt: string } {
  const updatedAt = new Date().toISOString();
  const ok = writeToStorage(draftKey(siteId, entity), { ...draft, updatedAt });
  return { ok, updatedAt };
}

/** Carga el draft de una entidad. `null` si nunca se guardó. */
export function loadDraft(siteId: string | number, entity: EntityType): EntityDraft | null {
  return readFromStorage<EntityDraft>(draftKey(siteId, entity));
}

/** Borra el draft (típicamente tras publicar). */
export function clearDraft(siteId: string | number, entity: EntityType): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(draftKey(siteId, entity));
  } catch {
    /* noop */
  }
}

/**
 * Publica el draft actual: lo copia a la entrada de "publicado" y limpia el
 * draft (porque la próxima edición arrancará desde lo publicado).
 *
 * Devuelve la versión publicada para que el caller pueda actualizar UI.
 */
export function publishDraft(
  siteId: string | number,
  entity: EntityType,
  draft: Omit<EntityDraft, "updatedAt">,
): { ok: boolean; published: EntityPublished } {
  const publishedAt = new Date().toISOString();
  const published: EntityPublished = {
    tree: draft.tree,
    propertyValues: draft.propertyValues,
    publishedAt,
    // Propaga navConfig si el draft lo trae; si no, queda undefined (retrocompat).
    navConfig: draft.navConfig,
  };
  const ok = writeToStorage(publishedKey(siteId, entity), published);
  if (ok) clearDraft(siteId, entity);
  return { ok, published };
}

/** Carga la versión publicada (si existe). */
export function loadPublished(
  siteId: string | number,
  entity: EntityType,
): EntityPublished | null {
  return readFromStorage<EntityPublished>(publishedKey(siteId, entity));
}

/**
 * Devuelve el estado relativo de una entidad:
 *   - "draft":              nunca publicada, hay draft (o no hay nada)
 *   - "published-clean":    publicada y sin cambios pendientes
 *   - "published-dirty":    publicada pero hay un draft posterior
 *
 * Para "draft" no distinguimos si hay draft o no — la UI lo trata igual
 * en el chip ("Borrador" cubre los dos casos).
 */
export function getPublishStatus(
  siteId: string | number,
  entity: EntityType,
): EntityPublishStatus {
  const draft = loadDraft(siteId, entity);
  const published = loadPublished(siteId, entity);
  if (!published) return "draft";
  if (!draft) return "published-clean";
  // Si hay draft posterior a la última publicación → dirty.
  return draft.updatedAt > published.publishedAt ? "published-dirty" : "published-clean";
}
