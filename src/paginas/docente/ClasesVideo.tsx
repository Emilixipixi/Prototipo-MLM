import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, FileVideo, Film, Link2, PlayCircle, Trash2, Upload, MonitorPlay as Youtube } from 'lucide-react';
import { ReproductorYoutube } from '../../componentes/campus/ReproductorYoutube';
import { ReproductorArchivo } from '../../componentes/campus/ReproductorArchivo';
import { SinProgramaAsignado } from '../../componentes/campus/SinProgramaAsignado';
import { Boton } from '../../componentes/ui/Boton';
import { Campo } from '../../componentes/ui/Campo';
import { Insignia } from '../../componentes/ui/Insignia';
import { Modal } from '../../componentes/ui/Modal';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { TarjetaKpi } from '../../componentes/ui/TarjetaKpi';
import { useToast } from '../../componentes/ui/useToast';
import { useProgramasDocente } from '../../hooks/useProgramasDocente';
import { actualizarVideoTema, origenVideo, type OrigenVideo } from '../../servicios/contenidosDocente';
import { borrarVideoLocal, guardarVideoLocal, indexedDbDisponible, validarArchivoVideo } from '../../servicios/videosLocales';
import { useAcademicoStore } from '../../store/useAcademicoStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { Tema } from '../../tipos/academico';
import { idYoutube } from '../../utilidades/youtube';

const insigniaOrigen: Record<OrigenVideo, { texto: string; tono: 'neutra' | 'error' | 'exito'; icono: typeof Film }> = {
  simulado: { texto: 'Clase simulada', tono: 'neutra', icono: Film },
  youtube: { texto: 'YouTube', tono: 'error', icono: Youtube },
  archivo: { texto: 'Archivo subido', tono: 'exito', icono: FileVideo },
};

