import { Award, Wallet } from 'lucide-react';
import type { CodigoRun } from '../../tipos/reglas';
import { unirClases } from '../../utilidades/clases';

interface PropsInsigniaRun {
  run: CodigoRun | null;
  tipo: 'cobro' | 'historico';
  tamano?: 'sm' | 'md';
  className?: string;
}

export function InsigniaRun({ run, tipo, tamano = 'sm', className }: PropsInsigniaRun) {
  const Icono = tipo === 'cobro' ? Wallet : Award;
  return (
    <span
      className={unirClases(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-bold',
        tamano === 'sm' ? 'px-2.5 py-0.5 text-[11.5px]' : 'px-3 py-1 text-[13px]',
        tipo === 'cobro' ? 'bg-primario text-white' : 'border border-oro bg-oro-suave text-oro',
        className,
      )}
      title={tipo === 'cobro' ? 'RUN de Cobro' : 'RUN Histórico'}
    >
      <Icono className={tamano === 'sm' ? 'size-3' : 'size-3.5'} aria-hidden />
      <span className="sr-only">{tipo === 'cobro' ? 'RUN de Cobro' : 'RUN Histórico'}:</span>
      {run ?? 'Sin rango'}
    </span>
  );
}
