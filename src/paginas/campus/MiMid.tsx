import { useState } from 'react';
import { FileUp, Info, Microscope, Send } from 'lucide-react';
import { LineaMid } from '../../componentes/campus/LineaMid';
import { DetalleMid } from '../../componentes/campus/DetalleMid';
import { Boton } from '../../componentes/ui/Boton';
import { Campo } from '../../componentes/ui/Campo';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { EstadoVacio } from '../../componentes/ui/EstadoVacio';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { useToast } from '../../componentes/ui/useToast';
import { relativoHoy } from '../../datos/academico/fechasCampus';
import { midDisponible, nombresEstadoMid, solicitarMid } from '../../servicios/mid';
import { useCampusStore } from '../../store/useCampusStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import { formatearFecha } from '../../utilidades/fechas';
import { formatearNumero } from '../../utilidades/formatos';

export default function MiMid() {
  const persona = usePersonaSesion();
  const sustentaciones = useCampusStore((estado) => estado.sustentaciones);
  useCampusStore((estado) => estado.documentos);
  const personas = usePersonasStore((estado) => estado.personas);
  const toast = useToast();
  const [titulo, setTitulo] = useState('');
  const [resumen, setResumen] = useState('');
  const [archivo, setArchivo] = useState('');
  const [fecha, setFecha] = useState(relativoHoy(14));
  const [error, setError] = useState<string | null>(null);
  if (!persona) return null;
  const disponible = midDisponible(persona.id);
  const propias = sustentaciones.filter((item) => item.personaId === persona.id).sort((a, b) => b.id.localeCompare(a.id));
  const abierta = propias.find((item) => item.estado !== 'desaprobado');

  const enviar = () => {
    const resultado = solicitarMid(persona.id, { titulo, resumen, archivo, fechaPropuesta: fecha });
    if (!resultado.ok) { setError(resultado.error); return; }
    setError(null);
    toast.exito('Solicitud enviada', `${resultado.valor.id}: el área académica asignará un evaluador.`);
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="flex items-start gap-2 rounded-xl bg-oro-suave px-3 py-2.5 text-[12.5px] text-[#7C4A03]"><Info className="mt-0.5 size-4 shrink-0" aria-hidden />El Módulo de Investigación y Desarrollo (20 h) es opcional y es la única evaluación manual: la califica un evaluador con una rúbrica. No modifica tu diploma.</p>
      {!disponible && propias.length === 0 && (
        <Tarjeta><EstadoVacio icono={Microscope} titulo="El MID aún no está disponible" texto="Se habilita cuando cursas o apruebas un diplomado que lo incluye." accion={<EnlaceBoton to="/campus/programas">Mis programas</EnlaceBoton>} /></Tarjeta>
      )}
      {propias.map((item) => {
        const evaluador = personas.find((candidato) => candidato.id === item.evaluadorId);
        return (
          <Tarjeta key={item.id} titulo={item.titulo} subtitulo={`${item.id} · propuesta para el ${formatearFecha(item.fechaPropuesta)}`} icono={Microscope}
            acciones={<Insignia tono={item.estado === 'aprobado' ? 'exito' : item.estado === 'desaprobado' ? 'error' : 'info'}>{nombresEstadoMid[item.estado]}</Insignia>}>
            <LineaMid estado={item.estado} />
            <p className="mt-3 text-[13px] text-texto-2">{item.resumen}</p>
            <dl className="mt-3 grid gap-2 text-[13px] sm:grid-cols-3">
              <div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Archivo</dt><dd className="cifra">{item.archivo}</dd></div>
              <div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Evaluador</dt><dd>{evaluador ? `${evaluador.nombres} ${evaluador.apellidos}` : 'Por asignar'}</dd></div>
              <div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Fecha asignada</dt><dd>{item.fechaAsignada ? formatearFecha(item.fechaAsignada) : '-'}</dd></div>
            </dl>
            {item.notaFinal !== null && (
              <div className="mt-3 rounded-xl bg-fondo p-3 text-[13px]">
                <p className="font-semibold">Nota final: <span className="cifra">{formatearNumero(item.notaFinal, 2)}</span></p>
                <ul className="mt-1 grid gap-x-8 gap-y-1 sm:grid-cols-2">{item.rubrica.map((criterio) => <li key={criterio.criterio} className="flex justify-between gap-2"><span>{criterio.criterio} ({criterio.peso}%)</span><span className="cifra">{criterio.nota ?? '-'}</span></li>)}</ul>
                <p className="mt-2 text-texto-2">{item.observaciones}</p>
                {item.estado === 'aprobado' && <EnlaceBoton to="/campus/certificados" tamano="sm" className="mt-2">Ver mi constancia</EnlaceBoton>}
              </div>
            )}
            <DetalleMid sustentacion={item} evaluador={evaluador ? `${evaluador.nombres} ${evaluador.apellidos}` : null} />
          </Tarjeta>
        );
      })}
      {disponible && !abierta && (
        <Tarjeta titulo="Solicitar sustentación" subtitulo={`${disponible.programa.nombre} · vinculado a ${disponible.diplomado.nombre}`} icono={Send}>
          <form className="flex flex-col gap-3" onSubmit={(evento) => { evento.preventDefault(); enviar(); }}>
            <Campo etiqueta="Título del trabajo" value={titulo} onChange={(evento) => setTitulo(evento.target.value)} />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="resumen-mid" className="text-[13px] font-semibold text-texto">Resumen</label>
              <textarea id="resumen-mid" rows={4} value={resumen} onChange={(evento) => setResumen(evento.target.value)} className="rounded-xl border border-borde bg-superficie p-3 text-sm outline-none focus:border-acento focus:ring-2 focus:ring-acento-suave" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="archivo-mid" className="text-[13px] font-semibold text-texto">Archivo del trabajo (solo se registra el nombre)</label>
                <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-borde px-3 text-[13px] text-texto-2 hover:border-acento">
                  <FileUp className="size-4" aria-hidden /><span className="min-w-0 truncate">{archivo || 'Seleccionar archivo'}</span>
                  <input id="archivo-mid" type="file" className="sr-only" onChange={(evento) => setArchivo(evento.target.files?.[0]?.name ?? '')} />
                </label>
              </div>
              <Campo etiqueta="Fecha propuesta de sustentación" type="date" value={fecha} min={relativoHoy(0)} onChange={(evento) => setFecha(evento.target.value)} />
            </div>
            {error && <p className="text-[13px] font-medium text-error">{error}</p>}
            <Boton type="submit" icono={Send} className="self-start">Enviar solicitud</Boton>
          </form>
        </Tarjeta>
      )}
    </div>
  );
}
