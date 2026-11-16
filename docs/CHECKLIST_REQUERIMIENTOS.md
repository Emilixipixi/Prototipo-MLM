# Checklist de requerimientos MLM-001 a MLM-070

Prototipo navegable MLM 2027. Todos los datos, montos y porcentajes son ficticios (DEMOSTRACIÓN).

Estado: Cubierto = implementado y verificable en la pantalla indicada. Las observaciones aclaran alcances de la demostración.

| ID | Funcionalidad | Pantallas | Dónde comprobarlo | Estado | Observación |
|---|---|---|---|---|---|
| MLM-001 | Acceso seguro: ingreso, recuperacion de acceso y sesion por rol | Ingreso | `/ingresar` | Cubierto |  |
| MLM-002 | Registro por enlace conservando el referente | 03 | `/registro?ref=DEMO-A01` | Cubierto |  |
| MLM-003 | Clasificacion: cliente, alumno, empresario o corporativo | 03, 15 | `/registro?ref=DEMO-A01; /corporativo/usuarios, /corporativo/permisos` | Cubierto |  |
| MLM-004 | Perfil de usuario: datos, patrocinador, estado, compras, roles e historial | 15 | `/corporativo/usuarios, /corporativo/permisos` | Cubierto |  |
| MLM-005 | Permisos configurables por perfil y modulo | 15 | `/corporativo/usuarios, /corporativo/permisos` | Cubierto |  |
| MLM-006 | Estados de cuenta: activo, pendiente, suspendido, bloqueado y su efecto | 15, 23 | `/corporativo/usuarios, /corporativo/permisos; /corporativo/compliance` | Cubierto |  |
| MLM-007 | Auditoria de acceso | 24 | `/corporativo/auditoria, /corporativo/reportes` | Cubierto | Ingresos, cierres de sesión y acciones sensibles quedan en la bitácora (pantalla Auditoría). |
| MLM-008 | Catalogo comercial: alta y edicion de bienes, servicios y programas formativos | 16 | `/corporativo/productos` | Cubierto |  |
| MLM-009 | Precio / VP / VC separados y editables, sin equivalencia obligatoria | 02, 16 | `/catalogo; /corporativo/productos` | Cubierto |  |
| MLM-010 | Carrito: articulos, cantidades, subtotal y resumen | 04 | `/carrito, /checkout, /pedido/:id` | Cubierto |  |
| MLM-011 | Confirmacion de compra con estados | 04, 12 | `/carrito, /checkout, /pedido/:id; /afiliado/compras, /afiliado/liquidaciones` | Cubierto |  |
| MLM-012 | Asociacion comercial: comprador, patrocinador cuando aplique y periodo | 04 | `/carrito, /checkout, /pedido/:id` | Cubierto |  |
| MLM-013 | Movimientos VP/VC: origen y reversion por transaccion | 09, 24 | `/afiliado/volumen; /corporativo/auditoria, /corporativo/reportes` | Cubierto |  |
| MLM-014 | Historico de ventas con buscador | 12, 24 | `/afiliado/compras, /afiliado/liquidaciones; /corporativo/auditoria, /corporativo/reportes` | Cubierto |  |
| MLM-015 | Arbol Unilevel navegable | 06, 17 | `/afiliado/redes/unilevel; /corporativo/arboles` | Cubierto |  |
| MLM-016 | Profundidad hasta 7 niveles | 06 | `/afiliado/redes/unilevel` | Cubierto |  |
| MLM-017 | Arbol Trinario con brazos A, B y C, navegacion y zoom | 07, 17 | `/afiliado/redes/trinaria; /corporativo/arboles` | Cubierto |  |
| MLM-018 | Colocacion separada sin modificar patrocinador | 17 | `/corporativo/arboles` | Cubierto |  |
| MLM-019 | Produccion por brazo | 07, 09 | `/afiliado/redes/trinaria; /afiliado/volumen` | Cubierto |  |
| MLM-020 | Volumen de compensacion: utilizado, restante, acumulado, caducado | 09 | `/afiliado/volumen` | Cubierto |  |
| MLM-021 | Historial estructural | 17, 24 | `/corporativo/arboles; /corporativo/auditoria, /corporativo/reportes` | Cubierto |  |
| MLM-022 | Busqueda en red | 06, 07, 17 | `/afiliado/redes/unilevel; /afiliado/redes/trinaria; /corporativo/arboles` | Cubierto |  |
| MLM-023 | Proteccion de estructura | 17 | `/corporativo/arboles` | Cubierto |  |
| MLM-024 | Calendario configurable de ciclos (demo 14 dias, editable) | 18 | `/corporativo/periodos` | Cubierto |  |
| MLM-025 | Evaluacion mensual diferenciada | 18 | `/corporativo/periodos` | Cubierto | El calendario mensual (DEMO-M10, DEMO-M11) está separado de los ciclos; el requisito de formación se evalúa como mensual. |
| MLM-026 | Catalogo RUN | 19 | `/corporativo/rangos` | Cubierto |  |
| MLM-027 | Condiciones de rango | 19 | `/corporativo/rangos` | Cubierto |  |
| MLM-028 | RUN de Cobro | 05, 10 | `/afiliado/inicio; /afiliado/run` | Cubierto |  |
| MLM-029 | RUN Historico | 05, 10 | `/afiliado/inicio; /afiliado/run` | Cubierto |  |
| MLM-030 | Progreso de calificacion | 10 | `/afiliado/run` | Cubierto |  |
| MLM-031 | Historial de cierres | 18 | `/corporativo/periodos` | Cubierto |  |
| MLM-032 | Parametros versionados | 19, 20 | `/corporativo/rangos; /corporativo/bonos` | Cubierto |  |
| MLM-033 | Simulacion de rango | 19 | `/corporativo/rangos` | Cubierto |  |
| MLM-034 | Actividad comercial | 20, 21 | `/corporativo/bonos; /corporativo/simulador` | Cubierto |  |
| MLM-035 | Patrocinio y activacion | 20, 21 | `/corporativo/bonos; /corporativo/simulador` | Cubierto |  |
| MLM-036 | Unilevel | 20, 21, 11 | `/corporativo/bonos; /corporativo/simulador; /afiliado/bonos` | Cubierto |  |
| MLM-037 | Trinario | 20, 21 | `/corporativo/bonos; /corporativo/simulador` | Cubierto |  |
| MLM-038 | Generaciones | 20, 21 | `/corporativo/bonos; /corporativo/simulador` | Cubierto |  |
| MLM-039 | Bono de rango | 20, 21 | `/corporativo/bonos; /corporativo/simulador` | Cubierto |  |
| MLM-040 | Fondo de liderazgo | 20, 21 | `/corporativo/bonos; /corporativo/simulador` | Cubierto |  |
| MLM-041 | Trazabilidad por bono | 11, 21, 22 | `/afiliado/bonos; /corporativo/simulador; /corporativo/liquidaciones` | Cubierto |  |
| MLM-042 | Simulacion previa | 21 | `/corporativo/simulador` | Cubierto |  |
| MLM-043 | Calculo reproducible | 21 | `/corporativo/simulador` | Cubierto |  |
| MLM-044 | Estados de comision | 11, 22 | `/afiliado/bonos; /corporativo/liquidaciones` | Cubierto |  |
| MLM-045 | Aprobacion de cierre | 18, 22 | `/corporativo/periodos; /corporativo/liquidaciones` | Cubierto |  |
| MLM-046 | Liquidaciones | 12, 22 | `/afiliado/compras, /afiliado/liquidaciones; /corporativo/liquidaciones` | Cubierto |  |
| MLM-047 | Devoluciones | 23 | `/corporativo/compliance` | Cubierto |  |
| MLM-048 | Correcciones | 23 | `/corporativo/compliance` | Cubierto |  |
| MLM-049 | Exportables | 22, 24 | `/corporativo/liquidaciones; /corporativo/auditoria, /corporativo/reportes` | Cubierto |  |
| MLM-050 | Inicio del afiliado | 05 | `/afiliado/inicio` | Cubierto |  |
| MLM-051 | Mi organizacion | 06, 07 | `/afiliado/redes/unilevel; /afiliado/redes/trinaria` | Cubierto |  |
| MLM-052 | Mis directos | 08 | `/afiliado/equipo` | Cubierto |  |
| MLM-053 | Mis brazos | 09 | `/afiliado/volumen` | Cubierto |  |
| MLM-054 | Mis bonos | 11 | `/afiliado/bonos` | Cubierto |  |
| MLM-055 | Mis liquidaciones | 12 | `/afiliado/compras, /afiliado/liquidaciones` | Cubierto |  |
| MLM-056 | Mi proximo RUN | 10 | `/afiliado/run` | Cubierto |  |
| MLM-057 | Panel general | 14 | `/corporativo/resumen` | Cubierto |  |
| MLM-058 | Administracion de red | 17 | `/corporativo/arboles` | Cubierto |  |
| MLM-059 | Alertas de integridad | 14, 23 | `/corporativo/resumen; /corporativo/compliance` | Cubierto |  |
| MLM-060 | Bloqueos y retenciones | 23 | `/corporativo/compliance` | Cubierto |  |
| MLM-061 | Devoluciones auditables | 23, 24 | `/corporativo/compliance; /corporativo/auditoria, /corporativo/reportes` | Cubierto |  |
| MLM-062 | Bitacora | 24 | `/corporativo/auditoria, /corporativo/reportes` | Cubierto |  |
| MLM-063 | Configuracion | 20 | `/corporativo/bonos` | Cubierto | El tope general por afiliado y la caducidad del remanente son parámetros informativos; el tope aplicado es el del motor Trinario. |
| MLM-064 | Reportes | 24 | `/corporativo/auditoria, /corporativo/reportes` | Cubierto |  |
| MLM-065 | LMS externo | 13, 25 | `/afiliado/formacion; /corporativo/integraciones` | Cubierto |  |
| MLM-066 | Comercio externo | 25 | `/corporativo/integraciones` | Cubierto | Tarjeta de conector futuro, no funcional por definición. |
| MLM-067 | Pagos | 25 | `/corporativo/integraciones` | Cubierto | Interfaz de pagos con flujo de ejemplo; nunca transfiere dinero. |
| MLM-068 | Multipais | 20, 25 | `/corporativo/bonos; /corporativo/integraciones` | Cubierto |  |
| MLM-069 | Notificaciones | Todos los layouts | `Todos los layouts` | Cubierto | Centro de notificaciones con avisos de compra, estado, cierre y liquidaciones. |
| MLM-070 | Resiliencia | 25 | `/corporativo/integraciones` | Cubierto | Tarjeta descriptiva de resiliencia (no funcional por definición). |

