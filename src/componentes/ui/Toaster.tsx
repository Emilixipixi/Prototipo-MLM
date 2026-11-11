import { CircleCheck, CircleX, Info, TriangleAlert, X, type LucideIcon } from 'lucide-react';
import { unirClases } from '../../utilidades/clases';
import { useToastStore, type TipoToast } from './useToast';

const estilos: Record<TipoToast, { icono: LucideIcon; clase: string }> = {
  exito: { icono: CircleCheck, clase: 'text-exito' },
  error: { icono: CircleX, clase: 'text-error' },
  advertencia: { icono: TriangleAlert, clase: 'text-advertencia' },
  info: { icono: Info, clase: 'text-info' },
};

export function Toaster() {
  const avisos = useToastStore((estado) => estado.avisos);
  const quitar = useToastStore((estado) => estado.quitar);
  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-3 z-[60] flex flex-col gap-2 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[360px]" aria-live="polite">
      {avisos.map((aviso) => {
        const { icono: Icono, clase } = estilos[aviso.tipo];
        return (
          <div key={aviso.id} className="animar-entrada-abajo pointer-events-auto flex items-start gap-3 rounded-xl border border-borde bg-superficie p-3.5 shadow-flotante">
            <Icono className={unirClases('mt-0.5 size-5 shrink-0', clase)} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-bold text-texto">{aviso.titulo}</p>
              {aviso.mensaje && <p className="mt-0.5 text-[12.5px] text-texto-2">{aviso.mensaje}</p>}
            </div>
            <button type="button" onClick={() => quitar(aviso.id)} aria-label="Cerrar aviso" className="grid size-8 shrink-0 place-items-center rounded-lg text-texto-3 hover:bg-fondo hover:text-texto">
              <X className="size-4" aria-hidden />
            </button>
          </div>
        );
      })}
    </div>
  );
}
