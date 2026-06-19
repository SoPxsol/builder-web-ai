import { PopupStep2Config } from "@figma/my-make-file";

const noop = () => {};

// state fiel a PopupState (ver INITIAL_POPUP_STATE). El paso 2 lee `position`
// (grilla 3×3 de posición) y `pages` (checklist de páginas). La página "reservas"
// tiene hasConflict en el componente, así que al seleccionarla aparece el aviso
// ámbar de popup en conflicto. update → noop.
const state = {
  currentStep: 2 as const,
  variant: "popup" as const,
  internalName: "Popup oferta invierno 2026",
  title: "15% off por reserva directa",
  description: "Reservá sin intermediarios.",
  imageUrl: "",
  ctaText: "Reservar ahora",
  ctaUrl: "https://hoteldiplomatic.com/reservas",
  openIn: "new-tab" as const,
  position: "center" as const,
  pages: ["inicio", "habitaciones"],
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

// Posición "Centro" (con hint recomendado) y páginas Inicio + Habitaciones activas.
export const Configuracion = () => wrap(<PopupStep2Config state={state} update={noop} />);

// Variante: posición abajo-derecha y "Reservas" seleccionada → aviso de conflicto.
export const ConConflicto = () =>
  wrap(
    <PopupStep2Config
      state={{ ...state, position: "bottom-right", pages: ["inicio", "reservas"] }}
      update={noop}
    />
  );
