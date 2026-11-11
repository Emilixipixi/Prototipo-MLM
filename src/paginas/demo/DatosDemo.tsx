import { useMemo, useState } from 'react';
import {
  BadgeCheck, CalendarRange, Calculator, CircleCheck, CircleX, Database, Network, Receipt, ShoppingCart, TriangleAlert,
} from 'lucide-react';
import { LeyendaDemostracion } from '../../componentes/demo/LeyendaDemostracion';
import { Insignia, type TonoInsignia } from '../../componentes/ui/Insignia';
import { Pestanas } from '../../componentes/ui/Pestanas';
import { Selector } from '../../componentes/ui/Selector';
import { Tabla, type ColumnaTabla } from '../../componentes/ui/Tabla';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { TarjetaKpi } from '../../componentes/ui/TarjetaKpi';
import { verificarConsistencia, type Verificacion } from '../../datos/verificarConsistencia';
import { calcularCalificaciones } from '../../motores/motorRangos';
import { construirContexto, type FuenteDatos } from '../../servicios/contexto';
import { useCompensacionStore } from '../../store/useCompensacionStore';
import { useFormacionStore } from '../../store/useFormacionStore';
import { usePedidosStore } from '../../store/usePedidosStore';
import { usePeriodosStore } from '../../store/usePeriodosStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import { useRedStore } from '../../store/useRedStore';
import type { CalificacionRun } from '../../tipos/calificacion';
import type { Ajuste, BonoComision, Liquidacion } from '../../tipos/compensacion';
import type { MovimientoVolumen, Pedido } from '../../tipos/pedidos';
import type { Persona } from '../../tipos/persona';
import { formatearFecha, formatearFechaHora } from '../../utilidades/fechas';
import { formatearMonto, formatearNumero } from '../../utilidades/formatos';

const tonoEstado: Record<string, TonoInsignia> = {
  activo: 'exito', confirmada: 'exito', aprobada: 'exito', cerrado: 'neutra', liquidada_simulada: 'exito', apta_para_desembolso: 'acento', autorizado: 'acento', aplicado: 'exito',
  pendiente: 'advertencia', en_revision: 'advertencia', abierto: 'info', programado: 'neutra', estimada: 'info', propuesto: 'advertencia',
  suspendido: 'retenida', retenida: 'retenida', bloqueado: 'error', cancelada: 'neutra', devuelta: 'error', liquidada: 'exito',
};

function Estado({ valor }: { valor: string }) {
  return <Insignia tono={tonoEstado[valor] ?? 'neutra'}>{valor.replace(/_/g, ' ')}</Insignia>;
}

function Codigo({ valor }: { valor: string | null }) {
  return <span className="cifra text-[12.5px]">{valor ?? '-'}</span>;
}

