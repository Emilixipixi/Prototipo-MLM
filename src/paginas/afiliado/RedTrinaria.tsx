import { useMemo, useState } from 'react';
import { Info, LayoutList, Network, Workflow } from 'lucide-react';
import { ArbolTrinario } from '../../componentes/redes/ArbolTrinario';
import { BuscadorRed } from '../../componentes/redes/BuscadorRed';
import { DetallePersonaRed } from '../../componentes/redes/DetallePersonaRed';
import { NodoPersona } from '../../componentes/redes/NodoPersona';
import type { ResumenNodo } from '../../componentes/redes/tipos';
import { ChipBrazo } from '../../componentes/ui/ChipBrazo';
import { EstadoVacio } from '../../componentes/ui/EstadoVacio';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { coloresBrazos } from '../../componentes/graficos/coloresBrazos';
import { useEsMovil } from '../../hooks/useEsMovil';
import { useResumenRed } from '../../hooks/useResumenRed';
import { hijosUnilevel, produccionPorBrazo } from '../../motores/utilidadesMotor';
import type { Brazo } from '../../tipos/red';
import { unirClases } from '../../utilidades/clases';
import { formatearNumero } from '../../utilidades/formatos';

export default function RedTrinaria() {
  const { fuente, persona, resumen, periodoActual, saldos } = useResumenRed();
  const esMovil = useEsMovil();
  const [vistaLista, setVistaLista] = useState<boolean | null>(null);
  const [resaltado, setResaltado] = useState<string | null>(null);
  const [seleccionado, setSeleccionado] = useState<ResumenNodo | null>(null);
  const hijos = useMemo(() => hijosUnilevel(fuente.patrocinios), [fuente.patrocinios]);
  const posicion = fuente.posiciones.find((item) => item.personaId === persona?.id && item.estado === 'activa');
  const porBrazo = useMemo(() => (persona ? produccionPorBrazo(persona.id, fuente.posiciones, new Map()) : []), [persona, fuente.posiciones]);
  const lista = vistaLista ?? esMovil;

  if (!persona) return null;
  if (!posicion) {
    return <Tarjeta><EstadoVacio icono={Network} titulo="Aún no tienes posición Trinaria" texto="Corporativo asignará tu posición en un brazo A, B o C disponible. Tu patrocinio ya está registrado y no cambia con la colocación." /></Tarjeta>;
  }
  const misSaldos = (saldos[periodoActual?.id ?? ''] ?? []).filter((saldo) => saldo.personaId === persona.id);
  const nodosOrganizacion = porBrazo.flatMap((brazo) => brazo.personas).map((id) => resumen.get(id)).filter((nodo): nodo is ResumenNodo => Boolean(nodo));

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {(['A', 'B', 'C'] as Brazo[]).map((brazo) => {
          const saldo = misSaldos.find((item) => item.brazo === brazo);
          const personas = porBrazo.find((item) => item.brazo === brazo)?.personas ?? [];
          return (
            <div key={brazo} className="rounded-tarjeta border border-borde bg-superficie p-4 shadow-tarjeta" style={{ boxShadow: `inset 0 3px 0 ${coloresBrazos[brazo]}` }}>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-[13.5px] font-bold"><ChipBrazo brazo={brazo} />Brazo {brazo}</span>
                <span className="cifra text-xs text-texto-2">{personas.length} posiciones</span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2">
                <div><dt className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-texto-3">VP del ciclo</dt><dd className="cifra text-lg font-semibold">{formatearNumero(saldo?.generadoVp ?? 0)}</dd></div>
                <div><dt className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-texto-3">VC del ciclo</dt><dd className="cifra text-lg font-semibold">{formatearNumero(saldo?.generadoVc ?? 0)}</dd></div>
              </dl>
              <p className="mt-1 truncate text-xs text-texto-2">{personas.length > 0 ? `Encabeza ${resumen.get(personas[0])?.nombre ?? personas[0]}` : 'Brazo disponible'}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <BuscadorRed nodos={nodosOrganizacion} alElegir={(nodo) => { setResaltado(nodo.personaId); if (lista) window.setTimeout(() => document.getElementById(`nodo-${nodo.personaId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60); }} />
        <div className="flex rounded-xl border border-borde bg-superficie p-1 lg:ml-auto" role="group" aria-label="Tipo de vista">
          <button type="button" aria-pressed={!lista} onClick={() => setVistaLista(false)} className={unirClases('inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold md:min-h-9', !lista ? 'bg-primario text-white' : 'text-texto-2')}><Workflow className="size-4" aria-hidden />Árbol</button>
          <button type="button" aria-pressed={lista} onClick={() => setVistaLista(true)} className={unirClases('inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold md:min-h-9', lista ? 'bg-primario text-white' : 'text-texto-2')}><LayoutList className="size-4" aria-hidden />Lista por brazo</button>
        </div>
      </div>

      <Tarjeta titulo="Mi organización Trinaria" subtitulo="Red de posiciones con tres brazos independientes. Arrastra para moverte y usa los controles para acercar." icono={Network}>
        {lista ? (
          <div className="grid min-w-0 gap-4 lg:grid-cols-3">
            {porBrazo.map((brazo) => (
              <section key={brazo.brazo} aria-label={`Brazo ${brazo.brazo}`} className="flex min-w-0 flex-col gap-2">
                <h4 className="flex items-center gap-2 text-[13.5px] font-bold"><ChipBrazo brazo={brazo.brazo} />Brazo {brazo.brazo}</h4>
                {brazo.personas.length === 0 ? <p className="rounded-xl border border-dashed border-borde p-3 text-xs text-texto-3">Disponible</p> : brazo.personas.map((id) => {
                  const nodo = resumen.get(id);
                  return nodo ? <NodoPersona key={id} nodo={nodo} resaltado={resaltado === id} colorBorde={coloresBrazos[brazo.brazo]} alSeleccionar={setSeleccionado} nota={nodo.patrocinadorId !== nodo.padrePosicionPersonaId ? `Padre ${nodo.padrePosicionPersonaId} · Patrocinador ${nodo.patrocinadorId}` : `Padre ${nodo.padrePosicionPersonaId}`} /> : null;
                })}
              </section>
            ))}
          </div>
        ) : (
          <ArbolTrinario raizPosicionId={posicion.id} posiciones={fuente.posiciones} resumen={resumen} resaltadoId={resaltado} alSeleccionar={setSeleccionado} alto={esMovil ? 460 : 600} />
        )}
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-acento-suave px-3 py-2.5 text-[12.5px] text-[#155E75]">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          El padre de posición puede ser distinto del patrocinador. Cuando son distintos, el nodo indica quién es su patrocinador en la genealogía Unilevel.
        </p>
      </Tarjeta>
      <DetallePersonaRed nodo={seleccionado} resumen={resumen} alCerrar={() => setSeleccionado(null)} directos={seleccionado ? (hijos.get(seleccionado.personaId) ?? []).length : 0} />
    </div>
  );
}
