# Figma Make — Prompt · Wizard 1 · Onboarding PXSOL Web

Creá un frame de diseño de 1280×800px que represente el **Wizard de Onboarding de PXSOL Web** — el paso 2 de 5 ("Tu marca en pantalla"). Es un modal full screen que se abre como overlay sobre el editor.

---

## Estructura general

El frame tiene dos capas:

**1. Fondo — Editor PXSOL Web (difuminado detrás del overlay)**
Mostrá el chrome del editor con opacidad reducida:
- Topbar blanca h:40px con logo mark cuadrado #E84A2C (20×20 r:4) + texto "PXSOL Web" Inter Semi Bold 11px #1A1A1A + avatar circular SG derecha
- Icon sidebar w:48px bg:#111111 con íconos grises
- Nav sidebar w:192px bg:#1A1A1A con ítems "Dashboard" (activo, bg:#2A2A2A) · "Mis Sitios" · "Templates" en Inter 12px #8C8C8C
- Content area bg:#F6F6F6 (resto del ancho)
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
- Centro: "Lanzá tu sitio · Paso 2 de 5" Inter Semi Bold 14px #1A1A1A
- Derecha: "~10 min con el asesor" Inter Regular 11px #A6A6A6 + botón X 24×24 #737373 ml:12px

### Step Trail (h:48px)
bg:#FFFFFF border-bottom:#D1D1D1 1px
5 pasos centrados con líneas conectoras. Spacing entre dots: 190px. Centrado horizontalmente en el modal.

Dots:
- Done (paso 1): 28×28 r:14 bg:#22C55E glyph "✓" Inter Medium 12px #FFF
- Active (paso 2): 28×28 r:14 bg:#E84A2C número "2" Inter Medium 12px #FFF
- Pending (pasos 3-5): 28×28 r:14 bg:#EFEFEF border:#D1D1D1 0.5px número #737373

Labels debajo de cada dot:
- Done: Inter Regular 10px #22C55E
- Active: Inter Medium 10px #E84A2C + underline 2px #E84A2C
- Pending: Inter Regular 10px #737373

Líneas conectoras:
- Done→Active: h:1px bg:#E84A2C
- Active→Pending: h:1px bg:#D1D1D1

Pasos: "Template" [done] · "Identidad" [active] · "Info & contacto" [pending] · "Habitaciones" [pending] · "Lanzamiento" [pending]

### Body del modal
Altura disponible: 644px (740 - 48 header - 48 trail)
Layout: dos columnas separadas por border-right:#D1D1D1 1px

Columna izquierda: 700px — formulario
Columna derecha: 460px — preview en vivo

---

## Columna izquierda — "Tu marca en pantalla"

padding:20px 24px overflow-y:auto

### Micro-logro banner (visible, logo ya subido)
h:40px full-width bg:#F0FDF4 border:#BBF7D0 0.5px r:6 mb:14px
flex align-center gap:8px padding:0 12px
- Check circle: 22×22 bg:#22C55E r:11 glyph "✓" 11px #FFF
- "¡Tu hotel tiene cara propia! El logo ya está aplicado." Inter Medium 12px #15803D

### Campo: Logo del hotel
Label: "Logo del hotel" Inter Medium 11px #373737 mb:4px

Upload zone — estado CARGADO (logo subido):
h:80px full-width bg:#F0FDF4 border:#BBF7D0 1px dashed r:6
flex flex-column align-center justify-center gap:4px
- Glyph "✓" 20px #16A34A
- "Logo cargado ✓" Inter Medium 11px #16A34A
mb:14px

### Campo: Foto de portada
Label: "Foto de portada" Inter Medium 11px #373737 mb:4px

Upload zone — estado PLACEHOLDER (foto de ejemplo activa):
h:80px full-width bg:#FFF7ED border:#FED7AA 1px dashed r:6
flex flex-column align-center justify-center gap:4px
- Glyph cámara 18px #F59E0B
- "Subir tu foto" Inter Medium 11px #9A3412
- Badge: "Foto de ejemplo activa · cargá la tuya después"
  bg:#FFF7ED border:#FDBA74 0.5px r:3 padding:2px 8px
  Inter Regular 9px #9A3412

