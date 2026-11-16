import type {
  DocumentoAcademico, EventoIntegracion, IntentoEvaluacion, Matricula, Membresia, OrigenMatricula, ProgresoComponente,
  Respuesta, SustentacionMid, TipoEventoLms,
} from '../../tipos/academico';
import { calificarIntento, hashTexto, respuestaCorrecta, respuestaIncorrecta, seleccionarPreguntas } from '../../motores/academico/calificacion';
import { anularDocumento, emitirDocumento } from '../../motores/academico/certificacion';
import { construirRuta } from '../../motores/academico/desbloqueo';
import { claveProgreso, resumirPrograma } from '../../motores/academico/progreso';
import { modulosIniciales } from './contenidos';
import { relativoHoy, sumarDias, sumarMeses } from './fechasCampus';
import { preguntasIniciales } from './preguntas';
import { programasIniciales } from './programas';
import { generarMidInicial, semillasAlumnosCampus } from './alumnosCampus';
import { eventosMembresiasAmpliadas, membresiasAmpliadas, semillasAlumnosAmpliados } from './alumnosAmpliados';

interface SemillaMatricula {
  personaId: string; programaId: string; origen: OrigenMatricula; pedidoId?: string; membresiaId?: string;
  inicio: string; vencimiento?: string; aprobados?: number | 'todo'; fin?: string;
  enCurso?: Partial<ProgresoComponente>; fallidos?: number;
}

const membresia: Membresia = {
  id: 'DEMO-MEM-01', personaId: 'DEMO-L04', planId: 'DEMO-PLAN-03', pedidoIds: [],
  inicio: relativoHoy(-85), vencimiento: relativoHoy(5), suspendida: false,
};

const semillas: SemillaMatricula[] = [
  { personaId: 'DEMO-A01', programaId: 'DEMO-CUR-01', origen: 'compra', pedidoId: 'DEMO-P21', inicio: '2026-10-25', aprobados: 17, fin: '2026-11-12' },
  { personaId: 'DEMO-A03', programaId: 'DEMO-CUR-01', origen: 'manual', inicio: '2026-07-01', aprobados: 'todo', fin: '2026-09-30' },
  { personaId: 'DEMO-A04', programaId: 'DEMO-CUR-03', origen: 'compra', pedidoId: 'DEMO-P07', inicio: '2026-10-20' },
  { personaId: 'DEMO-A16', programaId: 'DEMO-CUR-02', origen: 'manual', inicio: '2026-05-18', aprobados: 'todo', fin: '2026-08-30' },
  { personaId: 'DEMO-A16', programaId: 'DEMO-CUR-01', origen: 'compra', pedidoId: 'DEMO-P121', inicio: '2026-10-28', aprobados: 'todo', fin: '2026-11-11' },
  { personaId: 'DEMO-A17', programaId: 'DEMO-CUR-01', origen: 'manual', inicio: '2026-04-06', aprobados: 'todo', fin: '2026-07-14' },
  { personaId: 'DEMO-A18', programaId: 'DEMO-CUR-01', origen: 'manual', inicio: '2026-09-14', aprobados: 8, fin: '2026-10-21', enCurso: { video: true } },
  { personaId: 'DEMO-A19', programaId: 'DEMO-CUR-03', origen: 'manual', inicio: '2026-06-08', aprobados: 'todo', fin: '2026-09-08' },
  { personaId: 'DEMO-A24', programaId: 'DEMO-CUR-03', origen: 'compra', pedidoId: 'DEMO-P137', inicio: '2026-10-31' },
  { personaId: 'DEMO-A26', programaId: 'DEMO-CUR-01', origen: 'compra', pedidoId: 'DEMO-P111', inicio: '2026-10-25', aprobados: 4, fin: '2026-11-08', fallidos: 3 },
  { personaId: 'DEMO-L01', programaId: 'DEMO-CUR-01', origen: 'compra', pedidoId: 'DEMO-P01', inicio: '2026-11-04', aprobados: 1, fin: '2026-11-06' },
  { personaId: 'DEMO-L02', programaId: 'DEMO-CUR-01', origen: 'manual', inicio: '2026-06-15', aprobados: 'todo', fin: '2026-09-27' },
  { personaId: 'DEMO-L03', programaId: 'DEMO-DIP-01', origen: 'manual', inicio: '2026-05-04', aprobados: 'todo', fin: '2026-10-25' },
  { personaId: 'DEMO-L03', programaId: 'DEMO-CUR-03', origen: 'manual', inicio: '2026-10-05', aprobados: 6, fin: '2026-11-07', enCurso: { video: true, lectura: true } },
  { personaId: 'DEMO-L04', programaId: 'DEMO-CUR-02', origen: 'membresia', membresiaId: membresia.id, inicio: membresia.inicio, vencimiento: membresia.vencimiento, aprobados: 'todo', fin: relativoHoy(-20) },
  { personaId: 'DEMO-L04', programaId: 'DEMO-CUR-03', origen: 'compra', pedidoId: 'DEMO-P79', inicio: '2026-10-19', aprobados: 3, fin: '2026-11-06', fallidos: 1 },
  { personaId: 'DEMO-L04', programaId: 'DEMO-CUR-01', origen: 'compra', pedidoId: 'DEMO-P185', inicio: '2026-11-09' },
  { personaId: 'DEMO-L05', programaId: 'DEMO-CUR-03', origen: 'manual', inicio: '2026-03-02', aprobados: 'todo', fin: '2026-06-15' },
  { personaId: 'DEMO-L05', programaId: 'DEMO-CUR-01', origen: 'compra', pedidoId: 'DEMO-P155', inicio: '2026-11-03' },
  { personaId: 'DEMO-L05', programaId: 'DEMO-CUR-02', origen: 'manual', inicio: '2026-11-04' },
  { personaId: 'DEMO-L06', programaId: 'DEMO-CUR-03', origen: 'manual', inicio: '2026-09-01', aprobados: 17, fin: '2026-11-10' },
  { personaId: 'DEMO-L06', programaId: 'DEMO-CUR-02', origen: 'compra', pedidoId: 'DEMO-P130', inicio: '2026-10-29' },
  { personaId: 'DEMO-L07', programaId: 'DEMO-CUR-01', origen: 'manual', inicio: '2026-11-08' },
  { personaId: 'DEMO-L07', programaId: 'DEMO-CUR-02', origen: 'compra', pedidoId: 'DEMO-P196', inicio: '2026-11-10' },
];
semillas.push(...semillasAlumnosCampus);
semillas.push(...semillasAlumnosAmpliados);

