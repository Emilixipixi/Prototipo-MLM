import { useMemo } from 'react';
import { useCarritoStore } from '../store/useCarritoStore';
import { useCatalogoStore } from '../store/useCatalogoStore';
import { calcularPrecio, type PrecioConDescuento } from '../servicios/descuentos';
import { useDescuentosStore } from '../store/useDescuentosStore';
import type { Producto } from '../tipos/catalogo';

export interface LineaDetallada { producto: Producto; cantidad: number; precio: PrecioConDescuento; }

export function useLineasCarrito() {
  const lineas = useCarritoStore((estado) => estado.lineas);
  const productos = useCatalogoStore((estado) => estado.productos);
  const descuentos = useDescuentosStore((estado) => estado.descuentos);
  return useMemo(() => {
    const detalladas: LineaDetallada[] = lineas.flatMap((linea) => {
      const producto = productos.find((item) => item.id === linea.productoId);
      return producto && producto.activo ? [{ producto, cantidad: linea.cantidad, precio: calcularPrecio(producto, descuentos) }] : [];
    });
    return {
      lineas: detalladas,
      articulos: detalladas.reduce((suma, linea) => suma + linea.cantidad, 0),
      precio: detalladas.reduce((suma, linea) => suma + linea.precio.precioFinal * linea.cantidad, 0),
      ahorro: detalladas.reduce((suma, linea) => suma + linea.precio.ahorro * linea.cantidad, 0),
      vp: detalladas.reduce((suma, linea) => suma + linea.producto.vp * linea.cantidad, 0),
      vc: detalladas.reduce((suma, linea) => suma + linea.producto.vc * linea.cantidad, 0),
    };
  }, [lineas, productos, descuentos]);
}
