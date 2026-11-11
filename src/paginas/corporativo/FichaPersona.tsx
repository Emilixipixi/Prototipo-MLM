import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, Award, Gift, History, IdCard, Network, Receipt, RefreshCw, ShoppingCart, UserRound, Users, Workflow,
} from 'lucide-react';
import { DialogoEstadoCuenta } from '../../componentes/demo/DialogoEstadoCuenta';
import { InsigniaRun } from '../../componentes/rangos/InsigniaRun';
import { Avatar } from '../../componentes/ui/Avatar';
import { Boton } from '../../componentes/ui/Boton';
import { ChipBrazo } from '../../componentes/ui/ChipBrazo';
import { ConPermiso } from '../../componentes/ui/ConPermiso';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { EstadoVacio } from '../../componentes/ui/EstadoVacio';
import { Insignia } from '../../componentes/ui/Insignia';
import { Pestanas } from '../../componentes/ui/Pestanas';
import { Tabla, type ColumnaTabla } from '../../componentes/ui/Tabla';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { estadosBono, estadosLiquidacion } from '../../datos/presentacionCompensacion';
import { estadosCuenta, nombresTipo } from '../../datos/presentacionCuentas';
import { estadosPedido } from '../../datos/presentacionEstados';
import { presentacionMotores } from '../../datos/presentacionMotores';
import { nombresPerfiles } from '../../datos/perfiles';
import { useDatosAfiliado } from '../../hooks/useDatosAfiliado';
import { useBitacoraStore } from '../../store/useBitacoraStore';
import { useCompensacionStore } from '../../store/useCompensacionStore';
import type { Bitacora } from '../../tipos/bitacora';
import type { BonoComision, Liquidacion } from '../../tipos/compensacion';
import type { Pedido } from '../../tipos/pedidos';
import { formatearFecha, formatearFechaHora } from '../../utilidades/fechas';
import { formatearMonto, formatearNumero } from '../../utilidades/formatos';

