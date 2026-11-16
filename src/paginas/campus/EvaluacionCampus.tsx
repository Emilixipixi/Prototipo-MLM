import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Award, Clock, RotateCcw, Send } from 'lucide-react';
import { AvisoSinAcceso } from '../../componentes/campus/AvisoSinAcceso';
import { ordenInicial } from '../../componentes/campus/ordenPreguntas';
import { PreguntaEvaluacion } from '../../componentes/campus/PreguntaEvaluacion';
import { Boton } from '../../componentes/ui/Boton';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { useToast } from '../../componentes/ui/useToast';
import { enviarIntento, iniciarIntento, type IntentoEnCurso, type ResultadoEnvio } from '../../servicios/evaluaciones';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { AmbitoEvaluacion, Respuesta } from '../../tipos/academico';
import { unirClases } from '../../utilidades/clases';
import { formatearNumero } from '../../utilidades/formatos';

function respuestasIniciales(enCurso: IntentoEnCurso | null): Record<string, Respuesta> {
  if (!enCurso) return {};
  return Object.fromEntries(enCurso.preguntas.filter((pregunta) => pregunta.tipo === 'ordenar').map((pregunta) => [pregunta.id, ordenInicial(pregunta)]));
}

export default function EvaluacionCampus() {
  const { ambito, id } = useParams();
  return <ContenidoEvaluacion key={`${ambito}-${id}`} ambito={ambito} id={id} />;
}

