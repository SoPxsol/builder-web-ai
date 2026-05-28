# Figma Make — Prompt · Wizard 2 · Post-Onboarding PXSOL Web

Creá un frame de diseño de 1280×800px que represente el **Wizard de Configuración Completa (Post-Onboarding) de PXSOL Web** — la sección 5 de 8 ("SEO y Schema.org"). Es un modal full screen que se abre como overlay sobre el editor.

---

## Estructura general

El frame tiene dos capas:

**1. Fondo — Editor PXSOL Web (difuminado detrás del overlay)**
Mostrá el chrome del editor con opacidad reducida:
- Topbar blanca h:40px con logo mark cuadrado #E84A2C (20×20 r:4) + texto "PXSOL Web" Inter Semi Bold 11px #1A1A1A + avatar circular SG derecha
- Icon sidebar w:48px bg:#111111 con íconos grises
- Nav sidebar w:192px bg:#1A1A1A con ítems en #8C8C8C
- Content area bg:#F6F6F6
Aplicá un rectángulo negro @60% de opacidad encima de todo el fondo.

**2. Modal — overlay centrado**
- Tamaño: 1160×740px
- Centrado en el frame (x:60px y:30px aprox.)
- bg:#FFFFFF
- border-radius: 12px
- shadow: 0 8px 32px rgba(0,0,0,0.24)
- overflow: hidden

---

## Modal — estructura interna

### Modal Header (h:48px)
bg:#FFFFFF border-bottom:#D1D1D1 1px padding:0 16px flex align-center justify-space-between

- Izquierda: logo mark 20×20 #E84A2C r:4 + "PXSOL Web" Inter Semi Bold 11px #1A1A1A gap:8px
- Centro: "Configuración completa · Sección 5 de 8" Inter Semi Bold 14px #1A1A1A
- Derecha: botón X 24×24 #737373

### Body del modal
Altura disponible: 692px (740 - 48 header)
Layout: **3 columnas**

- Progress sidebar: 196px bg:#1A1A1A border-right:#333 1px
- Panel formulario: 484px bg:#FFFFFF
- Panel preview: 480px bg:#F6F6F6 border-left:#D1D1D1 1px

---

## Columna izquierda — Progress Sidebar

### Header del sidebar
padding:16px border-bottom:#333 1px

"Tu progreso" Inter Semi Bold 13px #FFFFFF mb:8px

Progress bar: full-width × 3px bg:#333 r:2 mb:5px
  Fill: ~50% bg:#E84A2C r:2 (4 de 8 secciones completas)

Row flex justify-space-between:
  "4 de 8" Inter Regular 10px #4D4D4D
  "50%" Inter Regular 10px #E84A2C

### Ítems de navegación

**Estructura de cada ítem:**
h:32px padding:7px 14px border-left:2px solid transparent
flex align-center gap:7px cursor:pointer

Dot 18×18 r:9:
- done: bg:#22C55E border:#22C55E glyph "✓" 7px #FFF
- active: bg:#E84A2C border:#E84A2C número 8px #FFF
- pending: bg:#333 border:#444 número 8px #737373

Label Inter 11px:
- active: #FFFFFF fw:500
- done: #737373 fw:400
- pending: #8C8C8C fw:400

Timing Inter 9px #4D4D4D (right, ml:auto)

Active item: bg:#2A2A2A border-left-color:#E84A2C

**Group label:**
padding:10px 14px 3px border-top:#333 1px (excepto el primero)
Inter Semi Bold 9px #4D4D4D UPPERCASE letter-spacing:0.06em

**Listado completo con estados — frame muestra sección 5 activa:**

GRUPO "📅 PARA LANZAR · SEMANA 1"
  ✓  Perfil completo         timing "Semana 1"   [done]
  ✓  Redes sociales          timing "Semana 1"   [done]
  ✓  Ubicación y POI         timing "Semana 1"   [done]
  →  SEO y Schema.org        timing "Semana 1"   [active]

