import { useCatalogoStore } from '../store/useCatalogoStore';
import { useDescuentosStore } from '../store/useDescuentosStore';
import type { Descuento, Producto } from '../tipos/catalogo';
import { fechaHoraActualIso } from '../utilidades/fechas';
import { redondear } from '../utilidades/formatos';
import { exito, fallo, type Resultado } from '../validaciones/resultado';
import { registrarBitacora } from './registro';

export interface PrecioConDescuento { precioLista: number; precioFinal: number; descuento: Descuento | null; ahorro: number; }

export function fechaHoy(): string {
  return fechaHoraActualIso().slice(0, 10);
}

export function descuentoVigente(descuento: Descuento, fecha: string): boolean {
  return descuento.activo && descuento.vigenteDesde <= fecha && (!descuento.vigenteHasta || descuento.vigenteHasta >= fecha);
}

export function calcularPrecio(producto: Producto, descuentos: Descuento[], fecha = fechaHoy()): PrecioConDescuento {
  const aplicables = descuentos.filter((descuento) => descuento.productoIds.includes(producto.id) && descuentoVigente(descuento, fecha));
  let mejor: PrecioConDescuento = { precioLista: producto.precio, precioFinal: producto.precio, descuento: null, ahorro: 0 };
  aplicables.forEach((descuento) => {
    const rebaja = descuento.tipo === 'porcentaje' ? producto.precio * (descuento.valor / 100) : descuento.valor;
    const precioFinal = redondear(Math.max(0, producto.precio - rebaja));
    if (precioFinal < mejor.precioFinal) mejor = { precioLista: producto.precio, precioFinal, descuento, ahorro: redondear(producto.precio - precioFinal) };
  });
  return mejor;
}

export type DatosDescuento = Omit<Descuento, 'id' | 'creadoPor' | 'fecha'> & { id?: string };

export function guardarDescuento(datos: DatosDescuento, actorId: string): Resultado<Descuento> {
  if (datos.nombre.trim().length < 3) return fallo('El nombre del descuento debe tener al menos 3 caracteres.');
  if (!Number.isFinite(datos.valor) || datos.valor <= 0) return fallo('El valor del descuento debe ser mayor a cero.');
  if (datos.tipo === 'porcentaje' && datos.valor > 90) return fallo('El porcentaje no puede superar el 90 %.');
  if (datos.productoIds.length === 0) return fallo('Elige al menos un producto.');
  if (!datos.vigenteDesde) return fallo('Indica la fecha de inicio.');
  if (datos.vigenteHasta && datos.vigenteHasta < datos.vigenteDesde) return fallo('La fecha de fin no puede ser anterior al inicio.');
  if (datos.tipo === 'monto') {
    const productos = useCatalogoStore.getState().productos;
    const excedido = productos.find((producto) => datos.productoIds.includes(producto.id) && datos.valor >= producto.precio);
    if (excedido) return fallo(`El monto fijo deja sin precio a ${excedido.nombre} (USD ${excedido.precio}). Usa un valor menor.`);
  }
  const { descuentos, establecer } = useDescuentosStore.getState();
  if (datos.id) {
    const anterior = descuentos.find((descuento) => descuento.id === datos.id);
    if (!anterior) return fallo('Descuento no encontrado.');
    const actualizado: Descuento = { ...anterior, ...datos, id: anterior.id };
    establecer(descuentos.map((descuento) => (descuento.id === anterior.id ? actualizado : descuento)));
    registrarBitacora({ actorId, accion: 'Edición de descuento', modulo: 'catalogo', referenciaId: anterior.id, antes: { tipo: anterior.tipo, valor: anterior.valor, productos: anterior.productoIds, activo: anterior.activo }, despues: { tipo: actualizado.tipo, valor: actualizado.valor, productos: actualizado.productoIds, activo: actualizado.activo } });
    return exito(actualizado);
  }
  const numeros = descuentos.map((descuento) => Number(descuento.id.replace('DEMO-DSC-', '')));
  const nuevo: Descuento = { ...datos, id: `DEMO-DSC-${String(Math.max(0, ...numeros) + 1).padStart(2, '0')}`, creadoPor: actorId, fecha: fechaHoraActualIso() };
  establecer([...descuentos, nuevo]);
  registrarBitacora({ actorId, accion: 'Alta de descuento', modulo: 'catalogo', referenciaId: nuevo.id, despues: { tipo: nuevo.tipo, valor: nuevo.valor, productos: nuevo.productoIds, vigencia: [nuevo.vigenteDesde, nuevo.vigenteHasta] } });
  return exito(nuevo);
}

export function etiquetaDescuento(descuento: Descuento): string {
  return descuento.tipo === 'porcentaje' ? `-${descuento.valor} %` : `-USD ${descuento.valor}`;
}
