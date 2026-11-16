import type { Modulo, Tema, Tim } from '../../tipos/academico';
import { HORAS_TEMA, HORAS_TIM } from '../../motores/academico/notas';
import { programasIniciales } from './programas';
import { semillasCur01, semillasCur02, semillasCur03, type SemillaModulo, type SemillaTema } from './semillas';
import { videosYoutubeIniciales } from './videosYoutube';

export interface SemillaUbicada { tema: SemillaTema; temaId: string; moduloId: string; indiceModulo: number; indiceTema: number }

export const semillasPorCurso: Array<[string, SemillaModulo[]]> = [
  ['DEMO-CUR-01', semillasCur01], ['DEMO-CUR-02', semillasCur02], ['DEMO-CUR-03', semillasCur03],
];

export const semillasModulos: Array<{ semilla: SemillaModulo; moduloId: string; programaId: string; numero: number }> = semillasPorCurso
  .flatMap(([programaId, modulos]) => modulos.map((semilla) => ({ semilla, programaId })))
  .map((item, indice) => ({ ...item, moduloId: `DEMO-MOD-${String(indice + 1).padStart(2, '0')}`, numero: indice + 1 }));

export const semillasTemas: SemillaUbicada[] = semillasModulos.flatMap(({ semilla, moduloId, numero }) =>
  semilla.temas.map((tema, indiceTema) => ({
    tema, moduloId, indiceModulo: numero, indiceTema,
    temaId: `DEMO-TEM-${String((numero - 1) * 5 + indiceTema + 1).padStart(3, '0')}`,
  })));

export function idTim(numeroModulo: number): string {
  return `DEMO-TIM-${String(numeroModulo).padStart(2, '0')}`;
}

function construirLectura(semilla: SemillaTema, modulo: string): string {
  const [[c1, d1], [c2, d2], [c3, d3]] = semilla.ideas;
  const [p1, p2, p3, p4] = semilla.pasos;
  const [enunciado, valor, , explicacion] = semilla.dato;
  return [
    `Este tema forma parte del módulo «${modulo}». Su propósito es que comprendas los conceptos de «${c1}», «${c2}» y «${c3}», y que puedas aplicarlos en situaciones reales de trabajo comercial. La lectura está pensada para unos 60 minutos de estudio e incluye conceptos, un procedimiento recomendado, un error frecuente y un ejemplo con cifras.`,
    `## ${c1}\n${d1} En la práctica, este concepto se observa en las decisiones cotidianas del equipo: cómo se organizan las actividades, cómo se comunican las prioridades y cómo se reacciona ante los resultados. Dominarlo permite actuar con criterio y no solo por costumbre.`,
    `## ${c2}\n${d2} Este concepto complementa al anterior. Cuando ambos se aplican de manera coherente, cada persona entiende qué se espera de ella y por qué, lo que reduce la improvisación y mejora la calidad de los resultados.`,
    `## ${c3}\n${d3} Conviene revisarlo con regularidad, porque las condiciones del mercado y del equipo cambian. Lo que funcionó en un período puede necesitar ajustes en el siguiente.`,
    `## Procedimiento recomendado\nPara aplicar lo aprendido, sigue estos pasos en orden: 1) ${p1}; 2) ${p2}; 3) ${p3}; 4) ${p4}. Saltarse un paso suele producir resultados parciales o difíciles de sostener en el tiempo.`,
    `## Error frecuente\nUna idea equivocada muy difundida es la siguiente: «${semilla.error}» Esta creencia es incorrecta. Lo recomendable es apoyarse en los conceptos de este tema y en el procedimiento descrito, y revisar los resultados con datos y no con suposiciones.`,
    `## Ejemplo aplicado\n${enunciado} Respuesta: ${valor}. ${explicacion} Este tipo de cálculo convierte las percepciones en datos verificables y permite tomar decisiones con evidencia.`,
    `## Ideas para recordar\n«${c1}», «${c2}» y «${c3}» son herramientas complementarias. Aplicadas con constancia y siguiendo el procedimiento recomendado, permiten mejorar el desempeño del equipo de forma medible y sostenible.`,
  ].join('\n\n');
}

function construirTema({ tema, temaId, moduloId, indiceTema }: SemillaUbicada, nombreModulo: string, numero: number): Tema {
  const [[c1, d1], [c2], [c3]] = tema.ideas;
  return {
    id: temaId, moduloId, orden: indiceTema + 1, nombre: tema.nombre, horas: HORAS_TEMA,
    objetivos: [
      `Explicar el concepto de «${c1}».`,
      `Aplicar «${c2}» y «${c3}» en situaciones de trabajo comercial.`,
      'Seguir el procedimiento recomendado y evitar los errores frecuentes.',
    ],
    video: { titulo: `Videoclase: ${tema.nombre}`, minutos: 28 + (numero % 5), ...(videosYoutubeIniciales[temaId] ? { urlVideo: videosYoutubeIniciales[temaId] } : {}) },
    lectura: { titulo: `Lectura: ${tema.nombre}`, contenido: construirLectura(tema, nombreModulo), minutos: 60, descargable: true },
    caso: {
      enunciado: `${tema.caso} A partir de esta situación, aplica lo estudiado en el tema «${tema.nombre}».`,
      ejercicios: [
        { pregunta: `¿Cómo aplicarías el concepto de «${c1}» en esta situación?`, respuestaGuia: `${d1} Aplicado al caso, el primer paso recomendado es: ${tema.pasos[0].toLowerCase()}.` },
        { pregunta: '¿Qué creencia equivocada debería evitarse y por qué?', respuestaGuia: `Debe evitarse la idea de que «${tema.error}» Es incorrecta porque contradice los conceptos del tema y no se apoya en datos.` },
        { pregunta: tema.dato[0], respuestaGuia: `Respuesta: ${tema.dato[1]}. ${tema.dato[3]}` },
      ],
      minutos: 60,
    },
    evaluacionMinutos: 30,
  };
}

export const temasIniciales: Tema[] = semillasTemas.map((ubicada, indice) => {
  const modulo = semillasModulos.find((item) => item.moduloId === ubicada.moduloId);
  return construirTema(ubicada, modulo?.semilla.nombre ?? '', indice + 1);
});

export const timsIniciales: Tim[] = semillasModulos.map(({ semilla, moduloId, numero }) => ({
  id: idTim(numero), moduloId, nombre: `TIM ${numero}: ${semilla.tim}`, horas: HORAS_TIM,
  instrucciones: `Trabajo Integrador Modular del módulo «${semilla.nombre}». Resuelve el formulario estructurado de 8 ítems que integra los cinco temas del módulo. Se califica automáticamente de 0 a 20 y se aprueba con nota mayor a 14.`,
  preguntaIds: Array.from({ length: 8 }, (_valor, indice) => `DEMO-PRE-T${String(numero).padStart(2, '0')}-${indice + 1}`),
}));

export const modulosIniciales: Modulo[] = semillasModulos.map(({ semilla, moduloId, programaId, numero }) => {
  const programa = programasIniciales.find((item) => item.id === programaId);
  return {
    id: moduloId, programaId, orden: (programa?.moduloIds.indexOf(moduloId) ?? 0) + 1, nombre: semilla.nombre,
    horas: HORAS_TEMA * semilla.temas.length + HORAS_TIM,
    temaIds: semillasTemas.filter((tema) => tema.moduloId === moduloId).map((tema) => tema.temaId),
    timId: idTim(numero),
  };
});
