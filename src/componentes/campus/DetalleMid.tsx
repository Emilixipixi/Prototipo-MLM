import { Award, CalendarCheck, CircleCheck, FileCheck2, Presentation, Send, UserCheck } from 'lucide-react';
import { useCampusStore } from '../../store/useCampusStore';
import type { SustentacionMid } from '../../tipos/academico';
import { formatearFecha, formatearFechaHora } from '../../utilidades/fechas';
import { formatearNumero } from '../../utilidades/formatos';
import { BarraProgreso } from '../rangos/BarraProgreso';

interface Hito { icono: typeof Send; titulo: string; fecha: string; detalle: string }

export function DetalleMid({ sustentacion, evaluador }: { sustentacion: SustentacionMid; evaluador: string | null }) {
  const documentos = useCampusStore((estado) => estado.documentos);
  const constancia = documentos.find((documento) => documento.tipo === 'constancia_mid' && documento.personaId === sustentacion.personaId && documento.estado === 'emitido');
  const diploma = documentos.find((documento) => documento.tipo === 'diploma' && documento.personaId === sustentacion.personaId && documento.estado === 'emitido');
  const calificada = sustentacion.rubrica.some((criterio) => criterio.nota !== null);
  const hitos: Hito[] = [
    { icono: Send, titulo: 'Propuesta registrada', fecha: formatearFecha(sustentacion.fechaPropuesta), detalle: `Archivo ${sustentacion.archivo}` },
  ];
  if (sustentacion.fechaAsignada) {
    hitos.push({ icono: UserCheck, titulo: 'Evaluador asignado', fecha: formatearFecha(sustentacion.fechaAsignada), detalle: evaluador ?? 'Docente evaluador' });
    hitos.push({ icono: Presentation, titulo: calificada ? 'Sustentación realizada' : 'Sustentación programada', fecha: `${formatearFecha(sustentacion.fechaAsignada)} · 10:00`, detalle: 'Exposición de 20 minutos y 10 minutos de preguntas' });
  }
  if (calificada && sustentacion.notaFinal !== null) {
    hitos.push({ icono: CircleCheck, titulo: 'Resultado publicado', fecha: constancia ? formatearFecha(constancia.fechaEmision.slice(0, 10)) : '-', detalle: `Nota final ${formatearNumero(sustentacion.notaFinal, 2)} de 20` });
  }
  if (constancia) hitos.push({ icono: Award, titulo: 'Constancia emitida', fecha: formatearFechaHora(constancia.fechaEmision), detalle: constancia.codigo });

  return (
    <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
      {calificada && (
        <section className="rounded-xl border border-borde p-4">
          <h4 className="flex items-center gap-2 text-[13.5px] font-bold text-texto"><FileCheck2 className="size-4 text-acento" aria-hidden />Rúbrica de evaluación</h4>
          <ul className="mt-3 flex flex-col gap-3">
            {sustentacion.rubrica.map((criterio) => (
              <li key={criterio.criterio} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
                  <span className="text-texto">{criterio.criterio} <span className="text-texto-2">· peso {criterio.peso}%</span></span>
                  <span className="cifra shrink-0 font-semibold text-texto">{criterio.nota !== null ? `${formatearNumero(criterio.nota, 1)} / 20` : '-'}</span>
                </div>
                <BarraProgreso valor={criterio.nota ?? 0} maximo={20} etiqueta={`Nota de ${criterio.criterio}`} color="linear-gradient(90deg, #2F7D5B, #8FD3AE)" />
                <span className="text-[11.5px] text-texto-2">Aporta {formatearNumero(((criterio.nota ?? 0) * criterio.peso) / 100, 2)} puntos a la nota final</span>
              </li>
            ))}
          </ul>
          {sustentacion.observaciones && (
            <div className="mt-3 rounded-lg bg-fondo p-3 text-[12.5px]">
              <p className="font-semibold text-texto">Observaciones del evaluador</p>
              <p className="mt-1 text-texto-2">{sustentacion.observaciones}</p>
            </div>
          )}
        </section>
      )}
      <section className="rounded-xl border border-borde p-4">
        <h4 className="flex items-center gap-2 text-[13.5px] font-bold text-texto"><CalendarCheck className="size-4 text-acento" aria-hidden />Cronología</h4>
        <ol className="mt-3 flex flex-col gap-3">
          {hitos.map(({ icono: Icono, titulo, fecha, detalle }) => (
            <li key={titulo} className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-acento-suave text-acento"><Icono className="size-4" aria-hidden /></span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-texto">{titulo}</p>
                <p className="text-[12px] text-texto-2">{fecha}</p>
                <p className="break-words text-[12px] text-texto-2">{detalle}</p>
              </div>
            </li>
          ))}
        </ol>
        {(constancia || diploma) && (
          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-borde pt-3 text-[12px]">
            {constancia && <div className="min-w-0"><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Código de verificación</dt><dd className="cifra break-all text-texto">{constancia.codigoVerificacion}</dd></div>}
            {constancia && <div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Horas reconocidas</dt><dd className="text-texto">{constancia.horas} h</dd></div>}
            {diploma && <div className="col-span-2 min-w-0"><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Diploma que habilita el MID</dt><dd className="cifra break-all text-texto">{diploma.codigo} · nota {formatearNumero(diploma.nota, 2)}</dd></div>}
          </dl>
        )}
      </section>
    </div>
  );
}
