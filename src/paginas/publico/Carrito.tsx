import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, ShoppingCart, Trash2 } from 'lucide-react';
import { ImagenProducto } from '../../componentes/catalogo/ImagenProducto';
import { ResumenTotales } from '../../componentes/catalogo/ResumenTotales';
import { SelectorCantidad } from '../../componentes/catalogo/SelectorCantidad';
import { BotonIcono } from '../../componentes/ui/BotonIcono';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { EstadoVacio } from '../../componentes/ui/EstadoVacio';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { categorias } from '../../datos/presentacionCatalogo';
import { useLineasCarrito } from '../../hooks/useLineasCarrito';
import { useCarritoStore } from '../../store/useCarritoStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import { formatearMonto, formatearNumero } from '../../utilidades/formatos';
import { puedeVerVolumen } from '../../utilidades/visibilidad';

export default function Carrito() {
  const resumen = useLineasCarrito();
  const cambiarCantidad = useCarritoStore((estado) => estado.cambiarCantidad);
  const quitar = useCarritoStore((estado) => estado.quitar);
  const mostrarVolumen = puedeVerVolumen(usePersonaSesion());

  if (resumen.lineas.length === 0) {
    return (
      <Tarjeta className="mx-auto max-w-xl">
        <EstadoVacio
          icono={ShoppingCart}
          titulo="Tu carrito está vacío"
          texto="Agrega productos desde el catálogo para armar tu pedido de demostración."
          accion={<EnlaceBoton to="/catalogo" icono={ShoppingBag}>Ir al catálogo</EnlaceBoton>}
        />
      </Tarjeta>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-texto sm:text-[28px]">Carrito</h2>
        <p className="mt-1 text-[13.5px] text-texto-2">Revisa cantidades antes de confirmar el pedido.</p>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <ul className="flex flex-col gap-3">
          {resumen.lineas.map(({ producto, cantidad, precio }) => (
            <li key={producto.id} className="flex gap-4 rounded-tarjeta border border-borde bg-superficie p-3 shadow-tarjeta sm:p-4">
              <ImagenProducto producto={producto} tamano="sm" className="size-20 shrink-0 rounded-xl sm:size-24" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link to={`/catalogo/${producto.id}`} className="-my-1.5 inline-flex min-h-11 items-center font-bold leading-snug text-texto hover:text-acento">{producto.nombre}</Link>
                    <p className="text-xs text-texto-2">{categorias[producto.categoria].nombre} · <span className="cifra">{formatearMonto(precio.precioFinal)}</span> c/u{precio.ahorro > 0 && <span className="cifra ml-1 text-texto-3 line-through">{formatearMonto(producto.precio)}</span>}</p>
                    {mostrarVolumen && <p className="cifra mt-0.5 text-xs text-texto-2">{formatearNumero(producto.vp)} VP · {formatearNumero(producto.vc)} VC por unidad</p>}
                  </div>
                  <BotonIcono icono={Trash2} etiqueta={`Quitar ${producto.nombre}`} onClick={() => quitar(producto.id)} />
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                  <SelectorCantidad valor={cantidad} alCambiar={(valor) => cambiarCantidad(producto.id, valor)} etiqueta={`Cantidad de ${producto.nombre}`} />
                  <span className="cifra text-[15px] font-semibold text-texto">{formatearMonto(precio.precioFinal * cantidad)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Tarjeta titulo="Resumen del pedido" className="lg:sticky lg:top-32 lg:self-start">
          <ResumenTotales precio={resumen.precio} vp={resumen.vp} vc={resumen.vc} mostrarVolumen={mostrarVolumen} articulos={resumen.articulos} ahorro={resumen.ahorro} />
          <EnlaceBoton to="/checkout" iconoDerecha={ArrowRight} anchoCompleto className="mt-5">Continuar con el pedido</EnlaceBoton>
          <EnlaceBoton to="/catalogo" variante="fantasma" anchoCompleto className="mt-2">Seguir comprando</EnlaceBoton>
        </Tarjeta>
      </div>
    </div>
  );
}
