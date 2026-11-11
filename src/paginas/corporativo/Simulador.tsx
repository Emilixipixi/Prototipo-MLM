import { useMemo, useState } from 'react';
import { Calculator, CheckCircle2, FlaskConical, ListChecks, Play, RefreshCcw, Send, SlidersHorizontal, TriangleAlert } from 'lucide-react';
import { ResultadosCorrida } from '../../componentes/bonos/ResultadosCorrida';
import { LeyendaDemostracion } from '../../componentes/demo/LeyendaDemostracion';
import { Boton } from '../../componentes/ui/Boton';
import { ChipsFiltro } from '../../componentes/ui/ChipsFiltro';
import { ConPermiso } from '../../componentes/ui/ConPermiso';
import { EstadoError } from '../../componentes/ui/EstadoError';
import { EstadoVacio } from '../../componentes/ui/EstadoVacio';
import { Insignia } from '../../componentes/ui/Insignia';
import { Modal } from '../../componentes/ui/Modal';
import { Selector } from '../../componentes/ui/Selector';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { useToast } from '../../componentes/ui/useToast';
import { estadosCorrida } from '../../datos/presentacionCompensacionCorporativa';
import { crearCorrida, enviarCorridaARevision, reproducirCorrida } from '../../servicios/compensacion';
import { useCompensacionStore } from '../../store/useCompensacionStore';
import { usePedidosStore } from '../../store/usePedidosStore';
import { usePeriodosStore } from '../../store/usePeriodosStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { CorridaCalculo } from '../../tipos/compensacion';
import type { VersionReglas } from '../../tipos/reglas';
import { unirClases } from '../../utilidades/clases';
import { formatearFechaHora } from '../../utilidades/fechas';
import { formatearMonto, formatearNumero } from '../../utilidades/formatos';

export default function Simulador() {
  const periodos = usePeriodosStore((estado) => estado.periodos);
  const versiones = usePeriodosStore((estado) => estado.versiones);
  const corridas = useCompensacionStore((estado) => estado.corridas);
  const actor = usePersonaSesion();
  const toast = useToast();
  const simulables = periodos.filter((periodo) => periodo.tipo === 'ciclo' && (periodo.estado === 'abierto' || periodo.estado === 'en_cierre'));
  const [periodoId, setPeriodoId] = useState(simulables[0]?.id ?? 'DEMO-C02');
  const periodo = periodos.find((item) => item.id === periodoId);
  const [modo, setModo] = useState<'version' | 'temporales'>('version');
  const [versionId, setVersionId] = useState<string | null>(null);
  const versionElegida = versiones.find((version) => version.id === (versionId ?? periodo?.versionReglasId)) ?? versiones[0];
  const [temporales, setTemporales] = useState<VersionReglas | null>(null);
  const [editandoTemporales, setEditandoTemporales] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const delPeriodo = useMemo(() => corridas.filter((corrida) => corrida.periodoId === periodoId).sort((a, b) => b.fecha.localeCompare(a.fecha)), [corridas, periodoId]);
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null);
  const seleccionada = corridas.find((corrida) => corrida.id === seleccionadaId) ?? delPeriodo[0];
  const reglasTemporales = temporales ?? versionElegida;

  const ejecutar = () => {
    const resultado = crearCorrida(periodoId, actor?.id ?? 'DEMO-U01', modo === 'temporales' ? { reglasTemporales: { ...reglasTemporales, id: `${versionElegida.id}-TEMP` } } : { reglasId: versionElegida.id });
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    setError(null);
    setSeleccionadaId(resultado.valor.id);
    toast.exito('Corrida simulada', `${resultado.valor.id} con ${resultado.valor.movimientoIds.length} movimientos y reglas ${resultado.valor.versionReglasId}.`);
  };

  return (
    <div className="flex flex-col gap-5">
      <LeyendaDemostracion variante="bloque" />
      <Tarjeta titulo="Nueva corrida" subtitulo="Período, reglas y ejecución" icono={Calculator}>
        <div className="flex flex-col gap-4">
          {error && <EstadoError queOcurrio={error} />}
          <div className="grid gap-3 md:grid-cols-2">
            <Selector etiqueta="Período" value={periodoId} onChange={(evento) => { setPeriodoId(evento.target.value); setSeleccionadaId(null); }} opciones={simulables.map((item) => ({ valor: item.id, texto: `${item.id} · ${item.estado === 'abierto' ? 'abierto' : 'en cierre'}` }))} />
            <Selector etiqueta="Versión de reglas" value={versionElegida.id} onChange={(evento) => { setVersionId(evento.target.value); setTemporales(null); }} opciones={versiones.map((version) => ({ valor: version.id, texto: `${version.id}${version.id === periodo?.versionReglasId ? ' (vigente del período)' : ''}` }))} />
          </div>
          <ChipsFiltro etiqueta="Modo de reglas" activo={modo} alCambiar={setModo} opciones={[{ valor: 'version', texto: 'Usar versión guardada' }, { valor: 'temporales', texto: 'Parámetros temporales' }]} />
          {modo === 'temporales' && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50/60 px-3 py-2.5 text-[12.5px] text-[#1E3A8A]">
              <FlaskConical className="size-4 shrink-0" aria-hidden />
              Los parámetros temporales solo afectan esta simulación; no crean una versión de reglas.
              <Boton tamano="sm" variante="secundario" icono={SlidersHorizontal} onClick={() => setEditandoTemporales(true)} className="sm:ml-auto">{temporales ? 'Editar parámetros (modificados)' : 'Editar parámetros'}</Boton>
            </div>
          )}
          <ConPermiso modulo="simulador" accion="crear">
            <Boton icono={Play} onClick={ejecutar} className="self-start">Ejecutar corrida</Boton>
          </ConPermiso>
        </div>
      </Tarjeta>

      {delPeriodo.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-texto-2">Corridas de {periodoId}:</span>
          {delPeriodo.map((corrida) => (
            <button key={corrida.id} type="button" aria-pressed={corrida.id === seleccionada?.id} onClick={() => setSeleccionadaId(corrida.id)} className={unirClases('cifra inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-[12.5px] font-semibold md:min-h-9', corrida.id === seleccionada?.id ? 'border-primario bg-primario text-white' : 'border-borde bg-superficie hover:border-texto-3')}>
              {corrida.id}<span className="font-sans font-medium opacity-80">{estadosCorrida[corrida.estado].etiqueta}</span>
            </button>
          ))}
        </div>
      )}
      {seleccionada ? <DetalleCorrida corrida={seleccionada} /> : <Tarjeta><EstadoVacio icono={Calculator} titulo={`Sin corridas en ${periodoId}`} texto="Ejecuta una corrida para ver los resultados separados por motor y por afiliado." /></Tarjeta>}
      {editandoTemporales && <EditorTemporales reglas={reglasTemporales} alCerrar={() => setEditandoTemporales(false)} alGuardar={(reglas) => { setTemporales(reglas); setEditandoTemporales(false); }} />}
    </div>
  );
}

