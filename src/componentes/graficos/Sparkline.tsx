export function Sparkline({ valores, color = '#0E7490', relleno = true }: { valores: number[]; color?: string; relleno?: boolean }) {
  if (valores.length < 2) return null;
  const maximo = Math.max(...valores);
  const minimo = Math.min(...valores);
  const rango = maximo - minimo || 1;
  const puntos = valores.map((valor, indice) => `${(indice / (valores.length - 1)) * 120},${32 - ((valor - minimo) / rango) * 28}`);
  const linea = `M${puntos.join(' L')}`;
  return (
    <svg viewBox="0 0 120 36" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
      {relleno && <path d={`${linea} L120,36 L0,36 Z`} fill={color} opacity={0.08} />}
      <path d={linea} stroke={color} strokeWidth={2} fill="none" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
