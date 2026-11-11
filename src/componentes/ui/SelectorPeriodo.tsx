import type { Periodo } from '../../tipos/reglas';
import { unirClases } from '../../utilidades/clases';

interface PropsSelectorPeriodo { periodos: Periodo[]; valor: string; alCambiar: (id: string) => void; }

export function SelectorPeriodo({ periodos, valor, alCambiar }: PropsSelectorPeriodo) {
  return (
    <div className="inline-flex rounded-xl border border-borde bg-superficie p-1" role="group" aria-label="Seleccionar período">
      {periodos.map((periodo) => (
        <button
          key={periodo.id}
          type="button"
          aria-pressed={valor === periodo.id}
          onClick={() => alCambiar(periodo.id)}
          className={unirClases(
            'inline-flex min-h-11 md:min-h-10 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold transition-colors',
            valor === periodo.id ? 'bg-primario text-white' : 'text-texto-2 hover:text-texto',
          )}
        >
          <span className="cifra">{periodo.id.replace('DEMO-', '')}</span>
          <span className={unirClases('text-[11px] font-medium', valor === periodo.id ? 'text-white/80' : 'text-texto-3')}>{periodo.estado === 'cerrado' ? 'cerrado' : 'en curso'}</span>
        </button>
      ))}
    </div>
  );
}
