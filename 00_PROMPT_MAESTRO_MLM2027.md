# PROMPT MAESTRO - PROTOTIPO NAVEGABLE "MLM 2027"

Version del prompt: 1.0 (basado en "MLM 2027 - Documento de Requerimientos del Prototipo", Version 1.0, 10 nov 2026)
Herramienta de ejecucion: Claude Code
Carpeta del proyecto: `D:\Prototipo\Prototipo-MLM`
Sistema operativo: Windows (terminal PowerShell)

---

## 0. ROL, FORMA DE TRABAJO Y REGLAS OBLIGATORIAS

Actua como un equipo senior de UX/UI, arquitectura frontend y desarrollo React + TypeScript. Vas a construir, por fases, un **prototipo visual y navegable** de una plataforma comercial multinivel llamada **MLM 2027**, con genealogia Unilevel (patrocinio) y red de posiciones Trinaria (brazos A, B y C).

Este documento es la **fuente de verdad** del proyecto. Cada fase posterior se te entregara en un prompt separado ("FASE 1", "FASE 2", etc.). Todo lo que construyas en cualquier fase debe respetar este documento.

### 0.1 Reglas de trabajo (no negociables)

1. **Entorno Windows.** Todos los comandos que indiques deben ser compatibles con PowerShell en Windows. Usa rutas tipo `D:\Prototipo\Prototipo-MLM`. No uses comandos exclusivos de Linux/macOS (`rm -rf`, `cp`, `export VAR=`, `touch`, etc.); si necesitas su equivalente, usa el de PowerShell (`Remove-Item`, `Copy-Item`, `$env:VAR=`, `New-Item`).
2. **Prohibido usar emojis** en cualquier parte: codigo, textos de la interfaz, datos de prueba, comentarios, commits, mensajes de consola y respuestas. Donde se necesite un apoyo visual se usan **iconos de `lucide-react`**.
3. **Idioma:** toda la interfaz, los datos de prueba y los nombres de variables, funciones, archivos, tipos y componentes van en **espanol** (por ejemplo: `listarPedidos`, `calcularBonoUnilevel`, `PanelAfiliado.tsx`, `usePermisos`). Se permite ingles solo en palabras propias de librerias (props, hooks de React, etc.). Este documento esta escrito sin tildes por compatibilidad, pero **los textos visibles de la interfaz y los datos de prueba deben llevar tildes y enie correctamente** ("Demostración", "Período", "Liquidación", "Núñez"). Los identificadores de codigo van sin tildes ni enie. Guarda todos los archivos en UTF-8.
4. **Trabajo por fases.** No adelantes pantallas ni funcionalidades de fases que todavia no se han pedido. Al terminar cada fase:
   - Lista los archivos creados y modificados con su ruta exacta.
   - Indica los comandos para ejecutar y probar (PowerShell).
   - Indica que criterios de aceptacion (seccion 15) quedan cubiertos.
   - Confirma la revision responsive de la regla 11.
   - Deten el trabajo y espera la siguiente fase.
5. **No reescribir lo ya construido.** En fases posteriores agrega o extiende; no rehagas ni reorganices archivos que ya funcionan salvo que la fase lo pida. Si un cambio es imprescindible, explica el lugar exacto y el motivo.
6. **No inventar el Plan de Compensacion.** Las formulas definitivas aun no se entregan. Todo porcentaje, umbral, monto o reparto es **ficticio, editable y rotulado "DEMOSTRACION"**. Nunca presentes un resultado como liquidacion economica real ni como proyeccion de ingresos.
7. **Sin integraciones reales.** No se conecta pasarela de pago, banco, LMS, e-commerce ni servicio de correo. No se piden ni se guardan numeros reales de tarjeta. No se calcula impuesto oficial. Todo cobro, pago o integracion es simulado y debe decirlo en pantalla.
8. **Sin backend ni base de datos.** Los datos son **quemados en memoria** (archivos TypeScript en `src/datos/`) y se manipulan con un store global. Al recargar la pagina la demo vuelve a su estado inicial (es el comportamiento esperado). Debe existir un boton "Reiniciar demostracion".
9. **Calidad de codigo:** TypeScript estricto, sin `any`, componentes pequenos y reutilizables, sin comentarios en linea innecesarios, funciones de calculo puras y separadas de la interfaz.
10. **Si algo del documento es ambiguo**, no lo asumas como regla definitiva: implementalo como **parametro configurable** con un valor ficticio y deja una nota visible "Regla pendiente de definicion por el Plan de Compensacion".
11. **Responsive obligatorio en cada fase (mobile-first).** Cada pantalla se construye responsive desde la fase en que se crea, no se deja para la fase final:
   - Enfoque mobile-first: primero se disena para celular y luego se amplia a tableta y escritorio con los breakpoints de Tailwind (`sm`, `md`, `lg`, `xl`).
   - Ninguna pantalla provoca scroll horizontal de la pagina. Solo los arboles y las tablas anchas pueden desplazarse dentro de su propio contenedor (`overflow-x-auto`).
   - Botones, enlaces del menu y elementos tactiles con un alto minimo de 44 px.
   - Al cerrar cada fase, confirma explicitamente que revisaste las pantallas nuevas en 375 px (celular), 768 px (tableta) y 1440 px (escritorio), e indica cualquier ajuste pendiente.

### 0.2 Primera respuesta esperada (solo para este prompt maestro)

Al recibir este prompt **no escribas codigo de pantallas todavia**. Haz unicamente lo siguiente:

1. Confirma en un resumen corto que entendiste el alcance, los perfiles, las dos genealogias, los 7 motores, los limites de la demo y el plan de fases.
2. Crea en la raiz del proyecto el archivo `CLAUDE.md` con un resumen operativo de las reglas de la seccion 0, el stack (seccion 2), la estructura de carpetas (seccion 3) y la lista de fases (seccion 17), para que lo tengas presente en cada sesion.
3. Copia este documento completo a `docs\PROMPT_MAESTRO.md` y mueve `referencia_visual_MLM2027.html` (si esta en la raiz) a `docs\referencia_visual_MLM2027.html`.
4. Enumera preguntas abiertas si detectas alguna contradiccion. Despues espera la instruccion "FASE 1".

---

## 1. CONTEXTO DEL PROYECTO

### 1.1 Que es MLM 2027

Plataforma para comercializar bienes y servicios mediante una organizacion multinivel. Su nucleo es el registro de transacciones comerciales y la aplicacion de un plan de compensacion sobre **dos estructuras que coexisten**:

- **Genealogia Unilevel de patrocinio** (sponsor -> afiliado).
- **Red de posiciones Trinaria** con brazos **A, B y C**.

El sistema debe reflejar volumen, rangos, comisiones, liquidaciones y trazabilidad para afiliados y administracion.

### 1.2 Principio funcional (debe guiar todo el diseno)

> Las ventas alimentan VP y VC; la genealogia y las posiciones determinan el contexto organizacional; las reglas vigentes del periodo definen calificaciones y bonos; los resultados se registran con trazabilidad y pueden revisarse antes de pagar.

Glosario minimo que debe aparecer en una seccion de ayuda o en tooltips:

- **VP:** Volumen de Puntos.
- **VC:** Volumen Comisionable.
- **RUN de Cobro:** rango alcanzado en el periodo; determina la categoria aplicable a ese ciclo y es el que se usa para liquidar.
- **RUN Historico:** maximo rango alcanzado en la trayectoria; es reconocimiento.
- **Ciclo / periodo comercial:** intervalo configurable (demo: 14 dias) en el que se acumula volumen y se califica.
- **Corrida:** ejecucion simulada de calculo de bonos sobre un periodo, con una version de reglas y un conjunto de movimientos.
- **Liquidacion:** relacion de bonos, ajustes y total a pagar por afiliado y periodo.

### 1.3 Objetivo general

Disenar una plataforma cloud, clara y escalable que permita operar el back office comercial multinivel, mostrar el progreso del afiliado y administrar de forma controlada los procesos de calificacion, calculo de compensaciones y liquidacion. En esta etapa se construye **solo el prototipo navegable** que lo demuestra.

### 1.4 Objetivos especificos que el prototipo debe evidenciar

1. Centralizar usuarios, patrocinadores, ubicaciones Trinarias y datos comerciales en un modelo consistente.
2. Registrar ventas de bienes y servicios con **precio, VP y VC independientes**.
3. Calcular y presentar rangos **RUN de Cobro e Historico** por periodo sin confundirlos.
4. Organizar **motores de compensacion independientes y parametrizables**, con simulacion previa a cualquier liquidacion.
5. Ofrecer a cada afiliado un panel legible que explique desempeno, red, bonos y avance de rango.
6. Permitir auditoria de ajustes, reversiones, suspensiones y decisiones corporativas.
7. Preparar (de forma conceptual) la integracion posterior con comercio electronico, la plataforma educativa **ERIC S.A.C.** y proveedores de pago.

### 1.5 Alcance de la primera presentacion

Prototipo visual y navegable, con datos de prueba y acciones simuladas para ejemplificar el recorrido completo. **No** requiere integrar pasarela real, enviar dinero, conectar un LMS operativo ni ejecutar calculos oficiales del Plan de Compensacion.

### 1.6 Leyenda obligatoria

En todo el prototipo debe verse de forma permanente (barra superior o pie fijo) una franja discreta pero legible:

> **DEMOSTRACION** - Datos, usuarios, volumenes, porcentajes y montos ficticios. Ningun valor representa un plan de compensacion aprobado, una liquidacion real ni una proyeccion de ingresos. No se realizan cobros, pagos ni integraciones reales.

En el simulador, en bonos y en liquidaciones, la leyenda se repite junto al contenido (componente `LeyendaDemostracion`).

---

## 2. STACK TECNICO Y CONVENCIONES

### 2.1 Stack

| Elemento | Eleccion |
|---|---|
| Build / dev server | Vite (ultima version estable) |
| UI | React 19 + TypeScript (modo `strict`) |
| Estilos | Tailwind CSS v4 con `@tailwindcss/vite` |
| Enrutamiento | `react-router-dom` (v7) |
| Estado global | `zustand` (un store por dominio, combinados en `src/store/`) |
| Iconos | `lucide-react` (unica fuente de iconos) |
| Graficos | `recharts` (barras, lineas, donas para equilibrio de brazos) |
| Zoom y desplazamiento en arboles | `react-zoom-pan-pinch` |
| Fechas | `date-fns` con locale `es` |
| Exportables | Generacion de CSV con `Blob` y vista imprimible (`window.print`) para PDF; sin librerias adicionales |

No agregues otras dependencias sin justificarlo.

### 2.2 Instalacion inicial (se ejecutara en la FASE 1, PowerShell)

```powershell
cd D:\Prototipo\Prototipo-MLM
npm create vite@latest . -- --template react-ts
npm install
npm install react-router-dom zustand lucide-react recharts react-zoom-pan-pinch date-fns
npm install -D tailwindcss @tailwindcss/vite
npm run dev
```

### 2.3 Convenciones

- Componentes en `PascalCase.tsx`; hooks `useAlgo.ts`; utilidades y motores en `camelCase.ts`.
- Tipos e interfaces en `src/tipos/`, un archivo por dominio.
- Ningun componente de pagina importa datos crudos de `src/datos/`: siempre consulta el store o un servicio de `src/servicios/`.
- Los motores de calculo (`src/motores/`) son **funciones puras**: reciben datos y parametros, devuelven resultados con desglose. No modifican el store.
- Formato de moneda con `Intl.NumberFormat('es-PE', ...)` segun la moneda de la persona; formato de fechas `dd/MM/yyyy`.
- Todo identificador de demo empieza con el prefijo `DEMO-`.

---

## 3. ESTRUCTURA DE CARPETAS

