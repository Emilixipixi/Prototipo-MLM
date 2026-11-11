import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BadgeCheck, CircleX, Eye, FilePlus2, FileSearch, PauseCircle, PlayCircle, RefreshCw, RotateCcw, ShieldAlert, Undo2, UserX, Wallet,
} from 'lucide-react';
import { DialogoEstadoCuenta } from '../../componentes/demo/DialogoEstadoCuenta';
import { Boton } from '../../componentes/ui/Boton';
import { Campo } from '../../componentes/ui/Campo';
import { Confirmacion } from '../../componentes/ui/Confirmacion';
import { ConPermiso } from '../../componentes/ui/ConPermiso';
import { EstadoError } from '../../componentes/ui/EstadoError';
import { EstadoVacio } from '../../componentes/ui/EstadoVacio';
import { Insignia } from '../../componentes/ui/Insignia';
import { Modal } from '../../componentes/ui/Modal';
import { Pestanas } from '../../componentes/ui/Pestanas';
import { Selector } from '../../componentes/ui/Selector';
import { Tabla, type ColumnaTabla } from '../../componentes/ui/Tabla';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { useToast } from '../../componentes/ui/useToast';
import { estadosLiquidacion } from '../../datos/presentacionCompensacion';
import { estadosAjuste, estadosAlerta, severidades, tiposAjuste, tiposAlerta } from '../../datos/presentacionCompensacionCorporativa';
import { estadosCuenta } from '../../datos/presentacionCuentas';
import { presentacionMotores } from '../../datos/presentacionMotores';
import { usePermiso } from '../../hooks/usePermiso';
import { ordenMotores } from '../../motores/ejecutarCorrida';
import { cambiarEstadoLiquidacion, proponerAjuste, resolverAjuste } from '../../servicios/compensacion';
import { actualizarAlerta } from '../../servicios/compliance';
import { previsualizarDevolucion, type VistaPreviaDevolucion } from '../../servicios/devoluciones';
import { registrarDevolucion } from '../../servicios/pedidos';
import { useCompensacionStore } from '../../store/useCompensacionStore';
import { useComplianceStore } from '../../store/useComplianceStore';
import { usePedidosStore } from '../../store/usePedidosStore';
import { usePeriodosStore } from '../../store/usePeriodosStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { AlertaIntegridad } from '../../tipos/compliance';
import type { Ajuste, Liquidacion } from '../../tipos/compensacion';
import type { Persona } from '../../tipos/persona';
import type { CodigoMotor } from '../../tipos/reglas';
import { unirClases } from '../../utilidades/clases';
import { formatearFechaHora } from '../../utilidades/fechas';
import { formatearMonto, formatearNumero } from '../../utilidades/formatos';

export default function Compliance() {
  const alertas = useComplianceStore((estado) => estado.alertas);
  const ajustes = useCompensacionStore((estado) => estado.ajustes);
  const [pestana, setPestana] = useState('alertas');
  const abiertas = alertas.filter((alerta) => alerta.estado !== 'resuelta').length;
  const propuestos = ajustes.filter((ajuste) => ajuste.estado === 'propuesto').length;
  return (
    <div className="flex flex-col gap-5">
      <Pestanas
        etiqueta="Secciones de compliance"
        activa={pestana}
        alCambiar={setPestana}
        pestanas={[
          { id: 'alertas', texto: 'Alertas', icono: ShieldAlert, contador: abiertas },
          { id: 'cuentas', texto: 'Cuentas y pagos', icono: UserX },
          { id: 'devoluciones', texto: 'Devoluciones', icono: Undo2 },
          { id: 'ajustes', texto: 'Ajustes', icono: FilePlus2, contador: propuestos },
        ]}
      />
      {pestana === 'alertas' && <BandejaAlertas />}
      {pestana === 'cuentas' && <CuentasYPagos />}
      {pestana === 'devoluciones' && <Devoluciones />}
      {pestana === 'ajustes' && <Ajustes />}
    </div>
  );
}

