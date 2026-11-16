import type { AsignacionDocente, ConfiguracionErick, EventoCalendario, ObservacionDocente, TipoEventoCalendario } from '../../tipos/academico';
import type { Bitacora } from '../../tipos/bitacora';
import { relativoHoy } from './fechasCampus';

type FilaAsignacion = [docenteId: string, programaId: string, desde: string, activa: boolean];

const filasAsignaciones: FilaAsignacion[] = [
  ['DEMO-U03', 'DEMO-DIP-01', '2026-03-02', true],
  ['DEMO-U03', 'DEMO-CUR-01', '2026-03-02', true],
  ['DEMO-U03', 'DEMO-CUR-02', '2026-03-02', true],
  ['DEMO-U03', 'DEMO-MID-01', '2026-03-02', true],
  ['DEMO-U05', 'DEMO-CUR-03', '2026-04-13', true],
  ['DEMO-U06', 'DEMO-CUR-01', '2026-05-04', true],
  ['DEMO-U06', 'DEMO-CUR-03', '2026-05-04', false],
  ['DEMO-U07', 'DEMO-MID-01', '2026-06-15', true],
  ['DEMO-U07', 'DEMO-CUR-02', '2026-06-15', true],
];

export const asignacionesIniciales: AsignacionDocente[] = filasAsignaciones.map(([docenteId, programaId, desde, activa], indice) => ({
  id: `DEMO-ASD-${String(indice + 1).padStart(2, '0')}`, docenteId, programaId, desde, activa,
}));

type FilaEvento = [programaId: string, tipo: TipoEventoCalendario, titulo: string, descripcion: string, dias: number, horaInicio: string, horaFin: string | null, enlace: string | null, creadoPor: string, cancelado?: boolean];

const filasEventos: FilaEvento[] = [
  ['DEMO-CUR-01', 'clase_en_vivo', 'Clase en vivo: estilos de liderazgo en la práctica', 'Sesión de preguntas y casos reales del módulo 1. Ten a mano tu caso práctico.', 3, '19:00', '20:30', 'https://meet.demo.erick/liderazgo-m1', 'DEMO-U03'],
  ['DEMO-CUR-03', 'recordatorio', 'Cierre del módulo 2 de Ventas Digitales', 'Completa los temas y el TIM del módulo 2 antes de esta fecha para mantener el ritmo del grupo.', 6, '23:59', null, null, 'DEMO-U05'],
  ['DEMO-MID-01', 'entrega', 'Entrega del avance del trabajo MID', 'Sube el avance con introducción, objetivos y metodología. Se revisa antes de asignar la fecha de sustentación.', 9, '18:00', null, null, 'DEMO-U03'],
  ['DEMO-CUR-03', 'clase_en_vivo', 'Clase en vivo: embudos de WhatsApp', 'Taller práctico con plantillas de mensajes y métricas de conversión.', 10, '19:30', '21:00', 'https://meet.demo.erick/ventas-whatsapp', 'DEMO-U05'],
  ['DEMO-CUR-01', 'examen_final', 'Examen final del Curso Liderazgo Comercial', 'Evaluación integradora de los tres módulos. Duración 60 minutos, 20 preguntas, aprueba con más de 14.', 13, '10:00', '11:00', null, 'DEMO-U03'],
  ['DEMO-CUR-02', 'clase_en_vivo', 'Clase en vivo: reuniones de equipo efectivas', 'Revisión de agendas reales de reunión semanal y ejercicios de retroalimentación.', 15, '19:00', '20:30', 'https://meet.demo.erick/equipos-reuniones', 'DEMO-U07'],
  ['DEMO-CUR-02', 'examen_final', 'Examen final del Curso Gestión de Equipos y Ventas', 'Evaluación integradora del curso. Se recomienda repasar los TIM de los tres módulos.', 20, '10:00', '11:00', null, 'DEMO-U07'],
  ['DEMO-DIP-01', 'recordatorio', 'Cierre de notas del diplomado', 'Fecha límite para completar ambos cursos y emitir el diploma en este período académico.', 27, '23:59', null, null, 'DEMO-U04'],
  ['DEMO-CUR-03', 'examen_final', 'Examen final del Taller de Ventas Digitales', 'Evaluación práctica: diseño de un embudo y lectura de métricas.', 24, '18:00', '19:00', null, 'DEMO-U05'],
  ['DEMO-CUR-01', 'clase_en_vivo', 'Clase en vivo: confianza y credibilidad', 'Sesión de repaso del módulo 2 con dinámicas de comunicación.', 22, '19:00', '20:00', 'https://meet.demo.erick/liderazgo-m2', 'DEMO-U06'],
  ['DEMO-MID-01', 'recordatorio', 'Ventana de sustentaciones MID', 'Semana reservada para sustentaciones. El área académica confirma fecha y evaluador por correo interno.', 30, '09:00', null, null, 'DEMO-U04'],
  ['DEMO-CUR-01', 'clase_en_vivo', 'Clase en vivo: bienvenida y metodología', 'Presentación del curso, cronograma y uso del campus.', -12, '19:00', '20:00', 'https://meet.demo.erick/liderazgo-bienvenida', 'DEMO-U03'],
  ['DEMO-CUR-03', 'entrega', 'Entrega del caso práctico del módulo 1', 'Caso de prospección en redes sociales.', -5, '23:59', null, null, 'DEMO-U05'],
  ['DEMO-CUR-02', 'clase_en_vivo', 'Clase en vivo: delegación efectiva', 'Se reprograma para la siguiente semana por feriado.', 8, '19:00', '20:00', 'https://meet.demo.erick/equipos-delegacion', 'DEMO-U07', true],
  ['DEMO-DIP-01', 'clase_en_vivo', 'Conversatorio con egresados del diplomado', 'Tres egresados comparten cómo aplicaron el diplomado en sus equipos.', 18, '18:30', '20:00', 'https://meet.demo.erick/egresados', 'DEMO-U04'],
  ['DEMO-CUR-01', 'recordatorio', 'Últimos días para rendir el TIM del módulo 3', 'Quienes tengan el TIM 3 pendiente deben rendirlo antes del examen final.', 11, '23:59', null, null, 'DEMO-U06'],
];

