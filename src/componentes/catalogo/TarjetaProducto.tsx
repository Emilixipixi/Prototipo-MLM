import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { categorias } from '../../datos/presentacionCatalogo';
import type { Producto } from '../../tipos/catalogo';
import { Boton } from '../ui/Boton';
import { Insignia } from '../ui/Insignia';
import { ImagenProducto } from './ImagenProducto';
import { ValoresProducto } from './ValoresProducto';

interface PropsTarjetaProducto {
  producto: Producto;
  mostrarVolumen: boolean;
  alAgregar: (producto: Producto) => void;
}

export function TarjetaProducto({ producto, mostrarVolumen, alAgregar }: PropsTarjetaProducto) {
  const categoria = categorias[producto.categoria];
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-tarjeta border border-borde bg-superficie shadow-tarjeta transition-shadow hover:shadow-flotante">
      <Link to={`/catalogo/${producto.id}`} className="block" aria-label={`Ver ficha de ${producto.nombre}`}>
        <ImagenProducto producto={producto} className="aspect-[16/10] transition-transform duration-300 group-hover:scale-[1.02]" />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Insignia tono={categoria.tono} icono={categoria.icono}>{categoria.nombre}</Insignia>
          <span className="cifra text-[11px] text-texto-3">{producto.codigo}</span>
        </div>
        <div className="min-w-0">
          <Link to={`/catalogo/${producto.id}`} className="-my-2 inline-flex min-h-11 items-center text-[15px] font-bold leading-snug tracking-tight text-texto hover:text-acento">{producto.nombre}</Link>
          <p className="mt-1 line-clamp-2 text-[12.5px] text-texto-2">{producto.descripcion}</p>
        </div>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-1">
          <ValoresProducto precio={producto.precio} vp={producto.vp} vc={producto.vc} moneda={producto.moneda} mostrarVolumen={mostrarVolumen} compacto />
          <Boton tamano="sm" icono={ShoppingCart} onClick={() => alAgregar(producto)}>Agregar</Boton>
        </div>
      </div>
    </article>
  );
}
