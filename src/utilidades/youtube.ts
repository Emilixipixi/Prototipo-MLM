const patronesYoutube = [
  /(?:youtube\.com|youtube-nocookie\.com)\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)([A-Za-z0-9_-]{11})/,
  /youtu\.be\/([A-Za-z0-9_-]{11})/,
];

export function idYoutube(url: string | undefined | null): string | null {
  const limpio = url?.trim();
  if (!limpio) return null;
  for (const patron of patronesYoutube) {
    const coincidencia = limpio.match(patron);
    if (coincidencia) return coincidencia[1];
  }
  return null;
}

export function urlInsercionYoutube(id: string, origen: string): string {
  const parametros = new URLSearchParams({ enablejsapi: '1', rel: '0', modestbranding: '1', playsinline: '1', origin: origen });
  return `https://www.youtube-nocookie.com/embed/${id}?${parametros.toString()}`;
}

export function urlVerYoutube(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function miniaturaYoutube(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export const ESTADO_YOUTUBE_TERMINADO = 0;

export function estadoReproductorYoutube(datos: unknown): number | null {
  let mensaje: unknown = datos;
  if (typeof datos === 'string') {
    try {
      mensaje = JSON.parse(datos);
    } catch {
      return null;
    }
  }
  if (!mensaje || typeof mensaje !== 'object') return null;
  const { event: evento, info } = mensaje as { event?: unknown; info?: unknown };
  if (evento === 'onStateChange' && typeof info === 'number') return info;
  if (evento === 'infoDelivery' && info && typeof info === 'object' && typeof (info as { playerState?: unknown }).playerState === 'number') {
    return (info as { playerState: number }).playerState;
  }
  return null;
}
