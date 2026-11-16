# PROMPT MAESTRO - INTEGRACIÓN "CAMPUS ERICK" (LMS) AL PROTOTIPO MLM 2027

Este documento define, con el detalle de un encargo de desarrollo, la integración de la plataforma educativa (LMS) de **ERICK S.A.C.** dentro del prototipo navegable **MLM 2027** que ya existe en `D:\Prototipo\Prototipo-MLM`. Se ejecuta por fases (L1 a L6). Cada fase se pide con su propio mensaje y no se adelanta trabajo de fases futuras.

Fuente de requerimientos: documento "Descripción del software educativo LMS que requiere ERICK S.A.C." Fuente de verdad del proyecto base: `docs/PROMPT_MAESTRO.md` y `CLAUDE.md`.

---

## 0. ROL Y REGLAS OBLIGATORIAS

Actúa como desarrollador de software full stack senior. Construyes sobre un proyecto que funciona: no lo rehaces ni rompes lo existente.

### 0.1 Reglas de trabajo (no negociables)

1. Entorno Windows: comandos de PowerShell y rutas `D:\Prototipo\Prototipo-MLM`.
2. Prohibido usar emojis en código, interfaz, datos, commits y respuestas. Iconos solo de `lucide-react`.
3. Nombres de código en español sin tildes; textos visibles en español con tildes correctas. Archivos UTF-8.
4. No modificar líneas existentes salvo que sea imprescindible para integrar; preferir agregar líneas, archivos y funciones nuevas. Mantener los comentarios existentes.
5. Al cerrar cada fase: listar archivos nuevos y modificados (con el lugar exacto del cambio), comandos ejecutados, requerimientos cubiertos, pruebas y revisión responsive. No entregar zips del proyecto completo.
6. TypeScript estricto, sin `any`, sin comentarios innecesarios. La lógica académica (notas, aprobación, desbloqueo, certificación) vive en funciones puras en `src/motores/academico/`.
7. Sin backend ni integraciones reales: datos en memoria (`src/datos/`), stores de zustand y la persistencia local ya existente (`src/store/persistencia.ts`). Todo pago, video y envío es simulado y rotulado DEMOSTRACIÓN.
8. Responsive mobile-first: sin scroll horizontal de página, objetos táctiles de 44 px, revisión a 375, 768 y 1440 px.
9. Reutilizar los componentes y patrones existentes: `Tarjeta`, `TarjetaKpi`, `Tabla`, `Pestanas`, `Modal`, `Cajon`, `Confirmacion`, `Campo`, `Selector`, `ChipsFiltro`, `BarraExportar`, `EstadoVacio`, `EstadoError`, `Insignia`, `ConPermiso`, `usePermiso`, `useToast`, servicios con `Resultado` (`exito`/`fallo`), `registrarBitacora` y `notificar`.
10. Cada acción que cambia datos registra bitácora (quién, qué, cuándo, por qué, antes y después) y, si afecta a una persona, le envía una notificación.
11. Todo store nuevo se agrega a `reiniciarDemo()` y a la lista `compartidas` (o `porPestana`) de `src/store/persistencia.ts`.

### 0.2 Stack (sin cambios)

Vite + React 19 + TypeScript + Tailwind v4, react-router-dom 7, zustand, lucide-react, recharts, date-fns. Dependencias nuevas permitidas en esta integración: `jspdf` (PDF de certificados, diplomas y reportes) y `qrcode` (códigos QR). Instalar con:

```powershell
cd D:\Prototipo\Prototipo-MLM
npm install jspdf qrcode
npm install -D @types/qrcode
```

---

## 1. CONTEXTO Y OBJETIVO

### 1.1 Qué existe hoy en MLM 2027

- Productos de categoría `programa_formativo` en el catálogo (precio, VP y VC independientes).
- Perfil `cliente_alumno` y tipo de persona `alumno`.
- `EstadoFormativo` (`matriculado`, `cursando`, `aprobado`) en `src/tipos/formacion.ts`, store `useFormacionStore` y la pantalla del afiliado "Mi formación" con el botón "Simular actualización desde LMS" (`simularActualizacionLms`).
- El requisito de rango `formacion_aprobada` en `src/motores/motorRangos.ts`, que lee el estado formativo.
- La tarjeta del conector LMS "pendiente de integración" en Integraciones (`DEMO-CON-LMS`).
- Pedidos con confirmación de cobro simulada (`confirmarPedido` en `src/servicios/pedidos.ts`) y descuentos por producto.

### 1.2 Qué se agrega

Un **Campus ERICK** completo dentro del mismo prototipo: el estudiante se matricula al comprar, estudia, se evalúa automáticamente y obtiene certificados y diplomas en PDF con QR verificable. Corporativo administra programas, preguntas, matrículas, membresías, certificados y la sustentación MID. El LMS se comunica con la parte MLM a través de un conector que simula una API, de modo que más adelante pueda separarse como sistema independiente.

### 1.3 Principio funcional

La compra confirmada activa el acceso; el estudio genera avance y notas; las reglas académicas calculan la aprobación sin intervención humana; la aprobación emite el documento y actualiza el estado formativo que el MLM usa como requisito de rango. Todo queda trazable.

### 1.4 Leyenda obligatoria

Mantener la leyenda DEMOSTRACIÓN existente. En el campus agregar: "Contenidos, notas y certificados de DEMOSTRACIÓN. Los videos son simulados y los certificados no tienen validez oficial."

---

## 2. CAMBIO DE NOMBRE: ERIC S.A.C. A ERICK S.A.C.

El nombre correcto de la institución es **ERICK S.A.C.** Reemplazar todas las apariciones visibles y de datos de "ERIC S.A.C." por "ERICK S.A.C." en:

- `src/datos/productos.ts`, `src/datos/ampliacion.ts`, `src/datos/formacion.ts`, `src/datos/integraciones.ts`, `src/datos/presentacionCatalogo.ts`.
- `src/paginas/afiliado/MiFormacion.tsx`, `src/paginas/publico/MiCuenta.tsx`, `src/paginas/publico/Inicio.tsx`.
- `docs/PROMPT_MAESTRO.md`, `docs/GUION_DEMOSTRACION.md`, `docs/CHECKLIST_REQUERIMIENTOS.md`.

Verificación: una búsqueda de `ERIC S.A.C.` en `src` y `docs` (sin contar este documento) debe devolver cero resultados.

---

## 3. ACTORES, PERFILES Y PERMISOS

### 3.1 Quién usa el campus

| Actor | Perfil | Acceso |
|---|---|---|
| Alumno | `cliente_alumno` (tipo `alumno` o `cliente`) | Campus completo de sus programas matriculados. |
| Afiliado | `afiliado` | Campus de sus programas; su aprobación alimenta el requisito de rango. |
| Superadministrador | `superadministrador` | Panel académico completo. |
| Operador | `operador` | Panel académico según la matriz de permisos. |
| Evaluador académico (nuevo) | `evaluador` | Solo la bandeja de sustentaciones MID asignadas. |
| Visitante | sin sesión | Página pública de verificación de certificados. |

