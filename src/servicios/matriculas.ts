import { relativoHoy, sumarMeses } from '../datos/academico/fechasCampus';
import { estadoMatricula, estadoMembresia, esVigente } from '../motores/academico/accesos';
import { useAcademicoStore } from '../store/useAcademicoStore';
import { useCampusStore } from '../store/useCampusStore';
import { usePersonasStore } from '../store/usePersonasStore';
import type { Matricula, Membresia, OrigenMatricula, PlanMembresia, Programa } from '../tipos/academico';
import { exito, fallo, type Resultado } from '../validaciones/resultado';
import { fechaActualLocal, registrarEventoLms } from './eventosLms';
import { notificar, registrarBitacora } from './registro';
import { sincronizarFormacion } from './formacionLms';

export const nombresOrigen: Record<OrigenMatricula, string> = { compra: 'Compra', membresia: 'Membresía', manual: 'Matrícula manual' };

function siguienteId(prefijo: string, ids: string[]): string {
  const numeros = ids.map((id) => Number(id.replace(prefijo, ''))).filter((numero) => !Number.isNaN(numero));
  return `${prefijo}${String(Math.max(0, ...numeros) + 1).padStart(2, '0')}`;
}

function baseRenovacion(vencimiento: string, hoy: string): string {
  return vencimiento >= hoy ? vencimiento : hoy;
}

export function programaMatriculable(programa: Programa | undefined): programa is Programa {
  return Boolean(programa && programa.estado === 'publicado' && (programa.tipo === 'curso' || programa.tipo === 'diplomado'));
}

export interface DatosMatricula {
  personaId: string; programaId: string; origen: OrigenMatricula; actorId: string;
  pedidoId?: string | null; membresia?: Membresia | null; motivo?: string; unidades?: number;
}

export interface ResultadoMatricula { matricula: Matricula; renovada: boolean }

export function matricular(datos: DatosMatricula): Resultado<ResultadoMatricula> {
  const programa = useAcademicoStore.getState().programas.find((item) => item.id === datos.programaId);
  if (!programaMatriculable(programa)) return fallo('El programa no existe o no está publicado.');
  if (!usePersonasStore.getState().buscarPorId(datos.personaId)) return fallo('La persona no existe.');
  const { matriculas, actualizar } = useCampusStore.getState();
  const hoy = relativoHoy(0);
  const fecha = fechaActualLocal();
  const meses = programa.reglas.mesesAcceso * Math.max(1, datos.unidades ?? 1);
  const detalleOrigen = datos.pedidoId ? `${nombresOrigen[datos.origen]} ${datos.pedidoId}` : nombresOrigen[datos.origen];
  const existente = datos.origen === 'membresia' ? undefined : matriculas.find((matricula) => matricula.personaId === datos.personaId
    && matricula.programaId === datos.programaId && matricula.origen !== 'membresia');

  if (existente) {
    const vencimiento = sumarMeses(baseRenovacion(existente.vencimiento, hoy), meses);
    const renovada: Matricula = {
      ...existente, vencimiento, suspendida: false,
      historial: [...existente.historial, { fecha, actorId: datos.actorId, accion: 'Renovación de acceso', motivo: datos.motivo ?? `${detalleOrigen}: acceso extendido hasta ${vencimiento}` }],
    };
    actualizar({ matriculas: matriculas.map((matricula) => (matricula.id === existente.id ? renovada : matricula)) });
    registrarEventoLms('matricula_creada', datos.personaId, programa.id, { matriculaId: renovada.id, origen: datos.origen, pedidoId: datos.pedidoId ?? null, vencimiento, renovacion: true }, `Acceso renovado hasta ${vencimiento}`);
    registrarBitacora({ actorId: datos.actorId, accion: 'Renovación de matrícula', modulo: 'matriculas', motivo: datos.motivo, referenciaId: renovada.id, antes: { vencimiento: existente.vencimiento }, despues: { vencimiento } });
    notificar({ personaId: datos.personaId, tipo: 'estado', titulo: 'Acceso renovado', mensaje: `${programa.nombre}: tu acceso en Campus ERICK se extendió hasta el ${vencimiento}.` });
    sincronizarFormacion(datos.personaId);
    return exito({ matricula: renovada, renovada: true });
  }

  const membresia = datos.membresia ?? null;
  const matricula: Matricula = {
    id: siguienteId('DEMO-MAT-', matriculas.map((item) => item.id)), personaId: datos.personaId, programaId: programa.id,
    origen: datos.origen, pedidoId: datos.pedidoId ?? null, membresiaId: membresia?.id ?? null,
    inicio: hoy, vencimiento: membresia ? membresia.vencimiento : sumarMeses(hoy, meses), suspendida: false, intentosExtra: {},
    historial: [{ fecha, actorId: datos.actorId, accion: 'Matrícula creada', motivo: datos.motivo ?? detalleOrigen }],
  };
  actualizar({ matriculas: [...matriculas, matricula] });
  registrarEventoLms('matricula_creada', datos.personaId, programa.id, { matriculaId: matricula.id, origen: datos.origen, pedidoId: matricula.pedidoId, vencimiento: matricula.vencimiento }, `Matrícula ${matricula.id} registrada en el campus`);
  registrarBitacora({ actorId: datos.actorId, accion: 'Matrícula creada', modulo: 'matriculas', motivo: datos.motivo ?? detalleOrigen, referenciaId: matricula.id, despues: { programa: programa.id, origen: datos.origen, vencimiento: matricula.vencimiento } });
  notificar({ personaId: datos.personaId, tipo: 'estado', titulo: 'Matrícula activada', mensaje: `Ya puedes estudiar ${programa.nombre} en Campus ERICK. Acceso hasta el ${matricula.vencimiento}.` });
  sincronizarFormacion(datos.personaId);
  return exito({ matricula, renovada: false });
}

