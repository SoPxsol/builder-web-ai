const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
pres.author = "PXSOL Web";
pres.title = "Los dos wizards de configuración — propuesta comercial";

// ── Paleta de marca PXSOL ──
const INK = "1A1A1A";
const CORAL = "E84A2C";
const WHITE = "FFFFFF";
const PAPER = "F6F6F6";
const GREEN = "22C55E";
const BLUE = "1A4DCC";
const ORANGE = "F29E11";
const GRAY = "737373";
const BORDER = "D9D9D9";
const HEAD = "Georgia";
const BODY = "Calibri";

const W = 13.3;
const shadow = () => ({ type: "outer", color: "000000", blur: 8, offset: 3, angle: 135, opacity: 0.1 });

// Helper: eyebrow coral dot + label
function eyebrow(slide, x, y, label, color = CORAL) {
  slide.addShape(pres.shapes.OVAL, { x, y: y + 0.04, w: 0.16, h: 0.16, fill: { color } });
  slide.addText(label.toUpperCase(), {
    x: x + 0.26, y: y - 0.05, w: 6, h: 0.3, fontFace: BODY, fontSize: 11, bold: true,
    color: color, charSpacing: 2, align: "left", margin: 0,
  });
}

/* ───────────────────────── SLIDE 1 — Portada ───────────────────────── */
{
  const s = pres.addSlide();
  s.background = { color: INK };
  // marca
  s.addShape(pres.shapes.OVAL, { x: 0.9, y: 0.85, w: 0.2, h: 0.2, fill: { color: CORAL } });
  s.addText("PXSOL WEB", { x: 1.2, y: 0.75, w: 6, h: 0.4, fontFace: BODY, fontSize: 13, bold: true, color: WHITE, charSpacing: 3, margin: 0 });

  s.addText("Los dos wizards\nde configuración", {
    x: 0.9, y: 2.1, w: 11.5, h: 2.2, fontFace: HEAD, fontSize: 54, bold: true, color: WHITE, lineSpacing: 56, margin: 0,
  });
  s.addText([
    { text: "Cómo ", options: {} },
    { text: "activamos, retenemos y convertimos", options: { italic: true, color: CORAL } },
    { text: " hoteleros.", options: {} },
  ], { x: 0.92, y: 4.35, w: 11, h: 0.5, fontFace: BODY, fontSize: 20, color: "CADCFC", margin: 0 });
  s.addText("Propuesta para el equipo comercial", {
    x: 0.92, y: 4.95, w: 11, h: 0.4, fontFace: BODY, fontSize: 15, color: GRAY, margin: 0,
  });

  // franja de datos abajo
  const stats = [["500+", "hoteles activos"], ["+38%", "reservas directas"], ["9", "países LATAM"], ["15+", "años en el sector"]];
  stats.forEach(([n, l], i) => {
    const x = 0.92 + i * 3.0;
    s.addText(n, { x, y: 6.05, w: 2.8, h: 0.6, fontFace: HEAD, fontSize: 30, bold: true, color: CORAL, margin: 0 });
    s.addText(l, { x, y: 6.7, w: 2.8, h: 0.35, fontFace: BODY, fontSize: 12, color: "9AA0A6", margin: 0 });
  });
}

