import assert from 'node:assert/strict';
import { respuestaCorrecta, respuestaIncorrecta } from '../src/motores/academico/calificacion';
import { verificar, anularDocumento, reemitir } from '../src/servicios/certificados';
import { contextoActual } from '../src/servicios/datosCampus';
import { enviarIntento, iniciarIntento, marcarComponente, otorgarIntentoExtra } from '../src/servicios/evaluaciones';
import { asignarEvaluador, calificarSustentacion, solicitarMid } from '../src/servicios/mid';
import { consultarCalificacion } from '../src/servicios/consultas';
import { useCampusStore } from '../src/store/useCampusStore';
import { useFormacionStore } from '../src/store/useFormacionStore';
import type { Respuesta } from '../src/tipos/academico';

let total = 0;
function prueba(nombre: string, cuerpo: () => void): void {
  cuerpo();
  total += 1;
  console.log(`OK  ${nombre}`);
}
const campus = () => useCampusStore.getState();

function rendir(personaId: string, ambito: 'tema' | 'tim', elementoId: string, aciertos: number) {
  const inicio = iniciarIntento(personaId, ambito, elementoId);
  assert.ok(inicio.ok, inicio.ok ? '' : inicio.error);
  const respuestas: Record<string, Respuesta> = Object.fromEntries(inicio.valor.preguntas.map((pregunta, indice) => [pregunta.id, indice < aciertos ? respuestaCorrecta(pregunta) : respuestaIncorrecta(pregunta)]));
  const envio = enviarIntento(personaId, inicio.valor, respuestas);
  assert.ok(envio.ok, envio.ok ? '' : envio.error);
  return envio.valor;
}

prueba('RA-10 y LMS-053 la evaluación exige completar video, lectura y caso', () => {
  assert.equal(iniciarIntento('DEMO-L01', 'tema', 'DEMO-TEM-002').ok, false);
  assert.ok(marcarComponente('DEMO-L01', 'DEMO-TEM-002', 'video').ok);
  assert.ok(marcarComponente('DEMO-L01', 'DEMO-TEM-002', 'lectura').ok);
  assert.ok(marcarComponente('DEMO-L01', 'DEMO-TEM-002', 'caso').ok);
  assert.equal(marcarComponente('DEMO-L01', 'DEMO-TEM-003', 'video').ok, false);
});

prueba('F10 desaprueba con 12, aprueba con 20 y desbloquea el tema 3', () => {
  const primero = rendir('DEMO-L01', 'tema', 'DEMO-TEM-002', 3);
  assert.equal(primero.intento.nota, 12);
  assert.equal(primero.intento.aprobado, false);
  assert.equal(contextoActual('DEMO-L01', 'DEMO-TEM-003')?.estado, 'bloqueado');
  const segundo = rendir('DEMO-L01', 'tema', 'DEMO-TEM-002', 5);
  assert.equal(segundo.intento.nota, 20);
  assert.equal(segundo.registrada, 20);
  assert.equal(contextoActual('DEMO-L01', 'DEMO-TEM-003')?.estado, 'disponible');
  assert.equal(iniciarIntento('DEMO-L01', 'tema', 'DEMO-TEM-002').ok, false);
});

prueba('CL-07 intentos agotados y intento extra', () => {
  assert.equal(iniciarIntento('DEMO-A26', 'tema', 'DEMO-TEM-005').ok, false);
  const matricula = campus().matriculas.find((item) => item.personaId === 'DEMO-A26');
  assert.ok(matricula);
  assert.ok(otorgarIntentoExtra(matricula.id, 'DEMO-TEM-005', 1, 'DEMO-U02', 'Intento adicional por incidencia técnica').ok);
  assert.ok(iniciarIntento('DEMO-A26', 'tema', 'DEMO-TEM-005').ok);
});

