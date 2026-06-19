import { ImageWithFallback } from "@figma/my-make-file";

// Imagen válida — se carga desde Unsplash y se recorta a la caja.
export const Ok = () => (
  <ImageWithFallback
    src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=70&w=640"
    alt="Lobby del hotel al atardecer"
    style={{ width: 320, height: 200, objectFit: "cover", borderRadius: "var(--radius-card)" }}
  />
);

// Fuente rota → cae al placeholder gris con el ícono de imagen.
export const Fallback = () => (
  <ImageWithFallback
    src="https://example.com/imagen-que-no-existe.jpg"
    alt="Imagen no disponible"
    style={{ width: 320, height: 200, objectFit: "cover", borderRadius: "var(--radius-card)" }}
  />
);
