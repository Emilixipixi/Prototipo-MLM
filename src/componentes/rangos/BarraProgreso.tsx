import { unirClases } from '../../utilidades/clases';

interface PropsBarraProgreso { valor: number; maximo: number; etiqueta: string; oscura?: boolean; color?: string; }

export function BarraProgreso({ valor, maximo, etiqueta, oscura = false, color }: PropsBarraProgreso) {
  const porcentaje = maximo > 0 ? Math.min(100, Math.max(0, (valor / maximo) * 100)) : 0;
  return (
    <div role="progressbar" aria-label={etiqueta} aria-valuemin={0} aria-valuemax={maximo} aria-valuenow={valor} className={unirClases('h-2 w-full overflow-hidden rounded-full', oscura ? 'bg-white/15' : 'bg-slate-100')}>
      <span className="block h-full rounded-full" style={{ width: `${porcentaje}%`, background: color ?? 'linear-gradient(90deg, #0E7490, #22B8D6)' }} />
    </div>
  );
}
