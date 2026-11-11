import { useMemo, useState } from 'react';
import { Award, CalendarRange, Package, ShieldCheck, Users, Wallet } from 'lucide-react';
import { InsigniaRun } from '../../componentes/rangos/InsigniaRun';
import { BarraExportar } from '../../componentes/ui/BarraExportar';
import { ChipsFiltro } from '../../componentes/ui/ChipsFiltro';
import { Insignia } from '../../componentes/ui/Insignia';
import { Pestanas } from '../../componentes/ui/Pestanas';
import { Tabla } from '../../componentes/ui/Tabla';
import { estadosLiquidacion } from '../../datos/presentacionCompensacion';
import { estadosCuenta } from '../../datos/presentacionCuentas';
import { ordenRuns } from '../../datos/reglas';
import { useDatosAfiliado } from '../../hooks/useDatosAfiliado';
import { useBitacoraStore } from '../../store/useBitacoraStore';
import { useCatalogoStore } from '../../store/useCatalogoStore';
import type { FilaExportable } from '../../servicios/exportar';
import type { EstadoLiquidacion } from '../../tipos/compensacion';
import type { CodigoRun } from '../../tipos/reglas';
import { formatearFechaHora } from '../../utilidades/fechas';
import { formatearMonto, formatearNumero, redondear } from '../../utilidades/formatos';

interface FilaAfiliado { id: string; codigo: string; nombre: string; estado: keyof typeof estadosCuenta; runCobro: CodigoRun | null; runHistorico: CodigoRun | null; vpPersonal: number; vpGrupal: number; vcGrupal: number; liquidado: number; }
interface FilaProducto { id: string; nombre: string; unidades: number; ventas: number; vp: number; vc: number; }
interface FilaRun { run: string; cantidad: number; personas: string; }
interface FilaPeriodo { id: string; estado: string; pedidos: number; ventas: number; vp: number; vc: number; liquidado: number; }
interface FilaEstado { estado: EstadoLiquidacion; cantidad: number; total: number; }
interface FilaCompliance { id: string; fecha: string; accion: string; referencia: string; actor: string; motivo: string; }

