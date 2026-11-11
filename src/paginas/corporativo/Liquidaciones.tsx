import { useMemo, useState } from 'react';
import { BadgeCheck, Ban, Calculator, CircleCheck, CircleDashed, ClipboardCheck, FileCheck2, Hourglass, Lock, PauseCircle, PlayCircle, Receipt, RotateCcw, Wallet } from 'lucide-react';
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
import { aprobarCierre, aprobarCorrida, cambiarEstadoLiquidacion, crearCorrida, enviarCorridaARevision, generarLiquidaciones, iniciarCierre, rechazarCorrida, revisarPartida } from '../../servicios/compensacion';
import { reabrirPeriodo } from '../../servicios/periodos';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
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
  const ciclosOrdenados = periodos.filter((periodo) => periodo.tipo === 'ciclo').sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio));
  const abierto = ciclosOrdenados.find((periodo) => periodo.estado === 'abierto');
  const ultimoCerrado = [...ciclosOrdenados].reverse().find((periodo) => periodo.estado === 'cerrado');
  const ciclosCierre = [ultimoCerrado, ...ciclosOrdenados.filter((periodo) => periodo.estado === 'abierto' || periodo.estado === 'en_cierre')].filter((periodo): periodo is NonNullable<typeof periodo> => Boolean(periodo));
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

  const generarEjemplo = () => {
    if (!abierto) return;
    const creada = crearCorrida(abierto.id, idActor);
    if (!creada.ok) {
      toast.error('No se pudo simular', creada.error);
      return;
    }
    const enviada = enviarCorridaARevision(creada.valor.id, idActor);
    if (enviada.ok) toast.exito('Corrida de ejemplo en revisión', `${creada.valor.id} con reglas ${creada.valor.versionReglasId}. Revisa sus partidas y apruébala.`);
    else toast.error('No se pudo enviar a revisión', enviada.error);
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
    { clave: 'periodo', titulo: 'Período', render: (fila) => <span className="cifra whitespace-nowrap">{fila.periodoId}</span> },
    { clave: 'conceptos', titulo: 'Bonos', alinear: 'derecha', ocultarEnMovil: true, render: (fila) => <span className="cifra whitespace-nowrap">{formatearMonto(fila.conceptos.reduce((suma, concepto) => suma + concepto.monto, 0))}</span> },
    { clave: 'ajustes', titulo: 'Ajustes', ocultarEnMovil: true, render: (fila) => <span className="cifra text-[12px] text-texto-2">{fila.ajustes.join(', ') || '-'}</span> },
    { clave: 'total', titulo: 'Total', alinear: 'derecha', valorOrden: (fila) => fila.total, render: (fila) => <span className="cifra whitespace-nowrap font-bold">{formatearMonto(fila.total)}</span> },
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
        ) : (
          <Tarjeta className="flex flex-col gap-4">
            <EstadoVacio icono={ClipboardCheck} titulo="No hay corridas en revisión" texto={`Una corrida calcula los bonos de un ciclo. Genera una de ejemplo de ${abierto?.id ?? 'el ciclo abierto'} para recorrer el proceso completo aquí mismo.`} />
            <ol className="mx-auto grid w-full max-w-3xl gap-2 text-[12.5px] sm:grid-cols-5">
              {['Simular corrida', 'Revisar partidas', 'Aprobar corrida', 'Generar liquidaciones', 'Cerrar el período'].map((paso, indice) => (
                <li key={paso} className="flex items-center gap-2 rounded-xl bg-fondo px-3 py-2 sm:flex-col sm:text-center"><span className="cifra grid size-6 shrink-0 place-items-center rounded-full bg-primario text-[11px] font-bold text-white">{indice + 1}</span>{paso}</li>
              ))}
            </ol>
            <div className="flex flex-wrap justify-center gap-2">
              {abierto && <ConPermiso modulo="simulador" accion="crear"><Boton icono={PlayCircle} onClick={generarEjemplo}>Generar corrida de ejemplo de {abierto.id}</Boton></ConPermiso>}
              <EnlaceBoton to="/corporativo/simulador" variante="secundario" icono={Calculator}>Ir al Simulador</EnlaceBoton>
            </div>
          </Tarjeta>
        )}
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
        <Tarjeta titulo="Aprobación de cierre" subtitulo="Cerrar un ciclo congela sus calificaciones y saldos" icono={Lock}>
          <ul className="flex flex-col gap-2">
            {ciclosCierre.map((periodo) => {
              const aprobada = corridas.find((corrida) => corrida.periodoId === periodo.id && corrida.estado === 'aprobada');
              return (
                <li key={periodo.id} className="flex flex-col gap-2 rounded-xl border border-borde p-3 text-[13px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="cifra font-semibold">{periodo.id}</span>
                    <Insignia tono={periodo.estado === 'en_cierre' ? 'advertencia' : periodo.estado === 'cerrado' ? 'exito' : 'info'}>{periodo.estado === 'en_cierre' ? 'En cierre' : periodo.estado === 'cerrado' ? 'Cerrado' : 'Abierto'}</Insignia>
                    <span className={unirClases('inline-flex items-center gap-1 text-[12px]', aprobada ? 'text-exito' : 'text-texto-2')}>{aprobada ? <CircleCheck className="size-3.5" aria-hidden /> : <CircleDashed className="size-3.5" aria-hidden />}{aprobada ? `Corrida aprobada ${aprobada.id}` : 'Falta una corrida aprobada'}</span>
                  </div>
                  {periodo.estado === 'cerrado' ? <p className="text-[12px] text-texto-2">Cierre aprobado con las reglas {periodo.versionReglasId}. No se recalcula con reglas nuevas.</p> : (
                    <div className="flex flex-wrap gap-2">
                      {periodo.estado === 'abierto' && <ConPermiso modulo="periodos" accion="aprobar"><Boton tamano="sm" variante="secundario" icono={Hourglass} onClick={() => puedeCerrar && informar(iniciarCierre(periodo.id, idActor), `${periodo.id} en cierre`, 'Ya no recibe compras nuevas hasta aprobarse o reabrirse.')}>Iniciar cierre</Boton></ConPermiso>}
                      {periodo.estado === 'en_cierre' && <ConPermiso modulo="periodos" accion="aprobar"><Boton tamano="sm" icono={Lock} onClick={() => puedeCerrar && informar(aprobarCierre(periodo.id, idActor), `${periodo.id} cerrado`, 'Las calificaciones y saldos quedan congelados y se abre el ciclo siguiente.')}>Aprobar cierre</Boton></ConPermiso>}
                      {periodo.estado === 'en_cierre' && <ConPermiso modulo="periodos" accion="aprobar"><Boton tamano="sm" variante="fantasma" icono={RotateCcw} onClick={() => puedeCerrar && informar(reabrirPeriodo(periodo.id, idActor), `${periodo.id} reabierto`)}>Reabrir</Boton></ConPermiso>}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-[12px] text-texto-2">Orden sugerido: aprobar la corrida del ciclo, generar liquidaciones, iniciar el cierre y aprobarlo.</p>
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
