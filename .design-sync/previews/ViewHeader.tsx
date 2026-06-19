import { ViewHeader, Button, Badge } from "@figma/my-make-file";

const noop = () => {};

export const Simple = () => (
  <div style={{ width: 560 }}>
    <ViewHeader
      title="Páginas"
      description="Gestioná las páginas de tu sitio web."
      navigate={noop}
    />
  </div>
);

export const WithBackAndAction = () => (
  <div style={{ width: 560 }}>
    <ViewHeader
      backTo={"dashboard" as never}
      eyebrow="Hotel Diplomatic"
      title="Editar promoción"
      description="Configurá la vigencia y las condiciones de la promoción."
      navigate={noop}
      action={<Button variant="primary">Guardar cambios</Button>}
    />
  </div>
);

export const WithBadgeAction = () => (
  <div style={{ width: 560 }}>
    <ViewHeader
      eyebrow="Hotel Diplomatic"
      title="SEO y GEO"
      description="Optimizá tu sitio para buscadores y motores de IA."
      navigate={noop}
      action={<Badge tone="success">Sitemap activo</Badge>}
    />
  </div>
);