```
Prototipo-MLM/
  CLAUDE.md
  docs/
    PROMPT_MAESTRO.md
    GUION_DEMOSTRACION.md          (se crea en la fase 6)
  src/
    main.tsx
    App.tsx
    index.css
    rutas/                         definicion de rutas y guardas por rol/permiso
    layouts/                       LayoutPublico, LayoutAfiliado, LayoutCorporativo
    paginas/
      publico/                     pantallas 01 a 04 + cuenta cliente/alumno + ingreso
      afiliado/                    pantallas 05 a 13
      corporativo/                 pantallas 14 a 25
    componentes/
      ui/                          Boton, Tarjeta, Tabla, Insignia, Modal, Pestanas, Campo, Selector,
                                   EstadoVacio, EstadoError, Confirmacion, Toast, Paginacion, Buscador
      demo/                        LeyendaDemostracion, SelectorRolDemo, BotonReiniciarDemo, GuiaFlujos
      redes/                       ArbolUnilevel, ArbolTrinario, NodoPersona, NodoPosicion, PanelBrazos
      rangos/                      InsigniaRun, BarraProgresoRun, ChecklistRequisitos
      bonos/                       TarjetaMotor, DesgloseBono, TablaCorrida
      graficos/                    GraficoEquilibrioBrazos, GraficoVolumenPeriodo, TarjetaKpi
    store/                         stores de zustand por dominio
    datos/                         datos quemados DEMO (seccion 13)
    tipos/                         interfaces TypeScript (seccion 8)
    motores/                       un archivo por motor de compensacion + motorRangos.ts
    servicios/                     operaciones de dominio (confirmarPedido, registrarDevolucion,
                                   asignarPosicion, crearCorrida, aprobarCierre, generarLiquidacion,
                                   suspenderCuenta, registrarBitacora, exportarCsv, etc.)
    validaciones/                  validarCicloPatrocinio, validarPosicionLibre, validarPermiso
    utilidades/                    formatos, fechas, generacion de IDs
```

---

## 4. ACTORES, PERFILES Y PERMISOS

### 4.1 Tipos de participantes (dato `tipo` de la persona)

| Tipo | Descripcion operativa | Comisiones |
|---|---|---|
| `cliente` | Compra bienes o servicios; puede ser referido por un afiliado. | No participa por defecto |
| `alumno` | Compra o accede a formacion; tiene estado academico proveniente del LMS futuro. | No participa por defecto |
| `empresario` | Empresario independiente: participa en la red y puede generar comisiones segun actividad y elegibilidad. | Sujeto a reglas |
| `corporativo` | Personal que administra catalogo, red, planes, finanzas, cumplimiento o soporte. | No aplica por defecto |

### 4.2 Perfiles de acceso (dato `perfil` / rol de sesion)

| Perfil | Acceso esperado | Layout |
|---|---|---|
| `superadministrador` | Toda la plataforma: configuracion, parametros, auditoria, cierres y administracion de permisos. | Corporativo |
| `operador` | Modulos corporativos asignados: consulta, soporte, ajustes propuestos y ejecucion segun autorizaciones. | Corporativo (menu filtrado) |
| `afiliado` | Solo sus ventas autorizadas, su organizacion, KPIs, comisiones y liquidaciones. | Afiliado |
| `cliente_alumno` | Su cuenta, compras, comprobantes y vinculos educativos aplicables; **sin arbol de comisiones**. | Publico + Mi cuenta |

### 4.3 Matriz de permisos configurable (MLM-005)

Acciones: `consultar`, `crear`, `editar`, `aprobar`, `liquidar`, `exportar`, `auditar`.

Modulos: `usuarios`, `catalogo`, `pedidos`, `redes`, `periodos`, `rangos`, `bonos`, `simulador`, `liquidaciones`, `compliance`, `auditoria`, `reportes`, `integraciones`, `configuracion`, `permisos`.

Reglas:

- El superadministrador tiene todo.
- El operador de demo tiene: consultar en todo; crear/editar en usuarios, pedidos y redes; **proponer** ajustes (crea ajuste en estado `propuesto`); aprobar en liquidaciones solo si se le activa; **no** tiene `permisos`, `configuracion` ni `auditar` por defecto. Un operador **nunca** recibe automaticamente permisos de superadministrador.
- La matriz se edita en la pantalla 15 (pestana "Permisos") y los cambios se aplican en vivo a la sesion demo.
- Las restricciones deben ser **visibles en la demo**: los botones sin permiso se muestran deshabilitados con icono `Lock` y tooltip "Requiere permiso: aprobar liquidaciones"; las rutas sin permiso muestran una pantalla "Acceso restringido".
- Hook `usePermiso(modulo, accion)` y componente `<ConPermiso modulo accion>` para envolver acciones.

### 4.4 Dos genealogias simultaneas

| Genealogia de patrocinio (Unilevel) | Estructura de posicion (Trinaria) |
|---|---|
| Relacion sponsor -> afiliado; organiza niveles de patrocinio y referidos directos. | Cada posicion ofrece tres brazos A, B y C; muestra produccion y recorrido estructural. |
| Se usa para reglas vinculadas al patrocinio, niveles y desarrollo de lideres. | Se usa para reglas de equilibrio, volumen usado, remanente, acumulacion y caducidad. |
| Un afiliado conserva su patrocinio aunque ocupe una posicion distinta en la Trinaria. | La ubicacion en A/B/C es un registro independiente, versionado y con historial de cambios. |

**Convencion de demo:** no existe colocacion automatica. El prototipo muestra una **seleccion administrativa** de posiciones disponibles en A/B/C. No se asumen reglas de colocacion, derrame ni reubicacion; en la interfaz se indica "Politica de colocacion pendiente de definicion".

---

## 5. REQUERIMIENTOS FUNCIONALES (MLM-001 a MLM-070)

Cada requerimiento debe quedar trazado a una o mas pantallas. Columna "Representacion en demo" = como se cumple en el prototipo. Columna "Pant." = numero de pantalla (seccion 9). "Fase" = fase en la que se construye.

### A. Identidad, usuarios y permisos

| ID | Funcionalidad | Representacion en demo | Pant. | Fase |
|---|---|---|---|---|
| MLM-001 | Acceso seguro: ingreso, recuperacion de acceso y sesion por rol | Pantalla de ingreso con usuarios demo por perfil (boton rapido por rol), pantalla "Recuperar acceso" que simula envio de enlace, cierre de sesion, redireccion por rol y guardas de ruta | Ingreso | 1 |
| MLM-002 | Registro por enlace conservando el referente | Ruta `/registro?ref=DEMO-A01`; el formulario muestra una tarjeta fija "Te invita: [nombre] - [codigo]" y el patrocinador no es editable por el usuario | 03 | 3 |
| MLM-003 | Clasificacion: cliente, alumno, empresario o corporativo | Selector de tipo en el registro (corporativo solo desde la pantalla 15); cada tipo habilita capacidades diferentes y se explica en el formulario | 03, 15 | 3, 5 |
| MLM-004 | Perfil de usuario: datos, patrocinador, estado, compras, roles e historial | Ficha de persona con pestanas: Datos, Patrocinio, Posicion Trinaria, Compras, RUN, Bonos, Liquidaciones, Historial | 15 | 5 |
| MLM-005 | Permisos configurables por perfil y modulo | Matriz editable (seccion 4.3) con efecto inmediato y restricciones visibles | 15 | 1, 5 |
| MLM-006 | Estados de cuenta: activo, pendiente, suspendido, bloqueado y su efecto | Insignia de estado y tabla de efectos (seccion 7.2); cambiar estado actualiza elegibilidad y retencion de comisiones | 15, 23 | 5, 6 |
| MLM-007 | Auditoria de acceso | Cada ingreso, cierre de sesion y accion sensible crea registro en bitacora | 24 | 1, 6 |

### B. Catalogo, ventas y volumen

| ID | Funcionalidad | Representacion en demo | Pant. | Fase |
|---|---|---|---|---|
| MLM-008 | Catalogo comercial: alta y edicion de bienes, servicios y programas formativos | CRUD en memoria con categoria `bien_fisico`, `servicio`, `programa_formativo` | 16 | 5 |
| MLM-009 | Precio / VP / VC separados y editables, sin equivalencia obligatoria | Tres campos independientes; validacion de que son numeros >= 0; nunca se calcula uno a partir de otro | 02, 16 | 3, 5 |
| MLM-010 | Carrito: articulos, cantidades, subtotal y resumen | Carrito con +/-, eliminar, subtotal de precio y, si el perfil lo permite, total VP y VC del pedido | 04 | 3 |
| MLM-011 | Confirmacion de compra con estados | Estados `borrador`, `pendiente`, `confirmada`, `cancelada`, `devuelta`, con linea de tiempo visible | 04, 12 | 3 |
| MLM-012 | Asociacion comercial: comprador, patrocinador cuando aplique y periodo | Al confirmar se registra comprador, referente/patrocinador y periodo abierto vigente | 04 | 3 |
| MLM-013 | Movimientos VP/VC: origen y reversion por transaccion | Cada pedido confirmado genera un `MovimientoVolumen` tipo `origen`; cada devolucion genera uno tipo `reversion` enlazado | 09, 24 | 3, 6 |
| MLM-014 | Historico de ventas con buscador | Busqueda por persona, producto, periodo, estado y comprobante | 12, 24 | 4, 6 |

### C. Redes Unilevel y Trinaria

| ID | Funcionalidad | Representacion en demo | Pant. | Fase |
|---|---|---|---|---|
| MLM-015 | Arbol Unilevel navegable | Arbol expandible: patrocinador arriba, directos y descendientes; clic en nodo abre resumen | 06, 17 | 4, 5 |
| MLM-016 | Profundidad hasta 7 niveles | Selector de profundidad 1-7 y encabezados "Nivel 1 ... Nivel 7"; la red demo llega a 7 niveles bajo DEMO-A01 | 06 | 4 |
| MLM-017 | Arbol Trinario con brazos A, B y C, navegacion y zoom | Cada posicion muestra tres ranuras rotuladas A, B, C (ocupada o "Disponible"), con zoom, desplazamiento y boton centrar | 07, 17 | 4, 5 |
| MLM-018 | Colocacion separada sin modificar patrocinador | Asignar posicion solo cambia la entidad `PosicionTrinaria`; un aviso confirma "El patrocinador no cambia" | 17 | 5 |
| MLM-019 | Produccion por brazo | Resumen de VP y VC de A, B y C por periodo | 07, 09 | 4 |
| MLM-020 | Volumen de compensacion: utilizado, restante, acumulado, caducado | Tabla y grafico por brazo segun regla parametrizada ficticia | 09 | 4 |
| MLM-021 | Historial estructural | Cada colocacion o movimiento registra usuario, fecha, motivo, valor anterior y nuevo | 17, 24 | 5 |
| MLM-022 | Busqueda en red | Buscar por nombre, codigo, sponsor, rango y posicion; resalta y centra el nodo | 06, 07, 17 | 4, 5 |
| MLM-023 | Proteccion de estructura | `validarCicloPatrocinio` y `validarPosicionLibre`; si se intenta un ciclo o una posicion duplicada se muestra estado de error explicativo y no se guarda | 17 | 5 |

### D. Periodos, actividad y rangos

| ID | Funcionalidad | Representacion en demo | Pant. | Fase |
|---|---|---|---|---|
| MLM-024 | Calendario configurable de ciclos (demo 14 dias, editable) | Lista de ciclos con duracion editable, fechas de inicio/cierre y estado | 18 | 5 |
| MLM-025 | Evaluacion mensual diferenciada | Calendario mensual separado del de ciclos, usado por reglas marcadas como "mensual" | 18 | 5 |
| MLM-026 | Catalogo RUN | Exactamente: RUN300, RUN1K, RUN3K, RUN5K, RUN10K, RUN30K, RUN50K, RUN100K, RUN300K, RUN500K, RUN1M | 19 | 5 |
| MLM-027 | Condiciones de rango | Editor por rango: volumen (VP/VC personal y grupal), activos, equilibrio de brazos, lideres calificados, formacion aprobada; todos con valor ficticio editable | 19 | 5 |
| MLM-028 | RUN de Cobro | Resultado del periodo; usado para liquidar | 05, 10 | 4 |
| MLM-029 | RUN Historico | Maximo de la trayectoria; visualmente distinto (insignia de reconocimiento) | 05, 10 | 4 |
| MLM-030 | Progreso de calificacion | Barra + checklist con cumplido, faltante y **fuente de calculo** de cada requisito | 10 | 4 |
| MLM-031 | Historial de cierres | Lista de periodos con parametros vigentes y resultados de calificacion | 18 | 5 |
| MLM-032 | Parametros versionados | Cada cambio crea nueva version con vigencia, actor, fecha y motivo | 19, 20 | 5, 6 |
| MLM-033 | Simulacion de rango | Boton "Previsualizar" que muestra cuantas personas cambiarian de RUN con la regla editada antes de habilitarla | 19 | 5 |