const motivosOrigen: Record<OrigenMatricula, string> = {
  compra: 'Matrícula automática por pago confirmado',
  membresia: 'Matrícula incluida en la membresía vigente',
  manual: 'Matrícula registrada por el área académica',
};

function horaIso(fecha: string, minutos: number): string {
  const total = 9 * 60 + (minutos % 540);
  return `${fecha}T${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}:00`;
}

function construirMatricula(semilla: SemillaMatricula, indice: number): Matricula {
  const programa = programasIniciales.find((item) => item.id === semilla.programaId);
  const vencimiento = semilla.vencimiento ?? sumarMeses(semilla.inicio, programa?.reglas.mesesAcceso ?? 6);
  return {
    id: `DEMO-MAT-${String(indice + 1).padStart(2, '0')}`, personaId: semilla.personaId, programaId: semilla.programaId,
    origen: semilla.origen, pedidoId: semilla.pedidoId ?? null, membresiaId: semilla.membresiaId ?? null,
    inicio: semilla.inicio, vencimiento, suspendida: false, intentosExtra: {},
    historial: [{
      fecha: horaIso(semilla.inicio, 30), actorId: semilla.origen === 'manual' ? 'DEMO-U02' : semilla.personaId,
      accion: 'Matrícula creada', motivo: semilla.pedidoId ? `${motivosOrigen[semilla.origen]} (${semilla.pedidoId})` : motivosOrigen[semilla.origen],
    }],
  };
}

function respuestasPara(preguntaIds: string[], aciertos: number): Record<string, Respuesta> {
  return Object.fromEntries(preguntaIds.map((id, indice) => {
    const pregunta = preguntasIniciales.find((item) => item.id === id);
    if (!pregunta) return [id, null];
    return [id, indice < aciertos ? respuestaCorrecta(pregunta) : respuestaIncorrecta(pregunta)];
  }));
}

