import { useMemo, useState } from 'react';
import { BadgeCheck, Ban, CircleCheck, ClipboardCheck, FileCheck2, Lock, PauseCircle, PlayCircle, Receipt, Wallet } from 'lucide-react';
import { ResultadosCorrida } from '../../componentes/bonos/ResultadosCorrida';
import { BarraExportar } from '../../componentes/ui/BarraExportar';
import { Boton } from '../../componentes/ui/Boton';
import { ChipsFiltro } from '../../componentes/ui/ChipsFiltro';
import { Confirmacion } from '../../componentes/ui/Confirmacion';
import { ConPermiso } from '../../componentes/ui/ConPermiso';
import { EstadoVacio } from '../../componentes/ui/EstadoVacio';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tabla, type ColumnaTabla } from '../../componentes/ui/Tabla';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { useToast } from '../../componentes/ui/useToast';
import { estadosLiquidacion } from '../../datos/presentacionCompensacion';
import { estadosCorrida } from '../../datos/presentacionCompensacionCorporativa';
import { presentacionMotores } from '../../datos/presentacionMotores';
import { usePermiso } from '../../hooks/usePermiso';
import { aprobarCierre, aprobarCorrida, cambiarEstadoLiquidacion, generarLiquidaciones, rechazarCorrida, revisarPartida } from '../../servicios/compensacion';
import { useCompensacionStore } from '../../store/useCompensacionStore';
import { usePeriodosStore } from '../../store/usePeriodosStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { BonoComision, EstadoLiquidacion, Liquidacion } from '../../tipos/compensacion';
import { unirClases } from '../../utilidades/clases';
import { formatearMonto } from '../../utilidades/formatos';

type Pendiente = { tipo: 'partida'; corridaId: string; bono: BonoComision } | { tipo: 'liquidacion'; liquidacion: Liquidacion; hacia: EstadoLiquidacion };

const siguientes: Partial<Record<EstadoLiquidacion, { hacia: EstadoLiquidacion; texto: string; icono: typeof Wallet }>> = {
  en_revision: { hacia: 'aprobada', texto: 'Aprobar', icono: CircleCheck },
  aprobada: { hacia: 'apta_para_desembolso', texto: 'Apta para desembolso', icono: FileCheck2 },
  apta_para_desembolso: { hacia: 'liquidada_simulada', texto: 'Marcar liquidada (simulado)', icono: Wallet },
  retenida: { hacia: 'aprobada', texto: 'Liberar', icono: PlayCircle },
};

