import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search, SearchX } from 'lucide-react';
import { unirClases } from '../../utilidades/clases';
import { EstadoVacio } from './EstadoVacio';

export interface ColumnaTabla<T> {
  clave: string;
  titulo: string;
  render: (fila: T) => ReactNode;
  valorOrden?: (fila: T) => string | number;
  alinear?: 'izquierda' | 'derecha' | 'centro';
  principalEnMovil?: boolean;
  ocultarEnMovil?: boolean;
}

interface PropsTabla<T> {
  columnas: ColumnaTabla<T>[];
  filas: T[];
  claveFila: (fila: T) => string;
  textoBusqueda?: (fila: T) => string;
  placeholderBusqueda?: string;
  filtros?: ReactNode;
  accionesCabecera?: ReactNode;
  accionesFila?: (fila: T) => ReactNode;
  porPagina?: number;
  textoVacio?: string;
  alSeleccionarFila?: (fila: T) => void;
}

type Direccion = 'asc' | 'desc';

const alineaciones = { izquierda: 'text-left', derecha: 'text-right', centro: 'text-center' };

export function Tabla<T>({
  columnas, filas, claveFila, textoBusqueda, placeholderBusqueda = 'Buscar', filtros, accionesCabecera,
  accionesFila, porPagina = 10, textoVacio = 'No hay registros para mostrar.', alSeleccionarFila,
}: PropsTabla<T>) {
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState<{ clave: string; direccion: Direccion } | null>(null);
  const [pagina, setPagina] = useState(1);

  const filtradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    const base = termino && textoBusqueda ? filas.filter((fila) => textoBusqueda(fila).toLowerCase().includes(termino)) : filas;
    if (!orden) return base;
    const columna = columnas.find((item) => item.clave === orden.clave);
    if (!columna?.valorOrden) return base;
    const obtener = columna.valorOrden;
    return [...base].sort((a, b) => {
      const va = obtener(a);
      const vb = obtener(b);
      const comparacion = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'es');
      return orden.direccion === 'asc' ? comparacion : -comparacion;
    });
  }, [filas, busqueda, orden, columnas, textoBusqueda]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / porPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtradas.slice((paginaActual - 1) * porPagina, paginaActual * porPagina);
  const desde = filtradas.length === 0 ? 0 : (paginaActual - 1) * porPagina + 1;
  const hasta = Math.min(paginaActual * porPagina, filtradas.length);

  const alternarOrden = (clave: string) => {
    setOrden((actual) => {
      if (!actual || actual.clave !== clave) return { clave, direccion: 'asc' };
      if (actual.direccion === 'asc') return { clave, direccion: 'desc' };
      return null;
    });
  };

  const principal = columnas.find((columna) => columna.principalEnMovil) ?? columnas[0];

  return (
    <div className="min-w-0 rounded-tarjeta border border-borde bg-superficie shadow-tarjeta">
      {(textoBusqueda || filtros || accionesCabecera) && (
        <div className="flex flex-col gap-3 border-b border-borde p-4 lg:flex-row lg:items-center">
          {textoBusqueda && (
            <label className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-borde bg-fondo px-3 text-texto-3 focus-within:border-acento lg:max-w-xs">
              <Search className="size-4 shrink-0" aria-hidden />
              <span className="sr-only">{placeholderBusqueda}</span>
              <input
                value={busqueda}
                onChange={(evento) => { setBusqueda(evento.target.value); setPagina(1); }}
                placeholder={placeholderBusqueda}
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-texto outline-none placeholder:text-texto-3"
              />
            </label>
          )}
          {filtros && <div className="flex flex-wrap items-center gap-2">{filtros}</div>}
          {accionesCabecera && <div className="flex flex-wrap items-center gap-2 lg:ml-auto">{accionesCabecera}</div>}
        </div>
      )}

      {visibles.length === 0 ? (
        <EstadoVacio icono={SearchX} titulo="Sin resultados" texto={busqueda ? 'Ningún registro coincide con la búsqueda.' : textoVacio} />
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-[13.5px]">
              <thead>
                <tr className="border-b border-borde">
                  {columnas.map((columna) => {
                    const activa = orden?.clave === columna.clave;
                    const IconoOrden = !activa ? ArrowUpDown : orden.direccion === 'asc' ? ArrowUp : ArrowDown;
                    return (
                      <th key={columna.clave} scope="col" className={unirClases('whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3', alineaciones[columna.alinear ?? 'izquierda'])}>
                        {columna.valorOrden ? (
                          <button type="button" onClick={() => alternarOrden(columna.clave)} className={unirClases('inline-flex items-center gap-1 uppercase hover:text-texto', activa && 'text-primario')}>
                            {columna.titulo}
                            <IconoOrden className="size-3" aria-hidden />
                          </button>
                        ) : columna.titulo}
                      </th>
                    );
                  })}
                  {accionesFila && <th scope="col" className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {visibles.map((fila) => (
                  <tr
                    key={claveFila(fila)}
                    onClick={alSeleccionarFila ? () => alSeleccionarFila(fila) : undefined}
                    className={unirClases('border-b border-borde last:border-b-0 hover:bg-fondo/70', alSeleccionarFila && 'cursor-pointer')}
                  >
                    {columnas.map((columna) => (
                      <td key={columna.clave} className={unirClases('px-4 py-3 align-middle', alineaciones[columna.alinear ?? 'izquierda'])}>{columna.render(fila)}</td>
                    ))}
                    {accionesFila && <td className="px-4 py-3 text-right" onClick={(evento) => evento.stopPropagation()}>{accionesFila(fila)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-borde md:hidden">
            {visibles.map((fila) => (
              <li key={claveFila(fila)} className="p-4" onClick={alSeleccionarFila ? () => alSeleccionarFila(fila) : undefined}>
                <div className="font-semibold text-texto">{principal.render(fila)}</div>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
                  {columnas.filter((columna) => columna !== principal && !columna.ocultarEnMovil).map((columna) => (
                    <div key={columna.clave} className="min-w-0">
                      <dt className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-texto-3">{columna.titulo}</dt>
                      <dd className="mt-0.5 text-[13px] text-texto">{columna.render(fila)}</dd>
                    </div>
                  ))}
                </dl>
                {accionesFila && <div className="mt-3 flex flex-wrap gap-2" onClick={(evento) => evento.stopPropagation()}>{accionesFila(fila)}</div>}
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="flex flex-col items-center justify-between gap-3 border-t border-borde px-4 py-3 text-[12.5px] text-texto-2 sm:flex-row">
        <span>Mostrando <span className="cifra font-medium text-texto">{desde}-{hasta}</span> de <span className="cifra font-medium text-texto">{filtradas.length}</span> registros</span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setPagina(paginaActual - 1)} disabled={paginaActual === 1} aria-label="Página anterior" className="grid size-11 place-items-center rounded-lg border border-borde disabled:opacity-40 md:size-9">
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <span className="cifra min-w-16 text-center">{paginaActual} / {totalPaginas}</span>
          <button type="button" onClick={() => setPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas} aria-label="Página siguiente" className="grid size-11 place-items-center rounded-lg border border-borde disabled:opacity-40 md:size-9">
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