/* ───────────────────────── SLIDE 2 — Por qué dos ───────────────────────── */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  eyebrow(s, 0.9, 0.7, "La estrategia");
  s.addText("Un solo wizard no alcanza", {
    x: 0.9, y: 1.05, w: 11.5, h: 0.8, fontFace: HEAD, fontSize: 36, bold: true, color: INK, margin: 0,
  });
  s.addText("Dos momentos distintos del hotelero. Dos objetivos comerciales distintos.", {
    x: 0.9, y: 1.85, w: 11.5, h: 0.4, fontFace: BODY, fontSize: 15, color: GRAY, margin: 0,
  });

  const cards = [
    { t: "Wizard 1 · Onboarding", tag: "~5 min", color: CORAL,
      rows: [["Cuándo", "Arranque del trial"], ["Quiere", "“Tener mi sitio funcionando YA”"], ["Objetivo comercial", "ACTIVACIÓN — ver valor en minutos"], ["Pilar", "Conversión rápida"]] },
    { t: "Wizard 2 · Configuración completa", tag: "~25 min", color: BLUE,
      rows: [["Cuándo", "Con el sitio ya publicado"], ["Quiere", "“Que mi sitio venda mejor”"], ["Objetivo comercial", "RETENCIÓN + conversión a plan pago"], ["Pilar", "Inteligencia + Acompañamiento"]] },
  ];
  cards.forEach((c, i) => {
    const x = 0.9 + i * 5.95;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.55, w: 5.5, h: 4.4, fill: { color: PAPER }, line: { color: BORDER, width: 1 }, shadow: shadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.55, w: 5.5, h: 0.12, fill: { color: c.color } });
    s.addText(c.t, { x: x + 0.35, y: 2.85, w: 4.8, h: 0.5, fontFace: HEAD, fontSize: 19, bold: true, color: INK, margin: 0 });
    s.addText(c.tag, { x: x + 0.35, y: 3.35, w: 4.8, h: 0.35, fontFace: BODY, fontSize: 13, bold: true, color: c.color, margin: 0 });
    c.rows.forEach((r, j) => {
      const ry = 3.95 + j * 0.72;
      s.addText(r[0].toUpperCase(), { x: x + 0.35, y: ry, w: 4.8, h: 0.25, fontFace: BODY, fontSize: 9.5, bold: true, color: GRAY, charSpacing: 1, margin: 0 });
      s.addText(r[1], { x: x + 0.35, y: ry + 0.24, w: 4.8, h: 0.4, fontFace: BODY, fontSize: 13.5, color: INK, margin: 0 });
    });
  });
}

/* ───────────────────────── SLIDE 3 — Wizard 1 ───────────────────────── */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  eyebrow(s, 0.9, 0.7, "Wizard 1 · Onboarding", CORAL);
  s.addText("5 minutos hasta el “aha”", {
    x: 0.9, y: 1.05, w: 11.5, h: 0.8, fontFace: HEAD, fontSize: 36, bold: true, color: INK, margin: 0,
  });
  s.addText("Llevar al hotelero de cero a “mi sitio existe y se ve profesional” en una sola sesión. Nunca pide más de lo mínimo.", {
    x: 0.9, y: 1.85, w: 11.5, h: 0.5, fontFace: BODY, fontSize: 15, color: GRAY, margin: 0,
  });

  const steps = [
    ["1", "Plantilla", "Elegir 1 plantilla. Resultado visual al instante."],
    ["2", "Identidad", "Logo (o foto de ejemplo). Avanza igual si no lo tiene."],
    ["3", "Info & contacto", "Nombre, teléfono, email. Importa desde Booking."],
    ["4", "Habitaciones", "Solo nombre y cantidad. Lo demás va al W2."],
    ["5", "Lanzamiento", "Ver el sitio + compartir. El cierre emocional."],
  ];
  const cw = 2.28, gap = 0.13, startX = 0.9;
  steps.forEach((st, i) => {
    const x = startX + i * (cw + gap);
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.9, w: cw, h: 3.4, fill: { color: PAPER }, line: { color: BORDER, width: 1 }, shadow: shadow() });
    s.addShape(pres.shapes.OVAL, { x: x + 0.35, y: 3.2, w: 0.7, h: 0.7, fill: { color: i === 4 ? CORAL : INK } });
    s.addText(st[0], { x: x + 0.35, y: 3.27, w: 0.7, h: 0.56, fontFace: HEAD, fontSize: 24, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(st[1], { x: x + 0.3, y: 4.1, w: cw - 0.5, h: 0.55, fontFace: HEAD, fontSize: 16, bold: true, color: INK, margin: 0 });
    s.addText(st[2], { x: x + 0.3, y: 4.7, w: cw - 0.5, h: 1.4, fontFace: BODY, fontSize: 12, color: GRAY, lineSpacing: 15, margin: 0 });
  });

  s.addText([
    { text: "Regla de diseño:  ", options: { bold: true, color: CORAL } },
    { text: "todo lo que toma tiempo (fotos, tarifas, amenities, SEO) se difiere al Wizard 2.", options: {} },
  ], { x: 0.9, y: 6.55, w: 11.5, h: 0.5, fontFace: BODY, fontSize: 14, color: INK, align: "center", margin: 0 });
}

