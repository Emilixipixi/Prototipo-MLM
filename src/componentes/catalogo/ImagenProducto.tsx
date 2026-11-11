import { categorias, iconosProducto } from '../../datos/presentacionCatalogo';
import type { Producto } from '../../tipos/catalogo';
import { unirClases } from '../../utilidades/clases';

interface PropsImagenProducto {
  producto: Pick<Producto, 'id' | 'nombre' | 'categoria' | 'imagen'>;
  className?: string;
  tamano?: 'sm' | 'md' | 'lg';
}

const tamanosIcono = { sm: 'size-7', md: 'size-12', lg: 'size-20' };

export function ImagenProducto({ producto, className, tamano = 'md' }: PropsImagenProducto) {
  const categoria = categorias[producto.categoria];
  const Icono = iconosProducto[producto.id] ?? categoria.icono;
  const [desde, hasta] = categoria.degradado;
  if (producto.imagen) {
    return (
      <div className={unirClases('relative isolate overflow-hidden bg-fondo', className)}>
        <img src={producto.imagen} alt={producto.nombre} className="size-full object-cover" loading="lazy" />
      </div>
    );
  }
  return (
    <div
      className={unirClases('relative isolate grid place-items-center overflow-hidden', className)}
      style={{ background: `linear-gradient(135deg, ${desde} 0%, ${hasta} 100%)` }}
      role="img"
      aria-label={`Ilustración de ${producto.nombre}`}
    >
      <span className="absolute -right-8 -top-10 size-36 rounded-full border-[18px] border-white/15" aria-hidden />
      <span className="absolute -bottom-12 -left-6 size-28 rounded-full bg-white/10" aria-hidden />
      <span className="grid place-items-center rounded-2xl border border-white/25 bg-white/15 p-4 text-white shadow-lg backdrop-blur-sm">
        <Icono className={tamanosIcono[tamano]} strokeWidth={1.6} aria-hidden />
      </span>
    </div>
  );
}
