import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, VideoOff } from 'lucide-react';
import { leerVideoLocal } from '../../servicios/videosLocales';

interface PropsReproductorArchivo {
  archivoVideoId: string;
  titulo: string;
  alTerminar?: () => void;
  compacto?: boolean;
}

export function ReproductorArchivo({ archivoVideoId, titulo, alTerminar, compacto = false }: PropsReproductorArchivo) {
  const [url, setUrl] = useState<string | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'faltante'>('cargando');
  const alTerminarRef = useRef(alTerminar);

  useEffect(() => {
    alTerminarRef.current = alTerminar;
  }, [alTerminar]);

  useEffect(() => {
    let activo = true;
    let creada: string | null = null;
    leerVideoLocal(archivoVideoId)
      .then((archivo) => {
        if (!activo) return;
        if (!archivo) { setEstado('faltante'); return; }
        creada = URL.createObjectURL(archivo);
        setUrl(creada);
        setEstado('listo');
      })
      .catch(() => { if (activo) setEstado('faltante'); });
    return () => {
      activo = false;
      if (creada) URL.revokeObjectURL(creada);
    };
  }, [archivoVideoId]);

  if (estado === 'cargando') {
    return <div className="grid aspect-video place-items-center rounded-2xl bg-fondo text-texto-2"><LoaderCircle className="size-6 animate-spin" aria-label="Cargando video" /></div>;
  }
  if (estado === 'faltante' || !url) {
    return (
      <div className="grid aspect-video place-items-center rounded-2xl border border-dashed border-borde bg-fondo p-4 text-center text-[13px] text-texto-2">
        <span className="flex flex-col items-center gap-2"><VideoOff className="size-6" aria-hidden />El video se subió en otro navegador o se borró al reiniciar la demostración.{compacto ? '' : ' Pide al docente que lo vuelva a subir o use un enlace de YouTube.'}</span>
      </div>
    );
  }
  return (
    <video src={url} controls playsInline preload="metadata" title={titulo} onEnded={() => alTerminarRef.current?.()} className="aspect-video w-full rounded-2xl bg-black">
      <track kind="captions" />
    </video>
  );
}
