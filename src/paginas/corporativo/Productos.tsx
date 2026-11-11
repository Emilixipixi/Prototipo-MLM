import { useState, type ChangeEvent } from 'react';
import { BadgePercent, Package, Pencil, Plus, Power } from 'lucide-react';
import { GestionDescuentos } from '../../componentes/catalogo/GestionDescuentos';
import { Pestanas } from '../../componentes/ui/Pestanas';
import { CampoImagenProducto } from '../../componentes/catalogo/CampoImagenProducto';
import { ImagenProducto } from '../../componentes/catalogo/ImagenProducto';
import { Boton } from '../../componentes/ui/Boton';
import { BotonIcono } from '../../componentes/ui/BotonIcono';
import { Campo } from '../../componentes/ui/Campo';
import { ConPermiso } from '../../componentes/ui/ConPermiso';
import { EstadoError } from '../../componentes/ui/EstadoError';
import { Insignia } from '../../componentes/ui/Insignia';
import { Modal } from '../../componentes/ui/Modal';
import { Selector } from '../../componentes/ui/Selector';
import { Tabla, type ColumnaTabla } from '../../componentes/ui/Tabla';
import { useToast } from '../../componentes/ui/useToast';
import { categorias } from '../../datos/presentacionCatalogo';
import { usePermiso } from '../../hooks/usePermiso';
import { guardarProducto, type DatosProducto } from '../../servicios/catalogo';
import { useCatalogoStore } from '../../store/useCatalogoStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { CategoriaProducto, Producto } from '../../tipos/catalogo';
import { formatearFecha } from '../../utilidades/fechas';
import { formatearMonto, formatearNumero } from '../../utilidades/formatos';

const vacio: DatosProducto = {
  nombre: '', descripcion: '', categoria: 'bien_fisico', precio: 0, vp: 0, vc: 0, moneda: 'USD',
  vigenteDesde: '2026-11-11', vigenteHasta: null, activo: true,
};

export default function Productos() {
  const [seccion, setSeccion] = useState('productos');
  return (
    <div className="flex flex-col gap-5">
      <Pestanas etiqueta="Catálogo" activa={seccion} alCambiar={setSeccion} pestanas={[{ id: 'productos', texto: 'Productos', icono: Package }, { id: 'descuentos', texto: 'Descuentos', icono: BadgePercent }]} />
      {seccion === 'productos' ? <ListaProductos /> : <GestionDescuentos />}
    </div>
  );
}

function ListaProductos() {
  const productos = useCatalogoStore((estado) => estado.productos);
  const actor = usePersonaSesion();
  const toast = useToast();
  const puedeEditar = usePermiso('catalogo', 'editar');
  const [edicion, setEdicion] = useState<DatosProducto | null>(null);

  const alternarActivo = (producto: Producto) => {
    const resultado = guardarProducto({ ...producto, activo: !producto.activo }, actor?.id ?? 'DEMO-U01');
    if (resultado.ok) toast.info(producto.activo ? 'Producto desactivado' : 'Producto activado', `${producto.codigo} ${producto.activo ? 'ya no aparece en el catálogo público' : 'vuelve al catálogo público'}. Los pedidos anteriores conservan sus valores.`);
  };

  const columnas: ColumnaTabla<Producto>[] = [
    {
      clave: 'nombre', titulo: 'Producto', principalEnMovil: true, valorOrden: (fila) => fila.nombre,
      render: (fila) => (
        <div className="flex min-w-0 items-center gap-3">
          <ImagenProducto producto={fila} tamano="sm" className="size-10 shrink-0 rounded-lg" />
          <div className="min-w-0"><p className="truncate font-semibold">{fila.nombre}</p><p className="cifra text-xs text-texto-2">{fila.codigo}</p></div>
        </div>
      ),
    },
    { clave: 'categoria', titulo: 'Categoría', render: (fila) => <Insignia tono={categorias[fila.categoria].tono} icono={categorias[fila.categoria].icono}>{categorias[fila.categoria].nombre}</Insignia> },
    { clave: 'precio', titulo: 'Precio', alinear: 'derecha', valorOrden: (fila) => fila.precio, render: (fila) => <span className="cifra">{formatearMonto(fila.precio, fila.moneda)}</span> },
    { clave: 'vp', titulo: 'VP', alinear: 'derecha', valorOrden: (fila) => fila.vp, render: (fila) => <span className="cifra">{formatearNumero(fila.vp)}</span> },
    { clave: 'vc', titulo: 'VC', alinear: 'derecha', valorOrden: (fila) => fila.vc, render: (fila) => <span className="cifra">{formatearNumero(fila.vc)}</span> },
    { clave: 'vigencia', titulo: 'Vigencia', ocultarEnMovil: true, render: (fila) => <span className="text-[12.5px] text-texto-2">{formatearFecha(fila.vigenteDesde)} - {fila.vigenteHasta ? formatearFecha(fila.vigenteHasta) : 'sin fin'}</span> },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <Insignia tono={fila.activo ? 'exito' : 'retenida'}>{fila.activo ? 'Activo' : 'Inactivo'}</Insignia> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[13px] text-texto-2">Precio, VP y VC son independientes. Un cambio aplica a pedidos nuevos; los pedidos registrados conservan los valores con los que se confirmaron.</p>
      <Tabla
        columnas={columnas}
        filas={productos}
        claveFila={(fila) => fila.id}
        textoBusqueda={(fila) => `${fila.nombre} ${fila.codigo}`}
        placeholderBusqueda="Buscar producto o código"
        accionesCabecera={<ConPermiso modulo="catalogo" accion="crear"><Boton icono={Plus} onClick={() => setEdicion({ ...vacio })}>Nuevo producto</Boton></ConPermiso>}
        accionesFila={puedeEditar ? (fila) => (
          <div className="flex gap-1">
            <BotonIcono icono={Pencil} etiqueta={`Editar ${fila.nombre}`} onClick={() => setEdicion({ ...fila })} />
            <BotonIcono icono={Power} etiqueta={`${fila.activo ? 'Desactivar' : 'Activar'} ${fila.nombre}`} onClick={() => alternarActivo(fila)} />
          </div>
        ) : undefined}
      />
      {edicion && <FormularioProducto inicial={edicion} alCerrar={() => setEdicion(null)} />}
    </div>
  );
}

