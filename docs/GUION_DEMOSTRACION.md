# Guion de demostración - MLM 2027

Prototipo navegable. Todo nombre, volumen, porcentaje y monto es ficticio y está rotulado DEMOSTRACIÓN. No hay cobros, pagos, transferencias ni integraciones reales.

## 1. Preparación (5 minutos antes)

1. En PowerShell:

   ```powershell
   cd D:\Prototipo\Prototipo-MLM
   npm run dev
   ```

2. Abrir `http://localhost:5173/ingresar` en el navegador, idealmente en pantalla completa.
3. Los datos viven en memoria: **recargar la página reinicia la demostración**. Durante la presentación se navega solo con los menús, el selector "Rol demo" y la **Guía de flujos**.
4. El botón "Guía de flujos" (abajo a la izquierda) lista F01 a F08. Cada paso tiene un botón "Ir" que cambia de rol si hace falta y abre la pantalla correcta. Los pasos con evidencia en los datos se marcan solos.
5. Si algo sale mal, el botón de reinicio de la barra superior ("Reiniciar demostración") restablece todos los datos y la guía.

## 2. Idea central que se repite en cada flujo

Las ventas generan VP y VC; la red de patrocinio (Unilevel) y la red de posiciones (Trinaria) dan el contexto organizacional; las reglas vigentes del período definen calificaciones y bonos; los resultados quedan registrados con trazabilidad y se revisan antes de pagar.

Tres mensajes a recalcar:

- **Patrocinio y posición son cosas distintas.** Quién te invitó no cambia cuando corporativo te coloca en un brazo A, B o C.
- **Nada se sobrescribe.** Una devolución crea un movimiento inverso y un ajuste; un cierre anterior nunca se recalcula con reglas nuevas.
- **Simular no es pagar.** Una corrida simulada se distingue visualmente (borde punteado) de una liquidación aprobada, y la liquidación es "simulada, sin transferencia".

## 3. Orden recomendado

Hacer los flujos en este orden dentro de la misma sesión: F03, F07, F01, F02, F04, F05, F06, F08. Así cada flujo aprovecha lo que dejó el anterior. Duración aproximada: 25 a 30 minutos.

## 4. Flujos

### F03 - Progreso de rango (afiliado DEMO-A01)

- **Qué se demuestra:** el afiliado entiende su situación sin conocer fórmulas.
- **Pasos:** Ingresar como Afiliado. En Mi inicio señalar las dos insignias: RUN Histórico (el máximo alcanzado en su trayectoria, un reconocimiento) y RUN de Cobro (lo que calificó en el último cierre, lo que se usa para pagar). Pasar por Mi volumen (producción por brazo y saldos) y abrir Mi RUN.
- **Qué decir:** "Para el siguiente rango, cada requisito dice cuánto se pide, cuánto lleva, cuánto le falta y de dónde sale el dato".

### F07 - Formación como condición (afiliado DEMO-A01)

- **Pasos:** Mi formación: el programa aparece "cursando". Pulsar "Simular actualización desde LMS": pasa a "aprobado". Volver a Mi RUN: el requisito de formación aparece cumplido.
- **Qué decir:** "La plataforma educativa externa no está conectada; el conector está pendiente de integración. Simulamos el dato para mostrar el efecto en la calificación".

### F01 - Afiliación por patrocinio

- **Pasos:**
  1. Como DEMO-A01, copiar el enlace de patrocinio desde Mi inicio.
  2. Abrir `/registro?ref=DEMO-A01` (paso 2 de la guía): la tarjeta del patrocinador queda fija. Registrar un empresario. La cuenta queda pendiente.
  3. Como Superadministrador, ir a Árboles, panel "Colocación administrativa": elegir a la persona nueva, un espacio libre (por ejemplo, un brazo libre bajo DEMO-A08) y un motivo.
  4. Mostrar la persona en la pestaña Trinaria (bajo su padre de posición) y en Unilevel (bajo DEMO-A01).
- **Prueba de protección (MLM-023):** en el mismo panel, modo "Manual", intentar colocar en `DEMO-POS-000` brazo A: aparece el error "ya está ocupado" y no se guarda. En "Cambio de patrocinador", intentar que DEMO-A01 tenga como patrocinador a DEMO-A03: se bloquea porque formaría un ciclo.

### F02 - Venta y generación de volumen

- **Pasos:** Como Cliente DEMO-C01, agregar un producto al carrito, ir al checkout, confirmar el pedido y pulsar "Simular confirmación de cobro". En el detalle del pedido se ve la línea de tiempo y los movimientos VP/VC generados en DEMO-C02.
- **Qué decir:** "Precio, VP y VC son tres valores independientes del producto. El volumen nace solo cuando el cobro se confirma".
- **Comprobar:** en Reportes, pestaña Productos, aparece la venta del ciclo.

### F04 - Ciclo y bonos (Superadministrador)

- **Pasos:** Períodos: mostrar DEMO-C02 abierto, de 14 días y editable, y el calendario. Simulador: período DEMO-C02, versión DEMO-VR-1, "Ejecutar corrida".
- **Recorrido de resultados:** las siete tarjetas de concepto (actividad comercial, patrocinio y activación, Unilevel, Trinario, generaciones, bono de rango y fondo de liderazgo) están separadas; cada pestaña lista sus partidas y cada fila abre el desglose. Mostrar "Reproducir corrida" (mismo resultado con las mismas reglas y movimientos) y la clave de idempotencia. Pulsar "Enviar a revisión".
- **Qué decir:** "Cada concepto es un motor independiente que se puede activar, desactivar o reparametrizar en Bonos, siempre creando una versión nueva con vigencia".

