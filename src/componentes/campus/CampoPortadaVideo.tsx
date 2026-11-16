import { useId, useRef, useState } from 'react';
import { ImagePlus, LoaderCircle, PlayCircle, Trash2 } from 'lucide-react';
import { leerImagenReducida, validarImagen } from '../../utilidades/imagenes';
import { Boton } from '../ui/Boton';

interface PropsCampoPortada {
  portada: string | undefined;
  miniatura?: string;
  colores: [string, string];
  editable: boolean;
  alCambiar: (portada: string | undefined) => void;
}

export function CampoPortadaVideo({ portada, miniatura, colores, editable, alCambiar }: PropsCampoPortada) {
  const id = useId();
  const entrada = useRef<HTMLInputElement>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const elegir = async (archivo: File | undefined) => {
    if (!archivo) return;
    const invalido = validarImagen(archivo);
    if (invalido) {
      setError(invalido);
      return;
    }
    setCargando(true);
    setError(null);
    try {
      alCambiar(await leerImagenReducida(archivo, 960));
    } catch (falla) {
      setError(falla instanceof Error ? falla.message : 'No se pudo cargar la imagen.');
    } finally {
      setCargando(false);
      if (entrada.current) entrada.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold">Portada del video</label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative grid aspect-video w-full shrink-0 place-items-center overflow-hidden rounded-xl border border-borde text-white sm:w-52" style={{ background: `linear-gradient(135deg, ${colores[0]}, ${colores[1]})` }}>
          {(portada ?? miniatura) && <img src={portada ?? miniatura} alt="Portada del video" className="absolute inset-0 size-full object-cover" />}
          <PlayCircle className="relative size-9 drop-shadow" aria-hidden />
        </div>
        <div className="flex flex-col gap-2">
          <input ref={entrada} id={id} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={!editable} onChange={(evento) => void elegir(evento.target.files?.[0])} />
          {editable && (
            <div className="flex flex-wrap gap-2">
              <Boton tamano="sm" variante="secundario" icono={cargando ? LoaderCircle : ImagePlus} disabled={cargando} onClick={() => entrada.current?.click()}>{portada ? 'Cambiar portada' : 'Subir portada'}</Boton>
              {portada && <Boton tamano="sm" variante="fantasma" icono={Trash2} onClick={() => alCambiar(undefined)}>Quitar</Boton>}
            </div>
          )}
          <p className="text-xs text-texto-2">PNG, JPG o WEBP de hasta 5 MB. Se guarda en memoria durante la demostración y se muestra en el reproductor simulado; con un enlace de YouTube se usa la miniatura de la clase.</p>
          {error && <p role="alert" className="text-xs font-semibold text-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}
