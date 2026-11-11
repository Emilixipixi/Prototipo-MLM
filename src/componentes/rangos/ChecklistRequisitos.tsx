import { Check, X } from 'lucide-react';
import type { ResultadoRequisito } from '../../tipos/calificacion';
import { unirClases } from '../../utilidades/clases';
import { formatearNumero } from '../../utilidades/formatos';

function valor(requisito: ResultadoRequisito, numero: number): string {
  if (requisito.requisitoId.endsWith('formacion')) return numero >= 1 ? 'Aprobada' : 'Pendiente';
  if (requisito.requisitoId.endsWith('equilibrio')) return `${formatearNumero(numero, numero % 1 ? 1 : 0)}%`;
  return formatearNumero(numero);
}

export function ChecklistRequisitos({ requisitos, mostrarFuente = true }: { requisitos: ResultadoRequisito[]; mostrarFuente?: boolean }) {
  return (
    <ul className="flex flex-col divide-y divide-borde">
      {requisitos.map((requisito) => {
        const faltante = Math.max(0, requisito.requerido - requisito.logrado);
        return (
          <li key={requisito.requisitoId} className="flex gap-3 py-3 first:pt-0 last:pb-0">
            <span className={unirClases('mt-0.5 grid size-6 shrink-0 place-items-center rounded-full', requisito.cumple ? 'bg-green-100 text-exito' : 'bg-red-50 text-error')}>
              {requisito.cumple ? <Check className="size-3.5" aria-label="Cumplido" /> : <X className="size-3.5" aria-label="Pendiente" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p className="text-[13.5px] font-semibold text-texto">{requisito.descripcion}</p>
                <p className="cifra text-[12.5px] text-texto-2">
                  <span className={requisito.cumple ? 'font-semibold text-exito' : 'font-semibold text-texto'}>{valor(requisito, requisito.logrado)}</span>
                  {' / '}{valor(requisito, requisito.requerido)}
                </p>
              </div>
              {!requisito.cumple && !requisito.requisitoId.endsWith('formacion') && (
                <p className="text-xs font-medium text-error">Falta {valor(requisito, faltante)}</p>
              )}
              {mostrarFuente && <p className="mt-0.5 text-[11.5px] text-texto-3">Fuente: {requisito.fuente}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
