import type { Pregunta } from '../../tipos/academico';
import { mezclar } from '../../motores/academico/calificacion';
import { idTim, semillasModulos, semillasTemas } from './contenidos';
import type { SemillaTema } from './semillas';

export const opcionesVerdaderoFalso = ['Verdadero', 'Falso'];

function opcionesMezcladas(opciones: string[], correctas: number[], semilla: string): { opciones: string[]; correctas: number[] } {
  const indices = mezclar(opciones.map((_opcion, indice) => indice), semilla);
  return {
    opciones: indices.map((indice) => opciones[indice]),
    correctas: correctas.map((correcta) => indices.indexOf(correcta)).sort((a, b) => a - b),
  };
}

function multiple(id: string, ambito: Pregunta['ambito'], ambitoId: string, tema: SemillaTema, indiceIdea: number): Pregunta {
  const [concepto, definicion] = tema.ideas[indiceIdea];
  const otras = tema.ideas.filter((_idea, indice) => indice !== indiceIdea).map(([, texto]) => texto);
  return {
    id, ambito, ambitoId, tipo: 'opcion_multiple', activa: true,
    enunciado: `¿Cuál de las siguientes opciones describe mejor «${concepto}»?`,
    ...opcionesMezcladas([definicion, ...otras, tema.error], [0], id),
    explicacion: `«${concepto}»: ${definicion}`,
  };
}

function falso(id: string, ambito: Pregunta['ambito'], ambitoId: string, tema: SemillaTema): Pregunta {
  return {
    id, ambito, ambitoId, tipo: 'verdadero_falso', activa: true,
    enunciado: tema.error, opciones: opcionesVerdaderoFalso, correctas: [1],
    explicacion: `Es falso. Corresponde al error frecuente del tema «${tema.nombre}».`,
  };
}

function ordenar(id: string, ambito: Pregunta['ambito'], ambitoId: string, tema: SemillaTema): Pregunta {
  return {
    id, ambito, ambitoId, tipo: 'ordenar', activa: true,
    enunciado: `Ordena los pasos del procedimiento recomendado en el tema «${tema.nombre}».`,
    opciones: [], correctas: [], orden: [...tema.pasos],
    explicacion: `Orden correcto: ${tema.pasos.join(', ')}.`,
  };
}

function numerica(id: string, ambito: Pregunta['ambito'], ambitoId: string, tema: SemillaTema): Pregunta {
  const [enunciado, valor, tolerancia, explicacion] = tema.dato;
  return {
    id, ambito, ambitoId, tipo: 'numerica', activa: true, enunciado, opciones: [], correctas: [],
    valorNumerico: valor, tolerancia, explicacion,
  };
}

function preguntasTema(tema: SemillaTema, temaId: string): Pregunta[] {
  const prefijo = `DEMO-PRE-${temaId.slice(-3)}`;
  const [[c1, d1], [c2, d2], [c3, d3]] = tema.ideas;
  return [
    multiple(`${prefijo}-1`, 'tema', temaId, tema, 0),
    multiple(`${prefijo}-2`, 'tema', temaId, tema, 1),
    multiple(`${prefijo}-3`, 'tema', temaId, tema, 2),
    {
      id: `${prefijo}-4`, ambito: 'tema', ambitoId: temaId, tipo: 'verdadero_falso', activa: true,
      enunciado: `En el procedimiento recomendado, «${tema.pasos[0]}» se realiza antes de «${tema.pasos[3]}».`,
      opciones: opcionesVerdaderoFalso, correctas: [0],
      explicacion: `Es verdadero. Orden recomendado: ${tema.pasos.join(', ')}.`,
    },
    falso(`${prefijo}-5`, 'tema', temaId, tema),
    {
      id: `${prefijo}-6`, ambito: 'tema', ambitoId: temaId, tipo: 'seleccion_multiple', activa: true,
      enunciado: `Selecciona todas las afirmaciones correctas sobre el tema «${tema.nombre}».`,
      ...opcionesMezcladas([`«${c1}»: ${d1}`, `«${c2}»: ${d2}`, tema.error, `«${c3}»: ${d1}`], [0, 1], `${prefijo}-6`),
      explicacion: `Son correctas las definiciones de «${c1}» y «${c2}». La definición correcta de «${c3}» es: ${d3}`,
    },
    ordenar(`${prefijo}-7`, 'tema', temaId, tema),
    numerica(`${prefijo}-8`, 'tema', temaId, tema),
  ];
}

function preguntasTim(numero: number): Pregunta[] {
  const timId = idTim(numero);
  const prefijo = `DEMO-PRE-T${String(numero).padStart(2, '0')}`;
  const temas = semillasTemas.filter((item) => item.indiceModulo === numero).map((item) => item.tema);
  const [t1, t2, t3, t4, t5] = temas;
  return [
    {
      id: `${prefijo}-1`, ambito: 'tim', ambitoId: timId, tipo: 'emparejar', activa: true,
      enunciado: 'Relaciona cada concepto del módulo con su definición.', opciones: [], correctas: [],
      pares: temas.map((tema) => [tema.ideas[0][0], tema.ideas[0][1]] as [string, string]),
      explicacion: 'Cada concepto corresponde al primer concepto clave de los cinco temas del módulo.',
    },
    multiple(`${prefijo}-2`, 'tim', timId, t1, 1),
    multiple(`${prefijo}-3`, 'tim', timId, t2, 2),
    multiple(`${prefijo}-4`, 'tim', timId, t4, 1),
    falso(`${prefijo}-5`, 'tim', timId, t3),
    {
      id: `${prefijo}-6`, ambito: 'tim', ambitoId: timId, tipo: 'seleccion_multiple', activa: true,
      enunciado: 'Selecciona todas las afirmaciones correctas sobre el módulo.',
      ...opcionesMezcladas([`«${t2.ideas[0][0]}»: ${t2.ideas[0][1]}`, t3.error, `«${t5.ideas[1][0]}»: ${t5.ideas[1][1]}`, t5.error], [0, 2], `${prefijo}-6`),
      explicacion: 'Las afirmaciones restantes corresponden a errores frecuentes del módulo.',
    },
    ordenar(`${prefijo}-7`, 'tim', timId, t3),
    numerica(`${prefijo}-8`, 'tim', timId, t5),
  ];
}

export const preguntasIniciales: Pregunta[] = [
  ...semillasTemas.flatMap(({ tema, temaId }) => preguntasTema(tema, temaId)),
  ...semillasModulos.flatMap(({ numero }) => preguntasTim(numero)),
];