### E. Motores de compensacion (7 conceptos separados)

| ID | Motor | Representacion en demo | Pant. | Fase |
|---|---|---|---|---|
| MLM-034 | Actividad comercial | Motor independiente sobre ventas y actividad elegible | 20, 21 | 6 |
| MLM-035 | Patrocinio y activacion | Basado en incorporacion **con actividad comercial efectiva** (primer pedido confirmado), nunca en el alta aislada | 20, 21 | 6 |
| MLM-036 | Unilevel | Profundidad configurable hasta 7 niveles y condiciones de elegibilidad por nivel | 20, 21, 11 | 6, 4 |
| MLM-037 | Trinario | Produccion A/B/C y balance de volumen con cuentas de remanente | 20, 21 | 6 |
| MLM-038 | Generaciones | Motor separado para desarrollo de lideres y generaciones calificadas | 20, 21 | 6 |
| MLM-039 | Bono de rango | Reglas de ascenso, mantenimiento o consistencia de RUN | 20, 21 | 6 |
| MLM-040 | Fondo de liderazgo | Reglas para rangos superiores e incentivos corporativos | 20, 21 | 6 |
| MLM-041 | Trazabilidad por bono | Desglose: base, regla (version), fuente (movimientos/personas), periodo, ajuste y resultado ilustrativo | 11, 21, 22 | 4, 6 |

### F. Calculo, liquidaciones y ajustes

| ID | Funcionalidad | Representacion en demo | Pant. | Fase |
|---|---|---|---|---|
| MLM-042 | Simulacion previa | Corrida con reglas y datos de demostracion identificados | 21 | 6 |
| MLM-043 | Calculo reproducible | Cada corrida guarda version de reglas, periodo y lista de IDs de movimientos; boton "Reproducir corrida" devuelve el mismo resultado | 21 | 6 |
| MLM-044 | Estados de comision | `estimada`, `en_revision`, `aprobada`, `retenida`, `liquidada`, `revertida` | 11, 22 | 4, 6 |
| MLM-045 | Aprobacion de cierre | Flujo: corrida en revision -> revision de partidas -> aprobacion del periodo (requiere permiso `aprobar`) | 18, 22 | 6 |
| MLM-046 | Liquidaciones | Afiliado, bonos, descuentos/ajustes, total y estado de desembolso | 12, 22 | 4, 6 |
| MLM-047 | Devoluciones | Reversion trazable de VP, VC y comisiones afectadas | 23 | 6 |
| MLM-048 | Correcciones | Ajuste excepcional con motivo, soporte (adjunto simulado) y autorizacion registrada | 23 | 6 |
| MLM-049 | Exportables | Descarga CSV y vista imprimible de liquidaciones y resumenes | 22, 24 | 6 |

### G. Back office del afiliado

| ID | Funcionalidad | Representacion en demo | Pant. | Fase |
|---|---|---|---|---|
| MLM-050 | Inicio del afiliado | KPIs: RUN Cobro, RUN Historico, VP, VC y ciclo vigente (dias restantes) | 05 | 4 |
| MLM-051 | Mi organizacion | Arbol Unilevel y Trinario accesibles desde el mismo menu "Mis redes" | 06, 07 | 4 |
| MLM-052 | Mis directos | Patrocinados, clientes, compras y actividad permitida | 08 | 4 |
| MLM-053 | Mis brazos | Produccion A/B/C con grafico de equilibrio y saldos explicados | 09 | 4 |
| MLM-054 | Mis bonos | Desglose por concepto y periodo | 11 | 4 |
| MLM-055 | Mis liquidaciones | Historial de montos, estados y comprobantes | 12 | 4 |
| MLM-056 | Mi proximo RUN | Progreso hacia el siguiente rango y requisitos no cumplidos | 10 | 4 |

### H. Corporativo, compliance y auditoria

| ID | Funcionalidad | Representacion en demo | Pant. | Fase |
|---|---|---|---|---|
| MLM-057 | Panel general | KPIs de ventas, afiliados, rangos, bonificaciones, periodos y obligaciones de pago (simuladas) | 14 | 5 |
| MLM-058 | Administracion de red | Consulta y mantenimiento autorizado de genealogias y posiciones | 17 | 5 |
| MLM-059 | Alertas de integridad | Bandeja: posibles duplicados, patrones atipicos, estructuras inconsistentes | 14, 23 | 5, 6 |
| MLM-060 | Bloqueos y retenciones | Suspender cuenta o retener pago sin borrar historia | 23 | 6 |
| MLM-061 | Devoluciones auditables | Relacion visible pedido -> reversion -> ajuste de bono | 23, 24 | 6 |
| MLM-062 | Bitacora | Quien, que, cuando, por que, valor anterior / nuevo | 24 | 6 |
| MLM-063 | Configuracion | Panel de topes, rangos, bonos, VP/VC, calendarios y elegibilidad | 20 | 6 |
| MLM-064 | Reportes | Filtros por afiliado, producto, RUN, periodo, estado y exportacion | 24 | 6 |

### I. Integraciones, escalabilidad y operacion

| ID | Funcionalidad | Representacion en demo | Pant. | Fase |
|---|---|---|---|---|
| MLM-065 | LMS externo | Estados ilustrativos `matriculado`, `cursando`, `aprobado` como condicion posible de rango; conector "Pendiente de integracion" | 13, 25 | 4, 6 |
| MLM-066 | Comercio externo | Tarjeta de conector futuro "Importar ventas y estatus desde e-commerce" (no funcional) | 25 | 6 |
| MLM-067 | Pagos | Interfaz desacoplada: estados de confirmacion de cobro y de pago posterior, siempre simulados | 25 | 6 |
| MLM-068 | Multipais | Modelo con pais, moneda, idioma, tributos (campo informativo) y metodo de pago por mercado | 20, 25 | 6 |
| MLM-069 | Notificaciones | Centro de notificaciones (icono `Bell`) con avisos de compra, cambio de estado, cierre y disponibilidad de liquidaciones | Todos los layouts | 1, 6 |
| MLM-070 | Resiliencia | Tarjeta informativa en integraciones: respaldos, monitoreo, recuperacion y permisos sobre datos sensibles (descriptivo, no funcional) | 25 | 6 |

---

## 6. REGLAS DE NEGOCIO (RN-01 a RN-15) Y COMO SE APLICAN EN EL CODIGO

| ID | Regla | Aplicacion obligatoria en el prototipo |
|---|---|---|
| RN-01 | Unilevel y Trinaria coexisten: patrocinador y padre de posicion son referencias independientes. | Entidades separadas `Patrocinio` y `PosicionTrinaria`; ninguna funcion modifica una al cambiar la otra. |
| RN-02 | No todos los inscritos tienen derecho a bonos; depende de tipo, estado y condiciones del periodo. | Funcion `evaluarElegibilidad(persona, periodo)` que devuelve `{ elegible, motivos[] }`; los motivos se muestran en pantalla. |
| RN-03 | Cada producto conserva precio, VP y VC distintos; las ventas confirmadas son el origen identificable del volumen. | Solo `confirmarPedido` crea movimientos de volumen; cada movimiento guarda `pedidoId`. |
| RN-04 | Ciclos configurables con duracion e inicio/cierre; 14 dias es propuesta inicial, no fija. | Duracion editable; al cambiarla se recalculan fechas de ciclos **futuros** unicamente. |
| RN-05 | RUN de Cobro por ciclo; RUN Historico es el maximo. Para liquidar se usa el de Cobro. | Los motores reciben siempre `runCobro`; `runHistorico = max(historico previo, runCobro)`. |
| RN-06 | Los 11 RUN forman un catalogo configurable; sus condiciones definitivas no estan fijadas. | Umbrales ficticios marcados "DEMOSTRACION"; editables en pantalla 19. |
| RN-07 | Bono Unilevel con profundidad maxima configurable de hasta 7 niveles. | Parametro `profundidadMaxima` con validacion 1..7. |
| RN-08 | En Trinario existen saldos distinguibles: generado, utilizado, restante, acumulado y caducado; reglas de consumo y expiracion versionadas. | Entidad `SaldoBrazo` por persona/periodo/brazo con esos 5 campos; regla en `VersionReglas`. |
| RN-09 | Motores de bonos separados. | Un archivo por motor en `src/motores/` con la misma firma; nunca se mezclan en una sola funcion. |
| RN-10 | Devolucion o anulacion posterior al calculo genera ajuste o reversion identificable; no se destruye el registro anterior. | Prohibido borrar o sobrescribir pedidos, movimientos o bonos: se crean registros nuevos `reversion` / `ajuste` enlazados. |
| RN-11 | Ajustes excepcionales exigen rol autorizado, motivo y evidencia; las posiciones tambien conservan trazabilidad. | Formularios con motivo obligatorio (minimo 10 caracteres) y adjunto simulado; registro en bitacora. |
| RN-12 | Solo liquidaciones aprobadas pasan a apto para desembolso; no se ejecutan pagos reales. | Maquina de estados que impide saltos; el boton de desembolso dice "Marcar como liquidada (simulado)". |
| RN-13 | La formacion externa puede incorporarse a la calificacion mediante estado de aprobacion; el LMS es independiente. | Requisito de rango tipo `formacion` que lee `EstadoFormativo.estado === 'aprobado'`. |
| RN-14 | Modificar parametros afecta periodos segun vigencia; una regla nueva no reescribe un cierre anterior. | Cada periodo cerrado guarda `versionReglasId`; al editar reglas se crea version nueva con `vigenteDesde`. |
| RN-15 | Indicadores del afiliado respetan su alcance; no revelan datos privados de terceros. | En vistas de afiliado: correos y telefonos de terceros enmascarados (`m***@correo.demo`), sin ver ganancias de otros afiliados, solo su organizacion descendente. |

---

## 7. ESTADOS Y MAQUINAS DE ESTADO

Toda transicion se hace mediante un servicio que valida la transicion permitida, exige permiso cuando corresponde y registra la bitacora. Las transiciones no permitidas muestran un mensaje de error claro.

### 7.1 Pedido (MLM-011)

`borrador -> pendiente -> confirmada -> devuelta`
`borrador | pendiente -> cancelada`

- Solo `confirmada` genera movimientos de volumen (origen).
- `devuelta` genera movimientos de reversion y ajustes de bono; el pedido original y sus movimientos se conservan.
- La confirmacion es simulada ("Simular confirmacion de cobro"); nunca se piden datos de tarjeta.

### 7.2 Cuenta (MLM-006) y su efecto operativo

| Estado | Puede ingresar | Puede comprar | Genera volumen | Elegible a bonos | Comisiones |
|---|---|---|---|---|---|
| `activo` | Si | Si | Si | Segun reglas | Normales |
| `pendiente` | Si (limitado) | No | No | No | No se generan |
| `suspendido` | Si (solo lectura) | No | No | Se calculan pero quedan retenidas | `retenida` |
| `bloqueado` | No | No | No | No | `retenida` |

El cambio de estado nunca borra historia; se registra motivo y actor.

### 7.3 Comision / bono (MLM-044)

`estimada -> en_revision -> aprobada -> liquidada`
`en_revision | aprobada -> retenida -> (liberada) aprobada`
`aprobada | liquidada -> revertida` (siempre mediante un registro de ajuste)

### 7.4 Liquidacion (MLM-046, RN-12)

`borrador -> en_revision -> aprobada -> apta_para_desembolso -> liquidada_simulada`
`en_revision | aprobada -> retenida`

Solo `aprobada` puede pasar a `apta_para_desembolso`. El ultimo estado se rotula "Liquidada (simulada, sin transferencia)".

### 7.5 Corrida de calculo (MLM-042, MLM-043)

`simulada -> en_revision -> aprobada | rechazada`

Una corrida aprobada queda congelada (solo lectura). Generar la liquidacion de una corrida es **idempotente**: si se ejecuta dos veces, la segunda devuelve la existente y muestra "Ya existe una liquidacion para esta corrida; no se duplica".

### 7.6 Periodo (MLM-024, MLM-045)

`programado -> abierto -> en_cierre -> cerrado`

