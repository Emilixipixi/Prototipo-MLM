import assert from 'node:assert/strict';
import { calificarIntento, esCorrecta, respuestaCorrecta, respuestaIncorrecta } from '../src/motores/academico/calificacion';
import { accesoPrograma, estadoVigencia } from '../src/motores/academico/accesos';
import { emitirDocumento, puedeEmitirDiploma, reemitirDocumento, verificarCodigo } from '../src/motores/academico/certificacion';
import { calcularDesbloqueos, construirRuta, type AvanceElemento } from '../src/motores/academico/desbloqueo';
import { estaAprobado, notaElemento, notaModulo, notaPromedio, notaRegistrada } from '../src/motores/academico/notas';
import { resumirPrograma } from '../src/motores/academico/progreso';
import { modulosIniciales } from '../src/datos/academico/contenidos';
import {
  documentosIniciales, intentosIniciales, matriculasIniciales, membresiasIniciales, progresoInicial,
} from '../src/datos/academico/matriculasIniciales';
import { preguntasIniciales } from '../src/datos/academico/preguntas';
import { programasIniciales } from '../src/datos/academico/programas';
import { temasIniciales, timsIniciales } from '../src/datos/academico/contenidos';
import { verificarConsistenciaAcademica } from '../src/datos/academico/verificarConsistenciaAcademica';
import { formacionInicial } from '../src/datos/formacion';
import { personasIniciales } from '../src/datos/personas';
import type { Pregunta } from '../src/tipos/academico';

let total = 0;
function prueba(nombre: string, cuerpo: () => void): void {
  cuerpo();
  total += 1;
  console.log(`OK  ${nombre}`);
}

prueba('RA-01 aprobado estrictamente mayor a 14', () => {
  assert.equal(estaAprobado(14), false);
  assert.equal(estaAprobado(14.004), false);
  assert.equal(estaAprobado(14.01), true);
  assert.equal(estaAprobado(20), true);
});

prueba('RA-02 nota de módulo ponderada por horas', () => {
  const resultado = notaModulo([16, 16, 20, 20, 12], 15);
  assert.equal(resultado.nota, 16.35);
  assert.equal(resultado.estado, 'aprobado');
  assert.equal(notaModulo([16, 16, 20, 20, null], 15).estado, 'pendiente');
});

prueba('RA-03 y RA-04 promedio simple y pendiente', () => {
  assert.deepEqual(notaPromedio([{ nota: 18, estado: 'aprobado' }, { nota: 15, estado: 'aprobado' }]), { nota: 16.5, estado: 'aprobado' });
  assert.deepEqual(notaPromedio([{ nota: 18, estado: 'aprobado' }, { nota: null, estado: 'pendiente' }]), { nota: null, estado: 'pendiente' });
  assert.equal(notaPromedio([{ nota: 14, estado: 'desaprobado' }, { nota: 14, estado: 'desaprobado' }]).estado, 'desaprobado');
});

prueba('RA-05 política de nota', () => {
  assert.equal(notaRegistrada([12, 18, 16], 'mejor'), 18);
  assert.equal(notaRegistrada([12, 18, 16], 'ultimo'), 16);
  assert.equal(notaRegistrada([12, 18, 16], 'promedio'), 15.33);
  assert.deepEqual(notaElemento([12], 'mejor', 3), { nota: null, estado: 'pendiente' });
  assert.deepEqual(notaElemento([12, 8, 12], 'mejor', 3), { nota: 12, estado: 'desaprobado' });
});

prueba('Calificación automática por tipo de pregunta', () => {
  const tipos = new Set(preguntasIniciales.map((pregunta) => pregunta.tipo));
  assert.equal(tipos.size, 6);
  preguntasIniciales.forEach((pregunta) => {
    assert.equal(esCorrecta(pregunta, respuestaCorrecta(pregunta)), true, pregunta.id);
    assert.equal(esCorrecta(pregunta, respuestaIncorrecta(pregunta)), false, pregunta.id);
  });
  const numerica = preguntasIniciales.find((pregunta) => pregunta.tipo === 'numerica' && (pregunta.tolerancia ?? 0) > 0) as Pregunta;
  assert.equal(esCorrecta(numerica, (numerica.valorNumerico ?? 0) + (numerica.tolerancia ?? 0)), true);
  const multiple = preguntasIniciales.find((pregunta) => pregunta.tipo === 'seleccion_multiple') as Pregunta;
  assert.equal(esCorrecta(multiple, [...multiple.correctas].reverse()), true);
  assert.equal(esCorrecta(multiple, [...multiple.correctas, 99]), false);
});

