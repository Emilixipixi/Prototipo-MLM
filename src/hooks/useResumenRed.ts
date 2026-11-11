import { useMemo } from 'react';
import type { ResumenNodo } from '../componentes/redes/tipos';
import { totalesPorPersona } from '../motores/utilidadesMotor';
import { useDatosAfiliado } from './useDatosAfiliado';

export function useResumenRed() {
  const datos = useDatosAfiliado();
  const { fuente, periodoActual, periodoCerrado, calificaciones } = datos;
  const resumen = useMemo(() => {
    const totales = totalesPorPersona(fuente.movimientos.filter((movimiento) => movimiento.periodoId === periodoActual?.id));
    const cobros = new Map((periodoCerrado ? calificaciones[periodoCerrado.id] ?? [] : []).map((item) => [item.personaId, item.runCobro]));
    const mapa = new Map<string, ResumenNodo>();
    fuente.personas.forEach((persona) => {
      const posicion = fuente.posiciones.find((item) => item.personaId === persona.id && item.estado === 'activa');
      const padre = posicion?.padrePosicionId ? fuente.posiciones.find((item) => item.id === posicion.padrePosicionId) : undefined;
      mapa.set(persona.id, {
        personaId: persona.id,
        nombre: `${persona.nombres} ${persona.apellidos}`,
        codigo: persona.codigo,
        estado: persona.estado,
        runCobro: cobros.get(persona.id) ?? null,
        vpCiclo: totales.get(persona.id)?.vp ?? 0,
        vcCiclo: totales.get(persona.id)?.vc ?? 0,
        patrocinadorId: fuente.patrocinios.find((relacion) => relacion.personaId === persona.id)?.patrocinadorId ?? persona.referenteId,
        posicionId: posicion?.id ?? null,
        padrePosicionPersonaId: padre?.personaId ?? null,
        brazo: posicion?.brazo ?? null,
      });
    });
    return mapa;
  }, [fuente, periodoActual, periodoCerrado, calificaciones]);
  return { ...datos, resumen };
}
