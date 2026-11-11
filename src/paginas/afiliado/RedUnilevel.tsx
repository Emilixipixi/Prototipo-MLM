import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, LayoutList, ListTree, Network, UserRound } from 'lucide-react';
import { BuscadorRed } from '../../componentes/redes/BuscadorRed';
import { DetallePersonaRed } from '../../componentes/redes/DetallePersonaRed';
import { NodoPersona } from '../../componentes/redes/NodoPersona';
import type { ResumenNodo } from '../../componentes/redes/tipos';
import { EstadoVacio } from '../../componentes/ui/EstadoVacio';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { useResumenRed } from '../../hooks/useResumenRed';
import { hijosUnilevel } from '../../motores/utilidadesMotor';
import { unirClases } from '../../utilidades/clases';
import { formatearNumero } from '../../utilidades/formatos';

type Vista = 'arbol' | 'niveles';

export default function RedUnilevel() {
  const { fuente, persona, resumen } = useResumenRed();
  const [profundidad, setProfundidad] = useState(7);
  const [vista, setVista] = useState<Vista>('arbol');
  const [abiertos, setAbiertos] = useState<Set<string>>(() => new Set());
  const [resaltado, setResaltado] = useState<string | null>(null);
  const [seleccionado, setSeleccionado] = useState<ResumenNodo | null>(null);
  const hijos = useMemo(() => hijosUnilevel(fuente.patrocinios), [fuente.patrocinios]);
  const raizId = persona?.id ?? '';

  const niveles = useMemo(() => {
    const resultado: string[][] = [];
    let actuales = [raizId];
    for (let nivel = 1; nivel <= 7; nivel += 1) {
      actuales = actuales.flatMap((id) => hijos.get(id) ?? []);
      resultado.push(actuales);
    }
    return resultado;
  }, [hijos, raizId]);
  const nivelDe = useMemo(() => {
    const mapa = new Map<string, number>();
    niveles.forEach((ids, indice) => ids.forEach((id) => mapa.set(id, indice + 1)));
    return mapa;
  }, [niveles]);
  const visibles = niveles.slice(0, profundidad).flat();
  const nodosVisibles = visibles.map((id) => resumen.get(id)).filter((nodo): nodo is ResumenNodo => Boolean(nodo));

  if (!persona) return null;
  const raiz = resumen.get(raizId);
  const patrocinador = raiz?.patrocinadorId ? resumen.get(raiz.patrocinadorId) : undefined;
  const expandidoInicial = (id: string) => (nivelDe.get(id) ?? 0) < 2;
  const estaAbierto = (id: string) => abiertos.has(id) !== expandidoInicial(id);
  const alternar = (id: string) => setAbiertos((actual) => {
    const nuevo = new Set(actual);
    if (nuevo.has(id)) nuevo.delete(id); else nuevo.add(id);
    return nuevo;
  });

  const enfocar = (nodo: ResumenNodo) => {
    const ruta: string[] = [];
    let actual = fuente.patrocinios.find((relacion) => relacion.personaId === nodo.personaId)?.patrocinadorId ?? null;
    while (actual && actual !== raizId) {
      ruta.push(actual);
      actual = fuente.patrocinios.find((relacion) => relacion.personaId === actual)?.patrocinadorId ?? null;
    }
    setAbiertos((previo) => {
      const nuevo = new Set(previo);
      ruta.forEach((id) => { if (!estaAbierto(id)) { if (nuevo.has(id)) nuevo.delete(id); else nuevo.add(id); } });
      return nuevo;
    });
    const nivel = nivelDe.get(nodo.personaId) ?? 1;
    if (nivel > profundidad) setProfundidad(nivel);
    setResaltado(nodo.personaId);
    window.setTimeout(() => document.getElementById(`nodo-${nodo.personaId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
  };

  const renderRama = (id: string, nivel: number) => {
    const nodo = resumen.get(id);
    if (!nodo || nivel > profundidad) return null;
    const descendientes = nivel < profundidad ? hijos.get(id) ?? [] : [];
    const abierto = estaAbierto(id);
    return (
      <li key={id} className="relative">
        <div className="flex items-center gap-1.5">
          {descendientes.length > 0 ? (
            <button type="button" onClick={() => alternar(id)} aria-expanded={abierto} aria-label={`${abierto ? 'Contraer' : 'Expandir'} ${nodo.nombre}`} className="grid size-11 shrink-0 place-items-center rounded-lg text-texto-2 hover:bg-fondo md:size-8">
              {abierto ? <ChevronDown className="size-4" aria-hidden /> : <ChevronRight className="size-4" aria-hidden />}
            </button>
          ) : <span className="w-11 shrink-0 md:w-8" />}
          <span className="cifra hidden w-8 shrink-0 text-[11px] font-semibold text-texto-3 sm:block">N{nivel}</span>
          <div className="min-w-0 flex-1 sm:max-w-md">
            <NodoPersona nodo={nodo} resaltado={resaltado === id} alSeleccionar={setSeleccionado} nota={descendientes.length > 0 ? `${descendientes.length} ${descendientes.length === 1 ? 'directo' : 'directos'}` : undefined} />
          </div>
        </div>
        {abierto && descendientes.length > 0 && (
          <ul className="ml-[21px] mt-1.5 flex flex-col gap-1.5 border-l border-dashed border-borde pl-2 md:ml-[15px] md:pl-3">
            {descendientes.map((hijo) => renderRama(hijo, nivel + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <BuscadorRed nodos={nodosVisibles} alElegir={enfocar} />
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <div className="-mx-1 overflow-x-auto px-1">
            <div className="flex items-center gap-1 rounded-xl border border-borde bg-superficie p-1" role="group" aria-label="Profundidad visible">
              <span className="px-2 text-[12px] font-semibold text-texto-2">Niveles</span>
              {[1, 2, 3, 4, 5, 6, 7].map((valor) => (
                <button key={valor} type="button" aria-pressed={profundidad === valor} onClick={() => setProfundidad(valor)} className={unirClases('cifra grid size-11 place-items-center rounded-lg text-[13px] font-semibold md:size-9', profundidad === valor ? 'bg-primario text-white' : 'text-texto-2 hover:bg-fondo')}>{valor}</button>
              ))}
            </div>
          </div>
          <div className="flex rounded-xl border border-borde bg-superficie p-1" role="group" aria-label="Tipo de vista">
            <button type="button" aria-pressed={vista === 'arbol'} onClick={() => setVista('arbol')} className={unirClases('inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold md:min-h-9', vista === 'arbol' ? 'bg-primario text-white' : 'text-texto-2')}><ListTree className="size-4" aria-hidden />Árbol</button>
            <button type="button" aria-pressed={vista === 'niveles'} onClick={() => setVista('niveles')} className={unirClases('inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold md:min-h-9', vista === 'niveles' ? 'bg-primario text-white' : 'text-texto-2')}><LayoutList className="size-4" aria-hidden />Por niveles</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        <div className="col-span-2 rounded-xl border border-borde bg-superficie p-3 sm:col-span-4 lg:col-span-1">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-texto-3">Total visible</p>
          <p className="cifra text-lg font-semibold">{visibles.length}</p>
        </div>
        {niveles.map((ids, indice) => (
          <div key={indice} className={unirClases('rounded-xl border p-3', indice < profundidad ? 'border-borde bg-superficie' : 'border-dashed border-borde bg-fondo opacity-60')}>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-texto-3">Nivel {indice + 1}</p>
            <p className="cifra text-lg font-semibold">{ids.length}</p>
          </div>
        ))}
      </div>

      <Tarjeta titulo="Mi genealogía Unilevel" subtitulo="Relación de patrocinio: patrocinador, directos y descendientes hasta 7 niveles." icono={Network}>
        {patrocinador && (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-fondo px-3 py-2 text-[12.5px] text-texto-2">
            <UserRound className="size-4" aria-hidden />Tu patrocinador: <span className="font-semibold text-texto">{patrocinador.nombre}</span><span className="cifra">{patrocinador.codigo}</span>
          </div>
        )}
        {raiz && <div className="mb-2 max-w-md"><NodoPersona nodo={raiz} esRaiz alSeleccionar={setSeleccionado} nota={`${(hijos.get(raizId) ?? []).length} directos · ${visibles.length} en ${profundidad} niveles`} /></div>}
        {visibles.length === 0 ? (
          <EstadoVacio icono={Network} titulo="Aún no tienes patrocinados" texto="Comparte tu enlace de patrocinio desde Mi inicio." />
        ) : vista === 'arbol' ? (
          <div className="-mx-2 overflow-x-auto px-2">
            <ul className="flex min-w-[300px] flex-col gap-1.5">{(hijos.get(raizId) ?? []).map((id) => renderRama(id, 1))}</ul>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {niveles.slice(0, profundidad).map((ids, indice) => (
              <section key={indice} aria-label={`Nivel ${indice + 1}`}>
                <h4 className="mb-2 flex items-center gap-2 text-[13px] font-bold text-texto">Nivel {indice + 1}<span className="cifra rounded-md bg-primario-suave px-1.5 text-[11px] text-primario">{ids.length}</span><span className="text-xs font-medium text-texto-3">VP del nivel {formatearNumero(ids.reduce((suma, id) => suma + (resumen.get(id)?.vpCiclo ?? 0), 0))}</span></h4>
                {ids.length === 0 ? <p className="text-xs text-texto-3">Sin personas en este nivel.</p> : (
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {ids.map((id) => { const nodo = resumen.get(id); return nodo ? <NodoPersona key={id} nodo={nodo} resaltado={resaltado === id} alSeleccionar={setSeleccionado} /> : null; })}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </Tarjeta>
      <DetallePersonaRed nodo={seleccionado} resumen={resumen} alCerrar={() => setSeleccionado(null)} directos={seleccionado ? (hijos.get(seleccionado.personaId) ?? []).length : 0} />
    </div>
  );
}