Un periodo `cerrado` conserva su `versionReglasId` y sus resultados; no se recalcula con reglas nuevas.

### 7.7 Estado formativo (MLM-065)

`matriculado -> cursando -> aprobado` (dato de prueba; el cambio se simula desde la pantalla 13 con un boton "Simular actualizacion desde LMS").

### 7.8 Ajuste (MLM-048)

`propuesto -> autorizado -> aplicado` o `propuesto -> rechazado`. El operador propone; el superadministrador autoriza (o el operador si tiene el permiso `aprobar` en compliance).

---

## 8. MODELO DE INFORMACION (TIPOS TYPESCRIPT)

Entidades separadas, nunca tablas planas. Los nombres no implican el esquema fisico final de base de datos. Crea estos tipos en `src/tipos/` (puedes agregar campos auxiliares, no quitar).

```ts
export type TipoPersona = 'cliente' | 'alumno' | 'empresario' | 'corporativo';
export type PerfilAcceso = 'superadministrador' | 'operador' | 'afiliado' | 'cliente_alumno';
export type EstadoCuenta = 'activo' | 'pendiente' | 'suspendido' | 'bloqueado';
export type Brazo = 'A' | 'B' | 'C';
export type CodigoRun = 'RUN300' | 'RUN1K' | 'RUN3K' | 'RUN5K' | 'RUN10K' | 'RUN30K'
  | 'RUN50K' | 'RUN100K' | 'RUN300K' | 'RUN500K' | 'RUN1M';
export type CodigoMotor = 'actividad_comercial' | 'patrocinio_activacion' | 'unilevel'
  | 'trinario' | 'generaciones' | 'bono_rango' | 'fondo_liderazgo';

export interface Persona {
  id: string; codigo: string; nombres: string; apellidos: string;
  tipo: TipoPersona; perfil: PerfilAcceso; estado: EstadoCuenta;
  correo: string; telefono: string; documento: string;
  pais: string; moneda: string; idioma: string;
  fechaAlta: string; referenteId: string | null;
}

export interface Patrocinio {
  id: string; personaId: string; patrocinadorId: string | null;
  fechaRelacion: string; historial: CambioRegistro[];
}

export interface PosicionTrinaria {
  id: string; personaId: string; padrePosicionId: string | null; brazo: Brazo | null;
  fecha: string; estado: 'activa' | 'inactiva'; version: number; cambios: CambioRegistro[];
}

export interface Producto {
  id: string; codigo: string; nombre: string; descripcion: string;
  categoria: 'bien_fisico' | 'servicio' | 'programa_formativo';
  precio: number; vp: number; vc: number; moneda: string;
  vigenteDesde: string; vigenteHasta: string | null; activo: boolean;
  proveedorFormativo?: string; imagen?: string;
}

export interface ItemPedido { productoId: string; cantidad: number; precioUnitario: number; vpUnitario: number; vcUnitario: number; }

export interface Pedido {
  id: string; compradorId: string; referenteId: string | null; periodoId: string;
  items: ItemPedido[]; totalPrecio: number; totalVp: number; totalVc: number;
  estado: 'borrador' | 'pendiente' | 'confirmada' | 'cancelada' | 'devuelta';
  fecha: string; comprobante: string; eventos: EventoPedido[];
}

export interface EventoPedido { estado: Pedido['estado']; fecha: string; actorId: string; detalle: string; }

export interface MovimientoVolumen {
  id: string; tipo: 'origen' | 'reversion' | 'ajuste'; pedidoId: string | null;
  movimientoOrigenId: string | null; personaId: string; periodoId: string;
  vp: number; vc: number; fecha: string; motivo: string;
}

export interface Periodo {
  id: string; nombre: string; tipo: 'ciclo' | 'mensual'; fechaInicio: string; fechaFin: string;
  duracionDias: number; estado: 'programado' | 'abierto' | 'en_cierre' | 'cerrado';
  versionReglasId: string;
}

export interface VersionReglas {
  id: string; numero: number; vigenteDesde: string; vigenteHasta: string | null;
  actorId: string; fecha: string; motivo: string;
  rangos: DefinicionRango[]; motores: ConfiguracionMotor[]; trinario: ReglaTrinaria;
  topes: { maximoPorCicloAfiliado: number }; esDemostracion: true;
}

export interface DefinicionRango {
  codigo: CodigoRun; orden: number; nombreVisible: string; requisitos: RequisitoRango[];
}

export interface RequisitoRango {
  id: string; tipo: 'vp_personal' | 'vp_grupal' | 'vc_grupal' | 'directos_activos'
    | 'equilibrio_brazos' | 'lideres_calificados' | 'formacion_aprobada';
  descripcion: string; valor: number; evaluacion: 'ciclo' | 'mensual';
}

export interface ReglaTrinaria {
  reglaConsumo: string; ciclosCaducidad: number; porcentajeIlustrativo: number;
}

export interface SaldoBrazo {
  personaId: string; periodoId: string; brazo: Brazo;
  generadoVp: number; generadoVc: number; utilizado: number; restante: number;
  acumulado: number; caducado: number;
}

export interface CalificacionRun {
  id: string; personaId: string; periodoId: string;
  runCobro: CodigoRun | null; runHistorico: CodigoRun | null;
  desglose: ResultadoRequisito[];
}

export interface ResultadoRequisito {
  requisitoId: string; descripcion: string; requerido: number; logrado: number;
  cumple: boolean; fuente: string;
}

export interface ConfiguracionMotor {
  codigo: CodigoMotor; nombre: string; activo: boolean; descripcion: string;
  parametros: ParametroMotor[];
}

export interface ParametroMotor { clave: string; etiqueta: string; valor: number | string | boolean; unidad?: string; }

export interface CorridaCalculo {
  id: string; periodoId: string; versionReglasId: string; movimientoIds: string[];
  estado: 'simulada' | 'en_revision' | 'aprobada' | 'rechazada';
  creadaPor: string; fecha: string; claveIdempotencia: string; resultados: BonoComision[];
}

export interface BonoComision {
  id: string; corridaId: string; personaId: string; motor: CodigoMotor; periodoId: string;
  base: number; regla: string; fuente: string[]; calculo: string; monto: number;
  estado: 'estimada' | 'en_revision' | 'aprobada' | 'retenida' | 'liquidada' | 'revertida';
  ajustes: string[]; elegible: boolean; motivosNoElegible: string[];
}

export interface Ajuste {
  id: string; tipo: 'devolucion' | 'correccion' | 'retencion' | 'liberacion';
  personaId: string; periodoId: string; referenciaId: string; monto: number; vp: number; vc: number;
  motivo: string; evidencia: string | null;
  estado: 'propuesto' | 'autorizado' | 'aplicado' | 'rechazado';
  propuestoPor: string; autorizadoPor: string | null; fecha: string;
}

export interface Liquidacion {
  id: string; personaId: string; periodoId: string; corridaId: string;
  conceptos: { motor: CodigoMotor; monto: number }[]; ajustes: string[];
  total: number; moneda: string;
  estado: 'borrador' | 'en_revision' | 'aprobada' | 'apta_para_desembolso' | 'retenida' | 'liquidada_simulada';
  aprobaciones: { actorId: string; fecha: string; accion: string }[];
  comprobante: string | null;
}

export interface EstadoFormativo {
  id: string; personaId: string; programaExterno: string; proveedor: string;
  estado: 'matriculado' | 'cursando' | 'aprobado'; fechaActualizacion: string;
}

export interface Bitacora {
  id: string; actorId: string; accion: string; modulo: string; fechaHora: string;
  motivo: string; antes: unknown; despues: unknown; referenciaId: string | null;
}

export interface CambioRegistro { fecha: string; actorId: string; motivo: string; antes: unknown; despues: unknown; }

export interface AlertaIntegridad {
  id: string; tipo: 'duplicado' | 'patron_atipico' | 'estructura_inconsistente';
  personasIds: string[]; descripcion: string; severidad: 'baja' | 'media' | 'alta';
  estado: 'abierta' | 'en_revision' | 'resuelta'; resolucion: string | null;
}

export interface Notificacion {
  id: string; personaId: string | null; tipo: 'compra' | 'estado' | 'cierre' | 'liquidacion';
  titulo: string; mensaje: string; fecha: string; leida: boolean;
}

export interface Conector {
  id: string; nombre: string; tipo: 'lms' | 'ecommerce' | 'pagos' | 'notificaciones';
  estado: 'pendiente_integracion' | 'simulado' | 'futuro'; descripcion: string;
}

export interface Mercado { pais: string; moneda: string; idioma: string; tributos: string; metodosPago: string[]; }

export interface MatrizPermisos { perfil: PerfilAcceso; permisos: Record<string, string[]>; }
```

---

## 9. PANTALLAS (25 obligatorias + auxiliares)

Diseno responsive (escritorio y movil). Tres recorridos: cliente/alumno, afiliado y corporativo. Las acciones navegan entre vistas coherentes usando datos consistentes entre venta, red y liquidacion. Cada pantalla debe tener estados de **carga**, **vacio**, **confirmacion** y **error** cuando aplique.

### 9.1 Auxiliares

| Ruta | Pantalla | Contenido |
|---|---|---|
| `/ingresar` | Ingreso | Formulario usuario/clave (cualquier clave sirve en demo) y botones "Entrar como: Superadministrador / Operador / Afiliado DEMO-A01 / Cliente DEMO-C01 / Alumno DEMO-L01". Enlace a recuperar acceso. (MLM-001) |
| `/recuperar-acceso` | Recuperar acceso | Campo correo -> confirmacion "Se enviaria un enlace (simulado)". |
| `/cuenta` | Mi cuenta (cliente/alumno) | Datos, compras, comprobantes, estado formativo si es alumno. Sin arbol de comisiones. |
| `/acceso-restringido` | Acceso restringido | Mensaje con el permiso faltante y boton volver. |
| `*` | No encontrada | 404 con enlace a inicio. |

### 9.2 Publico / comercial

| N. | Ruta | Pantalla | Contenido minimo | Req. |
|---|---|---|---|---|
| 01 | `/` | Inicio y presentacion | Hero de MLM 2027, categorias (bienes, servicios, programas formativos), destacados, como funciona (comprar / afiliarse / formarse), llamado a registro. | - |
| 02 | `/catalogo`, `/catalogo/:id` | Catalogo y ficha | Filtros por categoria y busqueda; ficha con descripcion, precio y, **solo si el perfil es afiliado o corporativo**, VP y VC (cliente/alumno y visitante ven solo precio). Boton agregar al carrito. | MLM-008, 009 |
| 03 | `/registro?ref=CODIGO` | Registro desde enlace | Tarjeta fija del patrocinador (nombre, codigo, foto/avatar de iniciales); selector de tipo (cliente, alumno, empresario); datos basicos; aceptacion de terminos demo. Sin `ref` valido: aviso "Registro sin patrocinador; corporativo lo asignara". Confirmacion final con resumen. | MLM-002, 003 |
| 04 | `/carrito`, `/checkout`, `/pedido/:id` | Carrito y confirmacion | Carrito (MLM-010); checkout con comprador, referente y periodo vigente (MLM-012); boton "Simular confirmacion de cobro"; pantalla del pedido con linea de tiempo de estados (MLM-011) y movimientos VP/VC generados. | MLM-010 a 013 |

### 9.3 Afiliado (layout con menu lateral; prefijo `/afiliado`)

