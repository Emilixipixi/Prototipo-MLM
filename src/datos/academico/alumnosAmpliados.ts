import type { EventoIntegracion, Membresia, OrigenMatricula, ProgresoComponente } from '../../tipos/academico';
import type { EstadoFormativo } from '../../tipos/formacion';
import type { Persona } from '../../tipos/persona';
import { relativoHoy } from './fechasCampus';
import { planesMembresiaIniciales } from './membresias';

const programaExternoPorPrograma: Record<string, string> = {
  'DEMO-CUR-01': 'Programa Liderazgo Comercial - Nivel 1', 'DEMO-CUR-02': 'Programa Liderazgo Comercial - Nivel 2',
  'DEMO-CUR-03': 'Taller de Ventas Digitales', 'DEMO-DIP-01': 'Diplomado en Liderazgo y Gestión Comercial',
};

type FilaAlumno = [id: string, nombres: string, apellidos: string, pais: string, fechaAlta: string, referenteId: string];

const filasAlumnos: FilaAlumno[] = [
  ['DEMO-L18', 'Sofía', 'Andrade Cevallos', 'Ecuador', '2026-01-12', 'DEMO-A21'],
  ['DEMO-L19', 'Emiliano', 'Rosero Vaca', 'Ecuador', '2026-01-19', 'DEMO-A28'],
  ['DEMO-L20', 'Isabella', 'Márquez Toro', 'Colombia', '2026-01-26', 'DEMO-A19'],
  ['DEMO-L21', 'Santiago', 'Peña Arboleda', 'Colombia', '2026-02-02', 'DEMO-A20'],
  ['DEMO-L22', 'Valentina', 'Jaramillo Ruiz', 'Ecuador', '2026-02-09', 'DEMO-A29'],
  ['DEMO-L23', 'Sebastián', 'Cordero Pineda', 'México', '2026-02-16', 'DEMO-A24'],
  ['DEMO-L24', 'Mariana', 'Escobar Llerena', 'Ecuador', '2026-03-02', 'DEMO-A36'],
  ['DEMO-L25', 'Nicolás', 'Guzmán Solís', 'Chile', '2026-03-09', 'DEMO-A22'],
  ['DEMO-L26', 'Antonella', 'Ríos Benítez', 'Chile', '2026-03-16', 'DEMO-A30'],
  ['DEMO-L27', 'Diego', 'Montalvo Cruz', 'México', '2026-03-23', 'DEMO-A33'],
  ['DEMO-L28', 'Renata', 'Villalba Ochoa', 'Colombia', '2026-04-06', 'DEMO-A26'],
  ['DEMO-L29', 'Felipe', 'Aguirre Naranjo', 'Ecuador', '2026-04-13', 'DEMO-A21'],
  ['DEMO-L30', 'Paula', 'Zambrano Ortiz', 'Ecuador', '2026-04-20', 'DEMO-A28'],
  ['DEMO-L31', 'Matías', 'Lozano Gil', 'Colombia', '2026-05-04', 'DEMO-A34'],
  ['DEMO-L32', 'Julieta', 'Navarrete Paz', 'Chile', '2026-05-11', 'DEMO-A23'],
  ['DEMO-L33', 'Bruno', 'Espinosa Rey', 'México', '2026-05-18', 'DEMO-A25'],
  ['DEMO-L34', 'Ariana', 'Calderón Mena', 'Ecuador', '2026-06-01', 'DEMO-A29'],
  ['DEMO-L35', 'Thiago', 'Burbano León', 'Colombia', '2026-06-08', 'DEMO-A35'],
  ['DEMO-L36', 'Emma', 'Salgado Viteri', 'Ecuador', '2026-06-15', 'DEMO-A36'],
  ['DEMO-L37', 'Lucas', 'Hidalgo Prieto', 'Chile', '2026-06-22', 'DEMO-A37'],
  ['DEMO-L38', 'Victoria', 'Cisneros Mora', 'México', '2026-07-06', 'DEMO-A33'],
  ['DEMO-L39', 'Benjamín', 'Tapia Granda', 'Ecuador', '2026-07-13', 'DEMO-A21'],
  ['DEMO-L40', 'Abril', 'Mendoza Ulloa', 'Colombia', '2026-07-20', 'DEMO-A39'],
  ['DEMO-L41', 'Joaquín', 'Bermeo Castro', 'Ecuador', '2026-08-03', 'DEMO-A28'],
  ['DEMO-L42', 'Catalina', 'Fierro Duarte', 'Chile', '2026-08-10', 'DEMO-A22'],
  ['DEMO-L43', 'Gael', 'Ortega Lima', 'México', '2026-08-24', 'DEMO-A24'],
  ['DEMO-L44', 'Regina', 'Vásquez Coello', 'Ecuador', '2026-09-07', 'DEMO-A29'],
  ['DEMO-L45', 'Maximiliano', 'Suárez Pinto', 'Colombia', '2026-09-21', 'DEMO-A35'],
  ['DEMO-L46', 'Ximena', 'Barrera Quito', 'Ecuador', '2026-10-05', 'DEMO-A36'],
  ['DEMO-L47', 'Leonardo', 'Romo Esparza', 'México', '2026-10-19', 'DEMO-A33'],
];