### 3.2 Perfil nuevo `evaluador`

- Agregar `'evaluador'` a `PerfilAcceso` (`src/tipos/persona.ts`) y a todos los `Record<PerfilAcceso, ...>` existentes (nombres de perfil, matriz de permisos, ruta de inicio por perfil, selector de rol).
- Persona de demostración: `DEMO-U03`, "Docente Evaluador Demo", tipo `corporativo`, perfil `evaluador`, correo `evaluador@correo.demo`.
- Botón de acceso rápido "Evaluador académico" en la pantalla de ingreso y en `sesionesDemo`.
- Ruta de inicio: `/evaluador`.

### 3.3 Módulos de permiso nuevos

Agregar a `ModuloPermiso` y a `modulos`/`nombresModulos`:

| Módulo | Nombre visible | Uso |
|---|---|---|
| `academico` | Académico | Programas, estructura, contenidos, preguntas, reglas de aprobación. |
| `matriculas` | Matrículas | Matrículas, accesos y membresías. |
| `certificados` | Certificados | Registro, reemisión y anulación de certificados y diplomas. |

Permisos iniciales:

- Superadministrador: todas las acciones en los tres módulos.
- Operador: `academico` consultar; `matriculas` consultar, crear, editar; `certificados` consultar, exportar.
- Evaluador: `academico` consultar y aprobar. En la interfaz, "aprobar" solo se usa para calificar las sustentaciones MID que tiene asignadas (LMS-073 y LMS-075).
- Afiliado y cliente/alumno: ninguno (el campus no usa la matriz corporativa; solo ven lo propio).

---

## 4. REQUERIMIENTOS FUNCIONALES (LMS-001 a LMS-075)

### A. Estructura académica

| ID | Requerimiento | Detalle |
|---|---|---|
| LMS-001 | Jerarquía de programas | Diplomado (120 h) → 2 cursos (60 h c/u) → 3 módulos por curso (20 h c/u) → 5 temas (3 h c/u) + 1 TIM (5 h) por módulo. |
| LMS-002 | MID | Módulo de Investigación y Desarrollo de 20 h, complementario y opcional, asociado a un diplomado. No es requisito del diploma. |
| LMS-003 | Programas independientes | Un curso de 60 h puede venderse y certificarse solo, o formar parte de un diplomado. |
| LMS-004 | Totales coherentes | Cada diplomado suma 30 temas, 6 módulos, 6 TIM y 120 h. El sistema valida las horas al guardar y muestra error si no cuadran. |
| LMS-005 | Estados de programa | `borrador`, `publicado`, `archivado`. Solo `publicado` admite matrículas nuevas; `archivado` conserva matrículas y certificados existentes. |
| LMS-006 | Vínculo con catálogo | Cada curso y diplomado publicado se asocia a un `Producto` de categoría `programa_formativo` (precio, VP y VC los define el catálogo). |

### B. Contenidos del tema

| ID | Requerimiento | Detalle |
|---|---|---|
| LMS-010 | Componentes del tema | Videoclase (30 min), lectura PDF (60 min), caso práctico (60 min) y evaluación objetiva (30 min). |
| LMS-011 | Videoclase simulada | Reproductor propio con portada, botón reproducir, barra de progreso que avanza en tiempo acelerado (30 min = 30 s en demo) y "Marcar como vista". Rótulo "Video de demostración". Campo opcional `urlVideo` para enlazar un video externo en el futuro (no se reproduce en la demo). |
| LMS-012 | Lectura | Visor de lectura en HTML con el texto del tema y botón "Descargar PDF" que genera el PDF con `jspdf`. Se marca como leída al descargar o al pulsar "Marcar como leída". |
| LMS-013 | Caso práctico | Enunciado y ejercicios guiados con respuesta de autocomprobación (no calificado). Se marca como completado al enviar. |
| LMS-014 | Descargas autorizadas | Solo se descargan materiales marcados `descargable: true`. |
| LMS-015 | Avance del tema | El tema está completo cuando video, lectura y caso están completados y la evaluación está aprobada. |

### C. Evaluaciones y calificaciones

| ID | Requerimiento | Detalle |
|---|---|---|
| LMS-020 | Tipos de pregunta | Opción múltiple (una correcta), selección múltiple (varias correctas), verdadero/falso, emparejamiento, ordenamiento y respuesta numérica exacta con tolerancia. Todas calificables automáticamente. |
| LMS-021 | Banco de preguntas | Cada tema tiene un banco (mínimo 8 preguntas en la demo). La evaluación toma N preguntas al azar (por defecto 5) con orden de opciones aleatorio. |
| LMS-022 | Escala | Notas de 0 a 20 con dos decimales. |
| LMS-023 | Aprobación | Aprobado si la nota es **estrictamente mayor a 14,00**. Una nota de 14,00 desaprueba. Comparar sobre el valor redondeado a dos decimales. |
| LMS-024 | Intentos | Configurable por programa: número máximo de intentos (por defecto 3), tiempo de espera entre intentos (por defecto 0) y nota que se registra (`mejor`, `ultimo` o `promedio`; por defecto `mejor`). |
| LMS-025 | Tiempo límite | Configurable por evaluación (por defecto 30 min). En la demo se muestra el contador; al agotarse se envía automáticamente. |
| LMS-026 | Retroalimentación | Al enviar: nota, aprobado o desaprobado, respuestas correctas e incorrectas (configurable mostrar u ocultar la respuesta correcta). |
| LMS-027 | TIM | Trabajo Integrador Modular como formulario estructurado de 6 a 10 ítems autocalificables (los mismos tipos de LMS-020), con su propia nota de 0 a 20. Se desbloquea al aprobar los 5 temas del módulo. |
| LMS-028 | Nota de módulo | Promedio ponderado por horas: `(suma de notas de los 5 temas x 3 + nota TIM x 5) / 20`. Aprobado si es mayor a 14 y todos sus componentes están aprobados. |
| LMS-029 | Nota de curso | Promedio simple de sus 3 módulos. Aprobado si es mayor a 14 y los 3 módulos están aprobados. |
| LMS-030 | Nota de diplomado | Promedio simple de sus 2 cursos. Aprobado si es mayor a 14 y ambos cursos están aprobados. El MID no interviene. |
| LMS-031 | Desbloqueo progresivo | Modo configurable por programa: `aprobar_para_avanzar` (por defecto: el tema siguiente se abre al aprobar la evaluación del anterior) o `libre` (todo abierto). El primer tema de cada módulo se abre al aprobar el TIM del módulo anterior. |
| LMS-032 | Sin intentos | Si se agotan los intentos sin aprobar, el tema queda `bloqueado_por_intentos`; corporativo puede otorgar intentos adicionales con motivo (LMS-052). |
| LMS-033 | Recalculo | Toda nota de módulo, curso y diplomado se recalcula con funciones puras a partir de los intentos registrados; nunca se escribe a mano. |

### D. Certificados y diplomas

