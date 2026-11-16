import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpen, Briefcase, CircleCheck, ClipboardCheck, Download, Eye, EyeOff, Pause, Play, PlayCircle, Target,
} from 'lucide-react';
import { AvisoSinAcceso } from '../../componentes/campus/AvisoSinAcceso';
import { Boton } from '../../componentes/ui/Boton';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { Insignia } from '../../componentes/ui/Insignia';
import { Pestanas } from '../../componentes/ui/Pestanas';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { useToast } from '../../componentes/ui/useToast';
import { estadosElemento, nombresPolitica } from '../../datos/academico/presentacionCampus';
import { useContextoElemento } from '../../hooks/useContextoElemento';
import { evaluacionHabilitada } from '../../motores/academico/desbloqueo';
import { claveProgreso, intentosDe, intentosExtraPara } from '../../motores/academico/progreso';
import { marcarComponente } from '../../servicios/evaluaciones';
import { descargarPdfLectura } from '../../servicios/pdfCertificados';
import { useAcademicoStore } from '../../store/useAcademicoStore';
import { useCampusStore } from '../../store/useCampusStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { ProgresoComponente } from '../../tipos/academico';
import { unirClases } from '../../utilidades/clases';
import { formatearNumero } from '../../utilidades/formatos';
import { ReproductorYoutube } from '../../componentes/campus/ReproductorYoutube';
import { idYoutube } from '../../utilidades/youtube';
import { ReproductorArchivo } from '../../componentes/campus/ReproductorArchivo';

type PestanaTema = 'video' | 'lectura' | 'caso' | 'evaluacion';

function rutaElemento(id: string, tipo: 'tema' | 'tim'): string {
  return tipo === 'tema' ? `/campus/temas/${id}` : `/campus/tim/${id}`;
}

export default function TemaCampus() {
  const { id } = useParams();
  return <ContenidoTema key={id} id={id} />;
}

