# Specs — Modo de Creación Full-Screen
## PXSOL Web · Para Figma Make

---

## PATRÓN GENERAL

Cuando el usuario inicia la creación de cualquiera de los siguientes recursos:
- Popup
- Página
- Artículo de blog
- Promoción

La interfaz entra en **modo de creación full-screen**:

- La **icon bar** y la **nav sidebar** desaparecen completamente.
- El **topbar global** se reemplaza por un **topbar de creación** que ocupa el 100% del ancho.
- Al hacer clic en **"← Volver"**, se cierra el modo de creación y la navegación vuelve a aparecer, sin animación compleja, simplemente restaurando el estado anterior.

---

## TOKENS (comunes a todas las pantallas)

```
Canvas:        1280 × 800px
Fuente:        Inter
Fondo general: #F6F6F6

Rojo primario: #E84A2C
Rojo hover:    #C73D22
Rojo faint:    #FEF0ED
Rojo light:    #FADBD8

Superficie:    #FFFFFF
Borde:         #D1D1D1  (0.5px en casi todo)
Fondo body:    #F6F6F6

Texto primario:   #1A1A1A
Texto secundario: #737373
Texto muted:      #A6A6A6

Grises:
  #EFEFEF  (g100)
  #D1D1D1  (g200)
  #A6A6A6  (g400)
  #737373  (g500)
  #545454  (g600)

Verde:     #22C55E  /  bg #DCFCE7  /  tx #166534
Amber:     #C97B0A  /  bg #FEF3DC  /  tx #7A4C09
Teal:      #0FA37F  /  bg #E0F5EE  /  tx #0A6E55
```

---

## ANATOMÍA DEL TOPBAR DE CREACIÓN

**Altura: 48px · Fondo: #FFFFFF · Borde inferior: 1px #D1D1D1 · Ancho: 1280px**

Se divide en 3 zonas horizontales:

```
[← Volver]   [LOGO + Nombre del recurso · Contexto]   [Acciones secundarias · CTA principal]
   izq.                   centro                                      der.
```

### Zona izquierda (desde x=16)
- Botón "← Volver":
  - 76×30px, fondo #EFEFEF, borde 0.5px #D1D1D1, radio 6px
  - Texto: Inter Regular 12px #737373
  - Al hacer clic: cierra el modo full-screen y restaura la navegación

### Zona central (centrada en el topbar)
- Logo PXSOL: cuadrado 20×20px fondo #E84A2C radio 4px + ícono blanco
- Nombre del recurso: Inter Semi Bold 13px #1A1A1A
  - Ej: "Nuevo popup", "Nueva página", "Nuevo artículo", "Nueva promoción"
- Separador "›" #D1D1D1
- Contexto/sitio: Inter Regular 12px #A6A6A6
  - Ej: "academiapx.com"

### Zona derecha (hasta x=1264)
- Botón "Cancelar": ghost, 76×30px fondo #FFF borde 0.5px, Inter Regular 12px #737373
- Botón de acción principal: 
  - Pasos 1 y 2: "Siguiente →" — fondo #E84A2C, radio 6px, 108×30px, Inter Medium 12px #FFF
  - Último paso: "Publicar" o "Guardar" según el flujo — mismo estilo
- Indicador de paso: Inter Regular 11px #A6A6A6 (ej: "Paso 1 de 3")

### Nota sobre la barra de steps (para flujos multi-paso)
Cuando el flujo tiene más de 1 paso, debajo del topbar aparece una **steps bar de 48px** con los pasos numerados:

```
Step completado: círculo 28×28px fondo #22C55E, ✓ blanco, label verde
Step actual:     círculo 28×28px fondo #E84A2C, número blanco, label rojo Semi Bold
Step pendiente:  círculo 28×28px fondo #EFEFEF borde 0.5px #D1D1D1, número #737373, label gris
Conector:        línea 52×1px — gris #D1D1D1 si pendiente, rojo #E84A2C si completado
```

---

## LAYOUT DEL ÁREA DE CREACIÓN