GRUPO "📈 PARA CRECER · MES 1-3"
  ○  Páginas adicionales     timing "Mes 1-3"    [pending]
  ○  Idiomas y monedas       timing "Mes 1-3"    [pending]
  ○  Políticas y pagos       timing "Mes 1-3"    [pending]
  ○  Lanzamiento             timing ""           [pending]

---

## Columna central — Formulario SEO y Schema.org

padding:20px 24px overflow-y:auto height:100%

### Eyebrow badge
"📅 Para lanzar esta semana"
bg:#FEF2F2 border:#FECACA 0.5px r:3 padding:1px 8px
Inter Regular 9px #991B1B mb:6px display:inline-flex

### Título y descripción
"SEO y Schema.org" Inter Semi Bold 14px #1A1A1A mb:2px
"Los títulos SEO son lo que Google muestra. Schema.org es lo que permite que la IA cite el hotel."
Inter Regular 11px #737373 lineHeight:1.5 mb:16px

### Divider label
"Meta title y description"
Inter Semi Bold 10px #A6A6A6 UPPERCASE letter-spacing:0.06em
border-bottom:#D1D1D1 0.5px pb:5px mb:8px

### SEO Cards (3 cards idénticas en estructura)

**Card "Inicio"** — con valores precargados por IA:

border:#D1D1D1 0.5px r:5 overflow:hidden mb:8px

Card header: h:32px bg:#F6F6F6 border-bottom:#D1D1D1 0.5px padding:0 10px
flex align-center justify-space-between
  "Inicio" Inter Medium 11px #373737
  Mini-btn "✨ Generar con IA":
    bg:#FFF7ED border:#FDBA74 0.5px r:3 padding:2px 7px
    ícono sparkles 9px + "Generar con IA" Inter Medium 9px #9A3412

Card body: padding:8px 10px flex flex-column gap:5px
  Input título: full-width h:26px bg:#FFFFFF border:#D1D1D1 0.5px r:4 padding:0 8px
    Valor: "Hotel Plaza Mayor · Córdoba · Mejor precio directo"
    Inter Regular 11px #1A1A1A
  Input descripción: full-width h:26px bg:#FFFFFF border:#D1D1D1 0.5px r:4 padding:0 8px
    placeholder: "Descripción · máx. 155 caracteres · resumen en Google"
    Inter Regular 11px #A6A6A6 (placeholder)

**Card "Habitaciones"**:
Misma estructura.
Input título valor: "Habitaciones · Hotel Plaza Mayor Córdoba · Suites y habitaciones boutique"
Input descripción: placeholder vacío

**Card "Contacto"**:
Misma estructura.
Input título valor: "Contacto · Hotel Plaza Mayor"
Input descripción: placeholder vacío

### Divider label
"Datos estructurados"
(mismo estilo que el anterior)

### Toggle row — Schema.org Hotel (estado: ON)

h:56px full-width bg:#F6F6F6 border:#D1D1D1 0.5px r:5
padding:0 10px flex align-center gap:10px mb:6px

Cuerpo flex:1:
  Row flex align-center gap:4px:
    "Schema.org Hotel" Inter Medium 12px #1A1A1A
    Badge "Alta prioridad":
      bg:#F5F3FF border:#C4B5FD 0.5px r:3 padding:1px 5px
      Inter Regular 9px #6D28D9
  Sub: "ChatGPT, Perplexity y Google AI citan hoteles con Schema.org activo."
    Inter Regular 10px #737373 lineHeight:1.4 mt:1px

Toggle switch — estado ON:
  28×16 bg:#E84A2C r:8
  Pill: 12×12 bg:#FFFFFF r:6 x:14px shadow:0 1px 2px rgba(0,0,0,0.2)

### Toggle row — GEO · AI Discovery (estado: OFF)

Misma estructura que el anterior.

