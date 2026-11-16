import assert from 'node:assert/strict';
import { distribuirNotas } from '../src/componentes/campus/distribucionNotas';
import { relativoHoy, sumarMeses } from '../src/datos/academico/fechasCampus';
import { cambiarEstadoPrograma, crearPrograma, moverModulo, moverTema } from '../src/servicios/academico';
import { extenderAcceso } from '../src/servicios/matriculas';
import { useAcademicoStore } from '../src/store/useAcademicoStore';
import { useCampusStore } from '../src/store/useCampusStore';
import { guardarTema } from '../src/servicios/academico';
import { calificarSustentacion, midDisponible } from '../src/servicios/mid';
import { usePersonasStore } from '../src/store/usePersonasStore';
import { ESTADO_YOUTUBE_TERMINADO, estadoReproductorYoutube, idYoutube } from '../src/utilidades/youtube';

let total = 0;
function prueba(nombre: string, cuerpo: () => void): void {
  cuerpo();
  total += 1;
  console.log(`OK  ${nombre}`);
}
const academico = () => useAcademicoStore.getState();
const campus = () => useCampusStore.getState();

const creado = crearPrograma({ tipo: 'curso', nombre: 'Curso de prueba de orden', descripcion: 'Prueba', productoId: null, incluidoEnMembresia: false, plantillaId: 'DEMO-CUR-01', cursoIds: [] }, 'DEMO-U01');
assert.ok(creado.ok, creado.ok ? '' : creado.error);
const borrador = creado.ok ? creado.valor : academico().programas[0];

prueba('LMS-081 subir y bajar temas actualiza el orden y la bitácora', () => {
  const modulo = academico().modulos.find((item) => item.id === borrador.moduloIds[0]);
  assert.ok(modulo);
  const [primero, segundo] = modulo.temaIds;
  const bajado = moverTema(modulo.id, primero, 'bajar', 'DEMO-U01');
  assert.ok(bajado.ok);
  const actualizado = academico().modulos.find((item) => item.id === modulo.id);
  assert.deepEqual(actualizado?.temaIds.slice(0, 2), [segundo, primero]);
  assert.equal(academico().temas.find((tema) => tema.id === primero)?.orden, 2);
  assert.equal(academico().temas.find((tema) => tema.id === segundo)?.orden, 1);
  assert.equal(moverTema(modulo.id, segundo, 'subir', 'DEMO-U01').ok, false);
  assert.equal(moverTema(modulo.id, modulo.temaIds[4], 'bajar', 'DEMO-U01').ok, false);
});

prueba('LMS-081 subir y bajar módulos y estructura protegida al publicar', () => {
  const [m1, m2, m3] = borrador.moduloIds;
  assert.ok(moverModulo(borrador.id, m3, 'subir', 'DEMO-U01').ok);
  const programa = academico().programas.find((item) => item.id === borrador.id);
  assert.deepEqual(programa?.moduloIds, [m1, m3, m2]);
  assert.equal(academico().modulos.find((item) => item.id === m3)?.orden, 2);
  assert.equal(moverModulo(borrador.id, m1, 'subir', 'DEMO-U01').ok, false);
  assert.ok(cambiarEstadoPrograma(borrador.id, 'publicado', 'DEMO-U01').ok);
  assert.equal(moverModulo(borrador.id, m3, 'bajar', 'DEMO-U01').ok, false);
  assert.equal(moverTema(m1, academico().modulos.find((item) => item.id === m1)?.temaIds[0] ?? '', 'bajar', 'DEMO-U01').ok, false);
});

prueba('LMS-085 extender acceso desde el vencimiento vigente o desde hoy', () => {
  const hoy = relativoHoy(0);
  const vigente = campus().matriculas.find((item) => item.origen !== 'membresia' && !item.suspendida && item.vencimiento >= hoy);
  assert.ok(vigente);
  assert.equal(extenderAcceso(vigente.id, 3, 'DEMO-U01', 'corto').ok, false);
  assert.equal(extenderAcceso(vigente.id, 4, 'DEMO-U01', 'Compensación por corte del servicio').ok, false);
  const extendida = extenderAcceso(vigente.id, 3, 'DEMO-U01', 'Compensación por corte del servicio');
  assert.ok(extendida.ok, extendida.ok ? '' : extendida.error);
  assert.equal(extendida.ok && extendida.valor.vencimiento, sumarMeses(vigente.vencimiento, 3));
  assert.match(extendida.ok ? extendida.valor.historial.at(-1)?.accion ?? '' : '', /Acceso extendido 3 meses/);
  const vencida = campus().matriculas.find((item) => item.origen !== 'membresia' && !item.suspendida && item.vencimiento < hoy);
  if (vencida) {
    const desdeHoy = extenderAcceso(vencida.id, 1, 'DEMO-U01', 'Reapertura de acceso por cortesía');
    assert.ok(desdeHoy.ok);
    assert.equal(desdeHoy.ok && desdeHoy.valor.vencimiento, sumarMeses(hoy, 1));
  }
  const deMembresia = campus().matriculas.find((item) => item.origen === 'membresia');
  if (deMembresia) assert.equal(extenderAcceso(deMembresia.id, 1, 'DEMO-U01', 'Intento sobre membresía').ok, false);
  const suspendida = campus().matriculas.find((item) => item.suspendida && item.origen !== 'membresia');
  if (suspendida) assert.equal(extenderAcceso(suspendida.id, 1, 'DEMO-U01', 'Intento sobre suspendida').ok, false);
});