export default function ClasesVideo() {
  const { programaId = '' } = useParams();
  const persona = usePersonaSesion();
  const ids = useProgramasDocente();
  const programa = useAcademicoStore((estado) => estado.programas.find((item) => item.id === programaId));
  const modulos = useAcademicoStore((estado) => estado.modulos);
  const temas = useAcademicoStore((estado) => estado.temas);
  const toast = useToast();
  const entrada = useRef<HTMLInputElement>(null);
  const [editando, setEditando] = useState<Tema | null>(null);
  const [vista, setVista] = useState<Tema | null>(null);
  const [enlace, setEnlace] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const almacenLocal = indexedDbDisponible();

  if (!programa || !ids.includes(programaId) || programa.tipo !== 'curso') return <SinProgramaAsignado />;
  const propios = modulos.filter((modulo) => modulo.programaId === programaId).sort((a, b) => a.orden - b.orden);
  const temasPrograma = temas.filter((tema) => propios.some((modulo) => modulo.id === tema.moduloId));
  const conteo = (origen: OrigenVideo) => temasPrograma.filter((tema) => origenVideo(tema.video) === origen).length;

  const abrir = (tema: Tema) => { setEditando(tema); setEnlace(tema.video.urlVideo ?? ''); setError(null); };
  const cerrar = () => { setEditando(null); setError(null); };
  const actorId = persona?.id ?? '';

  const guardarEnlace = () => {
    if (!editando) return;
    if (!idYoutube(enlace)) { setError('Pega un enlace válido de YouTube.'); return; }
    const resultado = actualizarVideoTema(editando.id, { urlVideo: enlace }, actorId);
    if (!resultado.ok) { setError(resultado.error); return; }
    toast.exito('Clase actualizada', `${editando.nombre} ahora usa el video de YouTube.`);
    cerrar();
  };

  const subirArchivo = async (archivo: File | undefined) => {
    if (!editando || !archivo) return;
    const invalido = validarArchivoVideo(archivo);
    if (invalido) { setError(invalido); return; }
    setSubiendo(true);
    try {
      const anterior = editando.video.archivoVideoId;
      const id = await guardarVideoLocal(archivo);
      const resultado = actualizarVideoTema(editando.id, { archivoVideoId: id, nombreArchivo: archivo.name }, actorId);
      if (!resultado.ok) { await borrarVideoLocal(id); setError(resultado.error); return; }
      if (anterior) await borrarVideoLocal(anterior).catch(() => undefined);
      toast.exito('Video subido', `${archivo.name} quedó como clase de ${editando.nombre}.`);
      cerrar();
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : 'No se pudo guardar el video.');
    } finally {
      setSubiendo(false);
      if (entrada.current) entrada.current.value = '';
    }
  };

  const quitar = async (tema: Tema, que: 'archivo' | 'youtube') => {
    const archivo = tema.video.archivoVideoId;
    const resultado = actualizarVideoTema(tema.id, que === 'archivo' ? { archivoVideoId: null } : { urlVideo: null }, actorId);
    if (!resultado.ok) { toast.error('No se pudo quitar', resultado.error); return; }
    if (que === 'archivo' && archivo) await borrarVideoLocal(archivo).catch(() => undefined);
    toast.info('Video retirado', `${tema.nombre}: ${origenVideo(resultado.valor.video) === 'simulado' ? 'vuelve a la clase simulada' : 'se mantiene el enlace de YouTube'}.`);
  };

  return (
    <div className="flex flex-col gap-5">
      <Link to="/docente/cursos" className="inline-flex min-h-11 w-fit items-center gap-1.5 text-[13px] font-semibold text-acento"><ArrowLeft className="size-4" aria-hidden />Mis cursos</Link>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <TarjetaKpi etiqueta="Archivos" valor={conteo('archivo')} icono={FileVideo} tono="primario" />
        <TarjetaKpi etiqueta="YouTube" valor={conteo('youtube')} icono={Youtube} tono="acento" />
        <TarjetaKpi etiqueta="Simuladas" valor={conteo('simulado')} icono={Film} tono="info" />
      </div>
      <p className="text-[13px] text-texto-2">El archivo subido tiene prioridad sobre el enlace de YouTube. Los alumnos ven el cambio al instante; la estructura del curso (módulos y temas) la edita el administrador educativo.</p>
      {propios.map((modulo) => (
        <Tarjeta key={modulo.id} titulo={`Módulo ${modulo.orden} · ${modulo.nombre}`} subtitulo={`${modulo.temaIds.length} temas · ${modulo.horas} h`} icono={PlayCircle}>
          <ul className="flex flex-col divide-y divide-borde">
            {temasPrograma.filter((tema) => tema.moduloId === modulo.id).sort((a, b) => a.orden - b.orden).map((tema) => {
              const origen = origenVideo(tema.video);
              const insignia = insigniaOrigen[origen];
              return (
                <li key={tema.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-texto">Tema {modulo.orden}.{tema.orden} · {tema.nombre}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-texto-2">
                      <Insignia tono={insignia.tono} icono={insignia.icono}>{insignia.texto}</Insignia>
                      <span className="truncate">{origen === 'archivo' ? tema.video.nombreArchivo : origen === 'youtube' ? tema.video.urlVideo : `${tema.video.minutos} min`}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {origen !== 'simulado' && <Boton tamano="sm" variante="fantasma" icono={Eye} onClick={() => setVista(tema)}>Vista previa</Boton>}
                    <Boton tamano="sm" variante="secundario" icono={Upload} onClick={() => abrir(tema)}>Cambiar video</Boton>
                    {origen !== 'simulado' && <Boton tamano="sm" variante="fantasma" icono={Trash2} onClick={() => quitar(tema, origen === 'archivo' ? 'archivo' : 'youtube')} aria-label={`Quitar video de ${tema.nombre}`}>Quitar</Boton>}
                  </div>
                </li>
              );
            })}
          </ul>
        </Tarjeta>
      ))}

      <Modal abierto={Boolean(editando)} alCerrar={cerrar} titulo="Cambiar clase en video" descripcion={editando?.nombre}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Campo etiqueta="Enlace de YouTube" icono={Link2} value={enlace} onChange={(evento) => { setEnlace(evento.target.value); setError(null); }} placeholder="https://www.youtube.com/watch?v=..." ayuda="Acepta youtube.com/watch, youtu.be y shorts." />
            <Boton variante="secundario" icono={Youtube} onClick={guardarEnlace} disabled={!enlace.trim()}>Usar enlace de YouTube</Boton>
          </div>
          {almacenLocal ? (
            <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-borde bg-fondo p-4">
              <p className="text-[13px] font-semibold text-texto">Subir archivo de video</p>
              <p className="text-[12.5px] text-texto-2">MP4 o WEBM hasta 300 MB. En el prototipo se guarda en este navegador; en producción se subirá al servidor.</p>
              <input ref={entrada} type="file" accept="video/mp4,video/webm" className="sr-only" id="archivo-video" onChange={(evento) => subirArchivo(evento.target.files?.[0])} />
              <Boton icono={Upload} cargando={subiendo} onClick={() => entrada.current?.click()}>{subiendo ? 'Guardando video' : 'Elegir archivo'}</Boton>
            </div>
          ) : (
            <p className="rounded-xl bg-fondo p-3 text-[12.5px] text-texto-2">Este navegador no permite guardar videos localmente; usa un enlace de YouTube.</p>
          )}
          {error && <p role="alert" className="text-[13px] font-semibold text-error">{error}</p>}
        </div>
      </Modal>

      <Modal abierto={Boolean(vista)} alCerrar={() => setVista(null)} titulo="Vista previa" descripcion={vista?.nombre} ancho="lg">
        <div>
          {vista?.video.archivoVideoId && <ReproductorArchivo archivoVideoId={vista.video.archivoVideoId} titulo={vista.video.titulo} compacto />}
          {vista && !vista.video.archivoVideoId && idYoutube(vista.video.urlVideo) && (
            <ReproductorYoutube videoId={idYoutube(vista.video.urlVideo) ?? ''} titulo={vista.video.titulo} alTerminar={() => undefined} />
          )}
        </div>
      </Modal>
    </div>
  );
}
