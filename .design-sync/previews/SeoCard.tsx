import { SeoCard } from "@figma/my-make-file";

const noop = () => {};

const wrap = (children: React.ReactNode) => (
  <div style={{ width: 420, padding: 16, background: "var(--surface-page)" }}>{children}</div>
);

export const Completo = () =>
  wrap(
    <SeoCard
      pageName="Inicio"
      title="Hotel Diplomatic · Mendoza · Mejor precio en reserva directa"
      description="Hotel boutique en el centro de Mendoza. Reservá directo y obtené desayuno incluido y la mejor tarifa garantizada."
      onTitleChange={noop}
      onDescriptionChange={noop}
      onGenerateWithAI={noop}
    />,
  );

export const Vacio = () =>
  wrap(
    <SeoCard
      pageName="Habitaciones"
      title=""
      description=""
      onTitleChange={noop}
      onDescriptionChange={noop}
      onGenerateWithAI={noop}
    />,
  );

export const Contacto = () =>
  wrap(
    <SeoCard
      pageName="Contacto"
      title="Contacto · Hotel Diplomatic · Mendoza"
      description="Contactanos por teléfono, email o WhatsApp. Estamos a 10 minutos del aeropuerto El Plumerillo."
      onTitleChange={noop}
      onDescriptionChange={noop}
      onGenerateWithAI={noop}
    />,
  );