"GEO · AI Discovery" Inter Medium 12px #1A1A1A
Badge "Recomendado":
  bg:#FFF7ED border:#FDBA74 0.5px r:3 padding:1px 5px
  Inter Regular 9px #9A3412

Sub: "Genera llms.txt y FAQs para optimizar la citación por IA."
Inter Regular 10px #737373

Toggle switch — estado OFF:
  28×16 bg:#D1D1D1 r:8
  Pill: 12×12 bg:#FFFFFF r:6 x:2px

### Nota del asesor (al fondo del panel, colapsada)

Toggle bar: full-width h:36px bg:#EFF6FF border-top:#BFDBFE 1px
flex align-center gap:6px padding:0 20px cursor:pointer
- Ícono headset 12px #1D4ED8
- "Nota del asesor" Inter Semi Bold 10px #1D4ED8
- Chevron "∨" 10px ml:auto

Body colapsado — mostrar como cerrado en el frame.
Texto cuando se expande:
"Schema.org Hotel es la diferencia entre aparecer o no en los resultados de IA. Si hay que priorizar una sola acción de SEO, es esta."

### Footer del panel
h:52px border-top:#D1D1D1 1px bg:#FFFFFF padding:0 24px
flex align-center justify-space-between

- Btn "← Anterior": 80×28 bg:#EFEFEF border:#D1D1D1 0.5px r:5 Inter Regular 11px #737373
- Link "Omitir": Inter Regular 11px #A6A6A6
- Btn "Continuar →": 90×28 bg:#E84A2C r:6 Inter Medium 11px #FFFFFF

---

## Columna derecha — Preview en vivo

bg:#F6F6F6 border-left:#D1D1D1 1px width:480px height:100%

### Preview bar
h:36px bg:#FFFFFF border-bottom:#D1D1D1 1px padding:0 12px
flex align-center justify-space-between