const prefijosTelefono: Record<string, string> = { Colombia: '+57 300', Chile: '+56 9', México: '+52 55', Ecuador: '+593 99' };

function correo(nombres: string, apellidos: string): string {
  const limpiar = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  return `${limpiar(nombres)}.${limpiar(apellidos.split(' ')[0])}@correo.demo`;
}

export const alumnosAmpliados: Persona[] = filasAlumnos.map(([id, nombres, apellidos, pais, fechaAlta, referenteId], indice) => {
  const numero = String(210 + indice).padStart(3, '0');
  return {
    id, codigo: id, nombres, apellidos, tipo: 'alumno', perfil: 'cliente_alumno', estado: 'activo',
    correo: correo(nombres, apellidos), telefono: `${prefijosTelefono[pais]} 000 ${numero}`, documento: `DEMO-DOC-${numero}`,
    pais, moneda: 'USD', idioma: 'es', fechaAlta, referenteId,
  };
});

type FilaMembresia = [personaId: string, plan: number, inicioRelativo: number];

const filasMembresias: FilaMembresia[] = [
  ['DEMO-L24', 12, -150], ['DEMO-L25', 6, -40], ['DEMO-L26', 3, -30], ['DEMO-L27', 1, -26], ['DEMO-L28', 9, -120],
  ['DEMO-L29', 2, -55], ['DEMO-L30', 6, -200], ['DEMO-L31', 3, -100], ['DEMO-L32', 12, -20], ['DEMO-L33', 1, -10],
];

function sumarMesesDesde(fecha: string, meses: number): string {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const destino = new Date(Date.UTC(anio, mes - 1 + meses, dia));
  return destino.toISOString().slice(0, 10);
}

export const membresiasAmpliadas: Membresia[] = filasMembresias.map(([personaId, meses, inicioRelativo], indice) => {
  const plan = planesMembresiaIniciales.find((item) => item.meses === meses) ?? planesMembresiaIniciales[0];
  const inicio = relativoHoy(inicioRelativo);
  return {
    id: `DEMO-MEM-${String(indice + 2).padStart(2, '0')}`, personaId, planId: plan.id, pedidoIds: [],
    inicio, vencimiento: sumarMesesDesde(inicio, plan.meses), suspendida: false,
  };
});

export interface SemillaMatriculaAmpliada {
  personaId: string; programaId: string; origen: OrigenMatricula; membresiaId?: string; inicio: string; vencimiento?: string;
  aprobados?: number | 'todo'; fin?: string; enCurso?: Partial<ProgresoComponente>; fallidos?: number;
}

function porMembresia(personaId: string, programaId: string, aprobados: number | 'todo' | undefined, fin?: string, enCurso?: Partial<ProgresoComponente>): SemillaMatriculaAmpliada {
  const membresia = membresiasAmpliadas.find((item) => item.personaId === personaId);
  if (!membresia) throw new Error(`Sin membresía para ${personaId}`);
  return { personaId, programaId, origen: 'membresia', membresiaId: membresia.id, inicio: membresia.inicio, vencimiento: membresia.vencimiento, aprobados, fin, enCurso };
}