/* ───────────────────────── SLIDE 4 — Mecanismos W1 ───────────────────────── */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  eyebrow(s, 0.9, 0.7, "Wizard 1 · Mecanismos", CORAL);
  s.addText("La venta empieza acá", {
    x: 0.9, y: 1.05, w: 7, h: 0.8, fontFace: HEAD, fontSize: 36, bold: true, color: INK, margin: 0,
  });

  const mechs = [
    ["Panel del asesor", "Guiones para el comercial en cada paso del wizard."],
    ["Contador de trial", "“Día 1 de 14” visible — urgencia honesta desde el minuto cero."],
    ["Momento del celular", "Mostrar el sitio en el teléfono del hotelero en el paso 5."],
    ["Puente al Wizard 2", "“Ir a configuración completa” lista lo que falta para vender más."],
  ];
  mechs.forEach((m, i) => {
    const y = 2.1 + i * 1.15;
    s.addShape(pres.shapes.OVAL, { x: 0.9, y: y + 0.05, w: 0.5, h: 0.5, fill: { color: PAPER }, line: { color: CORAL, width: 1.5 } });
    s.addText(String(i + 1), { x: 0.9, y: y + 0.08, w: 0.5, h: 0.44, fontFace: HEAD, fontSize: 18, bold: true, color: CORAL, align: "center", valign: "middle", margin: 0 });
    s.addText(m[0], { x: 1.6, y: y, w: 4.7, h: 0.4, fontFace: HEAD, fontSize: 16, bold: true, color: INK, margin: 0 });
    s.addText(m[1], { x: 1.6, y: y + 0.4, w: 4.9, h: 0.6, fontFace: BODY, fontSize: 12.5, color: GRAY, lineSpacing: 15, margin: 0 });
  });

  // Card guion de cierre
  s.addShape(pres.shapes.RECTANGLE, { x: 7.0, y: 1.95, w: 5.4, h: 4.7, fill: { color: INK }, shadow: shadow() });
  s.addText("GUION DE CIERRE (en el producto)", { x: 7.4, y: 2.3, w: 4.7, h: 0.3, fontFace: BODY, fontSize: 11, bold: true, color: CORAL, charSpacing: 1.5, margin: 0 });
  s.addText([
    { text: "“[Nombre], tu sitio está listo. ¿Querés que veamos cómo activar el plan para que siga activo después del trial?", options: { breakLine: true } },
    { text: "", options: { breakLine: true } },
    { text: "Con 3 reservas directas que antes iban a Booking, el plan ya se paga.”", options: { bold: true, color: WHITE } },
  ], { x: 7.4, y: 2.85, w: 4.7, h: 3.5, fontFace: HEAD, fontSize: 18, italic: true, color: "CADCFC", lineSpacing: 26, valign: "top", margin: 0 });
}

