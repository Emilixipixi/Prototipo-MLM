import { useState } from 'react';
import { ArrowRight, Calculator, Gift, Info, Undo2 } from 'lucide-react';
import { DesgloseBono } from '../../componentes/bonos/DesgloseBono';
import { LeyendaDemostracion } from '../../componentes/demo/LeyendaDemostracion';
import { Boton } from '../../componentes/ui/Boton';
import { Insignia } from '../../componentes/ui/Insignia';
import { SelectorPeriodo } from '../../componentes/ui/SelectorPeriodo';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { estadosBono, iconoNoElegible } from '../../datos/presentacionCompensacion';
import { presentacionMotores } from '../../datos/presentacionMotores';
import { useDatosAfiliado } from '../../hooks/useDatosAfiliado';
import { ordenMotores } from '../../motores/ejecutarCorrida';
import type { BonoComision } from '../../tipos/compensacion';
import { unirClases } from '../../utilidades/clases';
import { formatearMonto, redondear } from '../../utilidades/formatos';

const origenes = {
  corrida_aprobada: { texto: 'Corrida aprobada', tono: 'exito' as const, detalle: 'Resultados de la corrida aprobada del período.' },
  corrida_en_proceso: { texto: 'Corrida en revisión', tono: 'advertencia' as const, detalle: 'Corrida simulada o en revisión: los montos aún pueden cambiar.' },
  estimacion: { texto: 'Estimación', tono: 'info' as const, detalle: 'Estimación en vivo con el volumen actual del ciclo abierto.' },
};

export default function MisBonos() {
  const { persona, ciclos, periodoActual, bonos, ajustes } = useDatosAfiliado();
  const [periodoId, setPeriodoId] = useState<string | null>(null);
  const [abierto, setAbierto] = useState<BonoComision | null>(null);
  const seleccionado = ciclos.find((periodo) => periodo.id === (periodoId ?? periodoActual?.id)) ?? periodoActual;
  if (!persona || !seleccionado) return null;
  const datos = bonos[seleccionado.id];
  const misBonos = (datos?.bonos ?? []).filter((bono) => bono.personaId === persona.id);
  const total = redondear(misBonos.reduce((suma, bono) => suma + bono.monto, 0));
  const ajustesAplicables = ajustes.filter((ajuste) => ajuste.personaId === persona.id && ajuste.periodoId === seleccionado.id);
  const totalAjustes = redondear(ajustesAplicables.reduce((suma, ajuste) => suma + ajuste.monto, 0));
  const origen = datos ? origenes[datos.origen] : origenes.estimacion;
  const simulado = datos?.origen !== 'corrida_aprobada';

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SelectorPeriodo periodos={ciclos} valor={seleccionado.id} alCambiar={setPeriodoId} />
        <p className="flex items-start gap-1.5 rounded-xl bg-primario-suave px-3 py-1.5 text-xs font-semibold text-primario"><Calculator className="mt-px size-3.5 shrink-0" aria-hidden />{origen.texto}{datos?.corrida ? ` · ${datos.corrida.id}` : ''} · reglas {datos?.versionReglasId}</p>
      </div>

      <Tarjeta variante={simulado ? 'simulacion' : 'normal'}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Total ilustrativo de bonos · {seleccionado.id}</p>
            <p className="cifra text-[32px] font-semibold text-texto">{formatearMonto(total)}</p>
            <p className="text-[12.5px] text-texto-2">{origen.detalle}</p>
          </div>
          {ajustesAplicables.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-error"><Undo2 className="size-3.5" aria-hidden />Ajustes aplicables en este período</p>
              <p className="cifra text-lg font-semibold text-error">{formatearMonto(totalAjustes)}</p>
              <p className="text-xs text-texto-2">{ajustesAplicables.map((ajuste) => `${ajuste.id} (${ajuste.referenciaId})`).join(', ')}</p>
            </div>
          )}
        </div>
        <LeyendaDemostracion variante="bloque" className="mt-4" />
      </Tarjeta>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ordenMotores.map((codigo) => {
          const presentacion = presentacionMotores[codigo];
          const Icono = presentacion.icono;
          const bono = misBonos.find((item) => item.motor === codigo);
          const estado = bono ? estadosBono[bono.estado] : null;
          const IconoNo = iconoNoElegible;
          return (
            <article key={codigo} className={unirClases('flex flex-col gap-3 rounded-tarjeta border bg-superficie p-4 shadow-tarjeta sm:p-5', simulado ? 'border-dashed border-blue-300' : 'border-borde')}>
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primario-suave text-primario"><Icono className="size-5" aria-hidden /></span>
                {estado ? <Insignia tono={bono && !bono.elegible ? 'neutra' : estado.tono} icono={bono && !bono.elegible ? IconoNo : estado.icono}>{bono && !bono.elegible ? 'No elegible' : estado.etiqueta}</Insignia> : <Insignia tono="neutra">Sin partida</Insignia>}
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-texto">{presentacion.nombre}</h3>
                <p className="text-[12.5px] text-texto-2">{presentacion.resumen}</p>
              </div>
              <p className={unirClases('cifra text-2xl font-semibold', bono?.monto ? 'text-texto' : 'text-texto-3')}>{formatearMonto(bono?.monto ?? 0)}</p>
              {bono ? (
                <>
                  <p className="line-clamp-2 text-xs text-texto-2">{bono.elegible ? bono.calculo : bono.motivosNoElegible.join('. ')}</p>
                  <Boton variante="secundario" tamano="sm" iconoDerecha={ArrowRight} onClick={() => setAbierto(bono)} className="mt-auto">Ver desglose</Boton>
                </>
              ) : (
                <p className="mt-auto flex items-start gap-1.5 text-xs text-texto-2"><Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />No generaste partida de este concepto en {seleccionado.id}.</p>
              )}
            </article>
          );
        })}
      </div>
      <DesgloseBono bono={abierto} ajustes={ajustes} alCerrar={() => setAbierto(null)} versionReglasId={datos?.versionReglasId ?? ''} />
      <p className="flex items-center gap-1.5 text-xs text-texto-2"><Gift className="size-4" aria-hidden />Los siete conceptos se calculan con motores separados; ningún monto representa un plan de compensación aprobado.</p>
    </div>
  );
}