Cuando hay **panel de edición + preview** (Popup, Página, Promoción):

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  TOPBAR DE CREACIÓN (48px)                                                              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  STEPS BAR (48px, solo si es multi-paso)                                               │
├───────────────────────────┬───────────────────────────────────────────────────────────┤
│                           │                                                            │
│   PANEL IZQUIERDO         │              PREVIEW / CANVAS                             │
│   (300px fijo)            │         (resto del ancho, fondo #E8ECF0)                  │
│                           │                                                            │
│   Fondo: #FFFFFF          │                                                            │
│   Borde derecho: 1px      │                                                            │
│   Overflow: scroll        │                                                            │
│                           │                                                            │
│   [breadcrumb row 36px]   │                                                            │
│   [tabs row 34px]         │                                                            │
│   [form scroll]           │                                                            │
│                           │                                                            │
├───────────────────────────┴───────────────────────────────────────────────────────────┤
│  BOTTOM BAR del panel izq. (40px) — indicador de paso + botones nav                   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

Cuando es **flujo de formulario puro** (Blog, configuraciones simples):

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  TOPBAR DE CREACIÓN (48px)                                                              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│   ÁREA DE CONTENIDO CENTRADA — max-width 760px, centrada, padding 32px                 │
│   Fondo: #F6F6F6                                                                        │
│                                                                                         │
│   Cards de sección / campos agrupados por bloque                                       │
│                                                                                         │
│   BOTTOM ACTIONS — borde superior, botones a la derecha, ancho completo                │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## FLUJO 1 — Creación de Popup

**3 pasos · Layout: Panel izquierdo + Preview derecho**

### Paso 1 · Diseño (y=0)
Panel izq. contiene:
- Selector de formato (cards 2-col): **🪟 Popup** / **💬 Toast**
- Campo "Nombre interno" (Inter Regular 12px, placeholder gris)
- Campo "Título" + contador 0/80
- Textarea "Texto descriptivo" con rich toolbar (B I U 🔗)
- Upload de imagen (zona dashed, 272×54px)
- Campos CTA: "Texto del botón *" + "URL de destino *" + select "Abrir en"

Preview derecho: sitio del hotel con popup card centrado sobre overlay semitransparente.
Popup card: imagen top 190×92px + título + descripción + botón verde. Close ✕ fuera del card.

### Paso 2 · Configuración (y=900)
Panel izq. contiene:
- Grilla 3×3 de posición (Centro ★ seleccionado por defecto)
- Banner teal "Centro — recomendado"
- Lista de páginas con checkbox + estados (sel / conflicto / normal)
- Banner amber si hay conflicto

### Paso 3 · Reglas de display (y=1800)
Panel izq. contiene:
- Grilla 3×2 de trigger cards (Demora / Exit intent / Scroll / On-click / Inactividad / JS-Pro)
- Config contextual según trigger activo (campo de segundos, banner desktop, campo de %)
- Cards de dispositivo (💻 Desktop / 📱 Mobile)
- Acordeón "Frecuencia de visualización" (1× por sesión / Siempre)
- Acordeón "Page targeting"

Botón final: "Publicar ahora ✓" (fondo #E84A2C)

---

## FLUJO 2 — Creación de Página

**3 pasos · Layout: Panel izquierdo + Preview derecho**

### Paso 1 · Información básica (y=2700)
**Topbar de creación:**
- Centro: Logo + "Nueva página · academiapx.com"
- Steps: 1=Información · 2=Contenido · 3=SEO & Publicación

**Panel izquierdo:**

Sección IDENTIFICACIÓN:
- Campo "Nombre de la página *"
  - Placeholder: "Ej: Habitaciones, Contacto, Ofertas"
  - Hint: "El nombre aparece en el menú de navegación del sitio"
- Campo "URL (slug) *"
  - Prefix fijo no editable: "academiapx.com /"  (fondo #EFEFEF radio 6px 0 0 6px)
  - Input: fondo #FFF, radio 0 6px 6px 0
  - Placeholder: "habitaciones"
  - Hint: "Solo letras minúsculas, números y guiones. Sin espacios."

Sección TEMPLATE:
- 3 cards en columna (og1), cada una 272×56px radio 8px:
  - **🏗 En blanco** (seleccionada): fondo #FEF0ED borde #E84A2C
    - Título: Inter Semi Bold 12px
    - Desc: "Comenzá con una página vacía"
  - **📋 Desde template**: fondo #FFF borde #D1D1D1
    - Desc: "Usá un diseño existente como base"
  - **📄 Duplicar página**: fondo #FFF borde #D1D1D1
    - Desc: "Copiá una página ya publicada"

Sección IDIOMA:
- Select "Español (ES)" — ancho 272px

**Preview derecho:**
- Browser chrome
- Sitio del hotel con la estructura actual visible
- Overlay de nueva página en estado vacío: rectángulo punteado centrado con ícono + "Tu nueva página aparecerá aquí"

### Paso 2 · Contenido (y=3600)
**Panel izquierdo:**

Sección SECCIONES:
- Lista de secciones disponibles para agregar:
  - Card 272×48px, fondo #FFF borde 0.5px, radio 8px, drag handle a la izquierda
  - Ícono de sección + nombre + descripción corta
  - Ejemplos: Hero, Galería, Texto & Imagen, Formulario de Contacto, Habitaciones, CTA
  - Cada card tiene botón "+" a la derecha para agregarla

Sección ORDEN DE SECCIONES (si ya se agregaron):
- Lista reordenable con handle ≡ a la izquierda
- Cada ítem: nombre de sección + botón 🗑

**Preview derecho:**
- Página construyéndose en tiempo real
- Secciones apiladas verticalmente dentro del browser preview

### Paso 3 · SEO & Publicación (y=4500)
**Panel izquierdo:**

Sección SEO:
- Campo "Título SEO" + contador 0/60
  - Hint: "Aparece en el resultado de búsqueda de Google"
- Campo "Meta descripción" textarea + contador 0/160
- Campo "URL canónica" (pre-rellena con el slug del paso 1, editable)

Sección IMAGEN OG:
- Upload zone 272×80px (para imagen de redes sociales)

Sección VISIBILIDAD:
- Toggle "Indexar en buscadores" (ON por defecto)
- Toggle "Mostrar en menú de navegación" (ON por defecto)

Sección PUBLICACIÓN:
- 2 cards lado a lado:
  - **Publicar ahora**: fondo #FEF0ED borde #E84A2C, seleccionada
  - **Programar**: fondo #FFF, si se selecciona aparece date picker

**Bottom actions:**
- Texto muted: "Completar después"
- Botón "← Anterior" ghost
- Botón "Publicar página" — fondo #E84A2C

---

## FLUJO 3 — Creación de Artículo de Blog

**2 pasos · Layout: Formulario centrado (sin preview)**

### Paso 1 · Contenido (y=5400)
**Topbar de creación:**
- Centro: Logo + "Nuevo artículo · Blog"
- Indicador "Paso 1 de 2" (sin steps visuales, flujo simple)
- Derecha: "Cancelar" + "Siguiente →"

**Área central — max-width 760px, centrada, padding 32px top:**

Card blanca radio 8px borde 0.5px, padding 28px:

Sección sin título (identificación):
- Campo "Título del artículo *" — input grande, font-size 16px placeholder, sin label visible
  - Placeholder: "Escribí el título de tu artículo…"
  - Hint debajo: Inter Regular 10px #A6A6A6 "Aparecerá como título en el blog y en buscadores"
- Campo "Extracto / descripción corta"
  - Textarea 3 filas
  - Hint: "Breve resumen que aparece en la lista del blog y en Google"

Sección IMAGEN DE PORTADA:
- Upload zone ancho completo 704×120px, fondo #F6F6F6 borde dashed 1px #D1D1D1, radio 8px
- Ícono 🖼 + "Subir imagen de portada" + "JPG/PNG · 1200×630 px recomendado · máx. 5 MB"
- Si hay imagen subida: preview de la imagen con botón ✕ para quitar

Sección CONTENIDO:
- Editor de texto rico (bloque completo ancho 704px):
  - Toolbar superior: B I U | H1 H2 H3 | Lista ul / ol | 🔗 | Imagen | Cita
  - Área editable: min-height 200px, fondo #FFF borde 0.5px borde superior none, radio 0 0 8px 8px
  - Placeholder: "Escribí el contenido del artículo aquí…"

Sección CATEGORÍA:
- Select múltiple "Seleccioná una o más categorías"
  - Tags seleccionados se muestran como chips rojos con ✕

Sección ETIQUETAS:
- Input "Agregar etiqueta…" + Enter para confirmar
  - Tags aparecen como chips grises con ✕

### Paso 2 · SEO & Publicación (y=6300)
**Área central — misma estructura:**

Card 1 — SEO:
- "Título SEO *" + contador 0/60 (pre-rellena con el título del artículo)
- "Meta descripción" textarea + contador 0/160 (pre-rellena con el extracto)
- "URL (slug) *" con prefix "academiapx.com/blog/"

Card 2 — Imagen OG:
- Upload zone 704×80px
- Hint: "Si no subís imagen, se usará la imagen de portada del artículo"

Card 3 — Publicación:
- "Autor": avatar + nombre del autor logueado (editable via select)
- "Fecha de publicación": date picker (default: hoy)
- Toggle "Publicar en redes sociales" (si hay integración conectada)
- 3 opciones de estado (radio buttons grandes):
  - **Publicar ahora**: fondo #DCFCE7 borde #22C55E seleccionada
  - **Guardar como borrador**: fondo #FFF
  - **Programar publicación**: fondo #FFF → muestra date+time picker

**Bottom actions (fijo al fondo, ancho completo, borde superior, fondo #FFF, padding 14px 32px):**
- Izquierda: "← Anterior" ghost + "Completar después" texto muted
- Derecha: "Publicar artículo" — fondo #E84A2C 130×32px radio 6px

---

## FLUJO 4 — Creación de Promoción

**3 pasos · Layout: Panel izquierdo + Preview derecho**
*Interfaz nueva — no existe en el producto actual*

### Paso 1 · Detalle de la promoción (y=7200)
**Topbar de creación:**
- Centro: Logo + "Nueva promoción · academiapx.com"
- Steps: 1=Detalle · 2=Condiciones · 3=Distribución

**Panel izquierdo:**

Sección IDENTIFICACIÓN:
- Campo "Nombre interno *"
  - Placeholder: "Ej: Promo Semana Santa 2025"
  - Hint: "Solo visible para vos, no lo ven los huéspedes"
- Campo "Nombre visible para el huésped *"
  - Placeholder: "Ej: 20% OFF en estadías de 3+ noches"

Sección TIPO DE PROMOCIÓN:
- 3 cards en columna (og1), cada una 272×60px radio 8px:
  - **% Descuento** (seleccionada): "Porcentaje de descuento sobre la tarifa base"
  - **Precio fijo**: "Precio especial independiente de la tarifa"
  - **Noche gratis**: "Ej: 2 noches + 1 gratis"

Sección VALOR DE LA PROMOCIÓN (dinámico según tipo):
- Si "% Descuento":
  - Input numérico grande + "%" — ej: "20 %"
  - Slider visual de 0 a 100
- Si "Precio fijo":
  - Input con símbolo de moneda "$ ___"
  - Select de moneda: ARS / USD / EUR
- Si "Noche gratis":
  - "Cada ___ noches, ___ gratis" (2 inputs numéricos en fila)

Sección DESCRIPCIÓN:
- Textarea 3 filas
- Hint: "Esta descripción puede aparecer en el widget de reservas y popups"

**Preview derecho:**
- Browser chrome
- Vista del motor de reservas del hotel mostrando:
  - Card de habitación con badge de promoción superpuesto
  - Precio tachado + precio con descuento aplicado
- Badge de promoción: fondo #E84A2C radio 4px, texto blanco 10px Semi Bold

### Paso 2 · Condiciones (y=8100)
**Panel izquierdo:**

Sección VIGENCIA:
- Date range picker: "Desde" — "Hasta"
  - 2 inputs de fecha en fila (cada uno 126px), separados por guion
  - Toggle "Sin fecha de vencimiento" — si ON, oculta el campo "Hasta"

Sección ANTICIPACIÓN MÍNIMA:
- Toggle "Requiere anticipación mínima"
  - Si ON: input "Con al menos ___ días de anticipación"

Sección ESTADÍA MÍNIMA:
- Toggle "Requiere estadía mínima"
  - Si ON: input "___ noches mínimo"

Sección HABITACIONES APLICABLES:
- Checkboxes en columna (una por habitación del sitio):
  - "Todas las habitaciones" (checkeado por defecto)
  - O selección individual

Sección LÍMITE DE USOS:
- Toggle "Limitar cantidad de reservas"
  - Si ON: input "Máximo ___ reservas con esta promoción"

**Preview derecho:** misma vista del motor de reservas con condiciones indicadas visualmente.

### Paso 3 · Distribución (y=9000)
**Panel izquierdo:**

Sección ¿DÓNDE MOSTRAR ESTA PROMOCIÓN?:
Banner teal informativo:
"Esta promoción puede mostrarse en el motor de reservas, en popups del sitio y en la página de inicio."

6 toggle rows (cada uno 272×44px, borde 0.5px, radio 8px, margin-bottom 7px):

| Toggle | Label | Sub-label |
|--------|-------|-----------|
| ✅ ON | Motor de reservas | Aparece como tarifa destacada |
| ✅ ON | Página de inicio | En la sección de promociones |
| ⬜ OFF | Popup del sitio | Seleccioná un popup existente |
| ⬜ OFF | Banner superior | Franja fija en el tope del sitio |
| ⬜ OFF | Email marketing | Requiere integración conectada |
| ⬜ OFF | Redes sociales | Requiere integración conectada |

Si "Popup del sitio" = ON:
- Aparece inline debajo del toggle un select "Seleccioná un popup" con los popups activos del sitio

Si "Email marketing" u otro con integración = OFF y sin integración:
- Badge "Conectar" en amber junto al toggle

Sección CÓDIGO PROMOCIONAL (opcional):
- Toggle "Generar código de descuento"
  - Si ON:
    - Input "Código" con botón "Generar automático"
    - Hint: "Los huéspedes ingresan este código en el checkout para aplicar el descuento"

**Bottom actions:**
- "Completar después" texto muted
- "← Anterior" ghost
- "Activar promoción" — fondo #E84A2C

---

## ESTADOS DE VALIDACIÓN (comunes a todos los flujos)

```
Campo requerido vacío al avanzar:
  - Borde del input: 1px #E84A2C
  - Fondo del input: #FEF0ED
  - Banner error debajo: borde izq. 3px #E84A2C, fondo #FADBD8
    - Texto: Inter Semi Bold 10px #7B241C — "Este campo es requerido"
  - El wizard no avanza hasta que se completen todos los requeridos

Campo con formato inválido (URL, email, etc.):
  - Mismo estilo visual que campo vacío
  - Texto del banner: "Ingresá un valor válido (ej: https://…)"

Conflicto de datos (ej: popup en página ocupada):
  - Banner amber en el ítem afectado
  - El wizard permite avanzar con advertencia, no bloquea
```

---

## TRANSICIÓN ENTRE MODO NORMAL Y MODO CREACIÓN

### Entrar al modo creación
Trigger: clic en "+ Nuevo popup", "+ Nueva página", "+ Nuevo artículo", "+ Nueva promoción"

Lo que cambia visualmente:
1. Icon bar (48px) desaparece
2. Nav sidebar (192px) desaparece
3. El topbar global (40px) se reemplaza por el topbar de creación (48px)
4. El área de contenido pasa a ocupar **1280px de ancho completo**
5. No hay animación de slide — es un swap inmediato de layout

### Salir del modo creación
Trigger: clic en "← Volver" o "Cancelar"

1. Si hay cambios no guardados: mostrar modal de confirmación
   - "¿Seguro que querés salir? Perderás los cambios no guardados."
   - Botones: "Seguir editando" (ghost) + "Salir sin guardar" (rojo)
2. Si no hay cambios: volver directamente
3. El layout vuelve a la vista anterior con navegación restaurada

### Modal de confirmación de salida
- Overlay: rgba(0,0,0,0.4)
- Card centrado: 380×180px, fondo #FFF, radio 10px, sombra 0 16px 48px rgba(0,0,0,0.18)
- Título: Inter Semi Bold 15px #1A1A1A
- Descripción: Inter Regular 13px #737373
- Botones: alineados a la derecha, gap 8px

---

## PANTALLAS A GENERAR EN FIGMA (resumen)

| Frame | Nombre | Canvas | y |
|-------|--------|--------|---|
| Lista Popups | 09 · Lista de Popups | 1280×800 | 0 |
| Crear Popup P1 | 09b · Crear Popup — Diseño | 1280×800 | 900 |
| Crear Popup P2 | 09c · Crear Popup — Configuración | 1280×800 | 1800 |
| Crear Popup P3 | 09d · Crear Popup — Display Rules | 1280×800 | 2700 |
| Lista Páginas | 10 · Lista de Páginas | 1280×800 | 3600 |
| Crear Página P1 | 10b · Crear Página — Info básica | 1280×800 | 4500 |
| Crear Página P2 | 10c · Crear Página — Contenido | 1280×800 | 5400 |
| Crear Página P3 | 10d · Crear Página — SEO & Publicación | 1280×800 | 6300 |
| Lista Blog | 11 · Lista de Artículos | 1280×800 | 7200 |
| Crear Blog P1 | 11b · Crear Artículo — Contenido | 1280×800 | 8100 |
| Crear Blog P2 | 11c · Crear Artículo — SEO & Publicación | 1280×800 | 9000 |
| Lista Promos | 12 · Lista de Promociones | 1280×800 | 9900 |
| Crear Promo P1 | 12b · Crear Promoción — Detalle | 1280×800 | 10800 |
| Crear Promo P2 | 12c · Crear Promoción — Condiciones | 1280×800 | 11700 |
| Crear Promo P3 | 12d · Crear Promoción — Distribución | 1280×800 | 12600 |
| Modal salida | Modal — Confirmar salida | 1280×800 | 13500 |

---

## NOTA FINAL PARA FIGMA MAKE

El cambio de layout entre modo normal y modo creación es lo más importante del sistema.
La clave es: **sin navegación = el usuario está enfocado en crear**. 
El botón "← Volver" es el único escape, y siempre está en el extremo izquierdo del topbar.

Todos los wizards de creación usan el mismo shell de topbar, la misma steps bar y el mismo patrón de panel izquierdo + preview derecho (salvo el blog que es formulario centrado). Esto garantiza que aprender un flow significa aprender todos.