import { PopupStep1Design } from "@figma/my-make-file";

const noop = () => {};

// state fiel a PopupState (ver INITIAL_POPUP_STATE en types/creation.ts), con
// contenido realista de un hotel boutique LATAM. El step lee todos los campos
// del paso 1 (variant, internalName, title, description, imageUrl, ctaText,
// ctaUrl, openIn). update → noop.
const state = {
  currentStep: 1 as const,
  variant: "popup" as const,
  internalName: "Popup oferta invierno 2026",
  title: "15% off por reserva directa",
  description: "Reservá sin intermediarios y obtené el mejor precio garantizado, desayuno incluido.",
  imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=70&w=600",
  ctaText: "Reservar ahora",
  ctaUrl: "https://hoteldiplomatic.com/reservas?promo=directa15",
  openIn: "new-tab" as const,
  position: "center" as const,
  pages: ["inicio"],
  triggers: { delay: true },
  delaySeconds: 5,
  scrollPercent: 50,
  inactivitySeconds: 30,
  devices: { desktop: true, mobile: true },
  frequency: "once-per-session" as const,
};

const wrap = (children: React.ReactNode) => (
  <div style={{ width: 340, background: "#fff" }}>{children}</div>
);

// Paso 1 con tipo "Popup" seleccionado, imagen cargada y todos los campos llenos.
export const Diseno = () => wrap(<PopupStep1Design state={state} update={noop} />);

// Variante con el tipo "Toast" seleccionado y sin imagen, para ver el upload vacío.
export const Toast = () =>
  wrap(
    <PopupStep1Design
      state={{ ...state, variant: "toast", imageUrl: "", internalName: "Toast bienvenida", title: "¡Bienvenido al Diplomatic!" }}
      update={noop}
    />
  );
