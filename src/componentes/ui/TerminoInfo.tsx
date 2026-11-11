import { Info } from 'lucide-react';
import { glosario, type TerminoGlosario } from '../../datos/glosario';
import { Tooltip } from './Tooltip';

export function TerminoInfo({ termino }: { termino: TerminoGlosario }) {
  const entrada = glosario[termino];
  return (
    <Tooltip contenido={<><strong className="font-bold">{entrada.termino}:</strong> {entrada.definicion}</>}>
      <button type="button" aria-label={`Qué es ${entrada.termino}`} className="-m-3 inline-grid size-11 place-items-center rounded-full text-texto-3 hover:text-acento md:m-0 md:size-5">
        <Info className="size-3.5" aria-hidden />
      </button>
    </Tooltip>
  );
}
