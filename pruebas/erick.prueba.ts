import assert from 'node:assert/strict';
import { crearPermisosIniciales, modulosErick } from '../src/datos/permisosIniciales';
import { nombresPerfiles } from '../src/datos/perfiles';
import { membresiasIniciales, matriculasIniciales } from '../src/datos/academico/matriculasIniciales';
import { personasIniciales } from '../src/datos/personas';
import { rutaInicioPorPerfil } from '../src/store/useSesionStore';
import { relativoHoy } from '../src/datos/academico/fechasCampus';
import { cancelarEvento, crearEvento, editarEvento, eventosDePersona, matriculadosDePrograma, validarEvento, type DatosEventoCalendario } from '../src/servicios/calendario';
import { guardarConfiguracion } from '../src/servicios/configuracionErick';
import { asignarDocente, crearDocente, programasDeDocente, puedeGestionarPrograma, retirarDocente } from '../src/servicios/docentes';
import { useAcademicoStore } from '../src/store/useAcademicoStore';
import { useBitacoraStore } from '../src/store/useBitacoraStore';
import { useCampusStore } from '../src/store/useCampusStore';
import { useErickStore } from '../src/store/useErickStore';
import { useNotificacionesStore } from '../src/store/useNotificacionesStore';
import { actualizarVideoTema, origenVideo } from '../src/servicios/contenidosDocente';
import { agregarObservacion, construirLibreta, otorgarIntentoDocente } from '../src/servicios/notasDocente';
import { validarArchivoVideo } from '../src/servicios/videosLocales';
import { resumirPrograma } from '../src/motores/academico/progreso';
import { usePersonasStore } from '../src/store/usePersonasStore';

let total = 0;
function prueba(nombre: string, cuerpo: () => void): void {
  cuerpo();
  total += 1;
  console.log(`OK  ${nombre}`);
}

const tabla = crearPermisosIniciales();

prueba('E1 el administrador educativo tiene todo ERICK y el inicio en /erick', () => {
  modulosErick.forEach((modulo) => assert.deepEqual(tabla.admin_educativo[modulo], ['consultar', 'crear', 'editar', 'aprobar', 'liquidar', 'exportar', 'auditar']));
  assert.equal(tabla.admin_educativo.bonos.length, 0);
  assert.equal(tabla.admin_educativo.liquidaciones.length, 0);
  assert.equal(rutaInicioPorPerfil('admin_educativo'), '/erick/resumen');
  assert.equal(nombresPerfiles.admin_educativo, 'Administrador educativo');
});

prueba('E1 el MLM solo consulta lo académico y no ve los módulos nuevos de ERICK', () => {
  (['superadministrador', 'operador'] as const).forEach((perfil) => {
    (['academico', 'matriculas', 'certificados'] as const).forEach((modulo) => assert.deepEqual(tabla[perfil][modulo], ['consultar']));
    (['calendario', 'docentes', 'contenidos', 'configuracion_erick'] as const).forEach((modulo) => assert.equal(tabla[perfil][modulo].length, 0));
  });
  assert.ok(tabla.superadministrador.bonos.includes('liquidar'));
});

prueba('E1 el docente consulta, califica, edita contenidos y agenda fechas', () => {
  assert.deepEqual(tabla.evaluador.academico, ['consultar', 'aprobar']);
  assert.deepEqual(tabla.evaluador.contenidos, ['consultar', 'editar']);
  assert.deepEqual(tabla.evaluador.calendario, ['consultar', 'crear', 'editar']);
  assert.equal(nombresPerfiles.evaluador, 'Docente evaluador');
});

prueba('E1 personal ERICK y datos ampliados', () => {
  assert.equal(personasIniciales.find((persona) => persona.id === 'DEMO-U04')?.perfil, 'admin_educativo');
  assert.equal(personasIniciales.find((persona) => persona.id === 'DEMO-U05')?.perfil, 'evaluador');
  assert.equal(new Set(personasIniciales.map((persona) => persona.id)).size, personasIniciales.length);
  const nuevas = personasIniciales.filter((persona) => /^DEMO-(U0[45]|L(0[89]|[1-4]\d))$/.test(persona.id));
  assert.ok(nuevas.every((persona) => personasIniciales.filter((otra) => otra.documento === persona.documento).length === 1));
  assert.ok(personasIniciales.filter((persona) => persona.tipo === 'alumno').length >= 45);
  assert.ok(matriculasIniciales.length >= 70);
  assert.ok(membresiasIniciales.length >= 11);
  assert.ok(matriculasIniciales.filter((matricula) => matricula.origen === 'membresia').every((matricula) => membresiasIniciales.some((membresia) => membresia.id === matricula.membresiaId && membresia.vencimiento === matricula.vencimiento)));
});