export const semillasAlumnosAmpliados: SemillaMatriculaAmpliada[] = [
  { personaId: 'DEMO-L18', programaId: 'DEMO-CUR-01', origen: 'manual', inicio: '2026-01-19', aprobados: 'todo', fin: '2026-04-10' },
  { personaId: 'DEMO-L18', programaId: 'DEMO-CUR-03', origen: 'manual', inicio: '2026-05-04', aprobados: 'todo', fin: '2026-07-24' },
  { personaId: 'DEMO-L19', programaId: 'DEMO-CUR-01', origen: 'manual', inicio: '2026-01-26', aprobados: 'todo', fin: '2026-04-30' },
  { personaId: 'DEMO-L19', programaId: 'DEMO-CUR-02', origen: 'manual', inicio: '2026-05-11', aprobados: 11, fin: '2026-08-14' },
  { personaId: 'DEMO-L20', programaId: 'DEMO-DIP-01', origen: 'manual', inicio: '2026-02-02', aprobados: 'todo', fin: '2026-07-31' },
  { personaId: 'DEMO-L21', programaId: 'DEMO-DIP-01', origen: 'manual', inicio: '2026-02-09', aprobados: 'todo', fin: '2026-08-07' },
  { personaId: 'DEMO-L22', programaId: 'DEMO-DIP-01', origen: 'manual', inicio: '2026-02-16', aprobados: 'todo', fin: '2026-08-14' },
  { personaId: 'DEMO-L23', programaId: 'DEMO-DIP-01', origen: 'manual', inicio: '2026-02-23', aprobados: 33, fin: '2026-11-03', enCurso: { video: true, lectura: true } },
  porMembresia('DEMO-L24', 'DEMO-CUR-01', 'todo', relativoHoy(-80)),
  porMembresia('DEMO-L24', 'DEMO-CUR-02', 9, relativoHoy(-3), { video: true }),
  porMembresia('DEMO-L25', 'DEMO-CUR-03', 10, relativoHoy(-2)),
  porMembresia('DEMO-L26', 'DEMO-CUR-01', 7, relativoHoy(-4), { video: true, lectura: true }),
  porMembresia('DEMO-L27', 'DEMO-CUR-03', 5, relativoHoy(-1)),
  porMembresia('DEMO-L28', 'DEMO-DIP-01', 21, relativoHoy(-5)),
  porMembresia('DEMO-L29', 'DEMO-CUR-02', 13, relativoHoy(-6)),
  porMembresia('DEMO-L30', 'DEMO-CUR-01', 'todo', relativoHoy(-110)),
  porMembresia('DEMO-L30', 'DEMO-CUR-03', 15, relativoHoy(-24)),
  porMembresia('DEMO-L31', 'DEMO-CUR-02', 4, relativoHoy(-18)),
  porMembresia('DEMO-L32', 'DEMO-CUR-01', 3, relativoHoy(-2), { video: true }),
  porMembresia('DEMO-L33', 'DEMO-CUR-03', 1, relativoHoy(-1)),
  { personaId: 'DEMO-L34', programaId: 'DEMO-CUR-01', origen: 'manual', inicio: '2026-06-08', aprobados: 'todo', fin: '2026-09-04' },
  { personaId: 'DEMO-L35', programaId: 'DEMO-CUR-03', origen: 'manual', inicio: '2026-06-15', aprobados: 'todo', fin: '2026-09-18' },
  { personaId: 'DEMO-L36', programaId: 'DEMO-CUR-02', origen: 'manual', inicio: '2026-06-22', aprobados: 'todo', fin: '2026-10-02' },
  { personaId: 'DEMO-L37', programaId: 'DEMO-CUR-01', origen: 'manual', inicio: '2026-07-01', aprobados: 14, fin: '2026-11-02', fallidos: 2 },
  { personaId: 'DEMO-L38', programaId: 'DEMO-CUR-03', origen: 'manual', inicio: '2026-07-13', aprobados: 12, fin: '2026-11-08' },
  { personaId: 'DEMO-L39', programaId: 'DEMO-CUR-01', origen: 'manual', inicio: '2026-07-20', aprobados: 9, fin: '2026-11-06', enCurso: { video: true } },
  { personaId: 'DEMO-L40', programaId: 'DEMO-CUR-02', origen: 'manual', inicio: '2026-07-27', aprobados: 6, fin: '2026-10-30' },
  { personaId: 'DEMO-L41', programaId: 'DEMO-DIP-01', origen: 'manual', inicio: '2026-08-10', aprobados: 16, fin: '2026-11-10' },
  { personaId: 'DEMO-L42', programaId: 'DEMO-CUR-03', origen: 'manual', inicio: '2026-08-17', aprobados: 8, fin: '2026-11-09', fallidos: 1 },
  { personaId: 'DEMO-L43', programaId: 'DEMO-CUR-01', origen: 'manual', inicio: '2026-09-01', aprobados: 5, fin: '2026-11-04' },
  { personaId: 'DEMO-L44', programaId: 'DEMO-CUR-02', origen: 'manual', inicio: '2026-09-14', aprobados: 3, fin: '2026-11-07', enCurso: { video: true, lectura: true } },
  { personaId: 'DEMO-L45', programaId: 'DEMO-CUR-03', origen: 'manual', inicio: '2026-09-28', aprobados: 2, fin: '2026-11-05' },
  { personaId: 'DEMO-L46', programaId: 'DEMO-CUR-01', origen: 'manual', inicio: '2026-10-12', aprobados: 1, fin: '2026-11-03', enCurso: { video: true } },
  { personaId: 'DEMO-L47', programaId: 'DEMO-CUR-02', origen: 'manual', inicio: '2026-11-02' },
  { personaId: 'DEMO-L18', programaId: 'DEMO-CUR-02', origen: 'manual', inicio: '2025-10-06', vencimiento: '2026-04-06', aprobados: 6, fin: '2026-01-20' },
  { personaId: 'DEMO-L19', programaId: 'DEMO-CUR-03', origen: 'manual', inicio: '2025-11-03', vencimiento: '2026-05-03', aprobados: 'todo', fin: '2026-02-27' },
];

