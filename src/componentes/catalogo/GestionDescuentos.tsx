import { useState } from 'react';
import { BadgePercent, Pencil, Plus, Power } from 'lucide-react';
import { categorias } from '../../datos/presentacionCatalogo';
import { usePermiso } from '../../hooks/usePermiso';
import { calcularPrecio, descuentoVigente, etiquetaDescuento, fechaHoy, guardarDescuento, type DatosDescuento } from '../../servicios/descuentos';
import { useCatalogoStore } from '../../store/useCatalogoStore';
import { useDescuentosStore } from '../../store/useDescuentosStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { Descuento } from '../../tipos/catalogo';
import { unirClases } from '../../utilidades/clases';
import { formatearFecha } from '../../utilidades/fechas';
import { formatearMonto } from '../../utilidades/formatos';
import { Boton } from '../ui/Boton';
import { BotonIcono } from '../ui/BotonIcono';
import { Campo } from '../ui/Campo';
import { ConPermiso } from '../ui/ConPermiso';
import { EstadoError } from '../ui/EstadoError';
import { Insignia } from '../ui/Insignia';
import { Modal } from '../ui/Modal';
import { Selector } from '../ui/Selector';
import { Tabla, type ColumnaTabla } from '../ui/Tabla';
import { useToast } from '../ui/useToast';
import { ImagenProducto } from './ImagenProducto';

const vacio = (): DatosDescuento => ({ nombre: '', tipo: 'porcentaje', valor: 10, productoIds: [], vigenteDesde: fechaHoy(), vigenteHasta: null, activo: true });

function estadoDescuento(descuento: Descuento) {
  const hoy = fechaHoy();
  if (!descuento.activo) return { texto: 'Inactivo', tono: 'retenida' as const };
  if (descuento.vigenteDesde > hoy) return { texto: 'Programado', tono: 'info' as const };
  if (descuento.vigenteHasta && descuento.vigenteHasta < hoy) return { texto: 'Vencido', tono: 'neutra' as const };
  return { texto: 'Vigente', tono: 'exito' as const };
}

export function GestionDescuentos() {
  const descuentos = useDescuentosStore((estado) => estado.descuentos);
  const productos = useCatalogoStore((estado) => estado.productos);
  const actor = usePersonaSesion();
  const toast = useToast();
  const puedeEditar = usePermiso('catalogo', 'editar');
  const [edicion, setEdicion] = useState<DatosDescuento | null>(null);

  const alternar = (descuento: Descuento) => {
    const resultado = guardarDescuento({ ...descuento, activo: !descuento.activo }, actor?.id ?? 'DEMO-U01');
    if (resultado.ok) toast.info(descuento.activo ? 'Descuento desactivado' : 'Descuento activado', `${descuento.nombre}. Los pedidos ya creados conservan su precio.`);
    else toast.error('No se pudo cambiar', resultado.error);
  };

  const columnas: ColumnaTabla<Descuento>[] = [
    { clave: 'nombre', titulo: 'Descuento', principalEnMovil: true, valorOrden: (fila) => fila.nombre, render: (fila) => <div><p className="font-semibold">{fila.nombre}</p><p className="cifra text-xs text-texto-2">{fila.id}</p></div> },
    { clave: 'valor', titulo: 'Valor', render: (fila) => <span className="cifra font-semibold text-exito">{etiquetaDescuento(fila)}</span> },
    { clave: 'productos', titulo: 'Productos', render: (fila) => <span className="text-[12.5px] text-texto-2">{fila.productoIds.map((id) => productos.find((producto) => producto.id === id)?.nombre ?? id).join(', ')}</span> },
    { clave: 'vigencia', titulo: 'Vigencia', render: (fila) => <span className="text-[12.5px]">{formatearFecha(fila.vigenteDesde)} - {fila.vigenteHasta ? formatearFecha(fila.vigenteHasta) : 'sin fin'}</span> },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <Insignia tono={estadoDescuento(fila).tono}>{estadoDescuento(fila).texto}</Insignia> },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] text-texto-2">El descuento baja solo el precio de venta; el VP y el VC de cada producto no cambian. Si un producto tiene varios descuentos vigentes se aplica el de menor precio final. Los pedidos registrados conservan el precio con el que se crearon.</p>
      <Tabla
        columnas={columnas}
        filas={[...descuentos].reverse()}
        claveFila={(fila) => fila.id}
        textoBusqueda={(fila) => `${fila.nombre} ${fila.id}`}
        placeholderBusqueda="Buscar descuento"
        textoVacio="Aún no hay descuentos. Crea uno y elige a qué productos aplica."
        accionesCabecera={<ConPermiso modulo="catalogo" accion="crear"><Boton icono={Plus} onClick={() => setEdicion(vacio())}>Nuevo descuento</Boton></ConPermiso>}
        accionesFila={puedeEditar ? (fila) => (
          <div className="flex gap-1">
            <BotonIcono icono={Pencil} etiqueta={`Editar ${fila.nombre}`} onClick={() => setEdicion({ ...fila })} />
            <BotonIcono icono={Power} etiqueta={`${fila.activo ? 'Desactivar' : 'Activar'} ${fila.nombre}`} onClick={() => alternar(fila)} />
          </div>
        ) : undefined}
      />
      {edicion && <FormularioDescuento inicial={edicion} alCerrar={() => setEdicion(null)} />}
    </div>
  );
}

