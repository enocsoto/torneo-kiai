# Plan: Rastreo OOP + recorrido guiado (product tour)

**Estado:** propuesta de diseño — sin implementación aún.  
**Fecha:** 2026-04-26.  
**Referencia de patrón UX:** [Chameleon — Top 8 React product tour libraries for user onboarding](https://www.chameleon.io/blog/react-product-tour) (tours in-app, paso a paso, contextual).

---

## 1. Visión

Combinar dos capas que se refuerzan mutuamente:

1. **Product tour (recorrido in-app)** — al estilo descrito en el artículo de referencia: un **tour** que guía al usuario con **pasos en orden**, **resaltado (spotlight / máscara)** sobre zonas concretas de la interfaz, **tips** en tooltips o modales pequeños, y **flujo** controlado (siguiente, omitir, reiniciar). Eso es lo que comúnmente se implementa con librerías como React Joyride, Shepherd, Reactour, etc., no con “React DevTools” ni con el reconciler de React.
2. **Contenido pedagógico OOP** — en cada paso (y, si hace falta, en un panel o timeline complementario), conectar la UI con **clases, instancias, DTOs y servicios** reales del proyecto: creación de combates, `WarriorSnapshot`, acciones, API NestJS, etc.

**Nombre sugerido en UI:** *Recorrido OOP*, *Modo aprendizaje* o *Guía* (subtítulo: “objetos y código”). Evitar venderlo como “React Trace” para no confundir con DevTools; la metáfora correcta es **onboarding / product tour** + **rastreo conceptual OOP**.

---

## 2. Objetivos

1. **Desde la página de inicio (`/`)** el usuario puede **iniciar un tour** (o activar el modo guía) que, con **highlights y pasos**, explica la selección de luchadores, el botón de combate y qué ocurrirá a nivel de objetos/DTOs.
2. **Durante un combate** (`/battle/[id]`) el mismo modo puede ofrecer **otro tour o continuación** (segunda “oleada” de pasos): turno, ataques, energía, enlazado a `Battle`, `WarriorSnapshot`, `BattleActionType`, etc. Opcional: **timeline** de eventos OOP al margen, sincronizada con el tour o accesible desde el último paso.
3. **Paridad pedagógica** con el código: mismos términos que `BattlesService`, esquemas y DTOs, sin simulación paralela difícil de mantener.
4. **Experiencia de producto** alineada con buenas prácticas de tours: no bloquear sin salida, respeto a **móvil** (touch, pasos no recortados), **accesibilidad** (foco, anuncios, teclado donde la librería lo permita).

**No objetivo (fase 1):** reescribir el motor de combate por didáctica; **no** es obligatorio adoptar un SaaS tipo Chameleon/Pendo (el artículo también cubre *build* vs *buy*; este plan parte por **librería open source en el frontend** propio).

---

## 3. Qué aporta un “product tour library” (resumen del artículo de referencia)

Una librería típica de product tours en React incluye, como mínimo:

| Pieza | Función |
|--------|---------|
| **Creador de pasos** | Definir qué mostrar en cada paso (p. ej. anclar a `.selector` o `data-tour="…"`). |
| **Highlighter** | Oscurecer el resto y “iluminar” el elemento activo (spotlight / máscara). |
| **Tips** | Texto corto explicando la zona resaltada (tooltip o popover). |
| **Flujo** | Orden de los pasos, “Siguiente / Atrás / Cerrar / Omitir tour”. |
| **Diseño (opcional)** | Tema, animaciones, coherencia con la app. |

Criterios útiles al elegir implementación (extraídos del mismo tipo de análisis que el artículo): **integración con React/Next**, **personalización**, **funcionalidades** (tour simple vs ramas), **comunidad y mantenimiento**, **rendimiento y peso del bundle**, **comportamiento responsive**, **licencia y coste**.

---

## 4. Decisión de implementación (build vs buy; librerías candidatas)

- **In-house con librería OSS (recomendado para fase 1):** control total, sin dependencia de terceros ni datos sensibles hacia un DAP; encaja con Next.js y componentes `use client`. Candidatas habituales citadas en la referencia:
  - **React Joyride** — API centrada en React, pasos con `target`, buena base de estilo; a valorar con App Router.
  - **Shepherd (react-shepherd)** — posicionamiento robusto (p. ej. vía Popper en el ecosistema Shepherd).
  - **Reactour** (`@reactour/tour` + mask + popover) — tours modulares y aspecto cuidado.
  - **Walktour** — más customization; comunidad más pequeña.
- **SaaS (Chameleon, Appcues, Pendo, etc.):** útil si el equipo prefiere editor no-code y A/B; **fuera del alcance inicial** salvo decisión explícita (coste, privacidad, integración con invitados).

**Acción de implementación:** en la fase 0/1, **elegir una** librería tras un *spike* mínimo en `frontend/` (un tour de 2 pasos en `/` con un `data-tour` en el header o el botón de combate) y comprobar layout con `AppFrame`, tema claro/oscuro y móvil.

---

## 5. Contexto del repositorio (relevante para el guion OOP)

| Área | Rol en la narrativa OOP |
|------|-------------------------|
| **Backend NestJS** `BattlesService` | Servicio de aplicación: `create`, `applyAction`. |
| **Esquemas** `Battle`, `WarriorSnapshot`, `AttackSnapshot` | Composición del documento de batalla. |
| **`toSnapshot`** | De `Warrior` (+ bonos) a estado congelado de partida. |
| **`applyAction` + handlers** | Mensaje (DTO) → comportamiento. |
| **Frontend Next.js** | Donde vive el **product tour**; datos vía API/polling. |
| **Página `/torneo`** | Ránking agregado, no bracket; el guion del tour no debe asumir un objeto “torneo” en memoria. |

---

## 6. Guion de contenido (alineado al código), enlazable a pasos del tour

Orden sugerido para **definir `steps[]`** (textos en i18n, `target` = selectores estables en la UI):

1. **Selección** — IDs de guerreros y envío a la API; `CreateBattleDto`.
2. **Creación de batalla** — `Battle`, `WarriorSnapshot`, `toSnapshot`, persistencia.
3. **Turno y acción** — `activeSide`, actor/objetivo, `BattleActionType`, índice de ataque.
4. **Fin de batalla (opcional)** — servicios colaboradores, victoria, progreso.
5. **Torneo (opcional, breve)** — aclarar agregado de victorias vs. “objeto torneo”.

Cada **paso del tour** = un *slide* con highlight + copy OOP; la **capa de eventos** (apartado 7) alimenta detalle adicional (timeline) si se activa el modo.

---

## 7. Arquitectura de la feature

### 7.1 Modo y persistencia

- Toggle **“Modo aprendizaje / Guía OOP”** con guardado en `localStorage` y opcional `?oop=1` para compartir.
- Clave distinta de **“¿ya hizo el tour de la home?”** / **“¿tour de batalla visto?”** para no forzar repeticiones; botón “Repetir recorrido” en ajustes o toolbar.

### 7.2 Capa de “eventos educativos” (complemento al tour)

**Opción A — Derivada en cliente:** eventos a partir de `GET battle` y transiciones de estado.  
**Opción B — Backend:** `traceSteps` opcionales en create/action.

Recomendación: **A** en fase 1; **B** si hace falta fidelidad absoluta a nombres y orden de métodos en servidor.

### 7.3 UI: product tour + (opcional) panel timeline

- **Tour principal:** pasos con spotlight + tooltip, **anclas estables** (`data-ooptour="…"` recomendado frente a clases de Tailwind frágiles).
- **Paralelo:** panel de “última operación OOP” o timeline por turno, **no** sustituto del tour sino capa “profundidad”.
- **a11y:** `aria-live` donde proceda, skip visible, respeto a `prefers-reduced-motion` en animaciones del tour (según lo que permita la librería).

---

## 8. Criterios de éxito

- El usuario puede **completar** un recorrido en `/` (≥ 3 pasos) con highlights claros y textos bilingües (`oop.*` / i18n).
- En **batalla**, tour continuo o segunda secuencia (≥ 2 pasos) que enlace acciones con conceptos OOP.
- Con el modo apagado, **cero** pasos de tour visibles y **ningún** bloqueo de UI; impacto de bundle razonable (elegir librería con bundle acotado o import dinámico del tour).
- Coherencia con el patrón “product tour” (orden, highlight, tips, flujo) descrito en la [referencia Chameleon](https://www.chameleon.io/blog/react-product-tour).

---

## 9. Fases de implementación sugeridas

| Fase | Entregable |
|------|------------|
| **0** | Elegir librería (spike 2 pasos en `/`); fijar convención de `data-*` para anclas. |
| **1** | Toggle + tour home (pasos + i18n) con omitir y “no mostrar de nuevo” opcional. |
| **2** | Tour en `/battle/[id]` + eventos OOP derivados (A) o timeline. |
| **3** | (Opcional) Instrumentación API (B); pulir móvil y a11y. |

---

## 10. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Selectores rotos al cambiar clases | `data-ooptour` o id estable; revisión visual en PR. |
| Tour intrusivo | Omitir siempre; no auto-lanzar en cada visita sin preferencia. |
| Confusión con React interno | Copy: “recorrido guiado” / “guía OOP”, no “trace de React”. |
| Bundle | Import dinámico del componente de tour; medir con build. |
| “Torneo” = solo ránking | Un paso de copy honesto o omitir el tour en `/torneo` hasta tener guion. |

---

## 11. Fuera de alcance (hasta nuevo aviso)

- Integración con plataformas DAP (Chameleon, etc.) sin decisión de producto.
- Debugger de instancias V8 en el navegador.
- Refactor de dominio solo para didáctica.

---

## 12. Próximos pasos

1. Spike de **una** librería (Joyride, Shepherd o Reactour) en el `frontend` con 2 pasos.  
2. Rellenar `steps` de la home con copy OOP aprobado (es + en).  
3. Diseñar la secuencia de batalla (targets en barra de turno, lista de ataques, etc.).  
4. (Opcional) Tras estabilizar, valorar **buy** si hace falta edición no-code o experimentación A/B en tours.

*Fin del documento de planificación.*