function estadoFormativo(semilla: SemillaMatriculaAmpliada): EstadoFormativo['estado'] {
  if (semilla.aprobados === 'todo') return 'aprobado';
  if ((semilla.aprobados ?? 0) > 0 || semilla.enCurso || semilla.fallidos) return 'cursando';
  return 'matriculado';
}

export const formacionAlumnosAmpliados: EstadoFormativo[] = semillasAlumnosAmpliados.map((semilla, indice) => ({
  id: `DEMO-FOR-${70 + indice}`, personaId: semilla.personaId, programaExterno: programaExternoPorPrograma[semilla.programaId],
  proveedor: 'ERICK S.A.C.', estado: estadoFormativo(semilla), fechaActualizacion: semilla.fin ?? semilla.inicio,
}));

export function eventosMembresiasAmpliadas(): Array<Omit<EventoIntegracion, 'id'>> {
  return membresiasAmpliadas.flatMap((membresia) => {
    const plan = planesMembresiaIniciales.find((item) => item.id === membresia.planId);
    const activada: Omit<EventoIntegracion, 'id'> = {
      tipo: 'membresia_activada', personaId: membresia.personaId, programaId: null, fecha: `${membresia.inicio}T10:15:00`, estado: 'procesado',
      carga: { membresiaId: membresia.id, planId: membresia.planId, vencimiento: membresia.vencimiento }, detalle: `${plan?.nombre ?? membresia.planId} activada`,
    };
    if (membresia.vencimiento >= relativoHoy(0)) return [activada];
    return [activada, {
      tipo: 'acceso_vencido', personaId: membresia.personaId, programaId: null, fecha: `${membresia.vencimiento}T23:59:00`, estado: 'procesado',
      carga: { membresiaId: membresia.id, vencimiento: membresia.vencimiento }, detalle: 'Membresía vencida; notas y certificados se conservan',
    }];
  });
}
