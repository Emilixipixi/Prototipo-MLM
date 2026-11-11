import { formacionInicial } from '../datos/formacion';
import { movimientosIniciales } from '../datos/movimientos';
import { pedidosIniciales } from '../datos/pedidos';
import { periodosIniciales } from '../datos/periodos';
import { personasIniciales } from '../datos/personas';
import { patrociniosIniciales, posicionesIniciales } from '../datos/red';
import { versionesReglasIniciales } from '../datos/reglas';
import { ejecutarCorrida } from '../motores/ejecutarCorrida';
import type { CalificacionRun, SaldoBrazo } from '../tipos/calificacion';
import type { Ajuste, CorridaCalculo, Liquidacion } from '../tipos/compensacion';
import { construirContexto, type FuenteDatos } from './contexto';
import { calcularAjustesPorDevolucion, construirLiquidaciones } from './calculosCompensacion';

export interface EstadoCompensacionInicial {
  corridas: CorridaCalculo[];
  ajustes: Ajuste[];
  liquidaciones: Liquidacion[];
  calificacionesCerradas: CalificacionRun[];
  saldosCerrados: SaldoBrazo[];
}

export const ID_CORRIDA_C01 = 'DEMO-CR-C01-01';

export function crearEstadoInicialCompensacion(): EstadoCompensacionInicial {
  const fuente: FuenteDatos = {
    personas: personasIniciales, patrocinios: patrociniosIniciales, posiciones: posicionesIniciales,
    movimientos: movimientosIniciales, pedidos: pedidosIniciales, formacion: formacionInicial,
    periodos: periodosIniciales, versiones: versionesReglasIniciales, calificacionesCerradas: [], saldosCerrados: [],
  };
  const contexto = construirContexto(fuente, 'DEMO-C01');
  const resultado = ejecutarCorrida(contexto, { corridaId: ID_CORRIDA_C01, creadaPor: 'DEMO-U01', fecha: '2026-11-02T16:00:00' });
  const corrida: CorridaCalculo = {
    ...resultado.corrida,
    estado: 'aprobada',
    resultados: resultado.corrida.resultados.map((bono) => {
      if (bono.estado === 'retenida') return bono;
      return { ...bono, estado: bono.personaId === 'DEMO-A01' ? 'liquidada' : 'aprobada' };
    }),
  };

  const ajustes = calcularAjustesPorDevolucion({ ...fuente, calificacionesCerradas: resultado.calificaciones, saldosCerrados: resultado.saldos }, corrida, {
    pedidoId: 'DEMO-P02',
    periodoAplicacionId: 'DEMO-C02',
    propuestoPor: 'DEMO-U02',
    autorizadoPor: 'DEMO-U01',
    fecha: '2026-11-05T10:15:00',
    generarId: (indice) => `DEMO-AJ-${String(indice).padStart(2, '0')}`,
  });
  corrida.resultados = corrida.resultados.map((bono) => ({
    ...bono,
    ajustes: ajustes.filter((ajuste) => ajuste.personaId === bono.personaId && ajuste.motor === bono.motor).map((ajuste) => ajuste.id),
  }));

  const liquidaciones = construirLiquidaciones(corrida, [], personasIniciales, { actorId: 'DEMO-U01', fecha: '2026-11-02T18:00:00' })
    .map((liquidacion): Liquidacion => {
      if (liquidacion.estado === 'retenida') {
        return {
          ...liquidacion,
          motivoRetencion: 'Cuenta suspendida el 03/11/2026 por revisión de patrón atípico de pedidos (DEMOSTRACIÓN). La comisión queda retenida sin borrar la historia.',
          aprobaciones: [...liquidacion.aprobaciones, { actorId: 'DEMO-U01', fecha: '2026-11-03T11:20:00', accion: 'Pago retenido por suspensión de cuenta' }],
        };
      }
      const aprobaciones = [
        ...liquidacion.aprobaciones,
        { actorId: 'DEMO-U01', fecha: '2026-11-02T18:30:00', accion: 'Cierre del período aprobado' },
        { actorId: 'DEMO-U01', fecha: '2026-11-03T09:00:00', accion: 'Marcada como apta para desembolso' },
      ];
      if (liquidacion.personaId === 'DEMO-A01') {
        return {
          ...liquidacion,
          estado: 'liquidada_simulada',
          comprobante: 'DEMO-CMP-LIQ-C01-A01',
          aprobaciones: [...aprobaciones, { actorId: 'DEMO-U01', fecha: '2026-11-04T12:00:00', accion: 'Marcada como liquidada (simulado, sin transferencia)' }],
        };
      }
      return { ...liquidacion, estado: 'apta_para_desembolso', aprobaciones };
    });

  return {
    corridas: [corrida],
    ajustes,
    liquidaciones,
    calificacionesCerradas: resultado.calificaciones,
    saldosCerrados: resultado.saldos,
  };
}
