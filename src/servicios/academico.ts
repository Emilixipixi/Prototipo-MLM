import { reglasPorDefecto } from '../datos/academico/programas';
import { HORAS_TEMA, HORAS_TIM } from '../motores/academico/notas';
import { useAcademicoStore } from '../store/useAcademicoStore';
import { useCampusStore } from '../store/useCampusStore';
import type { EstadoPrograma, Modulo, Pregunta, Programa, ReglasPrograma, Tema, Tim, TipoPrograma } from '../tipos/academico';
import { exito, fallo, type Resultado } from '../validaciones/resultado';
import { transicionesPrograma, validarTransicion } from '../validaciones/transiciones';
import { fechaActualLocal } from './eventosLms';
import { registrarBitacora } from './registro';
import { idYoutube } from '../utilidades/youtube';

const coloresNuevos: Array<[string, string]> = [['#7C2D12', '#EA580C'], ['#4C1D95', '#8B5CF6'], ['#064E3B', '#10B981'], ['#1E293B', '#64748B']];

function siguiente(prefijo: string, ids: string[], digitos: number): string {
  const numeros = ids.filter((id) => id.startsWith(prefijo)).map((id) => Number(id.slice(prefijo.length))).filter((numero) => !Number.isNaN(numero));
  return `${prefijo}${String(Math.max(0, ...numeros) + 1).padStart(digitos, '0')}`;
}

export function validarPrograma(programa: Programa, datos = useAcademicoStore.getState()): string[] {
  const errores: string[] = [];
  if (programa.nombre.trim().length < 5) errores.push('El nombre debe tener al menos 5 caracteres.');
  if (programa.tipo === 'curso') {
    if (programa.moduloIds.length !== 3) errores.push(`Un curso de 60 h requiere 3 módulos; tiene ${programa.moduloIds.length}.`);
    let horas = 0;
    programa.moduloIds.forEach((moduloId, indice) => {
      const modulo = datos.modulos.find((item) => item.id === moduloId);
      if (!modulo) { errores.push(`Módulo ${indice + 1} no encontrado.`); return; }
      const horasModulo = modulo.temaIds.length * HORAS_TEMA + HORAS_TIM;
      horas += horasModulo;
      if (modulo.temaIds.length !== 5) errores.push(`Módulo ${indice + 1} "${modulo.nombre}": requiere 5 temas de 3 h y tiene ${modulo.temaIds.length} (${horasModulo} h en lugar de 20 h).`);
      modulo.temaIds.forEach((temaId) => {
        const tema = datos.temas.find((item) => item.id === temaId);
        const banco = datos.preguntas.filter((pregunta) => pregunta.ambitoId === temaId && pregunta.activa).length;
        if (!tema) errores.push(`Tema ${temaId} no encontrado.`);
        else if (banco < programa.reglas.preguntasPorEvaluacion) errores.push(`Tema "${tema.nombre}": tiene ${banco} preguntas activas y la evaluación usa ${programa.reglas.preguntasPorEvaluacion}.`);
      });
      const tim = datos.tims.find((item) => item.id === modulo.timId);
      if (!tim || tim.preguntaIds.filter((id) => datos.preguntas.some((pregunta) => pregunta.id === id && pregunta.activa)).length === 0) errores.push(`Módulo ${indice + 1}: el TIM no tiene ítems activos.`);
    });
    if (horas !== 60) errores.push(`La suma de horas es ${horas} h; un curso debe sumar 60 h.`);
  }
  if (programa.tipo === 'diplomado') {
    const cursos = programa.cursoIds.map((id) => datos.programas.find((item) => item.id === id));
    if (cursos.length !== 2) errores.push(`Un diplomado de 120 h requiere 2 cursos; tiene ${cursos.length}.`);
    if (cursos.some((curso) => !curso || curso.tipo !== 'curso' || curso.estado !== 'publicado')) errores.push('Los cursos del diplomado deben existir y estar publicados.');
    const horas = cursos.reduce((suma, curso) => suma + (curso?.horas ?? 0), 0);
    if (horas !== 120) errores.push(`La suma de horas es ${horas} h; un diplomado debe sumar 120 h.`);
  }
  if (programa.tipo === 'mid' && programa.horas !== 20) errores.push('El MID debe tener 20 h.');
  return errores;
}