function crearIntento(personaId: string, matriculaId: string, ambito: 'tema' | 'tim', ambitoId: string, numero: number, aciertosDeseados: number, fin: string): Omit<IntentoEvaluacion, 'id'> {
  const banco = preguntasIniciales.filter((pregunta) => pregunta.ambitoId === ambitoId);
  const cantidad = ambito === 'tim' ? banco.length : 5;
  const preguntas = seleccionarPreguntas(banco, cantidad, `${personaId}|${ambitoId}|${numero}`);
  const preguntaIds = preguntas.map((pregunta) => pregunta.id);
  const respuestas = respuestasPara(preguntaIds, Math.min(aciertosDeseados, preguntaIds.length));
  const calificacion = calificarIntento(preguntas, respuestas);
  const inicio = new Date(new Date(`${fin}Z`).getTime() - (ambito === 'tim' ? 50 : 22) * 60000).toISOString().slice(0, 19);
  return { personaId, ambito, ambitoId, matriculaId, preguntaIds, respuestas, nota: calificacion.nota, aprobado: calificacion.aprobado, inicio, fin };
}

function generarAvance(semillasLista: SemillaMatricula[], matriculas: Matricula[]) {
  const progreso: Record<string, ProgresoComponente> = {};
  const intentos: Array<Omit<IntentoEvaluacion, 'id'>> = [];
  semillasLista.forEach((semilla, indice) => {
    const matricula = matriculas[indice];
    const ruta = construirRuta(semilla.programaId, programasIniciales, modulosIniciales);
    const cantidad = semilla.aprobados === 'todo' ? ruta.length : semilla.aprobados ?? 0;
    const fin = semilla.fin ?? semilla.inicio;
    const dias = Math.max(1, Math.round((new Date(fin).getTime() - new Date(semilla.inicio).getTime()) / 86400000));
    ruta.slice(0, cantidad).forEach((elemento, posicion) => {
      const fecha = posicion === cantidad - 1 ? fin : sumarDias(semilla.inicio, Math.max(1, Math.round(((posicion + 1) * dias) / cantidad)));
      const hash = hashTexto(`${semilla.personaId}|${elemento.id}`);
      const numero = intentos.filter((intento) => intento.personaId === semilla.personaId && intento.ambitoId === elemento.id).length;
      if (elemento.tipo === 'tema') progreso[claveProgreso(semilla.personaId, elemento.id)] = { video: true, lectura: true, caso: true };
      if (hash % 5 === 0) intentos.push(crearIntento(semilla.personaId, matricula.id, elemento.tipo, elemento.id, numero + 1, elemento.tipo === 'tim' ? 5 : 3, horaIso(fecha, posicion * 7)));
      const aciertos = elemento.tipo === 'tim' ? 6 + (hash % 3) : 4 + (hash % 2);
      intentos.push(crearIntento(semilla.personaId, matricula.id, elemento.tipo, elemento.id, numero + 2, aciertos, horaIso(fecha, posicion * 7 + 90)));
    });
    const siguiente = ruta[cantidad];
    if (!siguiente) return;
    if (semilla.enCurso && siguiente.tipo === 'tema') {
      progreso[claveProgreso(semilla.personaId, siguiente.id)] = { video: false, lectura: false, caso: false, ...semilla.enCurso };
    }
    if (semilla.fallidos) {
      if (siguiente.tipo === 'tema') progreso[claveProgreso(semilla.personaId, siguiente.id)] = { video: true, lectura: true, caso: true };
      for (let numero = 0; numero < semilla.fallidos; numero += 1) {
        intentos.push(crearIntento(semilla.personaId, matricula.id, siguiente.tipo, siguiente.id, numero + 1, (siguiente.tipo === 'tim' ? 5 : 3) - (numero === 1 ? 1 : 0), horaIso(fin, 300 + numero * 45)));
      }
    }
  });
  const ordenados = intentos
    .sort((a, b) => a.fin.localeCompare(b.fin))
    .map((intento, indice): IntentoEvaluacion => ({ ...intento, id: `DEMO-INT-${String(indice + 1).padStart(4, '0')}` }));
  return { progreso, intentos: ordenados };
}

