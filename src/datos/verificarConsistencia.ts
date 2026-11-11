import { ejecutarCorrida } from '../motores/ejecutarCorrida';
import { calcularCalificaciones } from '../motores/motorRangos';
import { calcularSaldosBrazos } from '../motores/motorTrinario';
import { hijosUnilevel, nivelesUnilevel, produccionPorBrazo, totalesPorPersona } from '../motores/utilidadesMotor';
import { construirContexto, type FuenteDatos } from '../servicios/contexto';
import type { CorridaCalculo } from '../tipos/compensacion';
import { validarCicloPatrocinio } from '../validaciones/red';

export interface Verificacion { nombre: string; ok: boolean; detalle: string; }

const esperadoBrazos: Record<string, Record<'A' | 'B' | 'C', [number, number]>> = {
  'DEMO-C01': { A: [5200, 4100], B: [3100, 2400], C: [3900, 3000] },
  'DEMO-C02': { A: [3400, 2650], B: [1300, 1000], C: [2100, 1600] },
};

const esperadoSaldosC01: Record<'A' | 'B' | 'C', { utilizado: number; restante: number; remanenteAnterior: number; caducado: number; acumulado: number }> = {
  A: { utilizado: 3100, restante: 2100, remanenteAnterior: 850, caducado: 150, acumulado: 2800 },
  B: { utilizado: 3100, restante: 0, remanenteAnterior: 0, caducado: 0, acumulado: 0 },
  C: { utilizado: 3100, restante: 800, remanenteAnterior: 200, caducado: 0, acumulado: 1000 },
};