export function validarReglas(reglas: ReglasPrograma): string | null {
  if (reglas.intentosMaximos < 1 || reglas.intentosMaximos > 10) return 'Los intentos deben estar entre 1 y 10.';
  if (reglas.minutosEvaluacion < 5 || reglas.minutosEvaluacion > 180) return 'El tiempo de evaluación debe estar entre 5 y 180 minutos.';
  if (reglas.preguntasPorEvaluacion < 1 || reglas.preguntasPorEvaluacion > 8) return 'Las preguntas por evaluación deben estar entre 1 y 8.';
  if (reglas.esperaMinutos < 0 || reglas.esperaMinutos > 1440) return 'La espera debe estar entre 0 y 1440 minutos.';
  if (![1, 2, 3, 6, 9, 12].includes(reglas.mesesAcceso)) return 'El acceso debe ser de 1, 2, 3, 6, 9 o 12 meses.';
  return null;
}

function temaVacio(id: string, moduloId: string, orden: number): Tema {
  return {
    id, moduloId, orden, nombre: `Tema ${orden}`, horas: HORAS_TEMA, objetivos: ['Objetivo por definir.'],
    video: { titulo: `Videoclase: Tema ${orden}`, minutos: 30 },
    lectura: { titulo: `Lectura: Tema ${orden}`, contenido: 'Contenido de lectura por cargar.', minutos: 60, descargable: true },
    caso: { enunciado: 'Caso práctico por definir.', ejercicios: [{ pregunta: 'Ejercicio por definir.', respuestaGuia: 'Respuesta guía por definir.' }], minutos: 60 },
    evaluacionMinutos: 30,
  };
}

export interface DatosNuevoPrograma {
  tipo: Exclude<TipoPrograma, 'mid'>; nombre: string; descripcion: string; productoId: string | null;
  incluidoEnMembresia: boolean; plantillaId: string | null; cursoIds: string[];
}

