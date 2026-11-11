import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BadgePercent, ChartColumn, HandCoins, Info, Landmark, Layers, Receipt, TrendingUp } from 'lucide-react';
import { BarraExportar } from '../../componentes/ui/BarraExportar';
import { ChipsFiltro } from '../../componentes/ui/ChipsFiltro';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { TarjetaKpi } from '../../componentes/ui/TarjetaKpi';
import { presentacionMotores } from '../../datos/presentacionMotores';
import { useDatosAfiliado } from '../../hooks/useDatosAfiliado';
import { ordenMotores } from '../../motores/ejecutarCorrida';
import type { CodigoMotor } from '../../tipos/reglas';
import { unirClases } from '../../utilidades/clases';
import { formatearMonto, formatearPorcentaje, redondear } from '../../utilidades/formatos';

type OrigenComisiones = 'liquidaciones' | 'corrida_aprobada' | 'corrida_en_proceso' | 'estimacion';

interface FilaFinanciera {
  periodoId: string; estado: string; ventasBrutas: number; descuentos: number; devoluciones: number; ventasNetas: number;
  comisiones: number; ajustes: number; margen: number; porcentajePago: number; origen: OrigenComisiones;
  porMotor: Partial<Record<CodigoMotor, number>>;
}

const origenes: Record<OrigenComisiones, { texto: string; tono: 'exito' | 'acento' | 'advertencia' | 'info' }> = {
  liquidaciones: { texto: 'Liquidaciones', tono: 'exito' },
  corrida_aprobada: { texto: 'Corrida aprobada', tono: 'acento' },
  corrida_en_proceso: { texto: 'Corrida en revisión', tono: 'advertencia' },
  estimacion: { texto: 'Estimación', tono: 'info' },
};