Total: 70 requerimientos.

## Campus ERICK (LMS-001 a LMS-097)

| ID | Funcionalidad | Dónde comprobarlo | Estado | Observación |
|---|---|---|---|---|
| LMS-001 | Jerarquía de programas | `/corporativo/academico/programas` | Cubierto |  |
| LMS-002 | MID | `/corporativo/academico/programas` | Cubierto |  |
| LMS-003 | Programas independientes | `/corporativo/academico/programas` | Cubierto |  |
| LMS-004 | Totales coherentes | `/corporativo/academico/programas` | Cubierto |  |
| LMS-005 | Estados de programa | `/corporativo/academico/programas` | Cubierto |  |
| LMS-006 | Vínculo con catálogo | `/corporativo/academico/programas` | Cubierto |  |
| LMS-010 | Componentes del tema | `/campus/temas/:id` | Cubierto |  |
| LMS-011 | Videoclase | `/campus/temas/:id` | Cubierto | Clase de YouTube insertada cuando el tema tiene enlace (se marca como vista al terminar o con el botón); sin enlace, video simulado con portada configurable. Demo: DEMO-TEM-001, 002 y 006. |
| LMS-012 | Lectura | `/campus/temas/:id` | Cubierto |  |
| LMS-013 | Caso práctico | `/campus/temas/:id` | Cubierto |  |
| LMS-014 | Descargas autorizadas | `/campus/temas/:id` | Cubierto |  |
| LMS-015 | Avance del tema | `/campus/temas/:id` | Cubierto |  |
| LMS-020 | Tipos de pregunta | `/campus/evaluaciones/:ambito/:id` | Cubierto |  |
| LMS-021 | Banco de preguntas | `/campus/evaluaciones/:ambito/:id` | Cubierto |  |
| LMS-022 | Escala | `/campus/evaluaciones/:ambito/:id` | Cubierto |  |
| LMS-023 | Aprobación | `/campus/evaluaciones/:ambito/:id` | Cubierto |  |
| LMS-024 | Intentos | `/campus/evaluaciones/:ambito/:id` | Cubierto |  |
| LMS-025 | Tiempo límite | `/campus/evaluaciones/:ambito/:id` | Cubierto |  |
| LMS-026 | Retroalimentación | `/campus/evaluaciones/:ambito/:id` | Cubierto |  |
| LMS-027 | TIM | `/campus/evaluaciones/:ambito/:id` | Cubierto |  |
| LMS-028 | Nota de módulo | `/campus/evaluaciones/:ambito/:id` | Cubierto |  |
| LMS-029 | Nota de curso | `/campus/evaluaciones/:ambito/:id` | Cubierto |  |
| LMS-030 | Nota de diplomado | `/campus/programas/:id` | Cubierto |  |
| LMS-031 | Desbloqueo progresivo | `/campus/programas/:id` | Cubierto |  |
| LMS-032 | Sin intentos | `/campus/programas/:id` | Cubierto |  |
| LMS-033 | Recalculo | `/campus/programas/:id` | Cubierto |  |
| LMS-040 | Emisión automática de certificado | `/campus/certificados, /verificar` | Cubierto |  |
| LMS-041 | Emisión automática de diploma | `/campus/certificados, /verificar` | Cubierto |  |
| LMS-042 | Contenido del documento | `/campus/certificados, /verificar` | Cubierto |  |
| LMS-043 | Reverso | `/campus/certificados, /verificar` | Cubierto |  |
| LMS-044 | Código único | `/campus/certificados, /verificar` | Cubierto |  |
| LMS-045 | QR | `/campus/certificados, /verificar` | Cubierto |  |
| LMS-046 | Verificación pública | `/campus/certificados, /verificar` | Cubierto |  |
| LMS-047 | PDF | `/campus/certificados, /verificar` | Cubierto |  |
| LMS-048 | Permanencia | `/campus/certificados, /verificar` | Cubierto |  |
| LMS-049 | Anulación y reemisión | `/campus/certificados, /verificar` | Cubierto |  |
| LMS-050 | Acceso | `/campus` | Cubierto |  |
| LMS-051 | Mis programas | `/campus` | Cubierto |  |
| LMS-052 | Ruta del programa | `/campus` | Cubierto |  |
| LMS-053 | Vista del tema | `/campus` | Cubierto |  |
| LMS-054 | Mis notas | `/campus` | Cubierto |  |
| LMS-055 | Historial académico | `/campus` | Cubierto |  |
| LMS-056 | Mis certificados | `/campus` | Cubierto |  |
| LMS-057 | Mi membresía | `/campus` | Cubierto |  |
| LMS-058 | Acceso vencido | `/campus` | Cubierto |  |
| LMS-060 | Matrícula individual | `/campus/programas, /campus/membresia, /checkout` | Cubierto |  |
| LMS-061 | Membresías | `/campus/programas, /campus/membresia, /checkout` | Cubierto |  |
| LMS-062 | Activación por pago | `/campus/programas, /campus/membresia, /checkout` | Cubierto |  |
| LMS-063 | Renovación | `/campus/programas, /campus/membresia, /checkout` | Cubierto |  |
| LMS-064 | Vencimientos | `/campus/programas, /campus/membresia, /checkout` | Cubierto |  |
| LMS-065 | Precios y descuentos | `/campus/programas, /campus/membresia, /checkout` | Cubierto |  |
| LMS-066 | Matrícula manual | `/campus/programas, /campus/membresia, /checkout` | Cubierto |  |
| LMS-067 | Pasarela peruana simulada | `/campus/programas, /campus/membresia, /checkout` | Cubierto |  |
| LMS-070 | Inscripción MID | `/campus/mid, /evaluador` | Cubierto |  |
| LMS-071 | Entrega | `/campus/mid, /evaluador` | Cubierto |  |
| LMS-072 | Asignación | `/campus/mid, /evaluador` | Cubierto |  |
| LMS-073 | Evaluación manual | `/campus/mid, /evaluador` | Cubierto |  |
| LMS-074 | Constancia MID | `/campus/mid, /evaluador` | Cubierto |  |
| LMS-075 | Bandeja del evaluador | `/campus/mid, /evaluador` | Cubierto | Precarga: 3 sustentaciones asignadas a DEMO-U03 por calificar, 2 aprobadas con constancia, 1 desaprobada y 2 solicitadas por asignar (alumnos DEMO-L08 a DEMO-L17). |
| LMS-080 | Programas | `/corporativo/academico/*` | Cubierto |  |
| LMS-081 | Editor de estructura | `/corporativo/academico/programas/:id` | Cubierto | Validación de horas, alta o baja de temas y reordenamiento de temas y módulos con subir y bajar (solo en borrador). |
| LMS-082 | Contenidos | `/corporativo/academico/programas/:id` | Cubierto | Título, objetivos, lectura, caso, bandera descargable y portada del video (imagen en memoria durante la demostración). |
| LMS-083 | Banco de preguntas | `/corporativo/academico/*` | Cubierto |  |
| LMS-084 | Reglas de aprobación | `/corporativo/academico/*` | Cubierto |  |
| LMS-085 | Matrículas | `/corporativo/academico/matriculas` | Cubierto | Acción Extender (1 a 12 meses, motivo obligatorio) desde el vencimiento vigente o desde hoy si venció; las matrículas por membresía se extienden con la membresía. |
| LMS-086 | Membresías | `/corporativo/academico/*` | Cubierto |  |
| LMS-087 | Certificados | `/corporativo/academico/*` | Cubierto |  |
| LMS-088 | Estadísticas | `/corporativo/academico/resumen` | Cubierto | Indicadores, gráfico de avance promedio por programa y distribución de notas (recharts). |
| LMS-089 | Reportes | `/corporativo/academico/reportes` | Cubierto | CSV y PDF por reporte con filtro por rango de fechas. |
| LMS-090 | Conector | `/corporativo/integraciones` | Cubierto |  |
| LMS-091 | Eventos | `/corporativo/integraciones` | Cubierto |  |
| LMS-092 | Estado formativo | `/corporativo/integraciones` | Cubierto |  |
| LMS-093 | Botón simulado | `/corporativo/integraciones` | Cubierto |  |
| LMS-094 | Integraciones | `/corporativo/integraciones` | Cubierto |  |
| LMS-095 | Volumen comercial | `/corporativo/integraciones` | Cubierto |  |
| LMS-096 | Ficha de persona | `/corporativo/integraciones` | Cubierto |  |
| LMS-097 | API documentada | `/corporativo/integraciones` | Cubierto |  |

