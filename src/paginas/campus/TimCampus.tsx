import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CircleCheck, ClipboardCheck, ListChecks } from 'lucide-react';
import { AvisoSinAcceso } from '../../componentes/campus/AvisoSinAcceso';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { estadosElemento, nombresTipoPregunta } from '../../datos/academico/presentacionCampus';
import { useContextoElemento } from '../../hooks/useContextoElemento';
import { intentosDe, intentosExtraPara } from '../../motores/academico/progreso';
import { useAcademicoStore } from '../../store/useAcademicoStore';
import { useCampusStore } from '../../store/useCampusStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import { formatearFechaHora } from '../../utilidades/fechas';
import { formatearNumero } from '../../utilidades/formatos';

export default function TimCampus() {
  const { id } = useParams();
  const persona = usePersonaSesion();
  const contexto = useContextoElemento(persona?.id, id);
  const tim = useAcademicoStore((estado) => estado.tims.find((item) => item.id === id));
  const preguntas = useAcademicoStore((estado) => estado.preguntas);
  const intentos = useCampusStore((estado) => estado.intentos);
  const matriculas = useCampusStore((estado) => estado.matriculas);
  if (!persona || !tim || !contexto) return <AvisoSinAcceso texto="El trabajo integrador no existe." />;
  if (!contexto.acceso.acceso) return <AvisoSinAcceso programaId={contexto.programa.id} texto="Tu acceso a este programa no está vigente." />;
  if (contexto.estado === 'bloqueado') return <AvisoSinAcceso programaId={contexto.programa.id} texto="El TIM se habilita al aprobar los cinco temas del módulo." />;
  const lista = intentosDe(persona.id, tim.id, intentos);
  const permitidos = contexto.curso.reglas.intentosMaximos + intentosExtraPara(persona.id, tim.id, matriculas);
  const tipos = [...new Set(tim.preguntaIds.map((preguntaId) => preguntas.find((pregunta) => pregunta.id === preguntaId)?.tipo).filter(Boolean))];
  const estado = estadosElemento[contexto.estado];
  return (
    <div className="flex flex-col gap-5">
      <Link to={`/campus/programas/${contexto.programa.id}`} className="inline-flex min-h-11 w-fit items-center gap-1.5 text-[13px] font-semibold text-acento md:min-h-0"><ArrowLeft className="size-4" aria-hidden />{contexto.programa.nombre}</Link>
      <Tarjeta>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-texto-3">{contexto.curso.nombre} · {contexto.modulo.nombre} · 5 h</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-texto">{tim.nombre}</h2>
          </div>
          <Insignia tono={estado.tono} icono={estado.icono}>{estado.texto}</Insignia>
        </div>
        <p className="mt-3 text-[14px] text-texto-2">{tim.instrucciones}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-4">
          <div className="rounded-xl bg-fondo p-3"><p className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Ítems</p><p className="cifra text-lg font-bold">{tim.preguntaIds.length}</p></div>
          <div className="rounded-xl bg-fondo p-3"><p className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Tiempo</p><p className="cifra text-lg font-bold">60 min</p></div>
          <div className="rounded-xl bg-fondo p-3"><p className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Intentos</p><p className="cifra text-lg font-bold">{lista.length} / {permitidos}</p></div>
          <div className="rounded-xl bg-fondo p-3"><p className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Nota</p><p className="cifra text-lg font-bold">{contexto.resumen.notas[tim.id]?.nota !== null && contexto.resumen.notas[tim.id] ? formatearNumero(contexto.resumen.notas[tim.id].nota ?? 0, 2) : '-'}</p></div>
        </div>
        <p className="mt-4 flex flex-wrap items-center gap-1.5 text-[12.5px] text-texto-2"><ListChecks className="size-4" aria-hidden />Formulario estructurado con: {tipos.map((tipo) => (tipo ? nombresTipoPregunta[tipo] : '')).join(', ')}. Sin revisión docente: se califica automáticamente.</p>
        {lista.length > 0 && (
          <ul className="mt-4 flex flex-col gap-1.5 text-[13px]">
            {lista.map((intento, indice) => <li key={intento.id} className="flex flex-wrap items-center gap-2"><Insignia tono={intento.aprobado ? 'exito' : 'error'}>Intento {indice + 1}</Insignia><span className="cifra font-semibold">{formatearNumero(intento.nota, 2)}</span><span className="text-texto-2">{formatearFechaHora(intento.fin)}</span></li>)}
          </ul>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          {contexto.estado === 'aprobado'
            ? <Insignia tono="exito" icono={CircleCheck}>TIM aprobado</Insignia>
            : contexto.estado === 'bloqueado_por_intentos'
              ? <p className="text-[13px] text-error">Agotaste los intentos. Solicita un intento adicional al área académica.</p>
              : <EnlaceBoton to={`/campus/evaluaciones/tim/${tim.id}`} icono={ClipboardCheck}>Iniciar TIM</EnlaceBoton>}
          {contexto.siguiente && contexto.estado === 'aprobado' && <EnlaceBoton to={`/campus/temas/${contexto.siguiente.id}`} variante="secundario" iconoDerecha={ArrowRight}>Siguiente módulo</EnlaceBoton>}
        </div>
      </Tarjeta>
    </div>
  );
}
