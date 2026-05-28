/**
 * URLs de Unsplash con licencia abierta — hotelería real para mostrar
 * el sitio del hotelero con imágenes verosímiles durante el onboarding.
 * Si alguna URL falla, el componente que las usa debe tener fallback visual.
 */

const UNSPLASH_PARAMS = "?auto=format&fit=crop&q=70&w=800";

function unsplash(id: string): string {
  return `https://images.unsplash.com/${id}${UNSPLASH_PARAMS}`;
}

export interface HotelImageSet {
  /** Foto de portada para el hero. */
  hero: string;
  /** 3 imágenes para la galería (habitación, piscina, lobby/restaurant). */
  gallery: [string, string, string];
  /** Imagen por habitación, ciclada por índice. */
  rooms: string[];
}

/**
 * Conjunto de imágenes base. Si en el futuro se quiere ofrecer múltiples
 * "tonos" (boutique, resort, urbano), exponer un Record<TemplateId, HotelImageSet>.
 */
export const HOTEL_IMAGES: HotelImageSet = {
  hero: unsplash("photo-1566073771259-6a8506099945"),
  gallery: [
    unsplash("photo-1551882547-ff40c63fe5fa"),
    unsplash("photo-1540541338287-41700207dee6"),
    unsplash("photo-1564501049412-61c2a3083791"),
  ],
  rooms: [
    unsplash("photo-1631049307264-da0ec9d70304"),
    unsplash("photo-1611892440504-42a792e24d32"),
    unsplash("photo-1582719478250-c89cae4dc85b"),
    unsplash("photo-1590490360182-c33d57733427"),
    unsplash("photo-1578683010236-d716f9a3f461"),
    unsplash("photo-1444201983204-c43cbd584d93"),
    unsplash("photo-1631049552240-59c37f38802b"),
    unsplash("photo-1576675784201-0e142b423952"),
  ],
};

/** Devuelve la imagen de habitación para el índice dado, ciclando el array. */
export function getRoomImage(index: number): string {
  return HOTEL_IMAGES.rooms[index % HOTEL_IMAGES.rooms.length];
}
