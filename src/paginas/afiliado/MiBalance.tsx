import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartColumn, Info, PauseCircle, Receipt, ShoppingCart, Wallet } from 'lucide-react';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tabla, type ColumnaTabla } from '../../componentes/ui/Tabla';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { TarjetaKpi } from '../../componentes/ui/TarjetaKpi';
import { useDatosAfiliado } from '../../hooks/useDatosAfiliado';
import { formatearMonto, redondear } from '../../utilidades/formatos';

interface FilaBalance {
  periodoId: string; cerrado: boolean; compras: number; devoluciones: number; comprasNetas: number;
  cobrado: number; porCobrar: number; retenido: number; estimado: number; tieneLiquidacion: boolean;
}

export default function MiBalance() {
  const { persona, fuente, ciclos, liquidaciones, bonos } = useDatosAfiliado();
  const filas = useMemo<FilaBalance[]>(() => ciclos.map((ciclo) => {
    const pedidos = fuente.pedidos.filter((pedido) => pedido.compradorId === persona?.id && pedido.periodoId === ciclo.id);
    const compras = pedidos.filter((pedido) => pedido.estado === 'confirmada' || pedido.estado === 'devuelta').reduce((suma, pedido) => suma + pedido.totalPrecio, 0);
    const devoluciones = pedidos.filter((pedido) => pedido.estado === 'devuelta').reduce((suma, pedido) => suma + pedido.totalPrecio, 0);
    const propias = liquidaciones.filter((liquidacion) => liquidacion.personaId === persona?.id && liquidacion.periodoId === ciclo.id);
    const suma = (estados: string[]) => redondear(propias.filter((liquidacion) => estados.includes(liquidacion.estado)).reduce((total, liquidacion) => total + liquidacion.total, 0));
    const datosBonos = bonos[ciclo.id];
    const estimado = propias.length === 0 && datosBonos ? redondear(datosBonos.bonos.filter((bono) => bono.personaId === persona?.id).reduce((total, bono) => total + bono.monto, 0)) : 0;
    return {
      periodoId: ciclo.id, cerrado: ciclo.estado === 'cerrado', compras: redondear(compras), devoluciones: redondear(devoluciones), comprasNetas: redondear(compras - devoluciones),
      cobrado: suma(['liquidada_simulada']), porCobrar: suma(['en_revision', 'aprobada', 'apta_para_desembolso']), retenido: suma(['retenida']), estimado, tieneLiquidacion: propias.length > 0,
    };
  }), [ciclos, fuente.pedidos, liquidaciones, bonos, persona]);

  const total = (clave: 'comprasNetas' | 'cobrado' | 'porCobrar' | 'retenido') => redondear(filas.reduce((suma, fila) => suma + fila[clave], 0));
  const datosGrafico = filas.map((fila) => ({ ciclo: fila.periodoId.replace('DEMO-', ''), 'Compras propias': fila.comprasNetas, 'Liquidado y por cobrar': redondear(fila.cobrado + fila.porCobrar), Retenido: fila.retenido }));

  const columnas: ColumnaTabla<FilaBalance>[] = [
    { clave: 'periodo', titulo: 'Ciclo', principalEnMovil: true, render: (fila) => <div className="flex flex-wrap items-center gap-2"><span className="cifra whitespace-nowrap font-semibold">{fila.periodoId}</span><Insignia tono={fila.cerrado ? 'neutra' : 'info'}>{fila.cerrado ? 'Cerrado' : 'Abierto'}</Insignia></div> },
    { clave: 'compras', titulo: 'Compras netas', alinear: 'derecha', render: (fila) => <span className="cifra whitespace-nowrap">{formatearMonto(fila.comprasNetas)}{fila.devoluciones > 0 && <span className="block text-[11px] text-texto-3">devuelto {formatearMonto(fila.devoluciones)}</span>}</span> },
    { clave: 'cobrado', titulo: 'Liquidado (simulado)', alinear: 'derecha', render: (fila) => <span className="cifra whitespace-nowrap font-semibold text-exito">{formatearMonto(fila.cobrado)}</span> },
    { clave: 'porCobrar', titulo: 'Aprobado por liquidar', alinear: 'derecha', render: (fila) => <span className="cifra whitespace-nowrap">{formatearMonto(fila.porCobrar)}</span> },
    { clave: 'retenido', titulo: 'Retenido', alinear: 'derecha', render: (fila) => <span className="cifra whitespace-nowrap">{formatearMonto(fila.retenido)}</span> },
    { clave: 'estimado', titulo: 'Bonos del ciclo', render: (fila) => (fila.tieneLiquidacion ? <span className="text-[12px] text-texto-2">Con liquidación</span> : <span className="text-[12px] text-texto-2">Estimación {formatearMonto(fila.estimado)}, sin liquidar</span>) },
  ];

  return (
    <div className="flex flex-col gap-5">
      <p className="flex items-start gap-2 rounded-xl bg-oro-suave px-3 py-2.5 text-[12.5px] text-[#7C4A03]">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        Historial de tus compras y de tus liquidaciones por ciclo, con datos de DEMOSTRACIÓN. No es una proyección de ingresos ni un cálculo de rentabilidad: los resultados dependen de ventas reales y de las reglas vigentes de cada período.
      </p>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaKpi etiqueta="Compras propias netas" valor={<span className="cifra whitespace-nowrap">{formatearMonto(total('comprasNetas'))}</span>} icono={ShoppingCart} tono="primario" tendencia="neutra" textoTendencia="Pedidos confirmados menos devoluciones." />
        <TarjetaKpi etiqueta="Liquidado (simulado)" valor={<span className="cifra whitespace-nowrap">{formatearMonto(total('cobrado'))}</span>} icono={Wallet} tono="exito" tendencia="neutra" textoTendencia="Sin transferencia monetaria." />
        <TarjetaKpi etiqueta="Aprobado por liquidar" valor={<span className="cifra whitespace-nowrap">{formatearMonto(total('porCobrar'))}</span>} icono={Receipt} tono="acento" />
        <TarjetaKpi etiqueta="Retenido" valor={<span className="cifra whitespace-nowrap">{formatearMonto(total('retenido'))}</span>} icono={PauseCircle} tono="oro" />
      </div>
      <Tarjeta titulo="Compras y liquidaciones por ciclo" subtitulo="Montos en USD" icono={ChartColumn}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datosGrafico} margin={{ top: 8, right: 8, left: -4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="ciclo" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(valor) => formatearMonto(Number(valor)).replace(/,00$/, '')} width={78} />
              <Tooltip formatter={(valor) => formatearMonto(Number(valor))} cursor={{ fill: '#F1F5F9' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Compras propias" fill="#14305A" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Liquidado y por cobrar" fill="#0E7490" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Retenido" fill="#94A3B8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Tarjeta>
      <Tabla columnas={columnas} filas={filas} claveFila={(fila) => fila.periodoId} textoVacio="Aún no tienes ciclos con movimientos." />
    </div>
  );
}
