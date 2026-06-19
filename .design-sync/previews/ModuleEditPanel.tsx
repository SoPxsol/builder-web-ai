import { ModuleEditPanel } from "@figma/my-make-file";

const noop = () => {};

// Sección "Sobre nosotros" (tomada del árbol inicial del builder).
const modulo = {
  id: "about",
  name: "TextImage",
  alias: "Sobre nosotros",
  typeLabel: "Texto e imagen",
  origin: "manual",
  icon: "columns",
  expanded: false,
  properties: [
    { name: "titulo", type: "STRING" },
    { name: "texto", type: "OBJECT" },
    { name: "imagen", type: "OBJECT" },
    { name: "imagenAlt", type: "STRING" },
  ],
};

// propertyValues se keyean `${module.id}::${propName}`.
const valores = {
  "about::titulo": "Una casa frente al río",
  "about::texto": "Hotel boutique en el casco histórico, a pasos de la costanera y la peatonal.",
  "about::imagenAlt": "Fachada del hotel al atardecer",
};

// Pestaña Contenido: edición en vivo de las propiedades de la sección.
export const Contenido = () => (
  <ModuleEditPanel
    module={modulo}
    propertyValues={valores}
    activeTab="content"
    onTabChange={noop}
    onChangeProperty={noop}
    onRename={noop}
    onToggleHidden={noop}
    onBack={noop}
  />
);

// Pestaña Sección: alias, visibilidad y acciones de la sección.
export const Seccion = () => (
  <ModuleEditPanel
    module={modulo}
    propertyValues={valores}
    activeTab="section"
    onTabChange={noop}
    onChangeProperty={noop}
    onRename={noop}
    onToggleHidden={noop}
    onBack={noop}
  />
);