| ID | Requerimiento | Detalle |
|---|---|---|
| LMS-040 | Emisión automática de certificado | Al aprobar un curso de 60 h se emite el certificado en el mismo instante, sin intervención. |
| LMS-041 | Emisión automática de diploma | Al aprobar ambos cursos de un diplomado se emite el diploma de 120 h. |
| LMS-042 | Contenido del documento | Logotipo y nombre ERICK S.A.C.; nombre completo y documento del estudiante; programa; horas; modalidad "Virtual asincrónica"; fechas de culminación y emisión; nota final; dos firmas institucionales ficticias (nombre y cargo); código único; QR; leyenda DEMOSTRACIÓN. |
| LMS-043 | Reverso | Segunda página con la relación de módulos (y cursos, en el diploma), horas y notas. |
| LMS-044 | Código único | Formato `ERK-CER-AAAA-NNNNN` (certificado) y `ERK-DIP-AAAA-NNNNN` (diploma), más un código de verificación corto de 8 caracteres. Nunca se reutiliza. |
| LMS-045 | QR | Apunta a `{origen}/verificar/{codigo}` (origen = `window.location.origin`, para que funcione en local y en Vercel). |
| LMS-046 | Verificación pública | Página `/verificar` (formulario por código) y `/verificar/:codigo`: muestra válido, anulado o inexistente, con nombre del estudiante, programa, horas, nota y fecha. No muestra correo, teléfono ni documento completo (enmascarado). |
| LMS-047 | PDF | Generado con `jspdf` en formato A4 horizontal, descargable desde el campus. |
| LMS-048 | Permanencia | El documento queda en el historial académico y se puede descargar aunque la matrícula o membresía haya vencido. |
| LMS-049 | Anulación y reemisión | Solo corporativo con permiso `certificados editar`: anular con motivo (la verificación muestra "anulado") o reemitir con nuevo código (el anterior queda anulado y enlazado). Nunca se borra. |

### E. Campus del estudiante

| ID | Requerimiento | Detalle |
|---|---|---|
| LMS-050 | Acceso | Con el mismo usuario y sesión de MLM 2027. Entrada "Campus ERICK" en el menú de Mi cuenta (alumno) y en el menú lateral del afiliado. |
| LMS-051 | Mis programas | Tarjetas de cursos y diplomados matriculados con avance (%), nota actual, estado y fecha de vencimiento del acceso. |
| LMS-052 | Ruta del programa | Árbol curso → módulos → temas y TIM con estado de cada uno: bloqueado, disponible, en curso, aprobado, desaprobado, bloqueado por intentos. |
| LMS-053 | Vista del tema | Pestañas Video, Lectura, Caso práctico y Evaluación, con indicador de completado y botón "Siguiente". |
| LMS-054 | Mis notas | Notas por tema, TIM, módulo, curso y diplomado, con intentos y fecha. |
| LMS-055 | Historial académico | Programas cursados, aprobados, vencidos y certificados emitidos, incluso de matrículas vencidas. |
| LMS-056 | Mis certificados | Lista con descarga PDF, código, QR visible y enlace de verificación. |
| LMS-057 | Mi membresía | Plan, fechas de inicio y vencimiento, días restantes y programas incluidos. |
| LMS-058 | Acceso vencido | Al vencer: el contenido se bloquea con aviso y botón "Renovar"; notas, historial y certificados siguen visibles. |

### F. Matrículas, membresías y pagos

| ID | Requerimiento | Detalle |
|---|---|---|
| LMS-060 | Matrícula individual | Comprar un producto de curso o diplomado y confirmar el cobro (flujo actual de pedidos) crea la matrícula automáticamente, con acceso por la duración configurada del programa (por defecto 6 meses). |
| LMS-061 | Membresías | Planes de 1, 2, 3, 6, 9 y 12 meses que dan acceso a todos los programas publicados marcados `incluidoEnMembresia`. Cada plan es un `Producto` del catálogo (categoría `programa_formativo`, precio, VP y VC propios). |
| LMS-062 | Activación por pago | La activación ocurre solo cuando el pedido pasa a `confirmada`. Un pedido pendiente, cancelado o devuelto no activa; una devolución suspende el acceso del programa devuelto (las notas y certificados ya emitidos se conservan). |
| LMS-063 | Renovación | Comprar de nuevo el mismo plan extiende el vencimiento desde la fecha de vencimiento vigente (o desde hoy si ya venció). |
| LMS-064 | Vencimientos | Estado de matrícula: `activa`, `por_vencer` (7 días o menos), `vencida`, `suspendida`. Notificación al estudiante 7 días antes y al vencer (se evalúa al cargar el campus). |
| LMS-065 | Precios y descuentos | Usan el catálogo y los descuentos ya existentes; no se crea un sistema de precios paralelo. |
| LMS-066 | Matrícula manual | Corporativo (permiso `matriculas crear`) matricula sin pago con motivo obligatorio (beca, cortesía, corrección). Queda en bitácora. |
| LMS-067 | Pasarela peruana simulada | En el checkout de productos formativos se muestra la opción de pago "Pasarela local (simulada)" con estados aprobado, rechazado y pendiente. Sin datos de tarjeta reales. |

### G. Sustentación MID

| ID | Requerimiento | Detalle |
|---|---|---|
| LMS-070 | Inscripción MID | El estudiante con el diplomado aprobado o en curso puede solicitar el MID si su matrícula lo incluye. |
| LMS-071 | Entrega | Formulario con título, resumen, archivo simulado (solo nombre) y fecha propuesta de sustentación. |
| LMS-072 | Asignación | Corporativo asigna un evaluador (perfil `evaluador`) y una fecha. |
| LMS-073 | Evaluación manual | El evaluador registra la nota de 0 a 20 con una rúbrica de 4 criterios ponderados y observaciones obligatorias. Aprobado si es mayor a 14. Es la única calificación manual del sistema. |
| LMS-074 | Constancia MID | Al aprobar se emite una constancia del MID (código `ERK-MID-AAAA-NNNNN`) con QR. No altera el diploma ni su nota. |
| LMS-075 | Bandeja del evaluador | El evaluador solo ve las sustentaciones que tiene asignadas. |

### H. Panel académico (corporativo)

| ID | Requerimiento | Detalle |
|---|---|---|
| LMS-080 | Programas | Lista con filtros (tipo, estado), crear, editar, duplicar, publicar y archivar. |
| LMS-081 | Editor de estructura | Árbol editable diplomado → cursos → módulos → temas/TIM, con validación de horas (LMS-004) y reordenamiento con botones subir/bajar. |
| LMS-082 | Contenidos | Edición del título, objetivos, texto de lectura, caso práctico, portada del video (imagen subida igual que en productos) y bandera descargable. |
| LMS-083 | Banco de preguntas | Alta, edición y baja de preguntas por tema y por TIM, con vista previa y validación (al menos una respuesta correcta, opciones no vacías). |
| LMS-084 | Reglas de aprobación | Por programa: intentos, nota registrada, tiempo límite, preguntas por evaluación, mostrar respuestas, modo de desbloqueo y duración del acceso. Nota mínima fija mayor a 14 (no editable, por requerimiento). |
| LMS-085 | Matrículas | Tabla con estudiante, programa, origen (compra, membresía, manual), estado, avance, nota y vencimiento. Acciones: matricular, extender acceso, suspender, reactivar, otorgar intentos. |
| LMS-086 | Membresías | Planes y suscriptores con vencimientos. |
| LMS-087 | Certificados | Registro de documentos emitidos con búsqueda por código o estudiante, descarga, anulación y reemisión. |
| LMS-088 | Estadísticas | KPIs: estudiantes activos, matrículas por estado, avance promedio, tasa de aprobación por módulo, certificados emitidos por mes, membresías por vencer. Gráficos con recharts. |
| LMS-089 | Reportes | Exportar CSV (abre en Excel) y PDF (con `jspdf`) de matrículas, notas, certificados y membresías, con filtros por programa, estado y fechas. |