const erick = () => useErickStore.getState();
const programasActuales = () => useAcademicoStore.getState().programas;

prueba('E2 asignaciones: el diplomado habilita sus cursos y su MID; filtro estricto por docente', () => {
  assert.deepEqual(programasDeDocente('DEMO-U03', erick().asignacionesDocentes, programasActuales()).sort(), ['DEMO-CUR-01', 'DEMO-CUR-02', 'DEMO-DIP-01', 'DEMO-MID-01']);
  assert.deepEqual(programasDeDocente('DEMO-U05', erick().asignacionesDocentes, programasActuales()), ['DEMO-CUR-03']);
  assert.deepEqual(programasDeDocente('DEMO-U06', erick().asignacionesDocentes, programasActuales()), ['DEMO-CUR-01']);
  assert.equal(puedeGestionarPrograma('DEMO-U05', 'DEMO-CUR-01'), false);
  assert.equal(puedeGestionarPrograma('DEMO-U04', 'DEMO-CUR-01'), true);
  assert.equal(puedeGestionarPrograma('DEMO-L01', 'DEMO-CUR-01'), false);
});

prueba('E2 asignar, duplicar, retirar y registrar docentes', () => {
  const asignada = asignarDocente('DEMO-U05', 'DEMO-CUR-01', 'DEMO-U04');
  assert.ok(asignada.ok);
  assert.equal(puedeGestionarPrograma('DEMO-U05', 'DEMO-CUR-01'), true);
  assert.equal(asignarDocente('DEMO-U05', 'DEMO-CUR-01', 'DEMO-U04').ok, false);
  assert.equal(asignarDocente('DEMO-L01', 'DEMO-CUR-01', 'DEMO-U04').ok, false);
  assert.equal(retirarDocente(asignada.ok ? asignada.valor.id : '', 'DEMO-U04', 'corto').ok, false);
  assert.ok(retirarDocente(asignada.ok ? asignada.valor.id : '', 'DEMO-U04', 'Fin del reemplazo temporal').ok);
  assert.equal(puedeGestionarPrograma('DEMO-U05', 'DEMO-CUR-01'), false);
  const nuevo = crearDocente({ nombres: 'Lucía', apellidos: 'Prueba Demo', correo: 'lucia.prueba@correo.demo', telefono: '' }, 'DEMO-U04');
  assert.ok(nuevo.ok);
  assert.equal(nuevo.ok && nuevo.valor.perfil, 'evaluador');
  assert.equal(crearDocente({ nombres: 'Otra', apellidos: 'Persona', correo: 'lucia.prueba@correo.demo', telefono: '' }, 'DEMO-U04').ok, false);
});

const base = (programaId: string): DatosEventoCalendario => ({ programaId, tipo: 'examen_final', titulo: 'Examen final de prueba', descripcion: 'Prueba', fecha: relativoHoy(5), horaInicio: '10:00', horaFin: '11:00', enlace: null });

prueba('E2 calendario: validaciones, permisos por programa y avisos a matriculados', () => {
  assert.match(validarEvento({ ...base('DEMO-CUR-01'), titulo: 'Ex' }, relativoHoy(0), true) ?? '', /título/);
  assert.match(validarEvento({ ...base('DEMO-CUR-01'), fecha: relativoHoy(-1) }, relativoHoy(0), true) ?? '', /hoy o posterior/);
  assert.match(validarEvento({ ...base('DEMO-CUR-01'), horaFin: '09:00' }, relativoHoy(0), true) ?? '', /posterior/);
  assert.match(validarEvento({ ...base('DEMO-CUR-01'), enlace: 'http://x' }, relativoHoy(0), true) ?? '', /https/);
  assert.equal(crearEvento(base('DEMO-CUR-01'), 'DEMO-U05').ok, false);
  const destinatarios = matriculadosDePrograma('DEMO-CUR-01', useCampusStore.getState().matriculas, programasActuales());
  assert.ok(destinatarios.includes('DEMO-L01') && destinatarios.includes('DEMO-L12'));
  const antes = useNotificacionesStore.getState().notificaciones.length;
  const creado = crearEvento(base('DEMO-CUR-01'), 'DEMO-U03');
  assert.ok(creado.ok, creado.ok ? '' : creado.error);
  assert.equal(creado.ok && creado.valor.avisados, destinatarios.length);
  assert.equal(useNotificacionesStore.getState().notificaciones.length - antes, destinatarios.length);
  const id = creado.ok ? creado.valor.evento.id : '';
  assert.ok(eventosDePersona('DEMO-L12').some((evento) => evento.id === id));
  assert.equal(eventosDePersona('DEMO-L25').some((evento) => evento.id === id), false);
  assert.ok(editarEvento(id, { ...base('DEMO-CUR-01'), fecha: relativoHoy(6) }, 'DEMO-U03').ok);
  assert.equal(cancelarEvento(id, 'DEMO-U03', 'no').ok, false);
  assert.ok(cancelarEvento(id, 'DEMO-U03', 'Se reprograma por feriado nacional').ok);
  assert.equal(erick().eventosCalendario.find((evento) => evento.id === id)?.estado, 'cancelado');
});