prueba('CL-06 escala 0 a 20 y 14 desaprueba', () => {
  const banco = preguntasIniciales.filter((pregunta) => pregunta.ambitoId === 'DEMO-TEM-001').slice(0, 5);
  const respuestas = Object.fromEntries(banco.map((pregunta, indice) => [pregunta.id, indice < 4 ? respuestaCorrecta(pregunta) : null]));
  assert.deepEqual(calificarIntento(banco, respuestas).nota, 16);
  const tim = preguntasIniciales.filter((pregunta) => pregunta.ambitoId === 'DEMO-TIM-01');
  const parcial = Object.fromEntries(tim.map((pregunta, indice) => [pregunta.id, indice < 5 ? respuestaCorrecta(pregunta) : null]));
  const resultado = calificarIntento(tim, parcial);
  assert.equal(resultado.nota, 12.5);
  assert.equal(resultado.aprobado, false);
});

prueba('RA-06 desbloqueo aprobar para avanzar y libre', () => {
  const ruta = construirRuta('DEMO-CUR-01', programasIniciales, modulosIniciales);
  assert.equal(ruta.length, 18);
  const avance: Record<string, AvanceElemento> = {
    'DEMO-TEM-001': { intentos: 1, aprobado: true, intentosPermitidos: 3 },
    'DEMO-TEM-002': { intentos: 2, aprobado: false, intentosPermitidos: 3 },
  };
  const estrictos = calcularDesbloqueos(ruta, avance, 'aprobar_para_avanzar');
  assert.equal(estrictos['DEMO-TEM-001'], 'aprobado');
  assert.equal(estrictos['DEMO-TEM-002'], 'desaprobado');
  assert.equal(estrictos['DEMO-TEM-003'], 'bloqueado');
  assert.equal(estrictos['DEMO-TIM-01'], 'bloqueado');
  const libres = calcularDesbloqueos(ruta, avance, 'libre');
  assert.equal(libres['DEMO-TEM-010'], 'disponible');
  assert.equal(libres['DEMO-TIM-01'], 'bloqueado');
  avance['DEMO-TEM-002'] = { intentos: 3, aprobado: false, intentosPermitidos: 3 };
  assert.equal(calcularDesbloqueos(ruta, avance, 'aprobar_para_avanzar')['DEMO-TEM-002'], 'bloqueado_por_intentos');
});

prueba('RA-07 emisión idempotente, reemisión y verificación', () => {
  const datos = {
    tipo: 'certificado' as const, personaId: 'X', programaId: 'DEMO-CUR-01', nota: 17, horas: 60,
    fechaCulminacion: '2026-11-01', fechaEmision: '2026-11-01T10:00:00', detalle: [],
  };
  const primero = emitirDocumento(documentosIniciales, datos);
  assert.equal(primero.nuevo, true);
  const segundo = emitirDocumento([...documentosIniciales, primero.documento], datos);
  assert.equal(segundo.nuevo, false);
  assert.equal(segundo.documento.id, primero.documento.id);
  const lista = [...documentosIniciales, primero.documento];
  const { anulado, nuevo } = reemitirDocumento(lista, primero.documento, 'Corrección', '2026-11-02T10:00:00');
  assert.equal(anulado.estado, 'anulado');
  assert.equal(nuevo.reemplazaA, primero.documento.id);
  assert.notEqual(nuevo.codigo, primero.documento.codigo);
  assert.equal(verificarCodigo([...lista.filter((item) => item.id !== primero.documento.id), anulado, nuevo], primero.documento.codigoVerificacion).estado, 'anulado');
  assert.equal(verificarCodigo(lista, 'NOEXISTE').estado, 'inexistente');
});

prueba('RA-08 diploma requiere ambos cursos y matrícula del diplomado', () => {
  const aprobado = { nota: 17, estado: 'aprobado' as const };
  assert.equal(puedeEmitirDiploma([aprobado, aprobado], true), true);
  assert.equal(puedeEmitirDiploma([aprobado, aprobado], false), false);
  assert.equal(puedeEmitirDiploma([aprobado, { nota: null, estado: 'pendiente' }], true), false);
});

