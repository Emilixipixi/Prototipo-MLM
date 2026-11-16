interface PropsAnilloProgreso { valor: number; tamano?: number; etiqueta: string; claro?: boolean }

export function AnilloProgreso({ valor, tamano = 64, etiqueta, claro = false }: PropsAnilloProgreso) {
  const radio = 26;
  const circunferencia = 2 * Math.PI * radio;
  const porcentaje = Math.min(100, Math.max(0, valor));
  return (
    <div role="progressbar" aria-label={etiqueta} aria-valuemin={0} aria-valuemax={100} aria-valuenow={porcentaje} className="relative grid shrink-0 place-items-center" style={{ width: tamano, height: tamano }}>
      <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="32" cy="32" r={radio} fill="none" strokeWidth="7" className={claro ? 'stroke-white/20' : 'stroke-slate-100'} />
        <circle cx="32" cy="32" r={radio} fill="none" strokeWidth="7" strokeLinecap="round" stroke={claro ? '#FFFFFF' : '#0E7490'} strokeDasharray={circunferencia} strokeDashoffset={circunferencia * (1 - porcentaje / 100)} />
      </svg>
      <span className={claro ? 'cifra text-[13px] font-bold text-white' : 'cifra text-[13px] font-bold text-texto'}>{porcentaje}%</span>
    </div>
  );
}