function generarDocumentos(semillasLista: SemillaMatricula[], matriculas: Matricula[], progreso: Record<string, ProgresoComponente>, intentos: IntentoEvaluacion[]): DocumentoAcademico[] {
  const estructura = { programas: programasIniciales, modulos: modulosIniciales };
  const registro = { matriculas, progreso, intentos };
  const pendientes: Array<Parameters<typeof emitirDocumento>[1]> = [];
  semillasLista.forEach((semilla) => {
    const resumen = resumirPrograma(semilla.personaId, semilla.programaId, estructura, registro);
    if (!resumen) return;
    resumen.cursos.forEach((curso) => {
      if (curso.nota.estado !== 'aprobado' || curso.nota.nota === null) return;
      const resumenCurso = resumirPrograma(semilla.personaId, curso.programa.id, estructura, registro);
      const fecha = (resumenCurso?.fechaCulminacion ?? `${semilla.fin}T12:00:00`).slice(0, 10);
      pendientes.push({
        tipo: 'certificado', personaId: semilla.personaId, programaId: curso.programa.id, nota: curso.nota.nota,
        horas: curso.programa.horas, fechaCulminacion: fecha, fechaEmision: resumenCurso?.fechaCulminacion ?? `${fecha}T12:00:00`,
        detalle: curso.modulos.map((modulo) => ({ nombre: modulo.modulo.nombre, horas: modulo.modulo.horas, nota: modulo.nota.nota ?? 0 })),
      });
    });
    if (resumen.programa.tipo === 'diplomado' && resumen.nota.estado === 'aprobado' && resumen.nota.nota !== null && resumen.fechaCulminacion) {
      pendientes.push({
        tipo: 'diploma', personaId: semilla.personaId, programaId: semilla.programaId, nota: resumen.nota.nota, horas: resumen.programa.horas,
        fechaCulminacion: resumen.fechaCulminacion.slice(0, 10), fechaEmision: resumen.fechaCulminacion,
        detalle: resumen.cursos.flatMap((curso) => curso.modulos.map((modulo) => ({ nombre: modulo.modulo.nombre, horas: modulo.modulo.horas, nota: modulo.nota.nota ?? 0 }))),
      });
    }
  });
  const fechaReemision = '2026-10-03T11:30:00';
  const motivo = 'Nombre del estudiante registrado con un error tipográfico; se reemite el certificado corregido.';
  let documentos: DocumentoAcademico[] = [];
  let reemitido = false;
  const reemitirCertificadoL02 = () => {
    const original = documentos.find((documento) => documento.personaId === 'DEMO-L02' && documento.tipo === 'certificado');
    if (!original) return;
    reemitido = true;
    const sinOriginal = documentos.map((documento) => (documento.id === original.id ? anularDocumento(documento, motivo) : documento));
    const { documento: nuevo } = emitirDocumento(sinOriginal, {
      tipo: original.tipo, personaId: original.personaId, programaId: original.programaId, nota: original.nota, horas: original.horas,
      fechaCulminacion: original.fechaCulminacion, fechaEmision: fechaReemision, detalle: original.detalle,
    }, original.id);
    documentos = [...sinOriginal.map((documento) => (documento.id === original.id ? { ...documento, reemplazadoPor: nuevo.id } : documento)), nuevo];
  };
  pendientes
    .sort((a, b) => a.fechaEmision.localeCompare(b.fechaEmision) || a.tipo.localeCompare(b.tipo))
    .forEach((datos) => {
      if (!reemitido && datos.fechaEmision > fechaReemision) reemitirCertificadoL02();
      const { documento, nuevo } = emitirDocumento(documentos, datos);
      if (nuevo) documentos = [...documentos, documento];
    });
  if (!reemitido) reemitirCertificadoL02();
  return documentos;
}