prueba('E2 agenda del estudiante incluye su sustentación MID asignada', () => {
  const agenda = eventosDePersona('DEMO-L12');
  assert.ok(agenda.some((evento) => evento.tipo === 'sustentacion' && evento.virtual));
  assert.ok(agenda.some((evento) => evento.programaId === 'DEMO-CUR-01' && evento.tipo === 'examen_final'));
});

prueba('E2 configuración: validación, guardado y bitácora', () => {
  const actual = erick().configuracion;
  assert.equal(guardarConfiguracion({ ...actual, ruc: '12' }, 'DEMO-U04').ok, false);
  assert.equal(guardarConfiguracion(actual, 'DEMO-U04').ok, false);
  const antes = useBitacoraStore.getState().registros.length;
  assert.ok(guardarConfiguracion({ ...actual, mesesAccesoPorDefecto: 9 }, 'DEMO-U04').ok);
  assert.equal(erick().configuracion.mesesAccesoPorDefecto, 9);
  assert.equal(useBitacoraStore.getState().registros.length, antes + 1);
});

prueba('E2 datos precargados abundantes', () => {
  assert.ok(erick().eventosCalendario.length >= 16);
  assert.ok(erick().asignacionesDocentes.length >= 9);
  assert.ok(erick().observacionesDocentes.length >= 8);
  assert.ok(useBitacoraStore.getState().registros.filter((registro) => ['docentes', 'calendario', 'configuracion_erick'].includes(registro.modulo)).length >= 8);
});

const estructura = () => ({ programas: useAcademicoStore.getState().programas, modulos: useAcademicoStore.getState().modulos });
const registroCampus = () => { const { matriculas, progreso, intentos } = useCampusStore.getState(); return { matriculas, progreso, intentos }; };
const libretaDe = (programaId: string) => construirLibreta(programaId, usePersonasStore.getState().personas, estructura(), registroCampus());

prueba('E3 la libreta del docente coincide con resumirPrograma (L12 y L17)', () => {
  ['DEMO-L12', 'DEMO-L17'].forEach((personaId) => {
    const programaIds = useCampusStore.getState().matriculas.filter((item) => item.personaId === personaId).map((item) => item.programaId)
      .filter((id) => programasActuales().find((programa) => programa.id === id)?.tipo !== 'mid');
    assert.ok(programaIds.length > 0, personaId);
    programaIds.forEach((programaId) => {
      const fila = libretaDe(programaId).filas.find((item) => item.persona.id === personaId);
      const resumen = resumirPrograma(personaId, programaId, estructura(), registroCampus());
      assert.ok(fila && resumen, `${personaId} ${programaId}`);
      assert.equal(fila.nota, resumen.nota.nota);
      assert.equal(fila.estado, resumen.nota.estado);
      assert.equal(fila.avance, resumen.avance);
    });
  });
  assert.ok(libretaDe('DEMO-CUR-01').columnas.length >= 2);
  assert.equal(libretaDe('DEMO-DIP-01').columnas.length, programasActuales().find((programa) => programa.id === 'DEMO-DIP-01')?.cursoIds.length);
});

prueba('E3 validación de archivos de video (formato y tamaño)', () => {
  assert.equal(validarArchivoVideo({ type: 'video/mp4', size: 10 * 1024 * 1024 }), null);
  assert.equal(validarArchivoVideo({ type: 'video/webm', size: 300 * 1024 * 1024 }), null);
  assert.match(validarArchivoVideo({ type: 'video/quicktime', size: 1000 }) ?? '', /MP4 o WEBM/);
  assert.match(validarArchivoVideo({ type: 'video/mp4', size: 301 * 1024 * 1024 }) ?? '', /300 MB/);
  assert.match(validarArchivoVideo({ type: 'video/mp4', size: 0 }) ?? '', /vacío/);
});