export function crearPrograma(datos: DatosNuevoPrograma, actorId: string): Resultado<Programa> {
  if (datos.nombre.trim().length < 5) return fallo('El nombre debe tener al menos 5 caracteres.');
  const estado = useAcademicoStore.getState();
  const id = siguiente(datos.tipo === 'curso' ? 'DEMO-CUR-' : 'DEMO-DIP-', estado.programas.map((item) => item.id), 2);
  const base: Programa = {
    id, codigo: id, tipo: datos.tipo, nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim(), horas: datos.tipo === 'curso' ? 60 : 120,
    modalidad: 'Virtual asincrónica', estado: 'borrador', productoId: datos.productoId, cursoIds: datos.tipo === 'diplomado' ? datos.cursoIds : [],
    moduloIds: [], midId: null, incluidoEnMembresia: datos.incluidoEnMembresia, reglas: { ...reglasPorDefecto },
    colores: coloresNuevos[estado.programas.length % coloresNuevos.length], creadoPor: actorId, fecha: fechaActualLocal().slice(0, 10),
  };
  if (datos.tipo === 'diplomado') {
    useAcademicoStore.getState().actualizar({ programas: [...estado.programas, base] });
    registrarBitacora({ actorId, accion: 'Programa creado', modulo: 'academico', referenciaId: id, despues: { tipo: datos.tipo, nombre: base.nombre } });
    return exito(base);
  }
  const plantilla = datos.plantillaId ? estado.programas.find((item) => item.id === datos.plantillaId && item.tipo === 'curso') : undefined;
  const modulos: Modulo[] = [];
  const temas: Tema[] = [];
  const tims: Tim[] = [];
  const preguntas: Pregunta[] = [];
  const ids = { modulos: estado.modulos.map((item) => item.id), temas: estado.temas.map((item) => item.id), tims: estado.tims.map((item) => item.id), preguntas: estado.preguntas.map((item) => item.id) };
  for (let numero = 0; numero < 3; numero += 1) {
    const origen = plantilla ? estado.modulos.find((item) => item.id === plantilla.moduloIds[numero]) : undefined;
    const moduloId = siguiente('DEMO-MOD-', ids.modulos, 2);
    ids.modulos.push(moduloId);
    const timId = siguiente('DEMO-TIM-', ids.tims, 2);
    ids.tims.push(timId);
    const temaIds: string[] = [];
    for (let orden = 1; orden <= 5; orden += 1) {
      const temaId = siguiente('DEMO-TEM-', ids.temas, 3);
      ids.temas.push(temaId);
      temaIds.push(temaId);
      const temaOrigen = origen ? estado.temas.find((item) => item.id === origen.temaIds[orden - 1]) : undefined;
      temas.push(temaOrigen ? { ...structuredClone(temaOrigen), id: temaId, moduloId } : temaVacio(temaId, moduloId, orden));
      if (temaOrigen) {
        estado.preguntas.filter((pregunta) => pregunta.ambitoId === temaOrigen.id).forEach((pregunta) => {
          const preguntaId = siguiente('DEMO-PRE-N', ids.preguntas, 4);
          ids.preguntas.push(preguntaId);
          preguntas.push({ ...structuredClone(pregunta), id: preguntaId, ambitoId: temaId });
        });
      }
    }
    const timOrigen = origen ? estado.tims.find((item) => item.id === origen.timId) : undefined;
    const preguntaIdsTim: string[] = [];
    timOrigen?.preguntaIds.forEach((preguntaOrigenId) => {
      const pregunta = estado.preguntas.find((item) => item.id === preguntaOrigenId);
      if (!pregunta) return;
      const preguntaId = siguiente('DEMO-PRE-N', ids.preguntas, 4);
      ids.preguntas.push(preguntaId);
      preguntaIdsTim.push(preguntaId);
      preguntas.push({ ...structuredClone(pregunta), id: preguntaId, ambitoId: timId });
    });
    modulos.push({ id: moduloId, programaId: id, orden: numero + 1, nombre: origen?.nombre ?? `Módulo ${numero + 1}`, horas: 20, temaIds, timId });
    tims.push({ id: timId, moduloId, nombre: timOrigen ? `TIM: ${timOrigen.nombre.replace(/^TIM \d+: /, '')}` : `TIM del módulo ${numero + 1}`, horas: HORAS_TIM, instrucciones: timOrigen?.instrucciones ?? 'Instrucciones por definir.', preguntaIds: preguntaIdsTim });
  }
  const programa: Programa = { ...base, moduloIds: modulos.map((item) => item.id), reglas: plantilla ? { ...plantilla.reglas } : base.reglas };
  useAcademicoStore.getState().actualizar({
    programas: [...estado.programas, programa], modulos: [...estado.modulos, ...modulos], temas: [...estado.temas, ...temas],
    tims: [...estado.tims, ...tims], preguntas: [...estado.preguntas, ...preguntas],
  });
  registrarBitacora({ actorId, accion: 'Programa creado', modulo: 'academico', referenciaId: id, despues: { tipo: datos.tipo, nombre: programa.nombre, plantilla: plantilla?.id ?? null } });
  return exito(programa);
}

function actualizarPrograma(id: string, cambios: Partial<Programa>): void {
  const { programas, actualizar } = useAcademicoStore.getState();
  actualizar({ programas: programas.map((item) => (item.id === id ? { ...item, ...cambios } : item)) });
}

export function cambiarEstadoPrograma(id: string, hacia: EstadoPrograma, actorId: string): Resultado<Programa> {
  const programa = useAcademicoStore.getState().programas.find((item) => item.id === id);
  if (!programa) return fallo('Programa no encontrado.');
  const error = validarTransicion(transicionesPrograma, programa.estado, hacia, 'el programa');
  if (error) return fallo(error);
  if (hacia === 'publicado') {
    const errores = validarPrograma(programa);
    if (errores.length) return fallo(`No se puede publicar: ${errores[0]}`);
  }
  if (programa.estado === 'publicado' && hacia === 'borrador' && useCampusStore.getState().matriculas.some((matricula) => matricula.programaId === id)) {
    return fallo('El programa tiene matrículas: no puede volver a borrador. Puedes archivarlo.');
  }
  actualizarPrograma(id, { estado: hacia });
  registrarBitacora({ actorId, accion: 'Cambio de estado de programa', modulo: 'academico', referenciaId: id, antes: programa.estado, despues: hacia });
  return exito({ ...programa, estado: hacia });
}