export function matricularManual(personaId: string, programaId: string, actorId: string, motivo: string): Resultado<ResultadoMatricula> {
  if (motivo.trim().length < 10) return fallo('El motivo de la matrícula manual debe tener al menos 10 caracteres.');
  return matricular({ personaId, programaId, origen: 'manual', actorId, motivo: motivo.trim() });
}

function sincronizarMatriculasDeMembresia(membresia: Membresia, matriculas: Matricula[]): Matricula[] {
  return matriculas.map((matricula) => (matricula.membresiaId === membresia.id
    ? { ...matricula, vencimiento: membresia.vencimiento, suspendida: membresia.suspendida }
    : matricula));
}

export function membresiaDePersona(personaId: string, membresias: Membresia[]): Membresia | null {
  return [...membresias].filter((membresia) => membresia.personaId === personaId).sort((a, b) => b.vencimiento.localeCompare(a.vencimiento))[0] ?? null;
}

export function activarMembresia(personaId: string, plan: PlanMembresia, pedidoId: string | null, actorId: string, unidades = 1): Resultado<{ membresia: Membresia; renovada: boolean }> {
  if (!plan.activo) return fallo('El plan de membresía no está activo.');
  const { membresias, matriculas, actualizar } = useCampusStore.getState();
  const hoy = relativoHoy(0);
  const meses = plan.meses * Math.max(1, unidades);
  const actual = membresiaDePersona(personaId, membresias);
  if (actual) {
    const vencimiento = sumarMeses(baseRenovacion(actual.vencimiento, hoy), meses);
    const renovada: Membresia = {
      ...actual, planId: plan.id, vencimiento, suspendida: false,
      inicio: actual.vencimiento < hoy ? hoy : actual.inicio,
      pedidoIds: pedidoId ? [...actual.pedidoIds, pedidoId] : actual.pedidoIds,
    };
    actualizar({
      membresias: membresias.map((membresia) => (membresia.id === actual.id ? renovada : membresia)),
      matriculas: sincronizarMatriculasDeMembresia(renovada, matriculas),
    });
    registrarEventoLms('membresia_activada', personaId, null, { membresiaId: renovada.id, planId: plan.id, pedidoId, vencimiento, renovacion: true }, `${plan.nombre}: renovación hasta ${vencimiento}`);
    registrarBitacora({ actorId, accion: 'Renovación de membresía', modulo: 'matriculas', referenciaId: renovada.id, antes: { vencimiento: actual.vencimiento }, despues: { vencimiento, plan: plan.id } });
    notificar({ personaId, tipo: 'estado', titulo: 'Membresía renovada', mensaje: `${plan.nombre}: tu membresía de Campus ERICK vence ahora el ${vencimiento}.` });
    return exito({ membresia: renovada, renovada: true });
  }
  const membresia: Membresia = {
    id: siguienteId('DEMO-MEM-', membresias.map((item) => item.id)), personaId, planId: plan.id, pedidoIds: pedidoId ? [pedidoId] : [],
    inicio: hoy, vencimiento: sumarMeses(hoy, meses), suspendida: false,
  };
  actualizar({ membresias: [...membresias, membresia] });
  registrarEventoLms('membresia_activada', personaId, null, { membresiaId: membresia.id, planId: plan.id, pedidoId, vencimiento: membresia.vencimiento }, `${plan.nombre} activada`);
  registrarBitacora({ actorId, accion: 'Membresía activada', modulo: 'matriculas', referenciaId: membresia.id, despues: { plan: plan.id, vencimiento: membresia.vencimiento } });
  notificar({ personaId, tipo: 'estado', titulo: 'Membresía activada', mensaje: `${plan.nombre}: accedes a todos los programas incluidos hasta el ${membresia.vencimiento}.` });
  return exito({ membresia, renovada: false });
}

