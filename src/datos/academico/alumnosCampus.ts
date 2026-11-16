import type { DocumentoAcademico, EventoIntegracion, OrigenMatricula, ProgresoComponente, SustentacionMid } from '../../tipos/academico';
import type { EstadoFormativo } from '../../tipos/formacion';
import type { Persona } from '../../tipos/persona';
import { emitirDocumento } from '../../motores/academico/certificacion';
import { relativoHoy, sumarDias } from './fechasCampus';

const DIPLOMADO = 'DEMO-DIP-01';
const MID = 'DEMO-MID-01';
const EVALUADOR = 'DEMO-U03';
const HORAS_MID = 20;

type FilaAlumno = [id: string, nombres: string, apellidos: string, pais: string, fechaAlta: string, referenteId: string];

const filasAlumnos: FilaAlumno[] = [
  ['DEMO-L08', 'Valeria', 'Cárdenas Ruiz', 'Ecuador', '2026-02-16', 'DEMO-A21'],
  ['DEMO-L09', 'Mateo', 'Herrera Quispe', 'Ecuador', '2026-02-23', 'DEMO-A28'],
  ['DEMO-L10', 'Camila', 'Rojas Aguilar', 'Colombia', '2026-03-09', 'DEMO-A19'],
  ['DEMO-L11', 'Andrés', 'Salinas Pérez', 'Chile', '2026-03-16', 'DEMO-A22'],
  ['DEMO-L12', 'Lucía', 'Benavides Soto', 'México', '2026-04-06', 'DEMO-A24'],
  ['DEMO-L13', 'Joaquín', 'Paredes Vela', 'Ecuador', '2026-05-04', 'DEMO-A29'],
  ['DEMO-L14', 'Martina', 'Castro Oyola', 'Colombia', '2026-06-01', 'DEMO-A26'],
  ['DEMO-L15', 'Tomás', 'Villacrés Mora', 'Ecuador', '2026-07-13', 'DEMO-A36'],
  ['DEMO-L16', 'Daniela', 'Fuentes Iriarte', 'Chile', '2026-09-07', 'DEMO-A30'],
  ['DEMO-L17', 'Gabriel', 'Ordóñez Lara', 'México', '2026-10-05', 'DEMO-A33'],
];

const prefijosTelefono: Record<string, string> = { Colombia: '+57 300', Chile: '+56 9', México: '+52 55', Ecuador: '+593 99' };

function correo(nombres: string, apellidos: string): string {
  const limpiar = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  return `${limpiar(nombres)}.${limpiar(apellidos.split(' ')[0])}@correo.demo`;
}

export const alumnosCampus: Persona[] = filasAlumnos.map(([id, nombres, apellidos, pais, fechaAlta, referenteId], indice) => {
  const numero = String(200 + indice).padStart(3, '0');
  return {
    id, codigo: id, nombres, apellidos, tipo: 'alumno', perfil: 'cliente_alumno', estado: 'activo',
    correo: correo(nombres, apellidos), telefono: `${prefijosTelefono[pais]} 000 ${numero}`, documento: `DEMO-DOC-${numero}`,
    pais, moneda: 'USD', idioma: 'es', fechaAlta, referenteId,
  };
});

export interface SemillaMatriculaAlumno {
  personaId: string; programaId: string; origen: OrigenMatricula; inicio: string;
  aprobados?: number | 'todo'; fin?: string; enCurso?: Partial<ProgresoComponente>; fallidos?: number;
}

export const semillasAlumnosCampus: SemillaMatriculaAlumno[] = [
  { personaId: 'DEMO-L08', programaId: DIPLOMADO, origen: 'manual', inicio: '2026-03-02', aprobados: 'todo', fin: '2026-08-21' },
  { personaId: 'DEMO-L09', programaId: DIPLOMADO, origen: 'manual', inicio: '2026-03-09', aprobados: 'todo', fin: '2026-08-28' },
  { personaId: 'DEMO-L10', programaId: DIPLOMADO, origen: 'manual', inicio: '2026-03-23', aprobados: 'todo', fin: '2026-09-11' },
  { personaId: 'DEMO-L11', programaId: DIPLOMADO, origen: 'manual', inicio: '2026-04-06', aprobados: 'todo', fin: '2026-10-02' },
  { personaId: 'DEMO-L12', programaId: DIPLOMADO, origen: 'manual', inicio: '2026-04-20', aprobados: 30, fin: '2026-11-06', enCurso: { video: true } },
  { personaId: 'DEMO-L13', programaId: DIPLOMADO, origen: 'manual', inicio: '2026-05-18', aprobados: 24, fin: '2026-11-04' },
  { personaId: 'DEMO-L14', programaId: DIPLOMADO, origen: 'manual', inicio: '2026-06-15', aprobados: 20, fin: '2026-11-09', enCurso: { video: true, lectura: true } },
  { personaId: 'DEMO-L15', programaId: DIPLOMADO, origen: 'manual', inicio: '2026-07-20', aprobados: 12, fin: '2026-11-10' },
  { personaId: 'DEMO-L16', programaId: DIPLOMADO, origen: 'manual', inicio: '2026-09-14', aprobados: 6, fin: '2026-11-07', enCurso: { video: true } },
  { personaId: 'DEMO-L17', programaId: DIPLOMADO, origen: 'manual', inicio: '2026-10-12', aprobados: 2, fin: '2026-11-05', fallidos: 1 },
];

