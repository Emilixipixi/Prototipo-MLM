import type { CodigoRun, ConfiguracionMotor, DefinicionRango, RequisitoRango, VersionReglas } from '../tipos/reglas';

export const ordenRuns: CodigoRun[] = ['RUN300', 'RUN1K', 'RUN3K', 'RUN5K', 'RUN10K', 'RUN30K', 'RUN50K', 'RUN100K', 'RUN300K', 'RUN500K', 'RUN1M'];

const umbrales: Record<CodigoRun, number> = {
  RUN300: 300, RUN1K: 1000, RUN3K: 3000, RUN5K: 5000, RUN10K: 10000, RUN30K: 30000,
  RUN50K: 50000, RUN100K: 100000, RUN300K: 300000, RUN500K: 500000, RUN1M: 1000000,
};

interface Complementarios { vpPersonal?: number; directos?: number; equilibrio?: number; lideres?: number; formacion?: boolean; }

const complementarios: Partial<Record<CodigoRun, Complementarios>> = {
  RUN3K: { vpPersonal: 100 },
  RUN5K: { vpPersonal: 100 },
  RUN10K: { vpPersonal: 100, directos: 3, equilibrio: 20, lideres: 1 },
  RUN30K: { vpPersonal: 200, directos: 4, equilibrio: 25, lideres: 2, formacion: true },
  RUN50K: { vpPersonal: 200, directos: 5, equilibrio: 25, lideres: 3, formacion: true },
  RUN100K: { vpPersonal: 300, directos: 6, equilibrio: 30, lideres: 4, formacion: true },
  RUN300K: { vpPersonal: 300, directos: 8, equilibrio: 30, lideres: 5, formacion: true },
  RUN500K: { vpPersonal: 400, directos: 10, equilibrio: 30, lideres: 6, formacion: true },
  RUN1M: { vpPersonal: 500, directos: 12, equilibrio: 30, lideres: 8, formacion: true },
};

function crearRango(codigo: CodigoRun, orden: number): DefinicionRango {
  const extra = complementarios[codigo] ?? {};
  const requisitos: RequisitoRango[] = [
    { id: `${codigo}-vp-grupal`, tipo: 'vp_grupal', descripcion: 'VP grupal del ciclo (personal + tres brazos)', valor: umbrales[codigo], evaluacion: 'ciclo' },
  ];
  if (extra.vpPersonal) requisitos.push({ id: `${codigo}-vp-personal`, tipo: 'vp_personal', descripcion: 'VP personal del ciclo', valor: extra.vpPersonal, evaluacion: 'ciclo' });
  if (extra.directos) requisitos.push({ id: `${codigo}-directos`, tipo: 'directos_activos', descripcion: 'Patrocinados directos con cuenta activa', valor: extra.directos, evaluacion: 'ciclo' });
  if (extra.equilibrio) requisitos.push({ id: `${codigo}-equilibrio`, tipo: 'equilibrio_brazos', descripcion: 'Equilibrio: el brazo menor aporta al menos este porcentaje', valor: extra.equilibrio, evaluacion: 'ciclo' });
  if (extra.lideres) requisitos.push({ id: `${codigo}-lideres`, tipo: 'lideres_calificados', descripcion: 'Líderes calificados: directos con RUN de Cobro RUN3K o superior', valor: extra.lideres, evaluacion: 'ciclo' });
  if (extra.formacion) requisitos.push({ id: `${codigo}-formacion`, tipo: 'formacion_aprobada', descripcion: 'Formación aprobada en la plataforma educativa', valor: 1, evaluacion: 'mensual' });
  return { codigo, orden, nombreVisible: codigo, requisitos };
}

const rangosBase: DefinicionRango[] = ordenRuns.map((codigo, indice) => crearRango(codigo, indice + 1));

