import { useCatalogoStore } from '../store/useCatalogoStore';
import type { Producto } from '../tipos/catalogo';
import { exito, fallo, type Resultado } from '../validaciones/resultado';
import { registrarBitacora } from './registro';

export type DatosProducto = Omit<Producto, 'id' | 'codigo'> & { id?: string };

export function guardarProducto(datos: DatosProducto, actorId: string): Resultado<Producto> {
  if (datos.nombre.trim().length < 3) return fallo('El nombre debe tener al menos 3 caracteres.');
  for (const [campo, valor] of [['precio', datos.precio], ['VP', datos.vp], ['VC', datos.vc]] as const) {
    if (!Number.isFinite(valor) || valor < 0) return fallo(`El ${campo} debe ser un número mayor o igual a cero.`);
  }
  if (datos.vigenteHasta && datos.vigenteHasta < datos.vigenteDesde) return fallo('La fecha de fin de vigencia no puede ser anterior al inicio.');
  const { productos, establecer } = useCatalogoStore.getState();
  if (datos.id) {
    const anterior = productos.find((producto) => producto.id === datos.id);
    if (!anterior) return fallo('Producto no encontrado.');
    const actualizado: Producto = { ...anterior, ...datos, id: anterior.id, codigo: anterior.codigo };
    establecer(productos.map((producto) => (producto.id === anterior.id ? actualizado : producto)));
    registrarBitacora({
      actorId, accion: 'Edición de producto', modulo: 'catalogo', referenciaId: anterior.id,
      antes: { precio: anterior.precio, vp: anterior.vp, vc: anterior.vc, activo: anterior.activo },
      despues: { precio: actualizado.precio, vp: actualizado.vp, vc: actualizado.vc, activo: actualizado.activo },
    });
    return exito(actualizado);
  }
  const numeros = productos.map((producto) => Number(producto.id.replace('DEMO-PRD-', '')));
  const id = `DEMO-PRD-${String(Math.max(0, ...numeros) + 1).padStart(2, '0')}`;
  const nuevo: Producto = { ...datos, id, codigo: id };
  establecer([...productos, nuevo]);
  registrarBitacora({ actorId, accion: 'Alta de producto', modulo: 'catalogo', referenciaId: id, despues: { precio: nuevo.precio, vp: nuevo.vp, vc: nuevo.vc } });
  return exito(nuevo);
}