### I. Integración con la plataforma MLM

| ID | Requerimiento | Detalle |
|---|---|---|
| LMS-090 | Conector | `src/servicios/conectorLms.ts` es la única puerta entre el campus y el MLM. Expone funciones con forma de API: `alConfirmarPedido`, `alDevolverPedido`, `emitirEvento`. Cada evento queda en un registro (`EventoIntegracion`). |
| LMS-091 | Eventos | `matricula_creada`, `avance_actualizado`, `curso_aprobado`, `diploma_emitido`, `certificado_anulado`, `acceso_vencido`, `mid_aprobado`. |
| LMS-092 | Estado formativo | Cada evento actualiza `EstadoFormativo` del MLM: matrícula activa = `matriculado`; primer tema completado = `cursando`; curso o diplomado aprobado = `aprobado`. El requisito de rango `formacion_aprobada` deja de depender del botón simulado. |
| LMS-093 | Botón simulado | "Simular actualización desde LMS" se mantiene solo como atajo de demostración, rotulado como tal, y también emite el evento por el conector. |
| LMS-094 | Integraciones | La tarjeta del conector LMS pasa a "Conectado (simulado)" y muestra el registro de eventos (fecha, tipo, persona, programa, resultado) con filtro y exportación CSV. |
| LMS-095 | Volumen comercial | Las ventas de cursos, diplomados y membresías siguen generando VP y VC con el flujo actual; el LMS no altera los motores de compensación. |
| LMS-096 | Ficha de persona | La ficha corporativa (`/corporativo/usuarios/:id`) agrega la pestaña "Académico" con matrículas, notas y certificados. |
| LMS-097 | API documentada | `docs/API_LMS.md` describe los endpoints que tendría el sistema real (método, ruta, cuerpo, respuesta y ejemplos) equivalentes a cada función del conector. |

---

## 5. REGLAS ACADÉMICAS (RA-01 a RA-12)

| RA | Regla | Implementación |
|---|---|---|
| RA-01 | Aprobado solo si la nota es mayor a 14,00 (estricto). | `estaAprobado(nota) = redondear(nota, 2) > 14`. |
| RA-02 | Nota de módulo ponderada por horas. | `notaModulo` en `motores/academico/notas.ts`. |
| RA-03 | Curso y diplomado: promedio simple de sus partes. | `notaCurso`, `notaDiplomado`. |
| RA-04 | Un componente sin nota cuenta como pendiente, no como cero, y el nivel superior queda pendiente. | Las funciones devuelven `{ nota: number | null, estado }`. |
| RA-05 | La nota registrada de una evaluación depende de la política del programa. | `notaRegistrada(intentos, politica)`. |
| RA-06 | El desbloqueo depende del modo del programa. | `calcularDesbloqueos(estructura, progreso, modo)`. |
| RA-07 | El certificado se emite una sola vez por estudiante y curso (idempotente). | Clave `personaId + programaId + tipo`; un segundo intento devuelve el existente. |
| RA-08 | El diploma requiere los dos cursos aprobados del mismo diplomado. | `puedeEmitirDiploma`. |
| RA-09 | El MID nunca bloquea ni modifica el diploma. | Se calcula aparte. |
| RA-10 | Sin acceso vigente no se rinden evaluaciones ni se ven contenidos; sí notas, historial y certificados. | `tieneAccesoVigente(matricula, fecha)`. |
| RA-11 | Las notas y los certificados nunca se borran; se anulan con motivo. | Estados y bitácora. |
| RA-12 | La fecha de referencia es la fecha actual del navegador. | `fechaHoy()` existente. |

---

## 6. ESTADOS Y MÁQUINAS DE ESTADO

- Programa: `borrador → publicado → archivado` (`publicado → borrador` permitido solo sin matrículas).
- Matrícula: `activa → por_vencer → vencida`; `activa | por_vencer → suspendida → activa`; `vencida → activa` (renovación).
- Elemento de ruta (tema, TIM): `bloqueado → disponible → en_curso → aprobado | desaprobado`; `desaprobado → en_curso` (nuevo intento); `desaprobado → bloqueado_por_intentos`.
- Documento: `emitido → anulado`; reemisión crea uno nuevo `emitido` enlazado.
- MID: `solicitado → asignado → sustentado → aprobado | desaprobado`.
- Evento de integración: `enviado → procesado | error`.

Agregar las máquinas en `src/validaciones/transiciones.ts` (líneas nuevas) y validar con `validarTransicion`.

---

## 7. MODELO DE INFORMACIÓN (TIPOS)

Archivo `src/tipos/academico.ts`:

