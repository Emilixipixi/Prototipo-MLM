import { useAcademicoStore } from '../store/useAcademicoStore';
import type { ContenidoVideo, Tema } from '../tipos/academico';
import { idYoutube } from '../utilidades/youtube';
import { exito, fallo, type Resultado } from '../validaciones/resultado';
import { puedeGestionarPrograma } from './docentes';
import { registrarBitacora } from './registro';

export function programaDeTema(temaId: string): string | null {
  const { temas, modulos } = useAcademicoStore.getState();
  const tema = temas.find((item) => item.id === temaId);
  return modulos.find((modulo) => modulo.id === tema?.moduloId)?.programaId ?? null;
}

export type OrigenVideo = 'simulado' | 'youtube' | 'archivo';

export function origenVideo(video: ContenidoVideo): OrigenVideo {
  if (video.archivoVideoId) return 'archivo';
  if (idYoutube(video.urlVideo)) return 'youtube';
  return 'simulado';
}

export interface CambiosVideo { urlVideo?: string | null; archivoVideoId?: string | null; nombreArchivo?: string | null }

export function actualizarVideoTema(temaId: string, cambios: CambiosVideo, actorId: string): Resultado<Tema> {
  const programaId = programaDeTema(temaId);
  if (!programaId) return fallo('Tema no encontrado.');
  if (!puedeGestionarPrograma(actorId, programaId)) return fallo('Solo puedes cambiar las clases de tus programas asignados.');
  if (cambios.urlVideo && !idYoutube(cambios.urlVideo)) return fallo('El enlace debe ser de YouTube (youtube.com/watch?v=..., youtu.be/... o youtube.com/shorts/...).');
  const { temas, actualizar } = useAcademicoStore.getState();
  const actual = temas.find((item) => item.id === temaId);
  if (!actual) return fallo('Tema no encontrado.');
  const video: ContenidoVideo = { ...actual.video };
  if (cambios.urlVideo !== undefined) {
    if (cambios.urlVideo) video.urlVideo = cambios.urlVideo.trim();
    else delete video.urlVideo;
  }
  if (cambios.archivoVideoId !== undefined) {
    if (cambios.archivoVideoId) {
      video.archivoVideoId = cambios.archivoVideoId;
      video.nombreArchivo = cambios.nombreArchivo ?? 'video.mp4';
    } else {
      delete video.archivoVideoId;
      delete video.nombreArchivo;
    }
  }
  const nuevo: Tema = { ...actual, video };
  actualizar({ temas: temas.map((item) => (item.id === temaId ? nuevo : item)) });
  registrarBitacora({
    actorId, accion: 'Clase en video actualizada', modulo: 'contenidos', referenciaId: temaId, motivo: actual.nombre,
    antes: { origen: origenVideo(actual.video), urlVideo: actual.video.urlVideo ?? null, archivo: actual.video.nombreArchivo ?? null },
    despues: { origen: origenVideo(video), urlVideo: video.urlVideo ?? null, archivo: video.nombreArchivo ?? null },
  });
  return exito(nuevo);
}
