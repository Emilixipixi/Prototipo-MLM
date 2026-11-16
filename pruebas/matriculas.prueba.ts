import assert from 'node:assert/strict';
import { relativoHoy, sumarMeses } from '../src/datos/academico/fechasCampus';
import { accesoPrograma } from '../src/motores/academico/accesos';
import { alConfirmarPedido } from '../src/servicios/conectorLms';
import { inscribirConMembresia, matricularManual, revisarVencimientos } from '../src/servicios/matriculas';
import { confirmarPedido, crearPedido, enviarPedido, registrarDevolucion } from '../src/servicios/pedidos';
import { useAcademicoStore } from '../src/store/useAcademicoStore';
import { useCampusStore } from '../src/store/useCampusStore';
import { usePedidosStore } from '../src/store/usePedidosStore';

let total = 0;
function prueba(nombre: string, cuerpo: () => void): void {
  cuerpo();
  total += 1;
  console.log(`OK  ${nombre}`);
}

function comprar(personaId: string, productoId: string, cantidad = 1): string {
  const creado = crearPedido(personaId, [{ productoId, cantidad }]);
  assert.ok(creado.ok, creado.ok ? '' : creado.error);
  assert.ok(enviarPedido(creado.valor.id, personaId).ok);
  return creado.valor.id;
}

const hoy = relativoHoy(0);
const campus = () => useCampusStore.getState();

prueba('LMS-062 un pedido pendiente no matricula', () => {
  const antes = campus().matriculas.length;
  comprar('DEMO-L07', 'DEMO-PRD-20');
  assert.equal(campus().matriculas.length, antes);
});

prueba('LMS-060 confirmar el cobro matricula con la duración del programa', () => {
  const pedidoId = comprar('DEMO-L07', 'DEMO-PRD-20');
  const eventosAntes = campus().eventos.length;
  assert.ok(confirmarPedido(pedidoId, 'DEMO-L07').ok);
  const matricula = campus().matriculas.find((item) => item.pedidoId === pedidoId);
  assert.ok(matricula);
  assert.equal(matricula.programaId, 'DEMO-DIP-01');
  assert.equal(matricula.origen, 'compra');
  assert.equal(matricula.vencimiento, sumarMeses(hoy, 12));
  assert.ok(campus().eventos.slice(eventosAntes).some((evento) => evento.tipo === 'matricula_creada'));
  const acceso = accesoPrograma('DEMO-L07', 'DEMO-CUR-02', campus().matriculas, campus().membresias, useAcademicoStore.getState().programas, hoy);
  assert.equal(acceso.acceso, true);
});

prueba('LMS-063 recomprar un curso extiende el acceso', () => {
  const previa = campus().matriculas.find((item) => item.personaId === 'DEMO-L05' && item.programaId === 'DEMO-CUR-03');
  assert.ok(previa && previa.vencimiento < hoy);
  const pedidoId = comprar('DEMO-L05', 'DEMO-PRD-05');
  assert.ok(confirmarPedido(pedidoId, 'DEMO-L05').ok);
  const renovada = campus().matriculas.find((item) => item.id === previa.id);
  assert.equal(renovada?.vencimiento, sumarMeses(hoy, 6));
  assert.equal(renovada?.historial.at(-1)?.accion, 'Renovación de acceso');
});