export default function BalanceFinanciero() {
  const { fuente, ciclos, liquidaciones, bonos, ajustes } = useDatosAfiliado();
  const [periodoId, setPeriodoId] = useState('todos');

  const filas = useMemo<FilaFinanciera[]>(() => ciclos.map((ciclo) => {
    const pedidos = fuente.pedidos.filter((pedido) => pedido.periodoId === ciclo.id && (pedido.estado === 'confirmada' || pedido.estado === 'devuelta'));
    const ventasBrutas = pedidos.reduce((suma, pedido) => suma + pedido.totalPrecio, 0);
    const descuentos = pedidos.reduce((suma, pedido) => suma + pedido.items.reduce((parcial, item) => parcial + (item.descuento ? (item.descuento.precioLista - item.precioUnitario) * item.cantidad : 0), 0), 0);
    const devoluciones = pedidos.filter((pedido) => pedido.estado === 'devuelta').reduce((suma, pedido) => suma + pedido.totalPrecio, 0);
    const delPeriodo = liquidaciones.filter((liquidacion) => liquidacion.periodoId === ciclo.id);
    const datosBonos = bonos[ciclo.id];
    const porMotor: Partial<Record<CodigoMotor, number>> = {};
    let comisiones = 0;
    let origen: OrigenComisiones;
    if (delPeriodo.length > 0) {
      origen = 'liquidaciones';
      delPeriodo.forEach((liquidacion) => liquidacion.conceptos.forEach((concepto) => { porMotor[concepto.motor] = (porMotor[concepto.motor] ?? 0) + concepto.monto; }));
      comisiones = delPeriodo.reduce((suma, liquidacion) => suma + liquidacion.conceptos.reduce((parcial, concepto) => parcial + concepto.monto, 0), 0);
    } else {
      origen = datosBonos?.origen ?? 'estimacion';
      datosBonos?.bonos.forEach((bono) => { porMotor[bono.motor] = (porMotor[bono.motor] ?? 0) + bono.monto; });
      comisiones = datosBonos?.bonos.reduce((suma, bono) => suma + bono.monto, 0) ?? 0;
    }
    const totalAjustes = ajustes.filter((ajuste) => ajuste.periodoId === ciclo.id && (ajuste.estado === 'autorizado' || ajuste.estado === 'aplicado')).reduce((suma, ajuste) => suma + ajuste.monto, 0);
    const ventasNetas = ventasBrutas - devoluciones;
    const pago = comisiones + totalAjustes;
    return {
      periodoId: ciclo.id, estado: ciclo.estado, ventasBrutas: redondear(ventasBrutas + descuentos), descuentos: redondear(descuentos), devoluciones: redondear(devoluciones),
      ventasNetas: redondear(ventasNetas), comisiones: redondear(comisiones), ajustes: redondear(totalAjustes), margen: redondear(ventasNetas - pago),
      porcentajePago: ventasNetas > 0 ? pago / ventasNetas : 0, origen, porMotor,
    };
  }), [ciclos, fuente.pedidos, liquidaciones, bonos, ajustes]);

  const visibles = periodoId === 'todos' ? filas : filas.filter((fila) => fila.periodoId === periodoId);
  const sumar = (clave: 'ventasNetas' | 'comisiones' | 'ajustes' | 'margen' | 'descuentos' | 'devoluciones') => redondear(visibles.reduce((suma, fila) => suma + fila[clave], 0));
  const ventas = sumar('ventasNetas');
  const pagos = sumar('comisiones') + sumar('ajustes');
  const motores = ordenMotores.map((motor) => ({ motor, monto: redondear(visibles.reduce((suma, fila) => suma + (fila.porMotor[motor] ?? 0), 0)) }));
  const maximoMotor = Math.max(1, ...motores.map((item) => item.monto));
  const datosGrafico = filas.map((fila) => ({ ciclo: fila.periodoId.replace('DEMO-', ''), 'Ventas netas': fila.ventasNetas, Comisiones: redondear(fila.comisiones + fila.ajustes), Margen: fila.margen }));

  const restar = (monto: number) => (monto > 0 ? `-${formatearMonto(monto)}` : formatearMonto(0));

  return (
    <div className="flex flex-col gap-5">
      <p className="flex items-start gap-2 rounded-xl bg-acento-suave px-3 py-2.5 text-[12.5px] text-[#155E75]">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        Balance comercial con datos de DEMOSTRACIÓN: ventas netas menos comisiones y ajustes. No incluye costo de productos, logística ni impuestos. En ciclos sin liquidación se usa la corrida vigente o una estimación, marcada en cada fila.
      </p>
      <ChipsFiltro etiqueta="Período" activo={periodoId} alCambiar={setPeriodoId} opciones={[{ valor: 'todos', texto: 'Todos los ciclos' }, ...ciclos.map((ciclo) => ({ valor: ciclo.id, texto: ciclo.id }))]} />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaKpi etiqueta="Ventas netas" valor={<span className="cifra whitespace-nowrap">{formatearMonto(ventas)}</span>} icono={TrendingUp} tono="primario" tendencia="neutra" textoTendencia={`Descuentos ${formatearMonto(sumar('descuentos'))} · devoluciones ${formatearMonto(sumar('devoluciones'))}`} />
        <TarjetaKpi etiqueta="Comisiones y ajustes" valor={<span className="cifra whitespace-nowrap">{formatearMonto(pagos)}</span>} icono={HandCoins} tono="acento" />
        <TarjetaKpi etiqueta="Margen comercial" valor={<span className="cifra whitespace-nowrap">{formatearMonto(sumar('margen'))}</span>} icono={Landmark} tono="exito" />
        <TarjetaKpi etiqueta="% de ventas pagado en bonos" valor={<span className="cifra whitespace-nowrap">{formatearPorcentaje(redondear(ventas > 0 ? (pagos / ventas) * 100 : 0, 1))}</span>} icono={BadgePercent} tono="oro" />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Tarjeta titulo="Ventas, comisiones y margen por ciclo" subtitulo="Montos en USD" icono={ChartColumn}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosGrafico} margin={{ top: 8, right: 8, left: -4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="ciclo" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(valor) => formatearMonto(Number(valor)).replace(/,00$/, '')} width={84} />
                <Tooltip formatter={(valor) => formatearMonto(Number(valor))} cursor={{ fill: '#F1F5F9' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Ventas netas" fill="#14305A" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Comisiones" fill="#0E7490" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Margen" fill="#15803D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Tarjeta>
        <Tarjeta titulo="Comisiones por concepto" subtitulo={periodoId === 'todos' ? 'Todos los ciclos' : periodoId} icono={Layers}>
          <ul className="flex flex-col gap-2.5">
            {motores.map(({ motor, monto }) => (
              <li key={motor} className="grid grid-cols-[minmax(0,130px)_minmax(0,1fr)_auto] items-center gap-3 text-[12.5px]">
                <span className="truncate text-texto-2">{presentacionMotores[motor].nombre}</span>
                <span className="h-2 overflow-hidden rounded-full bg-fondo"><span className="block h-full rounded-full bg-acento" style={{ width: `${(monto / maximoMotor) * 100}%` }} /></span>
                <span className="cifra whitespace-nowrap font-semibold">{formatearMonto(monto)}</span>
              </li>
            ))}
          </ul>
        </Tarjeta>
      </div>
      <Tarjeta
        titulo="Detalle por ciclo"
        subtitulo="De ventas a precio de lista a margen comercial, en USD"
        icono={Receipt}
        acciones={<BarraExportar modulo="reportes" nombreArchivo="DEMO-balance-financiero" filas={() => visibles.map((fila) => ({ ciclo: fila.periodoId, origen: origenes[fila.origen].texto, ventasListaUSD: fila.ventasBrutas, descuentosUSD: fila.descuentos, devolucionesUSD: fila.devoluciones, ventasNetasUSD: fila.ventasNetas, comisionesUSD: fila.comisiones, ajustesUSD: fila.ajustes, margenUSD: fila.margen, porcentajePago: redondear(fila.porcentajePago * 100) }))} />}
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
          {visibles.map((fila) => {
            const porcentaje = redondear(fila.porcentajePago * 100, 1);
            return (
              <article key={fila.periodoId} className="min-w-0 rounded-xl border border-borde bg-fondo/60 p-4">
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="cifra text-[15px] font-bold text-texto">{fila.periodoId}</p>
                    <div className="mt-1"><Insignia tono={origenes[fila.origen].tono}>{origenes[fila.origen].texto}</Insignia></div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">% pagado en bonos</p>
                    <p className="cifra text-[20px] font-bold text-oro">{formatearPorcentaje(porcentaje)}</p>
                  </div>
                </header>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-borde" aria-hidden>
                  <span className="block h-full rounded-full bg-oro" style={{ width: `${Math.min(100, porcentaje)}%` }} />
                </div>
                <dl className="mt-4 flex flex-col text-[13.5px]">
                  <div className="flex items-center justify-between gap-3 py-1.5">
                    <dt className="text-texto-2">Ventas a precio de lista</dt>
                    <dd className="cifra whitespace-nowrap text-texto">{formatearMonto(fila.ventasBrutas)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-1.5">
                    <dt className="text-texto-2">Descuentos</dt>
                    <dd className="cifra whitespace-nowrap text-texto">{restar(fila.descuentos)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-1.5">
                    <dt className="text-texto-2">Devoluciones</dt>
                    <dd className={unirClases('cifra whitespace-nowrap', fila.devoluciones > 0 ? 'text-error' : 'text-texto')}>{restar(fila.devoluciones)}</dd>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-3 border-t border-borde pt-2.5 pb-1.5">
                    <dt className="font-semibold text-texto">Ventas netas</dt>
                    <dd className="cifra whitespace-nowrap font-bold text-primario">{formatearMonto(fila.ventasNetas)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-1.5">
                    <dt className="text-texto-2">Comisiones y ajustes</dt>
                    <dd className="cifra whitespace-nowrap text-acento">{restar(redondear(fila.comisiones + fila.ajustes))}</dd>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-[#F0FDF4] px-3 py-2.5">
                    <dt className="font-bold text-exito">Margen comercial</dt>
                    <dd className="cifra whitespace-nowrap text-[15px] font-bold text-exito">{formatearMonto(fila.margen)}</dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      </Tarjeta>
    </div>
  );
}
