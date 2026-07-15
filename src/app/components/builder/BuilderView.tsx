import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { BuilderModule, BuilderTab, NavConfig, ViewportMode } from "../../types/builder";
import { COMPONENT_LIBRARY, DEFAULT_NAV_CONFIG, INITIAL_TREE } from "../../types/builder";
import { BuilderToolbar, type EditorLanguage } from "./BuilderToolbar";
import { ModuleTree } from "./ModuleTree";
import { Canvas } from "./Canvas";
import { ComponentsPanel } from "./ComponentsPanel";
import { AiAssistantPanel } from "./AiAssistantPanel";
import { ModuleEditPanel, type EditTab } from "./ModuleEditPanel";
import { HeaderConfigPanel } from "./HeaderConfigPanel";
import { AddModulePicker } from "./AddModulePicker";
import {
  getPublishStatus,
  loadDraft,
  loadPublished,
  publishDraft,
  saveDraft,
  type EntityPublishStatus,
} from "./draftStore";
import { useAutosave, type AutosaveStatus } from "./useAutosave";
import { ExitConfirmDialog } from "../creation/shared/ExitConfirmDialog";
import { ConfirmDestructiveDialog } from "../ui/confirm-destructive-dialog";
import { BUILDER_COPY } from "./copy";
import { deriveAlias } from "./sectionMeta";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Site del que se está editando una entidad. Necesario para namespacear
   * los drafts en el draftStore. Default `"demo"` mientras no hay backend.
   */
  siteId?: string | number;
}

const PAGE_TITLES: Record<BuilderTab, string> = {
  header: "Global header",
  page: "Inicio",
  footer: "Global footer",
};

const VIEWPORT_TO_WIDTH: Record<ViewportMode, number> = {
  desktop: 1268,
  tablet: 820,
  mobile: 390,
};

/** Snapshot editable de una entidad — lo que vive en el state local. */
interface EntitySlice {
  tree: BuilderModule[];
  propertyValues: Record<string, string>;
  /** Solo el tab "header" usa este campo; page y footer lo ignoran. */
  navConfig?: NavConfig;
}

const EMPTY_SLICE: EntitySlice = { tree: [], propertyValues: {} };

import { FOCUSABLE_SELECTOR } from "../../utils/focus";

