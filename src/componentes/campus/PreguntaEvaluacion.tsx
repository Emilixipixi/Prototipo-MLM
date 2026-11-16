import { ArrowDown, ArrowUp, CircleCheck, CircleX } from 'lucide-react';
import { nombresTipoPregunta } from '../../datos/academico/presentacionCampus';
import { mezclar } from '../../motores/academico/calificacion';
import type { Pregunta, Respuesta } from '../../tipos/academico';
import { ordenInicial } from './ordenPreguntas';
import { unirClases } from '../../utilidades/clases';

interface PropsPregunta {
  pregunta: Pregunta; numero: number; respuesta: Respuesta | undefined; alResponder: (valor: Respuesta) => void;
  revision?: { correcta: boolean; mostrar: boolean } | null;
}

const claseOpcion = 'flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-[13.5px] transition-colors focus-within:ring-2 focus-within:ring-acento-suave';

export function PreguntaEvaluacion({ pregunta, numero, respuesta, alResponder, revision }: PropsPregunta) {
  const bloqueada = Boolean(revision);
  const nombre = `pregunta-${pregunta.id}`;
  return (
    <fieldset className={unirClases('rounded-tarjeta border bg-superficie p-4 sm:p-5', revision ? (revision.correcta ? 'border-green-300' : 'border-red-300') : 'border-borde')}>
      <legend className="sr-only">Pregunta {numero}</legend>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <p className="min-w-0 flex-1 text-[14.5px] font-semibold text-texto"><span className="cifra mr-1 text-acento">{numero}.</span>{pregunta.enunciado}</p>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-texto-2">{nombresTipoPregunta[pregunta.tipo]}</span>
      </div>

      {(pregunta.tipo === 'opcion_multiple' || pregunta.tipo === 'verdadero_falso') && (
        <div className="flex flex-col gap-2" role="radiogroup">
          {pregunta.opciones.map((opcion, indice) => (
            <label key={opcion} className={unirClases(claseOpcion, respuesta === indice ? 'border-acento bg-acento-suave/40' : 'border-borde hover:border-texto-3')}>
              <input type="radio" name={nombre} className="mt-1 accent-[#0E7490]" disabled={bloqueada} checked={respuesta === indice} onChange={() => alResponder(indice)} />
              <span>{opcion}</span>
            </label>
          ))}
        </div>
      )}

      {pregunta.tipo === 'seleccion_multiple' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-texto-2">Marca todas las opciones correctas.</p>
          {pregunta.opciones.map((opcion, indice) => {
            const lista = Array.isArray(respuesta) ? respuesta : [];
            const marcada = lista.includes(indice);
            return (
              <label key={opcion} className={unirClases(claseOpcion, marcada ? 'border-acento bg-acento-suave/40' : 'border-borde hover:border-texto-3')}>
                <input type="checkbox" className="mt-1 accent-[#0E7490]" disabled={bloqueada} checked={marcada}
                  onChange={() => alResponder(marcada ? lista.filter((valor) => valor !== indice) : [...lista, indice])} />
                <span>{opcion}</span>
              </label>
            );
          })}
        </div>
      )}

      {pregunta.tipo === 'emparejar' && (
        <div className="flex flex-col gap-2.5">
          {(pregunta.pares ?? []).map(([izquierda], indice) => {
            const lista = Array.isArray(respuesta) ? respuesta : [];
            const opciones = mezclar((pregunta.pares ?? []).map((_par, posicion) => posicion), `${pregunta.id}|pares`);
            return (
              <div key={izquierda} className="grid gap-1.5 rounded-xl border border-borde p-3 md:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)] md:items-center">
                <label htmlFor={`${nombre}-${indice}`} className="text-[13.5px] font-semibold text-texto">{izquierda}</label>
                <select id={`${nombre}-${indice}`} disabled={bloqueada} value={lista[indice] ?? -1}
                  onChange={(evento) => { const nueva = [...(pregunta.pares ?? []).map((_par, posicion) => lista[posicion] ?? -1)]; nueva[indice] = Number(evento.target.value); alResponder(nueva); }}
                  className="min-h-11 w-full min-w-0 rounded-xl border border-borde bg-superficie px-3 text-[13px] outline-none focus:border-acento focus:ring-2 focus:ring-acento-suave">
                  <option value={-1}>Selecciona una definición</option>
                  {opciones.map((posicion) => <option key={posicion} value={posicion}>{(pregunta.pares ?? [])[posicion][1]}</option>)}
                </select>
              </div>
            );
          })}
        </div>
      )}

      {pregunta.tipo === 'ordenar' && (
        <ol className="flex flex-col gap-2">
          {(Array.isArray(respuesta) ? respuesta : ordenInicial(pregunta)).map((indicePaso, posicion, lista) => {
            const mover = (destino: number) => {
              const nueva = [...lista];
              [nueva[posicion], nueva[destino]] = [nueva[destino], nueva[posicion]];
              alResponder(nueva);
            };
            return (
              <li key={indicePaso} className="flex items-center gap-2 rounded-xl border border-borde px-3 py-1.5">
                <span className="cifra w-5 text-texto-3">{posicion + 1}</span>
                <span className="min-w-0 flex-1 text-[13.5px] text-texto">{(pregunta.orden ?? [])[indicePaso]}</span>
                <button type="button" aria-label="Subir paso" disabled={bloqueada || posicion === 0} onClick={() => mover(posicion - 1)} className="grid size-11 place-items-center rounded-lg hover:bg-fondo disabled:opacity-30 md:size-9"><ArrowUp className="size-4" aria-hidden /></button>
                <button type="button" aria-label="Bajar paso" disabled={bloqueada || posicion === lista.length - 1} onClick={() => mover(posicion + 1)} className="grid size-11 place-items-center rounded-lg hover:bg-fondo disabled:opacity-30 md:size-9"><ArrowDown className="size-4" aria-hidden /></button>
              </li>
            );
          })}
        </ol>
      )}

      {pregunta.tipo === 'numerica' && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={nombre} className="text-xs text-texto-2">Escribe solo el número{pregunta.tolerancia ? ` (se acepta una diferencia de hasta ${pregunta.tolerancia})` : ''}.</label>
          <input id={nombre} type="number" inputMode="decimal" step="any" disabled={bloqueada} value={typeof respuesta === 'number' ? respuesta : ''}
            onChange={(evento) => alResponder(evento.target.value === '' ? null : Number(evento.target.value))}
            className="min-h-11 w-full max-w-[220px] rounded-xl border border-borde bg-superficie px-3 text-sm outline-none focus:border-acento focus:ring-2 focus:ring-acento-suave" />
        </div>
      )}

      {revision && (
        <p className={unirClases('mt-3 flex items-start gap-2 rounded-lg p-2.5 text-[13px]', revision.correcta ? 'bg-green-50 text-[#166534]' : 'bg-red-50 text-[#991B1B]')}>
          {revision.correcta ? <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden /> : <CircleX className="mt-0.5 size-4 shrink-0" aria-hidden />}
          <span>{revision.correcta ? 'Respuesta correcta.' : 'Respuesta incorrecta.'}{revision.mostrar && pregunta.explicacion ? ` ${pregunta.explicacion}` : ''}</span>
        </p>
      )}
    </fieldset>
  );
}