export function guardarDatosPrograma(id: string, cambios: Pick<Programa, 'nombre' | 'descripcion' | 'incluidoEnMembresia' | 'productoId'>, actorId: string): Resultado<null> {
  if (cambios.nombre.trim().length < 5) return fallo('El nombre debe tener al menos 5 caracteres.');
  const programa = useAcademicoStore.getState().programas.find((item) => item.id === id);
  if (!programa) return fallo('Programa no encontrado.');
  actualizarPrograma(id, { ...cambios, nombre: cambios.nombre.trim(), descripcion: cambios.descripcion.trim() });
  registrarBitacora({ actorId, accion: 'Datos de programa actualizados', modulo: 'academico', referenciaId: id, antes: { nombre: programa.nombre }, despues: { nombre: cambios.nombre.trim() } });
  return exito(null);
}

export function guardarReglas(id: string, reglas: ReglasPrograma, actorId: string): Resultado<null> {
  const error = validarReglas(reglas);
  if (error) return fallo(error);
  const programa = useAcademicoStore.getState().programas.find((item) => item.id === id);
  if (!programa) return fallo('Programa no encontrado.');
  actualizarPrograma(id, { reglas });
  registrarBitacora({ actorId, accion: 'Reglas de aprobación actualizadas', modulo: 'academico', referenciaId: id, antes: programa.reglas, despues: reglas });
  return exito(null);
}

export function guardarModulo(moduloId: string, nombre: string, actorId: string): Resultado<null> {
  if (nombre.trim().length < 3) return fallo('El nombre del módulo es obligatorio.');
  const { modulos, actualizar } = useAcademicoStore.getState();
  actualizar({ modulos: modulos.map((item) => (item.id === moduloId ? { ...item, nombre: nombre.trim() } : item)) });
  registrarBitacora({ actorId, accion: 'Módulo actualizado', modulo: 'academico', referenciaId: moduloId, despues: { nombre: nombre.trim() } });
  return exito(null);
}

export function guardarTema(tema: Tema, actorId: string): Resultado<null> {
  if (tema.nombre.trim().length < 3) return fallo('El nombre del tema es obligatorio.');
  if (tema.video.minutos < 1 || tema.video.minutos > 120) return fallo('La duración del video debe estar entre 1 y 120 minutos.');
  if (tema.video.urlVideo?.trim() && !idYoutube(tema.video.urlVideo)) return fallo('El enlace del video debe ser de YouTube (youtube.com/watch?v=..., youtu.be/... o youtube.com/shorts/...).');
  if (tema.lectura.contenido.trim().length < 20) return fallo('La lectura debe tener contenido.');
  const { temas, actualizar } = useAcademicoStore.getState();
  const limpio = { ...tema, objetivos: tema.objetivos.map((objetivo) => objetivo.trim()).filter(Boolean) };
  actualizar({ temas: temas.map((item) => (item.id === tema.id ? limpio : item)) });
  registrarBitacora({ actorId, accion: 'Contenido de tema actualizado', modulo: 'academico', referenciaId: tema.id, despues: { nombre: tema.nombre } });
  return exito(null);
}

function programaDeModulo(moduloId: string): Programa | undefined {
  const { modulos, programas } = useAcademicoStore.getState();
  const modulo = modulos.find((item) => item.id === moduloId);
  return programas.find((item) => item.id === modulo?.programaId);
}

