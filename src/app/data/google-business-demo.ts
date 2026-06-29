/**
 * google-business-demo.ts — data de demo para Google Business Profile.
 * Hotel Azul Marino, Cartagena de Indias.
 * Portada desde pxsol-home-mkt-division/src/data/hotel.js + GoogleBusiness.jsx.
 * Sin cambios de fondo, solo tipado para el entorno TypeScript del Builder.
 */

import { hotelImages } from "./social-demo";

/* ────────────────────────────────────────────────────────────────────────────
 * Tipos
 * ──────────────────────────────────────────────────────────────────────────── */

export interface GbAttribute {
  id: string;
  label: string;
  on: boolean;
}

export interface GbReview {
  author: string;
  stars: number;
  date: string;
  text: string;
  aiReply: string;
}

export interface GoogleBusinessData {
  name: string;
  category: string;
  secondaryCategories: string[];
  shortDescription: string;
  hours: string;
  phone: string;
  whatsapp: string;
  website: string;
  address: string;
  attributes: GbAttribute[];
  photos: string[];
  reviews: GbReview[];
}

/* ────────────────────────────────────────────────────────────────────────────
 * Data
 * ──────────────────────────────────────────────────────────────────────────── */

export const googleBusinessData: GoogleBusinessData = {
  name: "Hotel Azul Marino",
  category: "Hotel",
  secondaryCategories: ["Spa", "Restaurante", "Bar"],
  shortDescription:
    "Boutique de 18 habitaciones frente al mar, en la ciudad amurallada. Diseño de autor, gastronomía local y servicio personalizado.",
  hours: "24 horas · Recepción atendida",
  phone: "+57 5 664 0000",
  whatsapp: "+57 300 555 0123",
  website: "hotelazulmarino.presence.io",
  address: "Calle del Curato 38-42, Centro Histórico, Cartagena de Indias",
  attributes: [
    { id: "pets",        label: "Se admiten mascotas",        on: true  },
    { id: "wifi",        label: "WiFi gratis",                on: true  },
    { id: "parking",     label: "Estacionamiento",            on: true  },
    { id: "pool",        label: "Piscina",                    on: true  },
    { id: "spa",         label: "Spa",                        on: true  },
    { id: "restaurant",  label: "Restaurante en sitio",       on: true  },
    { id: "bar",         label: "Bar",                        on: true  },
    { id: "breakfast",   label: "Desayuno incluido",          on: false },
    { id: "gym",         label: "Gimnasio",                   on: false },
    { id: "accessible",  label: "Accesible en silla de ruedas", on: true },
  ],
  photos: [
    hotelImages.facade,
    hotelImages.pool,
    hotelImages.room2,
    hotelImages.restaurant,
    hotelImages.terrace,
    hotelImages.spa,
  ],
  reviews: [
    {
      author: "María Fernández",
      stars: 5,
      date: "hace 3 días",
      text: "Una estadía perfecta. El personal estuvo atento sin ser invasivo, la habitación con vista al mar es un sueño, y la cena del restaurante todavía la recordamos. Volveríamos sin dudarlo.",
      aiReply:
        "María, muchísimas gracias por elegirnos y por tomarte el tiempo de escribirnos. Nos alegra que la Suite Vista Mar y la cena de degustación hayan sido parte de tu recuerdo. El equipo entero te agradece. Te esperamos pronto. — Camila, Hotel Azul Marino",
    },
    {
      author: "Andrés Quintero",
      stars: 4.5,
      date: "hace 1 semana",
      text: "Excelente ubicación, dentro de la muralla pero tranquilo. La decoración es realmente cuidada. Solo un detalle: el desayuno podría tener más opciones locales.",
      aiReply:
        "Andrés, gracias por la reseña y por la observación sobre el desayuno — es feedback que estamos incorporando este mes con más opciones de la región. Será un gusto recibirte de nuevo para que veas el cambio. — Camila, Hotel Azul Marino",
    },
    {
      author: "Lucía Restrepo",
      stars: 3,
      date: "hace 2 semanas",
      text: "La habitación es linda pero el aire acondicionado hacía ruido toda la noche. Lo reportamos a recepción y vinieron pero no se solucionó del todo.",
      aiReply:
        "Lucía, lamentamos sinceramente que la experiencia con el aire no haya estado a la altura. Ya cambiamos el equipo de esa habitación y reforzamos el protocolo de mantenimiento nocturno. Nos gustaría compensarte con una próxima estadía — escribinos a hola@hotelazulmarino.com. — Camila",
    },
  ],
};
