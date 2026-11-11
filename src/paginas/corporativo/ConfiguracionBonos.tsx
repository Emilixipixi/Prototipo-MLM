import { useMemo, useState } from 'react';
import { CalendarRange, Globe2, History, Info, Save, Scale, SlidersHorizontal, Undo2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Boton } from '../../componentes/ui/Boton';
import { Campo } from '../../componentes/ui/Campo';
import { EstadoError } from '../../componentes/ui/EstadoError';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tabla, type ColumnaTabla } from '../../componentes/ui/Tabla';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { TerminoInfo } from '../../componentes/ui/TerminoInfo';
import { useToast } from '../../componentes/ui/useToast';
import { presentacionMotores } from '../../datos/presentacionMotores';
import { ordenRuns } from '../../datos/reglas';
import { usePermiso } from '../../hooks/usePermiso';
import { crearVersionReglas } from '../../servicios/reglas';
import { useIntegracionesStore } from '../../store/useIntegracionesStore';
import { usePeriodosStore } from '../../store/usePeriodosStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { ConfiguracionMotor, VersionReglas } from '../../tipos/reglas';
import { unirClases } from '../../utilidades/clases';
import { formatearFecha, formatearFechaHora } from '../../utilidades/fechas';

interface Borrador { motores: ConfiguracionMotor[]; topes: VersionReglas['topes']; trinario: VersionReglas['trinario']; }

