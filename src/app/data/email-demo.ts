/**
 * email-demo.ts — data de demo para el gestor de Email Marketing.
 * Hotel Azul Marino, Cartagena de Indias.
 * Portada desde pxsol-home-mkt-division/src/data/hotel.js + EmailMarketing.jsx.
 * Sin cambios de fondo, solo tipado para el entorno TypeScript del Builder.
 */

/* ────────────────────────────────────────────────────────────────────────────
 * Tipos
 * ──────────────────────────────────────────────────────────────────────────── */

export type CampaignStatus = "Listo" | "Borrador" | "Enviado";

export interface EmailCampaign {
  id: string;
  name: string;
  detail: string;
  status: CampaignStatus;
  subject: string;
  preheader: string;
  /** Párrafos del cuerpo del email. */
  body: string[];
  cta: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Data
 * ──────────────────────────────────────────────────────────────────────────── */

export const emailCampaigns: EmailCampaign[] = [
  {
    id: "welcome",
    name: "Email de bienvenida",
    detail: "Serie de 1 email",
    status: "Listo",
    subject: "Te esperamos en Cartagena, [Nombre]",
    preheader: "Lo que necesitás saber antes de llegar.",
    body: [
      "Hola [Nombre],",
      "Acabamos de confirmar tu reserva en Hotel Azul Marino del [check-in] al [check-out]. Estamos preparando todo para recibirte.",
      "Antes de llegar te dejamos tres cosas:",
      "· Cómo llegar desde el aeropuerto (te podemos enviar transfer privado, respondé este email).",
      "· Una reserva en el restaurante para tu primera noche, si querés. La cena local es 7 pasos y suele agotarse.",
      "· El número directo de Camila, tu host, por si te surge cualquier cosa: +57 300 555 0123.",
      "Nos vemos pronto.",
      "Camila — Hotel Azul Marino",
    ],
    cta: "Confirmar mi llegada",
  },
  {
    id: "high-season",
    name: "Oferta de temporada alta",
    detail: "Serie de 2 emails",
    status: "Borrador",
    subject: "Diciembre en Cartagena — antes de que se agote",
    preheader: "15% off si reservás antes del 30 de junio.",
    body: [
      "Hola,",
      "Diciembre en Cartagena es una de esas semanas que pasan rápido. Te escribimos antes de que se llene.",
      "Hasta el 30 de junio, podés reservar cualquier categoría con 15% off sobre la tarifa de temporada alta. La Suite Junior Vista Mar todavía tiene 4 noches disponibles en la última semana de diciembre.",
      "Si querés, te apartamos la habitación por 48 horas mientras lo pensás.",
      "Camila — Hotel Azul Marino",
    ],
    cta: "Apartar mi habitación",
  },
  {
    id: "review",
    name: "Post-estadía: pedido de reseña",
    detail: "1 email automático",
    status: "Listo",
    subject: "Gracias por venir, [Nombre]",
    preheader: "¿Nos contás cómo fue?",
    body: [
      "Hola [Nombre],",
      "Esperamos que el viaje de regreso haya sido tranquilo. Para nosotros fue un gusto recibirte.",
      "Si tenés un minuto, nos ayudaría muchísimo que dejes una reseña en Google. Cada palabra que escribís pesa más que cualquier campaña que podamos hacer.",
      "Y si algo no estuvo a la altura, contámelo directamente a mí — prefiero saberlo y arreglarlo.",
      "Hasta la próxima.",
      "Camila — Hotel Azul Marino",
    ],
    cta: "Dejar una reseña",
  },
  {
    id: "newsletter",
    name: "Newsletter mensual",
    detail: "Template base",
    status: "Borrador",
    subject: "Lo que está pasando en Azul Marino este mes",
    preheader: "Eventos, novedades y una receta nueva.",
    body: [
      "Hola,",
      "Tres cosas para contarte este mes:",
      "· La carta del restaurante cambió: agregamos un menú de cocina caribeña vegetariana, hecho con la huerta del Mercado de Bazurto.",
      "· El 14 de julio hacemos una cena maridada con un vinero de Valle de Uco. Quedan 6 cupos.",
      "· Lanzamos un programa de fines de semana largos con experiencias incluidas — escribinos si querés el detalle.",
      "Si pasás por Cartagena este mes, venite a tomar algo aunque no te quedes a dormir.",
      "Camila — Hotel Azul Marino",
    ],
    cta: "Ver el calendario del mes",
  },
];

/** Colores de marca del hotel para el preview de email.
 *  Son colores de la marca del hotel demo, no tokens del DS del Builder. */
export const hotelEmailBrand = {
  /** Azul Marino #1A3C5E — color principal del hotel en emails. */
  primary: "#1A3C5E",
  /** Dorado Arena #D4A853 — acento de links del hotel en emails. */
  accent: "#D4A853",
  hotelName: "Hotel Azul Marino",
  hotelCity: "Cartagena",
  hotelCountry: "Colombia",
  hotelAddress: "Calle del Curato 38-42 · Cartagena",
  hotelEmail: "hola@hotelazulmarino.com",
};

/** Métricas estimadas del canal email. */
export const emailMetrics = [
  { k: "Open",  v: "38%" },
  { k: "Click", v: "11%" },
  { k: "Conv",  v: "3.2%" },
];
