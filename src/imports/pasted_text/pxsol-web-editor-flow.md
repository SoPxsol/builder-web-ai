Quiero que diseñes el flujo completo del Editor de Página Web para PXSOL Web Manager. Es una herramienta de gestión de sitios web para hoteleros. A continuación te detallo todo lo que necesito.

CONTEXTO GENERAL
Este editor se abre en modo pantalla completa, sin la sidebar lateral de la suite (Dashboard, Mis Sitios, Templates). Cuando el hotelero entra al editor, el chrome de la app desaparece y aparece solo la topbar propia del editor. El botón "← Volver" en la topbar es suficiente para salir. Esto libera espacio horizontal para el canvas.
Fuente global: Inter. Tamaño del frame: 1280 × 800px. Background general del canvas: #F0F0F0.

ESTADO 1 — EDITOR BASE (sin paneles abiertos)
TOPBAR. Posición y:0, alto 40px, ancho 1280px. Fondo #FFFFFF. Borde inferior 1px #D1D1D1 en y:39.
Logo: rectángulo 20×20px en x:12 y:10, fill #E84A2C, radio 4px. Texto "PXSOL Web" en x:36 y:13, Inter Semi Bold 11px, color #1A1A1A.
Zona izquierda: Botón "← Volver" en x:68 y:8, 68×24px, fondo #EFEFEF, borde #D1D1D1 0.5px, radio 5px, Inter Regular 11px #737373. Separador vertical 1px #D1D1D1 en x:144, entre y:10 y y:30. Texto "Inicio" en x:154 y:13, Inter Medium 12px #1A1A1A. Ícono editar "✎" en x:198 y:14, Inter Regular 10px #A6A6A6.
Zona centro, cuatro botones de acción principal. Todos con fondo #EFEFEF, borde #D1D1D1 0.5px, radio 5px, alto 24px, Inter Regular 10px #1A1A1A. Botón "＋ Sección" en x:416 ancho 80px. Botón "⚙ Config" en x:510 ancho 80px. Botón "Aa Fuentes" en x:596 ancho 80px. Botón "◻ Pop-ups" en x:686 ancho 80px. Separador vertical 1px #D1D1D1 en x:774, entre y:10 y y:30.
Zona derecha: Botón "✨ AI" en x:782 y:8, 40×24px, mismo estilo chip. Botón "🌐" en x:828 y:8, 32×24px, mismo estilo chip. Toggle de dispositivos en x:866 y:8, 90×24px, fondo general #EFEFEF borde #D1D1D1 radio 5px; el estado Desktop está activo con fondo interno #2A2A2A ancho 32px radio 5px e ícono 🖥 en color #FFFFFF; los otros dos íconos (tablet ⬜ y mobile 📱) en color #545454. Separador vertical en x:962. Botón "▶ Preview" en x:970 y:6, 80×28px, fondo #E84A2C, radio 6px, Inter Medium 11px #FFFFFF. Separador vertical en x:1056. Botón "···" en x:1062 y:8, 28×24px, chip estándar, Inter Semi Bold 13px #1A1A1A. Avatar "SG" en x:1098 y:7, 26×26px, fondo #E0EBFA, radio 13px, Inter Medium 10px #3366CC.
CANVAS. Ocupa x:0 y:40, ancho 1280px, alto 760px. URL bar en y:40, alto 32px, fondo #FFFFFF, borde inferior #D1D1D1. Texto "hotelpalermo.pxsol.com / inicio" en x:16 y:50, Inter Regular 10px #737373.
Todas las secciones tienen margen lateral de 20px a cada lado, fondo #FFFFFF, radio 6px.
Sección Hero en y:88, alto 200px, borde #E84A2C 1.5px (estado seleccionada). Label "Sección: Hero / Banner" Inter Semi Bold 11px #E84A2C. Descripción "Imagen principal + título + CTA de reserva" Inter Regular 10px #737373. Placeholder de imagen en x:36 relativo, alto 124px, fondo #EBEBEB, borde #D1D1D1 0.5px, radio 4px. Texto "🖼 Imagen de portada del hotel" centrado, Inter Regular 10px #A6A6A6. Handle en la parte inferior de la sección: "✥ Mover | ✎ Editar | ✕ Eliminar", Inter Regular 9px #E84A2C.
Sección Habitaciones en y:302, alto 80px, borde #D1D1D1 0.5px (estado inactiva). Label "Sección: Habitaciones" Inter Semi Bold 11px #1A1A1A. Descripción "Grid de tarjetas con foto, nombre y precio por noche" Inter Regular 10px #737373. Handle "✥ Mover | ✎ Editar" Inter Regular 9px #A6A6A6.
Sección Contacto en y:396, alto 80px, mismo estilo que Habitaciones. Label "Sección: Contacto & Mapa". Descripción "Formulario de contacto + embed Google Maps".
Botón inline "＋ Añadir sección" en y:490, alto 28px, ancho 152px, centrado horizontalmente en el canvas, fondo #FFFFFF, borde #D1D1D1 0.5px, radio 14px, Inter Regular 11px #737373.