/* ───────────────────────── SLIDE 5 — Wizard 2 ───────────────────────── */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  eyebrow(s, 0.9, 0.7, "Wizard 2 · Configuración completa", BLUE);
  s.addText("25 minutos hasta el resultado de negocio", {
    x: 0.9, y: 1.05, w: 11.5, h: 0.8, fontFace: HEAD, fontSize: 34, bold: true, color: INK, margin: 0,
  });
  s.addText("Acá vive el valor diferencial de PXSOL: SEO/GEO, Schema.org, multilenguaje. Se completa de forma gradual y guiada.", {
    x: 0.9, y: 1.85, w: 11.5, h: 0.45, fontFace: BODY, fontSize: 15, color: GRAY, margin: 0,
  });

  const groups = [
    { title: "Lanzamiento · Semana 1", color: GREEN, items: [
      ["Perfil completo", "Email corporativo + descripción con IA"],
      ["Redes sociales", "Instagram y WhatsApp, los canales clave"],
      ["Ubicación y POI", "Aeropuerto + atracciones = SEO local"],
      ["SEO y Schema.org", "Aparecer en ChatGPT y Perplexity"],
    ]},
    { title: "Crecimiento · Mes 1-3", color: ORANGE, items: [
      ["Idiomas y monedas", "Cada idioma suma búsquedas internacionales"],
      ["Páginas adicionales", "“Experiencias”: mayor tiempo de permanencia"],
      ["Políticas y pagos", "La política flexible sube la conversión"],
      ["Lanzamiento", "Publicar + revisión a 30 días"],
    ]},
  ];
  groups.forEach((g, gi) => {
    const x = 0.9 + gi * 5.95;
    s.addText(g.title.toUpperCase(), { x: x + 0.05, y: 2.5, w: 5.4, h: 0.3, fontFace: BODY, fontSize: 11, bold: true, color: g.color, charSpacing: 1.5, margin: 0 });
    g.items.forEach((it, i) => {
      const y = 2.95 + i * 0.95;
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: 5.5, h: 0.82, fill: { color: PAPER }, line: { color: BORDER, width: 1 } });
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.1, h: 0.82, fill: { color: g.color } });
      s.addText(it[0], { x: x + 0.32, y: y + 0.1, w: 5, h: 0.32, fontFace: HEAD, fontSize: 14.5, bold: true, color: INK, margin: 0 });
      s.addText(it[1], { x: x + 0.32, y: y + 0.43, w: 5, h: 0.32, fontFace: BODY, fontSize: 11.5, color: GRAY, margin: 0 });
    });
  });
}

/* ───────────────────────── SLIDE 6 — Nudges ───────────────────────── */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  eyebrow(s, 0.9, 0.7, "Más allá de los wizards", BLUE);
  s.addText("Cómo el producto empuja a completar", {
    x: 0.9, y: 1.05, w: 11.5, h: 0.8, fontFace: HEAD, fontSize: 36, bold: true, color: INK, margin: 0,
  });
  s.addText("Un sistema de “nudges” hace el seguimiento que antes dependía 100% del asesor.", {
    x: 0.9, y: 1.85, w: 11.5, h: 0.4, fontFace: BODY, fontSize: 15, color: GRAY, margin: 0,
  });

  const nudges = [
    ["Tarjeta de progreso", "En el dashboard: “% de tu configuración” + qué falta + CTA para continuar."],
    ["KPIs accionables", "“Buscadores activos: 1 de 3 → Activá Schema.org”. Las métricas empujan."],
    ["Sitios pendientes", "“Setup incompleto” retoma el wizard exactamente donde quedó."],
    ["Contador de trial", "14 días siempre visible: completá y publicá antes de que termine."],
    ["Acompañamiento humano", "El asesor especializado usa los guiones embebidos en cada etapa."],
  ];
  nudges.forEach((n, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.9 + col * 6.0;
    const y = 2.55 + row * 1.4;
    const ww = i === 4 ? 11.6 : 5.7;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: ww, h: 1.2, fill: { color: PAPER }, line: { color: BORDER, width: 1 }, shadow: shadow() });
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: y + 0.32, w: 0.55, h: 0.55, fill: { color: BLUE } });
    s.addText(String(i + 1), { x: x + 0.3, y: y + 0.36, w: 0.55, h: 0.48, fontFace: HEAD, fontSize: 18, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(n[0], { x: x + 1.05, y: y + 0.22, w: ww - 1.3, h: 0.35, fontFace: HEAD, fontSize: 16, bold: true, color: INK, margin: 0 });
    s.addText(n[1], { x: x + 1.05, y: y + 0.58, w: ww - 1.3, h: 0.5, fontFace: BODY, fontSize: 12.5, color: GRAY, margin: 0 });
  });
}