prueba('E3 el docente cambia el video de sus temas; el archivo tiene prioridad sobre YouTube', () => {
  const modulo = useAcademicoStore.getState().modulos.find((item) => item.programaId === 'DEMO-CUR-01');
  const temaId = modulo?.temaIds[0] ?? '';
  assert.equal(actualizarVideoTema(temaId, { urlVideo: 'https://ejemplo.com/video' }, 'DEMO-U03').ok, false);
  const conEnlace = actualizarVideoTema(temaId, { urlVideo: 'https://youtu.be/abcdefghijk' }, 'DEMO-U03');
  assert.ok(conEnlace.ok);
  assert.equal(conEnlace.ok && origenVideo(conEnlace.valor.video), 'youtube');
  const conArchivo = actualizarVideoTema(temaId, { archivoVideoId: 'VID-PRUEBA', nombreArchivo: 'clase.mp4' }, 'DEMO-U03');
  assert.equal(conArchivo.ok && origenVideo(conArchivo.valor.video), 'archivo');
  const sinArchivo = actualizarVideoTema(temaId, { archivoVideoId: null }, 'DEMO-U03');
  assert.equal(sinArchivo.ok && origenVideo(sinArchivo.valor.video), 'youtube');
  assert.ok(useBitacoraStore.getState().registros.some((registro) => registro.modulo === 'contenidos' && registro.referenciaId === temaId));
});

prueba('E3 DEMO-U05 no puede ver ni gestionar DEMO-CUR-01', () => {
  assert.ok(!programasDeDocente('DEMO-U05', erick().asignacionesDocentes, programasActuales()).includes('DEMO-CUR-01'));
  const temaId = useAcademicoStore.getState().modulos.find((item) => item.programaId === 'DEMO-CUR-01')?.temaIds[0] ?? '';
  assert.equal(actualizarVideoTema(temaId, { urlVideo: 'https://youtu.be/abcdefghijk' }, 'DEMO-U05').ok, false);
  assert.equal(agregarObservacion('DEMO-U05', 'DEMO-L12', 'DEMO-CUR-01', 'Observación no autorizada de prueba').ok, false);
  const matricula = useCampusStore.getState().matriculas.find((item) => item.programaId === 'DEMO-CUR-01');
  assert.equal(otorgarIntentoDocente('DEMO-U05', 'DEMO-CUR-01', matricula?.id ?? '', temaId, 1, 'Motivo suficientemente largo').ok, false);
});

prueba('E3 el intento extra y la observación no cambian la nota automática', () => {
  const fila = libretaDe('DEMO-CUR-01').filas.find((item) => item.matricula && item.persona.id === 'DEMO-L12') ?? libretaDe('DEMO-CUR-01').filas.find((item) => item.matricula);
  assert.ok(fila?.matricula);
  const elemento = fila.bloqueados[0] ?? useAcademicoStore.getState().modulos.find((item) => item.programaId === 'DEMO-CUR-01')?.temaIds[0] ?? '';
  const antes = resumirPrograma(fila.persona.id, 'DEMO-CUR-01', estructura(), registroCampus());
  assert.equal(otorgarIntentoDocente('DEMO-U03', 'DEMO-CUR-01', fila.matricula.id, elemento, 1, 'corto').ok, false);
  assert.ok(otorgarIntentoDocente('DEMO-U03', 'DEMO-CUR-01', fila.matricula.id, elemento, 1, 'Reprogramación por problemas de conexión').ok);
  const observacion = agregarObservacion('DEMO-U03', fila.persona.id, 'DEMO-CUR-01', 'Buen avance en el módulo, reforzar el caso práctico.');
  assert.ok(observacion.ok);
  assert.equal(agregarObservacion('DEMO-U03', fila.persona.id, 'DEMO-CUR-01', 'corta').ok, false);
  const despues = resumirPrograma(fila.persona.id, 'DEMO-CUR-01', estructura(), registroCampus());
  assert.equal(despues?.nota.nota, antes?.nota.nota);
  assert.ok((useCampusStore.getState().matriculas.find((item) => item.id === fila.matricula?.id)?.intentosExtra[elemento] ?? 0) >= 1);
  assert.equal(rutaInicioPorPerfil('evaluador'), '/docente/cursos');
});

console.log(`\n${total} pruebas de ERICK superadas`);
