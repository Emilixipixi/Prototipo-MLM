import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, ChartColumn, Info, PieChart as IconoDona, Repeat, Scale, Undo2 } from 'lucide-react';
import { coloresBrazos } from '../../componentes/graficos/coloresBrazos';
import { ChipBrazo } from '../../componentes/ui/ChipBrazo';
import { Insignia } from '../../componentes/ui/Insignia';
import { SelectorPeriodo } from '../../componentes/ui/SelectorPeriodo';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { TerminoInfo } from '../../componentes/ui/TerminoInfo';
import { useDatosAfiliado } from '../../hooks/useDatosAfiliado';
import { formatearFechaHora } from '../../utilidades/fechas';
import { formatearNumero } from '../../utilidades/formatos';

const explicaciones = [
  { titulo: 'Generado', texto: 'VP y VC que produjeron las personas de cada brazo en el ciclo, a partir de compras confirmadas.' },
  { titulo: 'Utilizado', texto: 'Volumen que la regla ilustrativa toma para el bono Trinario: la producción del brazo de menor volumen, aplicada a los tres brazos.' },
  { titulo: 'Restante', texto: 'Generado menos utilizado en el ciclo.' },
  { titulo: 'Remanente anterior', texto: 'Saldo acumulado que venía de ciclos anteriores.' },
  { titulo: 'Caducado', texto: 'Remanente que cumplió el plazo ilustrativo de 4 ciclos y deja de estar disponible.' },
  { titulo: 'Acumulado', texto: 'Remanente anterior + restante - caducado. Pasa al ciclo siguiente.' },
];