prueba('RA-10 vigencia y acceso', () => {
  assert.equal(estadoVigencia('2026-11-20', false, '2026-11-14'), 'por_vencer');
  assert.equal(estadoVigencia('2026-12-20', false, '2026-11-14'), 'activa');
  assert.equal(estadoVigencia('2026-11-13', false, '2026-11-14'), 'vencida');
  assert.equal(estadoVigencia('2026-12-20', true, '2026-11-14'), 'suspendida');
  const l03 = accesoPrograma('DEMO-L03', 'DEMO-CUR-02', matriculasIniciales, membresiasIniciales, programasIniciales, '2026-11-14');
  assert.equal(l03.via, 'diplomado');
  const l04 = accesoPrograma('DEMO-L04', 'DEMO-DIP-01', matriculasIniciales, membresiasIniciales, programasIniciales, membresiasIniciales[0].inicio);
  assert.equal(l04.via, 'membresia');
  const l05 = accesoPrograma('DEMO-L05', 'DEMO-CUR-03', matriculasIniciales, [], programasIniciales, '2026-11-14');
  assert.equal(l05.acceso, false);
});

prueba('Datos: estructura 45 temas, 9 TIM y bancos completos', () => {
  assert.equal(temasIniciales.length, 45);
  assert.equal(timsIniciales.length, 9);
  assert.equal(preguntasIniciales.filter((pregunta) => pregunta.ambito === 'tema').length, 360);
  assert.equal(preguntasIniciales.filter((pregunta) => pregunta.ambito === 'tim').length, 72);
});

prueba('Datos: 50 documentos, 1 anulado y 1 reemitido', () => {
  assert.equal(documentosIniciales.length, 50);
  assert.equal(documentosIniciales.filter((documento) => documento.estado === 'anulado').length, 1);
  assert.equal(documentosIniciales.filter((documento) => documento.reemplazaA).length, 1);
  assert.equal(documentosIniciales.filter((documento) => documento.tipo === 'diploma').length, 8);
  assert.equal(documentosIniciales.filter((documento) => documento.tipo === 'constancia_mid').length, 3);
});

prueba('Datos: estados precargados de los flujos', () => {
  const estructura = { programas: programasIniciales, modulos: modulosIniciales };
  const registro = { matriculas: matriculasIniciales, progreso: progresoInicial, intentos: intentosIniciales };
  const a01 = resumirPrograma('DEMO-A01', 'DEMO-CUR-01', estructura, registro);
  assert.equal(a01?.estados['DEMO-TIM-03'], 'disponible');
  assert.equal(a01?.aprobados, 17);
  const l06 = resumirPrograma('DEMO-L06', 'DEMO-CUR-03', estructura, registro);
  assert.equal(l06?.estados['DEMO-TIM-09'], 'disponible');
  const l01 = resumirPrograma('DEMO-L01', 'DEMO-CUR-01', estructura, registro);
  assert.equal(l01?.estados['DEMO-TEM-002'], 'disponible');
  const a26 = resumirPrograma('DEMO-A26', 'DEMO-CUR-01', estructura, registro);
  assert.equal(a26?.estados['DEMO-TEM-005'], 'bloqueado_por_intentos');
  const l03 = resumirPrograma('DEMO-L03', 'DEMO-DIP-01', estructura, registro);
  assert.equal(l03?.nota.estado, 'aprobado');
});

prueba('Consistencia académica sin diferencias', () => {
  const resultados = verificarConsistenciaAcademica({
    programas: programasIniciales, modulos: modulosIniciales, temas: temasIniciales, tims: timsIniciales, preguntas: preguntasIniciales,
    matriculas: matriculasIniciales, membresias: membresiasIniciales, progreso: progresoInicial, intentos: intentosIniciales,
    documentos: documentosIniciales, formacion: formacionInicial, personas: personasIniciales,
  });
  const fallidas = resultados.filter((resultado) => !resultado.ok);
  assert.equal(fallidas.length, 0, fallidas.map((resultado) => `${resultado.nombre}: ${resultado.detalle}`).join(' | '));
});

console.log(`\n${total} pruebas académicas superadas`);
