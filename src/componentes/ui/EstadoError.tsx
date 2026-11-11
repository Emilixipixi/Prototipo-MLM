import type { ReactNode } from 'react';
import { RefreshCw, TriangleAlert } from 'lucide-react';
import { Boton } from './Boton';

interface PropsEstadoError {
  titulo?: string;
  queOcurrio: ReactNode;
  comoSeguir?: ReactNode;
  alReintentar?: () => void;
}

export function EstadoError({ titulo = 'No se pudo completar la acción', queOcurrio, comoSeguir, alReintentar }: PropsEstadoError) {
  return (
    <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
      <TriangleAlert className="mt-0.5 size-5 shrink-0 text-error" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-error">{titulo}</p>
        <div className="mt-0.5 text-[13.5px] text-texto">{queOcurrio}</div>
        {comoSeguir && <div className="mt-1 text-[13px] text-texto-2">{comoSeguir}</div>}
        {alReintentar && (
          <Boton variante="secundario" tamano="sm" icono={RefreshCw} onClick={alReintentar} className="mt-3">Reintentar</Boton>
        )}
      </div>
    </div>
  );
}
