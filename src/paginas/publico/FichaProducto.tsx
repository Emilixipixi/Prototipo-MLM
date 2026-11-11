import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarCheck, GraduationCap, Info, PackageX, ShoppingCart, Zap } from 'lucide-react';
import { ImagenProducto } from '../../componentes/catalogo/ImagenProducto';
import { SelectorCantidad } from '../../componentes/catalogo/SelectorCantidad';
import { ValoresProducto } from '../../componentes/catalogo/ValoresProducto';
import { Boton } from '../../componentes/ui/Boton';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { EstadoVacio } from '../../componentes/ui/EstadoVacio';
import { Insignia } from '../../componentes/ui/Insignia';
import { useToast } from '../../componentes/ui/useToast';
import { categorias } from '../../datos/presentacionCatalogo';
import { useCarritoStore } from '../../store/useCarritoStore';
import { useCatalogoStore } from '../../store/useCatalogoStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import { formatearFecha } from '../../utilidades/fechas';
import { formatearNumero } from '../../utilidades/formatos';
import { puedeVerVolumen } from '../../utilidades/visibilidad';

export default function FichaProducto() {
  const { id } = useParams();
  const producto = useCatalogoStore((estado) => estado.productos.find((item) => item.id === id));
  const agregar = useCarritoStore((estado) => estado.agregar);
  const persona = usePersonaSesion();
  const navegar = useNavigate();
  const toast = useToast();
  const [cantidad, setCantidad] = useState(1);
  const mostrarVolumen = puedeVerVolumen(persona);

  if (!producto || !producto.activo) {
    return (
      <EstadoVacio
        icono={PackageX}
        titulo="Producto no disponible"
        texto={producto ? 'Este producto está fuera de vigencia y no puede comprarse.' : 'No encontramos el producto solicitado.'}
        accion={<EnlaceBoton to="/catalogo" icono={ArrowLeft} variante="secundario">Volver al catálogo</EnlaceBoton>}
      />
    );
  }

  const categoria = categorias[producto.categoria];

  const agregarAlCarrito = (irAlCarrito: boolean) => {
    agregar(producto.id, cantidad);
    toast.exito('Agregado al carrito', `${cantidad} x ${producto.nombre}`);
    if (irAlCarrito) navegar('/carrito');
  };

  return (
    <div className="flex flex-col gap-5">
      <Link to="/catalogo" className="inline-flex min-h-11 w-fit items-center gap-1.5 text-[13px] font-semibold text-acento hover:underline">
        <ArrowLeft className="size-4" aria-hidden />
        Volver al catálogo
      </Link>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
        <ImagenProducto producto={producto} tamano="lg" className="aspect-[4/3] rounded-[24px] shadow-tarjeta" />
        <div className="flex min-w-0 flex-col gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Insignia tono={categoria.tono} icono={categoria.icono}>{categoria.nombre}</Insignia>
              <span className="cifra text-xs text-texto-3">{producto.codigo}</span>
            </div>
            <h2 className="mt-3 text-[26px] font-extrabold leading-tight tracking-tight text-texto sm:text-[32px]">{producto.nombre}</h2>
            <p className="mt-2 text-[14px] text-texto-2">{producto.descripcion}</p>
          </div>

          <div className="rounded-tarjeta border border-borde bg-superficie p-5 shadow-tarjeta">
            <ValoresProducto precio={producto.precio} vp={producto.vp} vc={producto.vc} moneda={producto.moneda} mostrarVolumen={mostrarVolumen} />
            {mostrarVolumen ? (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-acento-suave px-3 py-2 text-[12.5px] text-[#155E75]">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                Al confirmarse, cada unidad suma {formatearNumero(producto.vp)} VP y {formatearNumero(producto.vc)} VC. Los valores son ficticios y no guardan equivalencia con el precio.
              </p>
            ) : (
              <p className="mt-3 text-[12.5px] text-texto-2">El volumen de puntos se muestra solo a afiliados y personal corporativo.</p>
            )}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <SelectorCantidad valor={cantidad} alCambiar={setCantidad} etiqueta="Cantidad" />
              <Boton icono={ShoppingCart} onClick={() => agregarAlCarrito(false)} variante="secundario" className="sm:flex-1">Agregar al carrito</Boton>
              <Boton icono={Zap} onClick={() => agregarAlCarrito(true)} className="sm:flex-1">Comprar ahora</Boton>
            </div>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-borde bg-superficie p-4">
              <dt className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3"><CalendarCheck className="size-4" aria-hidden />Vigencia</dt>
              <dd className="mt-1 text-[13.5px] font-semibold text-texto">Desde {formatearFecha(producto.vigenteDesde)}{producto.vigenteHasta ? ` hasta ${formatearFecha(producto.vigenteHasta)}` : ', sin fecha de fin'}</dd>
            </div>
            {producto.proveedorFormativo && (
              <div className="rounded-xl border border-borde bg-superficie p-4">
                <dt className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3"><GraduationCap className="size-4" aria-hidden />Plataforma educativa</dt>
                <dd className="mt-1 text-[13.5px] font-semibold text-texto">{producto.proveedorFormativo}</dd>
                <dd className="text-xs text-texto-2">Vínculo conceptual: conector LMS pendiente de integración.</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
