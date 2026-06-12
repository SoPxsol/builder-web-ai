import {
  createBlock,
  newBlockId,
  type ArticleBlock,
} from "../../types/articleBlocks";

/**
 * Generación de borrador con IA — MOCK (front-only).
 *
 * El brief del editor mobile (§2, §8) describe el flujo natural del celular:
 * la persona describe lo que quiere, la IA genera la maqueta y ella revisa.
 * Todavía no hay endpoint (TODO backend): acá devolvemos un borrador de ejemplo
 * tras un delay, para que el estado `generando…` sea visible y el resultado
 * caiga directo en la zona de contenido.
 *
 * Cuando exista el servicio real, reemplazar el cuerpo de `generateDraft` por la
 * llamada al endpoint; la firma (prompt → bloques) se mantiene.
 */

const DEMO_IMG =
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=70&w=1200";

/** Latencia simulada del generador, en ms. */
const GENERATION_DELAY = 1800;

/**
 * Construye un borrador de ejemplo a partir del prompt. El texto del prompt se
 * incrusta para que el resultado se sienta "sobre lo pedido" (es mock, no IA).
 */
function buildDraft(prompt: string): ArticleBlock[] {
  const topic = prompt.trim() || "tu próximo artículo";

  const intro: ArticleBlock = {
    id: newBlockId(),
    type: "paragraph",
    variant: "lead",
    text: `${topic}. En esta guía reunimos lo que necesitás saber para aprovecharla al máximo durante tu estadía, con recomendaciones de nuestro equipo.`,
  };

  const h1: ArticleBlock = {
    id: newBlockId(),
    type: "heading",
    level: 2,
    text: "Por dónde empezar",
    numbered: true,
  };

  const p1: ArticleBlock = {
    id: newBlockId(),
    type: "paragraph",
    text: "Antes de salir, conviene tener claro el plan del día: horarios, distancias y qué reservar con anticipación. Así evitás contratiempos y ganás tiempo para disfrutar.",
  };

  const list: ArticleBlock = {
    id: newBlockId(),
    type: "list",
    ordered: false,
    items: [
      "Reservá con anticipación las actividades más buscadas.",
      "Llevá calzado cómodo y agua.",
      "Consultá el clima del día en la recepción.",
    ],
  };

  const h2: ArticleBlock = {
    id: newBlockId(),
    type: "heading",
    level: 2,
    text: "Recomendaciones del equipo",
    numbered: true,
  };

  const callout: ArticleBlock = {
    id: newBlockId(),
    type: "callout",
    label: "Consejo del concierge",
    title: "Reservá temprano",
    text: "Las primeras horas de la mañana suelen tener menos gente y mejor luz para las fotos.",
  };

  const image: ArticleBlock = {
    id: newBlockId(),
    type: "image",
    url: DEMO_IMG,
    caption: "Imagen sugerida — reemplazala por una propia.",
    alt: topic,
  };

  const cta = createBlock("cta");

  return [intro, h1, p1, list, h2, callout, image, cta];
}

/**
 * Genera un borrador de artículo a partir de un prompt. Resuelve tras un delay
 * para que el estado de carga sea perceptible. Rechaza si el prompt está vacío.
 */
export function generateDraft(prompt: string): Promise<ArticleBlock[]> {
  return new Promise((resolve, reject) => {
    if (!prompt.trim()) {
      reject(new Error("Necesitás describir el artículo antes de generar."));
      return;
    }
    window.setTimeout(() => resolve(buildDraft(prompt)), GENERATION_DELAY);
  });
}