```ts
export type TipoPrograma = 'curso' | 'diplomado' | 'mid';
export type EstadoPrograma = 'borrador' | 'publicado' | 'archivado';
export type ModoDesbloqueo = 'aprobar_para_avanzar' | 'libre';
export type PoliticaNota = 'mejor' | 'ultimo' | 'promedio';

export interface ReglasPrograma {
  intentosMaximos: number; esperaMinutos: number; politicaNota: PoliticaNota;
  minutosEvaluacion: number; preguntasPorEvaluacion: number; mostrarRespuestas: boolean;
  modoDesbloqueo: ModoDesbloqueo; mesesAcceso: number;
}

export interface Programa {
  id: string; codigo: string; tipo: TipoPrograma; nombre: string; descripcion: string;
  horas: number; modalidad: 'Virtual asincrónica'; estado: EstadoPrograma;
  productoId: string | null; cursoIds: string[]; moduloIds: string[]; midId: string | null;
  incluidoEnMembresia: boolean; reglas: ReglasPrograma; portada?: string;
  colores: [string, string]; creadoPor: string; fecha: string;
}

export interface Modulo {
  id: string; programaId: string; orden: number; nombre: string; horas: number;
  temaIds: string[]; timId: string;
}

export interface ContenidoVideo { titulo: string; minutos: number; portada?: string; urlVideo?: string }
export interface ContenidoLectura { titulo: string; contenido: string; minutos: number; descargable: boolean }
export interface ContenidoCaso { enunciado: string; ejercicios: Array<{ pregunta: string; respuestaGuia: string }>; minutos: number }

export interface Tema {
  id: string; moduloId: string; orden: number; nombre: string; horas: number; objetivos: string[];
  video: ContenidoVideo; lectura: ContenidoLectura; caso: ContenidoCaso; evaluacionMinutos: number;
}

export interface Tim { id: string; moduloId: string; nombre: string; horas: number; instrucciones: string; preguntaIds: string[] }

export type TipoPregunta = 'opcion_multiple' | 'seleccion_multiple' | 'verdadero_falso' | 'emparejar' | 'ordenar' | 'numerica';
export type AmbitoEvaluacion = 'tema' | 'tim';

export interface Pregunta {
  id: string; ambito: AmbitoEvaluacion; ambitoId: string; tipo: TipoPregunta; enunciado: string;
  opciones: string[]; correctas: number[]; pares?: Array<[string, string]>; orden?: string[];
  valorNumerico?: number; tolerancia?: number; explicacion?: string; activa: boolean;
}

export type Respuesta = number | number[] | null;

export interface PlanMembresia { id: string; nombre: string; meses: 1 | 2 | 3 | 6 | 9 | 12; productoId: string; activo: boolean }

export type EstadoMatricula = 'activa' | 'por_vencer' | 'vencida' | 'suspendida';
export type OrigenMatricula = 'compra' | 'membresia' | 'manual';

export interface MovimientoMatricula { fecha: string; actorId: string; accion: string; motivo?: string }

export interface Matricula {
  id: string; personaId: string; programaId: string; origen: OrigenMatricula; pedidoId: string | null;
  membresiaId: string | null; inicio: string; vencimiento: string; suspendida: boolean;
  intentosExtra: Record<string, number>; historial: MovimientoMatricula[];
}

export interface Membresia {
  id: string; personaId: string; planId: string; pedidoIds: string[];
  inicio: string; vencimiento: string; suspendida: boolean;
}

export interface ProgresoComponente { video: boolean; lectura: boolean; caso: boolean }

export interface IntentoEvaluacion {
  id: string; personaId: string; ambito: AmbitoEvaluacion; ambitoId: string; matriculaId: string;
  preguntaIds: string[]; respuestas: Record<string, Respuesta>; nota: number; aprobado: boolean;
  inicio: string; fin: string;
}

export type TipoDocumento = 'certificado' | 'diploma' | 'constancia_mid';

export interface DetalleDocumento { nombre: string; horas: number; nota: number }

export interface DocumentoAcademico {
  id: string; codigo: string; codigoVerificacion: string; tipo: TipoDocumento;
  personaId: string; programaId: string; nota: number; horas: number;
  fechaCulminacion: string; fechaEmision: string; detalle: DetalleDocumento[];
  estado: 'emitido' | 'anulado'; motivoAnulacion: string | null; reemplazaA: string | null; reemplazadoPor: string | null;
}

export type EstadoMid = 'solicitado' | 'asignado' | 'sustentado' | 'aprobado' | 'desaprobado';

export interface CriterioRubrica { criterio: string; peso: number; nota: number | null }

export interface SustentacionMid {
  id: string; personaId: string; programaId: string; titulo: string; resumen: string; archivo: string;
  fechaPropuesta: string; evaluadorId: string | null; fechaAsignada: string | null;
  rubrica: CriterioRubrica[]; notaFinal: number | null; observaciones: string | null; estado: EstadoMid;
}

export type TipoEventoLms = 'matricula_creada' | 'avance_actualizado' | 'curso_aprobado' | 'diploma_emitido'
  | 'certificado_anulado' | 'acceso_vencido' | 'mid_aprobado';

export interface EventoIntegracion {
  id: string; tipo: TipoEventoLms; personaId: string; programaId: string | null; fecha: string;
  carga: Record<string, string | number | boolean | null>; estado: 'enviado' | 'procesado' | 'error'; detalle: string;
}

export type EstadoElemento = 'bloqueado' | 'disponible' | 'en_curso' | 'aprobado' | 'desaprobado' | 'bloqueado_por_intentos';
export type EstadoNota = 'pendiente' | 'aprobado' | 'desaprobado';

export interface ResultadoNota { nota: number | null; estado: EstadoNota }
```

El progreso por componente se guarda como `Record<string, ProgresoComponente>` con clave `personaId|temaId`.

Notas de implementación (FASE L1): el estado de la matrícula y de la membresía no se guarda; se calcula con `estadoMatricula(matricula, fecha)` a partir de `vencimiento` y `suspendida`. Todas las preguntas valen lo mismo y se califican por todo o nada; la nota es `correctas x 20 / total`. Formatos de respuesta: opción múltiple y verdadero/falso `number` (Verdadero 0, Falso 1); selección múltiple `number[]`; emparejar y ordenar `number[]` (correcto si `respuesta[i] === i`); numérica `number` con tolerancia.

---

## 8. ESTRUCTURA DE CARPETAS NUEVA

```
src/
  tipos/academico.ts
  datos/academico/
    programas.ts          (diplomado, 2 cursos, MID, curso independiente)
    contenidos.ts         (30 temas con textos generados)
    preguntas.ts          (bancos por tema y por TIM)
    membresias.ts         (6 planes)
    matriculasIniciales.ts
    firmas.ts             (autoridades ficticias)
  motores/academico/
    notas.ts              (RA-01 a RA-05)
    desbloqueo.ts         (RA-06)
    calificacion.ts       (corrección por tipo de pregunta)
    certificacion.ts      (RA-07 a RA-09)
    accesos.ts            (RA-10, vencimientos)
  servicios/
    academico.ts          (programas, estructura, preguntas)
    matriculas.ts         (matrícula, membresías, renovación, suspensión)
    evaluaciones.ts       (iniciar, responder, enviar intento)
    certificados.ts       (emitir, anular, reemitir, verificar)
    pdfCertificados.ts    (jspdf + qrcode)
    mid.ts
    conectorLms.ts
  store/
    useAcademicoStore.ts  (programas, módulos, temas, TIM, preguntas, planes)
    useCampusStore.ts     (matrículas, membresías, progreso, intentos, documentos, MID, eventos)
  layouts/LayoutCampus.tsx
  paginas/campus/...      (pantallas C1 a C9)
  paginas/corporativo/academico/...  (pantallas P1 a P9)
  paginas/evaluador/BandejaMid.tsx
  paginas/publico/VerificarDocumento.tsx
  componentes/campus/     (ReproductorSimulado, VisorLectura, CuestionarioAutomatico,
                           RutaPrograma, TarjetaProgramaCampus, VistaPreviaCertificado, ...)
docs/
  API_LMS.md
```

---

## 9. PANTALLAS

### 9.1 Campus del estudiante (layout `LayoutCampus`, prefijo `/campus`, perfiles `cliente_alumno` y `afiliado`)