export function verificarConsistencia(fuente: FuenteDatos, corridas: CorridaCalculo[]): Verificacion[] {
  const resultados: Verificacion[] = [];
  const agregar = (nombre: string, ok: boolean, detalle: string) => resultados.push({ nombre, ok, detalle });

  Object.entries(esperadoBrazos).forEach(([periodoId, esperado]) => {
    const totales = totalesPorPersona(fuente.movimientos.filter((movimiento) => movimiento.periodoId === periodoId));
    produccionPorBrazo('DEMO-A01', fuente.posiciones, totales).forEach((brazo) => {
      const [vp, vc] = esperado[brazo.brazo];
      agregar(`Producción brazo ${brazo.brazo} de DEMO-A01 en ${periodoId}`, brazo.vp === vp && brazo.vc === vc, `Esperado ${vp} VP / ${vc} VC; obtenido ${brazo.vp} VP / ${brazo.vc} VC`);
    });
  });

  const personalC01 = fuente.movimientos.filter((m) => m.personaId === 'DEMO-A01' && m.periodoId === 'DEMO-C01').reduce((s, m) => s + m.vp, 0);
  const brutoC02 = fuente.movimientos.filter((m) => m.personaId === 'DEMO-A01' && m.periodoId === 'DEMO-C02' && m.tipo === 'origen').reduce((s, m) => s + m.vp, 0);
  const netoC02 = fuente.movimientos.filter((m) => m.personaId === 'DEMO-A01' && m.periodoId === 'DEMO-C02').reduce((s, m) => s + m.vp, 0);
  agregar('VP personal de DEMO-A01', personalC01 === 320 && brutoC02 === 180 && netoC02 === 60, `C01 ${personalC01} (esperado 320); C02 bruto ${brutoC02} (180) y neto ${netoC02} (60)`);

  const c01 = calcularCalificaciones(construirContexto({ ...fuente, calificacionesCerradas: [], saldosCerrados: [] }, 'DEMO-C01'));
  const a01 = c01.find((item) => item.personaId === 'DEMO-A01');
  agregar('RUN de DEMO-A01 en DEMO-C01', a01?.runCobro === 'RUN10K' && a01.runHistorico === 'RUN100K' && a01.siguienteRun === 'RUN30K', `Cobro ${a01?.runCobro}, Histórico ${a01?.runHistorico}, siguiente ${a01?.siguienteRun}`);

  const contextoC02 = construirContexto({ ...fuente, calificacionesCerradas: c01, saldosCerrados: [] }, 'DEMO-C02');
  const a01c02 = calcularCalificaciones(contextoC02).find((item) => item.personaId === 'DEMO-A01');
  const logrados = a01c02?.desgloseSiguiente.map((fila) => fila.logrado) ?? [];
  const esperados = [6860, 60, 3, 19.1, 2, fuente.formacion.some((f) => f.personaId === 'DEMO-A01' && f.estado === 'aprobado') ? 1 : 0];
  agregar('Requisitos de RUN30K para DEMO-A01 en DEMO-C02', a01c02?.siguienteRun === 'RUN30K' && esperados.every((valor, indice) => logrados[indice] === valor), `Logrados ${logrados.join(' / ')}; esperados ${esperados.join(' / ')}`);

  const saldos = calcularSaldosBrazos(construirContexto({ ...fuente, calificacionesCerradas: [], saldosCerrados: [] }, 'DEMO-C01')).filter((saldo) => saldo.personaId === 'DEMO-A01');
  const saldosOk = saldos.every((saldo) => Object.entries(esperadoSaldosC01[saldo.brazo]).every(([clave, valor]) => saldo[clave as keyof typeof esperadoSaldosC01.A] === valor));
  agregar('Saldos Trinarios de DEMO-A01 en DEMO-C01', saldosOk, saldos.map((saldo) => `${saldo.brazo}: usado ${saldo.utilizado}, restante ${saldo.restante}, caducado ${saldo.caducado}, acumulado ${saldo.acumulado}`).join('; '));

  const niveles = nivelesUnilevel('DEMO-A01', hijosUnilevel(fuente.patrocinios), 7);
  agregar('Profundidad Unilevel de DEMO-A01', niveles.every((nivel) => nivel.length > 0), niveles.map((nivel, indice) => `N${indice + 1}: ${nivel.length}`).join(', '));

  const distintos = ['DEMO-A02', 'DEMO-A04', 'DEMO-A06', 'DEMO-A07', 'DEMO-A10'].filter((id) => {
    const patrocinador = fuente.patrocinios.find((relacion) => relacion.personaId === id)?.patrocinadorId;
    const posicion = fuente.posiciones.find((item) => item.personaId === id);
    const padre = fuente.posiciones.find((item) => item.id === posicion?.padrePosicionId)?.personaId;
    return patrocinador !== padre;
  });
  agregar('Patrocinador distinto del padre de posición', distintos.length === 5, `${distintos.length} de 5 casos: ${distintos.join(', ')}`);

  const activas = fuente.posiciones.filter((posicion) => posicion.estado === 'activa');
  const duplicadas = activas.length - new Set(activas.map((posicion) => posicion.personaId)).size;
  const ranuras = activas.filter((posicion) => posicion.padrePosicionId).map((posicion) => `${posicion.padrePosicionId}-${posicion.brazo}`);
  agregar('Sin posiciones duplicadas', duplicadas === 0 && ranuras.length === new Set(ranuras).size, `${duplicadas} personas con más de una posición; ${ranuras.length - new Set(ranuras).size} brazos con más de un ocupante`);

  const ciclos = fuente.patrocinios.filter((relacion) => relacion.patrocinadorId && validarCicloPatrocinio(fuente.patrocinios.filter((otra) => otra.id !== relacion.id), relacion.personaId, relacion.patrocinadorId) !== null);
  agregar('Sin ciclos de patrocinio', ciclos.length === 0, ciclos.length === 0 ? 'Genealogía sin ciclos' : `Ciclos en: ${ciclos.map((relacion) => relacion.personaId).join(', ')}`);

  const huerfanos = fuente.movimientos.filter((movimiento) => {
    const pedido = fuente.pedidos.find((item) => item.id === movimiento.pedidoId);
    return movimiento.tipo !== 'ajuste' && (!pedido || !['confirmada', 'devuelta'].includes(pedido.estado));
  });
  const sinReversion = fuente.pedidos.filter((pedido) => pedido.estado === 'devuelta' && !fuente.movimientos.some((movimiento) => movimiento.pedidoId === pedido.id && movimiento.tipo === 'reversion'));
  agregar('Movimientos trazables a pedidos', huerfanos.length === 0 && sinReversion.length === 0, `${huerfanos.length} movimientos sin pedido válido; ${sinReversion.length} devoluciones sin reversión`);

  corridas.filter((corrida) => corrida.estado === 'aprobada').forEach((corrida) => {
    const reglas = corrida.reglasUsadas ?? fuente.versiones.find((version) => version.id === corrida.versionReglasId);
    const repetida = ejecutarCorrida(construirContexto({ ...fuente, calificacionesCerradas: [], saldosCerrados: [] }, corrida.periodoId, { reglas, movimientoIds: corrida.movimientoIds }), { corridaId: corrida.id, creadaPor: corrida.creadaPor, fecha: corrida.fecha });
    const iguales = repetida.corrida.resultados.length === corrida.resultados.length && repetida.corrida.resultados.every((bono) => corrida.resultados.find((original) => original.id === bono.id)?.monto === bono.monto);
    agregar(`Corrida ${corrida.id} reproducible`, iguales, `${corrida.resultados.length} partidas; versión ${corrida.versionReglasId}; ${corrida.movimientoIds.length} movimientos`);
  });

  return resultados;
}

export function informarConsistencia(resultados: Verificacion[]): void {
  const fallidas = resultados.filter((resultado) => !resultado.ok);
  if (fallidas.length === 0) {
    console.info(`Datos DEMO consistentes (${resultados.length} verificaciones)`);
    return;
  }
  console.warn(`Datos DEMO con diferencias: ${fallidas.length} de ${resultados.length}`);
  fallidas.forEach((resultado) => console.warn(`- ${resultado.nombre}: ${resultado.detalle}`));
}