export function BuilderView({ isOpen, onClose, siteId = "demo" }: Props) {
  /* ─── State per entidad (tree + propertyValues) ──────────────────────── */
  // Una sola estructura con las 3 entidades. Cada slice persiste en
  // draftStore por su cuenta vía useAutosave.
  const [entities, setEntities] = useState<Record<BuilderTab, EntitySlice>>({
    page:   { tree: INITIAL_TREE, propertyValues: {} },
    header: { tree: [], propertyValues: {}, navConfig: DEFAULT_NAV_CONFIG },
    footer: { tree: [], propertyValues: {} },
  });

  /* ─── Estado UI ephemeral (se resetea al cerrar — no se persiste) ────── */
  const [activeTab, setActiveTab] = useState<BuilderTab>("page");
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(
    INITIAL_TREE[0]?.id ?? null,
  );
  const [selectedPropertyName, setSelectedPropertyName] = useState<string | null>(null);
  /** Módulo cuyo panel de edición (Contenido/Sección) está abierto a la izquierda. */
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editTab, setEditTab] = useState<EditTab>("content");
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [canvasWidth, setCanvasWidth] = useState<number>(VIEWPORT_TO_WIDTH.desktop);
  const [componentsOpen, setComponentsOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [language, setLanguage] = useState<EditorLanguage>("es");

  /* ─── Publish state per entidad ──────────────────────────────────────── */
  // Recalculado tras cada save/publish vía recomputePublishStatus.
  const [publishStatus, setPublishStatus] = useState<Record<BuilderTab, EntityPublishStatus>>({
    page: "draft",
    header: "draft",
    footer: "draft",
  });

  /* ─── Confirm dialog para publish de header/footer ───────────────────── */
  const [publishConfirmEntity, setPublishConfirmEntity] = useState<BuilderTab | null>(null);

  /* ─── Confirm dialog para eliminar una sección ───────────────────────── */
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const hasHydratedRef = useRef(false);

  /* ─── Hidratación inicial desde draftStore ───────────────────────────── */
  // Solo al primer render dentro de cada sesión de "abrir editor".
  // Cargamos draft > published > INITIAL_TREE como fallback.
  useEffect(() => {
    if (!isOpen) return;
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;

    const tabs: BuilderTab[] = ["page", "header", "footer"];
    const hydrated: Record<BuilderTab, EntitySlice> = { ...entities };

    for (const t of tabs) {
      const draft = loadDraft(siteId, t);
      const published = loadPublished(siteId, t);
      if (draft) {
        hydrated[t] = {
          tree: draft.tree,
          propertyValues: draft.propertyValues,
          // Para header: preservar navConfig tipado; draft viejo sin él cae al default.
          ...(t === "header" ? { navConfig: draft.navConfig ?? DEFAULT_NAV_CONFIG } : {}),
        };
      } else if (published) {
        hydrated[t] = {
          tree: published.tree,
          propertyValues: published.propertyValues,
          // Para header: igual que con draft.
          ...(t === "header" ? { navConfig: published.navConfig ?? DEFAULT_NAV_CONFIG } : {}),
        };
      }
      // Si no hay draft ni published, dejamos el slice inicial (INITIAL_TREE
      // para "page", vacío para header/footer, DEFAULT_NAV_CONFIG para header.navConfig).
    }
    setEntities(hydrated);
    setPublishStatus({
      page: getPublishStatus(siteId, "page"),
      header: getPublishStatus(siteId, "header"),
      footer: getPublishStatus(siteId, "footer"),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, siteId]);

  /* ─── Autosave por entidad ───────────────────────────────────────────── */
  // Una instancia del hook por slot. Cada una persiste en su propia key
  // del draftStore y reporta su status. Mostramos el status de la entidad
  // activa en la toolbar.
  const savePageDraft = useCallback(
    (slice: EntitySlice) => saveDraft(siteId, "page", slice),
    [siteId],
  );
  const saveHeaderDraft = useCallback(
    (slice: EntitySlice) => saveDraft(siteId, "header", slice),
    [siteId],
  );
  const saveFooterDraft = useCallback(
    (slice: EntitySlice) => saveDraft(siteId, "footer", slice),
    [siteId],
  );

  const pageAutosave = useAutosave({
    value: entities.page,
    save: savePageDraft,
    enabled: isOpen && hasHydratedRef.current,
  });
  const headerAutosave = useAutosave({
    value: entities.header,
    save: saveHeaderDraft,
    enabled: isOpen && hasHydratedRef.current,
  });
  const footerAutosave = useAutosave({
    value: entities.footer,
    save: saveFooterDraft,
    enabled: isOpen && hasHydratedRef.current,
  });

  // Cuando termina un save, recomputamos publishStatus para que el chip
  // "Cambios sin publicar" se actualice.
  useEffect(() => {
    if (pageAutosave.status.kind === "saved") {
      setPublishStatus((prev) => ({ ...prev, page: getPublishStatus(siteId, "page") }));
    }
  }, [pageAutosave.status, siteId]);
  useEffect(() => {
    if (headerAutosave.status.kind === "saved") {
      setPublishStatus((prev) => ({ ...prev, header: getPublishStatus(siteId, "header") }));
    }
  }, [headerAutosave.status, siteId]);
  useEffect(() => {
    if (footerAutosave.status.kind === "saved") {
      setPublishStatus((prev) => ({ ...prev, footer: getPublishStatus(siteId, "footer") }));
    }
  }, [footerAutosave.status, siteId]);

  const activeAutosaveStatus: AutosaveStatus = useMemo(() => {
    if (activeTab === "page") return pageAutosave.status;
    if (activeTab === "header") return headerAutosave.status;
    return footerAutosave.status;
  }, [activeTab, pageAutosave.status, headerAutosave.status, footerAutosave.status]);

  const activeAutosaveRetry = useCallback(() => {
    if (activeTab === "page") pageAutosave.flush();
    else if (activeTab === "header") headerAutosave.flush();
    else footerAutosave.flush();
  }, [activeTab, pageAutosave, headerAutosave, footerAutosave]);

  /* ─── Reset SOLO de estado ephemeral al cerrar ───────────────────────── */
  // Importante: NO reseteamos `entities` ni `publishStatus`. Esos viven
  // ligados al draftStore. Reabrir el editor → ver lo último editado.
  useEffect(() => {
    if (!isOpen) {
      setActiveTab("page");
      setSelectedModuleId(null);
      setSelectedPropertyName(null);
      setEditingModuleId(null);
      setEditTab("content");
      setViewport("desktop");
      setCanvasWidth(VIEWPORT_TO_WIDTH.desktop);
      setComponentsOpen(false);
      setAiOpen(false);
      setPreviewMode(false);
      setLanguage("es");
      // Reset bandera de hidratación: la próxima apertura vuelve a leer
      // del draftStore (por si cambió desde otra pestaña/sesión).
      hasHydratedRef.current = false;
    }
  }, [isOpen]);

  /* ─── Body scroll lock + focus management + ESC + focus trap ─────────── */
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = (document.activeElement as HTMLElement) ?? null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const modal = modalRef.current;
    if (modal) {
      const first = modal.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      first?.focus();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && modal) {
        const focusables = Array.from(
          modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        ).filter((el) => el.offsetParent !== null);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const current = document.activeElement;
        if (e.shiftKey && current === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && current === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocusedRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  /* ─── Derivados de la entidad activa ─────────────────────────────────── */
  const activeSlice = entities[activeTab];
  const activeTree = activeSlice.tree;
  const activePropertyValues = activeSlice.propertyValues;
  // Módulo en edición (si el id sigue existiendo en la entidad activa). El
  // lookup acá hace que cambiar de tab o eliminar la sección cierre el panel
  // de edición automáticamente, sin efectos extra.
  const editingModule = editingModuleId
    ? activeTree.find((m) => m.id === editingModuleId) ?? null
    : null;

  /* ─── Helpers para mutar la entidad activa ───────────────────────────── */
  function updateActiveSlice(updater: (slice: EntitySlice) => EntitySlice) {
    setEntities((prev) => ({ ...prev, [activeTab]: updater(prev[activeTab]) }));
  }

  /** Actualiza el navConfig del header (solo se llama desde HeaderConfigPanel). */
  function handleNavConfigChange(next: NavConfig) {
    updateActiveSlice((slice) => ({ ...slice, navConfig: next }));
  }

  function handleSelectModule(id: string) {
    setSelectedModuleId(id);
    setSelectedPropertyName(null);
  }

  function handleSelectProperty(moduleId: string, propertyName: string) {
    // Click en una propiedad del árbol → abrir el panel de edición a la
    // izquierda en la pestaña que corresponde (las props `__` son de Sección).
    setSelectedModuleId(moduleId);
    setSelectedPropertyName(propertyName);
    setEditingModuleId(moduleId);
    setEditTab(propertyName.startsWith("__") ? "section" : "content");
  }

  /** Abre el panel de edición de un módulo (default pestaña Contenido). */
  function handleEditModule(id: string) {
    setSelectedModuleId(id);
    setSelectedPropertyName(null);
    setEditingModuleId(id);
    setEditTab("content");
  }

  /** Vuelve del panel de edición al panel de estructura. */
  function handleCloseEdit() {
    setEditingModuleId(null);
    setSelectedPropertyName(null);
  }

  /** Edición en vivo de una propiedad desde el panel de edición. */
  function handleChangeProperty(moduleId: string, propertyName: string, value: string) {
    const key = `${moduleId}::${propertyName}`;
    updateActiveSlice((slice) => ({
      ...slice,
      propertyValues: { ...slice.propertyValues, [key]: value },
    }));
  }

  function handleToggleExpand(id: string) {
    updateActiveSlice((slice) => ({
      ...slice,
      tree: slice.tree.map((m) => (m.id === id ? { ...m, expanded: !m.expanded } : m)),
    }));
  }

  /**
   * Motor único de reordenamiento. Mueve la sección `fromId` a la posición
   * final `toIndex` (0-based en el array resultante). Lo invocan las dos
   * superficies de arrastre (panel y canvas) y el reordenamiento por teclado.
   * El cambio muta `tree` → dispara el autosave del borrador.
   */
  function handleReorderModule(fromId: string, toIndex: number) {
    updateActiveSlice((slice) => {
      const fromIdx = slice.tree.findIndex((m) => m.id === fromId);
      if (fromIdx < 0) return slice;
      const nextTree = [...slice.tree];
      const [moved] = nextTree.splice(fromIdx, 1);
      const clamped = Math.max(0, Math.min(toIndex, nextTree.length));
      if (clamped === fromIdx) return slice;
      nextTree.splice(clamped, 0, moved);
      return { ...slice, tree: nextTree };
    });
  }

  function makePaletteModule(componentId: string): BuilderModule | null {
    const def = COMPONENT_LIBRARY.find((c) => c.id === componentId);
    if (!def) return null;
    return {
      id: `${def.id}-${Date.now()}`,
      name: def.name.replace(/\s+/g, ""),
      alias: def.name,
      typeLabel: def.name,
      origin: "manual",
      icon: def.icon,
      expanded: false,
      properties: [
        { name: "titulo", type: "STRING" },
        { name: "texto", type: "OBJECT" },
        { name: "imagen", type: "OBJECT" },
      ],
    };
  }

  /** Inserta un módulo en `atIndex` (o al final si no se especifica). */
  function insertModule(newModule: BuilderModule, atIndex?: number) {
    updateActiveSlice((slice) => {
      const nextTree = [...slice.tree];
      const idx = atIndex == null ? nextTree.length : Math.max(0, Math.min(atIndex, nextTree.length));
      nextTree.splice(idx, 0, newModule);
      return { ...slice, tree: nextTree };
    });
    setSelectedModuleId(newModule.id);
    setSelectedPropertyName(null);
  }

  function handleAddFromPalette(componentId: string, atIndex?: number) {
    const newModule = makePaletteModule(componentId);
    if (!newModule) return;
    insertModule(newModule, atIndex);
  }

  function handleRenameModule(id: string, alias: string) {
    updateActiveSlice((slice) => ({
      ...slice,
      tree: slice.tree.map((m) => (m.id === id ? { ...m, alias } : m)),
    }));
  }

  function handleToggleHidden(id: string) {
    updateActiveSlice((slice) => ({
      ...slice,
      tree: slice.tree.map((m) => (m.id === id ? { ...m, hidden: !m.hidden } : m)),
    }));
  }

  function handleDuplicateModule(id: string) {
    const slice = entities[activeTab];
    const idx = slice.tree.findIndex((m) => m.id === id);
    if (idx < 0) return;
    const source = slice.tree[idx];
    const newId = `${source.id}-copy-${Date.now()}`;
    const baseAlias = deriveAlias(source, slice.propertyValues);
    const clone: BuilderModule = {
      ...source,
      id: newId,
      alias: baseAlias ? `${baseAlias} (copia)` : undefined,
    };
    // Clonar también los values editados de las props de la sección origen.
    const clonedValues: Record<string, string> = {};
    for (const [key, value] of Object.entries(slice.propertyValues)) {
      const prefix = `${source.id}::`;
      if (key.startsWith(prefix)) clonedValues[`${newId}::${key.slice(prefix.length)}`] = value;
    }
    updateActiveSlice((s) => {
      const nextTree = [...s.tree];
      nextTree.splice(idx + 1, 0, clone);
      return { ...s, tree: nextTree, propertyValues: { ...s.propertyValues, ...clonedValues } };
    });
    setSelectedModuleId(newId);
    setSelectedPropertyName(null);
  }

  function handleConfirmDelete() {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    updateActiveSlice((slice) => {
      // Limpiar también los values de las props de la sección eliminada.
      const prefix = `${id}::`;
      const nextValues: Record<string, string> = {};
      for (const [key, value] of Object.entries(slice.propertyValues)) {
        if (!key.startsWith(prefix)) nextValues[key] = value;
      }
      return { tree: slice.tree.filter((m) => m.id !== id), propertyValues: nextValues };
    });
    if (selectedModuleId === id) {
      setSelectedModuleId(null);
      setSelectedPropertyName(null);
    }
    if (editingModuleId === id) setEditingModuleId(null);
    setDeleteConfirmId(null);
  }

  /**
   * Genera una sección con IA e inserta como ciudadana de primera: arrastrable,
   * insertada según la selección actual (no clavada al pie).
   *
   * TODO(backend): el endpoint de generación de módulos por IA hoy NO existe
   * y, cuando exista, debe aceptar un índice/posición de inserción. Hoy el
   * cliente decide la posición (a continuación de la sección seleccionada).
   * Dependencia de plataforma: `POST /sites/:siteId/ai/sections { prompt, insertIndex }`.
   */
  function handleAiGenerate(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    const words = trimmed.split(/\s+/).slice(0, 5).join(" ");
    const alias = words.charAt(0).toUpperCase() + words.slice(1);
    const newModule: BuilderModule = {
      id: `ai-${Date.now()}`,
      name: "CustomComponent1",
      alias,
      origin: "ai",
      icon: "sparkles",
      expanded: false,
      properties: [
        { name: "kicker", type: "STRING" },
        { name: "headline", type: "STRING" },
        { name: "texto", type: "OBJECT" },
        { name: "boton", type: "OBJECT" },
      ],
    };
    const tree = entities[activeTab].tree;
    const selIdx = tree.findIndex((m) => m.id === selectedModuleId);
    const insertAt = selIdx >= 0 ? selIdx + 1 : tree.length;
    insertModule(newModule, insertAt);
  }

  function handleViewportChange(v: ViewportMode) {
    setViewport(v);
    setCanvasWidth(VIEWPORT_TO_WIDTH[v]);
  }

  /* ─── Publish handlers ───────────────────────────────────────────────── */
  function requestPublish() {
    // Header y Footer son globales → confirmamos impacto.
    if (activeTab === "header" || activeTab === "footer") {
      setPublishConfirmEntity(activeTab);
      return;
    }
    doPublish(activeTab);
  }

  function doPublish(entity: BuilderTab) {
    const slice = entities[entity];
    const { ok } = publishDraft(siteId, entity, slice);
    if (ok) {
      setPublishStatus((prev) => ({ ...prev, [entity]: getPublishStatus(siteId, entity) }));
    }
    // TODO(backend): cuando exista el endpoint real, mostrar toast de
    // éxito/error y manejar la respuesta async.
  }

  function confirmPublishGlobal() {
    if (!publishConfirmEntity) return;
    doPublish(publishConfirmEntity);
    setPublishConfirmEntity(null);
  }

  const overlay = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "var(--wizard-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Editor de página"
        className="flex flex-col"
        style={{
          width: "98vw",
          height: "98vh",
          background: "var(--surface-page)",
          borderRadius: 12,
          boxShadow: "0 12px 40px rgba(0,0,0,0.32)",
          overflow: "hidden",
          fontFamily: "var(--font-sans)",
        }}
      >
        <BuilderToolbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          viewport={viewport}
          onViewportChange={handleViewportChange}
          canvasWidth={canvasWidth}
          onCanvasWidthChange={setCanvasWidth}
          componentsOpen={componentsOpen}
          onToggleComponents={() => setComponentsOpen((v) => !v)}
          aiOpen={aiOpen}
          onToggleAi={() => setAiOpen((v) => !v)}
          onBack={onClose}
          onPublish={requestPublish}
          publishStatus={publishStatus[activeTab]}
          autosaveStatus={activeAutosaveStatus}
          onAutosaveRetry={activeAutosaveRetry}
          previewMode={previewMode}
          onTogglePreview={() => setPreviewMode((v) => !v)}
          language={language}
          onLanguageChange={setLanguage}
          onOpenPageSettings={() => console.log("Builder — abrir Configuración de la página")}
          onOpenGlobalState={() => console.log("Builder — abrir Editor de estado global")}
          onOpenFontSelector={() => console.log("Builder — abrir Selector de fuentes")}
          onCreateTemplate={() => console.log("Builder — crear nueva plantilla")}
          onOpenCode={() => console.log("Builder — abrir Editor de código")}
        />

        <div className="flex flex-1 min-h-0" style={{ position: "relative" }}>
          {/* Panel izquierdo: cuando el tab es "header", muestra el configurador
              de navegación; para page/footer, muestra el panel de edición de módulo
              (si hay uno en edición) o el árbol de estructura. */}
          {activeTab === "header" ? (
            <HeaderConfigPanel
              navConfig={entities.header.navConfig ?? DEFAULT_NAV_CONFIG}
              onChange={handleNavConfigChange}
              viewport={viewport}
              onViewportChange={handleViewportChange}
            />
          ) : editingModule ? (
            <ModuleEditPanel
              module={editingModule}
              propertyValues={activePropertyValues}
              activeTab={editTab}
              onTabChange={setEditTab}
              onChangeProperty={(propName, value) =>
                handleChangeProperty(editingModule.id, propName, value)
              }
              onRename={(alias) => handleRenameModule(editingModule.id, alias)}
              onToggleHidden={() => handleToggleHidden(editingModule.id)}
              onBack={handleCloseEdit}
            />
          ) : (
            <ModuleTree
              modules={activeTree}
              propertyValues={activePropertyValues}
              pageName={PAGE_TITLES[activeTab]}
              selectedId={selectedModuleId}
              selectedPropertyName={selectedPropertyName}
              onSelectModule={handleSelectModule}
              onSelectProperty={handleSelectProperty}
              onToggleExpand={handleToggleExpand}
              onReorderModule={handleReorderModule}
              onAddFromPalette={handleAddFromPalette}
              onEditModule={handleEditModule}
              onRenameModule={handleRenameModule}
              onToggleHidden={handleToggleHidden}
              onDuplicateModule={handleDuplicateModule}
              onRequestDeleteModule={setDeleteConfirmId}
              header={
                <AddModulePicker
                  onAddComponent={(comp) => handleAddFromPalette(comp.id)}
                  onCreateWithAi={() => {
                    // TODO(backend): endpoint de generación de módulos por IA.
                    setAiOpen(true);
                  }}
                />
              }
            />
          )}

          <Canvas
            canvasWidth={canvasWidth}
            viewport={viewport}
            activeTab={activeTab}
            pageName={PAGE_TITLES[activeTab]}
            modules={activeTree}
            propertyValues={activePropertyValues}
            selectedId={selectedModuleId}
            navConfig={entities.header.navConfig ?? DEFAULT_NAV_CONFIG}
            onSelectModule={handleSelectModule}
            onReorderModule={handleReorderModule}
            onAddFromPalette={handleAddFromPalette}
            onEditModule={handleEditModule}
            onDuplicateModule={handleDuplicateModule}
            onRequestDeleteModule={setDeleteConfirmId}
          />

          {componentsOpen && (
            <ComponentsPanel
              onClose={() => setComponentsOpen(false)}
              onSelectComponent={(comp) => {
                console.log("Builder — agregar componente", comp.id);
                setComponentsOpen(false);
              }}
            />
          )}

          {aiOpen && (
            <AiAssistantPanel
              onClose={() => setAiOpen(false)}
              onSubmit={handleAiGenerate}
            />
          )}
        </div>
      </div>

      {/* Confirm dialog para publicar header o footer (impacto global). */}
      <ExitConfirmDialog
        open={publishConfirmEntity !== null}
        title={
          publishConfirmEntity === "header"
            ? "¿Publicar el header global?"
            : "¿Publicar el footer global?"
        }
        description="Esto afecta a todas las páginas del sitio. Los visitantes verán el cambio inmediatamente."
        cancelLabel="Cancelar"
        confirmLabel={publishConfirmEntity === "header" ? "Publicar header" : "Publicar footer"}
        onCancel={() => setPublishConfirmEntity(null)}
        onConfirm={confirmPublishGlobal}
      />

      {/* Confirmación destructiva al eliminar una sección. */}
      <ConfirmDestructiveDialog
        open={deleteConfirmId !== null}
        title={BUILDER_COPY.tree.deleteConfirm.title}
        description={BUILDER_COPY.tree.deleteConfirm.description}
        cancelLabel={BUILDER_COPY.tree.deleteConfirm.cancel}
        confirmLabel={BUILDER_COPY.tree.deleteConfirm.confirm}
        onCancel={() => setDeleteConfirmId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );

  return createPortal(overlay, document.body);
}
