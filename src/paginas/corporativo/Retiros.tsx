import { useMemo, useState } from 'react';
import { BadgeCheck, Banknote, CircleX, Info, Landmark, ShieldCheck, Wallet } from 'lucide-react';
import { BarraExportar } from '../../componentes/ui/BarraExportar';
import { Boton } from '../../componentes/ui/Boton';
import { ChipsFiltro } from '../../componentes/ui/ChipsFiltro';
import { Confirmacion } from '../../componentes/ui/Confirmacion';
import { ConPermiso } from '../../componentes/ui/ConPermiso';
import { Insignia } from '../../componentes/ui/Insignia';
import { Pestanas } from '../../componentes/ui/Pestanas';
import { Tabla, type ColumnaTabla } from '../../componentes/ui/Tabla';
import { TarjetaKpi } from '../../componentes/ui/TarjetaKpi';
import { useToast } from '../../componentes/ui/useToast';
import { estadosCuenta } from '../../datos/presentacionCuentas';
import { estadosDatosCobro, estadosRetiro } from '../../datos/presentacionCompensacionCorporativa';
import { usePermiso } from '../../hooks/usePermiso';
import { describirDestino, pagarRetiro, resolverRetiro, verificarDatosCobro } from '../../servicios/cobros';
import { useCobrosStore } from '../../store/useCobrosStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { DatosCobro, EstadoRetiro, SolicitudRetiro } from '../../tipos/cobros';
import { formatearFechaHora } from '../../utilidades/fechas';
import { formatearMonto, redondear } from '../../utilidades/formatos';

type Pendiente = { tipo: 'rechazar_retiro'; solicitud: SolicitudRetiro } | { tipo: 'rechazar_datos'; datos: DatosCobro };