function ContenidoTema({ id }: { id?: string }) {
  const persona = usePersonaSesion();
  const contexto = useContextoElemento(persona?.id, id);
  const tema = useAcademicoStore((estado) => estado.temas.find((item) => item.id === id));
  const temas = useAcademicoStore((estado) => estado.temas);
  const tims = useAcademicoStore((estado) => estado.tims);
  const progreso = useCampusStore((estado) => (persona && id ? estado.progreso[claveProgreso(persona.id, id)] : undefined));
  const intentos = useCampusStore((estado) => estado.intentos);
  const matriculas = useCampusStore((estado) => estado.matriculas);
  const toast = useToast();
  const [pestana, setPestana] = useState<PestanaTema>('video');
  const [reproduciendo, setReproduciendo] = useState(false);
  const [avanceVideo, setAvanceVideo] = useState(0);
  const [guias, setGuias] = useState<Record<number, boolean>>({});

  const componentes: ProgresoComponente = progreso ?? { video: false, lectura: false, caso: false };

  const avanceRef = useRef(0);
  useEffect(() => {
    if (!reproduciendo || !persona || !id) return undefined;
    const temporizador = window.setInterval(() => {
      avanceRef.current = Math.min(100, avanceRef.current + 10);
      setAvanceVideo(avanceRef.current);
      if (avanceRef.current >= 100) {
        window.clearInterval(temporizador);
        setReproduciendo(false);
        const resultado = marcarComponente(persona.id, id, 'video');
        if (resultado.ok) toast.exito('Videoclase completada', 'Se registró tu avance.');
      }
    }, 300);
    return () => window.clearInterval(temporizador);
  }, [reproduciendo, persona, id, toast]);

  if (!persona || !tema || !contexto) return <AvisoSinAcceso texto="El tema no existe." />;
  if (!contexto.acceso.acceso) return <AvisoSinAcceso programaId={contexto.programa.id} texto="Tu acceso a este programa no está vigente. Tus notas y certificados siguen disponibles en Mis notas y Mis certificados." />;
  if (contexto.estado === 'bloqueado') return <AvisoSinAcceso programaId={contexto.programa.id} texto="Este tema se desbloquea cuando apruebas el contenido anterior." />;

  const videoArchivo = tema.video.archivoVideoId ?? null;
  const videoYoutube = videoArchivo ? null : idYoutube(tema.video.urlVideo);
  const terminarVideoYoutube = () => {
    const resultado = marcarComponente(persona.id, tema.id, 'video');
    if (resultado.ok) toast.exito('Videoclase completada', 'Se registró tu avance.');
  };
  const marcar = (componente: keyof ProgresoComponente, siguiente?: PestanaTema) => {
    const resultado = marcarComponente(persona.id, tema.id, componente);
    if (!resultado.ok) toast.error('No se pudo registrar', resultado.error);
    else if (siguiente) setPestana(siguiente);
  };
  const lista = intentosDe(persona.id, tema.id, intentos);
  const permitidos = contexto.curso.reglas.intentosMaximos + intentosExtraPara(persona.id, tema.id, matriculas);
  const habilitada = evaluacionHabilitada(componentes);
  const estado = estadosElemento[contexto.estado];
  const numeroModulo = [...new Set(contexto.resumen.ruta.map((elemento) => elemento.moduloId))].indexOf(contexto.modulo.id) + 1;
  const elementosModulo = contexto.resumen.ruta.filter((elemento) => elemento.moduloId === contexto.modulo.id);
  const nombreDe = (elementoId: string) => temas.find((item) => item.id === elementoId)?.nombre ?? tims.find((item) => item.id === elementoId)?.nombre ?? 'Trabajo Integrador Modular';
  const pestanas = [
    { id: 'video', texto: 'Video', icono: componentes.video ? CircleCheck : PlayCircle },
    { id: 'lectura', texto: 'Lectura', icono: componentes.lectura ? CircleCheck : BookOpen },
    { id: 'caso', texto: 'Caso práctico', icono: componentes.caso ? CircleCheck : Briefcase },
    { id: 'evaluacion', texto: 'Evaluación', icono: contexto.estado === 'aprobado' ? CircleCheck : ClipboardCheck },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to={`/campus/programas/${contexto.programa.id}`} className="inline-flex min-h-11 items-center gap-1.5 text-[13px] font-semibold text-acento md:min-h-0"><ArrowLeft className="size-4" aria-hidden />{contexto.programa.nombre}</Link>
        <Insignia tono={estado.tono} icono={estado.icono}>{estado.texto}</Insignia>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-texto-3">{contexto.curso.nombre} · Módulo {numeroModulo} · Tema {tema.orden}</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-texto">{tema.nombre}</h2>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Tarjeta className="min-w-0">
          <Pestanas etiqueta="Componentes del tema" activa={pestana} alCambiar={(valor) => setPestana(valor as PestanaTema)} pestanas={pestanas} />
          <div className="pt-5">
            {pestana === 'video' && videoArchivo && (
              <div className="flex flex-col gap-4">
                <ReproductorArchivo archivoVideoId={videoArchivo} titulo={tema.video.titulo} alTerminar={terminarVideoYoutube} />
                <p className="text-[13px] text-texto-2">{tema.video.titulo}. Clase subida por tu docente: al terminar el video se registra como visto; también puedes marcarlo con el botón.</p>
                <div className="flex flex-wrap justify-between gap-2">
                  <Boton variante="secundario" icono={CircleCheck} disabled={componentes.video} onClick={() => marcar('video', 'lectura')}>{componentes.video ? 'Video visto' : 'Marcar como visto'}</Boton>
                  <Boton variante="fantasma" iconoDerecha={ArrowRight} onClick={() => setPestana('lectura')}>Siguiente: Lectura</Boton>
                </div>
              </div>
            )}
            {pestana === 'video' && videoYoutube && (
              <div className="flex flex-col gap-4">
                <ReproductorYoutube videoId={videoYoutube} titulo={tema.video.titulo} alTerminar={terminarVideoYoutube} />
                <p className="text-[13px] text-texto-2">{tema.video.titulo}. Clase en YouTube: al terminar el video se registra como visto; también puedes marcarlo con el botón.</p>
                <div className="flex flex-wrap justify-between gap-2">
                  <Boton variante="secundario" icono={CircleCheck} disabled={componentes.video} onClick={() => marcar('video', 'lectura')}>{componentes.video ? 'Video visto' : 'Marcar como visto'}</Boton>
                  <Boton variante="fantasma" iconoDerecha={ArrowRight} onClick={() => setPestana('lectura')}>Siguiente: Lectura</Boton>
                </div>
              </div>
            )}
            {pestana === 'video' && !videoYoutube && !videoArchivo && (
              <div className="flex flex-col gap-4">
                <div className="relative grid aspect-video place-items-center overflow-hidden rounded-2xl text-white" style={{ background: `linear-gradient(135deg, ${contexto.programa.colores[0]}, ${contexto.programa.colores[1]})` }}>
                  {tema.video.portada && <img src={tema.video.portada} alt="" className="pointer-events-none absolute inset-0 size-full object-cover opacity-80 mix-blend-overlay" />}
                  <span className="absolute left-3 top-3 rounded-full bg-black/30 px-2.5 py-0.5 text-[11px] font-semibold">Video de demostración</span>
                  <button type="button" onClick={() => setReproduciendo((valor) => !valor)} aria-label={reproduciendo ? 'Pausar video' : 'Reproducir video'}
                    className="grid size-16 place-items-center rounded-full bg-white/20 backdrop-blur hover:bg-white/30">
                    {reproduciendo ? <Pause className="size-7" aria-hidden /> : <Play className="size-7" aria-hidden />}
                  </button>
                  <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 text-xs">
                    <span className="cifra">{formatearNumero(Math.round((avanceVideo / 100) * tema.video.minutos), 0)}:00</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25"><span className="block h-full bg-white" style={{ width: `${componentes.video ? 100 : avanceVideo}%` }} /></span>
                    <span className="cifra">{tema.video.minutos}:00</span>
                  </div>
                </div>
                <p className="text-[13px] text-texto-2">{tema.video.titulo}. En la demostración el video se simula: al terminar la reproducción se registra como visto.</p>
                <div className="flex flex-wrap justify-between gap-2">
                  <Boton variante="secundario" icono={CircleCheck} disabled={componentes.video} onClick={() => marcar('video', 'lectura')}>{componentes.video ? 'Video visto' : 'Marcar como visto'}</Boton>
                  <Boton variante="fantasma" iconoDerecha={ArrowRight} onClick={() => setPestana('lectura')}>Siguiente: Lectura</Boton>
                </div>
              </div>
            )}
            {pestana === 'lectura' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-[16px] font-bold text-texto">{tema.lectura.titulo}</h3>
                  {tema.lectura.descargable && <Boton tamano="sm" variante="secundario" icono={Download} onClick={() => { void descargarPdfLectura(tema, contexto.curso.nombre); if (!componentes.lectura) marcar('lectura'); }}>Descargar PDF</Boton>}
                </div>
                <article className="max-h-[520px] overflow-y-auto rounded-xl border border-borde bg-fondo p-4 text-[14px] leading-relaxed text-texto">
                  {tema.lectura.contenido.split('\n\n').map((bloque) => (bloque.startsWith('## ')
                    ? <div key={bloque} className="mt-4 first:mt-0"><h4 className="text-[15px] font-bold text-primario">{bloque.slice(3).split('\n')[0]}</h4><p className="mt-1">{bloque.split('\n').slice(1).join(' ')}</p></div>
                    : <p key={bloque} className="mt-3 first:mt-0">{bloque}</p>))}
                </article>
                <p className="text-xs text-texto-2">Tiempo estimado de estudio: {tema.lectura.minutos} minutos.</p>
                <div className="flex flex-wrap justify-between gap-2">
                  <Boton variante="secundario" icono={CircleCheck} disabled={componentes.lectura} onClick={() => marcar('lectura', 'caso')}>{componentes.lectura ? 'Lectura completada' : 'Marcar como leída'}</Boton>
                  <Boton variante="fantasma" iconoDerecha={ArrowRight} onClick={() => setPestana('caso')}>Siguiente: Caso práctico</Boton>
                </div>
              </div>
            )}
            {pestana === 'caso' && (
              <div className="flex flex-col gap-4">
                <p className="rounded-xl bg-acento-suave/60 p-4 text-[14px] text-texto">{tema.caso.enunciado}</p>
                <ol className="flex flex-col gap-3">
                  {tema.caso.ejercicios.map((ejercicio, indice) => (
                    <li key={ejercicio.pregunta} className="rounded-xl border border-borde p-3">
                      <label htmlFor={`ejercicio-${indice}`} className="text-[13.5px] font-semibold text-texto">{indice + 1}. {ejercicio.pregunta}</label>
                      <textarea id={`ejercicio-${indice}`} rows={2} placeholder="Escribe tu respuesta (no se califica)" className="mt-2 w-full rounded-xl border border-borde bg-superficie p-2.5 text-sm outline-none focus:border-acento focus:ring-2 focus:ring-acento-suave" />
                      <button type="button" onClick={() => setGuias((actual) => ({ ...actual, [indice]: !actual[indice] }))} className="mt-1 inline-flex min-h-11 items-center gap-1.5 text-[12.5px] font-semibold text-acento md:min-h-8">
                        {guias[indice] ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}{guias[indice] ? 'Ocultar respuesta guía' : 'Ver respuesta guía'}
                      </button>
                      {guias[indice] && <p className="rounded-lg bg-fondo p-2.5 text-[13px] text-texto-2">{ejercicio.respuestaGuia}</p>}
                    </li>
                  ))}
                </ol>
                <div className="flex flex-wrap justify-between gap-2">
                  <Boton variante="secundario" icono={CircleCheck} disabled={componentes.caso} onClick={() => marcar('caso', 'evaluacion')}>{componentes.caso ? 'Caso completado' : 'Marcar caso como completado'}</Boton>
                  <Boton variante="fantasma" iconoDerecha={ArrowRight} onClick={() => setPestana('evaluacion')}>Siguiente: Evaluación</Boton>
                </div>
              </div>
            )}
            {pestana === 'evaluacion' && (
              <div className="flex flex-col gap-4">
                <dl className="grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-4">
                  <div className="rounded-xl bg-fondo p-3"><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Preguntas</dt><dd className="cifra text-lg font-bold">{contexto.curso.reglas.preguntasPorEvaluacion}</dd></div>
                  <div className="rounded-xl bg-fondo p-3"><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Tiempo</dt><dd className="cifra text-lg font-bold">{tema.evaluacionMinutos} min</dd></div>
                  <div className="rounded-xl bg-fondo p-3"><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Intentos</dt><dd className="cifra text-lg font-bold">{lista.length} / {permitidos}</dd></div>
                  <div className="rounded-xl bg-fondo p-3"><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Nota registrada</dt><dd className="cifra text-lg font-bold">{contexto.resumen.notas[tema.id]?.nota !== null && contexto.resumen.notas[tema.id]?.nota !== undefined ? formatearNumero(contexto.resumen.notas[tema.id].nota ?? 0, 2) : lista.length ? formatearNumero(Math.max(...lista.map((item) => item.nota)), 2) : '-'}</dd></div>
                </dl>
                <p className="text-[13px] text-texto-2">Calificación automática de 0 a 20; se aprueba con nota mayor a 14. Política: {nombresPolitica[contexto.curso.reglas.politicaNota].toLowerCase()}.</p>
                {lista.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {lista.map((intento, indice) => <li key={intento.id}><Insignia tono={intento.aprobado ? 'exito' : 'error'}>Intento {indice + 1}: {formatearNumero(intento.nota, 2)}</Insignia></li>)}
                  </ul>
                )}
                {!habilitada && contexto.estado !== 'aprobado' && <p className="rounded-xl bg-amber-50 p-3 text-[13px] text-[#92400E]">Completa el video, la lectura y el caso práctico para habilitar la evaluación.</p>}
                <div className="flex flex-wrap gap-2">
                  {contexto.estado === 'aprobado'
                    ? <Insignia tono="exito" icono={CircleCheck}>Tema aprobado</Insignia>
                    : contexto.estado === 'bloqueado_por_intentos'
                      ? <p className="text-[13px] text-error">Agotaste los intentos. Solicita un intento adicional al área académica.</p>
                      : habilitada
                        ? <EnlaceBoton to={`/campus/evaluaciones/tema/${tema.id}`} icono={ClipboardCheck}>Iniciar evaluación</EnlaceBoton>
                        : <Boton icono={ClipboardCheck} disabled>Iniciar evaluación</Boton>}
                  {contexto.siguiente && contexto.estado === 'aprobado' && <EnlaceBoton to={rutaElemento(contexto.siguiente.id, contexto.siguiente.tipo)} variante="secundario" iconoDerecha={ArrowRight}>Siguiente contenido</EnlaceBoton>}
                </div>
              </div>
            )}
          </div>
        </Tarjeta>
        <div className="flex min-w-0 flex-col gap-4">
          <Tarjeta titulo="Objetivos" icono={Target}>
            <ul className="flex flex-col gap-2 text-[13px] text-texto-2">{tema.objetivos.map((objetivo) => <li key={objetivo} className="flex gap-2"><CircleCheck className="mt-0.5 size-4 shrink-0 text-acento" aria-hidden />{objetivo}</li>)}</ul>
          </Tarjeta>
          <Tarjeta titulo={`Ruta del módulo ${numeroModulo}`} subtitulo={contexto.modulo.nombre} sinRelleno>
            <ol className="flex flex-col px-2 pb-3 pt-2">
              {elementosModulo.map((elemento) => {
                const info = estadosElemento[contexto.resumen.estados[elemento.id]];
                const Icono = info.icono;
                const actual = elemento.id === tema.id;
                const abierto = contexto.resumen.estados[elemento.id] !== 'bloqueado';
                const contenido = (
                  <>
                    <span className={unirClases('grid size-7 shrink-0 place-items-center rounded-full', info.clase)}><Icono className="size-3.5" aria-hidden /></span>
                    <span className="min-w-0 flex-1 text-[12.5px]">{nombreDe(elemento.id)}</span>
                  </>
                );
                return (
                  <li key={elemento.id}>
                    {abierto
                      ? <Link to={rutaElemento(elemento.id, elemento.tipo)} className={unirClases('flex min-h-11 items-center gap-2 rounded-lg px-2 hover:bg-fondo', actual && 'bg-acento-suave/60 font-semibold')}>{contenido}</Link>
                      : <div className="flex min-h-11 items-center gap-2 px-2 opacity-70">{contenido}</div>}
                  </li>
                );
              })}
            </ol>
          </Tarjeta>
          <div className="flex justify-between gap-2">
            {contexto.anterior ? <EnlaceBoton to={rutaElemento(contexto.anterior.id, contexto.anterior.tipo)} variante="fantasma" icono={ArrowLeft} tamano="sm">Anterior</EnlaceBoton> : <span />}
            {contexto.siguiente && contexto.resumen.estados[contexto.siguiente.id] !== 'bloqueado' && <EnlaceBoton to={rutaElemento(contexto.siguiente.id, contexto.siguiente.tipo)} variante="fantasma" iconoDerecha={ArrowRight} tamano="sm">Siguiente</EnlaceBoton>}
          </div>
        </div>
      </div>
    </div>
  );
}