export default function MiVolumen() {
  const { fuente, persona, ciclos, periodoActual, saldos } = useDatosAfiliado();
  const [periodoId, setPeriodoId] = useState<string | null>(null);
  const seleccionado = ciclos.find((periodo) => periodo.id === (periodoId ?? periodoActual?.id)) ?? periodoActual;
  const misSaldos = useMemo(() => (saldos[seleccionado?.id ?? ''] ?? []).filter((saldo) => saldo.personaId === persona?.id), [saldos, seleccionado, persona]);
  const movimientos = useMemo(
    () => fuente.movimientos.filter((movimiento) => movimiento.personaId === persona?.id && movimiento.periodoId === seleccionado?.id).sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [fuente.movimientos, persona, seleccionado],
  );
  if (!persona || !seleccionado) return null;
  const abierto = seleccionado.estado !== 'cerrado';
  const totalGenerado = misSaldos.reduce((suma, saldo) => suma + saldo.generadoVp, 0);
  const menor = misSaldos.reduce((minimo, saldo) => (!minimo || saldo.generadoVp < minimo.generadoVp ? saldo : minimo), misSaldos[0]);
  const equilibrio = totalGenerado > 0 && menor ? (menor.generadoVp / totalGenerado) * 100 : 0;
  const datosBarras = misSaldos.map((saldo) => ({ brazo: `Brazo ${saldo.brazo}`, Generado: saldo.generadoVp, Utilizado: saldo.utilizado, Acumulado: saldo.acumulado }));
  const datosDona = misSaldos.map((saldo) => ({ nombre: `Brazo ${saldo.brazo}`, valor: saldo.generadoVp, brazo: saldo.brazo }));
  const personalVp = movimientos.reduce((suma, movimiento) => suma + movimiento.vp, 0);
  const personalVc = movimientos.reduce((suma, movimiento) => suma + movimiento.vc, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SelectorPeriodo periodos={ciclos} valor={seleccionado.id} alCambiar={setPeriodoId} />
        {abierto && <p className="flex items-start gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-info"><Info className="mt-px size-3.5 shrink-0" aria-hidden />Ciclo en curso: utilizado y acumulado son estimaciones hasta el cierre</p>}
      </div>

      {misSaldos.length === 0 ? (
        <Tarjeta><p className="text-[13px] text-texto-2">Aún no tienes posición Trinaria; tu volumen por brazo aparecerá cuando se asigne.</p></Tarjeta>
      ) : (
        <>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Tarjeta titulo="Saldos por brazo" subtitulo={`Período ${seleccionado.id} · regla ilustrativa de consumo`} icono={Scale}>
              <div className="-mx-4 overflow-x-auto px-4 sm:-mx-5 sm:px-5">
                <table className="w-full min-w-[620px] border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-borde text-left text-[10.5px] font-bold uppercase tracking-[0.08em] text-texto-3">
                      <th className="py-2 pr-2">Brazo</th>
                      <th className="px-2 py-2 text-right">Generado VP</th>
                      <th className="px-2 py-2 text-right">Generado VC</th>
                      <th className="px-2 py-2 text-right">Utilizado</th>
                      <th className="px-2 py-2 text-right">Restante</th>
                      <th className="px-2 py-2 text-right">Remanente ant.</th>
                      <th className="px-2 py-2 text-right">Caducado</th>
                      <th className="py-2 pl-2 text-right">Acumulado</th>
                    </tr>
                  </thead>
                  <tbody className="cifra">
                    {misSaldos.map((saldo) => (
                      <tr key={saldo.brazo} className="border-b border-borde last:border-0">
                        <td className="py-3 pr-2 font-sans"><span className="flex items-center gap-2 font-semibold"><ChipBrazo brazo={saldo.brazo} />Brazo {saldo.brazo}</span></td>
                        <td className="px-2 py-3 text-right font-semibold">{formatearNumero(saldo.generadoVp)}</td>
                        <td className="px-2 py-3 text-right">{formatearNumero(saldo.generadoVc)}</td>
                        <td className="px-2 py-3 text-right">{formatearNumero(saldo.utilizado)}{abierto && <span className="font-sans text-[10px] text-texto-3"> est.</span>}</td>
                        <td className="px-2 py-3 text-right">{formatearNumero(saldo.restante)}</td>
                        <td className="px-2 py-3 text-right">{formatearNumero(saldo.remanenteAnterior)}</td>
                        <td className={saldo.caducado > 0 ? 'px-2 py-3 text-right font-semibold text-error' : 'px-2 py-3 text-right'}>{formatearNumero(saldo.caducado)}</td>
                        <td className="py-3 pl-2 text-right font-semibold">{formatearNumero(saldo.acumulado)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-fondo p-3"><p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-texto-3">Producción total</p><p className="cifra text-lg font-semibold">{formatearNumero(totalGenerado)} VP</p></div>
                <div className="rounded-xl bg-fondo p-3"><p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-texto-3">Brazo menor</p><p className="flex items-center gap-2 text-lg font-semibold">{menor && <ChipBrazo brazo={menor.brazo} />}<span className="cifra">{formatearNumero(equilibrio, 1)}%</span></p></div>
                <div className="rounded-xl bg-fondo p-3"><p className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-texto-3">Remanente <TerminoInfo termino="remanente" /></p><p className="cifra text-lg font-semibold">{formatearNumero(misSaldos.reduce((suma, saldo) => suma + saldo.acumulado, 0))}</p></div>
              </div>
            </Tarjeta>
            <Tarjeta titulo="Equilibrio de brazos" subtitulo="Participación de cada brazo en la producción" icono={IconoDona}>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={datosDona} dataKey="valor" nameKey="nombre" innerRadius="58%" outerRadius="88%" paddingAngle={2} stroke="none">
                      {datosDona.map((dato) => <Cell key={dato.brazo} fill={coloresBrazos[dato.brazo]} />)}
                    </Pie>
                    <Tooltip formatter={(valor) => `${formatearNumero(Number(valor))} VP`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 flex flex-col gap-1.5 text-[13px]">
                {misSaldos.map((saldo) => (
                  <li key={saldo.brazo} className="flex items-center gap-2"><ChipBrazo brazo={saldo.brazo} /><span className="flex-1">Brazo {saldo.brazo}</span><span className="cifra font-semibold">{totalGenerado > 0 ? formatearNumero((saldo.generadoVp / totalGenerado) * 100, 1) : 0}%</span></li>
                ))}
              </ul>
            </Tarjeta>
          </div>

          <Tarjeta titulo="Generado, utilizado y acumulado" subtitulo="Comparación por brazo en VP" icono={ChartColumn}>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosBarras} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="brazo" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(valor) => formatearNumero(Number(valor))} />
                  <Tooltip formatter={(valor) => `${formatearNumero(Number(valor))} VP`} cursor={{ fill: '#F1F5F9' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Generado" fill="#14305A" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Utilizado" fill="#0E7490" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Acumulado" fill="#94A3B8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Tarjeta>
        </>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
        <Tarjeta titulo="Mis movimientos personales" subtitulo={`Origen y reversiones en ${seleccionado.id}: ${formatearNumero(personalVp)} VP · ${formatearNumero(personalVc)} VC netos`} icono={Repeat}>
          {movimientos.length === 0 ? <p className="text-[13px] text-texto-2">Sin movimientos personales en este período.</p> : (
            <ul className="flex flex-col gap-2">
              {movimientos.map((movimiento) => (
                <li key={movimiento.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-borde p-3 text-[13px]">
                  <Insignia tono={movimiento.tipo === 'origen' ? 'acento' : 'error'} icono={movimiento.tipo === 'origen' ? ArrowRight : Undo2}>{movimiento.tipo === 'origen' ? 'Origen' : 'Reversión'}</Insignia>
                  <span className="cifra text-xs text-texto-2">{movimiento.pedidoId} · {formatearFechaHora(movimiento.fecha)}</span>
                  <span className={movimiento.vp < 0 ? 'cifra ml-auto font-semibold text-error' : 'cifra ml-auto font-semibold'}>{formatearNumero(movimiento.vp)} VP · {formatearNumero(movimiento.vc)} VC</span>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
        <Tarjeta titulo="Qué significa cada saldo" icono={Info}>
          <dl className="flex flex-col gap-2.5">
            {explicaciones.map((item) => (
              <div key={item.titulo}><dt className="text-[13px] font-bold text-texto">{item.titulo}</dt><dd className="text-[12.5px] text-texto-2">{item.texto}</dd></div>
            ))}
          </dl>
        </Tarjeta>
      </div>
    </div>
  );
}
