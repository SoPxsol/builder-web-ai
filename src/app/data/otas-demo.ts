/**
 * otas-demo.ts — data de demo para el gestor de OTAs / Booking.
 * Hotel Azul Marino, Cartagena de Indias.
 * Portada desde pxsol-home-mkt-division/src/data/hotel.js + OTAs.jsx.
 * Sin cambios de fondo, solo tipado para el entorno TypeScript del Builder.
 */

import { hotelImages } from "./social-demo";

/* ────────────────────────────────────────────────────────────────────────────
 * Tipos
 * ──────────────────────────────────────────────────────────────────────────── */

export interface OtaProfile {
  /** Label del badge que identifica la OTA. */
  badge: string;
  /** Estado de publicación del perfil en la plataforma. */
  status: "active" | "inactive";
  description: string;
  completeness: number;
  missing: string[];
}

export interface OtaRoom {
  name: string;
  description: string;
  amenities: string[];
  price: number;
  image: string;
}

export interface OtaPolicies {
  cancellation: string;
  checkin: string;
  checkout: string;
  pets: string;
  smoking: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Data
 * ──────────────────────────────────────────────────────────────────────────── */

export const otaProfiles: Record<string, OtaProfile> = {
  "Booking.com": {
    badge: "Optimizado para Booking.com",
    status: "active",
    description:
      "Hotel Azul Marino es un boutique de 18 habitaciones ubicado dentro de la ciudad amurallada de Cartagena, frente al mar Caribe. Combina arquitectura colonial restaurada con diseño contemporáneo de autor. Cuenta con piscina en el patio interior, restaurante de gastronomía local, spa y terraza con bar. WiFi gratuito, recepción 24 horas y estacionamiento privado disponibles.",
    completeness: 87,
    missing: ["Política de desayuno", "Foto de baño en Superior", "Precio temporada alta"],
  },
  Expedia: {
    badge: "Optimizado para Expedia",
    status: "active",
    description:
      "Boutique hotel of 18 rooms inside the walled old town of Cartagena, facing the Caribbean. Local-design rooms with restored balconies, an inner courtyard pool, a farm-to-table restaurant, spa services and a rooftop bar. Family-friendly, with 24-hour front desk and on-site parking.",
    completeness: 78,
    missing: ["Versión inglés de políticas", "Tarifas con desayuno", "Mapa de planta"],
  },
  Airbnb: {
    badge: "Optimizado para Airbnb",
    status: "active",
    description:
      "Te hospedamos en una de nuestras 18 habitaciones — pensá en quedarte como en una casa, no como en un hotel. Cocinamos con lo que trae el pescador, conocemos al chef de la esquina y te armamos el itinerario de tu visita. Si venís en pareja, pedí la Suite Junior. Si venís con tu gente, hablamos.",
    completeness: 92,
    missing: ["Reglas de la casa", "Manual de bienvenida"],
  },
  TripAdvisor: {
    badge: "Optimizado para TripAdvisor",
    status: "inactive",
    description:
      "Premiado entre los 10 mejores boutiques de Cartagena por viajeros en 2025. Servicio personalizado, gastronomía destacada, ubicación inmejorable dentro de la muralla. Ideal para parejas, viajes de aniversario y escapadas culturales.",
    completeness: 81,
    missing: ["Respuestas a últimas 3 reseñas", "Tour 360°"],
  },
};

export const otaRooms: OtaRoom[] = [
  {
    name: "Superior Vista Ciudad",
    description:
      "Habitación de 28 m² con balcón francés sobre el casco histórico. Cama king, baño en mármol, escritorio y minibar curado.",
    amenities: ["WiFi", "Aire acondicionado", "Caja fuerte", "Smart TV", "Minibar", "Balcón"],
    price: 180,
    image: hotelImages.room1,
  },
  {
    name: "Suite Junior Vista Mar",
    description:
      "Suite de 42 m² con ventanal panorámico al Caribe. Living independiente, cama king, baño con bañera profunda y amenities de autor.",
    amenities: ["WiFi", "Aire acondicionado", "Bañera", "Living", "Smart TV", "Vista al mar"],
    price: 280,
    image: hotelImages.room2,
  },
  {
    name: "Suite Master con Terraza",
    description:
      "Suite de 65 m² con terraza privada de 20 m², jacuzzi al aire libre y mayordomo asignado. La habitación insignia de la casa.",
    amenities: ["Terraza privada", "Jacuzzi", "Mayordomo", "Bañera", "Smart TV", "Vista al mar"],
    price: 480,
    image: hotelImages.room3,
  },
];

export const defaultPolicies: OtaPolicies = {
  cancellation: "Moderada",
  checkin: "15:00",
  checkout: "12:00",
  pets: "Permitidas con cargo",
  smoking: "No permitido",
};

/** Lista ordenada de OTAs para los tabs. */
export const otaList = Object.keys(otaProfiles) as Array<keyof typeof otaProfiles>;
