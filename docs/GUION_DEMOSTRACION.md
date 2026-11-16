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

## 7. Campus ERICK (integración LMS)

Campus ERICK es un apartado del mismo prototipo: se entra desde "Campus ERICK" en el menú del afiliado, desde Mi cuenta del alumno o desde el menú de usuario. Comparte la sesión, el selector de rol y la Guía de flujos (F09 a F13). Todos los contenidos, notas y certificados son de DEMOSTRACIÓN.

Mensaje central: "Desde la compra hasta el diploma, sin intervención manual: la matrícula se activa con el pago confirmado, las evaluaciones se califican solas de 0 a 20 (aprueba con más de 14), el certificado se emite al instante y el MLM se entera por el conector".

### Orden recomendado (12 a 15 minutos): F09, F10, F11, F12, F13

- **F09 - Compra y matrícula automática (Alumna DEMO-L01).** Catálogo, Membresía ERICK 1 mes, checkout con "Pasarela local (simulada)" en Aprobado. En el detalle del pedido aparece "Acceso académico generado". En Mi membresía, "Inscribirme" en el Curso Ventas Digitales. Probar también Rechazado: el pedido se cancela y no se activa nada.
- **F10 - Estudio y evaluación (DEMO-L01).** Tema 2: video simulado, lectura con PDF, caso con respuesta guía. La evaluación se habilita al completar los tres. Responder mal a propósito (12/20 desaprueba; 14 tampoco aprueba), luego aprobar. El tema 3 se desbloquea en la ruta.
- **F11 - Certificado con QR (DEMO-L06).** Rendir el TIM 9. Al aprobar, el certificado se emite en el mismo momento. Descargar el PDF (anverso con QR, reverso con módulos, horas y notas) y abrir "Verificar".
- **F12 - Efecto en el rango (DEMO-A01).** Aprobar el TIM 3 del Curso Liderazgo Comercial. Mi formación pasa a aprobado por el conector (sin el botón simulado) y en Mi RUN el requisito de formación queda cumplido. En Integraciones se ve el registro de eventos.
- **F13 - MID (DEMO-L03, U01, U03).** L03 solicita el MID; el superadministrador asigna a DEMO-U03; el evaluador califica con la rúbrica; L03 recibe la constancia y su diploma no cambia.

### Panel académico (Superadministrador, grupo "Académico")

Resumen con indicadores, Programas (crear desde una plantilla, publicar solo si la estructura cuadra: agregar un sexto tema muestra el error), Banco de preguntas, Matrículas (manual, suspender, intento extra a DEMO-A26), Membresías, Certificados (anular y reemitir), Sustentaciones MID y Reportes (CSV y PDF). La Ficha de persona tiene la pestaña "Académico".

### Estados precargados útiles

DEMO-L04 (membresía por vencer en 5 días), DEMO-L05 (acceso vencido con certificado descargable), DEMO-L02 (certificado anulado y reemitido), DEMO-A26 (tema bloqueado por intentos), DEMO-A18 (evento del conector en error).

### Nota sobre la verificación pública

Los datos viven en el navegador. Un QR escaneado desde otro dispositivo verifica los documentos precargados; los emitidos durante la demostración se verifican en el mismo navegador.

## 8. Plataforma ERICK S.A.C. independiente

ERICK S.A.C. tiene su propia identidad (verde pastel) y su propia administración. Cambia de rol con el selector "Rol demo" o desde la Guía de flujos; el tema cambia al instante.

### Recorrido por roles (8 a 10 minutos)

- **Administrador educativo (DEMO-U04, `/erick/resumen`).** Resumen educativo con próximas fechas y carga docente; Estudiantes con ficha lateral; Docentes con asignaciones; Calendario académico; Configuración y Bitácora académica.
- **Docente (DEMO-U03, `/docente/cursos`).** Mis cursos con el avance de cada grupo; Clases en video; Libreta de notas con exportación, intento extra y observaciones; su calendario y la bandeja MID.
- **Alumno (acceso rápido "Alumno" = DEMO-L08 Valeria Cárdenas, `/campus/programas`).** Alumna con el diplomado aprobado (diploma y 2 certificados), MID aprobado con constancia, rúbrica y cronología, y el Curso Ventas Digitales en curso con notas por módulo. Muestra Próximas fechas, Mi calendario, Mis notas, Historial, Certificados, Mi MID y 10 notificaciones.
- **Alumna nueva (acceso rápido "Alumna nueva" = DEMO-L01 Gabriela Ponce).** Recién matriculada en el Curso Liderazgo Comercial; es la alumna de los flujos F09, F10, F14 y F15.

### Orden recomendado: F14, F15, F16

- **F14 - Docente agenda el examen final.** DEMO-U03 abre Calendario y usa "Agendar fecha" para un Examen final del Curso Liderazgo Comercial. Cambiar a DEMO-L01: la campana muestra el aviso, Próximas fechas lo destaca en naranja y Mi calendario lo marca en la vista mensual.
- **F15 - Docente sube una clase.** DEMO-U03 abre Clases en video del Curso Liderazgo Comercial, "Cambiar video" en el tema 1.2 "Estilos de liderazgo" y sube un MP4 o WEBM. Cambiar a DEMO-L01 y abrir el tema: se reproduce la clase subida y al terminar se marca como vista. Se usa el tema 1.2 porque es el que DEMO-L01 tiene disponible (el 1.3 sigue bloqueado hasta aprobar el 1.2).
- **F16 - Administración asigna un docente.** DEMO-U04 abre Docentes y asigna a DEMO-U05 el Curso Liderazgo Comercial. Cambiar a DEMO-U05: el curso aparece en Mis cursos con su libreta. Antes de asignarlo, escribir `/docente/cursos/DEMO-CUR-01/notas` con DEMO-U05 muestra "Este programa no está asignado a ti".

### Notas para la presentación

- Los videos subidos por archivo viven solo en el navegador donde se suben y "Reiniciar demostración" los borra. Para presentar en otro equipo, usar enlaces de YouTube.
- Si el navegador ya tenía datos de una versión anterior, usar "Reiniciar demostración" para ver las notificaciones y fechas precargadas.

