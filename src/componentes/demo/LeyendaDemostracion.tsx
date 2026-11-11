import { FlaskConical } from 'lucide-react';
import { unirClases } from '../../utilidades/clases';

const TEXTO_COMPLETO = 'DEMOSTRACIÓN - Datos, usuarios, volúmenes, porcentajes y montos ficticios. Ningún valor representa un plan de compensación aprobado, una liquidación real ni una proyección de ingresos. No se realizan cobros, pagos ni integraciones reales.';
const TEXTO_CORTO = 'DEMOSTRACIÓN - Datos y montos ficticios. Sin cobros ni pagos reales.';

interface PropsLeyenda {
  variante?: 'franja' | 'bloque';
  className?: string;
}

export function LeyendaDemostracion({ variante = 'franja', className }: PropsLeyenda) {
  if (variante === 'bloque') {
    return (
      <div className={unirClases('flex items-start gap-2 rounded-xl border border-amber-200 bg-demo-fondo px-3 py-2.5 text-xs font-medium text-demo-texto', className)}>
        <FlaskConical className="mt-px size-4 shrink-0" aria-hidden />
        <span>Valores ilustrativos de DEMOSTRACIÓN. No representan un plan de compensación aprobado ni una liquidación real.</span>
      </div>
    );
  }
  return (
    <div role="note" className={unirClases('border-b border-amber-200 bg-demo-fondo px-4 py-1.5 text-demo-texto', className)}>
      <p className="mx-auto flex max-w-[1600px] items-center justify-center gap-2 text-center text-[11.5px] font-semibold leading-snug sm:text-xs">
        <FlaskConical className="size-[15px] shrink-0" aria-hidden />
        <span className="hidden lg:inline">{TEXTO_COMPLETO}</span>
        <span className="lg:hidden">{TEXTO_CORTO}</span>
      </p>
    </div>
  );
}