prueba('F12 aprobar el TIM 3 emite el certificado, actualiza la formación y el RUN', () => {
  const resultado = rendir('DEMO-A01', 'tim', 'DEMO-TIM-03', 8);
  assert.equal(resultado.intento.aprobado, true);
  assert.equal(resultado.documentos.length, 1);
  assert.equal(resultado.documentos[0].tipo, 'certificado');
  assert.equal(emitidos('DEMO-A01'), 1);
  const fila = useFormacionStore.getState().estados.find((item) => item.personaId === 'DEMO-A01' && item.programaExterno.includes('Nivel 1'));
  assert.equal(fila?.estado, 'aprobado');
  assert.ok(campus().eventos.some((evento) => evento.tipo === 'curso_aprobado' && evento.personaId === 'DEMO-A01'));
  const calificacion = consultarCalificacion('DEMO-A01', 'DEMO-C02');
  const formacion = [...(calificacion?.desglose ?? []), ...(calificacion?.desgloseSiguiente ?? [])].filter((requisito) => requisito.fuente.includes('LMS'));
  assert.ok(formacion.every((requisito) => requisito.cumple));
  assert.equal(iniciarIntento('DEMO-A01', 'tim', 'DEMO-TIM-03').ok, false);
});

function emitidos(personaId: string): number {
  return campus().documentos.filter((documento) => documento.personaId === personaId && documento.estado === 'emitido').length;
}

prueba('RA-07 un reintento no duplica el certificado', () => {
  assert.equal(emitidos('DEMO-A01'), 1);
});

prueba('F11 L06 aprueba el TIM 9 y verifica el certificado', () => {
  const resultado = rendir('DEMO-L06', 'tim', 'DEMO-TIM-09', 7);
  const documento = resultado.documentos[0];
  assert.ok(documento);
  assert.equal(verificar(documento.codigo).estado, 'valido');
  assert.equal(verificar(documento.codigoVerificacion).estado, 'valido');
  const nuevo = reemitir(documento.id, 'Corrección de datos solicitada por el estudiante', 'DEMO-U01');
  assert.ok(nuevo.ok);
  assert.equal(verificar(documento.codigo).estado, 'anulado');
  assert.ok(anularDocumento(nuevo.ok ? nuevo.valor.id : '', 'Anulación de prueba del documento', 'DEMO-U01').ok);
  assert.equal(verificar('ERK-CER-2099-99999').estado, 'inexistente');
});

prueba('F13 MID: solicitud, asignación y calificación sin alterar el diploma', () => {
  const diploma = campus().documentos.find((documento) => documento.personaId === 'DEMO-L03' && documento.tipo === 'diploma');
  const solicitud = solicitarMid('DEMO-L03', { titulo: 'Liderazgo comercial en equipos remotos', resumen: 'Investigación aplicada sobre la gestión de equipos de venta a distancia.', archivo: 'trabajo_mid.pdf', fechaPropuesta: '2026-12-01' });
  assert.ok(solicitud.ok, solicitud.ok ? '' : solicitud.error);
  assert.equal(solicitarMid('DEMO-L03', { titulo: 'x', resumen: 'y', archivo: 'z', fechaPropuesta: '2026-12-01' }).ok, false);
  assert.ok(asignarEvaluador(solicitud.ok ? solicitud.valor.id : '', 'DEMO-U03', '2026-12-05', 'DEMO-U01').ok);
  const calificada = calificarSustentacion(solicitud.ok ? solicitud.valor.id : '', 'DEMO-U03', [18, 17, 16, 18], 'Buena sustentación con propuesta aplicable.');
  assert.ok(calificada.ok, calificada.ok ? '' : calificada.error);
  assert.equal(calificada.ok && calificada.valor.sustentacion.estado, 'aprobado');
  assert.ok(campus().documentos.some((documento) => documento.personaId === 'DEMO-L03' && documento.tipo === 'constancia_mid'));
  const despues = campus().documentos.find((documento) => documento.id === diploma?.id);
  assert.deepEqual(despues, diploma);
  assert.equal(calificarSustentacion(solicitud.ok ? solicitud.valor.id : '', 'DEMO-U01', [20, 20, 20, 20], 'Intento de otro evaluador').ok, false);
});

console.log(`\n${total} pruebas del campus superadas`);