export function agregarTema(moduloId: string, actorId: string): Resultado<Tema> {
  const programa = programaDeModulo(moduloId);
  if (!programa) return fallo('Módulo no encontrado.');
  if (programa.estado !== 'borrador') return fallo('La estructura solo se modifica con el programa en borrador.');
  const { modulos, temas, actualizar } = useAcademicoStore.getState();
  const modulo = modulos.find((item) => item.id === moduloId);
  if (!modulo) return fallo('Módulo no encontrado.');
  const tema = temaVacio(siguiente('DEMO-TEM-', temas.map((item) => item.id), 3), moduloId, modulo.temaIds.length + 1);
  actualizar({ temas: [...temas, tema], modulos: modulos.map((item) => (item.id === moduloId ? { ...item, temaIds: [...item.temaIds, tema.id], horas: (item.temaIds.length + 1) * HORAS_TEMA + HORAS_TIM } : item)) });
  registrarBitacora({ actorId, accion: 'Tema agregado', modulo: 'academico', referenciaId: tema.id, despues: { modulo: moduloId } });
  return exito(tema);
}

export function quitarTema(moduloId: string, temaId: string, actorId: string): Resultado<null> {
  const programa = programaDeModulo(moduloId);
  if (!programa) return fallo('Módulo no encontrado.');
  if (programa.estado !== 'borrador') return fallo('La estructura solo se modifica con el programa en borrador.');
  const { modulos, actualizar } = useAcademicoStore.getState();
  actualizar({ modulos: modulos.map((item) => (item.id === moduloId ? { ...item, temaIds: item.temaIds.filter((id) => id !== temaId), horas: (item.temaIds.length - 1) * HORAS_TEMA + HORAS_TIM } : item)) });
  registrarBitacora({ actorId, accion: 'Tema retirado de la estructura', modulo: 'academico', referenciaId: temaId, despues: { modulo: moduloId } });
  return exito(null);
}

export function validarPregunta(pregunta: Pregunta): string | null {
  if (pregunta.enunciado.trim().length < 8) return 'El enunciado debe tener al menos 8 caracteres.';
  switch (pregunta.tipo) {
    case 'opcion_multiple':
      if (pregunta.opciones.filter((opcion) => opcion.trim()).length < 2) return 'Ingresa al menos 2 opciones.';
      if (pregunta.correctas.length !== 1) return 'Marca una sola opción correcta.';
      return null;
    case 'seleccion_multiple':
      if (pregunta.opciones.filter((opcion) => opcion.trim()).length < 3) return 'Ingresa al menos 3 opciones.';
      if (pregunta.correctas.length < 1) return 'Marca al menos una opción correcta.';
      return null;
    case 'verdadero_falso':
      return pregunta.correctas.length === 1 ? null : 'Indica si es verdadero o falso.';
    case 'emparejar':
      return (pregunta.pares?.length ?? 0) >= 2 ? null : 'Ingresa al menos 2 pares.';
    case 'ordenar':
      return (pregunta.orden?.length ?? 0) >= 2 ? null : 'Ingresa al menos 2 pasos.';
    case 'numerica':
      return Number.isFinite(pregunta.valorNumerico) && (pregunta.tolerancia ?? 0) >= 0 ? null : 'Indica el valor correcto y la tolerancia.';
    default:
      return 'Tipo de pregunta no válido.';
  }
}

export function guardarPregunta(pregunta: Pregunta, actorId: string): Resultado<Pregunta> {
  const error = validarPregunta(pregunta);
  if (error) return fallo(error);
  const { preguntas, tims, actualizar } = useAcademicoStore.getState();
  const existente = preguntas.some((item) => item.id === pregunta.id);
  const final = existente ? pregunta : { ...pregunta, id: siguiente('DEMO-PRE-N', preguntas.map((item) => item.id), 4) };
  actualizar({
    preguntas: existente ? preguntas.map((item) => (item.id === final.id ? final : item)) : [...preguntas, final],
    tims: !existente && final.ambito === 'tim' ? tims.map((tim) => (tim.id === final.ambitoId ? { ...tim, preguntaIds: [...tim.preguntaIds, final.id] } : tim)) : tims,
  });
  registrarBitacora({ actorId, accion: existente ? 'Pregunta actualizada' : 'Pregunta creada', modulo: 'academico', referenciaId: final.id, despues: { tipo: final.tipo, ambito: final.ambitoId } });
  return exito(final);
}

