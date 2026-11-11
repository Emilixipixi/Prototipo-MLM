import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { ComprobanteSimulado } from '../../componentes/catalogo/ComprobanteSimulado';
import { Boton } from '../../componentes/ui/Boton';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tabla, type ColumnaTabla } from '../../componentes/ui/Tabla';
import { estadosPedido } from '../../datos/presentacionEstados';
import { useFuente } from '../../hooks/useFuente';
import { useCatalogoStore } from '../../store/useCatalogoStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { Pedido } from '../../tipos/pedidos';
import { unirClases } from '../../utilidades/clases';
import { formatearFechaHora } from '../../utilidades/fechas';
import { formatearMonto, formatearNumero } from '../../utilidades/formatos';

type Filtro = 'todas' | 'propias' | 'clientes';

export default function MisCompras() {
  const fuente = useFuente();
  const persona = usePersonaSesion();
  const productos = useCatalogoStore((estado) => estado.productos);
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [comprobante, setComprobante] = useState<Pedido | null>(null);
  const personaId = persona?.id ?? '';
  const pedidos = useMemo(() => fuente.pedidos
    .filter((pedido) => (filtro !== 'clientes' && pedido.compradorId === personaId) || (filtro !== 'propias' && pedido.referenteId === personaId))
    .sort((a, b) => b.fecha.localeCompare(a.fecha)), [fuente.pedidos, personaId, filtro]);
  if (!persona) return null;
  const nombre = (id: string) => {
    const item = fuente.personas.find((candidata) => candidata.id === id);
    return item ? `${item.nombres} ${item.apellidos}` : id;
  };
  const nombresProductos = (pedido: Pedido) => pedido.items.map((item) => productos.find((producto) => producto.id === item.productoId)?.nombre ?? item.productoId).join(', ');

  const columnas: ColumnaTabla<Pedido>[] = [
    { clave: 'pedido', titulo: 'Pedido', principalEnMovil: true, valorOrden: (fila) => fila.id, render: (fila) => <Link to={`/pedido/${fila.id}`} className="cifra inline-flex min-h-11 items-center font-semibold text-acento hover:underline md:min-h-0">{fila.id}</Link> },
    { clave: 'fecha', titulo: 'Fecha', valorOrden: (fila) => fila.fecha, render: (fila) => <span className="cifra text-[12.5px]">{formatearFechaHora(fila.fecha)}</span> },
    { clave: 'comprador', titulo: 'Comprador', render: (fila) => (fila.compradorId === personaId ? <span className="font-semibold">Compra propia</span> : <span>{nombre(fila.compradorId)}<span className="block text-xs text-texto-2">Cliente referido</span></span>) },
    { clave: 'productos', titulo: 'Productos', ocultarEnMovil: true, render: (fila) => <span className="line-clamp-2 text-[12.5px] text-texto-2">{nombresProductos(fila)}</span> },
    { clave: 'periodo', titulo: 'Período', valorOrden: (fila) => fila.periodoId, render: (fila) => <span className="cifra text-[12.5px]">{fila.periodoId}</span> },
    { clave: 'total', titulo: 'Total', alinear: 'derecha', valorOrden: (fila) => fila.totalPrecio, render: (fila) => <span className="cifra font-semibold">{formatearMonto(fila.totalPrecio)}</span> },
    { clave: 'vp', titulo: 'VP / VC', alinear: 'derecha', valorOrden: (fila) => fila.totalVp, render: (fila) => <span className="cifra text-[12.5px]">{formatearNumero(fila.totalVp)} / {formatearNumero(fila.totalVc)}</span> },
    { clave: 'estado', titulo: 'Estado', valorOrden: (fila) => fila.estado, render: (fila) => <Insignia tono={estadosPedido[fila.estado].tono} icono={estadosPedido[fila.estado].icono}>{estadosPedido[fila.estado].etiqueta}</Insignia> },
  ];

  const chips: Array<{ valor: Filtro; texto: string }> = [{ valor: 'todas', texto: 'Todas' }, { valor: 'propias', texto: 'Propias' }, { valor: 'clientes', texto: 'De clientes referidos' }];

  return (
    <div className="flex flex-col gap-4">
      <Tabla
        columnas={columnas}
        filas={pedidos}
        claveFila={(fila) => fila.id}
        porPagina={12}
        textoBusqueda={(fila) => `${fila.id} ${nombre(fila.compradorId)} ${nombresProductos(fila)} ${fila.periodoId} ${fila.estado} ${estadosPedido[fila.estado].etiqueta} ${fila.comprobante}`}
        placeholderBusqueda="Persona, producto, período, estado o comprobante"
        textoVacio="No hay compras para este filtro."
        filtros={chips.map((chip) => (
          <button key={chip.valor} type="button" aria-pressed={filtro === chip.valor} onClick={() => setFiltro(chip.valor)} className={unirClases('inline-flex min-h-11 items-center rounded-full border px-3.5 text-[12.5px] font-semibold md:min-h-9', filtro === chip.valor ? 'border-primario bg-primario text-white' : 'border-borde text-texto-2 hover:border-texto-3')}>{chip.texto}</button>
        ))}
        accionesFila={(fila) => (fila.comprobante ? <Boton tamano="sm" variante="secundario" icono={FileText} onClick={() => setComprobante(fila)}>Comprobante</Boton> : <span className="text-xs text-texto-3">Sin comprobante</span>)}
      />
      <ComprobanteSimulado pedido={comprobante} alCerrar={() => setComprobante(null)} />
    </div>
  );
}
