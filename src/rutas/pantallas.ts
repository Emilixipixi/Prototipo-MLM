export interface InfoPantalla {
  patron: string;
  numero: string;
  nombre: string;
  requerimientos: string[];
  fase: number;
  descripcion: string;
}

export const pantallas: InfoPantalla[] = [
  { patron: '/', numero: '01', nombre: 'Inicio y presentación', requerimientos: [], fase: 3, descripcion: 'Presentación de productos, servicios y programas formativos.' },
  { patron: '/catalogo', numero: '02', nombre: 'Catálogo', requerimientos: ['MLM-008', 'MLM-009'], fase: 3, descripcion: 'Catálogo con filtros por categoría y búsqueda.' },
  { patron: '/catalogo/:id', numero: '02', nombre: 'Ficha de producto', requerimientos: ['MLM-008', 'MLM-009'], fase: 3, descripcion: 'Precio visible para todos; VP y VC según perfil.' },
  { patron: '/registro', numero: '03', nombre: 'Registro desde enlace de patrocinador', requerimientos: ['MLM-002', 'MLM-003'], fase: 3, descripcion: 'Formulario que conserva visualmente al patrocinador.' },
  { patron: '/carrito', numero: '04', nombre: 'Carrito', requerimientos: ['MLM-010'], fase: 3, descripcion: 'Artículos, cantidades, subtotal y resumen.' },
  { patron: '/checkout', numero: '04', nombre: 'Confirmación de pedido', requerimientos: ['MLM-011', 'MLM-012'], fase: 3, descripcion: 'Comprador, referente, período y confirmación simulada.' },
  { patron: '/pedido/:id', numero: '04', nombre: 'Detalle de pedido', requerimientos: ['MLM-011', 'MLM-013'], fase: 3, descripcion: 'Línea de tiempo de estados y movimientos VP/VC.' },
  { patron: '/cuenta', numero: 'C', nombre: 'Mi cuenta', requerimientos: ['MLM-004'], fase: 3, descripcion: 'Datos, compras, comprobantes y estado formativo.' },
  { patron: '/afiliado/inicio', numero: '05', nombre: 'Dashboard de desempeño y RUN', requerimientos: ['MLM-050'], fase: 4, descripcion: 'RUN de Cobro, RUN Histórico, VP, VC y ciclo vigente.' },
  { patron: '/afiliado/redes/unilevel', numero: '06', nombre: 'Mi genealogía Unilevel', requerimientos: ['MLM-015', 'MLM-016', 'MLM-022'], fase: 4, descripcion: 'Árbol por niveles de patrocinio, hasta 7 niveles.' },
  { patron: '/afiliado/redes/trinaria', numero: '07', nombre: 'Mi organización Trinaria A/B/C', requerimientos: ['MLM-017', 'MLM-019', 'MLM-022'], fase: 4, descripcion: 'Posiciones con brazos A, B y C, zoom y producción.' },
  { patron: '/afiliado/equipo', numero: '08', nombre: 'Mi equipo', requerimientos: ['MLM-052'], fase: 4, descripcion: 'Directos, clientes referidos y actividad.' },
  { patron: '/afiliado/volumen', numero: '09', nombre: 'Volumen y saldo por brazo', requerimientos: ['MLM-013', 'MLM-019', 'MLM-020', 'MLM-053'], fase: 4, descripcion: 'Generado, utilizado, restante, acumulado y caducado.' },
  { patron: '/afiliado/run', numero: '10', nombre: 'Progreso hacia siguiente RUN', requerimientos: ['MLM-028', 'MLM-029', 'MLM-030', 'MLM-056'], fase: 4, descripcion: 'Checklist con requisitos cumplidos, faltantes y fuente.' },
  { patron: '/afiliado/bonos', numero: '11', nombre: 'Bonos y desglose de comisiones', requerimientos: ['MLM-041', 'MLM-044', 'MLM-054'], fase: 4, descripcion: 'Siete conceptos separados con trazabilidad.' },
  { patron: '/afiliado/compras', numero: '12', nombre: 'Historial de compras', requerimientos: ['MLM-014'], fase: 4, descripcion: 'Compras propias y de clientes con buscador.' },
  { patron: '/afiliado/liquidaciones', numero: '12', nombre: 'Historial de liquidaciones', requerimientos: ['MLM-046', 'MLM-055'], fase: 4, descripcion: 'Conceptos, ajustes, total, estado y comprobante.' },
  { patron: '/afiliado/formacion', numero: '13', nombre: 'Estado de formación vinculada', requerimientos: ['MLM-065'], fase: 4, descripcion: 'Estados matriculado, cursando y aprobado (dato de prueba).' },
  { patron: '/corporativo/resumen', numero: '14', nombre: 'Panel corporativo y alertas', requerimientos: ['MLM-057', 'MLM-059'], fase: 5, descripcion: 'KPIs generales y bandeja de alertas de integridad.' },
  { patron: '/corporativo/usuarios', numero: '15', nombre: 'Usuarios, estados y roles', requerimientos: ['MLM-003', 'MLM-004', 'MLM-006'], fase: 5, descripcion: 'Tabla de usuarios, alta y cambio de estado con motivo.' },
  { patron: '/corporativo/usuarios/:id', numero: '15', nombre: 'Ficha de persona', requerimientos: ['MLM-004'], fase: 5, descripcion: 'Datos, patrocinio, posición, compras, RUN, bonos y liquidaciones.' },
  { patron: '/corporativo/permisos', numero: '15', nombre: 'Matriz de permisos', requerimientos: ['MLM-005'], fase: 5, descripcion: 'Permisos por perfil y módulo, con efecto inmediato.' },
  { patron: '/corporativo/productos', numero: '16', nombre: 'Catálogo: productos, precios, VP y VC', requerimientos: ['MLM-008', 'MLM-009'], fase: 5, descripcion: 'Alta y edición con precio, VP y VC independientes.' },
  { patron: '/corporativo/arboles', numero: '17', nombre: 'Editor y visor de redes / posiciones', requerimientos: ['MLM-015', 'MLM-017', 'MLM-018', 'MLM-021', 'MLM-023', 'MLM-058'], fase: 5, descripcion: 'Colocación administrativa y validaciones de estructura.' },
  { patron: '/corporativo/periodos', numero: '18', nombre: 'Períodos y cierre comercial', requerimientos: ['MLM-024', 'MLM-025', 'MLM-031', 'MLM-045'], fase: 5, descripcion: 'Ciclos de 14 días editables y calendario mensual.' },
  { patron: '/corporativo/rangos', numero: '19', nombre: 'Editor de rangos y requisitos', requerimientos: ['MLM-026', 'MLM-027', 'MLM-032', 'MLM-033'], fase: 5, descripcion: 'Los 11 RUN con requisitos ficticios versionados.' },
  { patron: '/corporativo/bonos', numero: '20', nombre: 'Configuración de bonos y parámetros', requerimientos: ['MLM-034', 'MLM-040', 'MLM-063', 'MLM-068'], fase: 6, descripcion: 'Siete motores separados con parámetros ilustrativos.' },
  { patron: '/corporativo/simulador', numero: '21', nombre: 'Simulador de compensaciones', requerimientos: ['MLM-041', 'MLM-042', 'MLM-043'], fase: 6, descripcion: 'Corridas reproducibles con versión de reglas visible.' },
  { patron: '/corporativo/liquidaciones', numero: '22', nombre: 'Revisión, aprobación y liquidaciones', requerimientos: ['MLM-044', 'MLM-045', 'MLM-046', 'MLM-049'], fase: 6, descripcion: 'Aprobar o retener partidas y generar liquidaciones simuladas.' },
  { patron: '/corporativo/compliance', numero: '23', nombre: 'Compliance, suspensiones y ajustes', requerimientos: ['MLM-047', 'MLM-048', 'MLM-059', 'MLM-060', 'MLM-061'], fase: 6, descripcion: 'Alertas, suspensiones, devoluciones y correcciones.' },
  { patron: '/corporativo/auditoria', numero: '24', nombre: 'Auditoría', requerimientos: ['MLM-007', 'MLM-062'], fase: 6, descripcion: 'Bitácora filtrable con valores anterior y nuevo.' },
  { patron: '/corporativo/reportes', numero: '24', nombre: 'Reportes exportables', requerimientos: ['MLM-014', 'MLM-049', 'MLM-064'], fase: 6, descripcion: 'Filtros por afiliado, producto, RUN, período y estado.' },
  { patron: '/corporativo/integraciones', numero: '25', nombre: 'Integraciones / estado de conectores', requerimientos: ['MLM-065', 'MLM-066', 'MLM-067', 'MLM-068', 'MLM-069', 'MLM-070'], fase: 6, descripcion: 'LMS, e-commerce, pagos, notificaciones y mercados (conceptual).' },
  { patron: '/demo/datos', numero: 'D', nombre: 'Datos de demostración', requerimientos: [], fase: 2, descripcion: 'Inspección interna de los datos DEMO y verificación de consistencia.' },
];