function DetalleCorrida({ corrida }: { corrida: CorridaCalculo }) {
  const actor = usePersonaSesion();
  const toast = useToast();
  const movimientos = usePedidosStore((estado) => estado.movimientos);
  const [verMovimientos, setVerMovimientos] = useState(false);
  const [reproduccion, setReproduccion] = useState<{ coincide: boolean; diferencias: string[] } | null>(null);
  const total = corrida.resultados.reduce((suma, bono) => suma + bono.monto, 0);
  const estado = estadosCorrida[corrida.estado];
  const usados = movimientos.filter((movimiento) => corrida.movimientoIds.includes(movimiento.id));

  const reproducir = () => {
    const resultado = reproducirCorrida(corrida.id);
    if (resultado.ok) setReproduccion(resultado.valor);
  };
  const enviar = () => {
    const resultado = enviarCorridaARevision(corrida.id, actor?.id ?? 'DEMO-U01');
    if (resultado.ok) toast.exito('Corrida enviada a revisión', `${corrida.id} queda disponible en Liquidaciones para revisar sus partidas.`);
    else toast.error('No se pudo enviar', resultado.error);
  };

  return (
    <Tarjeta variante={corrida.estado === 'aprobada' ? 'normal' : 'simulacion'} className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2"><span className="cifra text-lg font-extrabold">{corrida.id}</span><Insignia tono={estado.tono} icono={estado.icono}>{estado.etiqueta}</Insignia>{corrida.parametrosTemporales && <Insignia tono="info" icono={FlaskConical}>Parámetros temporales</Insignia>}</p>
          <p className="cifra mt-1 text-[12.5px] text-texto-2">Reglas {corrida.versionReglasId} · {corrida.periodoId} · {formatearFechaHora(corrida.fecha)} · {corrida.creadaPor}</p>
          <p className="cifra mt-0.5 break-all text-[11.5px] text-texto-3">Clave de idempotencia {corrida.claveIdempotencia}</p>
        </div>
        <div className="lg:ml-auto lg:text-right">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Total ilustrativo</p>
          <p className="cifra text-2xl font-extrabold">{formatearMonto(total)}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Boton tamano="sm" variante="secundario" icono={ListChecks} onClick={() => setVerMovimientos(true)}>{formatearNumero(corrida.movimientoIds.length)} movimientos usados</Boton>
        <Boton tamano="sm" variante="secundario" icono={RefreshCcw} onClick={reproducir}>Reproducir corrida</Boton>
        {corrida.estado === 'simulada' && <ConPermiso modulo="simulador" accion="editar"><Boton tamano="sm" icono={Send} onClick={enviar}>Enviar a revisión</Boton></ConPermiso>}
      </div>
      {reproduccion && (
        <p className={unirClases('flex items-start gap-2 rounded-xl px-3 py-2 text-[12.5px]', reproduccion.coincide ? 'bg-green-50 text-exito' : 'bg-red-50 text-error')}>
          {reproduccion.coincide ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden /> : <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />}
          {reproduccion.coincide ? 'Reproducción idéntica: mismas reglas y mismos movimientos producen el mismo resultado.' : `Diferencias: ${reproduccion.diferencias.join('; ')}`}
        </p>
      )}
      <ResultadosCorrida corrida={corrida} />
      <Modal abierto={verMovimientos} alCerrar={() => setVerMovimientos(false)} titulo={`Movimientos de ${corrida.id}`} descripcion="Lista congelada de movimientos de volumen usados en el cálculo." ancho="lg">
        <ul className="max-h-[60vh] divide-y divide-borde overflow-y-auto text-[12.5px]">
          {usados.map((movimiento) => (
            <li key={movimiento.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
              <span className="cifra font-semibold">{movimiento.id}</span>
              <Insignia tono={movimiento.tipo === 'reversion' ? 'error' : 'neutra'}>{movimiento.tipo}</Insignia>
              <span className="cifra text-texto-2">{movimiento.personaId} · {movimiento.pedidoId ?? '-'}</span>
              <span className="cifra ml-auto">VP {formatearNumero(movimiento.vp)} · VC {formatearNumero(movimiento.vc)}</span>
            </li>
          ))}
        </ul>
      </Modal>
    </Tarjeta>
  );
}

function EditorTemporales({ reglas, alCerrar, alGuardar }: { reglas: VersionReglas; alCerrar: () => void; alGuardar: (reglas: VersionReglas) => void }) {
  const [borrador, setBorrador] = useState(() => structuredClone(reglas));
  const cambiar = (codigo: string, clave: string, valor: number) => setBorrador((previo) => ({
    ...previo,
    motores: previo.motores.map((motor) => (motor.codigo !== codigo ? motor : { ...motor, parametros: motor.parametros.map((parametro) => (parametro.clave === clave ? { ...parametro, valor } : parametro)) })),
  }));
  return (
    <Modal abierto alCerrar={alCerrar} titulo="Parámetros temporales" descripcion={`Basados en ${reglas.id}. Solo para esta simulación.`} ancho="lg" pie={<><Boton variante="secundario" onClick={alCerrar}>Cancelar</Boton><Boton onClick={() => alGuardar(borrador)}>Usar en la simulación</Boton></>}>
      <div className="flex flex-col gap-2">
        {borrador.motores.map((motor) => (
          <details key={motor.codigo} className="rounded-xl border border-borde px-3" open={motor.codigo === 'unilevel'}>
            <summary className="flex min-h-11 cursor-pointer items-center gap-2 text-[13.5px] font-semibold">
              {motor.nombre}
              <label className="ml-auto flex items-center gap-2 text-[12px] font-medium text-texto-2" onClick={(evento) => evento.stopPropagation()}>
                <input type="checkbox" checked={motor.activo} onChange={() => setBorrador((previo) => ({ ...previo, motores: previo.motores.map((item) => (item.codigo === motor.codigo ? { ...item, activo: !item.activo } : item)) }))} className="size-5 accent-[#0E7490]" />
                Activo
              </label>
            </summary>
            <div className="grid gap-2 pb-3 sm:grid-cols-2">
              {motor.parametros.filter((parametro) => typeof parametro.valor === 'number').map((parametro) => (
                <label key={parametro.clave} className="flex items-center justify-between gap-2 text-[12.5px] text-texto-2">
                  {parametro.etiqueta}
                  <input type="number" min={0} step="any" value={Number(parametro.valor)} onChange={(evento) => cambiar(motor.codigo, parametro.clave, Number(evento.target.value))} className="cifra min-h-11 w-20 rounded-lg border border-borde px-2 text-right text-[13px] md:min-h-9" />
                </label>
              ))}
            </div>
          </details>
        ))}
      </div>
    </Modal>
  );
}