function FormularioProducto({ inicial, alCerrar }: { inicial: DatosProducto; alCerrar: () => void }) {
  const actor = usePersonaSesion();
  const toast = useToast();
  const [datos, setDatos] = useState(inicial);
  const [error, setError] = useState<string | null>(null);
  const cambiar = <K extends keyof DatosProducto>(clave: K, valor: DatosProducto[K]) => setDatos((previo) => ({ ...previo, [clave]: valor }));
  const numero = (clave: 'precio' | 'vp' | 'vc') => ({ type: 'number', min: 0, step: 'any', value: String(datos[clave]), onChange: (evento: ChangeEvent<HTMLInputElement>) => cambiar(clave, evento.target.value === '' ? Number.NaN : Number(evento.target.value)) });

  const guardar = () => {
    const resultado = guardarProducto(datos, actor?.id ?? 'DEMO-U01');
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    toast.exito(datos.id ? 'Producto actualizado' : 'Producto creado', `${resultado.valor.codigo} · ${resultado.valor.nombre}`);
    alCerrar();
  };

  return (
    <Modal abierto alCerrar={alCerrar} titulo={datos.id ? `Editar ${datos.nombre}` : 'Nuevo producto'} descripcion="Valores ficticios de DEMOSTRACIÓN." ancho="lg" pie={<><Boton variante="secundario" onClick={alCerrar}>Cancelar</Boton><Boton icono={Package} onClick={guardar}>Guardar</Boton></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        {error && <div className="sm:col-span-2"><EstadoError queOcurrio={error} /></div>}
        <Campo etiqueta="Nombre" value={datos.nombre} onChange={(evento) => cambiar('nombre', evento.target.value)} className="sm:col-span-2" />
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="descripcion-producto" className="text-[13px] font-semibold">Descripción</label>
          <textarea id="descripcion-producto" rows={2} value={datos.descripcion} onChange={(evento) => cambiar('descripcion', evento.target.value)} className="w-full rounded-xl border border-borde p-3 text-sm outline-none focus:border-acento focus:ring-2 focus:ring-acento-suave" />
        </div>
        <Selector etiqueta="Categoría" value={datos.categoria} onChange={(evento) => cambiar('categoria', evento.target.value as CategoriaProducto)} opciones={(Object.keys(categorias) as CategoriaProducto[]).map((clave) => ({ valor: clave, texto: categorias[clave].nombre }))} />
        <Campo etiqueta="Precio (USD)" {...numero('precio')} />
        <Campo etiqueta="VP" ayuda="Volumen de puntos para calificación." {...numero('vp')} />
        <Campo etiqueta="VC" ayuda="Volumen de compensación para bonos." {...numero('vc')} />
        <Campo etiqueta="Vigente desde" type="date" value={datos.vigenteDesde} onChange={(evento) => cambiar('vigenteDesde', evento.target.value)} />
        <Campo etiqueta="Vigente hasta (opcional)" type="date" value={datos.vigenteHasta ?? ''} onChange={(evento) => cambiar('vigenteHasta', evento.target.value || null)} />
        <div className="sm:col-span-2"><CampoImagenProducto producto={{ id: datos.id ?? 'nuevo', nombre: datos.nombre || 'Nuevo producto', categoria: datos.categoria, imagen: datos.imagen }} alCambiar={(imagen) => cambiar('imagen', imagen)} /></div>
        {datos.categoria === 'programa_formativo' && <Campo etiqueta="Proveedor formativo" value={datos.proveedorFormativo ?? ''} onChange={(evento) => cambiar('proveedorFormativo', evento.target.value)} className="sm:col-span-2" />}
        <label className="flex min-h-11 items-center gap-2 text-[13.5px] font-semibold sm:col-span-2">
          <input type="checkbox" checked={datos.activo} onChange={(evento) => cambiar('activo', evento.target.checked)} className="size-5 accent-[#0E7490]" />
          Visible en el catálogo público
        </label>
      </div>
    </Modal>
  );
}