function FormularioDescuento({ inicial, alCerrar }: { inicial: DatosDescuento; alCerrar: () => void }) {
  const productos = useCatalogoStore((estado) => estado.productos);
  const actor = usePersonaSesion();
  const toast = useToast();
  const [datos, setDatos] = useState(inicial);
  const [valorTexto, setValorTexto] = useState(String(inicial.valor));
  const [error, setError] = useState<string | null>(null);
  const cambiar = <K extends keyof DatosDescuento>(clave: K, valor: DatosDescuento[K]) => setDatos((previo) => ({ ...previo, [clave]: valor }));
  const alternarProducto = (id: string) => cambiar('productoIds', datos.productoIds.includes(id) ? datos.productoIds.filter((item) => item !== id) : [...datos.productoIds, id]);
  const previo: Descuento = { ...datos, valor: Number(valorTexto), id: datos.id ?? 'previo', creadoPor: '', fecha: '', activo: true, vigenteDesde: '0000-01-01', vigenteHasta: null };
  const todosElegidos = productos.length > 0 && datos.productoIds.length === productos.length;

  const guardar = () => {
    const resultado = guardarDescuento({ ...datos, valor: Number(valorTexto) }, actor?.id ?? 'DEMO-U01');
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    const vigente = descuentoVigente(resultado.valor, fechaHoy());
    toast.exito(datos.id ? 'Descuento actualizado' : 'Descuento creado', `${resultado.valor.nombre}: ${etiquetaDescuento(resultado.valor)} en ${resultado.valor.productoIds.length} productos${vigente ? ', ya visible en el catálogo.' : '.'}`);
    alCerrar();
  };

  return (
    <Modal abierto alCerrar={alCerrar} titulo={datos.id ? `Editar ${datos.nombre}` : 'Nuevo descuento'} descripcion="Valores ficticios de DEMOSTRACIÓN." ancho="lg" pie={<><Boton variante="secundario" onClick={alCerrar}>Cancelar</Boton><Boton icono={BadgePercent} onClick={guardar}>Guardar descuento</Boton></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        {error && <div className="sm:col-span-2"><EstadoError queOcurrio={error} /></div>}
        <Campo etiqueta="Nombre del descuento" value={datos.nombre} onChange={(evento) => cambiar('nombre', evento.target.value)} placeholder="Ejemplo: Campaña de fin de año" className="sm:col-span-2" />
        <Selector etiqueta="Tipo" value={datos.tipo} onChange={(evento) => cambiar('tipo', evento.target.value as Descuento['tipo'])} opciones={[{ valor: 'porcentaje', texto: 'Porcentaje sobre el precio' }, { valor: 'monto', texto: 'Monto fijo por unidad (USD)' }]} />
        <Campo etiqueta={datos.tipo === 'porcentaje' ? 'Porcentaje (%)' : 'Monto (USD)'} type="number" min={0} step="any" value={valorTexto} onChange={(evento) => setValorTexto(evento.target.value)} />
        <Campo etiqueta="Vigente desde" type="date" value={datos.vigenteDesde} onChange={(evento) => cambiar('vigenteDesde', evento.target.value)} />
        <Campo etiqueta="Vigente hasta (opcional)" type="date" value={datos.vigenteHasta ?? ''} onChange={(evento) => cambiar('vigenteHasta', evento.target.value || null)} />
        <fieldset className="flex flex-col gap-2 sm:col-span-2">
          <legend className="mb-1.5 flex w-full items-center justify-between gap-2 text-[13px] font-semibold">
            Productos ({datos.productoIds.length} elegidos)
            <button type="button" onClick={() => cambiar('productoIds', todosElegidos ? [] : productos.map((producto) => producto.id))} className="inline-flex min-h-11 items-center px-2 text-[12.5px] font-semibold text-acento hover:underline md:min-h-9">{todosElegidos ? 'Quitar todos' : 'Elegir todos'}</button>
          </legend>
          <ul className="grid gap-2 sm:grid-cols-2">
            {productos.map((producto) => {
              const elegido = datos.productoIds.includes(producto.id);
              const precio = calcularPrecio(producto, [previo]);
              return (
                <li key={producto.id}>
                  <label className={unirClases('flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-2 text-[12.5px]', elegido ? 'border-acento bg-acento-suave/60' : 'border-borde hover:border-texto-3')}>
                    <input type="checkbox" checked={elegido} onChange={() => alternarProducto(producto.id)} className="size-5 shrink-0 accent-[#0E7490]" />
                    <ImagenProducto producto={producto} tamano="sm" className="size-10 shrink-0 rounded-lg" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{producto.nombre}</span>
                      <span className="block text-texto-2">{categorias[producto.categoria].nombre}{!producto.activo ? ' · inactivo' : ''}</span>
                    </span>
                    <span className="cifra shrink-0 text-right">
                      {elegido && precio.ahorro > 0 ? <><span className="block text-texto-3 line-through">{formatearMonto(producto.precio)}</span><span className="block font-semibold text-exito">{formatearMonto(precio.precioFinal)}</span></> : formatearMonto(producto.precio)}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      </div>
    </Modal>
  );
}
