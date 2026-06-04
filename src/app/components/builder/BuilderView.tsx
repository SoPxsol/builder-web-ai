import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { BuilderModule, BuilderTab, ViewportMode } from "../../types/builder";
import { COMPONENT_LIBRARY, INITIAL_TREE } from "../../types/builder";
import { BuilderToolbar, type EditorLanguage } from "./BuilderToolbar";
import { ModuleTree } from "./ModuleTree";
import { Canvas } from "./Canvas";
import { ComponentsPanel } from "./ComponentsPanel";
import { AiAssistantPanel } from "./AiAssistantPanel";
import { PropertyPanel } from "./PropertyPanel";
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
}

const EMPTY_SLICE: EntitySlice = { tree: [], propertyValues: {} };

import { FOCUSABLE_SELECTOR } from "../../utils/focus";

export function BuilderView({ isOpen, onClose, siteId = "demo" }: Props) {
  /* ─── State per entidad (tree + propertyValues) ──────────────────────── */
  // Una sola estructura con las 3 entidades. Cada slice persiste en
  // draftStore por su cuenta vía useAutosave.
  const [entities, setEntities] = useState<Record<BuilderTab, EntitySlice>>({
    page:   { tree: INITIAL_TREE, propertyValues: {} },
    header: { tree: [], propertyValues: {} },
    footer: { tree: [], propertyValues: {} },
  });

  /* ─── Estado UI ephemeral (se resetea al cerrar — no se persiste) ────── */
  const [activeTab, setActiveTab] = useState<BuilderTab>("page");
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(
    INITIAL_TREE[0]?.id ?? null,
  );
  const [selectedPropertyName, setSelectedPropertyName] = useState<string | null>(null);
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
        hydrated[t] = { tree: draft.tree, propertyValues: draft.propertyValues };
      } else if (published) {
        hydrated[t] = { tree: published.tree, propertyValues: published.propertyValues };
      }
      // Si no hay draft ni published, dejamos el slice inicial (INITIAL_TREE
      // para "page", vacío para header/footer).
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

  /* ─── Helpers para mutar la entidad activa ───────────────────────────── */
  function updateActiveSlice(updater: (slice: EntitySlice) => EntitySlice) {
    setEntities((prev) => ({ ...prev, [activeTab]: updater(prev[activeTab]) }));
  }

  function handleSelectModule(id: string) {
    setSelectedModuleId(id);
    setSelectedPropertyName(null);
  }

  function handleSelectProperty(moduleId: string, propertyName: string) {
    setSelectedModuleId(moduleId);
    setSelectedPropertyName(propertyName);
  }

  function handleToggleExpand(id: string) {
    updateActiveSlice((slice) => ({
      ...slice,
      tree: slice.tree.map((m) => (m.id === id ? { ...m, expanded: !m.expanded } : m)),
    }));
  }

  function handleReorderModule(fromId: string, toId: string) {
    updateActiveSlice((slice) => {
      const fromIdx = slice.tree.findIndex((m) => m.id === fromId);
      const toIdx = slice.tree.findIndex((m) => m.id === toId);
      if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return slice;
      const nextTree = [...slice.tree];
      const [moved] = nextTree.splice(fromIdx, 1);
      nextTree.splice(toIdx, 0, moved);
      return { ...slice, tree: nextTree };
    });
  }

  function handleAddFromPalette(componentId: string) {
    const def = COMPONENT_LIBRARY.find((c) => c.id === componentId);
    if (!def) return;
    const newId = `${def.id}-${Date.now()}`;
    const newModule: BuilderModule = {
      id: newId,
      name: def.name.replace(/\s+/g, ""),
      expanded: false,
      properties: [
        { name: "__template", type: "OBJECT" },
        { name: "__variables", type: "OBJECT" },
        { name: "titulo", type: "STRING" },
      ],
    };
    updateActiveSlice((slice) => ({ ...slice, tree: [...slice.tree, newModule] }));
    setSelectedModuleId(newId);
    setSelectedPropertyName(null);
  }

  function handleApplyProperty(moduleId: string, propertyName: string, value: string) {
    const key = `${moduleId}::${propertyName}`;
    updateActiveSlice((slice) => ({
      ...slice,
      propertyValues: { ...slice.propertyValues, [key]: value },
    }));
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
          <ModuleTree
            modules={activeTree}
            pageName={PAGE_TITLES[activeTab]}
            selectedId={selectedModuleId}
            selectedPropertyName={selectedPropertyName}
            onSelectModule={handleSelectModule}
            onSelectProperty={handleSelectProperty}
            onToggleExpand={handleToggleExpand}
            onReorderModule={handleReorderModule}
            onAddFromPalette={handleAddFromPalette}
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

          <Canvas
            canvasWidth={canvasWidth}
            viewport={viewport}
            activeTab={activeTab}
            pageName={PAGE_TITLES[activeTab]}
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
              onSubmit={(prompt) => console.log("Builder — prompt AI", prompt)}
            />
          )}

          {(() => {
            if (!selectedModuleId || !selectedPropertyName) return null;
            const module = activeTree.find((m) => m.id === selectedModuleId);
            if (!module) return null;
            const property = module.properties.find((p) => p.name === selectedPropertyName);
            if (!property) return null;
            const key = `${selectedModuleId}::${selectedPropertyName}`;
            const initialValue = activePropertyValues[key] ?? "";
            return (
              <PropertyPanel
                module={module}
                property={property}
                initialValue={initialValue}
                onApply={(v) => handleApplyProperty(selectedModuleId, selectedPropertyName, v)}
                onClose={() => setSelectedPropertyName(null)}
              />
            );
          })()}
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
    </div>
  );

  return createPortal(overlay, document.body);
}
