import { sumarMeses } from '../datos/academico/fechasCampus';
import { useAcademicoStore } from '../store/useAcademicoStore';
import { useCampusStore } from '../store/useCampusStore';
import type { Matricula, Membresia } from '../tipos/academico';
import type { Pedido } from '../tipos/pedidos';
import { fechaActualLocal, registrarEventoLms } from './eventosLms';
import { activarMembresia, matricular } from './matriculas';
import { notificar, registrarBitacora } from './registro';

export { registrarEventoLms as emitirEvento } from './eventosLms';

export interface ResultadoConector { matriculas: string[]; membresias: string[]; errores: string[] }

export function productoAcademico(productoId: string): { tipo: 'programa'; id: string } | { tipo: 'membresia'; id: string } | null {
  const { programas, planes } = useAcademicoStore.getState();
  const programa = programas.find((item) => item.productoId === productoId && (item.tipo === 'curso' || item.tipo === 'diplomado'));
  if (programa) return { tipo: 'programa', id: programa.id };
  const plan = planes.find((item) => item.productoId === productoId);
  if (plan) return { tipo: 'membresia', id: plan.id };
  return null;
}

export function alConfirmarPedido(pedido: Pedido, actorId: string): ResultadoConector {
  const resultado: ResultadoConector = { matriculas: [], membresias: [], errores: [] };
  if (pedido.estado !== 'confirmada') return resultado;
  const planes = useAcademicoStore.getState().planes;
  pedido.items.forEach((item) => {
    const vinculo = productoAcademico(item.productoId);
    if (!vinculo) return;
    if (vinculo.tipo === 'programa') {
      const creada = matricular({ personaId: pedido.compradorId, programaId: vinculo.id, origen: 'compra', pedidoId: pedido.id, actorId, unidades: item.cantidad });
      if (creada.ok) resultado.matriculas.push(creada.valor.matricula.id);
      else resultado.errores.push(creada.error);
      return;
    }
    const plan = planes.find((candidato) => candidato.id === vinculo.id);
    if (!plan) return;
    const activada = activarMembresia(pedido.compradorId, plan, pedido.id, actorId, item.cantidad);
    if (activada.ok) resultado.membresias.push(activada.valor.membresia.id);
    else resultado.errores.push(activada.error);
  });
  return resultado;
}

export function alDevolverPedido(pedido: Pedido, actorId: string, motivo: string): ResultadoConector {
  const resultado: ResultadoConector = { matriculas: [], membresias: [], errores: [] };
  const { matriculas, membresias, actualizar } = useCampusStore.getState();
  const planes = useAcademicoStore.getState().planes;
  const fecha = fechaActualLocal();
  let nuevasMembresias: Membresia[] = membresias;

  membresias.filter((membresia) => membresia.pedidoIds.includes(pedido.id)).forEach((membresia) => {
    const meses = pedido.items.reduce((suma, item) => {
      const plan = planes.find((candidato) => candidato.productoId === item.productoId);
      return suma + (plan ? plan.meses * item.cantidad : 0);
    }, 0);
    const restantes = membresia.pedidoIds.filter((id) => id !== pedido.id);
    const actualizada: Membresia = restantes.length > 0
      ? { ...membresia, pedidoIds: restantes, vencimiento: sumarMeses(membresia.vencimiento, -meses) }
      : { ...membresia, pedidoIds: restantes, suspendida: true };
    nuevasMembresias = nuevasMembresias.map((item) => (item.id === membresia.id ? actualizada : item));
    resultado.membresias.push(membresia.id);
    registrarEventoLms('acceso_suspendido', pedido.compradorId, null, { membresiaId: membresia.id, pedidoId: pedido.id, vencimiento: actualizada.vencimiento, suspendida: actualizada.suspendida },
      actualizada.suspendida ? 'Membresía suspendida por devolución del pedido' : `Renovación revertida: vence el ${actualizada.vencimiento}`);
  });

  const nuevasMatriculas: Matricula[] = matriculas.map((matricula) => {
    const membresia = nuevasMembresias.find((item) => item.id === matricula.membresiaId);
    if (membresia && resultado.membresias.includes(membresia.id)) {
      return { ...matricula, vencimiento: membresia.vencimiento, suspendida: membresia.suspendida };
    }
    if (matricula.pedidoId !== pedido.id || matricula.suspendida) return matricula;
    resultado.matriculas.push(matricula.id);
    registrarEventoLms('acceso_suspendido', matricula.personaId, matricula.programaId, { matriculaId: matricula.id, pedidoId: pedido.id }, 'Acceso suspendido por devolución; notas y certificados se conservan');
    return { ...matricula, suspendida: true, historial: [...matricula.historial, { fecha, actorId, accion: 'Acceso suspendido por devolución', motivo }] };
  });

  if (resultado.matriculas.length === 0 && resultado.membresias.length === 0) return resultado;
  actualizar({ matriculas: nuevasMatriculas, membresias: nuevasMembresias });
  registrarBitacora({ actorId, accion: 'Acceso académico suspendido por devolución', modulo: 'matriculas', motivo, referenciaId: pedido.id, despues: { matriculas: resultado.matriculas, membresias: resultado.membresias } });
  notificar({ personaId: pedido.compradorId, tipo: 'estado', titulo: 'Acceso académico suspendido', mensaje: `Por la devolución del pedido ${pedido.id} se suspendió el acceso a los contenidos. Tus notas y certificados se conservan.` });
  return resultado;
}
