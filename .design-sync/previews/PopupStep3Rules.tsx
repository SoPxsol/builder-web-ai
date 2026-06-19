import { PopupStep3Rules } from "@figma/my-make-file";

const noop = () => {};

// state fiel a PopupState (ver INITIAL_POPUP_STATE). El paso 3 lee `triggers`
// (grilla de disparadores con Toggle), `delaySeconds/scrollPercent/inactivitySeconds`
// (inputs contextuales que aparecen según el trigger activo), `devices` y
// `frequency` (acordeón abierto por defecto). update → noop.
const state = {
  currentStep: 3 as const,
  variant: "popup" as const,
  internalName: "Popup oferta invierno 2026",
  title: "15% off por reserva directa",
  description: "Reservá sin intermediarios.",
  imageUrl: "",
  ctaText: "Reservar ahora",
  ctaUrl: "https://hoteldiplomatic.com/reservas",
  openIn: "new-tab" as const,
  position: "center" as const,
  pages: ["inicio"],
  triggers: { delay: true },
  delaySeconds: 8,
  scrollPercent: 50,
  inactivitySeconds: 30,
  devices: { desktop: true, mobile: true },
  frequency: "once-per-session" as const,
};

const wrap = (children: React.ReactNode) => (
  <div style={{ width: 340, background: "#fff" }}>{children}</div>
);

// Trigger "Demora" activo (muestra el input de segundos), ambos dispositivos on,
// acordeón Frecuencia abierto con "1× por sesión".
export const Reglas = () => wrap(<PopupStep3Rules state={state} update={noop} />);

// Variante: exit intent + scroll activos (aviso solo-desktop + input de %),
// solo desktop, frecuencia "Siempre".
export const ExitYScroll = () =>
  wrap(
    <PopupStep3Rules
      state={{
        ...state,
        triggers: { exit: true, scroll: true },
        scrollPercent: 60,
        devices: { desktop: true, mobile: false },
        frequency: "always",
      }}
      update={noop}
    />
  );
