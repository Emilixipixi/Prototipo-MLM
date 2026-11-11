import { useMemo } from 'react';
import { ejecutarCorrida } from '../motores/ejecutarCorrida';
import { calcularCalificaciones } from '../motores/motorRangos';
import { calcularSaldosBrazos } from '../motores/motorTrinario';
import { construirContexto } from '../servicios/contexto';
import { useCompensacionStore } from '../store/useCompensacionStore';
import { usePersonaSesion } from '../store/useSesionStore';
import type { CalificacionRun, SaldoBrazo } from '../tipos/calificacion';
import type { BonoComision, CorridaCalculo } from '../tipos/compensacion';
import type { Periodo } from '../tipos/reglas';
import { useFuente } from './useFuente';

export interface BonosPeriodo {
  bonos: BonoComision[];
  origen: 'corrida_aprobada' | 'corrida_en_proceso' | 'estimacion';
  corrida: CorridaCalculo | null;
  versionReglasId: string;
}

export function useDatosAfiliado() {
  const fuente = useFuente();
  const persona = usePersonaSesion();
  const corridas = useCompensacionStore((estado) => estado.corridas);
  const liquidaciones = useCompensacionStore((estado) => estado.liquidaciones);
  const ajustes = useCompensacionStore((estado) => estado.ajustes);

  const ciclos = useMemo(
    () => fuente.periodos.filter((periodo) => periodo.tipo === 'ciclo' && periodo.estado !== 'programado').sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio)),
    [fuente.periodos],
  );
  const periodoActual: Periodo | undefined = ciclos.find((periodo) => periodo.estado !== 'cerrado') ?? ciclos[ciclos.length - 1];
  const periodoCerrado: Periodo | undefined = [...ciclos].reverse().find((periodo) => periodo.estado === 'cerrado');

  const calificaciones = useMemo(() => {
    const mapa: Record<string, CalificacionRun[]> = {};
    ciclos.forEach((periodo) => {
      const cerradas = fuente.calificacionesCerradas.filter((item) => item.periodoId === periodo.id);
      mapa[periodo.id] = cerradas.length > 0 ? cerradas : calcularCalificaciones(construirContexto(fuente, periodo.id));
    });
    return mapa;
  }, [ciclos, fuente]);

  const saldos = useMemo(() => {
    const mapa: Record<string, SaldoBrazo[]> = {};
    ciclos.forEach((periodo) => {
      const cerrados = fuente.saldosCerrados.filter((item) => item.periodoId === periodo.id);
      mapa[periodo.id] = cerrados.length > 0 ? cerrados : calcularSaldosBrazos(construirContexto(fuente, periodo.id));
    });
    return mapa;
  }, [ciclos, fuente]);

  const bonos = useMemo(() => {
    const mapa: Record<string, BonosPeriodo> = {};
    ciclos.forEach((periodo) => {
      const delPeriodo = corridas.filter((corrida) => corrida.periodoId === periodo.id && corrida.estado !== 'rechazada' && !corrida.parametrosTemporales);
      const aprobada = delPeriodo.find((corrida) => corrida.estado === 'aprobada');
      const enProceso = [...delPeriodo].reverse().find((corrida) => corrida.estado === 'en_revision' || corrida.estado === 'simulada');
      if (aprobada || enProceso) {
        const corrida = (aprobada ?? enProceso)!;
        mapa[periodo.id] = { bonos: corrida.resultados, origen: aprobada ? 'corrida_aprobada' : 'corrida_en_proceso', corrida, versionReglasId: corrida.versionReglasId };
        return;
      }
      const resultado = ejecutarCorrida(construirContexto(fuente, periodo.id), { corridaId: `ESTIMACION-${periodo.id.replace('DEMO-', '')}`, creadaPor: 'SISTEMA', fecha: periodo.fechaFin });
      mapa[periodo.id] = { bonos: resultado.corrida.resultados, origen: 'estimacion', corrida: null, versionReglasId: resultado.corrida.versionReglasId };
    });
    return mapa;
  }, [ciclos, corridas, fuente]);

  return { fuente, persona, ciclos, periodoActual, periodoCerrado, calificaciones, saldos, bonos, liquidaciones, ajustes };
}
