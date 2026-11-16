import { useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { ESTADO_YOUTUBE_TERMINADO, estadoReproductorYoutube, urlInsercionYoutube, urlVerYoutube } from '../../utilidades/youtube';

interface PropsReproductorYoutube {
  videoId: string;
  titulo: string;
  alTerminar: () => void;
}

const origenesYoutube = ['https://www.youtube.com', 'https://www.youtube-nocookie.com'];

export function ReproductorYoutube({ videoId, titulo, alTerminar }: PropsReproductorYoutube) {
  const marco = useRef<HTMLIFrameElement>(null);
  const terminado = useRef(false);
  const alTerminarRef = useRef(alTerminar);

  useEffect(() => {
    alTerminarRef.current = alTerminar;
  }, [alTerminar]);

  useEffect(() => {
    terminado.current = false;
    const escuchar = (evento: MessageEvent) => {
      if (!origenesYoutube.includes(evento.origin) || evento.source !== marco.current?.contentWindow) return;
      if (estadoReproductorYoutube(evento.data) === ESTADO_YOUTUBE_TERMINADO && !terminado.current) {
        terminado.current = true;
        alTerminarRef.current();
      }
    };
    window.addEventListener('message', escuchar);
    return () => window.removeEventListener('message', escuchar);
  }, [videoId]);

  const suscribir = () => {
    marco.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: videoId, channel: 'widget' }), '*');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
        <iframe ref={marco} src={urlInsercionYoutube(videoId, window.location.origin)} title={titulo} onLoad={suscribir}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin" className="absolute inset-0 size-full border-0" />
      </div>
      <a href={urlVerYoutube(videoId)} target="_blank" rel="noreferrer" className="inline-flex min-h-11 w-fit items-center gap-1.5 text-[12.5px] font-semibold text-acento md:min-h-0">
        <ExternalLink className="size-3.5" aria-hidden />Abrir la clase en YouTube
      </a>
    </div>
  );
}