### F05 - Revisión y liquidación

- **Pasos:**
  1. Como Superadministrador, en Permisos, perfil Operador, activar "Aprobar" y "Liquidar" en Liquidaciones (se aplica de inmediato).
  2. Cambiar el rol a Operador e ir a Liquidaciones.
  3. En la corrida en revisión, aprobar o retener partidas. Buscar DEMO-A05 en "Por afiliado": aparece con partidas retenidas por su suspensión.
  4. "Aprobar corrida" y luego "Generar liquidaciones". Pulsar otra vez "Generar liquidaciones": el sistema responde que ya existe y no duplica.
  5. Cambiar a Afiliado DEMO-A01 y abrir Mis liquidaciones: aparece la del ciclo con la nota "sin transferencia monetaria".
- **Qué decir:** "Un reintento no duplica pagos; la corrida aprobada queda congelada".

### F06 - Devolución de venta (Superadministrador)

- **Pasos:** Compliance, pestaña Devoluciones. Elegir DEMO-P03 y abrir la "Vista previa de la reversión": se ven los movimientos inversos de VP/VC. Escribir el motivo y confirmar. La "Cadena auditable" muestra pedido, reversión y ajustes.
- **Ejemplo histórico:** DEMO-P02 ya estaba devuelto y muestra ajustes sobre el ciclo cerrado DEMO-C01. El cierre de C01 no se modifica: los ajustes se aplican en la liquidación siguiente.
- **Comprobar:** en Auditoría, buscar "devolución" y abrir el detalle con valor anterior y nuevo.

### F08 - Control corporativo (Superadministrador)

- **Pasos:**
  1. Resumen: mostrar la alerta DEMO-ALR-01.
  2. Compliance, pestaña Alertas: "Abrir ficha de revisión". El documento y el teléfono coinciden y están resaltados.
  3. Pulsar "Estado de DEMO-A11", elegir "Suspendido" y escribir un motivo obligatorio.
  4. Escribir la decisión y pulsar "Resolver alerta".
  5. Reportes, pestaña Compliance: se consolidan las decisiones. Auditoría registra cada paso.

## 5. Criterios de aceptación y dónde se ven

| CA | Dónde demostrarlo |
|---|---|
| CA-01 | Ingreso con botones por perfil; menús distintos; el operador ve módulos con candado. |
| CA-02 | `/registro?ref=DEMO-A01` con tarjeta fija del patrocinador. |
| CA-03 | Buscar DEMO-A04 en los dos árboles: patrocinador DEMO-A01, padre de posición DEMO-A03. |
| CA-04 | Árbol Trinario con ranuras A, B y C coloreadas y producción por brazo. |
| CA-05 | Pedido con precio, VP y VC y línea de tiempo de estados (F02). |
| CA-06 | El pedido confirmado aparece en el historial, en Mi volumen y en Reportes. |
| CA-07 | Rangos: los 11 RUN exactos y versiones con vigencia. |
| CA-08 | Mi inicio de DEMO-A01: RUN100K Histórico y RUN10K de Cobro. |
| CA-09 | Mi RUN: checklist hacia RUN30K. |
| CA-10 | Períodos: C01, C02 y C03 con duración editable. |
| CA-11 | Bonos: siete tarjetas de motor independientes. |
| CA-12 | Mis bonos, desglose Unilevel con niveles 1 a 7. |
| CA-13 | Mi volumen: generado, utilizado, restante, acumulado y caducado. |
| CA-14 | Simulador y Liquidaciones: versión de reglas visible; corrida punteada frente a liquidación aprobada. |
| CA-15 | F06 y Auditoría: cadena pedido, reversión y ajuste. |
| CA-16 | DEMO-A05 suspendido con liquidación retenida y motivo. |
| CA-17 | Mi formación y Mi cuenta del alumno: matriculado, cursando y aprobado como datos de prueba. |
| CA-18 | Probar en el celular o con el ancho de la ventana reducido: árboles en lista, tablas como tarjetas, menú lateral en cajón. |
| CA-19 | Leyendas DEMOSTRACIÓN, checkout "simulado", liquidaciones "sin transferencia" e Integraciones sin conectores activos. |
| CA-20 | Este guion explica cada flujo por su lógica, sin depender de porcentajes. |

## 6. Preguntas frecuentes del público

- **¿Estos porcentajes son el plan real?** No. Son valores ilustrativos editables. El plan definitivo se carga por configuración y crea una versión nueva de reglas.
- **¿Qué pasa si cambian las reglas a mitad de mes?** La versión nueva aplica desde su vigencia. Los períodos cerrados conservan la versión con la que se calcularon.
- **¿Se puede pagar dos veces por error?** No. Generar liquidaciones es idempotente y cada corrida guarda su clave.
- **¿Qué se necesita para pasar a producción?** Backend con base de datos transaccional, motor de cálculo desacoplado, colas con reintentos y adaptadores para LMS, comercio electrónico y pagos (ver Integraciones).
