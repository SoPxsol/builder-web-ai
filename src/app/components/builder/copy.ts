/**
 * Microcopy centralizado del editor de páginas.
 *
 * Convención: ningún string visible del editor debe vivir inline en componentes.
 * Si tenés que escribir un texto nuevo, sumalo acá y referencialo. Esto facilita:
 *   - revisión por el ux-writer / content-designer sin tocar componentes,
 *   - futura internacionalización (un solo punto de extracción),
 *   - búsqueda rápida del copy desde el design system.
 *
 * Mantener en español neutro / LATAM. No abreviar términos técnicos del producto.
 */

export const BUILDER_COPY = {
  /** Add Module picker — siempre visible arriba del árbol. */
  addModule: {
    /** Placeholder del input. NO usar "Buscar..." con puntos suspensivos. */
    searchPlaceholder: "Buscar módulo o componente",
    /** Aria-label del input cuando el placeholder no es suficiente. */
    searchAriaLabel: "Buscar módulo o componente para agregar",
    /** Botón secundario debajo del catálogo. */
    createWithAi: "Crear con IA",
    /** Hint que aparece bajo el catálogo cuando colapsado. */
    collapsedHint: "Tocá para ver todos los componentes",
  },

  /**
   * Labels de los botones de la toolbar del editor. Cada label se usa
   * simultáneamente como `aria-label` y `title` (tooltip). Si un botón
   * cambia de estado (ej. toggle), tiene dos labels — uno por estado.
   *
   * IA es botón directo (al lado de Componentes) porque su uso es frecuente.
   * Editor de estado global · Selector de fuentes · Crear nueva plantilla ·
   * Editor de código viven dentro de `toolsMenu` (kebab a la izquierda, junto
   * a Configuración de la página).
   */
  toolbar: {
    back: "Volver atrás",
    components: "Componentes",
    ai: "IA",
    pageSettings: "Configuración de la página",
    /** Toggle: muestra el label del modo OPUESTO (la acción que va a hacer). */
    toggleToPreview: "Vista previa",
    toggleToEdit: "Modo edición",
    /** Selector de idioma — label accesible del control. */
    languageSelector: "Seleccionar idioma de edición",
    /**
     * Publicar — el label se simplifica a:
     *   - active  (draft o published-dirty) → "Publicar"
     *   - clean   (sin cambios pendientes)   → "Publicado" (botón deshabilitado)
     *
     * La diferenciación draft vs dirty la comunica el chip de estado al lado
     * del tab activo ("Borrador" / "Cambios sin publicar" / "Publicado").
     * La acción es siempre la misma — "Publicar" — sin importar si es fresh
     * o re-publicación; eso reduce ruido en el copy del botón primario.
     */
    publish: {
      active: "Publicar",
      clean: "Publicado",
    },
    /** Chip de estado al lado del nombre de la entidad. */
    statusChip: {
      draft: "Borrador",
      published: "Publicado",
      dirty: "Cambios sin publicar",
    },
    /** Indicador del autosave a la izquierda del avatar. */
    autosave: {
      saving: "Guardando…",
      saved: "Guardado",
      error: "No se pudo guardar",
      retry: "Reintentar",
    },
  },

  /**
   * Menú de herramientas del editor — vive a la izquierda de la barra, entre
   * "Configuración de la página" y el bloque centro. Agrupa acciones que
   * son herramientas reales (no "más opciones" miscelánea) para que el bloque
   * izquierdo no se llene de íconos sueltos.
   */
  toolsMenu: {
    /** Tooltip + aria-label del icon-button trigger. */
    triggerLabel: "Herramientas del editor",
    /** Aria-label del menú desplegado. */
    menuLabel: "Herramientas del editor",
    items: {
      globalStateEditor: "Editor de estado global",
      fontSelector: "Selector de fuentes",
      createTemplate: "Crear nueva plantilla",
      code: "Editor de código",
    },
  },
} as const;
