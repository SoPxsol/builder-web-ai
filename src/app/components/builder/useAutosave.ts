import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Estado del autosave para mostrar en la UI.
 *
 *   - idle    : no hay nada que guardar (ej. al cargar la primera vez).
 *   - saving  : guardado en curso (debounce ya disparó la escritura).
 *   - saved   : guardado exitoso, `savedAt` = ISO string del último save.
 *   - error   : el último save falló (storage lleno, red, etc.). El usuario
 *               puede reintentar manualmente; el siguiente cambio también
 *               vuelve a disparar el autosave.
 */
export type AutosaveStatus =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; savedAt: string }
  | { kind: "error"; lastErrorAt: string };

interface UseAutosaveOptions<T> {
  /** Valor actual que querés persistir. Cambios disparan el debounce. */
  value: T;
  /**
   * Función que persiste. Debe devolver `{ ok }`. Si `ok=false` o la
   * promesa rechaza, el hook entra en estado `error`.
   * Tip: pasala memoizada (useCallback) para evitar disparar el debounce
   * en cada render.
   */
  save: (value: T) => Promise<{ ok: boolean; updatedAt?: string }> | { ok: boolean; updatedAt?: string };
  /**
   * Si `false`, el hook no hace nada (útil para no guardar al cargar
   * inicialmente desde el storage o cuando no hay siteId todavía).
   * Default: true.
   */
  enabled?: boolean;
  /** Milisegundos de espera antes de guardar. Default 1500. */
  debounceMs?: number;
}

interface UseAutosaveResult {
  status: AutosaveStatus;
  /** Forzar el save sin esperar al debounce (ej. botón "Reintentar"). */
  flush: () => void;
}

/**
 * Autosave con debounce + state machine para mostrar en UI.
 *
 * Reglas:
 *   - El primer render NO dispara save. Solo se persisten cambios reales
 *     posteriores al `value` inicial.
 *   - Si llegan varios cambios dentro del debounce, se guarda solo el último.
 *   - En `saving`, si llega otro cambio, queda pendiente y se vuelve a
 *     disparar al terminar.
 *   - En `error`, el siguiente cambio reintenta automáticamente.
 *   - El hook NO maneja autoretry exponencial: el usuario tiene un botón
 *     "Reintentar" en la UI que llama a `flush()`.
 */
export function useAutosave<T>({
  value,
  save,
  enabled = true,
  debounceMs = 1500,
}: UseAutosaveOptions<T>): UseAutosaveResult {
  const [status, setStatus] = useState<AutosaveStatus>({ kind: "idle" });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueRef = useRef(value);
  // Bandera para ignorar el primer render: solo persistimos cambios posteriores.
  const isFirstRunRef = useRef(true);
  const saveRef = useRef(save);

  // Mantener refs actualizadas sin disparar effects extra.
  valueRef.current = value;
  saveRef.current = save;

  const runSave = useCallback(async () => {
    setStatus({ kind: "saving" });
    try {
      const result = await Promise.resolve(saveRef.current(valueRef.current));
      if (result.ok) {
        setStatus({ kind: "saved", savedAt: result.updatedAt ?? new Date().toISOString() });
      } else {
        setStatus({ kind: "error", lastErrorAt: new Date().toISOString() });
      }
    } catch {
      setStatus({ kind: "error", lastErrorAt: new Date().toISOString() });
    }
  }, []);

  // Schedule debounced save cuando cambia `value`.
  useEffect(() => {
    if (!enabled) return;
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      void runSave();
    }, debounceMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, enabled, debounceMs, runSave]);

  // Cleanup al unmount: cancelamos timer pendiente. El último flush queda
  // a cargo del caller (por ejemplo: BuilderView puede llamar flush() en su
  // useEffect de cierre para asegurar que no se pierde el último cambio).
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    void runSave();
  }, [runSave]);

  return { status, flush };
}

/**
 * Texto relativo "hace X" para el indicador de status. Refresca solo cuando
 * lo llamás. Para que se actualice en vivo (ej. cada 10s) usá un `setInterval`
 * en el componente que renderiza el chip.
 */
export function formatSavedAgo(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  const diffSec = Math.max(0, Math.round((now.getTime() - then) / 1000));
  if (diffSec < 5) return "ahora";
  if (diffSec < 60) return `hace ${diffSec} s`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `hace ${diffHr} h`;
  const diffDay = Math.round(diffHr / 24);
  return `hace ${diffDay} d`;
}