export default function Reportes() {
  const { fuente, ciclos, calificaciones, liquidaciones } = useDatosAfiliado();
  const productos = useCatalogoStore((estado) => estado.productos);
  const bitacora = useBitacoraStore((estado) => estado.registros);
  const [pestana, setPestana] = useState('afiliados');
  const [periodoId, setPeriodoId] = useState(ciclos[0]?.id ?? '');
  const [estadoCuenta, setEstadoCuenta] = useState<'todos' | keyof typeof estadosCuenta>('todos');

  const afiliados = useMemo<FilaAfiliado[]>(() => fuente.personas
    .filter((persona) => persona.tipo === 'empresario' && (estadoCuenta === 'todos' || persona.estado === estadoCuenta))
    .map((persona) => {
      const calificacion = calificaciones[periodoId]?.find((item) => item.personaId === persona.id);
      return {
        id: persona.id, codigo: persona.codigo, nombre: `${persona.nombres} ${persona.apellidos}`, estado: persona.estado,
        runCobro: calificacion?.runCobro ?? null, runHistorico: calificacion?.runHistorico ?? null,
        vpPersonal: calificacion?.vpPersonal ?? 0, vpGrupal: calificacion?.vpGrupal ?? 0, vcGrupal: calificacion?.vcGrupal ?? 0,
        liquidado: redondear(liquidaciones.filter((liquidacion) => liquidacion.personaId === persona.id && liquidacion.periodoId === periodoId).reduce((suma, liquidacion) => suma + liquidacion.total, 0)),
      };
    }), [fuente.personas, calificaciones, periodoId, estadoCuenta, liquidaciones]);

  const porProducto = useMemo<FilaProducto[]>(() => {
    const mapa = new Map<string, FilaProducto>();
    fuente.pedidos.filter((pedido) => pedido.periodoId === periodoId && pedido.estado === 'confirmada').forEach((pedido) => pedido.items.forEach((item) => {
      const producto = productos.find((candidato) => candidato.id === item.productoId);
      const fila = mapa.get(item.productoId) ?? { id: item.productoId, nombre: producto?.nombre ?? item.productoId, unidades: 0, ventas: 0, vp: 0, vc: 0 };
      fila.unidades += item.cantidad;
      fila.ventas = redondear(fila.ventas + item.cantidad * item.precioUnitario);
      fila.vp += item.cantidad * item.vpUnitario;
      fila.vc += item.cantidad * item.vcUnitario;
      mapa.set(item.productoId, fila);
    }));
    return [...mapa.values()].sort((a, b) => b.ventas - a.ventas);
  }, [fuente.pedidos, periodoId, productos]);

  const porRun = useMemo<FilaRun[]>(() => {
    const lista = calificaciones[periodoId] ?? [];
    return [...[...ordenRuns].reverse(), 'Sin rango'].map((run) => {
      const personas = lista.filter((item) => (item.runCobro ?? 'Sin rango') === run).map((item) => item.personaId);
      return { run, cantidad: personas.length, personas: personas.join(', ') };
    }).filter((fila) => fila.cantidad > 0);
  }, [calificaciones, periodoId]);

  const porPeriodo = useMemo<FilaPeriodo[]>(() => ciclos.map((ciclo) => {
    const pedidos = fuente.pedidos.filter((pedido) => pedido.periodoId === ciclo.id && (pedido.estado === 'confirmada' || pedido.estado === 'devuelta'));
    const movimientos = fuente.movimientos.filter((movimiento) => movimiento.periodoId === ciclo.id);
    return {
      id: ciclo.id, estado: ciclo.estado, pedidos: pedidos.length, ventas: redondear(pedidos.filter((pedido) => pedido.estado === 'confirmada').reduce((suma, pedido) => suma + pedido.totalPrecio, 0)),
      vp: movimientos.reduce((suma, movimiento) => suma + movimiento.vp, 0), vc: movimientos.reduce((suma, movimiento) => suma + movimiento.vc, 0),
      liquidado: redondear(liquidaciones.filter((liquidacion) => liquidacion.periodoId === ciclo.id).reduce((suma, liquidacion) => suma + liquidacion.total, 0)),
    };
  }), [ciclos, fuente, liquidaciones]);

  const porEstado = useMemo<FilaEstado[]>(() => (Object.keys(estadosLiquidacion) as EstadoLiquidacion[]).map((estado) => {
    const lista = liquidaciones.filter((liquidacion) => liquidacion.estado === estado && liquidacion.periodoId === periodoId);
    return { estado, cantidad: lista.length, total: redondear(lista.reduce((suma, liquidacion) => suma + liquidacion.total, 0)) };
  }), [liquidaciones, periodoId]);

  const compliance = useMemo<FilaCompliance[]>(() => bitacora
    .filter((registro) => registro.modulo === 'compliance' || (registro.modulo === 'usuarios' && registro.accion.includes('estado')))
    .sort((a, b) => b.fechaHora.localeCompare(a.fechaHora))
    .map((registro) => ({ id: registro.id, fecha: registro.fechaHora, accion: registro.accion, referencia: registro.referenciaId ?? '-', actor: registro.actorId, motivo: registro.motivo })), [bitacora]);

  const filtroPeriodo = <ChipsFiltro etiqueta="Período" activo={periodoId} alCambiar={setPeriodoId} opciones={ciclos.map((ciclo) => ({ valor: ciclo.id, texto: `${ciclo.id}${ciclo.estado === 'cerrado' ? '' : ' (proyección)'}` }))} />;
  const exportar = (nombre: string, filas: FilaExportable[]) => <BarraExportar modulo="reportes" nombreArchivo={`DEMO-reporte-${nombre}-${periodoId}`} filas={() => filas} />;

  return (
    <div className="flex flex-col gap-5">
      <Pestanas
        etiqueta="Tipo de reporte"
        activa={pestana}
        alCambiar={setPestana}
        pestanas={[
          { id: 'afiliados', texto: 'Afiliados', icono: Users }, { id: 'productos', texto: 'Productos', icono: Package },
          { id: 'run', texto: 'RUN', icono: Award }, { id: 'periodos', texto: 'Períodos', icono: CalendarRange },
          { id: 'estados', texto: 'Liquidaciones', icono: Wallet }, { id: 'compliance', texto: 'Compliance', icono: ShieldCheck },
        ]}
      />
      {pestana === 'afiliados' && (
        <Tabla<FilaAfiliado>
          columnas={[
            { clave: 'nombre', titulo: 'Afiliado', principalEnMovil: true, valorOrden: (fila) => fila.nombre, render: (fila) => <div><p className="font-semibold">{fila.nombre}</p><p className="cifra text-xs text-texto-2">{fila.codigo}</p></div> },
            { clave: 'estado', titulo: 'Estado', render: (fila) => <Insignia tono={estadosCuenta[fila.estado].tono}>{estadosCuenta[fila.estado].etiqueta}</Insignia> },
            { clave: 'run', titulo: 'RUN Cobro / Histórico', render: (fila) => <div className="flex flex-wrap gap-1"><InsigniaRun run={fila.runCobro} tipo="cobro" /><InsigniaRun run={fila.runHistorico} tipo="historico" /></div> },
            { clave: 'vpPersonal', titulo: 'VP personal', alinear: 'derecha', valorOrden: (fila) => fila.vpPersonal, render: (fila) => <span className="cifra">{formatearNumero(fila.vpPersonal)}</span> },
            { clave: 'vpGrupal', titulo: 'VP grupal', alinear: 'derecha', valorOrden: (fila) => fila.vpGrupal, render: (fila) => <span className="cifra">{formatearNumero(fila.vpGrupal)}</span> },
            { clave: 'liquidado', titulo: 'Liquidado', alinear: 'derecha', valorOrden: (fila) => fila.liquidado, render: (fila) => <span className="cifra">{formatearMonto(fila.liquidado)}</span> },
          ]}
          filas={afiliados}
          claveFila={(fila) => fila.id}
          textoBusqueda={(fila) => `${fila.nombre} ${fila.codigo}`}
          filtros={<div className="flex flex-col gap-2">{filtroPeriodo}<ChipsFiltro etiqueta="Estado de cuenta" activo={estadoCuenta} alCambiar={setEstadoCuenta} opciones={[{ valor: 'todos', texto: 'Todos los estados' }, ...(Object.keys(estadosCuenta) as Array<keyof typeof estadosCuenta>).map((estado) => ({ valor: estado, texto: estadosCuenta[estado].etiqueta }))]} /></div>}
          accionesCabecera={exportar('afiliados', afiliados.map((fila) => ({ codigo: fila.codigo, nombre: fila.nombre, estado: fila.estado, runCobro: fila.runCobro ?? 'Sin rango', runHistorico: fila.runHistorico ?? 'Sin rango', vpPersonal: fila.vpPersonal, vpGrupal: fila.vpGrupal, vcGrupal: fila.vcGrupal, liquidado: fila.liquidado })))}
        />
      )}
      {pestana === 'productos' && (
        <Tabla<FilaProducto>
          columnas={[
            { clave: 'nombre', titulo: 'Producto', principalEnMovil: true, render: (fila) => <div><p className="font-semibold">{fila.nombre}</p><p className="cifra text-xs text-texto-2">{fila.id}</p></div> },
            { clave: 'unidades', titulo: 'Unidades', alinear: 'derecha', valorOrden: (fila) => fila.unidades, render: (fila) => <span className="cifra">{fila.unidades}</span> },
            { clave: 'ventas', titulo: 'Ventas', alinear: 'derecha', valorOrden: (fila) => fila.ventas, render: (fila) => <span className="cifra">{formatearMonto(fila.ventas)}</span> },
            { clave: 'vp', titulo: 'VP', alinear: 'derecha', render: (fila) => <span className="cifra">{formatearNumero(fila.vp)}</span> },
            { clave: 'vc', titulo: 'VC', alinear: 'derecha', render: (fila) => <span className="cifra">{formatearNumero(fila.vc)}</span> },
          ]}
          filas={porProducto}
          claveFila={(fila) => fila.id}
          filtros={filtroPeriodo}
          textoVacio="Sin ventas confirmadas en el período."
          accionesCabecera={exportar('productos', porProducto.map((fila) => ({ ...fila })))}
        />
      )}
      {pestana === 'run' && (
        <Tabla<FilaRun>
          columnas={[
            { clave: 'run', titulo: 'RUN de Cobro', principalEnMovil: true, render: (fila) => (fila.run === 'Sin rango' ? <span className="font-semibold">Sin rango</span> : <InsigniaRun run={fila.run as CodigoRun} tipo="cobro" />) },
            { clave: 'cantidad', titulo: 'Afiliados', alinear: 'derecha', render: (fila) => <span className="cifra font-semibold">{fila.cantidad}</span> },
            { clave: 'personas', titulo: 'Códigos', render: (fila) => <span className="cifra text-[12px] text-texto-2">{fila.personas}</span> },
          ]}
          filas={porRun}
          claveFila={(fila) => fila.run}
          filtros={filtroPeriodo}
          accionesCabecera={exportar('run', porRun.map((fila) => ({ ...fila })))}
        />
      )}
      {pestana === 'periodos' && (
        <Tabla<FilaPeriodo>
          columnas={[
            { clave: 'id', titulo: 'Período', principalEnMovil: true, render: (fila) => <span className="cifra font-semibold">{fila.id}</span> },
            { clave: 'estado', titulo: 'Estado', render: (fila) => fila.estado },
            { clave: 'pedidos', titulo: 'Pedidos', alinear: 'derecha', render: (fila) => <span className="cifra">{fila.pedidos}</span> },
            { clave: 'ventas', titulo: 'Ventas netas', alinear: 'derecha', render: (fila) => <span className="cifra">{formatearMonto(fila.ventas)}</span> },
            { clave: 'vp', titulo: 'VP neto', alinear: 'derecha', render: (fila) => <span className="cifra">{formatearNumero(fila.vp)}</span> },
            { clave: 'vc', titulo: 'VC neto', alinear: 'derecha', render: (fila) => <span className="cifra">{formatearNumero(fila.vc)}</span> },
            { clave: 'liquidado', titulo: 'Liquidado', alinear: 'derecha', render: (fila) => <span className="cifra">{formatearMonto(fila.liquidado)}</span> },
          ]}
          filas={porPeriodo}
          claveFila={(fila) => fila.id}
          accionesCabecera={<BarraExportar modulo="reportes" nombreArchivo="DEMO-reporte-periodos" filas={() => porPeriodo.map((fila) => ({ ...fila }))} />}
        />
      )}
      {pestana === 'estados' && (
        <Tabla<FilaEstado>
          columnas={[
            { clave: 'estado', titulo: 'Estado', principalEnMovil: true, render: (fila) => <Insignia tono={estadosLiquidacion[fila.estado].tono} icono={estadosLiquidacion[fila.estado].icono}>{estadosLiquidacion[fila.estado].etiqueta}</Insignia> },
            { clave: 'cantidad', titulo: 'Liquidaciones', alinear: 'derecha', render: (fila) => <span className="cifra">{fila.cantidad}</span> },
            { clave: 'total', titulo: 'Total', alinear: 'derecha', render: (fila) => <span className="cifra font-semibold">{formatearMonto(fila.total)}</span> },
          ]}
          filas={porEstado}
          claveFila={(fila) => fila.estado}
          filtros={filtroPeriodo}
          accionesCabecera={exportar('liquidaciones', porEstado.map((fila) => ({ estado: estadosLiquidacion[fila.estado].etiqueta, cantidad: fila.cantidad, total: fila.total })))}
        />
      )}
      {pestana === 'compliance' && (
        <Tabla<FilaCompliance>
          columnas={[
            { clave: 'fecha', titulo: 'Fecha', valorOrden: (fila) => fila.fecha, render: (fila) => <span className="cifra text-[12.5px]">{formatearFechaHora(fila.fecha)}</span> },
            { clave: 'accion', titulo: 'Decisión u operación', principalEnMovil: true, render: (fila) => <span className="font-semibold">{fila.accion}</span> },
            { clave: 'referencia', titulo: 'Cuenta u operación afectada', render: (fila) => <span className="cifra text-[12.5px]">{fila.referencia}</span> },
            { clave: 'actor', titulo: 'Actor', render: (fila) => <span className="cifra text-[12.5px]">{fila.actor}</span> },
            { clave: 'motivo', titulo: 'Motivo', render: (fila) => <span className="text-xs text-texto-2">{fila.motivo || '-'}</span> },
          ]}
          filas={compliance}
          claveFila={(fila) => fila.id}
          textoBusqueda={(fila) => `${fila.accion} ${fila.referencia} ${fila.motivo}`}
          accionesCabecera={<BarraExportar modulo="reportes" nombreArchivo="DEMO-reporte-compliance" filas={() => compliance.map((fila) => ({ ...fila }))} />}
        />
      )}
    </div>
  );
}