prueba('LMS-088 distribución de notas: 14 desaprueba y cuadra con los intentos', () => {
  const intentos = campus().intentos;
  const distribucion = distribuirNotas(intentos);
  assert.equal(distribucion.reduce((suma, fila) => suma + fila.cantidad, 0), intentos.length);
  const conCatorce = distribuirNotas([{ ...intentos[0], nota: 14 }, { ...intentos[0], nota: 14.01 }, { ...intentos[0], nota: 10 }, { ...intentos[0], nota: 20 }]);
  assert.deepEqual(conCatorce.map((fila) => fila.cantidad), [0, 2, 1, 1]);
});

prueba('LMS-011 enlaces de YouTube: reconocimiento, validación y fin del video', () => {
  assert.equal(idYoutube('https://www.youtube.com/watch?v=ubGc27yfRAo'), 'ubGc27yfRAo');
  assert.equal(idYoutube('https://youtu.be/0n-vCMo6KVA?si=abc'), '0n-vCMo6KVA');
  assert.equal(idYoutube('https://www.youtube.com/watch?list=PL1&v=4aO404FQDhg&t=30s'), '4aO404FQDhg');
  assert.equal(idYoutube('https://www.youtube.com/shorts/4aO404FQDhg'), '4aO404FQDhg');
  assert.equal(idYoutube('https://www.youtube.com/embed/4aO404FQDhg'), '4aO404FQDhg');
  assert.equal(idYoutube('https://vimeo.com/123456'), null);
  assert.equal(idYoutube(''), null);
  assert.equal(estadoReproductorYoutube(JSON.stringify({ event: 'onStateChange', info: 0 })), ESTADO_YOUTUBE_TERMINADO);
  assert.equal(estadoReproductorYoutube(JSON.stringify({ event: 'infoDelivery', info: { playerState: 0 } })), ESTADO_YOUTUBE_TERMINADO);
  assert.equal(estadoReproductorYoutube(JSON.stringify({ event: 'infoDelivery', info: { currentTime: 3 } })), null);
  assert.equal(estadoReproductorYoutube('no es json'), null);
  const tema = academico().temas.find((item) => item.id === 'DEMO-TEM-006');
  assert.ok(tema?.video.urlVideo && idYoutube(tema.video.urlVideo));
  assert.equal(guardarTema({ ...tema, video: { ...tema.video, urlVideo: 'https://vimeo.com/123456' } }, 'DEMO-U01').ok, false);
  assert.ok(guardarTema({ ...tema, video: { ...tema.video, urlVideo: 'https://youtu.be/ubGc27yfRAo' } }, 'DEMO-U01').ok);
  assert.ok(guardarTema({ ...tema, video: { ...tema.video, urlVideo: '' } }, 'DEMO-U01').ok);
});

prueba('MID precargado: 10 alumnos nuevos y bandeja del evaluador con datos', () => {
  const alumnos = usePersonasStore.getState().personas.filter((persona) => /^DEMO-L(0[89]|1[0-7])$/.test(persona.id));
  assert.equal(alumnos.length, 10);
  assert.ok(alumnos.every((alumno) => campus().matriculas.some((matricula) => matricula.personaId === alumno.id && matricula.programaId === 'DEMO-DIP-01')));
  const asignadas = campus().sustentaciones.filter((item) => item.evaluadorId === 'DEMO-U03');
  assert.equal(asignadas.filter((item) => item.estado === 'asignado').length, 5);
  assert.equal(asignadas.filter((item) => item.estado === 'aprobado').length, 3);
  assert.equal(asignadas.filter((item) => item.estado === 'desaprobado').length, 1);
  assert.equal(campus().sustentaciones.filter((item) => item.estado === 'solicitado').length, 4);
  assert.equal(campus().documentos.filter((documento) => documento.tipo === 'constancia_mid').length, 3);
  assert.ok(campus().sustentaciones.every((item) => midDisponible(item.personaId)));
  assert.equal(campus().sustentaciones.some((item) => item.personaId === 'DEMO-L03'), false);
  assert.ok(midDisponible('DEMO-L03'));
  const pendiente = asignadas.find((item) => item.estado === 'asignado');
  assert.ok(pendiente);
  const calificada = calificarSustentacion(pendiente.id, 'DEMO-U03', [16, 17, 15, 16], 'Trabajo bien sustentado y con propuesta aplicable.');
  assert.ok(calificada.ok, calificada.ok ? '' : calificada.error);
  assert.match(calificada.ok ? calificada.valor.constancia?.codigo ?? '' : '', /^ERK-MID-\d{4}-\d{5}$/);
  assert.equal(campus().documentos.filter((documento) => documento.tipo === 'constancia_mid').length, 4);
});

console.log(`\n${total} pruebas del panel académico superadas`);
