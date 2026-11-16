import { useState } from 'react';
import { ClipboardPen, Inbox, Send } from 'lucide-react';
import { LineaMid } from '../../componentes/campus/LineaMid';
import { Boton } from '../../componentes/ui/Boton';
import { EstadoVacio } from '../../componentes/ui/EstadoVacio';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { useToast } from '../../componentes/ui/useToast';
import { calificarSustentacion, nombresEstadoMid, notaRubrica } from '../../servicios/mid';
import { useCampusStore } from '../../store/useCampusStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { SustentacionMid } from '../../tipos/academico';
import { formatearFecha } from '../../utilidades/fechas';
import { formatearNumero } from '../../utilidades/formatos';

function FormularioRubrica({ sustentacion, evaluadorId }: { sustentacion: SustentacionMid; evaluadorId: string }) {
  const toast = useToast();
  const [notas, setNotas] = useState<string[]>(sustentacion.rubrica.map(() => ''));
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState<string | null>(null);
  const numeros = notas.map((nota) => (nota === '' ? null : Number(nota)));
  const parcial = notaRubrica(sustentacion.rubrica.map((criterio, indice) => ({ ...criterio, nota: numeros[indice] })));
  const guardar = () => {
    if (numeros.some((nota) => nota === null)) { setError('Califica los cuatro criterios.'); return; }
    const resultado = calificarSustentacion(sustentacion.id, evaluadorId, numeros.map((nota) => nota ?? 0), observaciones);
    if (!resultado.ok) { setError(resultado.error); return; }
    toast.exito(`Sustentación ${resultado.valor.sustentacion.estado}`, resultado.valor.constancia ? `Se emitió la constancia ${resultado.valor.constancia.codigo}.` : 'El resultado se notificó al estudiante.');
  };
  return (
    <form className="mt-4 flex flex-col gap-3" onSubmit={(evento) => { evento.preventDefault(); guardar(); }}>
      <fieldset className="grid gap-2 sm:grid-cols-2">
        <legend className="mb-1 text-[13px] font-semibold text-texto">Rúbrica (0 a 20 por criterio)</legend>
        {sustentacion.rubrica.map((criterio, indice) => (
          <label key={criterio.criterio} className="flex min-h-11 items-center justify-between gap-2 rounded-xl border border-borde px-3 text-[13px]">
            <span>{criterio.criterio} <span className="text-texto-3">({criterio.peso}%)</span></span>
            <input type="number" min={0} max={20} step={0.5} inputMode="decimal" value={notas[indice]} aria-label={`Nota de ${criterio.criterio}`}
              onChange={(evento) => setNotas((actual) => actual.map((valor, posicion) => (posicion === indice ? evento.target.value : valor)))}
              className="h-9 w-20 rounded-lg border border-borde px-2 text-right text-sm outline-none focus:border-acento focus:ring-2 focus:ring-acento-suave" />
          </label>
        ))}
      </fieldset>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`obs-${sustentacion.id}`} className="text-[13px] font-semibold text-texto">Observaciones (obligatorias)</label>
        <textarea id={`obs-${sustentacion.id}`} rows={3} value={observaciones} onChange={(evento) => setObservaciones(evento.target.value)} className="rounded-xl border border-borde bg-superficie p-3 text-sm outline-none focus:border-acento focus:ring-2 focus:ring-acento-suave" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-texto-2">Nota ponderada: <b className="cifra text-texto">{parcial !== null ? formatearNumero(parcial, 2) : '-'}</b> (aprueba con más de 14)</p>
        <Boton type="submit" icono={Send}>Registrar calificación</Boton>
      </div>
      {error && <p className="text-[13px] font-medium text-error">{error}</p>}
    </form>
  );
}

export default function BandejaMid() {
  const persona = usePersonaSesion();
  const sustentaciones = useCampusStore((estado) => estado.sustentaciones);
  const personas = usePersonasStore((estado) => estado.personas);
  if (!persona) return null;
  const asignadas = sustentaciones.filter((item) => item.evaluadorId === persona.id);
  const pendientes = asignadas.filter((item) => item.estado === 'asignado');
  const resueltas = asignadas.filter((item) => item.estado !== 'asignado');
  const tarjeta = (item: SustentacionMid, editable: boolean) => {
    const estudiante = personas.find((candidato) => candidato.id === item.personaId);
    return (
      <Tarjeta key={item.id} titulo={item.titulo} subtitulo={`${item.id} · ${estudiante ? `${estudiante.nombres} ${estudiante.apellidos}` : item.personaId} · sustentación ${item.fechaAsignada ? formatearFecha(item.fechaAsignada) : '-'}`} icono={ClipboardPen}
        acciones={<Insignia tono={item.estado === 'aprobado' ? 'exito' : item.estado === 'desaprobado' ? 'error' : 'info'}>{nombresEstadoMid[item.estado]}</Insignia>}>
        <LineaMid estado={item.estado} />
        <p className="mt-3 text-[13px] text-texto-2">{item.resumen}</p>
        <p className="cifra mt-1 text-xs text-texto-3">Archivo: {item.archivo}</p>
        {editable ? <FormularioRubrica sustentacion={item} evaluadorId={persona.id} /> : (
          <p className="mt-3 rounded-xl bg-fondo p-3 text-[13px]">Nota final <b className="cifra">{item.notaFinal !== null ? formatearNumero(item.notaFinal, 2) : '-'}</b>. {item.observaciones}</p>
        )}
      </Tarjeta>
    );
  };
  return (
    <div className="flex flex-col gap-5">
      <p className="rounded-xl bg-acento-suave px-3 py-2.5 text-[12.5px] text-[#155E75]">Solo ves las sustentaciones que te asignó el área académica. La calificación MID es la única manual del Campus ERICK y no modifica los diplomas.</p>
      {asignadas.length === 0 && <Tarjeta><EstadoVacio icono={Inbox} titulo="No tienes sustentaciones asignadas" texto="Cuando el área académica te asigne una sustentación MID aparecerá aquí." /></Tarjeta>}
      {pendientes.map((item) => tarjeta(item, true))}
      {resueltas.length > 0 && <h3 className="text-[15px] font-bold text-texto">Calificadas</h3>}
      {resueltas.map((item) => tarjeta(item, false))}
    </div>
  );
}
