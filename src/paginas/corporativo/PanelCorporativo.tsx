import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ArrowRight, BadgeDollarSign, CalendarRange, ChartColumn, Gift, ScrollText, ShieldAlert, ShoppingCart, TrendingUp, Users, Wallet,
} from 'lucide-react';
import { BarraProgreso } from '../../componentes/rangos/BarraProgreso';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { Insignia, type TonoInsignia } from '../../componentes/ui/Insignia';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { TarjetaKpi } from '../../componentes/ui/TarjetaKpi';
import { presentacionMotores } from '../../datos/presentacionMotores';
import { estadosPedido } from '../../datos/presentacionEstados';
import { ordenRuns } from '../../datos/reglas';
import { useDatosAfiliado } from '../../hooks/useDatosAfiliado';
import { ordenMotores } from '../../motores/ejecutarCorrida';
import { useBitacoraStore } from '../../store/useBitacoraStore';
import { useComplianceStore } from '../../store/useComplianceStore';
import type { EstadoPedido } from '../../tipos/pedidos';
import { avanceCiclo } from '../../utilidades/ciclo';
import { formatearFecha, formatearFechaHora } from '../../utilidades/fechas';
import { formatearMonto, formatearNumero, redondear } from '../../utilidades/formatos';

const tonoSeveridad: Record<string, TonoInsignia> = { alta: 'error', media: 'advertencia', baja: 'info' };
const tonoAlerta: Record<string, TonoInsignia> = { abierta: 'error', en_revision: 'advertencia', resuelta: 'exito' };