/* ───────────────────────── SLIDE 7 — Embudo ───────────────────────── */
{
  const s = pres.addSlide();
  s.background = { color: PAPER };
  eyebrow(s, 0.9, 0.7, "El recorrido completo", CORAL);
  s.addText("El embudo comercial", {
    x: 0.9, y: 1.05, w: 11.5, h: 0.8, fontFace: HEAD, fontSize: 36, bold: true, color: INK, margin: 0,
  });

  const stages = [
    ["Activación", "W1 · 5 min", "“Mi sitio existe y se ve pro”", CORAL],
    ["Retención", "W2 · gradual", "“Mi sitio vende y posiciona”", BLUE],
    ["Valor percibido", "Nudges", "Schema.org + multilenguaje activos", GREEN],
    ["Venta", "Revisión 30 días", "Conversión a plan pago", CORAL],
    ["Expansión", "Adicionales", "Custom, Blog, Métricas, Premium", INK],
  ];
  const cw = 2.3, gap = 0.18, startX = 0.9, y = 2.6;
  stages.forEach((st, i) => {
    const x = startX + i * (cw + gap);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: cw, h: 3.0, fill: { color: WHITE }, line: { color: BORDER, width: 1 }, shadow: shadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: cw, h: 0.12, fill: { color: st[3] } });
    s.addText(String(i + 1), { x: x + 0.3, y: y + 0.35, w: 1, h: 0.6, fontFace: HEAD, fontSize: 30, bold: true, color: st[3], margin: 0 });
    s.addText(st[0], { x: x + 0.3, y: y + 1.05, w: cw - 0.5, h: 0.4, fontFace: HEAD, fontSize: 17, bold: true, color: INK, margin: 0 });
    s.addText(st[1].toUpperCase(), { x: x + 0.3, y: y + 1.5, w: cw - 0.5, h: 0.3, fontFace: BODY, fontSize: 10, bold: true, color: st[3], charSpacing: 1, margin: 0 });
    s.addText(st[2], { x: x + 0.3, y: y + 1.85, w: cw - 0.55, h: 1.0, fontFace: BODY, fontSize: 12, color: GRAY, lineSpacing: 15, margin: 0 });
    if (i < stages.length - 1) {
      s.addText("→", { x: x + cw - 0.02, y: y + 1.1, w: gap + 0.04, h: 0.6, fontFace: BODY, fontSize: 22, bold: true, color: GRAY, align: "center", valign: "middle", margin: 0 });
    }
  });

  s.addText([
    { text: "El W1 vende la ", options: {} },
    { text: "velocidad", options: { italic: true, bold: true, color: CORAL } },
    { text: ".  El W2 vende el ", options: {} },
    { text: "resultado de negocio", options: { italic: true, bold: true, color: BLUE } },
    { text: " (+38% reservas directas).", options: {} },
  ], { x: 0.9, y: 6.15, w: 11.5, h: 0.5, fontFace: BODY, fontSize: 16, color: INK, align: "center", margin: 0 });
}

/* ───────────────────────── SLIDE 8 — Cierre ───────────────────────── */
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addShape(pres.shapes.OVAL, { x: 0.9, y: 0.85, w: 0.2, h: 0.2, fill: { color: CORAL } });
  s.addText("EL MENSAJE CENTRAL", { x: 1.2, y: 0.75, w: 8, h: 0.4, fontFace: BODY, fontSize: 13, bold: true, color: CORAL, charSpacing: 3, margin: 0 });

  s.addText([
    { text: "3 reservas directas", options: { color: CORAL } },
    { text: " que dejan de ir a Booking", options: { color: WHITE } },
    { text: "\npagan el plan.", options: { color: WHITE } },
  ], { x: 0.9, y: 2.3, w: 11.5, h: 2.4, fontFace: HEAD, fontSize: 50, bold: true, lineSpacing: 56, margin: 0 });

  s.addText("Todo el recorrido — los dos wizards y los nudges — ancla siempre en este número. Es la conversación de cierre más simple y más honesta que tiene el comercial.", {
    x: 0.92, y: 5.0, w: 10.5, h: 1.0, fontFace: BODY, fontSize: 17, color: "CADCFC", lineSpacing: 24, margin: 0,
  });

  s.addText("PXSOL Web · Vertical Web & Marketing para Hoteles", {
    x: 0.92, y: 6.7, w: 11, h: 0.35, fontFace: BODY, fontSize: 12, color: GRAY, margin: 0,
  });
}

pres.writeFile({ fileName: "PXSOL-Web-Wizards-Propuesta-Comercial.pptx" }).then((f) => console.log("OK:", f));
