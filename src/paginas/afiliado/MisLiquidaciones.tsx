import { useMemo } from 'react';
import { ArrowRight, Download, Info, Receipt, Undo2 } from 'lucide-react';
import { LeyendaDemostracion } from '../../componentes/demo/LeyendaDemostracion';
import { Boton } from '../../componentes/ui/Boton';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { EstadoVacio } from '../../componentes/ui/EstadoVacio';
import { Insignia } from '../../componentes/ui/Insignia';
import { LineaTiempo } from '../../componentes/ui/LineaTiempo';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { useToast } from '../../componentes/ui/useToast';
import { estadosLiquidacion } from '../../datos/presentacionCompensacion';
import { presentacionMotores } from '../../datos/presentacionMotores';
import { useDatosAfiliado } from '../../hooks/useDatosAfiliado';
import { descargarCsv } from '../../servicios/exportar';
import type { Liquidacion } from '../../tipos/compensacion';
import { formatearFechaHora } from '../../utilidades/fechas';
import { formatearMonto } from '../../utilidades/formatos';

export default function MisLiquidaciones() {
  const { fuente, persona, periodoActual, liquidaciones, ajustes } = useDatosAfiliado();
  const toast = useToast();
  const propias = useMemo(() => liquidaciones.filter((liquidacion) => liquidacion.personaId === persona?.id).sort((a, b) => b.periodoId.localeCompare(a.periodoId)), [liquidaciones, persona]);
  if (!persona) return null;
  const nombre = (id: string) => {
    const item = fuente.personas.find((candidata) => candidata.id === id);
    return item ? `${item.nombres} ${item.apellidos}` : id;
  };
  const tieneActual = propias.some((liquidacion) => liquidacion.periodoId === periodoActual?.id);

  const descargar = (liquidacion: Liquidacion) => {
    descargarCsv(`${liquidacion.id}.csv`, [
      ...liquidacion.conceptos.map((concepto) => ({ liquidacion: liquidacion.id, periodo: liquidacion.periodoId, concepto: presentacionMotores[concepto.motor].nombre, monto: concepto.monto.toFixed(2), nota: 'DEMOSTRACION' })),
      ...liquidacion.ajustes.map((id) => ({ liquidacion: liquidacion.id, periodo: liquidacion.periodoId, concepto: `Ajuste ${id}`, monto: (ajustes.find((ajuste) => ajuste.id === id)?.monto ?? 0).toFixed(2), nota: 'DEMOSTRACION' })),
      { liquidacion: liquidacion.id, periodo: liquidacion.periodoId, concepto: 'TOTAL', monto: liquidacion.total.toFixed(2), nota: 'Sin transferencia monetaria' },
    ]);
    toast.exito('Comprobante descargado', `${liquidacion.id}.csv (simulado).`);
  };

  return (
    <div className="flex flex-col gap-5">
      <LeyendaDemostracion variante="bloque" />
      {!tieneActual && periodoActual && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 p-4 text-[13px]">
          <p className="flex items-start gap-2 text-texto-2"><Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />El ciclo {periodoActual.id} sigue abierto: su liquidación se generará después de la corrida aprobada.</p>
          <EnlaceBoton to="/afiliado/bonos" tamano="sm" variante="secundario" iconoDerecha={ArrowRight}>Ver bonos estimados</EnlaceBoton>
        </div>
      )}
      {propias.length === 0 ? (
        <Tarjeta><EstadoVacio icono={Receipt} titulo="Sin liquidaciones" texto="Cuando se apruebe una corrida con partidas a tu favor, verás aquí su liquidación." /></Tarjeta>
      ) : propias.map((liquidacion) => {
        const estado = estadosLiquidacion[liquidacion.estado];
        const ajustesLiquidacion = ajustes.filter((ajuste) => liquidacion.ajustes.includes(ajuste.id));
        return (
          <Tarjeta key={liquidacion.id} titulo={<span className="cifra">{liquidacion.id}</span>} subtitulo={`Período ${liquidacion.periodoId} · corrida ${liquidacion.corridaId}`} icono={Receipt} acciones={<Insignia tono={estado.tono} icono={estado.icono}>{estado.etiqueta}</Insignia>}>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
              <div>
                <ul className="divide-y divide-borde text-[13.5px]">
                  {liquidacion.conceptos.map((concepto) => (
                    <li key={concepto.motor} className="flex justify-between gap-3 py-2"><span>{presentacionMotores[concepto.motor].nombre}</span><span className="cifra font-medium">{formatearMonto(concepto.monto, liquidacion.moneda)}</span></li>
                  ))}
                  {ajustesLiquidacion.map((ajuste) => (
                    <li key={ajuste.id} className="flex justify-between gap-3 py-2 text-error"><span className="flex items-center gap-1.5"><Undo2 className="size-4" aria-hidden />Ajuste {ajuste.id} ({ajuste.referenciaId})</span><span className="cifra font-medium">{formatearMonto(ajuste.monto, liquidacion.moneda)}</span></li>
                  ))}
                  <li className="flex justify-between gap-3 pt-3 text-[15px] font-bold"><span>Total</span><span className="cifra">{formatearMonto(liquidacion.total, liquidacion.moneda)}</span></li>
                </ul>
                {liquidacion.motivoRetencion && <p className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-[12.5px] text-retenida"><strong>Retenida:</strong> {liquidacion.motivoRetencion}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {liquidacion.comprobante ? (
                    <Boton variante="secundario" tamano="sm" icono={Download} onClick={() => descargar(liquidacion)}>Comprobante {liquidacion.comprobante}</Boton>
                  ) : <span className="text-xs text-texto-3">El comprobante estará disponible cuando se marque como liquidada.</span>}
                  <span className="text-xs text-texto-2">Sin transferencia monetaria.</span>
                </div>
              </div>
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Historial de aprobación</p>
                <LineaTiempo hitos={liquidacion.aprobaciones.map((aprobacion, indice) => ({ id: `${liquidacion.id}-${indice}`, titulo: aprobacion.accion, detalle: nombre(aprobacion.actorId), fecha: formatearFechaHora(aprobacion.fecha), icono: indice === liquidacion.aprobaciones.length - 1 ? estado.icono : Receipt, tono: indice === liquidacion.aprobaciones.length - 1 ? (liquidacion.estado === 'retenida' ? 'neutra' : 'exito') : 'info' }))} />
              </div>
            </div>
          </Tarjeta>
        );
      })}
    </div>
  );
}
