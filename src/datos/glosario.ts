export type TerminoGlosario = 'vp' | 'vc' | 'runCobro' | 'runHistorico' | 'ciclo' | 'corrida' | 'liquidacion' | 'brazo' | 'remanente';

export const glosario: Record<TerminoGlosario, { termino: string; definicion: string }> = {
  vp: { termino: 'VP', definicion: 'Volumen de Puntos. Valor en puntos que genera cada producto al venderse; es independiente del precio.' },
  vc: { termino: 'VC', definicion: 'Volumen Comisionable. Base sobre la que se calculan las comisiones; es independiente del precio y del VP.' },
  runCobro: { termino: 'RUN de Cobro', definicion: 'Rango alcanzado en el período. Determina la categoría aplicable a ese ciclo y es el que se usa para liquidar.' },
  runHistorico: { termino: 'RUN Histórico', definicion: 'Máximo rango alcanzado en toda la trayectoria. Es un reconocimiento y no define el cobro del ciclo.' },
  ciclo: { termino: 'Ciclo comercial', definicion: 'Intervalo configurable (en la demostración, 14 días) en el que se acumula volumen y se califica.' },
  corrida: { termino: 'Corrida', definicion: 'Ejecución simulada del cálculo de bonos de un período, con una versión de reglas y un conjunto de movimientos identificados.' },
  liquidacion: { termino: 'Liquidación', definicion: 'Relación de bonos, ajustes y total a pagar por afiliado y período. En el prototipo no se realiza ninguna transferencia.' },
  brazo: { termino: 'Brazo', definicion: 'Cada una de las tres ramas (A, B y C) de una posición en la red Trinaria.' },
  remanente: { termino: 'Remanente', definicion: 'Volumen de un brazo que no se utilizó en el ciclo y puede acumularse o caducar según reglas parametrizadas.' },
};
