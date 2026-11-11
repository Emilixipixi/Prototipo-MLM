import { useMemo } from 'react';
import { useCarritoStore } from '../store/useCarritoStore';
import { useCatalogoStore } from '../store/useCatalogoStore';
import type { Producto } from '../tipos/catalogo';

export interface LineaDetallada { producto: Producto; cantidad: number; }

export function useLineasCarrito() {
  const lineas = useCarritoStore((estado) => estado.lineas);
  const productos = useCatalogoStore((estado) => estado.productos);
  return useMemo(() => {
    const detalladas: LineaDetallada[] = lineas.flatMap((linea) => {
      const producto = productos.find((item) => item.id === linea.productoId);
      return producto && producto.activo ? [{ producto, cantidad: linea.cantidad }] : [];
    });
    return {
      lineas: detalladas,
      articulos: detalladas.reduce((suma, linea) => suma + linea.cantidad, 0),
      precio: detalladas.reduce((suma, linea) => suma + linea.producto.precio * linea.cantidad, 0),
      vp: detalladas.reduce((suma, linea) => suma + linea.producto.vp * linea.cantidad, 0),
      vc: detalladas.reduce((suma, linea) => suma + linea.producto.vc * linea.cantidad, 0),
    };
  }, [lineas, productos]);
}