function useNombre() {
  const personas = usePersonasStore((estado) => estado.personas);
  return (id: string) => {
    const persona = personas.find((item) => item.id === id);
    return persona ? `${persona.nombres} ${persona.apellidos}` : id;
  };
}

function BandejaAlertas() {
  const alertas = useComplianceStore((estado) => estado.alertas);
  const nombre = useNombre();
  const [revisando, setRevisando] = useState<AlertaIntegridad | null>(null);
  const ordenadas = [...alertas].sort((a, b) => Number(a.estado === 'resuelta') - Number(b.estado === 'resuelta') || b.fecha.localeCompare(a.fecha));
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-3 lg:grid-cols-3">
      {ordenadas.map((alerta) => (
        <Tarjeta key={alerta.id} className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="cifra text-[13px] font-bold">{alerta.id}</span>
            <Insignia tono={severidades[alerta.severidad].tono}>Severidad {severidades[alerta.severidad].etiqueta.toLowerCase()}</Insignia>
            <Insignia tono={estadosAlerta[alerta.estado].tono}>{estadosAlerta[alerta.estado].etiqueta}</Insignia>
          </div>
          <p className="text-[13.5px] font-semibold">{tiposAlerta[alerta.tipo]}</p>
          <p className="text-[12.5px] text-texto-2">{alerta.descripcion}</p>
          <p className="text-[12px] text-texto-2">Personas: {alerta.personasIds.map(nombre).join(', ')}</p>
          {alerta.resolucion && <p className="rounded-xl bg-fondo px-3 py-2 text-[12px] text-texto-2"><strong className="text-texto">Decisión:</strong> {alerta.resolucion}</p>}
          <p className="cifra mt-auto text-[11.5px] text-texto-3">{formatearFechaHora(alerta.fecha)}</p>
          <Boton tamano="sm" variante="secundario" icono={FileSearch} onClick={() => setRevisando(alerta)}>Abrir ficha de revisión</Boton>
        </Tarjeta>
      ))}
      {revisando && <FichaRevision alertaId={revisando.id} alCerrar={() => setRevisando(null)} />}
    </div>
  );
}

const camposComparables: Array<{ clave: keyof Persona; etiqueta: string }> = [
  { clave: 'codigo', etiqueta: 'Código' }, { clave: 'nombres', etiqueta: 'Nombres' }, { clave: 'apellidos', etiqueta: 'Apellidos' },
  { clave: 'documento', etiqueta: 'Documento' }, { clave: 'telefono', etiqueta: 'Teléfono' }, { clave: 'correo', etiqueta: 'Correo' },
  { clave: 'referenteId', etiqueta: 'Patrocinador' }, { clave: 'fechaAlta', etiqueta: 'Alta' }, { clave: 'estado', etiqueta: 'Estado' },
];