| N. | Ruta | Pantalla | Contenido minimo | Req. |
|---|---|---|---|---|
| 05 | `/afiliado/inicio` | Dashboard de desempeno y RUN | KPIs: RUN de Cobro, RUN Historico (visualmente distintos, CA-08), VP y VC del ciclo, ciclo vigente con dias restantes, directos activos, estado de cuenta, resumen de bonos estimados, accesos rapidos. | MLM-050 |
| 06 | `/afiliado/redes/unilevel` | Mi genealogia Unilevel | Arbol expandible por niveles (1 a 7), selector de profundidad, buscador, vista alternativa en lista por nivel (movil). Tarjeta de nodo: nombre, codigo, RUN, estado, VP del ciclo (datos de contacto enmascarados). | MLM-015, 016, 022 |
| 07 | `/afiliado/redes/trinaria` | Mi organizacion Trinaria A/B/C | Arbol de posiciones con ranuras A, B, C rotuladas y coloreadas, zoom/desplazamiento/centrar, produccion VP/VC por brazo debajo de cada nodo, leyenda que aclara "El padre de posicion puede ser distinto del patrocinador". | MLM-017, 019, 022 |
| 08 | `/afiliado/equipo` | Mi equipo | Pestanas: Directos (patrocinados), Clientes referidos, Actividad (compras recientes permitidas). | MLM-052 |
| 09 | `/afiliado/volumen` | Volumen y saldo por brazo | Selector de periodo; tabla y grafico por brazo con generado VP/VC, utilizado, restante, acumulado y caducado; texto explicativo de cada saldo; grafico de equilibrio (dona o barras); lista de movimientos (origen/reversion) del periodo. | MLM-013, 019, 020, 053 |
| 10 | `/afiliado/run` | Progreso hacia siguiente RUN | Escalera de los 11 RUN marcando Cobro e Historico; barra de progreso y checklist del siguiente RUN con requerido, logrado, faltante y fuente de cada requisito; incluye requisito de formacion. | MLM-028, 029, 030, 056 |
| 11 | `/afiliado/bonos` | Bonos y desglose | Selector de periodo; tarjeta por cada uno de los 7 conceptos con monto ilustrativo, estado y boton "Ver desglose" (base, regla y version, fuente, periodo, ajustes, resultado). Para Unilevel, tabla por nivel 1-7. Leyenda DEMOSTRACION. | MLM-041, 044, 054 |
| 12 | `/afiliado/compras`, `/afiliado/liquidaciones` | Historial de liquidaciones y compras | Compras propias y de clientes con buscador (persona, producto, periodo, estado, comprobante); liquidaciones por periodo con conceptos, ajustes, total, estado y comprobante descargable (simulado). | MLM-014, 046, 055 |
| 13 | `/afiliado/formacion` | Estado de formacion vinculada | Programas ERIC S.A.C. con estado matriculado/cursando/aprobado, indicador "Conector LMS pendiente de integracion", y como afecta al requisito de rango. | MLM-065 |

### 9.4 Corporativo (layout con menu lateral; prefijo `/corporativo`)

| N. | Ruta | Pantalla | Contenido minimo | Req. |
|---|---|---|---|---|
| 14 | `/corporativo/resumen` | Panel corporativo y alertas | KPIs: ventas del ciclo, pedidos por estado, afiliados por estado, distribucion por RUN, bonificaciones estimadas por motor, periodos, obligaciones de pago simuladas; bandeja de alertas de integridad con enlace a compliance. | MLM-057, 059 |
| 15 | `/corporativo/usuarios`, `/corporativo/usuarios/:id`, `/corporativo/permisos` | Usuarios, estados, roles y permisos | Tabla filtrable; alta de usuario (incluido corporativo); ficha de persona con pestanas (seccion 5 MLM-004) y navegacion a bonos, arbol, RUN, compras y liquidacion; cambio de estado con motivo; matriz de permisos editable. | MLM-003 a 007 |
| 16 | `/corporativo/productos` | Catalogo | Tabla y formulario de producto con precio, VP, VC independientes, categoria, vigencia y activo. | MLM-008, 009 |
| 17 | `/corporativo/arboles` | Editor y visor de redes | Pestanas Unilevel / Trinaria; buscador; panel de colocacion administrativa (elegir persona sin posicion -> elegir posicion padre -> elegir brazo disponible -> motivo -> confirmar); validaciones de ciclo y duplicado; historial estructural. | MLM-015, 017, 018, 021 a 023, 058 |
| 18 | `/corporativo/periodos` | Periodos y cierre | Lista de ciclos (14 dias editable) y calendario mensual; crear periodo; estados; historial de cierres con version de reglas y resultados; boton iniciar cierre / aprobar cierre. | MLM-024, 025, 031, 045 |
| 19 | `/corporativo/rangos` | Editor de rangos y requisitos | Los 11 RUN en orden; editor de requisitos por rango (valores ficticios); guardar crea nueva version con vigencia y motivo; boton "Previsualizar impacto". | MLM-026, 027, 032, 033 |
| 20 | `/corporativo/bonos` | Configuracion de bonos y parametros | 7 tarjetas de motor separadas, cada una con activo/inactivo y parametros ficticios; configuracion general: topes, VP/VC, calendarios, elegibilidad, mercados; historial de versiones. | MLM-034 a 040, 063, 068 |
| 21 | `/corporativo/simulador` | Simulador de compensaciones | Elegir periodo y version de reglas (o editar parametros temporales) -> ejecutar corrida -> resultados por motor en pestanas separadas y por afiliado -> desglose -> "Enviar a revision". Leyenda permanente de parametros ilustrativos. Muestra version de reglas y lista de movimientos usados; boton "Reproducir corrida". | MLM-041 a 043 |
| 22 | `/corporativo/liquidaciones` | Revision, aprobacion y liquidaciones | Corridas en revision; partidas con aprobar/retener; aprobar cierre; generar liquidaciones (idempotente); estados; exportar CSV / imprimir. Distincion visual clara entre corrida simulada y liquidacion aprobada (CA-14). | MLM-044 a 046, 049 |
| 23 | `/corporativo/compliance` | Compliance, suspensiones y ajustes | Bandeja de alertas; ficha de revision; suspender/liberar/bloquear con motivo; retener/liberar pagos; registrar devolucion (elige pedido -> vista previa de reversion VP/VC y ajustes de bono -> confirmar); correcciones excepcionales con motivo y evidencia. | MLM-047, 048, 059 a 061 |
| 24 | `/corporativo/auditoria`, `/corporativo/reportes` | Auditoria y reportes | Bitacora filtrable (actor, modulo, accion, fecha) con detalle antes/despues; reportes por afiliado, producto, RUN, periodo y estado; exportar CSV e imprimir. | MLM-007, 014, 062, 064, 049 |
| 25 | `/corporativo/integraciones` | Integraciones y conectores | Tarjetas: LMS ERIC S.A.C. (pendiente de integracion), e-commerce externo (futuro), pagos (interfaz desacoplada, simulado), notificaciones (simulado), mercados (pais, moneda, idioma, tributos, metodo de pago), resiliencia (respaldos, monitoreo, recuperacion, permisos). Ninguna afirma estar conectada. | MLM-065 a 070 |

---

## 10. MAPA MINIMO DE NAVEGACION

| Publico | Afiliado | Corporativo |
|---|---|---|
| Inicio - Catalogo - Registro - Carrito - Cuenta | Mi inicio - Mis redes (Unilevel / Trinaria) - Mi equipo - Mi volumen - Mi RUN - Mis bonos - Mis compras - Mis liquidaciones - Mi formacion | Resumen - Usuarios - Productos - Arboles - Periodos - Rangos - Bonos - Simulador - Liquidaciones - Compliance - Auditoria (y Reportes) - Integraciones |

Elementos globales: logo "MLM 2027", leyenda DEMOSTRACION, centro de notificaciones, selector de rol demo (cambia de perfil sin cerrar sesion), boton "Guia de flujos" (F01-F08), boton "Reiniciar demostracion", menu de usuario.

En movil: el menu lateral se convierte en cajon (drawer) con icono `Menu`; las tablas pasan a tarjetas apiladas; los arboles conservan zoom tactil y ofrecen vista en lista.

---

## 11. FLUJOS DE DEMOSTRACION OBLIGATORIOS (F01 a F08)

Cada flujo debe poder recorrerse de principio a fin con datos coherentes. En la fase final se agrega un panel "Guia de flujos" que lista los pasos de cada flujo, permite saltar a la pantalla de cada paso y marca los pasos completados.

**F01 - Afiliacion por patrocinio**
1. Afiliado DEMO-A01 copia su enlace en Mi inicio (`/registro?ref=DEMO-A01`).
2. Nuevo usuario se registra como empresario (se crea DEMO-A16, estado `pendiente`, patrocinador DEMO-A01 visible y fijo).
3. Se confirma el patrocinador (registro en `Patrocinio` y bitacora).
4. Corporativo, en pantalla 17, asigna posicion Trinaria a DEMO-A16 bajo una posicion disponible elegida (por ejemplo, brazo libre bajo DEMO-A08), distinta de la posicion del patrocinador.
5. Ambos arboles muestran a DEMO-A16: en Unilevel bajo DEMO-A01 y en Trinaria bajo su padre de posicion, sin mezclar relaciones. Se genera notificacion.

**F02 - Venta y generacion de volumen**
1. Cliente o afiliado elige un producto en el catalogo -> carrito -> checkout.
2. Se crea el pedido (`pendiente`) -> "Simular confirmacion de cobro" -> `confirmada`.
3. Se generan movimientos VP/VC tipo `origen` en el periodo abierto DEMO-C02.
4. El volumen aparece en el historial de ventas, en Mi volumen del referente y en la produccion del brazo correspondiente de sus ascendentes Trinarios, y en reportes.

**F03 - Progreso de rango**
1. DEMO-A01 abre su dashboard: ve RUN Historico RUN100K y RUN de Cobro RUN10K, claramente distintos.
2. Revisa volumen, directos, brazos y formacion.
3. Abre Mi RUN: ve requisitos cumplidos y pendientes para RUN30K, con fuente de cada uno.

**F04 - Ciclo y bonos**
1. Superadministrador revisa/configura el periodo DEMO-C02 en pantalla 18.
2. Abre el simulador, elige reglas de prueba (version DEMO-VR-1 o parametros temporales).
3. Ejecuta la corrida y revisa **por separado** actividad comercial, patrocinio y activacion, Unilevel, Trinario, generaciones, bono de rango y fondo de liderazgo.
4. Deja la corrida en estado `en_revision`.

**F05 - Revision y liquidacion**
1. Operador (con permiso de aprobar activado) consulta la corrida en revision.
2. Aprueba o retiene partidas (la de DEMO-A05 aparece retenida por suspension).
3. Genera la liquidacion simulada (idempotente).
4. DEMO-A01 ve el detalle y estado en Mis liquidaciones, con la nota "Sin transferencia monetaria".

**F06 - Devolucion de venta**
1. Corporativo registra la devolucion del pedido DEMO-P02 en compliance.
2. Se crea movimiento inverso de VP/VC (tipo `reversion`) enlazado al original.
3. Se actualiza la proyeccion del periodo abierto y se crea un ajuste de comision para el periodo ya cerrado (sin reescribirlo).
4. El evento queda visible en auditoria con la cadena pedido -> reversion -> ajuste.

Nota: en los datos iniciales DEMO-P02 ya aparece devuelto (caso de muestra). Para poder demostrar F06 en vivo, incluye ademas un pedido confirmado DEMO-P03 de bien fisico apto para devolucion; el flujo en vivo se hace con DEMO-P03 y DEMO-P02 sirve como ejemplo historico.

**F07 - Formacion como condicion**
1. DEMO-A01 abre Mi formacion: su programa aparece `cursando`.
2. Pulsa "Simular actualizacion desde LMS": pasa a `aprobado` (dato de prueba, sin inscripcion real).
3. En Mi RUN el requisito "Formacion aprobada" pasa a cumplido y la elegibilidad se actualiza como ejemplo.

**F08 - Control corporativo**
1. Administrador ve la alerta de posible duplicidad DEMO-ALR-01 (DEMO-A09 / DEMO-A11) en el panel.
2. Examina la ficha comparativa (documento y telefono coincidentes).
3. Suspende DEMO-A11 (o libera) dejando motivo obligatorio.
4. El reporte de compliance consolida decisiones, cuentas y operaciones afectadas; la bitacora registra todo.

---

## 12. MOTORES DE COMPENSACION (PARAMETROS FICTICIOS)

Todos los motores viven en `src/motores/` con la misma firma:

```ts
export interface EntradaMotor {
  periodo: Periodo; reglas: VersionReglas; personas: Persona[]; patrocinios: Patrocinio[];
  posiciones: PosicionTrinaria[]; movimientos: MovimientoVolumen[];
  calificaciones: CalificacionRun[]; saldos: SaldoBrazo[]; formacion: EstadoFormativo[];
}
export type Motor = (entrada: EntradaMotor) => BonoComision[];
```