Total: 77 requerimientos LMS (77 cubiertos). Pruebas automáticas: `npm run pruebas`.

## Plataforma ERICK S.A.C. independiente (ERK-001 a ERK-011)

Fuente: `docs/PROMPT_ADMIN_EDUCATIVO_ERICK.md`, criterios CE-01 a CE-11. Fases E1 a E4 completadas el 15/11/2026.

| Código | Criterio | Dónde se ve | Estado | Nota |
|---|---|---|---|---|
| ERK-001 | CE-01 Administración completa de ERICK sin entrar al corporativo MLM | `/erick/*` con DEMO-U04 | Cubierto | Resumen, programas, preguntas, matrículas, membresías, certificados, MID, reportes, estudiantes, docentes, calendario, configuración y bitácora. |
| ERK-002 | CE-02 El MLM solo ve Integración ERICK en lectura | `/corporativo/integracion-erick` | Cubierto | `/corporativo/academico/*` redirige. |
| ERK-003 | CE-03 Tema verde pastel en ERICK y azul en el MLM | Todas las pantallas `/erick`, `/campus`, `/docente` | Cubierto | `html[data-tema='erick']` se activa al cambiar de rol. |
| ERK-004 | CE-04 El docente solo ve y modifica sus programas asignados, también por URL | `/docente/cursos/:programaId/*` | Cubierto | Regla en servicios (`puedeGestionarPrograma`); prueba con DEMO-U05 y DEMO-CUR-01. |
| ERK-005 | CE-05 El docente sube un video y el estudiante lo ve | `/docente/cursos/DEMO-CUR-01/clases`, `/campus/temas/:id` | Cubierto | YouTube o archivo MP4/WEBM hasta 300 MB en IndexedDB; el archivo tiene prioridad. |
| ERK-006 | CE-06 Libreta por módulo con exportación CSV y PDF | `/docente/cursos/:programaId/notas` | Cubierto | Coincide con `resumirPrograma` (prueba con DEMO-L12 y DEMO-L17). |
| ERK-007 | CE-07 Notas automáticas intactas; intentos extra con motivo | Cajón del estudiante en la libreta | Cubierto | También observaciones del docente. |
| ERK-008 | CE-08 Fecha del docente en Mi calendario, Próximas fechas y notificación | `/docente/calendario`, `/campus/calendario`, `/campus/programas` | Cubierto | Crear, cambiar o cancelar avisa a todos los matriculados. |
| ERK-009 | CE-09 Sustentaciones MID en el calendario del docente y del estudiante | `/docente/calendario`, `/campus/calendario` | Cubierto | Se generan desde las sustentaciones asignadas. |
| ERK-010 | CE-10 Sin scroll horizontal a 375 px, objetivos de 44 px y foco visible | Revisión 375, 768 y 1440 px | Cubierto | |
| ERK-011 | CE-11 Build, oxlint y pruebas en verde; 16 verificaciones MLM sin cambios | `npm run pruebas`, `/demo/datos` | Cubierto | 54 pruebas (18 de ERICK); verificaciones MLM 16/16. |

Total: 11 requerimientos ERICK (11 cubiertos).