prueba('LMS-061 y LMS-063 membresía nueva y renovación desde el vencimiento vigente', () => {
  const primero = comprar('DEMO-L02', 'DEMO-PRD-21');
  assert.ok(confirmarPedido(primero, 'DEMO-L02').ok);
  const membresia = campus().membresias.find((item) => item.personaId === 'DEMO-L02');
  assert.equal(membresia?.vencimiento, sumarMeses(hoy, 1));
  const segundo = comprar('DEMO-L02', 'DEMO-PRD-23');
  assert.ok(confirmarPedido(segundo, 'DEMO-L02').ok);
  const renovada = campus().membresias.find((item) => item.personaId === 'DEMO-L02');
  assert.equal(renovada?.vencimiento, sumarMeses(sumarMeses(hoy, 1), 3));
  assert.deepEqual(renovada?.pedidoIds, [primero, segundo]);
  assert.ok(inscribirConMembresia('DEMO-L02', 'DEMO-CUR-03', 'DEMO-L02').ok);
  assert.equal(inscribirConMembresia('DEMO-L02', 'DEMO-CUR-03', 'DEMO-L02').ok, false);
  const inscrita = campus().matriculas.find((item) => item.personaId === 'DEMO-L02' && item.programaId === 'DEMO-CUR-03');
  assert.equal(inscrita?.vencimiento, renovada?.vencimiento);
});

prueba('LMS-062 devolución de renovación reduce el vencimiento y la de la última compra suspende', () => {
  const membresia = campus().membresias.find((item) => item.personaId === 'DEMO-L02');
  assert.ok(membresia);
  assert.ok(registrarDevolucion(membresia.pedidoIds[1], 'DEMO-U01', 'Devolución de prueba de la renovación').ok);
  const reducida = campus().membresias.find((item) => item.id === membresia.id);
  assert.equal(reducida?.vencimiento, sumarMeses(hoy, 1));
  assert.equal(reducida?.suspendida, false);
  assert.ok(registrarDevolucion(membresia.pedidoIds[0], 'DEMO-U01', 'Devolución de prueba de la membresía').ok);
  assert.equal(campus().membresias.find((item) => item.id === membresia.id)?.suspendida, true);
  assert.equal(campus().matriculas.find((item) => item.personaId === 'DEMO-L02' && item.programaId === 'DEMO-CUR-03')?.suspendida, true);
});

prueba('CL-04 devolver un curso suspende el acceso sin borrar notas ni certificados', () => {
  const pedidoId = comprar('DEMO-L03', 'DEMO-PRD-01');
  assert.ok(confirmarPedido(pedidoId, 'DEMO-L03').ok);
  const intentos = campus().intentos.length;
  const documentos = campus().documentos.length;
  assert.ok(registrarDevolucion(pedidoId, 'DEMO-U01', 'Devolución de prueba del curso').ok);
  const matricula = campus().matriculas.find((item) => item.pedidoId === pedidoId);
  assert.equal(matricula?.suspendida, true);
  assert.equal(campus().intentos.length, intentos);
  assert.equal(campus().documentos.length, documentos);
  assert.ok(usePedidosStore.getState().pedidos.find((item) => item.id === pedidoId)?.estado === 'devuelta');
});

prueba('LMS-064 avisos de vencimiento sin duplicar', () => {
  assert.ok(revisarVencimientos('DEMO-L04') >= 1);
  assert.equal(revisarVencimientos('DEMO-L04'), 0);
  const eventos = campus().eventos.length;
  revisarVencimientos('DEMO-L05');
  assert.equal(campus().eventos.filter((evento) => evento.tipo === 'acceso_vencido').length, campus().eventos.slice(0, eventos).filter((evento) => evento.tipo === 'acceso_vencido').length);
});

prueba('LMS-066 matrícula manual exige motivo', () => {
  assert.equal(matricularManual('DEMO-L07', 'DEMO-CUR-03', 'DEMO-U02', 'corta').ok, false);
  assert.ok(matricularManual('DEMO-L07', 'DEMO-CUR-03', 'DEMO-U02', 'Beca de demostración por convenio').ok);
});

prueba('Productos sin programa no generan matrícula', () => {
  const pedido = usePedidosStore.getState().pedidos.find((item) => item.estado === 'confirmada' && item.items.every((linea) => linea.productoId === 'DEMO-PRD-02'));
  if (pedido) assert.deepEqual(alConfirmarPedido(pedido, 'DEMO-U01').matriculas, []);
});

console.log(`\n${total} pruebas de matrículas superadas`);
