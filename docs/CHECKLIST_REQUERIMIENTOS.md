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