Hint: "JPG o WEBP · mín. 1920×1080 · La foto de ejemplo se reemplaza al subir la tuya."
Inter Regular 10px #A6A6A6 mt:4px mb:14px

### Campo: Colores de marca
Label: "Colores de marca" Inter Medium 11px #373737 mb:4px
Link: "🎨 Detectar colores del logo" Inter Medium 11px #E84A2C mb:8px

Color primario:
"Color primario" 10px #737373 mb:3px
Row flex gap:6px align-center:
- Swatch 28×28 bg:#E84A2C r:5
- Value box: 90×28 bg:#F6F6F6 border:#D1D1D1 0.5px r:5 padding:0 8px
  "#E84A2C" Inter Regular 11px #1A1A1A

Color secundario (mt:8px):
"Color secundario" 10px #737373 mb:3px
Row flex gap:6px align-center:
- Swatch 28×28 bg:#1A1A2E r:5
- Value box: 90×28 bg:#F6F6F6 border:#D1D1D1 0.5px r:5
  "#1A1A2E" Inter Regular 11px #1A1A1A

Hint: "Hacé click en el color para cambiarlo. Se aplican automáticamente en toda la web."
10px #A6A6A6 mt:6px

### Nota del asesor (al fondo del panel, colapsada)
Pegada al footer. Toggle bar:
h:36px full-width bg:#EFF6FF border-top:#BFDBFE 1px
flex align-center gap:6px padding:0 20px cursor:pointer
- Ícono headset 12px #1D4ED8
- "Nota del asesor" Inter Semi Bold 10px #1D4ED8
- Chevron "∨" 10px #1D4ED8 ml:auto

Body (colapsado por defecto, mostrar como colapsado en el frame):
bg:#EFF6FF padding:0 20px 12px
Inter Regular 11px #1D4ED8 lineHeight:1.6
Texto: "Si el hotelero no tiene el logo a mano, avanzar igual — hay foto de ejemplo activa. El logo se puede subir después desde el editor en 2 minutos."

### Footer del panel izquierdo
h:52px border-top:#D1D1D1 1px bg:#FFFFFF padding:0 24px
flex align-center justify-space-between

- Btn "← Anterior": 80×28 bg:#EFEFEF border:#D1D1D1 0.5px r:5 Inter Regular 11px #737373
- Link "Completar después": Inter Regular 11px #A6A6A6
- Btn "Siguiente →": 90×28 bg:#E84A2C r:6 Inter Medium 11px #FFFFFF

---

## Columna derecha — Preview en vivo

bg:#F6F6F6 border-left:#D1D1D1 1px width:460px height:100%

### Preview bar
h:36px bg:#FFFFFF border-bottom:#D1D1D1 1px padding:0 12px
flex align-center justify-space-between

- Dot live 6×6 bg:#22C55E r:3 + "Tu sitio en vivo" Inter Medium 11px #737373 gap:5px
- ROI pill: bg:#F0FDF4 border:#BBF7D0 0.5px r:9 padding:2px 10px
  "↗ +38% reservas directas" Inter Regular 9px #15803D