- Dot live 6×6 bg:#22C55E r:3 + "Preview en vivo" Inter Medium 11px #737373 gap:5px
- Label sección: "Resultados de Google" Inter Regular 10px #A6A6A6
- 3 botones breakpoint: 22×22 bg:#EFEFEF border:#D1D1D1 0.5px r:4
  Desktop activo (#1A1A1A) · Tablet y Mobile inactivos (#737373)

### Viewport preview
bg:#DDDBD6 padding:12px
Mini-sitio centrado: 440×510px bg:#FFFFFF r:6 border:0.5px solid rgba(0,0,0,0.10) overflow:hidden

#### Header del sitio
h:26px bg:#1A1A2E padding:0 8px flex align-center justify-space-between
- Logo "Hotel Plaza Mayor" Inter Semi Bold 8px #FFF (max 100px)
- Nav: "Inicio" "Habitaciones" "Contacto" 7px #FFF @50% gap:6px
- CTA "Reservar" 56×14 bg:#E84A2C r:2 7px #FFF

#### Hero
h:70px bg:#1A1A2E flex flex-column align-center justify-center position:relative
- Título: "Bienvenidos al Hotel Plaza Mayor" Inter Semi Bold 10px #FFF text-center
- Sub: "Córdoba · Boutique · Desde 1998" 7px #FFF @70% text-center
- CTA: 70×14 bg:#E84A2C r:2 "Reservar ahora" 7px #FFF centrado
- Badge "Foto de ejemplo" bottom-right: bg:#000 @45% r:2 7px #FDBA74

#### Sección SEO — highlight especial de esta sección
h:54px bg:#F9F9F9 border-top:#F0F0F0 0.5px padding:7px 9px

  Título SEO: "Hotel Plaza Mayor · Córdoba · Mejor precio directo"
    Inter Regular 7px #1A0AAB (azul Google)
  URL: "hotelplazamayor.com"
    Inter Regular 6px #0A6B0A (verde Google)
  Descripción placeholder (campo vacío):
    línea rayada gris 6px simulando texto vacío

  Schema badge (toggle ON activado):
    bg:#F0FDF4 border:#BBF7D0 0.5px r:2 padding:2px 6px mt:4px display:inline-flex
    "✓ Schema.org Hotel activo" 6px #15803D

#### Servicios
h:44px bg:#FFFFFF border-top:#F0F0F0 0.5px padding:6px
- "Servicios" 8px Semi Bold #444 text-center mb:4px
- 4 chips: 52×15 bg:#F9F9F9 border:#EEE 0.5px r:3 gap:3px
  "WiFi" "Desayuno" "Piscina" "Parking" 7px #555

#### Habitaciones
h:52px bg:#1A1A1A padding:6px
- "Habitaciones" 8px Semi Bold #FFF text-center mb:4px
- 3 cards gap:4px: 80×26 bg:#FFF r:3 border:#333 0.5px
  Imagen top: 80×14 colores #B5D4F4 / #F5C4B3 / #9FE1CB
  Nombre: 6px #333 "Suite Superior" / "Hab. Estándar" / "Familiar"

#### Idiomas (visible porque se activó inglés en una sección previa)
h:34px bg:#FFFFFF border-top:#F0F0F0 0.5px padding:5px
- "Disponible en" 8px Semi Bold #444 text-center mb:3px
- Chips: "ES" "EN" cada uno: bg:#F6F6F6 border:#EEE r:2 7px #666
  + chip "ARS": bg:#EFF6FF border:#EEE r:2 7px #666

#### Contacto
h:50px bg:#FFFFFF border-top:#F0F0F0 0.5px padding:6px
- "Contacto" 8px Semi Bold #444 text-center mb:3px
- "📍 Av. Colón 123, Córdoba" 7px #666
- Mapa: full-width × 20px bg:#E5F3E8 r:3 "Mapa automático" 7px #15803D text-center

---

## Tokens de color resumidos

```
#E84A2C  coral principal
#1A1A1A  texto primario / nav sidebar bg
#737373  texto secundario
#A6A6A6  texto terciario
#D1D1D1  borders
#F6F6F6  fondos secundarios
#FFFFFF  superficies
#22C55E  verde paso done
#16A34A  verde oscuro
#F0FDF4  verde claro
#BBF7D0  verde border
#FFF7ED  ámbar claro
#FDBA74  ámbar border
#9A3412  ámbar texto
#EFF6FF  azul claro (asesor)
#BFDBFE  azul border
#1D4ED8  azul texto
#F5F3FF  púrpura claro
#C4B5FD  púrpura border
#6D28D9  púrpura texto
#111111  icon sidebar bg
#2A2A2A  item activo bg
#333333  sidebar borders
#4D4D4D  sidebar labels
#8C8C8C  sidebar items
#1A0AAB  azul Google (SEO)
#0A6B0A  verde Google (SEO)
```

## Tipografía

Fuente única: **Inter**
- Regular: hints, placeholders, descripciones
- Medium: labels, botones, valores
- Semi Bold: títulos principales, headers de sidebar

---

## Notas finales para Figma Make

- Todos los borders de cards e inputs son **0.5px**, no 1px.
- El modal tiene 3 columnas: sidebar de progreso (oscura), formulario (blanco) y preview (gris claro).
- La progress sidebar usa fondo #1A1A1A igual que el nav del editor — es un lenguaje visual consistente.
- Los group labels del sidebar ("PARA LANZAR", "PARA CRECER") separan visualmente los dos ritmos del wizard.
- El ítem activo en el sidebar tiene border-left coral 2px — es el único indicador de posición.
- Los toggles de Schema.org (ON) y GEO (OFF) deben mostrar claramente su estado con el pill en posición correcta.
- La sección SEO del mini-sitio en la preview debe tener el estilo visual de un resultado de Google (azul para el título, verde para la URL).
- La nota del asesor va siempre colapsada en el estado por defecto del frame.
- El fondo del editor detrás del overlay debe verse pero estar oscurecido con #000 @60%.