export const eventosCalendarioIniciales: EventoCalendario[] = filasEventos.map(([programaId, tipo, titulo, descripcion, dias, horaInicio, horaFin, enlace, creadoPor, cancelado], indice) => ({
  id: `DEMO-CAL-${String(indice + 1).padStart(2, '0')}`, programaId, tipo, titulo, descripcion, fecha: relativoHoy(dias),
  horaInicio, horaFin, enlace, creadoPor, estado: cancelado ? 'cancelado' : 'programado', actualizado: `${relativoHoy(Math.min(dias, 0) - 2)}T09:00:00`,
}));

type FilaObservacion = [docenteId: string, personaId: string, programaId: string, dias: number, texto: string];

const filasObservaciones: FilaObservacion[] = [
  ['DEMO-U03', 'DEMO-L12', 'DEMO-DIP-01', -6, 'Muy constante; le faltan 6 elementos para terminar el diplomado. Recomendé reservar dos tardes por semana.'],
  ['DEMO-U03', 'DEMO-L13', 'DEMO-DIP-01', -4, 'Buen desempeño en los TIM. Conversamos sobre su tema de MID.'],
  ['DEMO-U03', 'DEMO-L17', 'DEMO-DIP-01', -3, 'Desaprobó el primer intento del tema 3; repasamos la lectura en la tutoría.'],
  ['DEMO-U03', 'DEMO-L16', 'DEMO-DIP-01', -2, 'Inició con buen ritmo. Sugerí completar el caso práctico antes de la evaluación.'],
  ['DEMO-U03', 'DEMO-L37', 'DEMO-CUR-01', -5, 'Dos intentos fallidos en el mismo tema; se evaluará un intento extra si repasa el material.'],
  ['DEMO-U05', 'DEMO-L42', 'DEMO-CUR-03', -3, 'Le cuesta la parte de métricas; le compartí un ejemplo resuelto.'],
  ['DEMO-U05', 'DEMO-L25', 'DEMO-CUR-03', -1, 'Avance sólido; puede adelantar el módulo 3.'],
  ['DEMO-U07', 'DEMO-L29', 'DEMO-CUR-02', -7, 'Participa en todas las clases en vivo. Excelente aporte en el foro.'],
];