Archivos: `motorActividadComercial.ts`, `motorPatrocinioActivacion.ts`, `motorUnilevel.ts`, `motorTrinario.ts`, `motorGeneraciones.ts`, `motorBonoRango.ts`, `motorFondoLiderazgo.ts`, `motorRangos.ts` (calificacion RUN) y `ejecutarCorrida.ts` (orquesta, guarda version y movimientos usados). Cada `BonoComision` incluye `calculo` en texto legible, por ejemplo: "VC nivel 2 (1.250) x 4% (parametro ficticio DEMO-VR-1) = 50,00".

Parametros iniciales de DEMO-VR-1 (todos ficticios y editables; mostrar etiqueta "Valor ilustrativo"):

| Motor | Parametros ficticios |
|---|---|
| Actividad comercial | 10% sobre el VC de ventas personales y de clientes referidos; requiere VP personal minimo 100 en el ciclo. |
| Patrocinio y activacion | 15% del VC del **primer pedido confirmado** de cada nuevo directo en el ciclo; un alta sin pedido no genera bono. |
| Unilevel | Profundidad maxima 7. Porcentaje sobre VC por nivel: N1 5%, N2 4%, N3 3%, N4 2%, N5 2%, N6 1%, N7 1%. Niveles habilitados segun RUN de Cobro: sin rango 0, RUN300 1, RUN1K 2, RUN3K 3, RUN5K 5, RUN10K o superior 7. Requiere cuenta activa y VP personal >= 100. |
| Trinario | Regla de consumo ilustrativa: "el volumen utilizado de cada brazo es igual a la produccion del brazo de menor volumen". 8% sobre el VC equivalente del volumen utilizado. Remanente caduca a los 4 ciclos. Tope por ciclo 500. |
| Generaciones | Hasta 3 generaciones de lideres RUN5K o superior: 2% / 1% / 1% sobre el VC de cada generacion. Requiere RUN de Cobro RUN30K o superior. |
| Bono de rango | Ascenso: monto fijo ilustrativo al alcanzar por primera vez un RUN de Cobro (RUN10K = 100, RUN30K = 250...). Mantenimiento: 50 si mantiene el mismo RUN de Cobro 2 ciclos consecutivos. |
| Fondo de liderazgo | Bolsa del 2% del VC total de la compania en el ciclo, repartida en partes iguales entre afiliados con RUN de Cobro RUN10K o superior. |

Los montos se **calculan** con estos motores a partir de los datos de la seccion 13; no los escribas a mano en las pantallas. La corrida aprobada de DEMO-C01 se genera al iniciar la app ejecutando los motores y se guarda congelada.

---

## 13. CONJUNTO DE DATOS DE DEMOSTRACION

Todos los nombres, documentos, correos y telefonos son ficticios (dominio `@correo.demo`). Pais principal: Peru; moneda de presentacion de montos: USD (los mercados configurados incluyen Peru-PEN y Ecuador-USD para mostrar el modelo multipais). Fecha de referencia de la demo: 11/11/2026.

### 13.1 Personas y relaciones

| ID | Nombre | Tipo | Estado | Patrocinador | Posicion | Padre de posicion | Brazo | RUN Cobro (C01) | RUN Historico |
|---|---|---|---|---|---|---|---|---|---|
| DEMO-A00 | Organizacion Raiz Demo | empresario | activo | - | DEMO-POS-000 | - (raiz) | - | RUN5K | RUN300K |
| DEMO-A01 | Mariana Vega Ruiz | empresario | activo | DEMO-A00 | DEMO-POS-001 | DEMO-POS-000 | A | RUN10K | RUN100K |
| DEMO-A02 | Jorge Salinas Paz | empresario | activo | DEMO-A00 | DEMO-POS-002 | DEMO-POS-001 | C | RUN3K | RUN5K |
| DEMO-A03 | Diego Paredes Luna | empresario | activo | DEMO-A01 | DEMO-POS-003 | DEMO-POS-001 | A | RUN5K | RUN5K |
| DEMO-A04 | Sofia Ramos Celi | empresario | activo | DEMO-A01 | DEMO-POS-004 | DEMO-POS-003 | A | RUN3K | RUN3K |
| DEMO-A05 | Andres Quispe Mamani | empresario | suspendido | DEMO-A01 | DEMO-POS-005 | DEMO-POS-001 | B | RUN3K | RUN3K |
| DEMO-A06 | Valeria Torres Rios | empresario | activo | DEMO-A01 | DEMO-POS-006 | DEMO-POS-005 | A | RUN1K | RUN1K |
| DEMO-A07 | Luis Herrera Campos | empresario | activo | DEMO-A03 | DEMO-POS-007 | DEMO-POS-002 | A | RUN1K | RUN1K |
| DEMO-A08 | Camila Ortiz Vera | empresario | activo | DEMO-A04 | DEMO-POS-008 | DEMO-POS-004 | A | RUN1K | RUN1K |
| DEMO-A09 | Ricardo Mendez Soto | empresario | activo | DEMO-A06 | DEMO-POS-009 | DEMO-POS-006 | A | RUN1K | RUN1K |
| DEMO-A10 | Paola Castro Jimenez | empresario | activo | DEMO-A07 | DEMO-POS-010 | DEMO-POS-003 | B | RUN1K | RUN1K |
| DEMO-A11 | Ricardo Mendes Soto | empresario | pendiente | DEMO-A06 | sin posicion | - | - | - | - |
| DEMO-A12 | Tomas Vargas Leon | empresario | activo | DEMO-A10 | DEMO-POS-011 | DEMO-POS-010 | A | RUN1K | RUN1K |
| DEMO-A13 | Elena Rojas Pinto | empresario | activo | DEMO-A12 | DEMO-POS-012 | DEMO-POS-011 | A | RUN300 | RUN300 |
| DEMO-A14 | Marco Flores Aguilar | empresario | activo | DEMO-A13 | DEMO-POS-013 | DEMO-POS-012 | A | RUN300 | RUN300 |
| DEMO-A15 | Natalia Cruz Medina | empresario | activo | DEMO-A14 | DEMO-POS-014 | DEMO-POS-013 | A | - | - |
| DEMO-C01 | Rosa Delgado Arce | cliente | activo | referente DEMO-A01 | - | - | - | - | - |
| DEMO-C02 | Hector Nunez Bravo | cliente | activo | referente DEMO-A03 | - | - | - | - | - |
| DEMO-C03 | Bruno Salazar Ibarra | cliente | bloqueado | referente DEMO-A02 | - | - | - | - | - |
| DEMO-L01 | Gabriela Ponce Lara | alumno | activo | referente DEMO-A04 | - | - | - | - | - |
| DEMO-U01 | Admin Demo | corporativo (superadministrador) | activo | - | - | - | - | - | - |
| DEMO-U02 | Operador Demo | corporativo (operador) | activo | - | - | - | - | - | - |

Verificaciones que deben cumplirse con estos datos:

- Profundidad Unilevel bajo DEMO-A01: N1 A03, A04, A05, A06 - N2 A07, A08, A09, A11 - N3 A10 - N4 A12 - N5 A13 - N6 A14 - N7 A15 (siete niveles, CA-12).
- Brazos de DEMO-A01 en Trinaria: A -> DEMO-A03 (debajo A04, A10, A08, A12 a A15), B -> DEMO-A05 (debajo A06, A09), C -> DEMO-A02 (debajo A07).
- Casos donde patrocinador y padre de posicion **no coinciden**: A02 (sponsor A00, padre A01), A04 (sponsor A01, padre A03), A06 (sponsor A01, padre A05), A07 (sponsor A03, padre A02), A10 (sponsor A07, padre A03). Esto demuestra CA-03.
- DEMO-A02 esta en la Trinaria de DEMO-A01 pero no en su Unilevel: la vista del afiliado lo muestra con datos enmascarados (RN-15).
- DEMO-POS-000 tiene brazos B y C disponibles; DEMO-POS-008 y otras hojas tienen ranuras disponibles para F01.

### 13.2 Productos

| ID | Nombre | Categoria | Precio (USD) | VP | VC | Notas |
|---|---|---|---|---|---|---|
| DEMO-PRD-01 | Programa Liderazgo Comercial - Nivel 1 | programa_formativo | 250,00 | 100 | 80 | Proveedor ERIC S.A.C. (vinculo LMS conceptual) |
| DEMO-PRD-02 | Kit Nutricional Premium | bien_fisico | 120,00 | 60 | 45 | |
| DEMO-PRD-03 | Asesoria de Imagen Personal | servicio | 80,00 | 20 | 30 | VC mayor que VP a proposito (sin equivalencia) |
| DEMO-PRD-04 | Set de Cuidado Personal | bien_fisico | 65,00 | 30 | 25 | |
| DEMO-PRD-05 | Taller de Ventas Digitales | programa_formativo | 150,00 | 70 | 50 | Proveedor ERIC S.A.C. |
| DEMO-PRD-06 | Membresia Anual de Servicios | servicio | 300,00 | 120 | 90 | Inactivo (vigencia vencida) para mostrar vigencia |

### 13.3 Periodos y versiones de reglas

| ID | Tipo | Inicio | Fin | Duracion | Estado | Reglas |
|---|---|---|---|---|---|---|
| DEMO-C01 | ciclo | 19/10/2026 | 01/11/2026 | 14 dias | cerrado | DEMO-VR-1 |
| DEMO-C02 | ciclo | 02/11/2026 | 15/11/2026 | 14 dias | abierto | DEMO-VR-1 |
| DEMO-C03 | ciclo | 16/11/2026 | 29/11/2026 | 14 dias | programado | DEMO-VR-2 |
| DEMO-M10 | mensual | 01/10/2026 | 31/10/2026 | mes | cerrado | DEMO-VR-1 |
| DEMO-M11 | mensual | 01/11/2026 | 30/11/2026 | mes | abierto | DEMO-VR-1 |

- DEMO-VR-1: vigente desde 19/10/2026, motivo "Configuracion inicial de demostracion".
- DEMO-VR-2: vigente desde 16/11/2026 (programada), con un cambio de ejemplo (por ejemplo, Unilevel N3 pasa de 3% a 2,5%), motivo "Ejemplo de cambio versionado"; demuestra que no reescribe DEMO-C01 (RN-14).

### 13.4 Requisitos ficticios de rango (DEMO-VR-1)

Requisito principal por RUN: VP grupal del ciclo igual al numero del nombre (RUN300 = 300, RUN1K = 1.000 ... RUN1M = 1.000.000). Requisitos complementarios ficticios (aplican de RUN10K en adelante, crecientes): VP personal minimo, directos activos, equilibrio de brazos (el brazo menor aporta un porcentaje minimo del volumen), lideres calificados y formacion aprobada. Para **RUN30K** usa exactamente:

| Requisito | Requerido | Logrado DEMO-A01 en C02 | Cumple | Fuente |
|---|---|---|---|---|
| VP grupal del ciclo (personal + tres brazos) | 30.000 | 6.860 (60 personal + 6.800 brazos) | No | Movimientos de volumen DEMO-C02 |
| VP personal | 200 | 60 (180 bruto - 120 reversion DEMO-P02) | No | Movimientos personales DEMO-C02 |
| Directos activos | 4 | 3 (A05 suspendido no cuenta) | No | Patrocinios directos con estado activo |
| Equilibrio: brazo menor >= 25% | 25% | 19% (brazo B) | No | Produccion por brazo DEMO-C02 |
| Lideres calificados RUN3K o mas | 2 | 2 (A03, A04) | Si | Calificaciones RUN de los directos en el mismo ciclo |
| Formacion aprobada | Aprobado | Cursando | No (Si tras F07) | Estado formativo LMS (dato de prueba) |

### 13.5 Produccion por brazo de DEMO-A01

| Periodo | Brazo | Generado VP | Generado VC | Utilizado | Restante | Remanente anterior | Caducado | Acumulado |
|---|---|---|---|---|---|---|---|---|
| DEMO-C01 | A | 5.200 | 4.100 | 3.100 | 2.100 | 850 | 150 | 2.800 |
| DEMO-C01 | B | 3.100 | 2.400 | 3.100 | 0 | 0 | 0 | 0 |
| DEMO-C01 | C | 3.900 | 3.000 | 3.100 | 800 | 200 | 0 | 1.000 |
| DEMO-C02 (en curso) | A | 3.400 | 2.650 | pendiente de cierre | - | 2.800 | 0 | - |
| DEMO-C02 (en curso) | B | 1.300 | 1.000 | pendiente de cierre | - | 0 | 0 | - |
| DEMO-C02 (en curso) | C | 2.100 | 1.600 | pendiente de cierre | - | 1.000 | 0 | - |