| N. | Ruta | Pantalla | Contenido mínimo | Req. |
|---|---|---|---|---|
| C1 | `/campus/programas` (`/campus` redirige aquí) | Mis programas | Tarjetas con avance, nota, estado de acceso y botón continuar; aviso de vencimiento. | LMS-051, 058 |
| C2 | `/campus/programas/:id` | Ruta del programa | Árbol de cursos, módulos, temas y TIM con estados; notas parciales. | LMS-052 |
| C3 | `/campus/temas/:id` | Tema | Pestañas Video, Lectura, Caso, Evaluación; navegación anterior/siguiente. | LMS-010 a 015, 053 |
| C4 | `/campus/evaluaciones/:ambito/:id` | Evaluación | Contador, preguntas, envío, resultado y retroalimentación. | LMS-020 a 026 |
| C5 | `/campus/tim/:id` | TIM | Formulario estructurado y resultado. | LMS-027 |
| C6 | `/campus/notas` | Mis notas | Tabla jerárquica de notas e intentos. | LMS-054 |
| C7 | `/campus/historial` | Historial académico | Programas por estado y documentos. | LMS-055 |
| C8 | `/campus/certificados` | Mis certificados | Descarga PDF, QR y verificación. | LMS-056 |
| C9 | `/campus/membresia` | Mi membresía | Plan, vencimiento, renovación (enlace al catálogo). | LMS-057, 063 |
| C10 | `/campus/mid` | Mi MID | Solicitud, entrega y resultado. | LMS-070, 071 |

### 9.2 Panel académico (layout corporativo, prefijo `/corporativo/academico`)

| N. | Ruta | Pantalla | Req. |
|---|---|---|---|
| P1 | `/corporativo/academico/resumen` (`/corporativo/academico` redirige aquí) | Resumen académico y estadísticas | LMS-088 |
| P2 | `/corporativo/academico/programas` | Programas | LMS-080 |
| P3 | `/corporativo/academico/programas/:id` | Editor de estructura, contenidos y reglas | LMS-081, 082, 084 |
| P4 | `/corporativo/academico/preguntas` | Banco de preguntas | LMS-083 |
| P5 | `/corporativo/academico/matriculas` | Matrículas y accesos | LMS-085, 066 |
| P6 | `/corporativo/academico/membresias` | Membresías | LMS-086 |
| P7 | `/corporativo/academico/certificados` | Certificados y diplomas | LMS-087, 049 |
| P8 | `/corporativo/academico/mid` | Sustentaciones MID y asignación | LMS-072 |
| P9 | `/corporativo/academico/reportes` | Reportes académicos | LMS-089 |

Nuevo grupo "Académico" en `navegacionCorporativo` con estas pantallas. Registrar todas en `src/rutas/pantallas.ts`.

### 9.3 Otras

| Ruta | Pantalla | Perfil |
|---|---|---|
| `/evaluador` | Bandeja MID del evaluador con rúbrica | `evaluador` |
| `/verificar`, `/verificar/:codigo` | Verificación pública de documentos | Público |
| `/corporativo/usuarios/:id` | Pestaña nueva "Académico" | Corporativo |
| `/corporativo/integraciones` | Registro de eventos del conector LMS | Corporativo |

---

## 10. FLUJOS DE DEMOSTRACIÓN NUEVOS (F09 a F13)

Agregar a la Guía de flujos (`src/datos/guiaFlujos.ts`) con detección automática donde aplique.

- **F09 - Compra y matrícula automática.** El alumno DEMO-L01 compra "Curso Liderazgo Comercial" (o una membresía), simula el cobro, entra a Campus ERICK y ve el programa activo con fecha de vencimiento. Detecta: matrícula nueva con origen compra.
- **F10 - Estudio y evaluación automática.** Ve el video, lee, completa el caso y rinde la evaluación del tema 1; desaprueba una vez (ej. 12/20) y aprueba en el segundo intento (ej. 18/20); se desbloquea el tema 2. Detecta: intento aprobado.
- **F11 - Certificado con QR.** DEMO-L06 tiene precargado el Curso Ventas Digitales con todo aprobado salvo el TIM del módulo 9: rinde el TIM, el curso se aprueba, se emite el certificado, lo descarga y abre `/verificar/:codigo`. Detecta: documento emitido nuevo.
- **F12 - Certificado y efecto en el rango.** DEMO-A01 tiene precargado el Curso Liderazgo Comercial (DEMO-CUR-01) con todo aprobado salvo el TIM del módulo 3; su estado formativo sigue en `cursando`. Al aprobarlo se emite el certificado, el conector registra el evento, el estado formativo pasa a `aprobado` y en Mi RUN el requisito "Formación aprobada" queda cumplido sin pulsar el botón simulado. El diploma de 120 h se demuestra con DEMO-L03.
- **F13 - Sustentación MID.** DEMO-L03 solicita el MID; corporativo asigna a DEMO-U03; el evaluador califica con la rúbrica; se emite la constancia; el diploma no cambia.

---

## 11. DATOS DE DEMOSTRACIÓN

### 11.1 Programas

- **DEMO-DIP-01 "Diplomado en Liderazgo y Gestión Comercial"** (120 h, publicado, incluido en membresía, MID DEMO-MID-01).
  - **DEMO-CUR-01 "Curso Liderazgo Comercial"** (60 h). Módulos: Fundamentos del liderazgo, Comunicación efectiva, Motivación y desempeño.
  - **DEMO-CUR-02 "Curso Gestión de Equipos y Ventas"** (60 h). Módulos: Planificación comercial, Gestión de equipos, Indicadores y seguimiento.
  - Cada módulo con 5 temas con nombres reales del tema y 1 TIM. Total 30 temas y 6 TIM.
- **DEMO-CUR-03 "Curso Ventas Digitales"** (60 h, independiente, publicado) con estructura completa de 3 módulos.
- **DEMO-MID-01 "Módulo de Investigación y Desarrollo"** (20 h).
- Reglas por defecto: 3 intentos, nota mejor, 30 min, 5 preguntas por evaluación, mostrar respuestas, desbloqueo `aprobar_para_avanzar`, 6 meses de acceso.

### 11.2 Contenidos y preguntas

- Textos de lectura y casos generados en español, coherentes con el tema, de 250 a 400 palabras por lectura.
- Bancos: 8 preguntas por tema (3 de opción múltiple, 2 de verdadero o falso, 1 de selección múltiple, 1 de ordenar y 1 numérica) y 8 ítems por TIM (incluye emparejar). Total: 45 temas, 9 TIM y 432 preguntas.

### 11.3 Catálogo

- Vincular `DEMO-PRD-01` ("Programa Liderazgo Comercial - Nivel 1") a DEMO-CUR-01 y `DEMO-PRD-07` ("Nivel 2") a DEMO-CUR-02; `DEMO-PRD-05` ("Taller de Ventas Digitales") a DEMO-CUR-03.
- Productos nuevos: "Diplomado en Liderazgo y Gestión Comercial" y 6 planes "Membresía ERICK 1/2/3/6/9/12 meses", todos con precio, VP y VC ficticios distintos.

### 11.4 Estudiantes y estados precargados

Implementado en `src/datos/academico/matriculasIniciales.ts` (24 matrículas, 289 intentos generados de forma determinista, 12 documentos, 55 eventos). Las filas nuevas de estado formativo están en `src/datos/academico/formacionCampus.ts` (DEMO-FOR-30 en adelante) y se agregan a `formacionInicial`.

