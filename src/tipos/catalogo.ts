export type CategoriaProducto = 'bien_fisico' | 'servicio' | 'programa_formativo';

export interface Producto {
  id: string; codigo: string; nombre: string; descripcion: string;
  categoria: CategoriaProducto;
  precio: number; vp: number; vc: number; moneda: string;
  vigenteDesde: string; vigenteHasta: string | null; activo: boolean;
  proveedorFormativo?: string; imagen?: string;
}

export interface Descuento {
  id: string; nombre: string; tipo: 'porcentaje' | 'monto'; valor: number;
  productoIds: string[]; vigenteDesde: string; vigenteHasta: string | null; activo: boolean;
  creadoPor: string; fecha: string;
}