export const observacionesIniciales: ObservacionDocente[] = filasObservaciones.map(([docenteId, personaId, programaId, dias, texto], indice) => ({
  id: `DEMO-OBS-${String(indice + 1).padStart(2, '0')}`, docenteId, personaId, programaId, fecha: `${relativoHoy(dias)}T17:30:00`, texto,
}));

export const configuracionErickInicial: ConfiguracionErick = {
  razonSocial: 'ERICK S.A.C. (DEMOSTRACIÓN)',
  ruc: '20999999991',
  direccion: 'Av. Demostración 123, oficina 4, Quito',
  correoContacto: 'academico@erick.demo',
  telefono: '+593 2 000 0000',
  textoCertificado: 'Por haber aprobado satisfactoriamente el programa, cumpliendo los requisitos académicos establecidos por ERICK S.A.C.',
  mesesAccesoPorDefecto: 6,
  intentosPorDefecto: 3,
};

type FilaBitacora = [dias: number, hora: string, actorId: string, accion: string, modulo: string, motivo: string, referenciaId: string | null, antes: unknown, despues: unknown];

const filasBitacora: FilaBitacora[] = [
  [-60, '09:10', 'DEMO-U04', 'Docente asignado a programa', 'docentes', 'Inicio del período académico', 'DEMO-CUR-01', null, { docente: 'DEMO-U06' }],
  [-45, '11:30', 'DEMO-U04', 'Programa publicado', 'academico', 'Estructura validada con horas completas', 'DEMO-CUR-03', 'borrador', 'publicado'],
  [-30, '16:05', 'DEMO-U04', 'Configuración ERICK actualizada', 'configuracion_erick', 'Texto del certificado revisado por dirección académica', null, null, { textoCertificado: 'actualizado' }],
  [-21, '10:00', 'DEMO-U04', 'Asignación de docente retirada', 'docentes', 'Reasignación de carga académica', 'DEMO-CUR-03', { docente: 'DEMO-U06' }, null],
  [-14, '08:45', 'DEMO-U03', 'Fecha agendada en el calendario', 'calendario', 'Clase en vivo: bienvenida y metodología', 'DEMO-CAL-12', null, { programa: 'DEMO-CUR-01' }],
  [-9, '15:20', 'DEMO-U04', 'Matrícula manual registrada', 'matriculas', 'Beca por convenio institucional', 'DEMO-L41', null, { programa: 'DEMO-DIP-01' }],
  [-7, '09:40', 'DEMO-U05', 'Fecha agendada en el calendario', 'calendario', 'Entrega del caso práctico del módulo 1', 'DEMO-CAL-13', null, { programa: 'DEMO-CUR-03' }],
  [-5, '12:10', 'DEMO-U04', 'Intento extra otorgado', 'academico', 'Problema de conexión durante la evaluación', 'DEMO-L26', null, { intentos: 1 }],
  [-4, '17:00', 'DEMO-U03', 'Fecha agendada en el calendario', 'calendario', 'Examen final del Curso Liderazgo Comercial', 'DEMO-CAL-05', null, { programa: 'DEMO-CUR-01' }],
  [-3, '18:15', 'DEMO-U07', 'Fecha cancelada en el calendario', 'calendario', 'Se reprograma por feriado', 'DEMO-CAL-14', 'programado', 'cancelado'],
  [-2, '10:30', 'DEMO-U04', 'Evaluador MID asignado', 'academico', 'Disponibilidad confirmada del docente', 'DEMO-SUS-04', 'solicitado', 'asignado'],
  [-1, '11:00', 'DEMO-U04', 'Membresía asignada', 'matriculas', 'Membresía corporativa de cortesía', 'DEMO-L33', null, { plan: 'DEMO-PLAN-01' }],
];

export const bitacoraErickInicial: Bitacora[] = filasBitacora.map(([dias, hora, actorId, accion, modulo, motivo, referenciaId, antes, despues], indice) => ({
  id: `DEMO-BIT-E${String(indice + 1).padStart(2, '0')}`, fechaHora: `${relativoHoy(dias)}T${hora}:00`, actorId, accion, modulo, motivo, referenciaId, antes, despues,
}));