function FichaRevision({ alertaId, alCerrar }: { alertaId: string; alCerrar: () => void }) {
  const alerta = useComplianceStore((estado) => estado.alertas.find((item) => item.id === alertaId));
  const personas = usePersonasStore((estado) => estado.personas);
  const actor = usePersonaSesion();
  const toast = useToast();
  const puedeResolver = usePermiso('compliance', 'editar');
  const [decision, setDecision] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cambiando, setCambiando] = useState<Persona | null>(null);
  if (!alerta) return null;
  const involucradas = alerta.personasIds.map((id) => personas.find((persona) => persona.id === id)).filter((persona): persona is Persona => Boolean(persona));
  const coincide = (clave: keyof Persona) => involucradas.length > 1 && new Set(involucradas.map((persona) => String(persona[clave]))).size === 1;

  const decidir = (estado: AlertaIntegridad['estado']) => {
    const resultado = actualizarAlerta(alerta.id, estado, actor?.id ?? 'DEMO-U01', decision);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    toast.exito(estado === 'resuelta' ? 'Alerta resuelta' : 'Alerta en revisión', `${alerta.id}: decisión registrada en la bitácora.`);
    alCerrar();
  };

  return (
    <Modal abierto alCerrar={alCerrar} titulo={`Ficha de revisión ${alerta.id}`} descripcion={`${tiposAlerta[alerta.tipo]} · ${alerta.descripcion}`} ancho="lg">
      <div className="flex flex-col gap-4">
        {error && <EstadoError queOcurrio={error} />}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-[12.5px]">
            <thead><tr className="border-b border-borde text-left text-[10.5px] font-bold uppercase tracking-[0.08em] text-texto-3"><th className="py-2 pr-3">Campo</th>{involucradas.map((persona) => <th key={persona.id} className="py-2 pr-3">{persona.codigo}</th>)}</tr></thead>
            <tbody>
              {camposComparables.map(({ clave, etiqueta }) => (
                <tr key={clave} className={unirClases('border-b border-borde last:border-0', coincide(clave) && clave !== 'estado' && 'bg-red-50')}>
                  <td className="py-1.5 pr-3 font-semibold">{etiqueta}{coincide(clave) && clave !== 'estado' && <span className="ml-1 text-[11px] font-bold text-error">coincide</span>}</td>
                  {involucradas.map((persona) => <td key={persona.id} className="cifra py-1.5 pr-3">{clave === 'estado' ? <Insignia tono={estadosCuenta[persona.estado].tono}>{estadosCuenta[persona.estado].etiqueta}</Insignia> : String(persona[clave] ?? '-')}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-2">
          {involucradas.map((persona) => (
            <ConPermiso key={persona.id} modulo="usuarios" accion="editar"><Boton tamano="sm" variante="secundario" icono={RefreshCw} onClick={() => setCambiando(persona)}>Estado de {persona.codigo}</Boton></ConPermiso>
          ))}
          {involucradas.map((persona) => <Link key={`f-${persona.id}`} to={`/corporativo/usuarios/${persona.id}`} className="inline-flex min-h-11 items-center gap-1 px-2 text-[12.5px] font-semibold text-acento hover:underline md:min-h-9">Ficha {persona.codigo}<ArrowRight className="size-3.5" aria-hidden /></Link>)}
        </div>
        {alerta.estado !== 'resuelta' && (
          <div className="flex flex-col gap-2 border-t border-borde pt-4">
            <label htmlFor="decision-alerta" className="text-[13px] font-semibold">Decisión (obligatoria)</label>
            <textarea id="decision-alerta" rows={2} value={decision} onChange={(evento) => setDecision(evento.target.value)} className="w-full rounded-xl border border-borde p-3 text-sm outline-none focus:border-acento" placeholder="Describe lo verificado y la decisión tomada" />
            <div className="flex flex-wrap gap-2">
              <ConPermiso modulo="compliance" accion="editar"><Boton variante="secundario" icono={Eye} onClick={() => puedeResolver && decidir('en_revision')}>Marcar en revisión</Boton></ConPermiso>
              <ConPermiso modulo="compliance" accion="editar"><Boton icono={BadgeCheck} onClick={() => puedeResolver && decidir('resuelta')}>Resolver alerta</Boton></ConPermiso>
            </div>
          </div>
        )}
      </div>
      {cambiando && <DialogoEstadoCuenta persona={cambiando} alCerrar={() => setCambiando(null)} />}
    </Modal>
  );
}

function CuentasYPagos() {
  const personas = usePersonasStore((estado) => estado.personas);
  const liquidaciones = useCompensacionStore((estado) => estado.liquidaciones);
  const actor = usePersonaSesion();
  const toast = useToast();
  const nombre = useNombre();
  const [cambiando, setCambiando] = useState<Persona | null>(null);
  const [reteniendo, setReteniendo] = useState<Liquidacion | null>(null);
  const restringidas = personas.filter((persona) => persona.tipo !== 'corporativo' && persona.estado !== 'activo');
  const pagos = liquidaciones.filter((liquidacion) => ['retenida', 'aprobada', 'apta_para_desembolso', 'en_revision'].includes(liquidacion.estado));

  const columnasCuentas: ColumnaTabla<Persona>[] = [
    { clave: 'persona', titulo: 'Persona', principalEnMovil: true, render: (fila) => <Link to={`/corporativo/usuarios/${fila.id}`} className="inline-flex min-h-11 flex-col justify-center md:min-h-0"><span className="font-semibold text-acento hover:underline">{fila.nombres} {fila.apellidos}</span><span className="cifra text-xs text-texto-2">{fila.codigo}</span></Link> },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <Insignia tono={estadosCuenta[fila.estado].tono} icono={estadosCuenta[fila.estado].icono}>{estadosCuenta[fila.estado].etiqueta}</Insignia> },
    { clave: 'efecto', titulo: 'Efecto operativo', render: (fila) => <span className="text-[12px] text-texto-2">{estadosCuenta[fila.estado].efecto}</span> },
  ];
  const columnasPagos: ColumnaTabla<Liquidacion>[] = [
    { clave: 'persona', titulo: 'Afiliado', principalEnMovil: true, render: (fila) => <div><p className="font-semibold">{nombre(fila.personaId)}</p><p className="cifra text-xs text-texto-2">{fila.id}</p></div> },
    { clave: 'total', titulo: 'Total', alinear: 'derecha', render: (fila) => <span className="cifra font-semibold">{formatearMonto(fila.total)}</span> },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <div className="flex flex-col items-start gap-1"><Insignia tono={estadosLiquidacion[fila.estado].tono} icono={estadosLiquidacion[fila.estado].icono}>{estadosLiquidacion[fila.estado].etiqueta}</Insignia>{fila.motivoRetencion && <span className="text-[11.5px] text-texto-2">{fila.motivoRetencion}</span>}</div> },
  ];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-2">
      <section className="flex flex-col gap-3">
        <h3 className="text-[15px] font-bold">Cuentas con restricciones</h3>
        <Tabla columnas={columnasCuentas} filas={restringidas} claveFila={(fila) => fila.id} textoVacio="Todas las cuentas están activas." accionesFila={(fila) => <ConPermiso modulo="usuarios" accion="editar"><Boton tamano="sm" variante="fantasma" icono={RefreshCw} onClick={() => setCambiando(fila)}>Estado</Boton></ConPermiso>} />
      </section>
      <section className="flex flex-col gap-3">
        <h3 className="text-[15px] font-bold">Retención y liberación de pagos</h3>
        <Tabla
          columnas={columnasPagos}
          filas={pagos}
          claveFila={(fila) => fila.id}
          textoVacio="Sin pagos pendientes."
          accionesFila={(fila) => (fila.estado === 'retenida'
            ? <ConPermiso modulo="liquidaciones" accion="aprobar"><Boton tamano="sm" variante="fantasma" icono={PlayCircle} onClick={() => { const resultado = cambiarEstadoLiquidacion(fila.id, 'aprobada', actor?.id ?? 'DEMO-U01'); if (resultado.ok) toast.exito('Pago liberado', fila.id); else toast.error('No se puede liberar', resultado.error); }}>Liberar</Boton></ConPermiso>
            : <ConPermiso modulo="liquidaciones" accion="aprobar"><Boton tamano="sm" variante="fantasma" icono={PauseCircle} onClick={() => setReteniendo(fila)}>Retener</Boton></ConPermiso>)}
        />
      </section>
      {cambiando && <DialogoEstadoCuenta persona={cambiando} alCerrar={() => setCambiando(null)} />}
      <Confirmacion
        abierto={Boolean(reteniendo)}
        alCerrar={() => setReteniendo(null)}
        titulo="Retener pago"
        resumen={reteniendo ? `${reteniendo.id} · ${formatearMonto(reteniendo.total)}. El historial no se borra.` : ''}
        textoConfirmar="Retener"
        peligro
        requiereMotivo
        alConfirmar={(motivo) => {
          if (reteniendo) {
            const resultado = cambiarEstadoLiquidacion(reteniendo.id, 'retenida', actor?.id ?? 'DEMO-U01', motivo);
            if (resultado.ok) toast.exito('Pago retenido', reteniendo.id);
            else toast.error('No se pudo retener', resultado.error);
          }
          setReteniendo(null);
        }}
      />
    </div>
  );
}

function Devoluciones() {
  const pedidos = usePedidosStore((estado) => estado.pedidos);
  const movimientos = usePedidosStore((estado) => estado.movimientos);
  const ajustes = useCompensacionStore((estado) => estado.ajustes);
  const actor = usePersonaSesion();
  const toast = useToast();
  const nombre = useNombre();
  const confirmados = useMemo(() => pedidos.filter((pedido) => pedido.estado === 'confirmada').sort((a, b) => a.id.localeCompare(b.id)), [pedidos]);
  const devueltos = pedidos.filter((pedido) => pedido.estado === 'devuelta');
  const [pedidoId, setPedidoId] = useState(confirmados.find((pedido) => pedido.id === 'DEMO-P03')?.id ?? confirmados[0]?.id ?? '');
  const [previa, setPrevia] = useState<VistaPreviaDevolucion | null>(null);
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const verPrevia = () => {
    const resultado = previsualizarDevolucion(pedidoId);
    if (resultado.ok) {
      setPrevia(resultado.valor);
      setError(null);
    } else setError(resultado.error);
  };
  const confirmar = () => {
    const resultado = registrarDevolucion(pedidoId, actor?.id ?? 'DEMO-U01', motivo);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    toast.exito('Devolución registrada', `${resultado.valor.reversiones.length} reversiones y ${resultado.valor.ajustes.length} ajustes propuestos. El cierre anterior no se reescribe.`);
    setPrevia(null);
    setMotivo('');
    setError(null);
    setPedidoId(confirmados.find((pedido) => pedido.id !== pedidoId)?.id ?? '');
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Tarjeta titulo="Registrar devolución" subtitulo="Pedido, vista previa y confirmación" icono={RotateCcw}>
        <div className="flex flex-col gap-4">
          {error && <EstadoError queOcurrio={error} />}
          <Selector etiqueta="Pedido confirmado" value={pedidoId} onChange={(evento) => { setPedidoId(evento.target.value); setPrevia(null); }} opciones={confirmados.map((pedido) => ({ valor: pedido.id, texto: `${pedido.id} · ${nombre(pedido.compradorId)} · ${formatearMonto(pedido.totalPrecio)} · ${pedido.periodoId}` }))} />
          <Boton variante="secundario" icono={Eye} onClick={verPrevia} disabled={!pedidoId} className="self-start">Vista previa de la reversión</Boton>
          {previa && (
            <div className="flex flex-col gap-3 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 p-3 text-[12.5px]">
              <p className="font-semibold">Movimientos inversos en {previa.periodoReversionId}</p>
              <ul className="flex flex-col gap-1">{previa.reversiones.map((reversion) => <li key={reversion.movimientoOrigenId} className="cifra">{reversion.personaId} · VP {formatearNumero(reversion.vp)} · VC {formatearNumero(reversion.vc)} <span className="font-sans text-texto-2">(origen {reversion.movimientoOrigenId})</span></li>)}</ul>
              <p className="font-semibold">Ajustes de comisión {previa.corridaAfectadaId ? `sobre ${previa.corridaAfectadaId} (cierre ${previa.pedido.periodoId} sin reescribir)` : ''}</p>
              {previa.ajustes.length === 0
                ? <p className="text-texto-2">{previa.corridaAfectadaId ? 'El recálculo no cambia ninguna comisión.' : `El período ${previa.pedido.periodoId} no tiene corrida aprobada: solo se actualiza la proyección.`}</p>
                : <ul className="flex flex-col gap-1">{previa.ajustes.map((ajuste) => <li key={ajuste.id} className="cifra">{ajuste.personaId} · <span className="font-sans">{ajuste.motor ? presentacionMotores[ajuste.motor].nombre : ''}</span> · {formatearMonto(ajuste.monto)}</li>)}</ul>}
              <Campo etiqueta="Motivo de la devolución" value={motivo} onChange={(evento) => setMotivo(evento.target.value)} placeholder="Ejemplo: producto devuelto por el cliente" />
              <ConPermiso modulo="compliance" accion="crear"><Boton icono={Undo2} variante="peligro" onClick={confirmar} className="self-start">Confirmar devolución</Boton></ConPermiso>
            </div>
          )}
        </div>
      </Tarjeta>
      <Tarjeta titulo="Cadena auditable" subtitulo="Pedido, reversión y ajuste" icono={Undo2}>
        {devueltos.length === 0 ? <EstadoVacio icono={Undo2} titulo="Sin devoluciones" /> : (
          <ul className="flex flex-col gap-4">
            {devueltos.map((pedido) => {
              const reversiones = movimientos.filter((movimiento) => movimiento.pedidoId === pedido.id && movimiento.tipo === 'reversion');
              const relacionados = ajustes.filter((ajuste) => ajuste.referenciaId === pedido.id);
              return (
                <li key={pedido.id} className="rounded-xl border border-borde p-3 text-[12.5px]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1"><p className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Pedido</p><Link to={`/pedido/${pedido.id}`} className="cifra inline-flex min-h-11 items-center font-semibold text-acento hover:underline md:min-h-0">{pedido.id}</Link><p className="text-texto-2">{nombre(pedido.compradorId)} · {pedido.periodoId}</p></div>
                    <ArrowRight className="hidden size-4 shrink-0 text-texto-3 sm:mt-5 sm:block" aria-hidden />
                    <div className="min-w-0 flex-1"><p className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Reversión</p>{reversiones.map((movimiento) => <p key={movimiento.id} className="cifra">{movimiento.id} · VP {formatearNumero(movimiento.vp)} · {movimiento.periodoId}</p>)}</div>
                    <ArrowRight className="hidden size-4 shrink-0 text-texto-3 sm:mt-5 sm:block" aria-hidden />
                    <div className="min-w-0 flex-1"><p className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Ajustes</p>{relacionados.length === 0 ? <p className="text-texto-2">Sin ajustes</p> : relacionados.map((ajuste) => <p key={ajuste.id} className="cifra">{ajuste.id} · {formatearMonto(ajuste.monto)} · <span className="font-sans">{estadosAjuste[ajuste.estado].etiqueta}</span></p>)}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Tarjeta>
    </div>
  );
}

function Ajustes() {
  const ajustes = useCompensacionStore((estado) => estado.ajustes);
  const personas = usePersonasStore((estado) => estado.personas);
  const periodos = usePeriodosStore((estado) => estado.periodos);
  const actor = usePersonaSesion();
  const toast = useToast();
  const nombre = useNombre();
  const puedeAutorizar = usePermiso('compliance', 'aprobar');
  const [decidiendo, setDecidiendo] = useState<{ ajuste: Ajuste; decision: 'autorizado' | 'rechazado' } | null>(null);
  const [proponiendo, setProponiendo] = useState(false);

  const columnas: ColumnaTabla<Ajuste>[] = [
    { clave: 'id', titulo: 'Ajuste', principalEnMovil: true, render: (fila) => <div><p className="cifra font-semibold">{fila.id}</p><p className="text-xs text-texto-2">{tiposAjuste[fila.tipo]}{fila.motor ? ` · ${presentacionMotores[fila.motor].nombre}` : ''}</p></div> },
    { clave: 'persona', titulo: 'Afiliado', render: (fila) => nombre(fila.personaId) },
    { clave: 'periodo', titulo: 'Aplica en', render: (fila) => <span className="cifra text-[12.5px]">{fila.periodoId}{fila.periodoAfectadoId ? ` (afecta ${fila.periodoAfectadoId})` : ''}</span> },
    { clave: 'monto', titulo: 'Monto', alinear: 'derecha', valorOrden: (fila) => fila.monto, render: (fila) => <span className={unirClases('cifra font-semibold', fila.monto < 0 && 'text-error')}>{formatearMonto(fila.monto)}</span> },
    { clave: 'motivo', titulo: 'Motivo y soporte', ocultarEnMovil: true, render: (fila) => <span className="text-xs text-texto-2">{fila.motivo}{fila.evidencia ? ` Soporte: ${fila.evidencia}` : ''}</span> },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <div className="flex flex-col items-start gap-0.5"><Insignia tono={estadosAjuste[fila.estado].tono}>{estadosAjuste[fila.estado].etiqueta}</Insignia><span className="cifra text-[11px] text-texto-3">{fila.propuestoPor}{fila.autorizadoPor ? ` / ${fila.autorizadoPor}` : ''}</span></div> },
  ];

  return (
    <div className="flex flex-col gap-3">
      <Tabla
        columnas={columnas}
        filas={[...ajustes].sort((a, b) => b.fecha.localeCompare(a.fecha))}
        claveFila={(fila) => fila.id}
        textoBusqueda={(fila) => `${fila.id} ${fila.personaId} ${nombre(fila.personaId)} ${fila.referenciaId}`}
        placeholderBusqueda="Buscar ajuste, afiliado o pedido"
        accionesCabecera={<ConPermiso modulo="compliance" accion="crear"><Boton tamano="sm" icono={FilePlus2} onClick={() => setProponiendo(true)}>Proponer corrección</Boton></ConPermiso>}
        accionesFila={(fila) => (fila.estado === 'propuesto' && puedeAutorizar ? (
          <div className="flex gap-1">
            <Boton tamano="sm" variante="fantasma" icono={BadgeCheck} onClick={() => setDecidiendo({ ajuste: fila, decision: 'autorizado' })}>Autorizar</Boton>
            <Boton tamano="sm" variante="fantasma" icono={CircleX} onClick={() => setDecidiendo({ ajuste: fila, decision: 'rechazado' })}>Rechazar</Boton>
          </div>
        ) : null)}
      />
      <p className="text-[12px] text-texto-2">El operador propone; autoriza quien tenga el permiso aprobar en Compliance. Un ajuste autorizado se aplica al generar la liquidación del período indicado.</p>
      <Confirmacion
        abierto={Boolean(decidiendo)}
        alCerrar={() => setDecidiendo(null)}
        titulo={decidiendo?.decision === 'autorizado' ? 'Autorizar ajuste' : 'Rechazar ajuste'}
        resumen={decidiendo ? `${decidiendo.ajuste.id} · ${nombre(decidiendo.ajuste.personaId)} · ${formatearMonto(decidiendo.ajuste.monto)}` : ''}
        textoConfirmar={decidiendo?.decision === 'autorizado' ? 'Autorizar' : 'Rechazar'}
        peligro={decidiendo?.decision === 'rechazado'}
        requiereMotivo
        alConfirmar={(motivo) => {
          if (decidiendo) {
            const resultado = resolverAjuste(decidiendo.ajuste.id, decidiendo.decision, actor?.id ?? 'DEMO-U01', motivo);
            if (resultado.ok) toast.exito(decidiendo.decision === 'autorizado' ? 'Ajuste autorizado' : 'Ajuste rechazado', decidiendo.ajuste.id);
            else toast.error('No se pudo resolver', resultado.error);
          }
          setDecidiendo(null);
        }}
      />
      {proponiendo && <FormularioCorreccion personas={personas.filter((persona) => persona.tipo === 'empresario')} periodos={periodos.filter((periodo) => periodo.tipo === 'ciclo' && periodo.estado !== 'cerrado').map((periodo) => periodo.id)} alCerrar={() => setProponiendo(false)} />}
    </div>
  );
}

function FormularioCorreccion({ personas, periodos, alCerrar }: { personas: Persona[]; periodos: string[]; alCerrar: () => void }) {
  const actor = usePersonaSesion();
  const toast = useToast();
  const [personaId, setPersonaId] = useState(personas[0]?.id ?? '');
  const [periodoId, setPeriodoId] = useState(periodos[0] ?? '');
  const [motor, setMotor] = useState<CodigoMotor>('actividad_comercial');
  const [monto, setMonto] = useState('');
  const [motivo, setMotivo] = useState('');
  const [evidencia, setEvidencia] = useState('');
  const [error, setError] = useState<string | null>(null);
  const guardar = () => {
    const valor = Number(monto);
    if (!monto || !Number.isFinite(valor) || valor === 0) {
      setError('Ingresa un monto distinto de cero (negativo para descontar).');
      return;
    }
    const resultado = proponerAjuste({ tipo: 'correccion', personaId, periodoId, referenciaId: `${personaId}-${periodoId}`, monto: valor, vp: 0, vc: 0, motivo, evidencia, propuestoPor: actor?.id ?? 'DEMO-U01', motor });
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    toast.exito('Corrección propuesta', `${resultado.valor.id} queda pendiente de autorización.`);
    alCerrar();
  };
  return (
    <Modal abierto alCerrar={alCerrar} titulo="Proponer corrección excepcional" descripcion="Requiere motivo, soporte y autorización registrada." ancho="md" pie={<><Boton variante="secundario" onClick={alCerrar}>Cancelar</Boton><Boton icono={FilePlus2} onClick={guardar}>Proponer</Boton></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        {error && <div className="sm:col-span-2"><EstadoError queOcurrio={error} /></div>}
        <Selector etiqueta="Afiliado" value={personaId} onChange={(evento) => setPersonaId(evento.target.value)} opciones={personas.map((persona) => ({ valor: persona.id, texto: `${persona.codigo} · ${persona.nombres} ${persona.apellidos}` }))} />
        <Selector etiqueta="Período de aplicación" value={periodoId} onChange={(evento) => setPeriodoId(evento.target.value)} opciones={periodos.map((id) => ({ valor: id, texto: id }))} />
        <Selector etiqueta="Concepto" value={motor} onChange={(evento) => setMotor(evento.target.value as CodigoMotor)} opciones={ordenMotores.map((codigo) => ({ valor: codigo, texto: presentacionMotores[codigo].nombre }))} />
        <Campo etiqueta="Monto (USD)" type="number" step="any" value={monto} onChange={(evento) => setMonto(evento.target.value)} ayuda="Negativo para descontar." />
        <Campo etiqueta="Motivo" value={motivo} onChange={(evento) => setMotivo(evento.target.value)} className="sm:col-span-2" />
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="evidencia-ajuste" className="text-[13px] font-semibold">Soporte (adjunto simulado)</label>
          <input id="evidencia-ajuste" type="file" onChange={(evento) => setEvidencia(evento.target.files?.[0]?.name ?? '')} className="min-h-11 text-[13px] file:mr-3 file:min-h-11 file:rounded-xl file:border file:border-borde file:bg-superficie file:px-3 file:font-semibold" />
          <p className="text-xs text-texto-2">Solo se registra el nombre del archivo; no se sube nada.{evidencia ? ` Seleccionado: ${evidencia}` : ''}</p>
        </div>
        <p className="flex items-center gap-2 text-[12px] text-texto-2 sm:col-span-2"><Wallet className="size-4 text-acento" aria-hidden />Se aplicará al generar la liquidación de {periodoId} si se autoriza.</p>
      </div>
    </Modal>
  );
}