function generarEventos(matriculas: Matricula[], documentos: DocumentoAcademico[], intentos: IntentoEvaluacion[]): EventoIntegracion[] {
  const eventos: Array<Omit<EventoIntegracion, 'id'>> = [];
  const agregar = (tipo: TipoEventoLms, personaId: string, programaId: string | null, fecha: string, carga: EventoIntegracion['carga'], detalle: string, estado: EventoIntegracion['estado'] = 'procesado') => {
    eventos.push({ tipo, personaId, programaId, fecha, carga, estado, detalle });
  };
  matriculas.forEach((matricula) => {
    agregar('matricula_creada', matricula.personaId, matricula.programaId, matricula.historial[0]?.fecha ?? `${matricula.inicio}T09:30:00`,
      { matriculaId: matricula.id, origen: matricula.origen, pedidoId: matricula.pedidoId, vencimiento: matricula.vencimiento },
      `Matrícula ${matricula.id} registrada en el campus`);
    if (matricula.vencimiento < relativoHoy(0)) {
      agregar('acceso_vencido', matricula.personaId, matricula.programaId, `${sumarDias(matricula.vencimiento, 1)}T00:05:00`,
        { matriculaId: matricula.id, vencimiento: matricula.vencimiento }, 'Acceso vencido; notas y certificados se conservan');
    }
    const propios = intentos.filter((intento) => intento.matriculaId === matricula.id);
    const ultimo = propios[propios.length - 1];
    if (ultimo) {
      const aprobados = new Set(propios.filter((intento) => intento.aprobado).map((intento) => intento.ambitoId)).size;
      const conError = matricula.personaId === 'DEMO-A18';
      agregar('avance_actualizado', matricula.personaId, matricula.programaId, ultimo.fin,
        { matriculaId: matricula.id, elementosAprobados: aprobados }, conError ? 'Tiempo de espera agotado en el sistema receptor; pendiente de reintento' : `Avance sincronizado: ${aprobados} elementos aprobados`,
        conError ? 'error' : 'procesado');
    }
  });
  documentos.forEach((documento) => {
    const tipo: TipoEventoLms = documento.tipo === 'diploma' ? 'diploma_emitido' : 'curso_aprobado';
    agregar(tipo, documento.personaId, documento.programaId, documento.fechaEmision,
      { documento: documento.codigo, nota: documento.nota, horas: documento.horas }, `${documento.tipo === 'diploma' ? 'Diploma' : 'Certificado'} ${documento.codigo} emitido`);
    if (documento.estado === 'anulado') {
      agregar('certificado_anulado', documento.personaId, documento.programaId, '2026-10-03T11:25:00',
        { documento: documento.codigo, reemplazadoPor: documento.reemplazadoPor }, documento.motivoAnulacion ?? 'Documento anulado');
    }
  });
  return eventos
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .map((evento, indice) => ({ ...evento, id: `DEMO-EVL-${String(indice + 1).padStart(3, '0')}` }));
}

export const matriculasIniciales: Matricula[] = semillas.map(construirMatricula);
export const membresiasIniciales: Membresia[] = [membresia];
const avanceInicial = generarAvance(semillas, matriculasIniciales);
export const progresoInicial: Record<string, ProgresoComponente> = avanceInicial.progreso;
export const intentosIniciales: IntentoEvaluacion[] = avanceInicial.intentos;
export const documentosIniciales: DocumentoAcademico[] = generarDocumentos(semillas, matriculasIniciales, progresoInicial, intentosIniciales);
export const sustentacionesIniciales: SustentacionMid[] = [];
export const eventosIniciales: EventoIntegracion[] = generarEventos(matriculasIniciales, documentosIniciales, intentosIniciales);
const midInicial = generarMidInicial(documentosIniciales);
documentosIniciales.push(...midInicial.constancias);
sustentacionesIniciales.push(...midInicial.sustentaciones);
eventosIniciales.push(...midInicial.eventos.map((evento, indice) => ({ ...evento, id: `DEMO-EVL-${String(eventosIniciales.length + indice + 1).padStart(3, '0')}` })));
membresiasIniciales.push(...membresiasAmpliadas);
eventosIniciales.push(...eventosMembresiasAmpliadas().map((evento, indice) => ({ ...evento, id: `DEMO-EVL-${String(eventosIniciales.length + indice + 1).padStart(3, '0')}` })));