Definicion usada: **VP grupal = VP personal + produccion de los tres brazos**. Produccion de brazos DEMO-C01 = 12.200; VP grupal DEMO-C01 = 12.520 (cumple RUN10K, no RUN30K). Produccion de brazos DEMO-C02 en curso = 6.800; VP grupal = 6.860. VP personal de DEMO-A01: C01 = 320; C02 = 180 bruto, 60 neto tras la reversion.

Genera los pedidos adicionales necesarios (DEMO-P04 en adelante, repartidos entre las personas de cada brazo, con fechas dentro de cada ciclo) para que la **suma de los movimientos de volumen coincida exactamente** con estas cifras. Escribe un chequeo automatico (`src/datos/verificarConsistencia.ts`) que compare totales y muestre en consola "Datos DEMO consistentes" o el detalle de la diferencia.

### 13.6 Pedidos clave

| ID | Comprador | Referente | Producto | Estado | Periodo | Efecto visible |
|---|---|---|---|---|---|---|
| DEMO-P01 | DEMO-L01 (alumno) | DEMO-A04 | 1 x DEMO-PRD-01 (programa formativo) | confirmada | DEMO-C02 | Precio 250, VP 100, VC 80; movimiento origen; alumno con estado formativo `cursando`. |
| DEMO-P02 | DEMO-C01 (cliente) | DEMO-A01 | 2 x DEMO-PRD-02 (bien fisico) | devuelta | Confirmada 27/10/2026 en DEMO-C01; devuelta 05/11/2026 | Movimiento origen +120 VP / +90 VC en C01; reversion -120 VP / -90 VC registrada en C02; ajuste negativo de bono para DEMO-A01 (y ascendentes afectados) aplicado en la liquidacion de C02, sin modificar el cierre de C01. |
| DEMO-P03 | DEMO-C02 (cliente) | DEMO-A03 | 1 x DEMO-PRD-04 (bien fisico) | confirmada | DEMO-C02 | Disponible para demostrar F06 en vivo. |

### 13.7 Formacion

| Persona | Programa | Estado |
|---|---|---|
| DEMO-A01 | Programa Liderazgo Comercial - Nivel 1 | cursando (pasa a aprobado en F07) |
| DEMO-A03 | Programa Liderazgo Comercial - Nivel 1 | aprobado |
| DEMO-A04 | Taller de Ventas Digitales | matriculado |
| DEMO-L01 | Programa Liderazgo Comercial - Nivel 1 | cursando |

### 13.8 Compliance, alertas y liquidaciones iniciales

- **Caso compliance:** DEMO-A05 suspendido el 03/11/2026, motivo "Revision por patron atipico de pedidos (DEMOSTRACION)", actor DEMO-U01. Su liquidacion de DEMO-C01 esta `retenida` con el motivo visible y registro en bitacora.
- **DEMO-ALR-01** (duplicado, alta): DEMO-A09 y DEMO-A11 comparten documento ficticio y telefono; nombres casi iguales. Abierta (se resuelve en F08).
- **DEMO-ALR-02** (patron atipico, media): DEMO-A05 registro 5 pedidos en menos de una hora en C01 seguidos de una devolucion. En revision.
- **DEMO-ALR-03** (estructura inconsistente, baja): intento bloqueado de colocar una segunda persona en DEMO-POS-001 brazo A. Resuelta automaticamente por la validacion (MLM-023).
- **Corrida DEMO-CR-C01-01:** periodo DEMO-C01, version DEMO-VR-1, estado `aprobada`. Total ilustrativo de DEMO-A01 en C01: USD 1.136,10 (actividad 25,00; patrocinio 50,25; Unilevel 307,85; Trinario 500,00 con tope; generaciones 0 por no tener RUN30K; bono de rango 50,00 por mantenimiento; fondo de liderazgo 203,00).
- **Ajustes por la devolucion de DEMO-P02** (calculados por recalculo de C01 sin el pedido, autorizados y aplicables en la liquidacion de C02): DEMO-AJ-01 DEMO-A00 Unilevel -4,50; DEMO-AJ-02 DEMO-A01 actividad comercial -9,00; DEMO-AJ-03 DEMO-A01 fondo de liderazgo -1,80.
- **Implementacion de la FASE 2:** los pedidos y movimientos estan en `src/datos/pedidos.ts` y `src/datos/movimientos.ts`; `src/datos/verificarConsistencia.ts` comprueba 16 reglas de coherencia y la pagina interna `/demo/datos` las muestra.
- **Liquidaciones DEMO-C01:** generadas desde esa corrida; la de DEMO-A01 en estado `liquidada_simulada`, la de DEMO-A05 `retenida`, el resto `apta_para_desembolso`.
- **DEMO-C02:** sin corrida al inicio (se crea en F04). Los bonos del afiliado en C02 se muestran como `estimada` mediante simulacion en vivo.
- **Bitacora inicial:** al menos 15 registros coherentes con lo anterior (colocaciones, cambio de estado de A05, devolucion de P02, creacion de DEMO-VR-2, aprobacion de C01, ingresos).
- **Notificaciones iniciales:** compra confirmada (P01), cambio de estado (A05), cierre de C01, liquidacion disponible (A01).

---

## 14. DISENO UI/UX

- **Estetica:** contemporanea, sobria y comprensible; enfasis en visualizacion de redes, indicadores y textos explicativos sin jerga innecesaria. Cada concepto tecnico (VP, VC, RUN, brazo, remanente, corrida) tiene un icono `Info` con tooltip explicativo.
- **Referencia visual aprobada:** el archivo `docs\referencia_visual_MLM2027.html` es la guia de estilo de partida (dashboard del afiliado, paleta y tipografia). Todas las pantallas deben seguir ese lenguaje visual.
- **Tipografia (Google Fonts):**
  - `Plus Jakarta Sans` (400, 500, 600, 700, 800) para toda la interfaz y titulos. Escala: titulo de pagina 26/800 con `letter-spacing:-0.025em`; titulo de seccion 18/700; titulo de tarjeta 15/700; cuerpo 14/400; etiquetas 11/700 en mayusculas con `letter-spacing:0.1em`.
  - `JetBrains Mono` (400, 500, 600) con cifras tabulares (`font-feature-settings:"tnum"`) para cifras de KPI, VP, VC, montos y codigos (`DEMO-A01`, `DEMO-P02`, `DEMO-VR-1`).
  - Respaldos: `'Segoe UI', system-ui, sans-serif` y `ui-monospace, Consolas, monospace`.
- **Paleta "Confianza y crecimiento" (tokens en `index.css` con `@theme`):**
  - Marca: primario `#14305A` (menu lateral, botones principales, encabezados), primario hover `#1E4577`, primario suave `#E8EEF6` (fondos de seleccion, chips), acento turquesa `#0E7490` (enlaces, grafico principal, foco), acento suave `#E0F2F6`.
  - Reconocimiento: dorado `#B7791F` y dorado suave `#FBF3E4`, **solo** para RUN Historico y logros. No usar el dorado en ningun otro elemento.
  - Neutros: fondo `#F8FAFC`, superficie `#FFFFFF`, borde `#E2E8F0`, texto `#0F172A`, texto secundario `#475569`, texto terciario `#94A3B8`.
  - Estados (siempre con icono, nunca solo color): exito `#15803D` (confirmada, aprobada, activa), advertencia `#B45309` (pendiente, en revision), error `#B91C1C` (rechazada, bloqueada, revertida), informacion `#1D4ED8` (estimada, simulada), retenida/suspendida `#6B7280`.
  - Brazos Trinarios: A `#2563EB` (azul), B `#7C3AED` (violeta), C `#DB2777` (magenta). Siempre acompanados de la letra A/B/C; no se cruzan con ningun color de estado.
  - Franja DEMOSTRACION: fondo `#FEF3C7`, texto `#92400E`, icono `FlaskConical`.
- **Lenguaje visual:**
  - Menu lateral con degradado vertical `#14305A` a `#0F2547`, items agrupados por seccion con etiqueta en mayusculas, item activo con fondo translucido y linea izquierda turquesa `#22B8D6`, tarjeta de usuario al pie.
  - Tarjetas con radio 16 px, borde `#E2E8F0` y sombra suave (`0 1px 2px rgba(15,23,42,.04), 0 8px 24px -12px rgba(15,23,42,.10)`).
  - Tarjeta principal de calificacion en fondo oscuro (degradado radial de `#1E4577` a `#0C1F3D`) con RUN de Cobro y RUN Historico lado a lado; el Historico con borde dorado.
  - KPIs con icono en recuadro de color suave, cifra grande en mono, indicador de tendencia y mini grafico (sparkline).
  - Barras de produccion por brazo con chip de letra de color, y saldos (generado, utilizado, remanente, caducado) en recuadros con borde discontinuo.
  - Nodos del arbol como tarjetas con barra lateral del color del brazo, avatar de iniciales, nombre, codigo en mono, RUN y VP/VC.
  - Insignias de estado tipo pildora con icono y fondo suave del color del estado.
  - Botones de icono cuadrados de 40 px con radio 12 px; campo de busqueda global en la barra superior.
- **Insignias RUN:** RUN de Cobro = insignia solida primaria con icono `Wallet` y texto "RUN de Cobro"; RUN Historico = insignia con borde dorado `#B7791F` e icono `Award` y texto "RUN Historico". Nunca deben poder confundirse.
- **Insignias de estado** con color e icono (por ejemplo `CheckCircle2` confirmada, `Clock` pendiente, `Undo2` devuelta, `PauseCircle` retenida, `Ban` bloqueado).
- **Corrida simulada vs liquidacion aprobada:** la corrida simulada usa borde discontinuo, marca de agua "SIMULACION" y etiqueta gris; la liquidacion aprobada usa borde solido y etiqueta verde con icono `ShieldCheck`.
- **Componentes reutilizables obligatorios:** Boton, Tarjeta, TarjetaKpi, Tabla (orden, filtro, paginacion, version movil en tarjetas), Insignia, InsigniaRun, InsigniaEstado, Modal, Cajon, Pestanas, Campo, Selector, Buscador, LineaTiempo, EstadoVacio, EstadoError, Confirmacion (modal con motivo obligatorio cuando aplique), Toast, LeyendaDemostracion, ConPermiso, NodoPersona, NodoPosicion.
- **Estados:** vacio (icono + texto + accion sugerida), confirmacion (resumen antes de acciones sensibles), error (mensaje claro de que paso y como seguir), exito (toast).
- **Accesibilidad:** contraste AA, foco visible, etiquetas en formularios, navegacion por teclado en menus y modales.
- **Responsive:** breakpoints de Tailwind; probado a 375 px (movil), 768 px (tableta) y 1440 px (escritorio). En movil no se pierde acceso a arboles, rangos ni resumenes (CA-18).

### 14.1 Estandar de calidad y referencias de plataformas MLM

Como inspiracion funcional y visual se toman plataformas profesionales de software MLM: Epixel MLM Software (epixelmlmsoftware.com), Codioo (codioo.com), MLM Soft (mlmsoft.com) y MLM.ERP (mlmerp.com).

Reglas de uso:

1. **No navegues ni analices esos sitios.** Son paginas comerciales y sus paneles reales no son accesibles. Los patrones utiles ya estan traducidos en esta seccion y en la seccion 14; aplica esos.
2. **No copies ninguna plataforma.** No uses sus nombres, logos, marcas, textos ni disenos exactos en ninguna parte del prototipo. La solucion debe ser propia.
3. **La interfaz debe transmitir calidad de software empresarial comercial.** No debe parecer una plantilla generica, un panel administrativo basico ni un proyecto academico.
4. **Los requerimientos de MLM 2027 tienen prioridad absoluta** sobre cualquier funcionalidad tipica de esas plataformas. No agregues modulos que no esten en este documento (por ejemplo: billetera electronica, retiros, e-pins, tickets de soporte, replicated websites, estructura binaria o matriz forzada).
5. **Solo Unilevel y Trinaria.** No existe estructura binaria. Nunca combines ambas estructuras ni representes una como si fuera la otra.
6. **Estados:** las referencias usan estados como pendiente, aprobada, rechazada y liquidada; en este proyecto se usan **solo** los estados definidos en la seccion 7, con el estilo visual de esta seccion.
7. **Motores:** los siete motores son modulos diferenciados. No inventes reglas definitivas; usa los valores ilustrativos editables de la seccion 12, rotulados "DEMOSTRACION", y deja las reglas pendientes de parametrizacion.