function motoresBase(porcentajeUnilevelN3: number): ConfiguracionMotor[] {
  return [
    {
      codigo: 'actividad_comercial', nombre: 'Actividad comercial', activo: true,
      descripcion: 'Porcentaje ilustrativo sobre el VC de las ventas personales y de clientes referidos del ciclo.',
      parametros: [
        { clave: 'porcentaje', etiqueta: 'Porcentaje sobre VC personal', valor: 10, unidad: '%' },
        { clave: 'vpPersonalMinimo', etiqueta: 'VP personal mínimo', valor: 100, unidad: 'VP' },
      ],
    },
    {
      codigo: 'patrocinio_activacion', nombre: 'Patrocinio y activación', activo: true,
      descripcion: 'Porcentaje ilustrativo sobre el VC del primer pedido confirmado de cada nuevo directo. Un alta sin pedido no genera bono.',
      parametros: [{ clave: 'porcentaje', etiqueta: 'Porcentaje sobre VC del primer pedido', valor: 15, unidad: '%' }],
    },
    {
      codigo: 'unilevel', nombre: 'Unilevel', activo: true,
      descripcion: 'Porcentajes ilustrativos por nivel de patrocinio sobre el VC personal de cada persona del nivel, hasta 7 niveles.',
      parametros: [
        { clave: 'profundidadMaxima', etiqueta: 'Profundidad máxima', valor: 7, unidad: 'niveles' },
        { clave: 'nivel1', etiqueta: 'Nivel 1', valor: 5, unidad: '%' },
        { clave: 'nivel2', etiqueta: 'Nivel 2', valor: 4, unidad: '%' },
        { clave: 'nivel3', etiqueta: 'Nivel 3', valor: porcentajeUnilevelN3, unidad: '%' },
        { clave: 'nivel4', etiqueta: 'Nivel 4', valor: 2, unidad: '%' },
        { clave: 'nivel5', etiqueta: 'Nivel 5', valor: 2, unidad: '%' },
        { clave: 'nivel6', etiqueta: 'Nivel 6', valor: 1, unidad: '%' },
        { clave: 'nivel7', etiqueta: 'Nivel 7', valor: 1, unidad: '%' },
        { clave: 'vpPersonalMinimo', etiqueta: 'VP personal mínimo', valor: 100, unidad: 'VP' },
        { clave: 'nivelesSinRango', etiqueta: 'Niveles habilitados sin rango', valor: 0, unidad: 'niveles' },
        { clave: 'nivelesRUN300', etiqueta: 'Niveles habilitados con RUN300', valor: 1, unidad: 'niveles' },
        { clave: 'nivelesRUN1K', etiqueta: 'Niveles habilitados con RUN1K', valor: 2, unidad: 'niveles' },
        { clave: 'nivelesRUN3K', etiqueta: 'Niveles habilitados con RUN3K', valor: 3, unidad: 'niveles' },
        { clave: 'nivelesRUN5K', etiqueta: 'Niveles habilitados con RUN5K', valor: 5, unidad: 'niveles' },
        { clave: 'nivelesRUN10K', etiqueta: 'Niveles habilitados con RUN10K o superior', valor: 7, unidad: 'niveles' },
      ],
    },
    {
      codigo: 'trinario', nombre: 'Trinario', activo: true,
      descripcion: 'Porcentaje ilustrativo sobre el VC equivalente del volumen utilizado en los brazos A, B y C, con tope por ciclo.',
      parametros: [
        { clave: 'porcentaje', etiqueta: 'Porcentaje sobre VC utilizado', valor: 8, unidad: '%' },
        { clave: 'topePorCiclo', etiqueta: 'Tope por ciclo', valor: 500, unidad: 'USD' },
      ],
    },
    {
      codigo: 'generaciones', nombre: 'Generaciones', activo: true,
      descripcion: 'Porcentajes ilustrativos sobre el VC de hasta tres generaciones de líderes RUN5K o superior.',
      parametros: [
        { clave: 'generacion1', etiqueta: 'Generación 1', valor: 2, unidad: '%' },
        { clave: 'generacion2', etiqueta: 'Generación 2', valor: 1, unidad: '%' },
        { clave: 'generacion3', etiqueta: 'Generación 3', valor: 1, unidad: '%' },
        { clave: 'rangoLider', etiqueta: 'Rango que define un líder', valor: 'RUN5K' },
        { clave: 'rangoMinimo', etiqueta: 'RUN de Cobro mínimo para cobrar', valor: 'RUN30K' },
      ],
    },
    {
      codigo: 'bono_rango', nombre: 'Bono de rango', activo: true,
      descripcion: 'Montos fijos ilustrativos por ascenso (primer logro de un RUN de Cobro) y por mantenimiento de RUN en ciclos consecutivos.',
      parametros: [
        { clave: 'ascensoRUN1K', etiqueta: 'Ascenso a RUN1K', valor: 10, unidad: 'USD' },
        { clave: 'ascensoRUN3K', etiqueta: 'Ascenso a RUN3K', valor: 30, unidad: 'USD' },
        { clave: 'ascensoRUN5K', etiqueta: 'Ascenso a RUN5K', valor: 50, unidad: 'USD' },
        { clave: 'ascensoRUN10K', etiqueta: 'Ascenso a RUN10K', valor: 100, unidad: 'USD' },
        { clave: 'ascensoRUN30K', etiqueta: 'Ascenso a RUN30K', valor: 250, unidad: 'USD' },
        { clave: 'ascensoRUN50K', etiqueta: 'Ascenso a RUN50K', valor: 400, unidad: 'USD' },
        { clave: 'ascensoRUN100K', etiqueta: 'Ascenso a RUN100K', valor: 800, unidad: 'USD' },
        { clave: 'ascensoRUN300K', etiqueta: 'Ascenso a RUN300K', valor: 1500, unidad: 'USD' },
        { clave: 'ascensoRUN500K', etiqueta: 'Ascenso a RUN500K', valor: 2500, unidad: 'USD' },
        { clave: 'ascensoRUN1M', etiqueta: 'Ascenso a RUN1M', valor: 5000, unidad: 'USD' },
        { clave: 'montoMantenimiento', etiqueta: 'Mantenimiento (2 ciclos con el mismo RUN)', valor: 50, unidad: 'USD' },
        { clave: 'rangoMinimoMantenimiento', etiqueta: 'RUN mínimo para mantenimiento', valor: 'RUN5K' },
      ],
    },
    {
      codigo: 'fondo_liderazgo', nombre: 'Fondo de liderazgo', activo: true,
      descripcion: 'Bolsa ilustrativa sobre el VC total de la compañía en el ciclo, repartida en partes iguales entre los rangos superiores.',
      parametros: [
        { clave: 'porcentajeBolsa', etiqueta: 'Porcentaje del VC total', valor: 2, unidad: '%' },
        { clave: 'rangoMinimo', etiqueta: 'RUN de Cobro mínimo para participar', valor: 'RUN10K' },
      ],
    },
  ];
}