export function alternarPregunta(id: string, actorId: string): Resultado<boolean> {
  const { preguntas, actualizar } = useAcademicoStore.getState();
  const pregunta = preguntas.find((item) => item.id === id);
  if (!pregunta) return fallo('Pregunta no encontrada.');
  actualizar({ preguntas: preguntas.map((item) => (item.id === id ? { ...item, activa: !item.activa } : item)) });
  registrarBitacora({ actorId, accion: pregunta.activa ? 'Pregunta desactivada' : 'Pregunta activada', modulo: 'academico', referenciaId: id });
  return exito(!pregunta.activa);
}

export function alternarPlan(id: string, actorId: string): Resultado<boolean> {
  const { planes, actualizar } = useAcademicoStore.getState();
  const plan = planes.find((item) => item.id === id);
  if (!plan) return fallo('Plan no encontrado.');
  actualizar({ planes: planes.map((item) => (item.id === id ? { ...item, activo: !item.activo } : item)) });
  registrarBitacora({ actorId, accion: plan.activo ? 'Plan de membresía desactivado' : 'Plan de membresía activado', modulo: 'matriculas', referenciaId: id });
  return exito(!plan.activo);
}

export type DireccionOrden = 'subir' | 'bajar';

function intercambiar<T>(lista: T[], indice: number, direccion: DireccionOrden): T[] | null {
  const destino = direccion === 'subir' ? indice - 1 : indice + 1;
  if (indice < 0 || destino < 0 || destino >= lista.length) return null;
  const copia = [...lista];
  [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
  return copia;
}

export function moverTema(moduloId: string, temaId: string, direccion: DireccionOrden, actorId: string): Resultado<string[]> {
  const programa = programaDeModulo(moduloId);
  if (!programa) return fallo('Módulo no encontrado.');
  if (programa.estado !== 'borrador') return fallo('La estructura solo se modifica con el programa en borrador.');
  const { modulos, temas, actualizar } = useAcademicoStore.getState();
  const modulo = modulos.find((item) => item.id === moduloId);
  if (!modulo) return fallo('Módulo no encontrado.');
  const temaIds = intercambiar(modulo.temaIds, modulo.temaIds.indexOf(temaId), direccion);
  if (!temaIds) return fallo(direccion === 'subir' ? 'El tema ya es el primero del módulo.' : 'El tema ya es el último del módulo.');
  actualizar({
    modulos: modulos.map((item) => (item.id === moduloId ? { ...item, temaIds } : item)),
    temas: temas.map((item) => (temaIds.includes(item.id) ? { ...item, orden: temaIds.indexOf(item.id) + 1 } : item)),
  });
  registrarBitacora({ actorId, accion: 'Orden de temas actualizado', modulo: 'academico', referenciaId: moduloId, antes: modulo.temaIds, despues: temaIds });
  return exito(temaIds);
}

export function moverModulo(programaId: string, moduloId: string, direccion: DireccionOrden, actorId: string): Resultado<string[]> {
  const { programas, modulos, actualizar } = useAcademicoStore.getState();
  const programa = programas.find((item) => item.id === programaId);
  if (!programa) return fallo('Programa no encontrado.');
  if (programa.estado !== 'borrador') return fallo('La estructura solo se modifica con el programa en borrador.');
  const moduloIds = intercambiar(programa.moduloIds, programa.moduloIds.indexOf(moduloId), direccion);
  if (!moduloIds) return fallo(direccion === 'subir' ? 'El módulo ya es el primero del curso.' : 'El módulo ya es el último del curso.');
  actualizar({
    programas: programas.map((item) => (item.id === programaId ? { ...item, moduloIds } : item)),
    modulos: modulos.map((item) => (moduloIds.includes(item.id) ? { ...item, orden: moduloIds.indexOf(item.id) + 1 } : item)),
  });
  registrarBitacora({ actorId, accion: 'Orden de módulos actualizado', modulo: 'academico', referenciaId: programaId, antes: programa.moduloIds, despues: moduloIds });
  return exito(moduloIds);
}