Patrones concretos a aplicar (inspirados en esas plataformas):

- Navegacion lateral organizada por modulos con grupos rotulados y contadores.
- Dashboard con fila de tarjetas KPI (cifra, tendencia, sparkline) y graficos debajo.
- Tablas profesionales: barra superior con buscador, filtros en chips, selector de columnas, exportar; filas con avatar o codigo, insignia de estado y menu de acciones por fila; paginacion con total de registros; en movil se convierten en tarjetas.
- Formularios en tarjetas por secciones, con etiquetas arriba, ayudas bajo el campo, validacion en linea y barra de acciones fija al pie (Cancelar / Guardar).
- Arboles de red interactivos: nodos tipo tarjeta, expandir/colapsar, zoom, centrar en un nodo, minivista de ubicacion, panel lateral con el detalle del nodo seleccionado y buscador que resalta el resultado.
- Vistas de detalle (ficha de afiliado, pedido, corrida, liquidacion) con encabezado de resumen, pestanas y linea de tiempo de eventos.
- Paneles separados para afiliado y para administracion, con la misma identidad visual.
- Prioriza calidad visual, coherencia entre modulos y facilidad de navegacion por encima de agregar funcionalidades innecesarias.

---

## 15. CRITERIOS DE ACEPTACION DEL PROTOTIPO (CA-01 a CA-20)

| CA | Criterio | Como se verifica |
|---|---|---|
| CA-01 | El ingreso permite acceder a vistas distintas para superadministrador, operador, empresario y cliente/alumno. | Botones de ingreso por perfil; menus distintos; operador con menu filtrado. |
| CA-02 | El formulario de referido conserva visualmente al patrocinador que origino el registro. | `/registro?ref=DEMO-A01` muestra tarjeta fija del patrocinador hasta la confirmacion. |
| CA-03 | Un usuario puede localizarse en Unilevel y en Trinario sin que sus padres deban ser iguales. | Buscar DEMO-A04 en ambos arboles: sponsor A01, padre de posicion A03. |
| CA-04 | El arbol Trinario muestra inequivocamente los brazos A, B y C y su produccion separada. | Ranuras rotuladas y coloreadas con VP/VC por brazo. |
| CA-05 | Una compra de prueba contiene precio, VP y VC independientes y pasa por estados visibles. | Pedido con linea de tiempo borrador -> pendiente -> confirmada. |
| CA-06 | La compra confirmada aparece en el historial y en un resumen de volumen. | Tras F02, el pedido figura en historial y Mi volumen. |
| CA-07 | Se muestran los once rangos RUN en el catalogo corporativo. | Pantalla 19 con los 11 codigos exactos. |
| CA-08 | El dashboard diferencia RUN Historico de RUN de Cobro. | DEMO-A01: RUN100K Historico y RUN10K Cobro con insignias distintas. |
| CA-09 | El afiliado ve condiciones logradas y pendientes para el proximo rango. | Checklist de RUN30K de la seccion 13.4. |
| CA-10 | Los periodos pueden verse y editarse, con ejemplo de 14 dias. | Pantalla 18 con DEMO-C01/C02/C03 editables. |
| CA-11 | Los siete conceptos de compensacion estan separados y accesibles desde configuracion. | Pantalla 20 con 7 tarjetas independientes. |
| CA-12 | Un ejemplo de bono Unilevel muestra profundidad hasta siete niveles. | Desglose Unilevel de DEMO-A01 con N1 a N7. |
| CA-13 | El panel Trinario distingue volumen generado, usado, remanente y caducado. | Pantalla 09 con las columnas de la seccion 13.5. |
| CA-14 | Una corrida simulada muestra su version de reglas y se distingue de una liquidacion aprobada. | Pantallas 21 y 22 con estilos diferenciados y version visible. |
| CA-15 | Un ajuste o devolucion produce un registro de reversion auditable. | F06 y bitacora con cadena pedido -> reversion -> ajuste. |
| CA-16 | Una cuenta suspendida presenta el efecto de la retencion de comisiones. | DEMO-A05: liquidacion retenida con motivo. |
| CA-17 | La seccion educativa muestra matriculado, cursando y aprobado como dato de prueba. | Pantalla 13 y ficha de alumnos. |
| CA-18 | Usable en escritorio y movil sin perder acceso a arboles, rangos y resumenes. | Revision a 375 px, 768 px y 1440 px. |
| CA-19 | El prototipo es navegable y no afirma realizar cobros, pagos ni integraciones reales. | Leyendas y textos "simulado" en checkout, liquidaciones e integraciones. |
| CA-20 | El equipo puede explicar cada flujo sin depender de porcentajes o formulas no definidos. | Guion `docs\GUION_DEMOSTRACION.md` explica cada flujo por su logica, no por los porcentajes. |

---

## 16. LIMITES DE LA DEMO, ARQUITECTURA DE REFERENCIA Y DEFINICION DE TERMINADO

### 16.1 Limites (seccion 08 del documento)

- Datos expresamente ficticios rotulados "DEMOSTRACION".
- Las 11 denominaciones RUN exactas; reglas como campos parametrizables sin umbrales oficiales.
- Al menos dos ciclos ficticios con duracion editable de 14 dias y estados abierto / cerrado.
- Red de ejemplo con patrocinados y tres brazos; los cambios se reflejan en ambas vistas segun corresponda.
- Una compra de formacion y una de bien fisico con VP/VC independientes y vinculos comerciales claros.
- Simulador con parametros ficticios editables y leyenda permanente.
- Efecto explicito de una devolucion, una suspension y un ajuste con historial.
- Vista LMS con conector conceptual "pendiente de integracion" y estados de muestra.
- Navegacion desde la ficha de un afiliado a sus bonos, su arbol, su RUN, sus compras y su liquidacion.
- Sin numeros reales de tarjeta, cobros bancarios, desembolsos ni calculo oficial de impuestos.
- Las reglas definitivas sustituiran los valores ficticios mediante configuracion, sin alterar la intencion de las pantallas.

### 16.2 Arquitectura de referencia que el prototipo debe anticipar

El documento recomienda para el producto real: interfaz React + TypeScript responsive; backend modular (NestJS/Node.js) con autorizacion y validacion transaccional; PostgreSQL para transacciones, genealogias, parametros versionados y auditoria; motor de calculo desacoplado y reproducible por periodo; colas para confirmaciones, recalculos, cierres, exportaciones y notificaciones con reintentos e idempotencia; adaptadores API/webhook para e-commerce, LMS, pagos y mercados; despliegue en nube (AWS mencionada) con secretos en servidor, cifrado, respaldos, monitoreo y acceso minimo.

En el prototipo esto se refleja asi: `src/servicios/` actua como la futura API (funciones con la misma forma que tendrian los endpoints), `src/motores/` como el motor de calculo desacoplado, la clave de idempotencia evita duplicar liquidaciones, y ningun registro economico se sobrescribe.

Principios tecnicos que no se pueden omitir: separar patrocinio y red Trinaria; parametros con vigencia; registrar eventos de volumen y ajustes sin sobrescribir historia; corridas reproducibles; no duplicar pagos por reintentos; permisos estrictos entre datos corporativos y de afiliados.

### 16.3 Definicion de terminado

El prototipo es apto para presentacion cuando todo flujo F01-F08 es recorrible de principio a fin con datos coherentes y se puede demostrar como el sistema escala desde una venta hasta el desglose de un bono, manteniendo diferencias claras entre simulacion y operacion real. Ademas debe entregar: navegacion completa, componentes reutilizables, estados de vacio/confirmacion/error, estructura consistente entre pantallas, contenido de ejemplo y demostracion guiada de F01 a F08.

---

## 17. PLAN DE FASES

Cada fase se pedira con un prompt propio. No adelantes trabajo de fases futuras.

| Fase | Contenido | Pantallas / requerimientos |
|---|---|---|
| FASE 1 - Base del proyecto | Creacion con Vite, Tailwind v4 y tokens de diseno, rutas y guardas, layouts (publico, afiliado, corporativo), componentes UI base, leyenda DEMOSTRACION, ingreso simulado por perfil, selector de rol, matriz de permisos y `usePermiso`, centro de notificaciones (estructura), boton reiniciar demo, pantallas auxiliares. | Ingreso, recuperar acceso, acceso restringido, 404; MLM-001, 005, 007, 069 (base) |
| FASE 2 - Nucleo de dominio y datos | Tipos (seccion 8), datos DEMO completos (seccion 13) y verificador de consistencia, stores, validaciones (ciclo de patrocinio, posicion libre, transiciones), servicios de dominio, bitacora, los 7 motores + motor de rangos + ejecutarCorrida, corrida congelada de C01. | Sin pantallas nuevas salvo una pagina interna `/demo/datos` para inspeccionar datos |
| FASE 3 - Recorrido publico y cliente/alumno | Pantallas 01 a 04 y Mi cuenta: catalogo, ficha, registro por enlace, carrito, checkout, confirmacion simulada, pedido con estados. | 01-04; MLM-002, 003, 008-013; F02 parcial |
| FASE 4 - Back office del afiliado | Pantallas 05 a 13 con arboles Unilevel y Trinario, volumen, RUN, bonos, compras, liquidaciones y formacion. | 05-13; MLM-014-022, 028-030, 041, 044, 050-056, 065; F03, F07 |
| FASE 5 - Corporativo I | Pantallas 14 a 19: panel, usuarios y permisos, ficha de persona, catalogo, editor de redes, periodos, rangos. | 14-19; MLM-003-008, 015-033, 057-059; F01 |
| FASE 6 - Corporativo II | Pantallas 20 a 25: configuracion de bonos, simulador, liquidaciones, compliance, auditoria y reportes, integraciones. | 20-25; MLM-034-049, 060-070; F04, F05, F06, F08 |
| FASE 7 - Demostracion guiada y control de calidad | Panel "Guia de flujos" F01-F08, pulido de estados vacio/error/confirmacion, revision responsive, recorrido de los 20 criterios, `docs\GUION_DEMOSTRACION.md` y checklist final de requerimientos MLM-001 a MLM-070. | Todos; CA-01 a CA-20 |

---

## 18. FUERA DEL ALCANCE DEL CODIGO (PERO NO SE OLVIDA)

Estos puntos del documento corresponden a la propuesta tecnico-comercial y no se programan en el prototipo; se trabajaran como entregable aparte:

- Planificacion por etapas del producto real: 01 Alineacion visual (este prototipo), 02 Nucleo comercial, 03 Compensacion, 04 Liquidacion y control, 05 Integraciones y piloto.
- Capitulos de la cotizacion: viabilidad y riesgos por modulo (doble arbol, calculo periodico, trazabilidad); arquitectura y escalabilidad; desglose de precio (construccion, integracion, pruebas, puesta en marcha, soporte); cronograma con hitos y piloto; costos recurrentes (hosting, base de datos, almacenamiento, correo, pasarela, monitoreo, mantenimiento); SLA, respaldo, recuperacion e incidentes; entregables y derechos (repositorios, codigo, documentacion, nube, credenciales, transferencia); condiciones de cambio del Plan de Compensacion (que se resuelve por parametros y que exige codigo).
- La referencia orientativa de USD 7.000-8.000 o superior **no** es presupuesto ni debe aparecer en el prototipo.
- Antes de operar en produccion, la empresa debe validar contractual y legalmente el Plan de Compensacion aplicable a Peru y documentar sus formulas. Esto no impide disenar y presentar las pantallas.
- Recomendacion del documento para la primera version operativa: priorizar un flujo comercial verificable y los motores efectivamente definidos, en lugar de activar pagos de siete motores con formulas no entregadas.

---

FIN DEL PROMPT MAESTRO. Responde segun la seccion 0.2 y espera la instruccion "FASE 1".

