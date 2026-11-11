import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShoppingBag, UserPlus, Users } from 'lucide-react';
import { InsigniaRun } from '../../componentes/rangos/InsigniaRun';
import { Avatar } from '../../componentes/ui/Avatar';
import { ChipBrazo } from '../../componentes/ui/ChipBrazo';
import { Insignia } from '../../componentes/ui/Insignia';
import { Pestanas } from '../../componentes/ui/Pestanas';
import { Tabla, type ColumnaTabla } from '../../componentes/ui/Tabla';
import { estadosPedido } from '../../datos/presentacionEstados';
import { useResumenRed } from '../../hooks/useResumenRed';
import type { ResumenNodo } from '../../componentes/redes/tipos';
import type { Pedido } from '../../tipos/pedidos';
import type { Persona } from '../../tipos/persona';
import { formatearFecha, formatearFechaHora } from '../../utilidades/fechas';
import { formatearNumero } from '../../utilidades/formatos';

const tonosCuenta: Record<string, 'exito' | 'advertencia' | 'retenida' | 'error'> = { activo: 'exito', pendiente: 'advertencia', suspendido: 'retenida', bloqueado: 'error' };

export default function MiEquipo() {
  const { fuente, persona, resumen } = useResumenRed();
  const [pestana, setPestana] = useState('directos');
  const personaId = persona?.id ?? '';

  const directos = useMemo(
    () => fuente.patrocinios.filter((relacion) => relacion.patrocinadorId === personaId).map((relacion) => resumen.get(relacion.personaId)).filter((nodo): nodo is ResumenNodo => Boolean(nodo)),
    [fuente.patrocinios, personaId, resumen],
  );
  const clientes = useMemo(
    () => fuente.personas.filter((item) => item.referenteId === personaId && (item.tipo === 'cliente' || item.tipo === 'alumno')),
    [fuente.personas, personaId],
  );
  const actividad = useMemo(() => {
    const ids = new Set([...directos.map((nodo) => nodo.personaId), ...clientes.map((item) => item.id)]);
    return fuente.pedidos.filter((pedido) => ids.has(pedido.compradorId)).sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [fuente.pedidos, directos, clientes]);

  if (!persona) return null;
  const nombre = (id: string) => resumen.get(id)?.nombre ?? id;
  const altaDe = (id: string) => fuente.patrocinios.find((relacion) => relacion.personaId === id)?.fechaRelacion ?? '';

  const columnasDirectos: ColumnaTabla<ResumenNodo>[] = [
    { clave: 'persona', titulo: 'Directo', principalEnMovil: true, valorOrden: (fila) => fila.nombre, render: (fila) => (
      <span className="flex items-center gap-2.5"><Avatar nombres={fila.nombre.split(' ')[0]} apellidos={fila.nombre.split(' ').slice(1).join(' ')} tamano="sm" /><span><span className="block font-semibold">{fila.nombre}</span><span className="cifra block text-xs text-texto-2">{fila.codigo}</span></span></span>
    ) },
    { clave: 'estado', titulo: 'Estado', valorOrden: (fila) => fila.estado, render: (fila) => <Insignia tono={tonosCuenta[fila.estado] ?? 'neutra'} className="capitalize">{fila.estado}</Insignia> },
    { clave: 'run', titulo: 'RUN de Cobro', render: (fila) => <InsigniaRun run={fila.runCobro} tipo="cobro" /> },
    { clave: 'vp', titulo: 'VP del ciclo', alinear: 'derecha', valorOrden: (fila) => fila.vpCiclo, render: (fila) => <span className="cifra font-semibold">{formatearNumero(fila.vpCiclo)}</span> },
    { clave: 'posicion', titulo: 'Posición Trinaria', render: (fila) => (fila.posicionId ? <span className="flex items-center gap-1.5"><ChipBrazo brazo={fila.brazo ?? 'A'} /><span className="cifra text-xs text-texto-2">bajo {fila.padrePosicionPersonaId}</span></span> : <span className="text-xs text-advertencia">Pendiente de asignación</span>) },
    { clave: 'alta', titulo: 'Alta', valorOrden: (fila) => altaDe(fila.personaId), render: (fila) => <span className="cifra text-[12.5px]">{altaDe(fila.personaId) ? formatearFecha(altaDe(fila.personaId)) : '-'}</span> },
  ];

  const columnasClientes: ColumnaTabla<Persona>[] = [
    { clave: 'persona', titulo: 'Cliente', principalEnMovil: true, valorOrden: (fila) => fila.nombres, render: (fila) => <span><span className="block font-semibold">{fila.nombres} {fila.apellidos}</span><span className="cifra block text-xs text-texto-2">{fila.codigo}</span></span> },
    { clave: 'tipo', titulo: 'Tipo', render: (fila) => <span className="capitalize">{fila.tipo}</span> },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <Insignia tono={tonosCuenta[fila.estado] ?? 'neutra'} className="capitalize">{fila.estado}</Insignia> },
    { clave: 'compras', titulo: 'Compras confirmadas', alinear: 'derecha', render: (fila) => <span className="cifra">{fuente.pedidos.filter((pedido) => pedido.compradorId === fila.id && pedido.estado === 'confirmada').length}</span> },
    { clave: 'vp', titulo: 'VP aportado a ti', alinear: 'derecha', render: (fila) => <span className="cifra font-semibold">{formatearNumero(fuente.pedidos.filter((pedido) => pedido.compradorId === fila.id).flatMap((pedido) => fuente.movimientos.filter((movimiento) => movimiento.pedidoId === pedido.id && movimiento.personaId === personaId)).reduce((suma, movimiento) => suma + movimiento.vp, 0))}</span> },
  ];

  const columnasActividad: ColumnaTabla<Pedido>[] = [
    { clave: 'fecha', titulo: 'Fecha', valorOrden: (fila) => fila.fecha, render: (fila) => <span className="cifra text-[12.5px]">{formatearFechaHora(fila.fecha)}</span> },
    { clave: 'pedido', titulo: 'Pedido', principalEnMovil: true, render: (fila) => (fila.referenteId === personaId ? <Link to={`/pedido/${fila.id}`} className="cifra inline-flex min-h-11 items-center font-semibold text-acento hover:underline md:min-h-0">{fila.id}</Link> : <span className="cifra font-semibold">{fila.id}</span>) },
    { clave: 'comprador', titulo: 'Comprador', valorOrden: (fila) => fila.compradorId, render: (fila) => nombre(fila.compradorId) },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <Insignia tono={estadosPedido[fila.estado].tono} icono={estadosPedido[fila.estado].icono}>{estadosPedido[fila.estado].etiqueta}</Insignia> },
    { clave: 'periodo', titulo: 'Período', render: (fila) => <span className="cifra text-[12.5px]">{fila.periodoId}</span> },
    { clave: 'vp', titulo: 'VP', alinear: 'derecha', valorOrden: (fila) => fila.totalVp, render: (fila) => <span className="cifra font-semibold">{formatearNumero(fila.totalVp)}</span> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Pestanas
        etiqueta="Secciones de mi equipo"
        activa={pestana}
        alCambiar={setPestana}
        pestanas={[
          { id: 'directos', texto: 'Directos', icono: Users, contador: directos.length },
          { id: 'clientes', texto: 'Clientes referidos', icono: ShoppingBag, contador: clientes.length },
          { id: 'actividad', texto: 'Actividad', icono: Activity, contador: actividad.length },
        ]}
      />
      {pestana === 'directos' && (
        <Tabla columnas={columnasDirectos} filas={directos} claveFila={(fila) => fila.personaId} textoBusqueda={(fila) => `${fila.nombre} ${fila.codigo} ${fila.estado} ${fila.runCobro ?? ''}`} placeholderBusqueda="Buscar directo" textoVacio="Aún no tienes patrocinados directos." accionesCabecera={<span className="flex items-center gap-1.5 text-xs text-texto-2"><UserPlus className="size-4" aria-hidden />Patrocinio Unilevel</span>} />
      )}
      {pestana === 'clientes' && (
        <Tabla columnas={columnasClientes} filas={clientes} claveFila={(fila) => fila.id} textoBusqueda={(fila) => `${fila.nombres} ${fila.apellidos} ${fila.codigo} ${fila.tipo}`} placeholderBusqueda="Buscar cliente" textoVacio="Aún no tienes clientes referidos." />
      )}
      {pestana === 'actividad' && (
        <Tabla columnas={columnasActividad} filas={actividad} claveFila={(fila) => fila.id} textoBusqueda={(fila) => `${fila.id} ${nombre(fila.compradorId)} ${fila.estado} ${fila.periodoId}`} placeholderBusqueda="Buscar por pedido, comprador o estado" textoVacio="No hay actividad de compra en tu equipo directo." />
      )}
      <p className="text-xs text-texto-2">Por privacidad se muestran el estado y el volumen de las compras de tu equipo, sin montos ni datos de contacto completos.</p>
    </div>
  );
}
