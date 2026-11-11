import { useId, useRef, useState } from 'react';
import { ImagePlus, LoaderCircle, Trash2 } from 'lucide-react';
import type { Producto } from '../../tipos/catalogo';
import { leerImagenReducida, validarImagen } from '../../utilidades/imagenes';
import { Boton } from '../ui/Boton';
import { ImagenProducto } from './ImagenProducto';

interface PropsCampoImagen {
  producto: Pick<Producto, 'id' | 'nombre' | 'categoria' | 'imagen'>;
  alCambiar: (imagen: string | undefined) => void;
}

export function CampoImagenProducto({ producto, alCambiar }: PropsCampoImagen) {
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
      alCambiar(await leerImagenReducida(archivo));
    } catch (falla) {
      setError(falla instanceof Error ? falla.message : 'No se pudo cargar la imagen.');
    } finally {
      setCargando(false);
      if (entrada.current) entrada.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold">Imagen del producto</label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <ImagenProducto producto={producto} tamano="sm" className="aspect-[16/10] w-full shrink-0 rounded-xl border border-borde sm:w-44" />
        <div className="flex flex-col gap-2">
          <input ref={entrada} id={id} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(evento) => void elegir(evento.target.files?.[0])} />
          <div className="flex flex-wrap gap-2">
            <Boton tamano="sm" variante="secundario" icono={cargando ? LoaderCircle : ImagePlus} disabled={cargando} onClick={() => entrada.current?.click()}>{producto.imagen ? 'Cambiar imagen' : 'Subir imagen'}</Boton>
            {producto.imagen && <Boton tamano="sm" variante="fantasma" icono={Trash2} onClick={() => alCambiar(undefined)}>Quitar</Boton>}
          </div>
          <p className="text-xs text-texto-2">PNG, JPG o WEBP de hasta 5 MB. Se guarda en memoria durante la demostración; sin imagen se usa la ilustración de la categoría.</p>
          {error && <p role="alert" className="text-xs font-semibold text-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}