| Persona | Estado precargado |
|---|---|
| DEMO-L01 | DEMO-CUR-01 por compra DEMO-P01, tema 1 aprobado y tema 2 disponible (F09 y F10). |
| DEMO-L02 | DEMO-CUR-01 aprobado; su certificado fue anulado por error tipográfico y reemitido. |
| DEMO-L03 | DEMO-DIP-01 aprobado con 2 certificados y diploma; DEMO-CUR-03 en curso; MID sin solicitar (F13). |
| DEMO-L04 | Membresía de 3 meses que vence en 5 días; DEMO-CUR-02 aprobado por membresía; DEMO-CUR-03 en curso con un intento desaprobado. |
| DEMO-L05 | DEMO-CUR-03 aprobado con matrícula vencida y certificado descargable; DEMO-CUR-01 y DEMO-CUR-02 sin avance. |
| DEMO-L06 | DEMO-CUR-03 con todo aprobado salvo el TIM del módulo 9 (F11). |
| DEMO-A01 | DEMO-CUR-01 con todo aprobado salvo el TIM del módulo 3 (F12). Estado formativo `cursando`. |
| DEMO-A03, A16, A17, A19 | Cursos aprobados con certificado, coherentes con su estado formativo `aprobado`. A17 con acceso vencido. |
| DEMO-A04, A24 | DEMO-CUR-03 sin avance (estado formativo `matriculado`). |
| DEMO-A18 | DEMO-CUR-01 en curso; su último evento de avance quedó en error para mostrar el reintento. |
| DEMO-A26 | DEMO-CUR-01 con el tema 5 bloqueado por intentos (para otorgar intentos extra). |
| DEMO-U03 | Evaluador académico. |

- Al menos 12 documentos emitidos, 1 anulado y 1 reemitido, para que el registro de certificados y la verificación muestren todos los casos.
- Al menos 20 eventos de integración históricos coherentes con lo anterior.
- `verificarConsistencia` agrega reglas: horas de cada programa, notas recalculadas iguales a las guardadas, un documento por estudiante y programa, y estado formativo coherente con el campus.

---

## 12. DISEÑO UI/UX

- Mantener la paleta, la tipografía y los componentes del proyecto. El campus usa el color acento para el progreso y el oro para los documentos.
- `LayoutCampus`: menú lateral propio (Mis programas, Mis notas, Historial, Certificados, Membresía, MID) con el logo "Campus ERICK", el mismo selector de rol, las notificaciones, la leyenda DEMOSTRACIÓN y un enlace "Volver a MLM 2027".
- Indicadores de avance con barras y anillos; estados con `Insignia` e icono, nunca solo con color.
- Evaluaciones accesibles: navegación por teclado, `fieldset`/`legend`, foco visible, opciones de 44 px.
- El certificado en PDF y su vista previa en pantalla deben verse igual. Usar fuentes estándar de `jspdf` (Helvetica) para evitar incrustar fuentes.

---

## 13. CRITERIOS DE ACEPTACIÓN (CL-01 a CL-20)

| CL | Criterio |
|---|---|
| CL-01 | No quedan apariciones de "ERIC S.A.C." en código, datos ni documentos. |
| CL-02 | El diplomado de demostración tiene 2 cursos, 6 módulos, 30 temas, 6 TIM y 120 h, y el editor rechaza estructuras que no cuadran. |
| CL-03 | Comprar y confirmar un curso o una membresía crea la matrícula sin intervención. |
| CL-04 | Una devolución suspende el acceso del programa devuelto sin borrar notas ni certificados. |
| CL-05 | Cada tema muestra video simulado, lectura con PDF descargable, caso y evaluación. |
| CL-06 | La evaluación se califica automáticamente de 0 a 20 y 14,00 desaprueba. |
| CL-07 | Los intentos respetan el máximo y la política de nota configurada. |
| CL-08 | El contenido se desbloquea según el modo configurado. |
| CL-09 | Las notas de módulo, curso y diplomado coinciden con las fórmulas de RA-02 y RA-03. |
| CL-10 | Al aprobar un curso se emite el certificado en el mismo instante; al aprobar ambos cursos, el diploma. |
| CL-11 | El PDF contiene todos los elementos de LMS-042 y el reverso de LMS-043. |
| CL-12 | El QR abre `/verificar/:codigo` y muestra válido, anulado o inexistente. |
| CL-13 | Los certificados se descargan con la matrícula vencida. |
| CL-14 | El MID es la única calificación manual y no altera el diploma. |
| CL-15 | El evaluador solo ve sus sustentaciones asignadas. |
| CL-16 | Corporativo crea programas, preguntas y matrículas sin tocar código. |
| CL-17 | Los reportes exportan CSV y PDF. |
| CL-18 | Aprobar el diplomado actualiza el estado formativo y el requisito de rango del afiliado mediante el conector, y queda en el registro de eventos. |
| CL-19 | Toda acción queda en la bitácora y "Reiniciar demostración" restablece el campus. |
| CL-20 | Campus, panel y verificación funcionan a 375, 768 y 1440 px sin scroll horizontal. |

---

## 14. PLAN DE FASES (6 FASES)

| Fase | Contenido | Requerimientos |
|---|---|---|
| **L1 - Base académica y datos** | Renombrar ERIC a ERICK; instalar `jspdf` y `qrcode`; tipos de la sección 7; perfil `evaluador` y módulos de permiso nuevos; datos de la sección 11 (programas, 30 temas, preguntas, planes, matrículas precargadas); stores con persistencia y reinicio; motores puros `notas`, `calificacion`, `desbloqueo`, `certificacion`, `accesos` con pruebas; máquinas de estado; reglas nuevas en `verificarConsistencia`; rutas y `LayoutCampus` con pantallas provisionales. | Sección 2, 3, 5, 6, 7; LMS-001 a 006, 022 a 024, 028 a 033 (lógica) |
| **L2 - Matrículas, membresías y pagos** | Conector `conectorLms.ts` y registro de eventos; matrícula automática al confirmar pedido; suspensión por devolución; membresías y renovación; vencimientos y avisos; pasarela simulada en el checkout de productos formativos; C1 Mis programas, C9 Mi membresía; entradas al campus desde Mi cuenta y el menú del afiliado. | LMS-050, 051, 057, 058, 060 a 067, 090, 091 |
| **L3 - Campus y evaluación automática** | C2 Ruta del programa, C3 Tema (reproductor simulado, lectura con PDF, caso), C4 Evaluación (todos los tipos de pregunta, contador, intentos, retroalimentación), C5 TIM, C6 Mis notas, C7 Historial; desbloqueo progresivo en vivo; eventos de avance. | LMS-010 a 015, 020 a 033, 052 a 055 |
| **L4 - Certificados y verificación** | Emisión automática idempotente; PDF A4 horizontal con reverso, firmas, código y QR; C8 Mis certificados; páginas públicas `/verificar`; anulación y reemisión; descarga con acceso vencido. | LMS-040 a 049, 056 |
| **L5 - Panel académico, MID y reportes** | P1 a P9: estadísticas, programas, editor de estructura y contenidos con validación de horas, banco de preguntas, reglas de aprobación, matrículas manuales e intentos extra, membresías, registro de certificados, reportes CSV y PDF; flujo MID completo con perfil evaluador, bandeja `/evaluador`, rúbrica y constancia. | LMS-070 a 089 |
| **L6 - Integración con MLM y control de calidad** | Estado formativo alimentado por el conector y efecto en el RUN; botón simulado como atajo; tarjeta de Integraciones "Conectado (simulado)" con registro de eventos; pestaña "Académico" en la ficha de persona; flujos F09 a F13 en la Guía; `docs/API_LMS.md`; actualización de `GUION_DEMOSTRACION.md`, `CHECKLIST_REQUERIMIENTOS.md` (LMS-001 a LMS-097) y `CLAUDE.md`; revisión de CL-01 a CL-20, pruebas de regresión del MLM y revisión responsive. | LMS-092 a 097; CL-01 a CL-20 |

