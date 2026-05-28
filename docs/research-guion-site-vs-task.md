# Guión de entrevista — Site-first vs Task-first

**Fecha:** _por completar_
**Entrevistado/a:** _por completar_
**Tipo de hotel:** _por completar (boutique / cadena chica / familiar / business)_
**Cantidad de propiedades:** _por completar_
**Duración:** 30 min

---

## Por qué esta entrevista

Hipótesis del ux-researcher tras la auditoría inicial:

> Antes de invertir más en el site selector del sidebar secundario y la jerarquía de "Sitio activo", necesitamos validar si el hotelero entra **task-first** ("vengo a cargar una promo, el sitio es secundario") o **site-first** ("vengo a mi hotel X, ahora veo qué hago").

La respuesta cambia radicalmente la prioridad:
- **Site-first** → el switcher de sitios es prominente, persiste el último visitado, atajos directos.
- **Task-first** → la home está organizada por tareas ("Promo", "Cargar habitación", "Ver reservas"), el sitio queda en segundo plano.

Hoy el producto trata implícitamente al usuario como **site-first** (sidebar dedicado al sitio activo, contexto persistente). Si la mayoría es task-first, hay deuda de arquitectura de la información.

---

## Estructura de la entrevista

### Bloque 1 — Calentamiento (5 min)

1. Contame un poco sobre tu hotel. ¿Cuántas habitaciones tiene? ¿Hace cuánto que lo gestionás?
2. ¿Cuántas personas trabajan con vos en marketing/web/reservas?
3. ¿Vos sos quien edita el sitio o lo delegás?

> **Para qué:** entender el contexto operativo y separar entrevistados que delegan (no son nuestro usuario primario) de los que ejecutan.

### Bloque 2 — Reconstrucción de la última sesión (10 min)

> **Importante:** preguntar por la **última vez real**, no por "cómo solés trabajar". Las narraciones de hábito están idealizadas.

4. Pensá en la última vez que entraste al panel de PXSOL. ¿Te acordás cuándo fue? ¿Mañana, tarde, noche?
5. ¿Qué fue lo primero que hiciste? Contame paso a paso, como si lo estuvieras haciendo ahora.
6. ¿Por qué entraste? ¿Te acordás qué problema o tarea tenías en la cabeza?
7. ¿Sabías ya qué ibas a hacer antes de entrar, o lo decidiste cuando vio el panel?

> **Para qué:** detectar si el entry point fue una tarea específica (task-first) o un check-in genérico (site-first). Si dice "entré para…", task-first. Si dice "entré para ver cómo iba todo y…", site-first.

### Bloque 3 — Multi-sitio (5 min)

> Solo si gestiona más de 1 propiedad.

8. ¿Vos gestionás más de un hotel/propiedad?
9. Cuando entrás al panel, ¿siempre arrancás en el mismo, o eligís según lo que vienes a hacer?
10. ¿Te pasa de tener que cambiar entre un sitio y otro en la misma sesión? ¿Con qué frecuencia?
11. ¿Cómo encontrás el sitio correcto cuando hay varios? (atención a si dice "lo busco", "está fijado", "lo tengo de memoria")

> **Para qué:** medir si el switching es frecuente o raro. Si es raro, el switcher elaborado es over-engineering.

### Bloque 4 — Mental model (5 min)

12. Imaginá que entrás al panel y te aparece una pregunta: **¿Qué venís a hacer hoy?** ¿Cómo te sentirías?
13. Versión opuesta: imaginá que entrás y lo primero que ves es **el resumen del Hotel Tamarindo** (tu sitio principal). ¿Te resulta natural?
14. Cuando tu equipo te ayuda con el panel, ¿les decís "metete al hotel X y hacé esto" o "andá a la sección Y y hacé esto"?

> **Para qué:** la respuesta a 14 es clave. El verbo refleja el modelo mental — "metete al hotel" es site-first, "andá a la sección" es task-first.

### Bloque 5 — Estímulo cerrado (5 min)

Mostrar dos prototipos en pantalla compartida.

**Prototipo A (site-first, lo actual):**
- Dashboard con tarjetas de sitios. Click → entrás al sitio. Sidebar secundario con SEO / AI / Páginas / etc.

**Prototipo B (task-first, hipótesis):**
- Home con bloques grandes por tarea: "Cargar promo", "Actualizar precios", "Ver reservas del día", "Editar contenido". Cada uno pregunta ¿Sobre qué hotel? si tenés más de uno.

15. ¿Cuál de las dos se parece más a cómo trabajás hoy?
16. ¿Cuál preferirías usar si tuvieras que elegir?
17. Si fuera B, ¿cuáles serían las 4 tareas que pondrías como bloques principales?

> **Para qué:** validación cuantitativa rápida. Cuidado con sesgo de novedad: el B puede gustar solo por ser distinto. Insistir en "para tu trabajo real, en los próximos 3 meses".

---

## Output esperado

Después de **6–8 entrevistas** (n mínimo para detectar patrón en LATAM hotelero), clasificar:

| Bucket | Indicador |
|---|---|
| **Claramente task-first** | Respuestas 4-7 mencionan tarea específica + responde A no me representa en 15 |
| **Claramente site-first** | Respuestas 4-7 mencionan check-in genérico + B se siente raro en 13 |
| **Híbrido** | Distinto comportamiento según día/contexto |

**Decisión esperada:**
- Si >70% task-first → rediseñar dashboard con bloques de tarea
- Si >70% site-first → invertir en site switcher elaborado, mejor onboarding del contexto de sitio
- Si híbrido → la home debería tener ambos (cards de tarea + carousel de sitios)

---

## Lo que NO preguntar

- ❌ "¿Qué cambiarías del panel?" — produce wishlist desconectado del comportamiento real
- ❌ "¿Te gusta el diseño?" — fuera de scope, otro estudio
- ❌ Preguntas que sugieran respuesta ("¿No te parece que es más fácil…?")
- ❌ Funcionalidades específicas que no existen ("¿Te gustaría que tuviera IA…?") — sin contexto, generan ruido

---

## Logística

- **Reclutamiento:** 6–8 hoteleros LATAM, mix de: 4 single-hotel + 3 multi-hotel + 1 cadena chica (5+)
- **Compensación:** USD 30 o equivalente local (gift card / mercado pago)
- **Plataforma:** Google Meet con grabación, transcripción automática
- **Roles:** moderador + observador silencioso. Observador toma notas literales de verbos usados
- **Análisis:** sesión de afinidad post-todas-las-entrevistas. Codificar por verbos del bloque 4 + tipo de entry en bloque 2

---

**Quién la corre:** ux-researcher (interno) + 1 stakeholder de producto en modo observador
**Cuándo:** antes de cualquier rediseño del Dashboard o del site switcher