export default function DatosDemo() {
  const [pestana, setPestana] = useState('verificacion');
  const [periodoId, setPeriodoId] = useState('DEMO-C01');
  const personas = usePersonasStore((estado) => estado.personas);
  const { patrocinios, posiciones } = useRedStore();
  const { pedidos, movimientos } = usePedidosStore();
  const { periodos, versiones } = usePeriodosStore();
  const { corridas, liquidaciones, ajustes, calificacionesCerradas, saldosCerrados } = useCompensacionStore();
  const formacion = useFormacionStore((estado) => estado.estados);

  const fuente = useMemo<FuenteDatos>(() => ({
    personas, patrocinios, posiciones, movimientos, pedidos, formacion, periodos, versiones, calificacionesCerradas, saldosCerrados,
  }), [personas, patrocinios, posiciones, movimientos, pedidos, formacion, periodos, versiones, calificacionesCerradas, saldosCerrados]);
  const verificaciones = useMemo(() => verificarConsistencia(fuente, corridas), [fuente, corridas]);
  const calificaciones = useMemo(() => {
    const cerradas = fuente.calificacionesCerradas.filter((item) => item.periodoId === periodoId);
    return cerradas.length > 0 ? cerradas : calcularCalificaciones(construirContexto(fuente, periodoId));
  }, [fuente, periodoId]);
  const bonos = useMemo(() => corridas.flatMap((corrida) => corrida.resultados), [corridas]);
  const correctas = verificaciones.filter((item) => item.ok).length;

  const nombre = (id: string | null) => {
    const persona = personas.find((item) => item.id === id);
    return persona ? `${persona.nombres} ${persona.apellidos}` : id ?? '-';
  };

  const columnasVerificacion: ColumnaTabla<Verificacion>[] = [
    { clave: 'ok', titulo: 'Resultado', render: (fila) => (fila.ok ? <Insignia tono="exito" icono={CircleCheck}>Correcto</Insignia> : <Insignia tono="error" icono={CircleX}>Diferencia</Insignia>) },
    { clave: 'nombre', titulo: 'Verificación', render: (fila) => <span className="font-semibold">{fila.nombre}</span>, principalEnMovil: true },
    { clave: 'detalle', titulo: 'Detalle', render: (fila) => <span className="text-texto-2">{fila.detalle}</span> },
  ];

  const columnasPersonas: ColumnaTabla<Persona>[] = [
    { clave: 'id', titulo: 'Código', render: (fila) => <Codigo valor={fila.id} />, valorOrden: (fila) => fila.id },
    { clave: 'nombre', titulo: 'Nombre', render: (fila) => <span className="font-semibold">{fila.nombres} {fila.apellidos}</span>, valorOrden: (fila) => fila.nombres, principalEnMovil: true },
    { clave: 'tipo', titulo: 'Tipo', render: (fila) => fila.tipo, valorOrden: (fila) => fila.tipo },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <Estado valor={fila.estado} /> },
    { clave: 'patrocinador', titulo: 'Patrocinador / referente', render: (fila) => <Codigo valor={patrocinios.find((item) => item.personaId === fila.id)?.patrocinadorId ?? fila.referenteId} /> },
    {
      clave: 'posicion', titulo: 'Posición (padre / brazo)', render: (fila) => {
        const posicion = posiciones.find((item) => item.personaId === fila.id && item.estado === 'activa');
        if (!posicion) return <span className="text-texto-3">Sin posición</span>;
        const padre = posiciones.find((item) => item.id === posicion.padrePosicionId);
        return <span className="cifra text-[12.5px]">{posicion.id} {padre ? `/ ${padre.personaId} / ${posicion.brazo}` : '/ raíz'}</span>;
      },
    },
  ];

  const columnasPedidos: ColumnaTabla<Pedido>[] = [
    { clave: 'id', titulo: 'Pedido', render: (fila) => <Codigo valor={fila.id} />, valorOrden: (fila) => fila.id, principalEnMovil: true },
    { clave: 'fecha', titulo: 'Fecha', render: (fila) => <span className="cifra text-[12.5px]">{formatearFechaHora(fila.fecha)}</span>, valorOrden: (fila) => fila.fecha },
    { clave: 'comprador', titulo: 'Comprador', render: (fila) => nombre(fila.compradorId), valorOrden: (fila) => fila.compradorId },
    { clave: 'periodo', titulo: 'Período', render: (fila) => <Codigo valor={fila.periodoId} />, valorOrden: (fila) => fila.periodoId },
    { clave: 'precio', titulo: 'Precio', alinear: 'derecha', render: (fila) => <span className="cifra">{formatearMonto(fila.totalPrecio)}</span>, valorOrden: (fila) => fila.totalPrecio },
    { clave: 'vp', titulo: 'VP', alinear: 'derecha', render: (fila) => <span className="cifra">{formatearNumero(fila.totalVp)}</span>, valorOrden: (fila) => fila.totalVp },
    { clave: 'vc', titulo: 'VC', alinear: 'derecha', render: (fila) => <span className="cifra">{formatearNumero(fila.totalVc)}</span>, valorOrden: (fila) => fila.totalVc },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <Estado valor={fila.estado} />, valorOrden: (fila) => fila.estado },
  ];

  const columnasMovimientos: ColumnaTabla<MovimientoVolumen>[] = [
    { clave: 'id', titulo: 'Movimiento', render: (fila) => <Codigo valor={fila.id} />, valorOrden: (fila) => fila.id, principalEnMovil: true },
    { clave: 'tipo', titulo: 'Tipo', render: (fila) => <Insignia tono={fila.tipo === 'origen' ? 'acento' : 'error'}>{fila.tipo}</Insignia>, valorOrden: (fila) => fila.tipo },
    { clave: 'pedido', titulo: 'Pedido', render: (fila) => <Codigo valor={fila.pedidoId} /> },
    { clave: 'persona', titulo: 'Asignado a', render: (fila) => <Codigo valor={fila.personaId} />, valorOrden: (fila) => fila.personaId },
    { clave: 'periodo', titulo: 'Período', render: (fila) => <Codigo valor={fila.periodoId} />, valorOrden: (fila) => fila.periodoId },
    { clave: 'vp', titulo: 'VP', alinear: 'derecha', render: (fila) => <span className="cifra">{formatearNumero(fila.vp)}</span>, valorOrden: (fila) => fila.vp },
    { clave: 'vc', titulo: 'VC', alinear: 'derecha', render: (fila) => <span className="cifra">{formatearNumero(fila.vc)}</span>, valorOrden: (fila) => fila.vc },
  ];

  const columnasCalificaciones: ColumnaTabla<CalificacionRun>[] = [
    { clave: 'persona', titulo: 'Afiliado', render: (fila) => <span><span className="font-semibold">{nombre(fila.personaId)}</span> <Codigo valor={fila.personaId} /></span>, valorOrden: (fila) => fila.personaId, principalEnMovil: true },
    { clave: 'cobro', titulo: 'RUN de Cobro', render: (fila) => (fila.runCobro ? <Insignia tono="primaria">{fila.runCobro}</Insignia> : <span className="text-texto-3">Sin rango</span>) },
    { clave: 'historico', titulo: 'RUN Histórico', render: (fila) => (fila.runHistorico ? <Insignia tono="oro">{fila.runHistorico}</Insignia> : <span className="text-texto-3">-</span>) },
    { clave: 'personal', titulo: 'VP personal', alinear: 'derecha', render: (fila) => <span className="cifra">{formatearNumero(fila.vpPersonal)}</span>, valorOrden: (fila) => fila.vpPersonal },
    { clave: 'grupal', titulo: 'VP grupal', alinear: 'derecha', render: (fila) => <span className="cifra">{formatearNumero(fila.vpGrupal)}</span>, valorOrden: (fila) => fila.vpGrupal },
    { clave: 'siguiente', titulo: 'Siguiente', render: (fila) => <Codigo valor={fila.siguienteRun} /> },
  ];

  const columnasBonos: ColumnaTabla<BonoComision>[] = [
    { clave: 'corrida', titulo: 'Corrida', render: (fila) => <Codigo valor={fila.corridaId} />, valorOrden: (fila) => fila.corridaId },
    { clave: 'persona', titulo: 'Afiliado', render: (fila) => <Codigo valor={fila.personaId} />, valorOrden: (fila) => fila.personaId, principalEnMovil: true },
    { clave: 'motor', titulo: 'Motor', render: (fila) => fila.motor.replace(/_/g, ' '), valorOrden: (fila) => fila.motor },
    { clave: 'monto', titulo: 'Monto', alinear: 'derecha', render: (fila) => <span className="cifra">{formatearMonto(fila.monto)}</span>, valorOrden: (fila) => fila.monto },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <Estado valor={fila.estado} /> },
    { clave: 'calculo', titulo: 'Cálculo', ocultarEnMovil: true, render: (fila) => <span className="text-xs text-texto-2">{fila.elegible ? fila.calculo : fila.motivosNoElegible.join('. ')}</span> },
  ];

  const columnasLiquidaciones: ColumnaTabla<Liquidacion>[] = [
    { clave: 'id', titulo: 'Liquidación', render: (fila) => <Codigo valor={fila.id} />, principalEnMovil: true },
    { clave: 'persona', titulo: 'Afiliado', render: (fila) => nombre(fila.personaId), valorOrden: (fila) => fila.personaId },
    { clave: 'periodo', titulo: 'Período', render: (fila) => <Codigo valor={fila.periodoId} />, valorOrden: (fila) => fila.periodoId },
    { clave: 'total', titulo: 'Total', alinear: 'derecha', render: (fila) => <span className="cifra font-semibold">{formatearMonto(fila.total)}</span>, valorOrden: (fila) => fila.total },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <Estado valor={fila.estado} /> },
  ];

  const columnasAjustes: ColumnaTabla<Ajuste>[] = [
    { clave: 'id', titulo: 'Ajuste', render: (fila) => <Codigo valor={fila.id} />, principalEnMovil: true },
    { clave: 'persona', titulo: 'Afiliado', render: (fila) => <Codigo valor={fila.personaId} /> },
    { clave: 'referencia', titulo: 'Referencia', render: (fila) => <Codigo valor={fila.referenciaId} /> },
    { clave: 'motor', titulo: 'Motor', render: (fila) => (fila.motor ?? '-').replace(/_/g, ' ') },
    { clave: 'periodos', titulo: 'Afecta / se aplica en', render: (fila) => <span className="cifra text-[12.5px]">{fila.periodoAfectadoId ?? '-'} / {fila.periodoId}</span> },
    { clave: 'monto', titulo: 'Monto', alinear: 'derecha', render: (fila) => <span className="cifra">{formatearMonto(fila.monto)}</span> },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <Estado valor={fila.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <LeyendaDemostracion variante="bloque" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <TarjetaKpi etiqueta="Verificaciones correctas" valor={`${correctas}/${verificaciones.length}`} icono={correctas === verificaciones.length ? BadgeCheck : TriangleAlert} tono={correctas === verificaciones.length ? 'exito' : 'error'} />
        <TarjetaKpi etiqueta="Personas" valor={personas.length} icono={Network} tono="primario" />
        <TarjetaKpi etiqueta="Pedidos / movimientos" valor={`${pedidos.length} / ${movimientos.length}`} icono={ShoppingCart} tono="acento" />
        <TarjetaKpi etiqueta="Corridas / liquidaciones" valor={`${corridas.length} / ${liquidaciones.length}`} icono={Receipt} tono="oro" />
      </div>
      <Pestanas
        etiqueta="Secciones de datos"
        activa={pestana}
        alCambiar={setPestana}
        pestanas={[
          { id: 'verificacion', texto: 'Verificación', icono: BadgeCheck },
          { id: 'personas', texto: 'Personas y red', icono: Network, contador: personas.length },
          { id: 'pedidos', texto: 'Pedidos', icono: ShoppingCart, contador: pedidos.length },
          { id: 'movimientos', texto: 'Movimientos VP/VC', icono: Database, contador: movimientos.length },
          { id: 'periodos', texto: 'Períodos y reglas', icono: CalendarRange },
          { id: 'calificaciones', texto: 'Calificaciones RUN', icono: BadgeCheck },
          { id: 'compensacion', texto: 'Corridas y liquidaciones', icono: Calculator },
        ]}
      />
      {pestana === 'verificacion' && <Tabla columnas={columnasVerificacion} filas={verificaciones} claveFila={(fila) => fila.nombre} porPagina={20} />}
      {pestana === 'personas' && <Tabla columnas={columnasPersonas} filas={personas} claveFila={(fila) => fila.id} textoBusqueda={(fila) => `${fila.id} ${fila.nombres} ${fila.apellidos} ${fila.tipo} ${fila.estado}`} placeholderBusqueda="Buscar persona" porPagina={12} />}
      {pestana === 'pedidos' && <Tabla columnas={columnasPedidos} filas={pedidos} claveFila={(fila) => fila.id} textoBusqueda={(fila) => `${fila.id} ${fila.compradorId} ${nombre(fila.compradorId)} ${fila.estado} ${fila.periodoId} ${fila.comprobante}`} placeholderBusqueda="Buscar pedido, persona o estado" />}
      {pestana === 'movimientos' && <Tabla columnas={columnasMovimientos} filas={movimientos} claveFila={(fila) => fila.id} textoBusqueda={(fila) => `${fila.id} ${fila.pedidoId} ${fila.personaId} ${fila.periodoId} ${fila.tipo}`} placeholderBusqueda="Buscar movimiento, pedido o persona" />}
      {pestana === 'periodos' && (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
          <Tarjeta titulo="Períodos" icono={CalendarRange}>
            <ul className="divide-y divide-borde">
              {periodos.map((periodo) => (
                <li key={periodo.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <span><span className="font-semibold">{periodo.nombre}</span><span className="block text-xs text-texto-2">{formatearFecha(periodo.fechaInicio)} - {formatearFecha(periodo.fechaFin)} · {periodo.duracionDias} días · {periodo.versionReglasId}</span></span>
                  <Estado valor={periodo.estado} />
                </li>
              ))}
            </ul>
          </Tarjeta>
          <Tarjeta titulo="Versiones de reglas" icono={Calculator}>
            <ul className="divide-y divide-borde">
              {versiones.map((version) => (
                <li key={version.id} className="py-2.5">
                  <p className="font-semibold"><span className="cifra">{version.id}</span> · vigente desde {formatearFecha(version.vigenteDesde)}{version.vigenteHasta ? ` hasta ${formatearFecha(version.vigenteHasta)}` : ''}</p>
                  <p className="text-xs text-texto-2">{version.motivo} · {version.rangos.length} rangos · {version.motores.length} motores</p>
                </li>
              ))}
            </ul>
          </Tarjeta>
        </div>
      )}
      {pestana === 'calificaciones' && (
        <div className="flex flex-col gap-3">
          <Selector
            etiqueta="Período"
            className="max-w-xs"
            value={periodoId}
            onChange={(evento) => setPeriodoId(evento.target.value)}
            opciones={periodos.filter((periodo) => periodo.tipo === 'ciclo' && periodo.estado !== 'programado').map((periodo) => ({ valor: periodo.id, texto: `${periodo.id} (${periodo.estado})` }))}
          />
          <Tabla columnas={columnasCalificaciones} filas={calificaciones} claveFila={(fila) => fila.id} porPagina={20} />
        </div>
      )}
      {pestana === 'compensacion' && (
        <div className="flex flex-col gap-5">
          <Tabla columnas={columnasBonos} filas={bonos} claveFila={(fila) => fila.id} textoBusqueda={(fila) => `${fila.corridaId} ${fila.personaId} ${fila.motor} ${fila.estado}`} placeholderBusqueda="Buscar partida" />
          <Tabla columnas={columnasLiquidaciones} filas={liquidaciones} claveFila={(fila) => fila.id} textoBusqueda={(fila) => `${fila.id} ${fila.personaId} ${fila.estado}`} placeholderBusqueda="Buscar liquidación" />
          <Tabla columnas={columnasAjustes} filas={ajustes} claveFila={(fila) => fila.id} />
        </div>
      )}
    </div>
  );
}