export function inscribirConMembresia(personaId: string, programaId: string, actorId: string): Resultado<ResultadoMatricula> {
  const programa = useAcademicoStore.getState().programas.find((item) => item.id === programaId);
  if (!programaMatriculable(programa) || !programa.incluidoEnMembresia) return fallo('Este programa no está incluido en la membresía.');
  const { membresias, matriculas } = useCampusStore.getState();
  const membresia = membresiaDePersona(personaId, membresias);
  const hoy = relativoHoy(0);
  if (!membresia || !esVigente(estadoMembresia(membresia, hoy))) return fallo('No tienes una membresía vigente.');
  const yaInscrito = matriculas.some((matricula) => matricula.personaId === personaId && matricula.programaId === programaId && esVigente(estadoMatricula(matricula, hoy)));
  if (yaInscrito) return fallo('Ya tienes acceso vigente a este programa.');
  return matricular({ personaId, programaId, origen: 'membresia', membresia, actorId, motivo: `Inscripción con la membresía ${membresia.id}` });
}

export function cambiarSuspension(matriculaId: string, suspender: boolean, actorId: string, motivo: string): Resultado<Matricula> {
  if (motivo.trim().length < 10) return fallo('El motivo debe tener al menos 10 caracteres.');
  const { matriculas, actualizar } = useCampusStore.getState();
  const matricula = matriculas.find((item) => item.id === matriculaId);
  if (!matricula) return fallo('Matrícula no encontrada.');
  if (matricula.suspendida === suspender) return fallo(suspender ? 'La matrícula ya está suspendida.' : 'La matrícula no está suspendida.');
  const actualizada: Matricula = {
    ...matricula, suspendida: suspender,
    historial: [...matricula.historial, { fecha: fechaActualLocal(), actorId, accion: suspender ? 'Acceso suspendido' : 'Acceso reactivado', motivo: motivo.trim() }],
  };
  actualizar({ matriculas: matriculas.map((item) => (item.id === matriculaId ? actualizada : item)) });
  if (suspender) registrarEventoLms('acceso_suspendido', matricula.personaId, matricula.programaId, { matriculaId, motivo: motivo.trim() }, 'Acceso suspendido; notas y certificados se conservan');
  registrarBitacora({ actorId, accion: suspender ? 'Suspensión de matrícula' : 'Reactivación de matrícula', modulo: 'matriculas', motivo: motivo.trim(), referenciaId: matriculaId, antes: { suspendida: matricula.suspendida }, despues: { suspendida: suspender } });
  return exito(actualizada);
}

