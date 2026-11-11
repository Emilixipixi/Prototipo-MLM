import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useClicFuera } from '../../hooks/useClicFuera';
import type { ResumenNodo } from './tipos';

interface PropsBuscadorRed { nodos: ResumenNodo[]; alElegir: (nodo: ResumenNodo) => void; }

export function BuscadorRed({ nodos, alElegir }: PropsBuscadorRed) {
  const [texto, setTexto] = useState('');
  const [abierto, setAbierto] = useState(false);
  const referencia = useClicFuera<HTMLDivElement>(abierto, () => setAbierto(false));
  const resultados = useMemo(() => {
    const termino = texto.trim().toLowerCase();
    if (!termino) return [];
    return nodos.filter((nodo) => [nodo.nombre, nodo.codigo, nodo.patrocinadorId ?? '', nodo.runCobro ?? '', nodo.posicionId ?? '', nodo.brazo ? `brazo ${nodo.brazo}` : '']
      .join(' ').toLowerCase().includes(termino)).slice(0, 8);
  }, [texto, nodos]);

  return (
    <div ref={referencia} className="relative w-full sm:max-w-sm">
      <label className="flex min-h-11 items-center gap-2 rounded-xl border border-borde bg-superficie px-3 text-texto-3 focus-within:border-acento">
        <Search className="size-4 shrink-0" aria-hidden />
        <span className="sr-only">Buscar en la red</span>
        <input
          value={texto}
          onChange={(evento) => { setTexto(evento.target.value); setAbierto(true); }}
          onFocus={() => setAbierto(true)}
          placeholder="Nombre, código, sponsor, rango o posición"
          className="min-w-0 flex-1 bg-transparent py-2 text-sm text-texto outline-none placeholder:text-texto-3"
        />
      </label>
      {abierto && texto.trim() && (
        <ul className="animar-aparecer absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-xl border border-borde bg-superficie p-1.5 shadow-flotante" role="listbox">
          {resultados.length === 0 ? (
            <li className="px-3 py-2 text-[13px] text-texto-2">Sin coincidencias en tu red.</li>
          ) : resultados.map((nodo) => (
            <li key={nodo.personaId}>
              <button type="button" onClick={() => { alElegir(nodo); setAbierto(false); setTexto(''); }} className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 text-left hover:bg-fondo">
                <span className="min-w-0"><span className="block truncate text-[13px] font-semibold">{nodo.nombre}</span><span className="cifra block text-[11px] text-texto-2">{nodo.codigo}{nodo.posicionId ? ` · ${nodo.posicionId}` : ''}</span></span>
                <span className="cifra text-[11px] text-texto-3">{nodo.runCobro ?? 'Sin rango'}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
