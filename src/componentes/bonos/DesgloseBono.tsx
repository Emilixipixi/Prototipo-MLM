import { Ban, Calculator, FileSearch, ListTree, Receipt } from 'lucide-react';
import { estadosBono } from '../../datos/presentacionCompensacion';
import { presentacionMotores } from '../../datos/presentacionMotores';
import type { Ajuste, BonoComision } from '../../tipos/compensacion';
import { unirClases } from '../../utilidades/clases';
import { formatearMonto, formatearNumero } from '../../utilidades/formatos';
import { LeyendaDemostracion } from '../demo/LeyendaDemostracion';
import { Insignia } from '../ui/Insignia';
import { Modal } from '../ui/Modal';

interface PropsDesglose { bono: BonoComision | null; ajustes: Ajuste[]; alCerrar: () => void; versionReglasId: string; }

export function DesgloseBono({ bono, ajustes, alCerrar, versionReglasId }: PropsDesglose) {
  if (!bono) return null;
  const motor = presentacionMotores[bono.motor];
  const estado = estadosBono[bono.estado];
  const relacionados = ajustes.filter((ajuste) => bono.ajustes.includes(ajuste.id));
  return (
    <Modal abierto alCerrar={alCerrar} titulo={`Desglose: ${motor.nombre}`} descripcion={<span className="cifra">{bono.corridaId} · {bono.periodoId} · reglas {versionReglasId}</span>} ancho="lg">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-fondo p-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Resultado ilustrativo</p>
            <p className="cifra text-2xl font-semibold">{formatearMonto(bono.monto)}</p>
          </div>
          <Insignia tono={estado.tono} icono={estado.icono}>{estado.etiqueta}</Insignia>
        </div>
        {!bono.elegible || bono.motivosNoElegible.length > 0 ? (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[13px] text-advertencia">
            <Ban className="mt-0.5 size-4 shrink-0" aria-hidden />
            <ul>{bono.motivosNoElegible.map((motivo) => <li key={motivo}>{motivo}</li>)}</ul>
          </div>
        ) : null}
        <dl className="grid gap-3 text-[13px] sm:grid-cols-2">
          <div className="rounded-xl border border-borde p-3"><dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3"><Calculator className="size-3.5" aria-hidden />Base</dt><dd className="cifra mt-1 font-semibold">{formatearNumero(bono.base, bono.base % 1 ? 2 : 0)}</dd></div>
          <div className="rounded-xl border border-borde p-3"><dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3"><Receipt className="size-3.5" aria-hidden />Regla aplicada</dt><dd className="mt-1">{bono.regla}</dd></div>
        </dl>
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3"><Calculator className="size-3.5" aria-hidden />Cálculo</p>
          <p className="cifra rounded-xl bg-fondo p-3 text-[12.5px] leading-relaxed">{bono.calculo}</p>
        </div>
        {bono.detalle && bono.detalle.length > 0 && (
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3"><ListTree className="size-3.5" aria-hidden />Detalle</p>
            <div className="overflow-x-auto rounded-xl border border-borde">
              <table className="w-full min-w-[480px] text-[12.5px]">
                <thead><tr className="border-b border-borde bg-fondo text-left text-[10.5px] font-bold uppercase tracking-[0.08em] text-texto-3"><th className="px-3 py-2">Concepto</th><th className="px-3 py-2 text-right">Base</th><th className="px-3 py-2 text-right">%</th><th className="px-3 py-2 text-right">Monto</th><th className="px-3 py-2">Fuente</th></tr></thead>
                <tbody>
                  {bono.detalle.map((fila) => (
                    <tr key={fila.etiqueta} className={unirClases('border-b border-borde last:border-0', fila.porcentaje === 0 && 'text-texto-3')}>
                      <td className="px-3 py-2 font-semibold">{fila.etiqueta}</td>
                      <td className="cifra px-3 py-2 text-right">{formatearNumero(fila.base, fila.base % 1 ? 2 : 0)}</td>
                      <td className="cifra px-3 py-2 text-right">{formatearNumero(fila.porcentaje, fila.porcentaje % 1 ? 1 : 0)}</td>
                      <td className="cifra px-3 py-2 text-right font-semibold">{formatearNumero(fila.monto, 2)}</td>
                      <td className="max-w-[220px] px-3 py-2 text-[11.5px]">{fila.fuente}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3"><FileSearch className="size-3.5" aria-hidden />Fuente</p>
          <ul className="max-h-40 overflow-y-auto rounded-xl border border-borde p-3 text-[12px] text-texto-2">
            {bono.fuente.length === 0 ? <li>Sin movimientos de origen.</li> : bono.fuente.map((linea) => <li key={linea} className="cifra py-0.5">{linea}</li>)}
          </ul>
        </div>
        {relacionados.length > 0 && (
          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Ajustes posteriores</p>
            <ul className="flex flex-col gap-2">
              {relacionados.map((ajuste) => (
                <li key={ajuste.id} className="rounded-xl border border-red-200 bg-red-50 p-3 text-[12.5px]">
                  <p className="flex flex-wrap justify-between gap-2 font-semibold"><span className="cifra">{ajuste.id} · {ajuste.referenciaId}</span><span className="cifra text-error">{formatearMonto(ajuste.monto)}</span></p>
                  <p className="text-texto-2">{ajuste.motivo} Se aplica en {ajuste.periodoId} ({ajuste.estado}).</p>
                </li>
              ))}
            </ul>
          </div>
        )}
        <LeyendaDemostracion variante="bloque" />
      </div>
    </Modal>
  );
}
