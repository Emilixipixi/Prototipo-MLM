import { CircleCheck, CircleDashed, CircleX } from 'lucide-react';
import { nombresEstadoMid } from '../../servicios/mid';
import type { SustentacionMid } from '../../tipos/academico';
import { unirClases } from '../../utilidades/clases';

const pasos: SustentacionMid['estado'][] = ['solicitado', 'asignado', 'sustentado'];

export function LineaMid({ estado }: { estado: SustentacionMid['estado'] }) {
  const final = estado === 'aprobado' || estado === 'desaprobado';
  const indice = final ? 3 : pasos.indexOf(estado);
  return (
    <ol className="flex flex-wrap gap-2">
      {[...pasos, final ? estado : 'aprobado'].map((paso, posicion) => {
        const logrado = posicion <= indice;
        const Icono = paso === 'desaprobado' ? CircleX : logrado ? CircleCheck : CircleDashed;
        return (
          <li key={paso} className={unirClases('flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-[12px] font-semibold',
            paso === 'desaprobado' ? 'border-red-300 bg-red-50 text-error' : logrado ? 'border-acento bg-acento-suave text-[#155E75]' : 'border-borde text-texto-3')}>
            <Icono className="size-3.5" aria-hidden />{posicion === 3 && !final ? 'Resultado' : nombresEstadoMid[paso]}
          </li>
        );
      })}
    </ol>
  );
}