Al final de cada fase: compilar (`npm run build`), lint (`npm run lint`), pruebas de la fase y regresión de los flujos F01 a F08 existentes.

---

## 15. FUERA DE ALCANCE

- Subida y almacenamiento de archivos de video (la reproducción real se admite solo con enlaces de YouTube insertados), envío de correos, pasarelas de pago reales y firma digital certificada.
- Cálculo de impuestos o facturación electrónica.
- Integración con Moodle u otro LMS externo (se documenta como opción futura en `docs/API_LMS.md`).
- Cambios en los motores de compensación del MLM.
- Actualización por la ampliación ERICK (`docs/PROMPT_ADMIN_EDUCATIVO_ERICK.md`, 15/11/2026): la subida de video SÍ se permite en el prototipo como archivo `.mp4` o `.webm` de hasta 300 MB guardado en IndexedDB del navegador (solo visible en el navegador donde se subió y borrado al reiniciar la demostración). Sigue fuera de alcance un servidor de videos real, la transmisión en vivo y la sincronización con calendarios externos.

---

## 16. ESTADO DE AVANCE

### FASE L1 - completada

Archivos nuevos: `src/tipos/academico.ts`; `src/datos/academico/` (`semillas.ts`, `programas.ts`, `contenidos.ts`, `preguntas.ts`, `membresias.ts`, `firmas.ts`, `fechasCampus.ts`, `formacionCampus.ts`, `matriculasIniciales.ts`, `verificarConsistenciaAcademica.ts`); `src/motores/academico/` (`notas.ts`, `calificacion.ts`, `desbloqueo.ts`, `accesos.ts`, `certificacion.ts`, `progreso.ts`); `src/store/useAcademicoStore.ts`, `src/store/useCampusStore.ts`; `src/layouts/LayoutCampus.tsx`, `src/layouts/LayoutEvaluador.tsx`; `src/rutas/navegacionCampus.ts`; `src/paginas/campus/PantallaProvisionalLms.tsx`; `pruebas/academico.prueba.ts`.

Pruebas: `npm run prueba:academico` (14 pruebas: RA-01 a RA-10, los seis tipos de pregunta, datos precargados y consistencia académica).

### FASE L2 - completada

Archivos nuevos: `src/servicios/eventosLms.ts`, `src/servicios/matriculas.ts`, `src/servicios/conectorLms.ts`, `src/hooks/useCampusPersona.ts`, `src/datos/academico/presentacionCampus.ts`, `src/componentes/campus/` (`TarjetaProgramaCampus.tsx`, `AnilloProgreso.tsx`, `AccesoAcademicoPedido.tsx`, `rutasCampus.ts`), `src/paginas/campus/MisProgramas.tsx`, `src/paginas/campus/MiMembresia.tsx`, `pruebas/matriculas.prueba.ts`.

Archivos con líneas agregadas: `servicios/pedidos.ts` (llamadas a `alConfirmarPedido` y `alDevolverPedido`), `paginas/publico/Checkout.tsx` (pasarela local simulada), `paginas/publico/DetallePedido.tsx` (tarjeta de acceso académico), `paginas/publico/MiCuenta.tsx` (acceso a Campus ERICK), `layouts/compartidos/MenuUsuario.tsx` (opción Campus ERICK), `layouts/LayoutCampus.tsx` (revisión de vencimientos al entrar), `rutas/Rutas.tsx`, `store/useCampusStore.ts` (`avisos`), `tipos/academico.ts` (eventos `acceso_suspendido` y `membresia_activada`).

Reglas implementadas: la matrícula nace solo con el pedido `confirmada`; recomprar un curso o un plan extiende desde el vencimiento vigente (o desde hoy si venció); una membresía da acceso a los programas `incluidoEnMembresia` y el estudiante se inscribe desde el campus; devolver la última compra de una membresía la suspende, devolver una renovación descuenta sus meses; devolver un curso suspende su matrícula sin borrar notas ni certificados; los avisos por vencer y vencido se generan una sola vez al entrar al campus.

Pruebas: `npm run prueba:matriculas` (9 pruebas: LMS-060 a LMS-066 y CL-04).

### FASES L3 a L6 - completadas

L3: `RutaPrograma`, `TemaCampus`, `EvaluacionCampus` (seis tipos de pregunta, contador, envío automático, retroalimentación), `TimCampus`, `MisNotas`, `HistorialAcademico`; servicios `evaluaciones.ts` y `datosCampus.ts`; motor `contexto.ts`.
L4: `servicios/certificados.ts` (emisión automática idempotente, anulación, reemisión, verificación), `servicios/pdfCertificados.ts` (jspdf y qrcode con carga diferida), `MisCertificados`, `VistaPreviaCertificado`, `VerificarDocumento` público.
L5: `servicios/academico.ts` (programas, estructura, reglas, preguntas, planes), `servicios/mid.ts`, páginas `paginas/corporativo/academico/*` (P1 a P9), `MiMid` y `paginas/evaluador/BandejaMid.tsx`.
L6: `servicios/formacionLms.ts` (estado formativo por conector, efecto en el RUN), evento del atajo simulado, registro de eventos en Integraciones, pestaña Académico en la ficha de persona, flujos F09 a F13 en la Guía, `docs/API_LMS.md`, guion y checklist actualizados.

Pruebas: `npm run pruebas` (14 académicas, 9 de matrículas y 7 del campus).

### Mejoras posteriores - completadas

Cierre de los requerimientos parciales del checklist: LMS-081 (subir y bajar temas y módulos en borrador: `moverTema` y `moverModulo` en `servicios/academico.ts`), LMS-082 (portada del video: `componentes/campus/CampoPortadaVideo.tsx`, visible en el reproductor de `TemaCampus`), LMS-085 (acción Extender acceso: `extenderAcceso` en `servicios/matriculas.ts`), LMS-088 (gráficos de avance y distribución de notas: `componentes/campus/GraficosAcademicos.tsx` y `distribucionNotas.ts`), LMS-089 (filtro por rango de fechas en `ReportesAcademicos`). LMS-011 (clases de YouTube: `utilidades/youtube.ts`, `componentes/campus/ReproductorYoutube.tsx`, enlaces de demostración en `datos/academico/videosYoutube.ts`; sin enlace se mantiene el video simulado).

Pruebas: `npm run pruebas` (14 académicas, 9 de matrículas, 7 del campus y 5 del panel).