export function revisarVencimientos(personaId: string, fecha = relativoHoy(0)): number {
  const { matriculas, membresias, avisos, eventos, actualizar } = useCampusStore.getState();
  const programas = useAcademicoStore.getState().programas;
  const nuevos: string[] = [];
  const revisar = (id: string, nombre: string, vencimiento: string, estado: ReturnType<typeof estadoMatricula>, programaId: string | null, esMembresia: boolean) => {
    const clave = `${id}|${estado}|${vencimiento}`;
    if (avisos.includes(clave) || nuevos.includes(clave)) return;
    if (estado === 'por_vencer') {
      nuevos.push(clave);
      notificar({ personaId, tipo: 'estado', titulo: 'Tu acceso está por vencer', mensaje: `${nombre} vence el ${vencimiento}. Renueva para no perder el acceso a los contenidos.` });
    }
    if (estado === 'vencida') {
      nuevos.push(clave);
      const registrado = eventos.some((evento) => evento.tipo === 'acceso_vencido' && evento.carga[esMembresia ? 'membresiaId' : 'matriculaId'] === id && evento.carga.vencimiento === vencimiento);
      if (!registrado) {
        registrarEventoLms('acceso_vencido', personaId, programaId, { [esMembresia ? 'membresiaId' : 'matriculaId']: id, vencimiento }, 'Acceso vencido; notas y certificados se conservan');
        notificar({ personaId, tipo: 'estado', titulo: 'Acceso vencido', mensaje: `${nombre} venció el ${vencimiento}. Tus notas y certificados siguen disponibles.` });
      }
    }
  };
  matriculas.filter((matricula) => matricula.personaId === personaId && matricula.origen !== 'membresia').forEach((matricula) => {
    const programa = programas.find((item) => item.id === matricula.programaId);
    revisar(matricula.id, programa?.nombre ?? matricula.programaId, matricula.vencimiento, estadoMatricula(matricula, fecha), matricula.programaId, false);
  });
  membresias.filter((membresia) => membresia.personaId === personaId).forEach((membresia) => {
    revisar(membresia.id, 'Tu membresía ERICK', membresia.vencimiento, estadoMembresia(membresia, fecha), null, true);
  });
  if (nuevos.length > 0) actualizar({ avisos: [...useCampusStore.getState().avisos, ...nuevos] });
  return nuevos.length;
}

export const mesesExtension = [1, 2, 3, 6, 9, 12] as const;

export function extenderAcceso(matriculaId: string, meses: number, actorId: string, motivo: string): Resultado<Matricula> {
  if (motivo.trim().length < 10) return fallo('El motivo debe tener al menos 10 caracteres.');
  if (!(mesesExtension as readonly number[]).includes(meses)) return fallo('La extensión debe ser de 1, 2, 3, 6, 9 o 12 meses.');
  const { matriculas, actualizar } = useCampusStore.getState();
  const matricula = matriculas.find((item) => item.id === matriculaId);
  if (!matricula) return fallo('Matrícula no encontrada.');
  if (matricula.origen === 'membresia') return fallo('Esta matrícula depende de la membresía: extiende o renueva la membresía.');
  if (matricula.suspendida) return fallo('La matrícula está suspendida: reactívala antes de extender el acceso.');
  const programa = useAcademicoStore.getState().programas.find((item) => item.id === matricula.programaId);
  const vencimiento = sumarMeses(baseRenovacion(matricula.vencimiento, relativoHoy(0)), meses);
  const actualizada: Matricula = {
    ...matricula, vencimiento,
    historial: [...matricula.historial, { fecha: fechaActualLocal(), actorId, accion: `Acceso extendido ${meses} ${meses === 1 ? 'mes' : 'meses'}`, motivo: motivo.trim() }],
  };
  actualizar({ matriculas: matriculas.map((item) => (item.id === matriculaId ? actualizada : item)) });
  registrarEventoLms('matricula_creada', matricula.personaId, matricula.programaId, { matriculaId, origen: 'manual', pedidoId: null, vencimiento, renovacion: true }, `Acceso extendido hasta ${vencimiento}`);
  registrarBitacora({ actorId, accion: 'Extensión de acceso', modulo: 'matriculas', motivo: motivo.trim(), referenciaId: matriculaId, antes: { vencimiento: matricula.vencimiento }, despues: { vencimiento } });
  notificar({ personaId: matricula.personaId, tipo: 'estado', titulo: 'Acceso extendido', mensaje: `${programa?.nombre ?? matricula.programaId}: tu acceso en Campus ERICK se extendió hasta el ${vencimiento}.` });
  sincronizarFormacion(matricula.personaId);
  return exito(actualizada);
}
