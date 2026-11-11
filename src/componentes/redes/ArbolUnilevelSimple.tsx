import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NodoPersona } from './NodoPersona';
import type { ResumenNodo } from './tipos';

interface PropsArbolUnilevel {
  raizId: string;
  hijos: Map<string, string[]>;
  resumen: Map<string, ResumenNodo>;
  resaltadoId: string | null;
  alSeleccionar: (nodo: ResumenNodo) => void;
  profundidadMaxima?: number;
  expandidosIniciales?: number;
}

export function ArbolUnilevelSimple({ raizId, hijos, resumen, resaltadoId, alSeleccionar, profundidadMaxima = 8, expandidosIniciales = 2 }: PropsArbolUnilevel) {
  const [alternados, setAlternados] = useState<Set<string>>(() => new Set());
  const alternar = (id: string) => setAlternados((actual) => {
    const nuevo = new Set(actual);
    if (nuevo.has(id)) nuevo.delete(id); else nuevo.add(id);
    return nuevo;
  });

  const rama = (id: string, nivel: number) => {
    const nodo = resumen.get(id);
    if (!nodo) return null;
    const descendientes = nivel < profundidadMaxima ? hijos.get(id) ?? [] : [];
    const abierto = (nivel < expandidosIniciales || resaltadoId !== null) !== alternados.has(id);
    return (
      <li key={id}>
        <div className="flex items-center gap-1.5">
          {descendientes.length > 0 ? (
            <button type="button" onClick={() => alternar(id)} aria-expanded={abierto} aria-label={`${abierto ? 'Contraer' : 'Expandir'} ${nodo.nombre}`} className="grid size-11 shrink-0 place-items-center rounded-lg text-texto-2 hover:bg-fondo md:size-8">
              {abierto ? <ChevronDown className="size-4" aria-hidden /> : <ChevronRight className="size-4" aria-hidden />}
            </button>
          ) : <span className="w-11 shrink-0 md:w-8" />}
          <span className="cifra hidden w-8 shrink-0 text-[11px] font-semibold text-texto-3 sm:block">{nivel === 0 ? 'Raíz' : `N${nivel}`}</span>
          <div className="min-w-0 flex-1 sm:max-w-md">
            <NodoPersona nodo={nodo} esRaiz={nivel === 0} resaltado={resaltadoId === id} alSeleccionar={alSeleccionar} nota={descendientes.length > 0 ? `${descendientes.length} ${descendientes.length === 1 ? 'directo' : 'directos'}` : undefined} />
          </div>
        </div>
        {abierto && descendientes.length > 0 && (
          <ul className="ml-[21px] mt-1.5 flex flex-col gap-1.5 border-l border-dashed border-borde pl-2 md:ml-[15px] md:pl-3">
            {descendientes.map((hijo) => rama(hijo, nivel + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="-mx-2 overflow-x-auto px-2">
      <ul className="flex min-w-[300px] flex-col gap-1.5">{rama(raizId, 0)}</ul>
    </div>
  );
}