ESTADO 2 — PANEL "AÑADIR SECCIÓN" ABIERTO
El botón "＋ Sección" en la topbar cambia a estado activo: fondo #1A1A1A, texto #FFFFFF.
Panel lateral izquierdo en x:0 y:40, ancho 260px, alto 760px. Fondo #1A1A1A. Borde derecho 1px #333333. Título "Añadir sección" en x:16 y:14, Inter Semi Bold 12px #FFFFFF. Botón "✕" para cerrar en x:228 y:12, Inter Regular 12px #737373. Borde bajo el título en y:32, alto 1px, color #333333.
Ítems de sección desde y:42, incremento de 36px entre cada uno. Cada ítem: x:8, ancho 244px, alto 28px, fondo #252525, borde #333333 0.5px, radio 5px. Label con prefijo "＋  " en x:20, Inter Regular 11px #8C8C8C. Los ítems son: Hero / Banner, Galería de fotos, Habitaciones, Testimonios, Servicios & amenities, Contacto & mapa, Texto libre.
El canvas se desplaza a x:260, ancho 1020px. El resto de secciones mantiene los mismos estilos del Estado 1.

ESTADO 3 — PANEL "CONFIG DE PÁGINA" ABIERTO
El botón "⚙ Config" en la topbar cambia a estado activo: fondo #1A1A1A, texto #FFFFFF.
Panel lateral derecho en x:1020 y:40, ancho 260px, alto 760px. Fondo #FFFFFF. Borde izquierdo 1px #D1D1D1. Título "Config. de página" Inter Semi Bold 12px #1A1A1A en y:14. Borde bajo título en y:32, alto 1px, color #D1D1D1.
Dentro del panel, todos los elementos tienen padding horizontal de 16px. Label "Título SEO" en y:48, Inter Regular 10px #737373. Input en y:60, alto 28px, fondo #F6F6F6, borde #D1D1D1 0.5px, radio 5px, Inter Regular 11px #1A1A1A, valor "Hotel Palermo Buenos Aires". Label "URL Slug" en y:100. Input en y:112, valor "/inicio". Label "Meta descripción" en y:152. Textarea en y:164, alto 56px, mismo estilo, placeholder "Describí la página en 120–160 caracteres" en color #A6A6A6. Divisor en y:232, alto 1px, color #D1D1D1. Label "Estado" en y:244. Badge "Publicada" en y:256, fondo #DCFCE7, radio 4px, Inter Medium 10px #16A34A. Label "Idioma de página" en y:284. Selector en y:296, alto 28px, fondo #F6F6F6, borde #D1D1D1 0.5px, radio 5px, valor "Español ▾".
El canvas se ajusta a x:0, ancho 1020px.

ESTADO 4 — MENÚ "···" DESPLEGADO
Dropdown anclado al botón "···". Posición x:970 y:44, ancho 200px, alto 148px. Fondo #FFFFFF. Borde #D1D1D1 0.5px. Radio 8px. Sombra 0 4px 12px rgba(0,0,0,0.08).
Cuatro ítems, cada uno de alto 36px, ancho completo 200px, Inter Regular 12px #1A1A1A, hover fondo #F6F6F6. Padding izquierdo del ícono 16px, del label 40px. Ítem 1: ícono 🗂 label "Guardar como plantilla". Ítem 2: ícono { } label "Editor JSON estado global". Divisor de 1px #D1D1D1 entre el ítem 2 y el ítem 3. Ítem 3: ícono 🕐 label "Historial de versiones". Ítem 4: ícono ⧉ label "Duplicar página".

ESTADO 5 — MODO PREVIEW
La topbar del editor desaparece completamente y es reemplazada por una barra mínima en y:0, alto 36px, ancho 1280px, fondo #1A1A1A.
Dentro de esa barra: texto "← Volver a edición" en x:16, Inter Regular 11px #FFFFFF. Badge "Vista previa" centrado horizontalmente, fondo #2A2A2A, radio 4px, Inter Regular 10px #8C8C8C. Toggle de dispositivos en x:1140, mismo estilo que en la topbar pero sobre fondo oscuro, íconos inactivos #8C8C8C, activo #FFFFFF.
El canvas ocupa y:36, alto 764px, ancho 1280px, sin márgenes ni handles. Las secciones no muestran bordes de selección ni handles de edición. El sitio se ve como lo vería el huésped.