export const formacionAlumnosCampus: EstadoFormativo[] = semillasAlumnosCampus.map((semilla, indice) => ({
  id: `DEMO-FOR-${60 + indice}`, personaId: semilla.personaId, programaExterno: 'Diplomado en Liderazgo y Gestión Comercial',
  proveedor: 'ERICK S.A.C.', estado: semilla.aprobados === 'todo' ? 'aprobado' : 'cursando', fechaActualizacion: semilla.fin ?? semilla.inicio,
}));

interface SemillaMid {
  personaId: string; titulo: string; resumen: string; archivo: string; fechaPropuesta: string;
  fechaAsignada?: string; notas?: [number, number, number, number]; observaciones?: string;
}

const rubrica = [
  { criterio: 'Dominio del tema', peso: 30 },
  { criterio: 'Metodología de investigación', peso: 30 },
  { criterio: 'Aplicación práctica de la propuesta', peso: 20 },
  { criterio: 'Comunicación y defensa', peso: 20 },
];

function semillasMid(): SemillaMid[] {
  return [
    {
      personaId: 'DEMO-L08', titulo: 'Liderazgo situacional en equipos de venta directa de Guayaquil',
      resumen: 'Analiza cómo adaptar el estilo de liderazgo según la madurez de cada vendedor y su efecto en la retención del equipo durante seis meses.',
      archivo: 'MID_Cardenas_liderazgo_situacional.pdf', fechaPropuesta: '2026-10-06', fechaAsignada: '2026-10-08',
      notas: [17.5, 16, 18, 17], observaciones: 'Investigación sólida con datos propios. La propuesta de seguimiento semanal es aplicable de inmediato.',
    },
    {
      personaId: 'DEMO-L09', titulo: 'Indicadores de rotación y su relación con la capacitación inicial',
      resumen: 'Compara la rotación de nuevos asesores con y sin inducción estructurada, con una muestra de cuarenta asesores de la región Sierra.',
      archivo: 'MID_Herrera_rotacion_capacitacion.pdf', fechaPropuesta: '2026-10-13', fechaAsignada: '2026-10-15',
      notas: [15.5, 16, 15, 16.5], observaciones: 'Buen planteamiento metodológico. Conviene ampliar la muestra para generalizar las conclusiones.',
    },
    {
      personaId: 'DEMO-L10', titulo: 'Uso de redes sociales en la prospección de clientes',
      resumen: 'Describe las prácticas de prospección en redes sociales de un equipo comercial y propone un guion de primer contacto.',
      archivo: 'MID_Rojas_prospeccion_redes.pdf', fechaPropuesta: '2026-10-20', fechaAsignada: '2026-10-22',
      notas: [12, 11.5, 14, 13], observaciones: 'El marco teórico es insuficiente y la metodología no permite validar la propuesta. Puede volver a presentar el trabajo.',
    },
    {
      personaId: 'DEMO-L11', titulo: 'Modelo de mentoría entre pares para nuevos líderes comerciales',
      resumen: 'Propone un programa de mentoría de doce semanas entre líderes con experiencia y líderes nuevos, con indicadores de seguimiento mensual.',
      archivo: 'MID_Salinas_mentoria_pares.pdf', fechaPropuesta: relativoHoy(2), fechaAsignada: relativoHoy(2),
    },
    {
      personaId: 'DEMO-L12', titulo: 'Gestión del tiempo comercial en equipos remotos',
      resumen: 'Estudia la distribución semanal del tiempo de asesores que trabajan a distancia y plantea una agenda tipo para mejorar el cierre de ventas.',
      archivo: 'MID_Benavides_tiempo_remoto.pdf', fechaPropuesta: relativoHoy(4), fechaAsignada: relativoHoy(5),
    },
    {
      personaId: 'DEMO-L13', titulo: 'Comunicación asertiva en la resolución de objeciones',
      resumen: 'Evalúa el efecto de un taller de comunicación asertiva en la tasa de objeciones resueltas por asesores con menos de un año de experiencia.',
      archivo: 'MID_Paredes_objeciones_asertivas.pdf', fechaPropuesta: relativoHoy(7), fechaAsignada: relativoHoy(8),
    },
    {
      personaId: 'DEMO-L14', titulo: 'Reconocimiento no monetario y motivación del equipo',
      resumen: 'Explora qué formas de reconocimiento no monetario valoran más los asesores y cómo influyen en su permanencia en la organización.',
      archivo: 'MID_Castro_reconocimiento.pdf', fechaPropuesta: relativoHoy(12),
    },
    {
      personaId: 'DEMO-L15', titulo: 'Planificación de metas trimestrales en equipos pequeños',
      resumen: 'Propone una metodología sencilla para fijar y revisar metas trimestrales en equipos de cinco a diez personas con seguimiento quincenal.',
      archivo: 'MID_Villacres_metas_trimestrales.pdf', fechaPropuesta: relativoHoy(15),
    },
    {
      personaId: 'DEMO-L20', titulo: 'Embudo de ventas digitales para emprendedores de catálogo',
      resumen: 'Diseña y prueba durante ocho semanas un embudo de captación por WhatsApp y redes con veinte emprendedores, midiendo conversión por etapa.',
      archivo: 'MID_Marquez_embudo_digital.pdf', fechaPropuesta: '2026-09-21', fechaAsignada: '2026-09-23',
      notas: [18.5, 18, 17.5, 19], observaciones: 'Trabajo sobresaliente: datos completos, análisis riguroso y una propuesta replicable por otros equipos.',
    },
    {
      personaId: 'DEMO-L21', titulo: 'Escucha activa y fidelización de clientes recurrentes',
      resumen: 'Analiza si la práctica de escucha activa en la visita de seguimiento aumenta la recompra de clientes durante tres ciclos comerciales.',
      archivo: 'MID_Pena_escucha_fidelizacion.pdf', fechaPropuesta: relativoHoy(3), fechaAsignada: relativoHoy(6),
    },
    {
      personaId: 'DEMO-L22', titulo: 'Liderazgo femenino en redes de venta directa',
      resumen: 'Recoge la experiencia de doce líderes de equipo y describe las prácticas que más influyen en el crecimiento sostenido de sus redes.',
      archivo: 'MID_Jaramillo_liderazgo_femenino.pdf', fechaPropuesta: relativoHoy(9), fechaAsignada: relativoHoy(11),
    },
    {
      personaId: 'DEMO-L23', titulo: 'Indicadores clave para el seguimiento semanal de un equipo comercial',
      resumen: 'Propone un tablero de cinco indicadores semanales y su rutina de revisión para líderes que gestionan entre diez y veinte asesores.',
      archivo: 'MID_Cordero_indicadores_semanales.pdf', fechaPropuesta: relativoHoy(18),
    },
    {
      personaId: 'DEMO-L28', titulo: 'Capacitación por microlecciones para asesores nuevos',
      resumen: 'Evalúa un plan de microlecciones diarias de cinco minutos durante el primer mes de los asesores y su efecto en las primeras ventas.',
      archivo: 'MID_Villalba_microlecciones.pdf', fechaPropuesta: relativoHoy(21),
    },
  ];
}

