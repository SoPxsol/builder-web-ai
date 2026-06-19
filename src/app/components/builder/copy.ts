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
   * Panel de estructura de la página (árbol de módulos).
   * Todo el copy de filas, acciones por fila, distintivos y anuncios de
   * accesibilidad del reordenamiento vive acá — nada inline en el componente.
   */
  tree: {
    /** Título del panel de estructura. */
    panelTitle: "Estructura de la página",
    /** Contador de secciones. n = cantidad. */
    sectionCount: (n: number) => `${n} ${n === 1 ? "sección" : "secciones"}`,
    /** Placeholder cuando el alias está vacío. */
    aliasPlaceholder: "Sin nombre",
    /** Subtítulo de filas según origen. */
    subtitleAi: "Generada con IA",
    subtitleGlobal: "Sección global",
    /** Sufijo del subtítulo de secciones manuales ("Hero · Custom"). */
    subtitleCustomSuffix: "Custom",
    /** Distintivos de origen. */
    pillAi: "IA",
    pillGlobal: "Global",
    /** aria-label del handle de arrastre. */
    dragHandleLabel: "Arrastrar para reordenar",
    /** aria-label del icon-button de acciones de la fila. */
    rowActionsLabel: "Acciones de la sección",
    /** aria-label del menú desplegado de acciones. */
    rowActionsMenuLabel: "Acciones de la sección",
    /** Acciones por fila. */
    actions: {
      edit: "Editar",
      rename: "Renombrar",
      duplicate: "Duplicar",
      hide: "Ocultar",
      show: "Mostrar",
      delete: "Eliminar",
    },
    /** Tooltip del estado oculto en la fila. */
    hiddenHint: "Sección oculta",
    /** Edición inline del alias. */
    rename: {
      inputLabel: "Nuevo nombre de la sección",
      placeholder: "Nombre de la sección",
    },
    /** Confirmación destructiva al eliminar una sección. */
    deleteConfirm: {
      title: "¿Eliminar esta sección?",
      description: "Se quita de la página. Podés volver a agregarla desde el catálogo.",
      cancel: "Cancelar",
      confirm: "Eliminar",
    },
    /**
     * Anuncios de la live region para el reordenamiento por teclado.
     * Mantener cortos: los lee el lector de pantalla en cada movimiento.
     */
    announce: {
      grabbed: (alias: string, pos: number, total: number) =>
        `${alias} tomada, posición ${pos} de ${total}. Usá las flechas para mover, Enter para soltar, Escape para cancelar.`,
      moved: (alias: string, pos: number, total: number) =>
        `${alias} movida a la posición ${pos} de ${total}.`,
      dropped: (alias: string, pos: number, total: number) =>
        `${alias} soltada en la posición ${pos} de ${total}.`,
      cancelled: (alias: string) => `Movimiento de ${alias} cancelado.`,
    },
  },

  /**
   * Panel de edición de un módulo — vive a la izquierda y reemplaza al panel
   * de estructura mientras se edita (se vuelve con "Estructura"). Agrupa la
   * configuración del módulo en pestañas; "Contenido" arranca activa por
   * default porque es lo que el hotelero edita más seguido.
   */
  edit: {
    /** Acción para volver al panel de estructura. */
    back: "Estructura",
    backAria: "Volver a la estructura de la página",
    /** aria-label del título del panel. */
    panelAria: "Editar la sección",
    tabs: {
      content: "Contenido",
      section: "Sección",
    },
    /** Empty state de la pestaña Contenido. */
    contentEmpty: "Esta sección no tiene campos de contenido editables.",
    /** Label del valor de cada campo cuando el nombre técnico no alcanza. */
    valueLabel: "Valor",
    /** Campos de la pestaña Sección. */
    section: {
      aliasLabel: "Nombre de la sección",
      aliasPlaceholder: "Sin nombre",
      visibilityLabel: "Visibilidad",
      visible: "Visible",
      hidden: "Oculta",
      typeLabel: "Tipo",
      originLabel: "Origen",
      advancedLabel: "Configuración avanzada",
    },
    /** Etiquetas legibles del origen, para el campo read-only de la pestaña Sección. */
    originLabels: {
      manual: "Manual",
      ai: "Generada con IA",
      global: "Global",
    },
  },

  /**
   * Panel de configuración del header — reemplaza al panel de estructura
   * cuando el tab activo es "header". Organizado en secciones colapsadas
   * visualmente por SectionLabel uppercase.
   *
   * Convención de este bloque:
   *   - `sections.*`  → encabezados de sección (uppercase en pantalla).
   *   - campos sueltos → label del field o SegBtn.
   *   - `list.*`      → controles de listas ordenables (mover/eliminar).
   */
  headerConfig: {
    panelAria: "Configuración del header",
    title: "Header",

    /** Etiquetas de sección (se muestran en uppercase por SectionLabel). */
    sections: {
      logo: "Logotipo",
      layout: "Disposición",
      utilityBar: "Barra utilitaria",
      mainBar: "Barra principal",
      bottomBar: "Barra inferior (mobile)",
      drawerSections: "Menú de navegación",
      drawerUtility: "Acciones del menú",
      languages: "Idiomas",
      currencies: "Monedas",
    },

    /** Etiquetas genéricas reutilizadas en varios SegBtns. */
    visible: "Visible",
    hidden: "Oculta",
    yes: "Sí",
    no: "No",
    enabled: "Activo",

    /** Logo. */
    logo: {
      type: "Tipo de logo",
      typeImage: "Imagen",
      typeText: "Texto",
      imageUrl: "URL de la imagen",
      imageAlt: "Texto alternativo",
      imageAltPlaceholder: "Logo del hotel",
      textFallback: "Texto de respaldo",
      textFallbackPlaceholder: "Nombre del hotel",
    },

    /** Disposición. */
    layout: {
      mobile: "Distribución mobile",
      mobileTop: "Superior",
      mobileBoth: "Ambas",
      mobileBottom: "Inferior",
      desktop: "Distribución escritorio",
      desktopSingle: "Una fila",
      desktopTwo: "Dos filas",
    },

    /** Barra utilitaria. */
    utilityBar: {
      visible: "Visibilidad",
      leftSlot: "Acción izquierda",
      rightSlot: "Acción derecha",
    },

    /** Barra principal. */
    mainBar: {
      sticky: "Barra fija al scroll",
      showBookingButton: "Botón de reserva",
      bookingButtonLabel: "Texto del botón",
      bookingButtonLabelPlaceholder: "Reservar",
    },

    /** Barra inferior (mobile). */
    bottomBar: {
      visible: "Visibilidad",
      backdropBlur: "Desenfoque de fondo",
      slots: "Acciones",
      addSlot: "Agregar acción",
      maxSlotsHint: "Máximo 4 acciones en la barra inferior.",
      minSlotsHint: "Mínimo 2 acciones requeridas.",
    },

    /** Drawer — menú de navegación. */
    drawer: {
      addSection: "Agregar sección",
      sectionLabel: "Nombre",
      sectionLabelPlaceholder: "Habitaciones",
      sectionHref: "Enlace",
      sectionVisible: "Visibilidad",
    },

    /** Utilidad del drawer. */
    drawerUtility: {
      add: "Agregar acción",
    },

    /** Editor de UtilityAction (campos individuales). */
    action: {
      label: "Etiqueta",
      labelPlaceholder: "Ej. Check-in",
      icon: "Ícono (nombre lucide)",
      iconPlaceholder: "key-round",
      type: "Tipo de acción",
      href: "URL de destino",
      phone: "Número de WhatsApp",
    },

    /** Controles de listas ordenables. */
    list: {
      moveUp: "Mover arriba",
      moveDown: "Mover abajo",
      remove: "Eliminar",
    },

    /**
     * Preview del drawer abierto en el canvas (mobile).
     * El drawer es solo visual (mock); no navega ni cierra la página.
     */
    drawerPreview: {
      /** aria-label del botón hamburguesa cuando el drawer está cerrado. */
      openMenuAriaLabel: "Abrir menú de navegación",
      /** aria-label del botón cerrar (X) dentro del drawer. */
      closeMenuAriaLabel: "Cerrar menú de navegación",
      /** Encabezado de la sección de idiomas dentro del drawer. */
      languagesTitle: "Idioma",
      /** Encabezado de la sección de monedas dentro del drawer. */
      currenciesTitle: "Moneda",
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