export default function PanelCorporativo() {
  const { fuente, periodoActual, periodoCerrado, calificaciones, bonos, liquidaciones } = useDatosAfiliado();
  const alertas = useComplianceStore((estado) => estado.alertas);
  const bitacora = useBitacoraStore((estado) => estado.registros);
  const periodoId = periodoActual?.id ?? '';

  const metricas = useMemo(() => {
    const pedidos = fuente.pedidos.filter((pedido) => pedido.periodoId === periodoId);
    const porEstado = (Object.keys(estadosPedido) as EstadoPedido[]).map((estado) => ({ estado, cantidad: pedidos.filter((pedido) => pedido.estado === estado).length }));
    const ventas = pedidos.filter((pedido) => pedido.estado === 'confirmada').reduce((suma, pedido) => suma + pedido.totalPrecio, 0);
    const movimientos = fuente.movimientos.filter((movimiento) => movimiento.periodoId === periodoId);
    const empresarios = fuente.personas.filter((persona) => persona.tipo === 'empresario');
    const cuentas = ['activo', 'pendiente', 'suspendido', 'bloqueado'].map((estado) => ({ estado, cantidad: empresarios.filter((persona) => persona.estado === estado).length }));
    const cierre = periodoCerrado ? calificaciones[periodoCerrado.id] ?? [] : [];
    const porRun = ordenRuns.map((run) => ({ run: run.replace('RUN', ''), cantidad: cierre.filter((item) => item.runCobro === run).length }));
    const estimados = bonos[periodoId]?.bonos ?? [];
    const porMotor = ordenMotores.map((motor) => ({ motor: presentacionMotores[motor].nombre, monto: redondear(estimados.filter((bono) => bono.motor === motor).reduce((suma, bono) => suma + bono.monto, 0)) }));
    const pendientesPago = liquidaciones.filter((liquidacion) => ['aprobada', 'apta_para_desembolso'].includes(liquidacion.estado));
    const retenidas = liquidaciones.filter((liquidacion) => liquidacion.estado === 'retenida');
    const liquidadas = liquidaciones.filter((liquidacion) => liquidacion.estado === 'liquidada_simulada');
    return {
      porEstado, ventas, vp: movimientos.reduce((suma, movimiento) => suma + movimiento.vp, 0), vc: movimientos.reduce((suma, movimiento) => suma + movimiento.vc, 0),
      empresarios: empresarios.length, cuentas, porRun, porMotor, totalEstimado: redondear(porMotor.reduce((suma, fila) => suma + fila.monto, 0)),
      obligaciones: [
        { etiqueta: 'Pendientes de desembolso', monto: pendientesPago.reduce((suma, item) => suma + item.total, 0), cantidad: pendientesPago.length, tono: 'acento' as TonoInsignia },
        { etiqueta: 'Retenidas', monto: retenidas.reduce((suma, item) => suma + item.total, 0), cantidad: retenidas.length, tono: 'retenida' as TonoInsignia },
        { etiqueta: 'Liquidadas (simulado)', monto: liquidadas.reduce((suma, item) => suma + item.total, 0), cantidad: liquidadas.length, tono: 'exito' as TonoInsignia },
      ],
    };
  }, [fuente, periodoId, periodoCerrado, calificaciones, bonos, liquidaciones]);

  if (!periodoActual) return null;
  const avance = avanceCiclo(periodoActual);
  const abiertas = alertas.filter((alerta) => alerta.estado !== 'resuelta').length;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaKpi etiqueta={`Ventas confirmadas ${periodoId.replace('DEMO-', '')}`} valor={formatearMonto(metricas.ventas)} icono={BadgeDollarSign} tono="exito" tendencia="neutra" textoTendencia="Precio de pedidos confirmados" />
        <TarjetaKpi etiqueta="VP / VC de la compañía" valor={`${formatearNumero(metricas.vp)}`} icono={TrendingUp} tono="primario" tendencia="neutra" textoTendencia={`${formatearNumero(metricas.vc)} VC netos del ciclo`} />
        <TarjetaKpi etiqueta="Empresarios" valor={metricas.empresarios} icono={Users} tono="acento" tendencia="neutra" textoTendencia={metricas.cuentas.filter((item) => item.cantidad > 0).map((item) => `${item.cantidad} ${item.estado}`).join(' · ')} />
        <TarjetaKpi etiqueta="Alertas de integridad" valor={abiertas} icono={ShieldAlert} tono={abiertas > 0 ? 'error' : 'exito'} tendencia={abiertas > 0 ? 'sube' : 'neutra'} textoTendencia={abiertas > 0 ? 'Requieren revisión' : 'Sin pendientes'} />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-12">
        <Tarjeta className="lg:col-span-4" titulo="Período comercial" subtitulo={`${periodoActual.nombre} · reglas ${periodoActual.versionReglasId}`} icono={CalendarRange} acciones={<EnlaceBoton to="/corporativo/periodos" tamano="sm" variante="fantasma" iconoDerecha={ArrowRight}>Períodos</EnlaceBoton>}>
          <p className="text-[13px] text-texto-2">{formatearFecha(periodoActual.fechaInicio)} - {formatearFecha(periodoActual.fechaFin)} · {periodoActual.duracionDias} días</p>
          <div className="mt-3 flex items-center gap-3 text-[12.5px]"><span className="whitespace-nowrap">Día {avance.dia} de {avance.total}</span><BarraProgreso valor={avance.dia} maximo={avance.total} etiqueta="Avance del ciclo" /></div>
          <ul className="mt-4 flex flex-wrap gap-2">
            {metricas.porEstado.filter((fila) => fila.cantidad > 0).map((fila) => <li key={fila.estado}><Insignia tono={estadosPedido[fila.estado].tono} icono={estadosPedido[fila.estado].icono}>{fila.cantidad} {estadosPedido[fila.estado].etiqueta.toLowerCase()}</Insignia></li>)}
          </ul>
          <p className="mt-3 text-xs text-texto-2">Último cierre: <span className="cifra">{periodoCerrado?.id ?? 'ninguno'}</span></p>
        </Tarjeta>

        <Tarjeta className="lg:col-span-4" titulo="Distribución por RUN de Cobro" subtitulo={`Afiliados por rango en ${periodoCerrado?.id ?? '-'}`} icono={ChartColumn}>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricas.porRun} margin={{ top: 6, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="run" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(valor) => [`${valor} afiliados`, 'Cantidad']} labelFormatter={(etiqueta) => `RUN${etiqueta}`} cursor={{ fill: '#F1F5F9' }} />
                <Bar dataKey="cantidad" radius={[5, 5, 0, 0]}>
                  {metricas.porRun.map((fila, indice) => <Cell key={fila.run} fill={indice >= 4 ? '#14305A' : '#0E7490'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Tarjeta>

        <Tarjeta className="lg:col-span-4" titulo="Obligaciones de pago (simuladas)" subtitulo="Liquidaciones por estado; sin transferencias reales" icono={Wallet} acciones={<EnlaceBoton to="/corporativo/liquidaciones" tamano="sm" variante="fantasma" iconoDerecha={ArrowRight}>Liquidaciones</EnlaceBoton>}>
          <ul className="flex flex-col divide-y divide-borde">
            {metricas.obligaciones.map((fila) => (
              <li key={fila.etiqueta} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <span><span className="block text-[13px] font-semibold">{fila.etiqueta}</span><Insignia tono={fila.tono}>{fila.cantidad} liquidaciones</Insignia></span>
                <span className="cifra text-lg font-semibold">{formatearMonto(fila.monto)}</span>
              </li>
            ))}
          </ul>
        </Tarjeta>

        <Tarjeta className="lg:col-span-7" variante="simulacion" titulo="Bonificaciones estimadas por motor" subtitulo={`Estimación del ciclo ${periodoId} · total ${formatearMonto(metricas.totalEstimado)}`} icono={Gift} acciones={<Insignia tono="info">SIMULACIÓN</Insignia>}>
          <ul className="flex flex-col gap-2.5">
            {metricas.porMotor.map((fila) => (
              <li key={fila.motor} className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)_auto] items-center gap-3 text-[13px]">
                <span className="truncate font-semibold">{fila.motor}</span>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-acento" style={{ width: `${metricas.totalEstimado > 0 ? (fila.monto / metricas.totalEstimado) * 100 : 0}%` }} /></div>
                <span className="cifra w-28 text-right font-semibold">{formatearMonto(fila.monto)}</span>
              </li>
            ))}
          </ul>
          <EnlaceBoton to="/corporativo/simulador" tamano="sm" variante="secundario" iconoDerecha={ArrowRight} className="mt-4">Abrir simulador</EnlaceBoton>
        </Tarjeta>

        <Tarjeta className="lg:col-span-5" titulo="Alertas de integridad" subtitulo="Duplicados, patrones atípicos y estructuras inconsistentes" icono={ShieldAlert} acciones={<EnlaceBoton to="/corporativo/compliance" tamano="sm" variante="fantasma" iconoDerecha={ArrowRight}>Compliance</EnlaceBoton>}>
          <ul className="flex flex-col gap-2.5">
            {alertas.map((alerta) => (
              <li key={alerta.id} className="rounded-xl border border-borde p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="cifra text-xs font-semibold">{alerta.id}</span>
                  <Insignia tono={tonoSeveridad[alerta.severidad]}>{alerta.severidad}</Insignia>
                  <Insignia tono={tonoAlerta[alerta.estado]} className="ml-auto">{alerta.estado.replace('_', ' ')}</Insignia>
                </div>
                <p className="mt-1.5 text-[12.5px] text-texto">{alerta.descripcion}</p>
              </li>
            ))}
          </ul>
        </Tarjeta>

        <Tarjeta className="lg:col-span-12" titulo="Actividad reciente" subtitulo="Últimas acciones registradas en la bitácora" icono={ScrollText} acciones={<EnlaceBoton to="/corporativo/auditoria" tamano="sm" variante="fantasma" iconoDerecha={ArrowRight}>Auditoría</EnlaceBoton>}>
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-2 md:grid-cols-2">
            {bitacora.slice(0, 6).map((registro) => (
              <li key={registro.id} className="flex items-start gap-3 rounded-xl bg-fondo p-3 text-[12.5px]">
                <ShoppingCart className="mt-0.5 size-4 shrink-0 text-texto-3" aria-hidden />
                <span className="min-w-0"><span className="block font-semibold text-texto">{registro.accion}</span><span className="cifra block truncate text-texto-2">{registro.actorId} · {registro.referenciaId ?? '-'} · {formatearFechaHora(registro.fechaHora)}</span></span>
              </li>
            ))}
          </ul>
        </Tarjeta>
      </div>
    </div>
  );
}
