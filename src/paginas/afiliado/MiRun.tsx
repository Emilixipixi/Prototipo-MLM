import { Award, CalendarCheck, Flag, Info, Wallet } from 'lucide-react';
import { BarraProgreso } from '../../componentes/rangos/BarraProgreso';
import { ChecklistRequisitos } from '../../componentes/rangos/ChecklistRequisitos';
import { InsigniaRun } from '../../componentes/rangos/InsigniaRun';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { TerminoInfo } from '../../componentes/ui/TerminoInfo';
import { ordenRuns } from '../../datos/reglas';
import { useDatosAfiliado } from '../../hooks/useDatosAfiliado';
import { unirClases } from '../../utilidades/clases';
import { formatearNumero } from '../../utilidades/formatos';

export default function MiRun() {
  const { persona, periodoActual, periodoCerrado, calificaciones } = useDatosAfiliado();
  if (!persona || !periodoActual) return null;
  const actual = calificaciones[periodoActual.id]?.find((item) => item.personaId === persona.id);
  const cerrada = periodoCerrado ? calificaciones[periodoCerrado.id]?.find((item) => item.personaId === persona.id) : undefined;
  const runCobro = cerrada?.runCobro ?? null;
  const runHistorico = actual?.runHistorico ?? cerrada?.runHistorico ?? null;
  const proyectado = actual?.runCobro ?? null;
  const requisitos = actual?.desgloseSiguiente ?? [];
  const avance = requisitos.length > 0 ? requisitos.reduce((suma, requisito) => suma + Math.min(1, requisito.requerido > 0 ? requisito.logrado / requisito.requerido : 0), 0) / requisitos.length : 0;
  const cumplidos = requisitos.filter((requisito) => requisito.cumple).length;

  return (
    <div className="flex flex-col gap-5">
      <Tarjeta titulo="Escalera de rangos RUN" subtitulo="Once rangos del catálogo; las condiciones son valores ficticios editables por corporativo." icono={Award}>
        <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5">
          <ol className="flex min-w-[880px] items-end gap-1.5">
            {ordenRuns.map((run, indice) => {
              const esCobro = run === runCobro;
              const esHistorico = run === runHistorico;
              const esSiguiente = run === actual?.siguienteRun;
              const alcanzado = ordenRuns.indexOf(runHistorico ?? 'RUN300') >= indice && runHistorico !== null;
              return (
                <li key={run} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex h-12 flex-col items-center justify-end gap-1">
                    {esHistorico && <span className="inline-flex items-center gap-1 rounded-full border border-oro bg-oro-suave px-1.5 text-[10px] font-bold text-oro"><Award className="size-3" aria-hidden />Histórico</span>}
                    {esCobro && <span className="inline-flex items-center gap-1 rounded-full bg-primario px-1.5 text-[10px] font-bold text-white"><Wallet className="size-3" aria-hidden />Cobro</span>}
                    {esSiguiente && <span className="rounded-full bg-acento-suave px-1.5 text-[10px] font-bold text-acento">Siguiente</span>}
                  </div>
                  <div
                    className={unirClases(
                      'w-full rounded-lg border text-center',
                      esHistorico ? 'border-oro bg-oro-suave' : esCobro ? 'border-primario bg-primario text-white' : esSiguiente ? 'border-acento border-dashed bg-acento-suave/40' : alcanzado ? 'border-borde bg-primario-suave' : 'border-borde bg-superficie',
                    )}
                    style={{ height: `${36 + indice * 7}px` }}
                  />
                  <span className={unirClases('cifra text-[11px] font-semibold', esCobro || esHistorico || esSiguiente ? 'text-texto' : 'text-texto-3')}>{run}</span>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-[12.5px] text-texto-2">
          <span className="flex items-center gap-1.5"><InsigniaRun run={runCobro} tipo="cobro" /> último cierre ({periodoCerrado?.id.replace('DEMO-', '')}) <TerminoInfo termino="runCobro" /></span>
          <span className="flex items-center gap-1.5"><InsigniaRun run={runHistorico} tipo="historico" /> máximo de trayectoria <TerminoInfo termino="runHistorico" /></span>
        </div>
      </Tarjeta>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Tarjeta titulo={`Progreso hacia ${actual?.siguienteRun ?? '-'}`} subtitulo={`Evaluado con el ciclo en curso ${periodoActual.id}`} icono={Flag}>
          <div className="mb-5 flex flex-wrap items-center gap-4">
            <p className="cifra text-[32px] font-semibold text-texto">{formatearNumero(avance * 100)}%</p>
            <div className="min-w-[200px] flex-1">
              <p className="text-[13px] font-semibold text-texto">{cumplidos} de {requisitos.length} requisitos cumplidos</p>
              <BarraProgreso valor={avance * 100} maximo={100} etiqueta="Avance hacia el siguiente RUN" />
            </div>
          </div>
          <ChecklistRequisitos requisitos={requisitos} />
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-fondo px-3 py-2 text-xs text-texto-2"><Info className="mt-0.5 size-4 shrink-0" aria-hidden />El avance es una proyección del ciclo abierto; el RUN de Cobro definitivo se fija al cerrar el período.</p>
        </Tarjeta>
        <div className="flex min-w-0 flex-col gap-4">
          <Tarjeta titulo="Resultado del último cierre" subtitulo={periodoCerrado?.id} icono={CalendarCheck}>
            <div className="mb-3 flex flex-wrap gap-2"><InsigniaRun run={runCobro} tipo="cobro" tamano="md" /></div>
            <ChecklistRequisitos requisitos={cerrada?.desglose ?? []} mostrarFuente={false} />
          </Tarjeta>
          <Tarjeta titulo="Proyección del ciclo en curso" icono={Wallet}>
            <p className="text-[13px] text-texto-2">Con el volumen actual de {periodoActual.id}, tu RUN de Cobro proyectado es <InsigniaRun run={proyectado} tipo="cobro" />. VP grupal {formatearNumero(actual?.vpGrupal ?? 0)}, VP personal {formatearNumero(actual?.vpPersonal ?? 0)}.</p>
            <EnlaceBoton to="/afiliado/formacion" variante="fantasma" tamano="sm" className="mt-2">Revisar mi formación</EnlaceBoton>
          </Tarjeta>
        </div>
      </div>
    </div>
  );
}