function ContenidoEvaluacion({ ambito, id }: { ambito?: string; id?: string }) {
  const persona = usePersonaSesion();
  const toast = useToast();
  const tipo: AmbitoEvaluacion = ambito === 'tim' ? 'tim' : 'tema';
  const crear = useCallback(() => (persona && id ? iniciarIntento(persona.id, tipo, id) : null), [persona, id, tipo]);
  const [inicio, setInicio] = useState(crear);
  const enCurso = inicio?.ok ? inicio.valor : null;
  const [respuestas, setRespuestas] = useState<Record<string, Respuesta>>(() => respuestasIniciales(enCurso));
  const [restante, setRestante] = useState(enCurso?.segundos ?? 0);
  const [resultado, setResultado] = useState<ResultadoEnvio | null>(null);
  const enviado = useRef(false);
  const [avisoPendientes, setAvisoPendientes] = useState(false);

  const enviar = useCallback(() => {
    if (!persona || !enCurso || enviado.current) return;
    enviado.current = true;
    const envio = enviarIntento(persona.id, enCurso, respuestas);
    if (!envio.ok) {
      toast.error('No se pudo enviar', envio.error);
      enviado.current = false;
      return;
    }
    setResultado(envio.valor);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [persona, enCurso, respuestas, toast]);

  const enviarRef = useRef(enviar);
  useEffect(() => { enviarRef.current = enviar; }, [enviar]);

  useEffect(() => {
    if (!enCurso || resultado) return undefined;
    const temporizador = window.setInterval(() => {
      setRestante((valor) => {
        if (valor <= 1) window.setTimeout(() => enviarRef.current(), 0);
        return Math.max(0, valor - 1);
      });
    }, 1000);
    return () => window.clearInterval(temporizador);
  }, [enCurso, resultado]);

  if (!persona || !id) return <AvisoSinAcceso texto="Evaluación no disponible." />;
  if (!inicio || !inicio.ok || !enCurso) return <AvisoSinAcceso texto={inicio && !inicio.ok ? inicio.error : 'Evaluación no disponible.'} />;

  const volver = tipo === 'tema' ? `/campus/temas/${id}` : `/campus/tim/${id}`;
  const respondidas = enCurso.preguntas.filter((pregunta) => {
    const valor = respuestas[pregunta.id];
    return valor !== undefined && valor !== null && (!Array.isArray(valor) || valor.length > 0);
  }).length;
  const reintentar = () => {
    const nuevo = crear();
    enviado.current = false;
    setInicio(nuevo);
    setResultado(null);
    setRespuestas(respuestasIniciales(nuevo?.ok ? nuevo.valor : null));
    setRestante(nuevo?.ok ? nuevo.valor.segundos : 0);
    setAvisoPendientes(false);
  };
  const minutos = Math.floor(restante / 60);
  const segundos = restante % 60;

  return (
    <div className="flex flex-col gap-5">
      <Link to={volver} className="inline-flex min-h-11 w-fit items-center gap-1.5 text-[13px] font-semibold text-acento md:min-h-0"><ArrowLeft className="size-4" aria-hidden />Volver al {tipo === 'tema' ? 'tema' : 'TIM'}</Link>
      {resultado ? (
        <Tarjeta className={unirClases('border-2', resultado.intento.aprobado ? 'border-green-300' : 'border-red-300')}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className={unirClases('grid size-24 shrink-0 place-items-center rounded-full', resultado.intento.aprobado ? 'bg-green-100 text-exito' : 'bg-red-100 text-error')}>
              <span className="cifra text-[28px] font-extrabold">{formatearNumero(resultado.intento.nota, 2)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <Insignia tono={resultado.intento.aprobado ? 'exito' : 'error'}>{resultado.intento.aprobado ? 'Aprobado' : 'Desaprobado'}</Insignia>
              <h2 className="mt-2 text-xl font-extrabold text-texto">{resultado.calificacion.correctas} de {resultado.calificacion.total} respuestas correctas</h2>
              <p className="text-[13px] text-texto-2">Nota registrada: <b className="cifra">{resultado.registrada !== null ? formatearNumero(resultado.registrada, 2) : '-'}</b>. Se aprueba con nota mayor a 14.{!resultado.intento.aprobado ? ` Te quedan ${resultado.restantes} ${resultado.restantes === 1 ? 'intento' : 'intentos'}.` : ''}</p>
            </div>
            <div className="flex flex-col gap-2">
              <EnlaceBoton to={volver} variante="secundario">Volver</EnlaceBoton>
              {!resultado.intento.aprobado && resultado.restantes > 0 && <Boton icono={RotateCcw} onClick={reintentar}>Nuevo intento</Boton>}
            </div>
          </div>
          {resultado.documentos.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-oro-suave p-3 text-[13px] text-[#7C4A03]">
              <Award className="size-5 shrink-0" aria-hidden />
              <p className="min-w-0 flex-1"><b>¡Felicitaciones!</b> Se emitió automáticamente: {resultado.documentos.map((documento) => documento.codigo).join(', ')}.</p>
              <EnlaceBoton to="/campus/certificados" tamano="sm">Ver mis certificados</EnlaceBoton>
            </div>
          )}
        </Tarjeta>
      ) : (
        <div className="sticky top-[118px] z-20 flex flex-wrap items-center justify-between gap-3 rounded-tarjeta border border-borde bg-superficie/95 px-4 py-3 shadow-tarjeta backdrop-blur sm:top-[124px]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Intento {enCurso.numero} de {enCurso.permitidos}</p>
            <p className="text-[13px] text-texto-2"><span className="cifra font-semibold text-texto">{respondidas}</span> de {enCurso.preguntas.length} respondidas</p>
          </div>
          <span role="timer" aria-live="off" className={unirClases('cifra inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-lg font-bold', restante < 120 ? 'bg-red-50 text-error' : 'bg-fondo text-texto')}>
            <Clock className="size-4" aria-hidden />{String(minutos).padStart(2, '0')}:{String(segundos).padStart(2, '0')}
          </span>
          <Boton icono={Send} variante={avisoPendientes ? 'peligro' : 'primario'} onClick={() => {
            if (respondidas < enCurso.preguntas.length && !avisoPendientes) { setAvisoPendientes(true); return; }
            enviar();
          }}>{avisoPendientes ? `Enviar con ${enCurso.preguntas.length - respondidas} sin responder` : 'Enviar evaluación'}</Boton>
        </div>
      )}
      <form className="flex flex-col gap-4" onSubmit={(evento) => evento.preventDefault()}>
        {enCurso.preguntas.map((pregunta, indice) => (
          <PreguntaEvaluacion
            key={pregunta.id} pregunta={pregunta} numero={indice + 1} respuesta={respuestas[pregunta.id]}
            alResponder={(valor) => setRespuestas((actual) => ({ ...actual, [pregunta.id]: valor }))}
            revision={resultado ? { correcta: resultado.calificacion.detalle.find((item) => item.preguntaId === pregunta.id)?.correcta ?? false, mostrar: enCurso.mostrarRespuestas } : null}
          />
        ))}
      </form>
    </div>
  );
}
