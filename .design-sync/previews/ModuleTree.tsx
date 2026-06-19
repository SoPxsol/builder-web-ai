import { ModuleTree } from "@figma/my-make-file";

const noop = () => {};

// Árbol de secciones de la página "Inicio" (réplica del árbol inicial del builder).
const modulos = [
  { id: "hero", name: "HeroSection", alias: "Portada", typeLabel: "Hero", origin: "manual", icon: "layout", expanded: false, properties: [
    { name: "kicker", type: "STRING" }, { name: "headline", type: "STRING" }, { name: "subtitle", type: "STRING" }, { name: "ctaText", type: "STRING" }, { name: "backgroundImage", type: "OBJECT" },
  ] },
  { id: "rooms", name: "RoomsGrid", alias: "Habitaciones", typeLabel: "Habitaciones", origin: "manual", icon: "layout-grid", expanded: false, properties: [
    { name: "titulo", type: "STRING" }, { name: "rooms", type: "ARRAY" }, { name: "showPrices", type: "BOOLEAN" },
  ] },
  { id: "promos-ai", name: "CustomComponent1", alias: "Promociones", typeLabel: "Texto destacado", origin: "ai", icon: "sparkles", expanded: false, properties: [
    { name: "kicker", type: "STRING" }, { name: "headline", type: "STRING" }, { name: "texto", type: "OBJECT" }, { name: "boton", type: "OBJECT" },
  ] },
  { id: "about", name: "TextImage", alias: "Sobre nosotros", typeLabel: "Texto e imagen", origin: "manual", icon: "columns", expanded: false, properties: [
    { name: "titulo", type: "STRING" }, { name: "texto", type: "OBJECT" }, { name: "imagen", type: "OBJECT" }, { name: "imagenAlt", type: "STRING" },
  ] },
  { id: "gallery", name: "Gallery", alias: "Galería", typeLabel: "Galería", origin: "manual", icon: "images", expanded: false, properties: [
    { name: "images", type: "ARRAY" }, { name: "columns", type: "NUMBER" },
  ] },
];

// Panel de estructura: lista ordenable de secciones con la sección
// "Habitaciones" seleccionada.
export const Arbol = () => (
  <div style={{ width: 320 }}>
    <ModuleTree
      modules={modulos}
      propertyValues={{}}
      pageName="Inicio"
      selectedId="rooms"
      selectedPropertyName={null}
      onSelectModule={noop}
      onSelectProperty={noop}
      onToggleExpand={noop}
      onReorderModule={noop}
      onAddFromPalette={noop}
      onEditModule={noop}
      onRenameModule={noop}
      onToggleHidden={noop}
      onDuplicateModule={noop}
      onRequestDeleteModule={noop}
    />
  </div>
);

// Una sección oculta (atenuada) dentro del árbol.
const conOculta = modulos.map((m) =>
  m.id === "gallery" ? { ...m, hidden: true } : m,
);

export const ConSeccionOculta = () => (
  <div style={{ width: 320 }}>
    <ModuleTree
      modules={conOculta}
      propertyValues={{}}
      pageName="Inicio"
      selectedId="hero"
      selectedPropertyName={null}
      onSelectModule={noop}
      onSelectProperty={noop}
      onToggleExpand={noop}
      onReorderModule={noop}
      onAddFromPalette={noop}
      onEditModule={noop}
      onRenameModule={noop}
      onToggleHidden={noop}
      onDuplicateModule={noop}
      onRequestDeleteModule={noop}
    />
  </div>
);