export const versionesReglasIniciales: VersionReglas[] = [
  {
    id: 'DEMO-VR-1', numero: 1, vigenteDesde: '2026-10-19', vigenteHasta: '2026-11-15',
    actorId: 'DEMO-U01', fecha: '2026-10-15T10:00:00', motivo: 'Configuración inicial de demostración',
    rangos: rangosBase, motores: motoresBase(3),
    trinario: { reglaConsumo: 'El volumen utilizado de cada brazo es igual a la producción del brazo de menor volumen (regla ilustrativa).', ciclosCaducidad: 4, porcentajeIlustrativo: 8 },
    topes: { maximoPorCicloAfiliado: 2000 }, esDemostracion: true,
  },
  {
    id: 'DEMO-VR-2', numero: 2, vigenteDesde: '2026-11-16', vigenteHasta: null,
    actorId: 'DEMO-U01', fecha: '2026-11-09T16:20:00', motivo: 'Ejemplo de cambio versionado: Unilevel nivel 3 pasa de 3% a 2,5%',
    rangos: rangosBase, motores: motoresBase(2.5),
    trinario: { reglaConsumo: 'El volumen utilizado de cada brazo es igual a la producción del brazo de menor volumen (regla ilustrativa).', ciclosCaducidad: 4, porcentajeIlustrativo: 8 },
    topes: { maximoPorCicloAfiliado: 2000 }, esDemostracion: true,
  },
];
