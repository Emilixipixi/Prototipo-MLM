import { useCallback } from 'react';
import { calcularPrecio } from '../servicios/descuentos';
import { useDescuentosStore } from '../store/useDescuentosStore';
import type { Producto } from '../tipos/catalogo';

export function usePrecios() {
  const descuentos = useDescuentosStore((estado) => estado.descuentos);
  return useCallback((producto: Producto) => calcularPrecio(producto, descuentos), [descuentos]);
}
