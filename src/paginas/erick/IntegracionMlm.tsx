import { Info } from 'lucide-react';
import { RegistroEventosLms } from '../../componentes/campus/RegistroEventosLms';

export default function IntegracionMlm() {
  return (
    <div className="flex flex-col gap-5">
      <p className="flex items-start gap-2 rounded-xl bg-acento-suave px-3 py-2.5 text-[12.5px] text-[#155E75]">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        ERICK S.A.C. informa al MLM por medio del conector: cada matrícula, avance, aprobación, documento y vencimiento se envía como evento. El MLM usa la formación aprobada como requisito de rango; precios, VP y VC de los programas se mantienen en el catálogo del MLM.
      </p>
      <RegistroEventosLms />
    </div>
  );
}
