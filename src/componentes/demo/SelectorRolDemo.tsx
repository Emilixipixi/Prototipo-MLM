import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronDown, Repeat } from 'lucide-react';
import { useClicFuera } from '../../hooks/useClicFuera';
import { usePersonaSesion, useSesionStore } from '../../store/useSesionStore';
import { nombresPerfiles } from '../../datos/perfiles';
import { unirClases } from '../../utilidades/clases';
import { sesionesDemo } from './sesionesDemo';

export function SelectorRolDemo({ oscuro = false }: { oscuro?: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const personaId = useSesionStore((estado) => estado.personaId);
  const navegar = useNavigate();
  const referencia = useClicFuera<HTMLDivElement>(abierto, () => setAbierto(false));
  const actual = sesionesDemo.find((sesion) => sesion.personaId === personaId);
  const persona = usePersonaSesion();

  const elegir = (id: string) => {
    setAbierto(false);
    if (id === personaId) return;
    navegar(`/cambiar-rol/${id}`);
  };

  return (
    <div ref={referencia} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        aria-expanded={abierto}
        aria-haspopup="menu"
        className={unirClases(
          'inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-[13px] font-semibold md:min-h-10',
          oscuro ? 'border-white/15 bg-white/5 text-white' : 'border-borde bg-superficie text-texto hover:border-texto-3',
        )}
      >
        <Repeat className="size-4 text-acento" aria-hidden />
        <span className="hidden xl:inline">Rol demo:</span>
        <span className="hidden sm:inline">{actual?.etiqueta ?? (persona ? `${nombresPerfiles[persona.perfil]} ${persona.codigo}` : 'Sin sesión')}</span>
        <ChevronDown className="size-4 text-texto-3" aria-hidden />
      </button>
      {abierto && (
        <div role="menu" className="animar-aparecer absolute right-0 top-full z-50 mt-2 w-[280px] max-w-[calc(100vw-24px)] overflow-hidden rounded-xl border border-borde bg-superficie p-1.5 shadow-flotante">
          <p className="px-3 pb-1.5 pt-2 text-[10.5px] font-bold uppercase tracking-[0.1em] text-texto-3">Cambiar rol de demostración</p>
          {sesionesDemo.map(({ personaId: id, etiqueta, detalle, icono: Icono }) => (
            <button
              key={id}
              type="button"
              role="menuitem"
              onClick={() => elegir(id)}
              className={unirClases('flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-fondo', id === personaId && 'bg-primario-suave')}
            >
              <Icono className="size-[18px] shrink-0 text-primario" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-texto">{etiqueta}</span>
                <span className="block truncate text-[11.5px] text-texto-2">{detalle}</span>
              </span>
              {id === personaId && <Check className="size-4 text-acento" aria-hidden />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