export default function Liquidaciones() {
  const corridas = useCompensacionStore((estado) => estado.corridas);
  const liquidaciones = useCompensacionStore((estado) => estado.liquidaciones);
  const periodos = usePeriodosStore((estado) => estado.periodos);
  const personas = usePersonasStore((estado) => estado.personas);
  const actor = usePersonaSesion();
  const toast = useToast();
  const puedeAprobar = usePermiso('liquidaciones', 'aprobar');
  const puedeLiquidar = usePermiso('liquidaciones', 'liquidar');
  const puedeCerrar = usePermiso('periodos', 'aprobar');
  const idActor = actor?.id ?? 'DEMO-U01';
  const enRevision = corridas.filter((corrida) => corrida.estado === 'en_revision');
  const aprobadas = corridas.filter((corrida) => corrida.estado === 'aprobada');
  const enCierre = periodos.filter((periodo) => periodo.estado === 'en_cierre');
  const [corridaId, setCorridaId] = useState<string | null>(null);
  const revisada = enRevision.find((corrida) => corrida.id === corridaId) ?? enRevision[0];
  const [pendiente, setPendiente] = useState<Pendiente | null>(null);
  const periodosLiquidados = [...new Set(liquidaciones.map((liquidacion) => liquidacion.periodoId))].sort();
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState<EstadoLiquidacion | 'todos'>('todos');
  const filas = useMemo(() => liquidaciones.filter((liquidacion) => (filtroPeriodo === 'todos' || liquidacion.periodoId === filtroPeriodo) && (filtroEstado === 'todos' || liquidacion.estado === filtroEstado)), [liquidaciones, filtroPeriodo, filtroEstado]);
  const nombre = (id: string) => {
    const persona = personas.find((item) => item.id === id);
    return persona ? `${persona.nombres} ${persona.apellidos}` : id;
  };
  const informar = (resultado: { ok: true } | { ok: false; error: string }, titulo: string, detalle?: string) => {
    if (resultado.ok) toast.exito(titulo, detalle);
    else toast.error('No se pudo completar', resultado.error);
  };

  const generar = (id: string) => {
    const resultado = generarLiquidaciones(id, idActor);
    if (!resultado.ok) {
      toast.error('No se pudo generar', resultado.error);
      return;
    }
    if (resultado.valor.yaExistian) toast.info('Sin duplicados', 'Ya existe una liquidación para esta corrida; no se duplica.');
    else toast.exito('Liquidaciones generadas', `${resultado.valor.liquidaciones.length} liquidaciones simuladas, sin transferencia monetaria.`);
  };

  const columnas: ColumnaTabla<Liquidacion>[] = [
    { clave: 'persona', titulo: 'Afiliado', principalEnMovil: true, valorOrden: (fila) => nombre(fila.personaId), render: (fila) => <div><p className="font-semibold">{nombre(fila.personaId)}</p><p className="cifra text-xs text-texto-2">{fila.id}</p></div> },
    { clave: 'periodo', titulo: 'Período', render: (fila) => <span className="cifra">{fila.periodoId}</span> },
    { clave: 'conceptos', titulo: 'Bonos', alinear: 'derecha', ocultarEnMovil: true, render: (fila) => <span className="cifra">{formatearMonto(fila.conceptos.reduce((suma, concepto) => suma + concepto.monto, 0))}</span> },
    { clave: 'ajustes', titulo: 'Ajustes', ocultarEnMovil: true, render: (fila) => <span className="cifra text-[12px] text-texto-2">{fila.ajustes.join(', ') || '-'}</span> },
    { clave: 'total', titulo: 'Total', alinear: 'derecha', valorOrden: (fila) => fila.total, render: (fila) => <span className="cifra font-bold">{formatearMonto(fila.total)}</span> },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <div className="flex flex-col items-start gap-1"><Insignia tono={estadosLiquidacion[fila.estado].tono} icono={estadosLiquidacion[fila.estado].icono}>{estadosLiquidacion[fila.estado].etiqueta}</Insignia>{fila.motivoRetencion && <span className="text-[11.5px] text-texto-2">{fila.motivoRetencion}</span>}</div> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-[15px] font-bold"><ClipboardCheck className="size-4 text-acento" aria-hidden />Corridas en revisión</h3>
        {revisada ? (
          <Tarjeta variante="simulacion" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {enRevision.map((corrida) => (
                <button key={corrida.id} type="button" aria-pressed={corrida.id === revisada.id} onClick={() => setCorridaId(corrida.id)} className={unirClases('cifra min-h-11 rounded-xl border px-3 text-[12.5px] font-semibold md:min-h-9', corrida.id === revisada.id ? 'border-primario bg-primario text-white' : 'border-borde bg-superficie')}>{corrida.id}</button>
              ))}
              <span className="text-[12.5px] text-texto-2">Corrida simulada · reglas <span className="cifra">{revisada.versionReglasId}</span> · aún no es una liquidación</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <ConPermiso modulo="liquidaciones" accion="aprobar"><Boton icono={BadgeCheck} onClick={() => informar(aprobarCorrida(revisada.id, idActor), 'Corrida aprobada', `${revisada.id} queda congelada (solo lectura).`)}>Aprobar corrida</Boton></ConPermiso>
              <ConPermiso modulo="liquidaciones" accion="aprobar"><Boton variante="secundario" icono={Ban} onClick={() => informar(rechazarCorrida(revisada.id, idActor), 'Corrida rechazada')}>Rechazar</Boton></ConPermiso>
            </div>
            <ResultadosCorrida
              corrida={revisada}
              pestanaInicial="actividad_comercial"
              accionesPartida={puedeAprobar ? (bono) => (bono.estado === 'en_revision' && bono.monto > 0 ? (
                <div className="flex gap-1">
                  <Boton tamano="sm" variante="fantasma" icono={CircleCheck} onClick={() => informar(revisarPartida(revisada.id, bono.id, 'aprobar', idActor, ''), 'Partida aprobada')}>Aprobar</Boton>
                  <Boton tamano="sm" variante="fantasma" icono={PauseCircle} onClick={() => setPendiente({ tipo: 'partida', corridaId: revisada.id, bono })}>Retener</Boton>
                </div>
              ) : null) : undefined}
            />
          </Tarjeta>
        ) : <Tarjeta><EstadoVacio icono={ClipboardCheck} titulo="No hay corridas en revisión" texto="Ejecuta una corrida en el Simulador y envíala a revisión." /></Tarjeta>}
      </section>

      <section className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
        <Tarjeta titulo="Corridas aprobadas" subtitulo="Generar liquidaciones es idempotente" icono={BadgeCheck}>
          <ul className="flex flex-col gap-2">
            {aprobadas.map((corrida) => {
              const cantidad = liquidaciones.filter((liquidacion) => liquidacion.corridaId === corrida.id).length;
              return (
                <li key={corrida.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-borde p-3 text-[13px]">
                  <span className="cifra font-semibold">{corrida.id}</span>
                  <Insignia tono={estadosCorrida.aprobada.tono} icono={estadosCorrida.aprobada.icono}>Aprobada</Insignia>
                  <span className="text-[12px] text-texto-2">{cantidad > 0 ? `${cantidad} liquidaciones` : 'Sin liquidaciones'}</span>
                  <ConPermiso modulo="liquidaciones" accion="liquidar"><Boton tamano="sm" variante={cantidad > 0 ? 'secundario' : 'primario'} icono={Receipt} onClick={() => generar(corrida.id)} className="ml-auto">Generar liquidaciones</Boton></ConPermiso>
                </li>
              );
            })}
          </ul>
        </Tarjeta>
        <Tarjeta titulo="Aprobación de cierre" subtitulo="Requiere una corrida aprobada del período" icono={Lock}>
          {enCierre.length === 0 ? <p className="text-[13px] text-texto-2">No hay períodos en cierre. Inícialo desde Períodos.</p> : (
            <ul className="flex flex-col gap-2">
              {enCierre.map((periodo) => (
                <li key={periodo.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-borde p-3 text-[13px]">
                  <span className="cifra font-semibold">{periodo.id}</span>
                  <Insignia tono="advertencia">En cierre</Insignia>
                  <ConPermiso modulo="periodos" accion="aprobar"><Boton tamano="sm" icono={Lock} onClick={() => puedeCerrar && informar(aprobarCierre(periodo.id, idActor), `${periodo.id} cerrado`, 'Las calificaciones y saldos del período quedan congelados.')} className="ml-auto">Aprobar cierre</Boton></ConPermiso>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="flex items-center gap-2 text-[15px] font-bold"><Wallet className="size-4 text-acento" aria-hidden />Liquidaciones</h3>
          <span className="rounded-lg bg-green-50 px-2 py-1 text-[11.5px] font-semibold text-exito">Sin transferencia monetaria</span>
          <div className="ml-auto"><BarraExportar modulo="liquidaciones" nombreArchivo="DEMO-liquidaciones" filas={() => filas.map((fila) => ({ liquidacion: fila.id, afiliado: fila.personaId, nombre: nombre(fila.personaId), periodo: fila.periodoId, corrida: fila.corridaId, ...Object.fromEntries(fila.conceptos.map((concepto) => [presentacionMotores[concepto.motor].nombre, concepto.monto])), ajustes: fila.ajustes.join(' '), total: fila.total, estado: estadosLiquidacion[fila.estado].etiqueta, observacion: fila.motivoRetencion ?? '' }))} /></div>
        </div>
        <Tabla
          columnas={columnas}
          filas={filas}
          claveFila={(fila) => fila.id}
          textoBusqueda={(fila) => `${fila.id} ${fila.personaId} ${nombre(fila.personaId)}`}
          placeholderBusqueda="Buscar afiliado o liquidación"
          filtros={<div className="flex flex-col gap-2"><ChipsFiltro etiqueta="Período" activo={filtroPeriodo} alCambiar={setFiltroPeriodo} opciones={[{ valor: 'todos', texto: 'Todos los períodos' }, ...periodosLiquidados.map((id) => ({ valor: id, texto: id }))]} /><ChipsFiltro etiqueta="Estado" activo={filtroEstado} alCambiar={setFiltroEstado} opciones={[{ valor: 'todos', texto: 'Todos los estados' }, ...(Object.keys(estadosLiquidacion) as EstadoLiquidacion[]).map((estado) => ({ valor: estado, texto: estadosLiquidacion[estado].etiqueta }))]} /></div>}
          accionesFila={(fila) => {
            const siguiente = siguientes[fila.estado];
            const permitido = siguiente && (siguiente.hacia === 'liquidada_simulada' || siguiente.hacia === 'apta_para_desembolso' ? puedeLiquidar : puedeAprobar);
            return (
              <div className="flex flex-wrap justify-end gap-1">
                {siguiente && permitido && <Boton tamano="sm" variante="fantasma" icono={siguiente.icono} onClick={() => informar(cambiarEstadoLiquidacion(fila.id, siguiente.hacia, idActor), estadosLiquidacion[siguiente.hacia].etiqueta, fila.id)}>{siguiente.texto}</Boton>}
                {['en_revision', 'aprobada', 'apta_para_desembolso'].includes(fila.estado) && puedeAprobar && <Boton tamano="sm" variante="fantasma" icono={PauseCircle} onClick={() => setPendiente({ tipo: 'liquidacion', liquidacion: fila, hacia: 'retenida' })}>Retener</Boton>}
              </div>
            );
          }}
        />
        <p className="text-[12px] text-texto-2">Las liquidaciones se generan solo desde corridas aprobadas y muestran la versión de reglas de su corrida.</p>
      </section>

      <Confirmacion
        abierto={Boolean(pendiente)}
        alCerrar={() => setPendiente(null)}
        titulo={pendiente?.tipo === 'partida' ? 'Retener partida' : 'Retener pago'}
        resumen={pendiente?.tipo === 'partida' ? `${nombre(pendiente.bono.personaId)} · ${presentacionMotores[pendiente.bono.motor].nombre} · ${formatearMonto(pendiente.bono.monto)}` : pendiente ? `${pendiente.liquidacion.id} · ${formatearMonto(pendiente.liquidacion.total)}` : ''}
        textoConfirmar="Retener"
        peligro
        requiereMotivo
        alConfirmar={(motivo) => {
          if (pendiente?.tipo === 'partida') informar(revisarPartida(pendiente.corridaId, pendiente.bono.id, 'retener', idActor, motivo), 'Partida retenida', 'El historial se conserva.');
          if (pendiente?.tipo === 'liquidacion') informar(cambiarEstadoLiquidacion(pendiente.liquidacion.id, 'retenida', idActor, motivo), 'Pago retenido', 'La liquidación queda retenida con el motivo visible.');
          setPendiente(null);
        }}
      />
    </div>
  );
}
