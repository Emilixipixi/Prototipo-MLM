import type { EstadoFormativo } from '../../tipos/formacion';
import { relativoHoy } from './fechasCampus';
import { formacionAlumnosCampus } from './alumnosCampus';
import { formacionAlumnosAmpliados } from './alumnosAmpliados';

const NIVEL_1 = 'Programa Liderazgo Comercial - Nivel 1';
const NIVEL_2 = 'Programa Liderazgo Comercial - Nivel 2';
const VENTAS = 'Taller de Ventas Digitales';
const DIPLOMADO = 'Diplomado en Liderazgo y Gestión Comercial';

export const programaExternoPorPrograma: Record<string, string> = {
  'DEMO-CUR-01': NIVEL_1, 'DEMO-CUR-02': NIVEL_2, 'DEMO-CUR-03': VENTAS, 'DEMO-DIP-01': DIPLOMADO,
};

export const formacionCampus: EstadoFormativo[] = ([
  ['DEMO-A16', NIVEL_1, 'aprobado', '2026-11-11'],
  ['DEMO-L03', NIVEL_1, 'aprobado', '2026-07-30'],
  ['DEMO-L03', NIVEL_2, 'aprobado', '2026-10-25'],
  ['DEMO-L03', DIPLOMADO, 'aprobado', '2026-10-25'],
  ['DEMO-L04', NIVEL_2, 'aprobado', relativoHoy(-20)],
  ['DEMO-L04', VENTAS, 'cursando', '2026-11-06'],
  ['DEMO-L04', NIVEL_1, 'matriculado', '2026-11-09'],
  ['DEMO-L05', VENTAS, 'aprobado', '2026-06-15'],
  ['DEMO-L05', NIVEL_1, 'matriculado', '2026-11-03'],
  ['DEMO-L06', NIVEL_2, 'matriculado', '2026-10-29'],
  ['DEMO-L07', NIVEL_2, 'matriculado', '2026-11-10'],
] as Array<[string, string, EstadoFormativo['estado'], string]>).map(([personaId, programaExterno, estado, fechaActualizacion], indice) => ({
  id: `DEMO-FOR-${30 + indice}`, personaId, programaExterno, proveedor: 'ERICK S.A.C.', estado, fechaActualizacion,
}));
formacionCampus.push(...formacionAlumnosCampus);
formacionCampus.push(...formacionAlumnosAmpliados);