export default function FichaPersona() {
  const { id } = useParams();
  const { fuente, ciclos, calificaciones } = useDatosAfiliado();
  const corridas = useCompensacionStore((estado) => estado.corridas);
  const liquidaciones = useCompensacionStore((estado) => estado.liquidaciones);
  const bitacora = useBitacoraStore((estado) => estado.registros);
  const [pestana, setPestana] = useState('datos');
  const [cambiando, setCambiando] = useState(false);
  const persona = fuente.personas.find((item) => item.id === id);
  const pedidos = useMemo(() => fuente.pedidos.filter((pedido) => pedido.compradorId === id || pedido.referenteId === id).sort((a, b) => b.fecha.localeCompare(a.fecha)), [fuente.pedidos, id]);
  const bonos = useMemo(() => corridas.flatMap((corrida) => corrida.resultados).filter((bono) => bono.personaId === id), [corridas, id]);
  const propias = useMemo(() => liquidaciones.filter((liquidacion) => liquidacion.personaId === id), [liquidaciones, id]);
  const historial = useMemo(() => bitacora.filter((registro) => registro.referenciaId === id || registro.actorId === id || String(registro.referenciaId ?? '').endsWith(String(id).replace('DEMO-', ''))), [bitacora, id]);

  if (!persona) return <EstadoVacio icono={UserRound} titulo="Persona no encontrada" accion={<EnlaceBoton to="/corporativo/usuarios" icono={ArrowLeft}>Volver a usuarios</EnlaceBoton>} />;

  const patrocinio = fuente.patrocinios.find((relacion) => relacion.personaId === persona.id);
  const patrocinador = fuente.personas.find((item) => item.id === (patrocinio?.patrocinadorId ?? persona.referenteId));
  const directos = fuente.patrocinios.filter((relacion) => relacion.patrocinadorId === persona.id).map((relacion) => fuente.personas.find((item) => item.id === relacion.personaId)).filter(Boolean);
  const posicion = fuente.posiciones.find((item) => item.personaId === persona.id && item.estado === 'activa');
  const padre = posicion?.padrePosicionId ? fuente.posiciones.find((item) => item.id === posicion.padrePosicionId) : undefined;
  const estado = estadosCuenta[persona.estado];
  const esEmpresario = persona.tipo === 'empresario';

  const columnasPedidos: ColumnaTabla<Pedido>[] = [
    { clave: 'id', titulo: 'Pedido', principalEnMovil: true, render: (fila) => <Link to={`/pedido/${fila.id}`} className="cifra inline-flex min-h-11 items-center font-semibold text-acento hover:underline md:min-h-0">{fila.id}</Link> },
    { clave: 'fecha', titulo: 'Fecha', valorOrden: (fila) => fila.fecha, render: (fila) => <span className="cifra text-[12.5px]">{formatearFechaHora(fila.fecha)}</span> },
    { clave: 'rol', titulo: 'Relación', render: (fila) => (fila.compradorId === persona.id ? 'Comprador' : 'Referente') },
    { clave: 'total', titulo: 'Total', alinear: 'derecha', render: (fila) => <span className="cifra">{formatearMonto(fila.totalPrecio)}</span> },
    { clave: 'vp', titulo: 'VP / VC', alinear: 'derecha', render: (fila) => <span className="cifra text-[12.5px]">{formatearNumero(fila.totalVp)} / {formatearNumero(fila.totalVc)}</span> },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <Insignia tono={estadosPedido[fila.estado].tono} icono={estadosPedido[fila.estado].icono}>{estadosPedido[fila.estado].etiqueta}</Insignia> },
  ];
  const columnasBonos: ColumnaTabla<BonoComision>[] = [
    { clave: 'corrida', titulo: 'Corrida', principalEnMovil: true, render: (fila) => <span className="cifra text-[12.5px]">{fila.corridaId}</span> },
    { clave: 'motor', titulo: 'Concepto', render: (fila) => presentacionMotores[fila.motor].nombre },
    { clave: 'monto', titulo: 'Monto', alinear: 'derecha', valorOrden: (fila) => fila.monto, render: (fila) => <span className="cifra font-semibold">{formatearMonto(fila.monto)}</span> },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <Insignia tono={estadosBono[fila.estado].tono} icono={estadosBono[fila.estado].icono}>{estadosBono[fila.estado].etiqueta}</Insignia> },
    { clave: 'calculo', titulo: 'Cálculo', ocultarEnMovil: true, render: (fila) => <span className="text-xs text-texto-2">{fila.elegible ? fila.calculo : fila.motivosNoElegible.join('. ')}</span> },
  ];
  const columnasLiquidaciones: ColumnaTabla<Liquidacion>[] = [
    { clave: 'id', titulo: 'Liquidación', principalEnMovil: true, render: (fila) => <span className="cifra text-[12.5px] font-semibold">{fila.id}</span> },
    { clave: 'periodo', titulo: 'Período', render: (fila) => <span className="cifra">{fila.periodoId}</span> },
    { clave: 'total', titulo: 'Total', alinear: 'derecha', render: (fila) => <span className="cifra font-semibold">{formatearMonto(fila.total)}</span> },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <Insignia tono={estadosLiquidacion[fila.estado].tono} icono={estadosLiquidacion[fila.estado].icono}>{estadosLiquidacion[fila.estado].etiqueta}</Insignia> },
    { clave: 'motivo', titulo: 'Observación', ocultarEnMovil: true, render: (fila) => <span className="text-xs text-texto-2">{fila.motivoRetencion ?? '-'}</span> },
  ];
  const columnasHistorial: ColumnaTabla<Bitacora>[] = [
    { clave: 'fecha', titulo: 'Fecha', valorOrden: (fila) => fila.fechaHora, render: (fila) => <span className="cifra text-[12.5px]">{formatearFechaHora(fila.fechaHora)}</span> },
    { clave: 'accion', titulo: 'Acción', principalEnMovil: true, render: (fila) => <span className="font-semibold">{fila.accion}</span> },
    { clave: 'actor', titulo: 'Actor', render: (fila) => <span className="cifra text-[12.5px]">{fila.actorId}</span> },
    { clave: 'motivo', titulo: 'Motivo', render: (fila) => <span className="text-xs text-texto-2">{fila.motivo || '-'}</span> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Link to="/corporativo/usuarios" className="inline-flex min-h-11 w-fit items-center gap-1.5 text-[13px] font-semibold text-acento hover:underline"><ArrowLeft className="size-4" aria-hidden />Usuarios</Link>
      <Tarjeta>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar nombres={persona.nombres} apellidos={persona.apellidos} tamano="lg" />
            <div className="min-w-0">
              <h2 className="truncate text-xl font-extrabold tracking-tight">{persona.nombres} {persona.apellidos}</h2>
              <p className="cifra text-[13px] text-texto-2">{persona.codigo} · <span className="font-sans">{nombresTipo[persona.tipo]} · {nombresPerfiles[persona.perfil]}</span></p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <Insignia tono={estado.tono} icono={estado.icono}>{estado.etiqueta}</Insignia>
            {esEmpresario && <EnlaceBoton to={`/corporativo/arboles?persona=${persona.id}`} tamano="sm" variante="secundario" icono={Workflow}>Ver en árboles</EnlaceBoton>}
            <ConPermiso modulo="usuarios" accion="editar"><Boton tamano="sm" icono={RefreshCw} onClick={() => setCambiando(true)}>Cambiar estado</Boton></ConPermiso>
          </div>
        </div>
        <p className="mt-3 rounded-xl bg-fondo px-3 py-2 text-[12.5px] text-texto-2"><strong className="text-texto">Efecto del estado:</strong> {estado.efecto}</p>
      </Tarjeta>

      <Pestanas
        etiqueta="Secciones de la ficha"
        activa={pestana}
        alCambiar={setPestana}
        pestanas={[
          { id: 'datos', texto: 'Datos', icono: IdCard },
          { id: 'patrocinio', texto: 'Patrocinio', icono: Users },
          { id: 'posicion', texto: 'Posición Trinaria', icono: Network },
          { id: 'compras', texto: 'Compras', icono: ShoppingCart, contador: pedidos.length },
          { id: 'run', texto: 'RUN', icono: Award },
          { id: 'bonos', texto: 'Bonos', icono: Gift, contador: bonos.length },
          { id: 'liquidaciones', texto: 'Liquidaciones', icono: Receipt, contador: propias.length },
          { id: 'historial', texto: 'Historial', icono: History, contador: historial.length },
        ]}
      />

      {pestana === 'datos' && (
        <Tarjeta titulo="Datos de la cuenta" icono={IdCard}>
          <dl className="grid gap-4 text-[13.5px] sm:grid-cols-2 lg:grid-cols-3">
            {[['Correo', persona.correo], ['Teléfono', persona.telefono], ['Documento', persona.documento], ['País', persona.pais], ['Moneda', persona.moneda], ['Idioma', persona.idioma], ['Alta', formatearFecha(persona.fechaAlta)], ['Tipo', nombresTipo[persona.tipo]], ['Perfil', nombresPerfiles[persona.perfil]]].map(([etiqueta, valor]) => (
              <div key={etiqueta}><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">{etiqueta}</dt><dd className="mt-0.5 break-words font-medium">{valor}</dd></div>
            ))}
          </dl>
        </Tarjeta>
      )}
      {pestana === 'patrocinio' && (
        <Tarjeta titulo="Genealogía de patrocinio" icono={Users}>
          <p className="text-[13.5px]"><span className="text-texto-2">{esEmpresario ? 'Patrocinador' : 'Referente'}:</span> <strong>{patrocinador ? `${patrocinador.nombres} ${patrocinador.apellidos} (${patrocinador.codigo})` : 'Sin asignar'}</strong></p>
          {patrocinio && <p className="mt-1 text-[12.5px] text-texto-2">Relación registrada el {formatearFecha(patrocinio.fechaRelacion)}.</p>}
          <h4 className="mt-4 text-[13px] font-bold">Directos ({directos.length})</h4>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {directos.map((directo) => directo && <li key={directo.id}><Link to={`/corporativo/usuarios/${directo.id}`} className="flex min-h-11 items-center gap-2 rounded-xl border border-borde px-3 py-2 text-[13px] hover:border-acento"><Avatar nombres={directo.nombres} apellidos={directo.apellidos} tamano="sm" />{directo.nombres} {directo.apellidos}<span className="cifra ml-auto text-xs text-texto-2">{directo.codigo}</span></Link></li>)}
          </ul>
          {patrocinio && patrocinio.historial.length > 0 && (
            <>
              <h4 className="mt-4 text-[13px] font-bold">Historial de patrocinio</h4>
              <ul className="mt-2 flex flex-col gap-1.5 text-[12.5px] text-texto-2">{patrocinio.historial.map((cambio, indice) => <li key={indice} className="cifra">{formatearFechaHora(cambio.fecha)} · {cambio.actorId} · <span className="font-sans">{cambio.motivo}</span></li>)}</ul>
            </>
          )}
        </Tarjeta>
      )}
      {pestana === 'posicion' && (
        <Tarjeta titulo="Posición en la red Trinaria" icono={Network}>
          {posicion ? (
            <>
              <dl className="grid gap-4 text-[13.5px] sm:grid-cols-3">
                <div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Posición</dt><dd className="cifra mt-0.5 font-semibold">{posicion.id} · versión {posicion.version}</dd></div>
                <div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Padre de posición</dt><dd className="mt-0.5 font-semibold">{padre ? `${padre.personaId} (${padre.id})` : 'Raíz'}</dd></div>
                <div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Brazo</dt><dd className="mt-0.5">{posicion.brazo ? <ChipBrazo brazo={posicion.brazo} /> : '-'}</dd></div>
              </dl>
              <h4 className="mt-4 text-[13px] font-bold">Historial estructural</h4>
              <ul className="mt-2 flex flex-col gap-1.5 text-[12.5px] text-texto-2">{posicion.cambios.map((cambio, indice) => <li key={indice} className="cifra">{formatearFechaHora(cambio.fecha)} · {cambio.actorId} · <span className="font-sans">{cambio.motivo}</span></li>)}</ul>
            </>
          ) : <EstadoVacio icono={Network} titulo="Sin posición Trinaria" texto={esEmpresario ? 'Asígnala desde Árboles, en el panel de colocación administrativa.' : 'Solo los empresarios ocupan posiciones en la red.'} accion={esEmpresario ? <EnlaceBoton to={`/corporativo/arboles?persona=${persona.id}`} icono={Workflow}>Ir a Árboles</EnlaceBoton> : undefined} />}
        </Tarjeta>
      )}
      {pestana === 'compras' && <Tabla columnas={columnasPedidos} filas={pedidos} claveFila={(fila) => fila.id} textoVacio="Sin compras asociadas." />}
      {pestana === 'run' && (
        <Tarjeta titulo="Calificación por ciclo" icono={Award}>
          {!esEmpresario ? <p className="text-[13px] text-texto-2">Solo los empresarios califican a rangos RUN.</p> : (
            <ul className="divide-y divide-borde">
              {ciclos.map((ciclo) => {
                const item = calificaciones[ciclo.id]?.find((calificacion) => calificacion.personaId === persona.id);
                return (
                  <li key={ciclo.id} className="flex flex-wrap items-center gap-3 py-3">
                    <span className="cifra w-24 font-semibold">{ciclo.id}</span>
                    <Insignia tono={ciclo.estado === 'cerrado' ? 'neutra' : 'info'}>{ciclo.estado === 'cerrado' ? 'Cerrado' : 'Proyección'}</Insignia>
                    <InsigniaRun run={item?.runCobro ?? null} tipo="cobro" />
                    <InsigniaRun run={item?.runHistorico ?? null} tipo="historico" />
                    <span className="cifra ml-auto text-[12.5px] text-texto-2">VP grupal {formatearNumero(item?.vpGrupal ?? 0)} · personal {formatearNumero(item?.vpPersonal ?? 0)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Tarjeta>
      )}
      {pestana === 'bonos' && <Tabla columnas={columnasBonos} filas={bonos} claveFila={(fila) => fila.id} textoVacio="Sin partidas en corridas registradas." />}
      {pestana === 'liquidaciones' && <Tabla columnas={columnasLiquidaciones} filas={propias} claveFila={(fila) => fila.id} textoVacio="Sin liquidaciones." />}
      {pestana === 'historial' && <Tabla columnas={columnasHistorial} filas={historial} claveFila={(fila) => fila.id} textoVacio="Sin registros en la bitácora para esta persona." />}
      {cambiando && <DialogoEstadoCuenta persona={persona} alCerrar={() => setCambiando(false)} />}
    </div>
  );
}