export default function ConfiguracionBonos() {
  const versiones = usePeriodosStore((estado) => estado.versiones);
  const periodos = usePeriodosStore((estado) => estado.periodos);
  const mercados = useIntegracionesStore((estado) => estado.mercados);
  const actor = usePersonaSesion();
  const toast = useToast();
  const puedeEditar = usePermiso('bonos', 'editar');
  const ultima = useMemo(() => [...versiones].sort((a, b) => b.numero - a.numero)[0], [versiones]);
  const [baseId, setBaseId] = useState<string | null>(null);
  const base = versiones.find((version) => version.id === baseId) ?? ultima;
  const [borrador, setBorrador] = useState<Borrador | null>(null);
  const siguiente = periodos.filter((periodo) => periodo.tipo === 'ciclo' && periodo.estado === 'programado').sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))[0];
  const [vigencia, setVigencia] = useState(siguiente?.fechaInicio ?? '');
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const actual: Borrador = borrador ?? { motores: base.motores, topes: base.topes, trinario: base.trinario };
  const ciclos = periodos.filter((periodo) => periodo.tipo === 'ciclo');

  const editar = (transformar: (previo: Borrador) => Borrador) => setBorrador(transformar(structuredClone(actual)));
  const cambiarParametro = (codigo: string, clave: string, valor: string | number) => editar((previo) => ({
    ...previo,
    motores: previo.motores.map((motor) => (motor.codigo !== codigo ? motor : { ...motor, parametros: motor.parametros.map((parametro) => (parametro.clave === clave ? { ...parametro, valor } : parametro)) })),
  }));
  const alternarMotor = (codigo: string) => editar((previo) => ({ ...previo, motores: previo.motores.map((motor) => (motor.codigo === codigo ? { ...motor, activo: !motor.activo } : motor)) }));

  const publicar = () => {
    const invalido = actual.motores.flatMap((motor) => motor.parametros.map((parametro) => ({ motor, parametro }))).find(({ parametro }) => typeof parametro.valor === 'number' && (!Number.isFinite(parametro.valor) || parametro.valor < 0));
    if (invalido) {
      setError(`El parámetro "${invalido.parametro.etiqueta}" de ${invalido.motor.nombre} debe ser un número mayor o igual a cero.`);
      return;
    }
    const resultado = crearVersionReglas(base.id, actual, vigencia, motivo, actor?.id ?? 'DEMO-U01');
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    setError(null);
    setBorrador(null);
    setMotivo('');
    setBaseId(resultado.valor.id);
    toast.exito('Versión publicada', `${resultado.valor.id} aplica desde ${formatearFecha(vigencia)}. Las corridas anteriores conservan su versión.`);
  };

  const columnasVersiones: ColumnaTabla<VersionReglas>[] = [
    { clave: 'id', titulo: 'Versión', principalEnMovil: true, render: (fila) => <span className="cifra font-semibold">{fila.id}</span> },
    { clave: 'vigencia', titulo: 'Vigencia', render: (fila) => <span className="text-[12.5px]">{formatearFecha(fila.vigenteDesde)} - {fila.vigenteHasta ? formatearFecha(fila.vigenteHasta) : 'sin fin'}</span> },
    { clave: 'activos', titulo: 'Motores activos', alinear: 'derecha', render: (fila) => <span className="cifra">{fila.motores.filter((motor) => motor.activo).length} / 7</span> },
    { clave: 'actor', titulo: 'Actor y fecha', render: (fila) => <span className="cifra text-[12.5px]">{fila.actorId} · {formatearFechaHora(fila.fecha)}</span> },
    { clave: 'motivo', titulo: 'Motivo', render: (fila) => <span className="text-xs text-texto-2">{fila.motivo}</span> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-2 rounded-xl bg-acento-suave px-3 py-2.5 text-[12.5px] text-[#155E75]">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        Siete conceptos separados, cada uno con su propio motor. Todos los parámetros son valores ilustrativos de DEMOSTRACIÓN y se reemplazarán por las reglas definitivas mediante configuración.
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13px] text-texto-2">Versión base:</span>
        {[...versiones].sort((a, b) => a.numero - b.numero).map((version) => (
          <button key={version.id} type="button" aria-pressed={version.id === base.id} onClick={() => { setBaseId(version.id); setBorrador(null); }} className={unirClases('cifra min-h-11 rounded-xl border px-3 text-[13px] font-semibold md:min-h-9', version.id === base.id ? 'border-primario bg-primario text-white' : 'border-borde bg-superficie hover:border-texto-3')}>{version.id}</button>
        ))}
        {borrador && <Insignia tono="advertencia">Borrador sin publicar</Insignia>}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2 xl:grid-cols-3">
        {actual.motores.map((motor) => {
          const presentacion = presentacionMotores[motor.codigo];
          return (
            <Tarjeta key={motor.codigo} data-motor={motor.codigo} className={unirClases('flex flex-col', !motor.activo && 'opacity-75')}>
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primario-suave text-primario"><presentacion.icono className="size-5" aria-hidden /></span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] font-bold">{motor.nombre}</h3>
                  <p className="text-[12px] text-texto-2">{presentacion.resumen}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={motor.activo}
                  aria-label={`Motor ${motor.nombre} ${motor.activo ? 'activo' : 'inactivo'}`}
                  disabled={!puedeEditar}
                  onClick={() => alternarMotor(motor.codigo)}
                  className="grid min-h-11 shrink-0 place-items-center disabled:opacity-60"
                >
                  <span className={unirClases('relative h-6 w-11 rounded-full transition-colors', motor.activo ? 'bg-exito' : 'bg-texto-3')}>
                    <span className={unirClases('absolute top-0.5 size-5 rounded-full bg-white shadow transition-all', motor.activo ? 'left-[22px]' : 'left-0.5')} />
                  </span>
                </button>
              </div>
              <p className="mt-3 text-[12.5px] text-texto-2">{motor.descripcion}</p>
              <ul className="mt-3 flex flex-col gap-2 border-t border-borde pt-3">
                {motor.parametros.map((parametro) => (
                  <li key={parametro.clave} className="flex items-center justify-between gap-3 text-[12.5px]">
                    <label htmlFor={`${motor.codigo}-${parametro.clave}`} className="min-w-0 text-texto-2">{parametro.etiqueta}</label>
                    {typeof parametro.valor === 'number' ? (
                      <span className="flex shrink-0 items-center gap-1">
                        <input id={`${motor.codigo}-${parametro.clave}`} type="number" min={0} step="any" disabled={!puedeEditar} value={Number.isNaN(parametro.valor) ? '' : parametro.valor} onChange={(evento) => cambiarParametro(motor.codigo, parametro.clave, evento.target.value === '' ? Number.NaN : Number(evento.target.value))} className="cifra min-h-11 w-20 rounded-lg border border-borde bg-superficie px-2 text-right text-[13px] outline-none focus:border-acento disabled:bg-fondo md:min-h-9" />
                        <span className="w-12 text-[11px] text-texto-3">{parametro.unidad}</span>
                      </span>
                    ) : (
                      <select id={`${motor.codigo}-${parametro.clave}`} disabled={!puedeEditar} value={String(parametro.valor)} onChange={(evento) => cambiarParametro(motor.codigo, parametro.clave, evento.target.value)} className="cifra min-h-11 shrink-0 rounded-lg border border-borde bg-superficie px-2 text-[12.5px] disabled:bg-fondo md:min-h-9">
                        {ordenRuns.map((run) => <option key={run} value={run}>{run}</option>)}
                      </select>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-auto pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-oro">Valor ilustrativo</p>
            </Tarjeta>
          );
        })}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
        <Tarjeta titulo="Configuración general" subtitulo="Topes, volumen, calendario y elegibilidad" icono={SlidersHorizontal}>
          <div className="flex flex-col gap-4 text-[13px]">
            <div className="grid gap-3 sm:grid-cols-2">
              <Campo etiqueta="Tope informativo por afiliado y ciclo (USD)" type="number" min={0} disabled={!puedeEditar} value={actual.topes.maximoPorCicloAfiliado} onChange={(evento) => editar((previo) => ({ ...previo, topes: { maximoPorCicloAfiliado: Number(evento.target.value) } }))} ayuda="Referencia general; el tope aplicado hoy es el del motor Trinario." />
              <Campo etiqueta="Caducidad del remanente Trinario (ciclos)" type="number" min={1} disabled={!puedeEditar} value={actual.trinario.ciclosCaducidad} onChange={(evento) => editar((previo) => ({ ...previo, trinario: { ...previo.trinario, ciclosCaducidad: Number(evento.target.value) } }))} ayuda="Informativo: en la demostración la caducidad viene de los remanentes de datos." />
            </div>
            <p className="flex items-start gap-2 rounded-xl bg-fondo px-3 py-2 text-[12.5px] text-texto-2"><Scale className="mt-0.5 size-4 shrink-0 text-acento" aria-hidden /><span><strong className="text-texto">Regla de consumo Trinaria:</strong> {actual.trinario.reglaConsumo}</span></p>
            <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-texto-2">
              <span className="inline-flex items-center gap-1 font-semibold text-texto">VP <TerminoInfo termino="vp" /></span> califica rangos.
              <span className="inline-flex items-center gap-1 font-semibold text-texto">VC <TerminoInfo termino="vc" /></span> es la base de los bonos. Ambos se definen por producto, independientes del precio.
            </div>
            <div>
              <p className="flex items-center gap-2 font-semibold"><CalendarRange className="size-4 text-acento" aria-hidden />Calendario de ciclos</p>
              <p className="mt-1 text-[12.5px] text-texto-2">{ciclos.map((ciclo) => `${ciclo.id} (${ciclo.duracionDias} d, ${ciclo.estado})`).join(' · ')}. <Link to="/corporativo/periodos" className="inline-flex min-h-11 items-center font-semibold text-acento hover:underline md:min-h-0">Editar en Períodos</Link></p>
            </div>
            <div>
              <p className="font-semibold">Elegibilidad común</p>
              <ul className="mt-1 list-disc pl-5 text-[12.5px] text-texto-2">
                <li>Solo cuentas activas cobran; una cuenta suspendida o bloqueada retiene sus comisiones.</li>
                <li>El volumen cuenta desde la confirmación de cobro simulada; una devolución lo revierte.</li>
                <li>Los requisitos de VP personal y RUN de Cobro se configuran en cada motor.</li>
              </ul>
            </div>
          </div>
        </Tarjeta>
        <Tarjeta titulo="Mercados" subtitulo="País, moneda, idioma, tributos y métodos de pago" icono={Globe2}>
          <ul className="flex flex-col gap-3">
            {mercados.map((mercado) => (
              <li key={mercado.pais} className="rounded-xl border border-borde p-3 text-[12.5px]">
                <p className="flex flex-wrap items-center gap-2 text-[13.5px] font-bold">{mercado.pais}<Insignia tono="primaria">{mercado.moneda}</Insignia><Insignia tono="neutra">{mercado.idioma.toUpperCase()}</Insignia></p>
                <p className="mt-1 text-texto-2">{mercado.tributos}</p>
                <p className="mt-1 text-texto-2">Pagos: {mercado.metodosPago.join(', ')}</p>
              </li>
            ))}
          </ul>
        </Tarjeta>
      </div>

      {puedeEditar && (
        <Tarjeta titulo="Publicar nueva versión de parámetros" subtitulo="La versión nueva aplica desde su vigencia; no reescribe cierres anteriores." icono={Save} variante="simulacion">
          <div className="flex flex-col gap-4">
            {error && <EstadoError queOcurrio={error} />}
            <div className="grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)]">
              <Campo etiqueta="Vigente desde" type="date" value={vigencia} onChange={(evento) => setVigencia(evento.target.value)} />
              <Campo etiqueta="Motivo del cambio" value={motivo} onChange={(evento) => setMotivo(evento.target.value)} placeholder="Razón del ajuste de parámetros" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Boton variante="fantasma" icono={Undo2} disabled={!borrador} onClick={() => setBorrador(null)}>Descartar borrador</Boton>
              <Boton icono={Save} disabled={!borrador} onClick={publicar}>Publicar versión</Boton>
            </div>
          </div>
        </Tarjeta>
      )}

      <section className="flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-[15px] font-bold"><History className="size-4 text-acento" aria-hidden />Historial de versiones</h3>
        <Tabla columnas={columnasVersiones} filas={[...versiones].sort((a, b) => b.numero - a.numero)} claveFila={(fila) => fila.id} />
      </section>
    </div>
  );
}