function notaPonderada(notas: number[]): number {
  const total = rubrica.reduce((suma, criterio, indice) => suma + notas[indice] * criterio.peso, 0);
  return Math.round((total / 100) * 100) / 100;
}

export function generarMidInicial(documentos: DocumentoAcademico[]): { sustentaciones: SustentacionMid[]; constancias: DocumentoAcademico[]; eventos: Array<Omit<EventoIntegracion, 'id'>> } {
  const sustentaciones: SustentacionMid[] = [];
  const constancias: DocumentoAcademico[] = [];
  const eventos: Array<Omit<EventoIntegracion, 'id'>> = [];
  semillasMid().forEach((semilla, indice) => {
    const notaFinal = semilla.notas ? notaPonderada(semilla.notas) : null;
    const estado: SustentacionMid['estado'] = semilla.notas ? (notaFinal !== null && notaFinal > 14 ? 'aprobado' : 'desaprobado') : semilla.fechaAsignada ? 'asignado' : 'solicitado';
    sustentaciones.push({
      id: `DEMO-SUS-${String(indice + 1).padStart(2, '0')}`, personaId: semilla.personaId, programaId: MID,
      titulo: semilla.titulo, resumen: semilla.resumen, archivo: semilla.archivo, fechaPropuesta: semilla.fechaPropuesta,
      evaluadorId: semilla.fechaAsignada ? EVALUADOR : null, fechaAsignada: semilla.fechaAsignada ?? null,
      rubrica: rubrica.map((criterio, posicion) => ({ ...criterio, nota: semilla.notas ? semilla.notas[posicion] : null })),
      notaFinal, observaciones: semilla.observaciones ?? null, estado,
    });
    if (estado !== 'aprobado' || notaFinal === null || !semilla.fechaAsignada) return;
    const fechaEmision = `${sumarDias(semilla.fechaAsignada, 1)}T16:00:00`;
    const { documento } = emitirDocumento([...documentos, ...constancias], {
      tipo: 'constancia_mid', personaId: semilla.personaId, programaId: MID, nota: notaFinal, horas: HORAS_MID,
      fechaCulminacion: semilla.fechaAsignada, fechaEmision,
      detalle: [{ nombre: 'Sustentación del trabajo de investigación', horas: HORAS_MID, nota: notaFinal }],
    });
    constancias.push(documento);
    eventos.push({
      tipo: 'mid_aprobado', personaId: semilla.personaId, programaId: MID, fecha: fechaEmision, estado: 'procesado',
      carga: { sustentacion: `DEMO-SUS-${String(indice + 1).padStart(2, '0')}`, nota: notaFinal, documento: documento.codigo },
      detalle: `MID aprobado con ${notaFinal.toFixed(2)}`,
    });
  });
  return { sustentaciones, constancias, eventos };
}