export default function Retiros() {
  const solicitudes = useCobrosStore((estado) => estado.solicitudes);
  const datos = useCobrosStore((estado) => estado.datos);
  const personas = usePersonasStore((estado) => estado.personas);
  const actor = usePersonaSesion();
  const toast = useToast();
  const puedeAprobar = usePermiso('liquidaciones', 'aprobar');
  const puedeLiquidar = usePermiso('liquidaciones', 'liquidar');
  const [pestana, setPestana] = useState('solicitudes');
  const [filtro, setFiltro] = useState<EstadoRetiro | 'todos'>('todos');
  const [pendiente, setPendiente] = useState<Pendiente | null>(null);
  const idActor = actor?.id ?? 'DEMO-U01';
  const persona = (id: string) => personas.find((item) => item.id === id);
  const nombre = (id: string) => {
    const encontrada = persona(id);
    return encontrada ? `${encontrada.nombres} ${encontrada.apellidos}` : id;
  };
  const filas = useMemo(() => [...solicitudes].filter((solicitud) => filtro === 'todos' || solicitud.estado === filtro).sort((a, b) => b.fechaSolicitud.localeCompare(a.fechaSolicitud)), [solicitudes, filtro]);
  const suma = (estado: EstadoRetiro) => redondear(solicitudes.filter((solicitud) => solicitud.estado === estado).reduce((total, solicitud) => total + solicitud.monto, 0));
  const porVerificar = datos.filter((item) => item.estado === 'pendiente_verificacion').length;
  const informar = (resultado: { ok: true } | { ok: false; error: string }, titulo: string, detalle?: string) => {
    if (resultado.ok) toast.exito(titulo, detalle);
    else toast.error('No se pudo completar', resultado.error);
  };

  const columnasSolicitudes: ColumnaTabla<SolicitudRetiro>[] = [
    { clave: 'persona', titulo: 'Afiliado', principalEnMovil: true, render: (fila) => <div><p className="font-semibold">{nombre(fila.personaId)}</p><p className="cifra text-xs text-texto-2">{fila.id} · {formatearFechaHora(fila.fechaSolicitud)}</p></div> },
    { clave: 'monto', titulo: 'Monto', alinear: 'derecha', valorOrden: (fila) => fila.monto, render: (fila) => <span className="cifra whitespace-nowrap font-semibold">{formatearMonto(fila.monto)}</span> },
    { clave: 'destino', titulo: 'Destino', ocultarEnMovil: true, render: (fila) => <span className="text-[12px] text-texto-2">{fila.destino}</span> },
    { clave: 'liquidaciones', titulo: 'Liquidaciones', ocultarEnMovil: true, render: (fila) => <span className="cifra text-[12px] text-texto-2">{fila.liquidacionIds.join(', ')}</span> },
    { clave: 'cuenta', titulo: 'Cuenta', render: (fila) => { const encontrada = persona(fila.personaId); return encontrada ? <Insignia tono={estadosCuenta[encontrada.estado].tono}>{estadosCuenta[encontrada.estado].etiqueta}</Insignia> : '-'; } },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <div className="flex flex-col items-start gap-1"><Insignia tono={estadosRetiro[fila.estado].tono} icono={estadosRetiro[fila.estado].icono}>{estadosRetiro[fila.estado].etiqueta}</Insignia>{fila.motivoRechazo && <span className="text-[11.5px] text-texto-2">{fila.motivoRechazo}</span>}{fila.comprobante && <span className="cifra text-[11.5px] text-texto-2">{fila.comprobante}</span>}</div> },
  ];
  const columnasDatos: ColumnaTabla<DatosCobro>[] = [
    { clave: 'persona', titulo: 'Afiliado', principalEnMovil: true, render: (fila) => <div><p className="font-semibold">{nombre(fila.personaId)}</p><p className="cifra text-xs text-texto-2">{fila.personaId}</p></div> },
    { clave: 'destino', titulo: 'Destino', render: (fila) => <span className="text-[12.5px]">{describirDestino(fila)}</span> },
    { clave: 'titular', titulo: 'Titular', render: (fila) => { const encontrada = persona(fila.personaId); const coincide = encontrada && encontrada.documento === fila.documentoTitular; return <div className="text-[12.5px]"><p>{fila.titular}</p><p className={coincide ? 'cifra text-exito' : 'cifra text-advertencia'}>{fila.documentoTitular} · {coincide ? 'coincide con la cuenta' : 'no coincide con la cuenta'}</p></div>; } },
    { clave: 'fecha', titulo: 'Actualizado', render: (fila) => <span className="cifra text-[12px]">{formatearFechaHora(fila.fechaActualizacion)}</span> },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <div className="flex flex-col items-start gap-1"><Insignia tono={estadosDatosCobro[fila.estado].tono} icono={estadosDatosCobro[fila.estado].icono}>{estadosDatosCobro[fila.estado].etiqueta}</Insignia>{fila.observacion && <span className="text-[11.5px] text-texto-2">{fila.observacion}</span>}</div> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <p className="flex items-start gap-2 rounded-xl bg-acento-suave px-3 py-2.5 text-[12.5px] text-[#155E75]">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        El afiliado registra sus datos de cobro y solicita el retiro de sus liquidaciones aptas para desembolso. Aquí se verifican los datos, se aprueba o rechaza cada solicitud y se registra el pago. Todo es simulado: no hay transferencias.
      </p>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaKpi etiqueta="Por aprobar" valor={<span className="cifra">{formatearMonto(suma('solicitada'))}</span>} icono={Banknote} tono="oro" />
        <TarjetaKpi etiqueta="Aprobado por pagar" valor={<span className="cifra">{formatearMonto(suma('aprobada'))}</span>} icono={BadgeCheck} tono="acento" />
        <TarjetaKpi etiqueta="Pagado (simulado)" valor={<span className="cifra">{formatearMonto(suma('pagada_simulada'))}</span>} icono={Wallet} tono="exito" />
        <TarjetaKpi etiqueta="Datos por verificar" valor={<span className="cifra">{porVerificar}</span>} icono={ShieldCheck} tono="primario" />
      </div>
      <Pestanas etiqueta="Secciones" activa={pestana} alCambiar={setPestana} pestanas={[{ id: 'solicitudes', texto: 'Solicitudes de retiro', icono: Banknote, contador: solicitudes.filter((solicitud) => solicitud.estado === 'solicitada').length }, { id: 'datos', texto: 'Datos de cobro', icono: Landmark, contador: porVerificar }]} />
      {pestana === 'solicitudes' ? (
        <Tabla
          columnas={columnasSolicitudes}
          filas={filas}
          claveFila={(fila) => fila.id}
          textoBusqueda={(fila) => `${fila.id} ${fila.personaId} ${nombre(fila.personaId)}`}
          placeholderBusqueda="Buscar afiliado o solicitud"
          textoVacio="No hay solicitudes con este filtro."
          filtros={<ChipsFiltro etiqueta="Estado" activo={filtro} alCambiar={setFiltro} opciones={[{ valor: 'todos', texto: 'Todas' }, ...(Object.keys(estadosRetiro) as EstadoRetiro[]).map((estado) => ({ valor: estado, texto: estadosRetiro[estado].etiqueta }))]} />}
          accionesCabecera={<BarraExportar modulo="liquidaciones" nombreArchivo="DEMO-retiros" filas={() => filas.map((fila) => ({ solicitud: fila.id, afiliado: fila.personaId, nombre: nombre(fila.personaId), montoUSD: fila.monto, destino: fila.destino, liquidaciones: fila.liquidacionIds.join(' '), estado: estadosRetiro[fila.estado].etiqueta, comprobante: fila.comprobante ?? '' }))} />}
          accionesFila={(fila) => (
            <div className="flex flex-wrap justify-end gap-1">
              {fila.estado === 'solicitada' && puedeAprobar && <Boton tamano="sm" variante="fantasma" icono={BadgeCheck} onClick={() => informar(resolverRetiro(fila.id, 'aprobada', idActor, ''), 'Retiro aprobado', `${fila.id} queda listo para pagar.`)}>Aprobar</Boton>}
              {fila.estado === 'solicitada' && puedeAprobar && <Boton tamano="sm" variante="fantasma" icono={CircleX} onClick={() => setPendiente({ tipo: 'rechazar_retiro', solicitud: fila })}>Rechazar</Boton>}
              {fila.estado === 'aprobada' && <ConPermiso modulo="liquidaciones" accion="liquidar"><Boton tamano="sm" icono={Wallet} onClick={() => puedeLiquidar && informar(pagarRetiro(fila.id, idActor), 'Pago registrado (simulado)', 'Las liquidaciones pasan a liquidadas, sin transferencia.')}>Registrar pago</Boton></ConPermiso>}
            </div>
          )}
        />
      ) : (
        <Tabla
          columnas={columnasDatos}
          filas={[...datos].sort((a, b) => Number(a.estado !== 'pendiente_verificacion') - Number(b.estado !== 'pendiente_verificacion'))}
          claveFila={(fila) => fila.personaId}
          textoVacio="Ningún afiliado registró datos de cobro."
          accionesFila={(fila) => (fila.estado === 'pendiente_verificacion' && puedeAprobar ? (
            <div className="flex flex-wrap justify-end gap-1">
              <Boton tamano="sm" variante="fantasma" icono={ShieldCheck} onClick={() => informar(verificarDatosCobro(fila.personaId, 'verificado', idActor, ''), 'Datos verificados', `${fila.personaId} ya puede solicitar retiros.`)}>Verificar</Boton>
              <Boton tamano="sm" variante="fantasma" icono={CircleX} onClick={() => setPendiente({ tipo: 'rechazar_datos', datos: fila })}>Rechazar</Boton>
            </div>
          ) : null)}
        />
      )}
      <Confirmacion
        abierto={Boolean(pendiente)}
        alCerrar={() => setPendiente(null)}
        titulo={pendiente?.tipo === 'rechazar_retiro' ? 'Rechazar retiro' : 'Rechazar datos de cobro'}
        resumen={pendiente?.tipo === 'rechazar_retiro' ? `${pendiente.solicitud.id} · ${nombre(pendiente.solicitud.personaId)} · ${formatearMonto(pendiente.solicitud.monto)}. El saldo vuelve a quedar disponible.` : pendiente ? `${nombre(pendiente.datos.personaId)} · ${describirDestino(pendiente.datos)}` : ''}
        textoConfirmar="Rechazar"
        peligro
        requiereMotivo
        alConfirmar={(motivo) => {
          if (pendiente?.tipo === 'rechazar_retiro') informar(resolverRetiro(pendiente.solicitud.id, 'rechazada', idActor, motivo), 'Retiro rechazado');
          if (pendiente?.tipo === 'rechazar_datos') informar(verificarDatosCobro(pendiente.datos.personaId, 'rechazado', idActor, motivo), 'Datos rechazados');
          setPendiente(null);
        }}
      />
    </div>
  );
}
