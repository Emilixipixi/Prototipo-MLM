import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, Search, SearchX } from 'lucide-react';
import { TarjetaProducto } from '../../componentes/catalogo/TarjetaProducto';
import { Boton } from '../../componentes/ui/Boton';
import { EstadoVacio } from '../../componentes/ui/EstadoVacio';
import { useToast } from '../../componentes/ui/useToast';
import { categorias } from '../../datos/presentacionCatalogo';
import { useCarritoStore } from '../../store/useCarritoStore';
import { useCatalogoStore } from '../../store/useCatalogoStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { CategoriaProducto, Producto } from '../../tipos/catalogo';
import { unirClases } from '../../utilidades/clases';
import { puedeVerVolumen } from '../../utilidades/visibilidad';

type Filtro = CategoriaProducto | 'todas';

export default function Catalogo() {
  const [parametros, setParametros] = useSearchParams();
  const [busqueda, setBusqueda] = useState('');
  const todos = useCatalogoStore((estado) => estado.productos);
  const agregar = useCarritoStore((estado) => estado.agregar);
  const persona = usePersonaSesion();
  const toast = useToast();
  const mostrarVolumen = puedeVerVolumen(persona);
  const parametro = parametros.get('categoria');
  const filtro: Filtro = parametro && parametro in categorias ? (parametro as CategoriaProducto) : 'todas';

  const productos = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return todos
      .filter((producto) => producto.activo)
      .filter((producto) => filtro === 'todas' || producto.categoria === filtro)
      .filter((producto) => !termino || `${producto.nombre} ${producto.descripcion} ${producto.codigo}`.toLowerCase().includes(termino));
  }, [todos, filtro, busqueda]);

  const cambiarFiltro = (valor: Filtro) => {
    setParametros(valor === 'todas' ? {} : { categoria: valor });
  };

  const agregarProducto = (producto: Producto) => {
    agregar(producto.id);
    toast.exito('Agregado al carrito', producto.nombre);
  };

  const chips: Array<{ valor: Filtro; texto: string }> = [
    { valor: 'todas', texto: 'Todas' },
    ...(Object.keys(categorias) as CategoriaProducto[]).map((clave) => ({ valor: clave as Filtro, texto: categorias[clave].plural })),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-texto sm:text-[28px]">Catálogo</h2>
        <p className="mt-1 text-[13.5px] text-texto-2">
          {mostrarVolumen
            ? 'Cada producto muestra su precio, su VP y su VC. Los tres valores son independientes.'
            : 'Bienes, servicios y programas formativos disponibles en la demostración.'}
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-borde bg-superficie px-3 text-texto-3 focus-within:border-acento lg:max-w-sm">
          <Search className="size-4 shrink-0" aria-hidden />
          <span className="sr-only">Buscar en el catálogo</span>
          <input value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder="Buscar por nombre o código" className="min-w-0 flex-1 bg-transparent py-2 text-sm text-texto outline-none placeholder:text-texto-3" />
        </label>
        <div className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          <div className="flex min-w-max gap-2" role="group" aria-label="Filtrar por categoría">
            {chips.map((chip) => (
              <button
                key={chip.valor}
                type="button"
                aria-pressed={filtro === chip.valor}
                onClick={() => cambiarFiltro(chip.valor)}
                className={unirClases(
                  'inline-flex min-h-11 items-center rounded-full border px-4 text-[13px] font-semibold transition-colors md:min-h-10',
                  filtro === chip.valor ? 'border-primario bg-primario text-white' : 'border-borde bg-superficie text-texto-2 hover:border-texto-3',
                )}
              >
                {chip.texto}
              </button>
            ))}
          </div>
        </div>
        <p className="cifra text-[12.5px] text-texto-2 lg:ml-auto"><LayoutGrid className="mr-1 inline size-4 align-[-3px]" aria-hidden />{productos.length} productos</p>
      </div>

      {productos.length === 0 ? (
        <EstadoVacio
          icono={SearchX}
          titulo="No encontramos productos"
          texto="Prueba con otra búsqueda o quita el filtro de categoría."
          accion={<Boton variante="secundario" onClick={() => { setBusqueda(''); cambiarFiltro('todas'); }}>Limpiar filtros</Boton>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productos.map((producto) => <TarjetaProducto key={producto.id} producto={producto} mostrarVolumen={mostrarVolumen} alAgregar={agregarProducto} />)}
        </div>
      )}
    </div>
  );
}
