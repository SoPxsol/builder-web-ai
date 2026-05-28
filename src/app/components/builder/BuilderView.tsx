import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { BuilderModule, BuilderTab, ViewportMode } from "../../types/builder";
import { COMPONENT_LIBRARY, INITIAL_TREE } from "../../types/builder";
import { BuilderToolbar } from "./BuilderToolbar";
import { ModuleTree } from "./ModuleTree";
import { Canvas } from "./Canvas";
import { ComponentsPanel } from "./ComponentsPanel";
import { AiAssistantPanel } from "./AiAssistantPanel";
import { PropertyPanel } from "./PropertyPanel";

interface Props {
  isOpen: boolean;
  onClose: () => void;
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

import { FOCUSABLE_SELECTOR } from "../../utils/focus";

export function BuilderView({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<BuilderTab>("page");
  const [tree, setTree] = useState<BuilderModule[]>(INITIAL_TREE);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(
    INITIAL_TREE[0]?.id ?? null,
  );
  const [selectedPropertyName, setSelectedPropertyName] = useState<string | null>(null);
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [canvasWidth, setCanvasWidth] = useState<number>(VIEWPORT_TO_WIDTH.desktop);
  const [componentsOpen, setComponentsOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  /** Valor en edición por propiedad. Key: `${moduleId}::${propertyName}`. */
  const [propertyValues, setPropertyValues] = useState<Record<string, string>>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Reset state al cerrar.
  useEffect(() => {
    if (!isOpen) {
      setActiveTab("page");
      setTree(INITIAL_TREE);
      setSelectedModuleId(INITIAL_TREE[0]?.id ?? null);
      setSelectedPropertyName(null);
      setViewport("desktop");
      setCanvasWidth(VIEWPORT_TO_WIDTH.desktop);
      setComponentsOpen(false);
      setAiOpen(false);
      setPropertyValues({});
    }
  }, [isOpen]);

  // Body scroll lock + focus management + ESC + focus trap.
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

  function handleSelectModule(id: string) {
    setSelectedModuleId(id);
    setSelectedPropertyName(null);
  }

  function handleSelectProperty(moduleId: string, propertyName: string) {
    setSelectedModuleId(moduleId);
    setSelectedPropertyName(propertyName);
  }

  function handleToggleExpand(id: string) {
    setTree((prev) =>
      prev.map((m) => (m.id === id ? { ...m, expanded: !m.expanded } : m)),
    );
  }

  function handleReorderModule(fromId: string, toId: string) {
    setTree((prev) => {
      const fromIdx = prev.findIndex((m) => m.id === fromId);
      const toIdx = prev.findIndex((m) => m.id === toId);
      if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  }

  function handleAddFromPalette(componentId: string) {
    const def = COMPONENT_LIBRARY.find((c) => c.id === componentId);
    if (!def) return;
    // Genero ID único concatenando timestamp para evitar colisión con módulos existentes.
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
    setTree((prev) => [...prev, newModule]);
    setSelectedModuleId(newId);
    setSelectedPropertyName(null);
  }

  function handleViewportChange(v: ViewportMode) {
    setViewport(v);
    setCanvasWidth(VIEWPORT_TO_WIDTH[v]);
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
          onPreview={() => console.log("Builder — preview")}
          onPublish={() => console.log("Builder — publicar", activeTab)}
        />

        <div className="flex flex-1 min-h-0" style={{ position: "relative" }}>
          <ModuleTree
            modules={tree}
            pageName={PAGE_TITLES[activeTab]}
            selectedId={selectedModuleId}
            selectedPropertyName={selectedPropertyName}
            onSelectModule={handleSelectModule}
            onSelectProperty={handleSelectProperty}
            onToggleExpand={handleToggleExpand}
            onCreatePage={() => console.log("Builder — crear página")}
            onReorderModule={handleReorderModule}
            onAddFromPalette={handleAddFromPalette}
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
            const module = tree.find((m) => m.id === selectedModuleId);
            if (!module) return null;
            const property = module.properties.find((p) => p.name === selectedPropertyName);
            if (!property) return null;
            const key = `${selectedModuleId}::${selectedPropertyName}`;
            const value = propertyValues[key] ?? "";
            return (
              <PropertyPanel
                module={module}
                property={property}
                value={value}
                onChange={(v) =>
                  setPropertyValues((prev) => ({ ...prev, [key]: v }))
                }
                onClose={() => setSelectedPropertyName(null)}
              />
            );
          })()}
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