- 3 botones breakpoint: 22×22 bg:#EFEFEF border:#D1D1D1 0.5px r:4
  Desktop activo (#1A1A1A) · Tablet inactivo (#737373) · Mobile inactivo (#737373)

### Viewport preview
bg:#DDDBD6 padding:14px
Muestra el mini-sitio del hotel centrado

Mini-sitio: 420×500px bg:#FFFFFF r:6 border:0.5px solid rgba(0,0,0,0.10) overflow:hidden

#### Header del sitio
h:26px bg:#1A1A2E padding:0 8px flex align-center justify-space-between
- Logo: "Hotel Plaza Mayor" Inter Semi Bold 8px #FFFFFF (max-width:100px overflow:hidden)
- Nav: 3 spans "Inicio" "Habitaciones" "Contacto" 7px #FFF @50% gap:7px
- CTA: 56×14 bg:#E84A2C r:2 "Reservar" 7px #FFF

#### Hero
h:72px bg:#1A1A2E flex flex-column align-center justify-center gap:4px position:relative
- Título: "Bienvenidos al Hotel Plaza Mayor" Inter Semi Bold 10px #FFF text-align:center
- Sub: "Córdoba · Boutique · Desde 1998" 7px #FFF @70% text-align:center
- CTA: 70×14 bg:#E84A2C r:2 "Reservar ahora" 7px #FFF
- Badge bottom-right absolute: bg:#000 @45% r:2 padding:1px 5px "Foto de ejemplo" 7px #FDBA74

#### Servicios
h:46px bg:#FFFFFF border-top:#F0F0F0 0.5px padding:8px
- "Servicios" 8px Semi Bold #444 text-align:center mb:4px
- 4 chips en fila: 54×16 bg:#F9F9F9 border:#EEE 0.5px r:3 gap:4px
  "WiFi" "Desayuno" "Piscina" "Parking" 7px #555

#### Habitaciones
h:54px bg:#1A1A1A padding:6px
- "Habitaciones" 8px Semi Bold #FFF text-align:center mb:4px
- 3 cards en fila gap:4px: 80×28 bg:#FFF r:3 border:#333 0.5px overflow:hidden
  Imagen top 80×16: colores #B5D4F4 / #F5C4B3 / #9FE1CB
  Nombre: "Suite Superior" / "Hab. Estándar" / "Familiar" 6px #333 padding:1px 4px

#### Galería
h:48px bg:#FFFFFF border-top:#F0F0F0 0.5px padding:6px
- "Galería" 8px Semi Bold #444 text-align:center mb:4px
- Grid 3 columnas gap:2px: 6 celdas cuadradas
  Colores: #B5D4F4 / #F5C4B3 / #9FE1CB / #FAC775 / #CECBF6 / #C0DD97

#### Contacto
h:52px bg:#FFFFFF border-top:#F0F0F0 0.5px padding:6px
- "Contacto" 8px Semi Bold #444 text-align:center mb:4px
- Row: "📍 Av. Colón 123, Córdoba" 7px #666
- Mapa: full-width × 22px bg:#E5F3E8 r:3 "Mapa automático" 7px #15803D text-center

---

## Tokens de color resumidos

```
#E84A2C  coral principal (botones, activos, acento)
#1A1A1A  texto primario
#737373  texto secundario
#A6A6A6  texto terciario / hints
#D1D1D1  borders
#F6F6F6  fondos de inputs y backgrounds
#FFFFFF  superficies y cards
#22C55E  verde éxito (steps done, logros)
#16A34A  verde oscuro (botones success)
#F0FDF4  verde muy claro
#BBF7D0  verde border
#FFF7ED  ámbar muy claro (placeholder)
#FED7AA  ámbar border
#F59E0B  ámbar (íconos)
#9A3412  ámbar texto
#EFF6FF  azul muy claro (asesor)
#BFDBFE  azul border
#1D4ED8  azul texto
#111111  icon sidebar bg
#1A1A1A  nav sidebar bg
#2A2A2A  nav item activo bg
#333333  sidebar borders
```

## Tipografía

Fuente única: **Inter**
- Regular: hints, labels secundarios, links
- Medium: botones, labels de campo, valores
- Semi Bold: títulos de card (14px), step counter, logo

---

## Notas finales para Figma Make

- Todos los borders de cards e inputs son **0.5px**, no 1px.
- El fondo del editor detrás del overlay debe verse pero estar oscurecido.
- El modal tiene r:12px y shadow pronunciada para que flote sobre el fondo.
- La nota del asesor va siempre colapsada en el estado por defecto del frame.
- El micro-logro banner (verde) solo es visible cuando el logo fue cargado — en este frame mostrarlo visible.
- La foto de portada siempre tiene el badge ámbar "Foto de ejemplo activa".