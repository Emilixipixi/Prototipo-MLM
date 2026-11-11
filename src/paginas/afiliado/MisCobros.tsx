import { useMemo, useState } from 'react';
import { Banknote, CreditCard, Info, Landmark, Pencil, Send, ShieldCheck, Wallet } from 'lucide-react';
import { Boton } from '../../componentes/ui/Boton';
import { Campo } from '../../componentes/ui/Campo';
import { EstadoError } from '../../componentes/ui/EstadoError';
import { Insignia } from '../../componentes/ui/Insignia';
import { Modal } from '../../componentes/ui/Modal';
import { Selector } from '../../componentes/ui/Selector';
import { Tabla, type ColumnaTabla } from '../../componentes/ui/Tabla';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { useToast } from '../../componentes/ui/useToast';
import { MONTO_MINIMO_RETIRO } from '../../datos/cobros';
import { estadosLiquidacion } from '../../datos/presentacionCompensacion';
import { estadosDatosCobro, estadosRetiro } from '../../datos/presentacionCompensacionCorporativa';
import { describirDestino, guardarDatosCobro, liquidacionesDisponibles, solicitarRetiro, type EntradaDatosCobro } from '../../servicios/cobros';
import { useCobrosStore } from '../../store/useCobrosStore';
import { useCompensacionStore } from '../../store/useCompensacionStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { DatosCobro, SolicitudRetiro } from '../../tipos/cobros';
import { formatearFechaHora } from '../../utilidades/fechas';
import { formatearMonto, redondear } from '../../utilidades/formatos';

export default function MisCobros() {
  const persona = usePersonaSesion();
  const datos = useCobrosStore((estado) => estado.datos.find((item) => item.personaId === persona?.id));
  const solicitudes = useCobrosStore((estado) => estado.solicitudes);
  const liquidaciones = useCompensacionStore((estado) => estado.liquidaciones);
  const toast = useToast();
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const propias = useMemo(() => solicitudes.filter((solicitud) => solicitud.personaId === persona?.id).sort((a, b) => b.fechaSolicitud.localeCompare(a.fechaSolicitud)), [solicitudes, persona]);
  const disponibles = persona ? liquidacionesDisponibles(persona.id, liquidaciones, solicitudes) : [];
  const saldo = redondear(disponibles.reduce((suma, liquidacion) => suma + liquidacion.total, 0));
  const porHabilitar = liquidaciones.filter((liquidacion) => liquidacion.personaId === persona?.id && liquidacion.estado === 'aprobada');
  const retenidas = liquidaciones.filter((liquidacion) => liquidacion.personaId === persona?.id && liquidacion.estado === 'retenida');
  const enProceso = propias.filter((solicitud) => solicitud.estado === 'solicitada' || solicitud.estado === 'aprobada');

  const solicitar = () => {
    if (!persona) return;
    const resultado = solicitarRetiro(persona.id);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    setError(null);
    toast.exito('Retiro solicitado', `${resultado.valor.id} por ${formatearMonto(resultado.valor.monto)}. Corporativo lo revisará.`);
  };

  const columnas: ColumnaTabla<SolicitudRetiro>[] = [
    { clave: 'id', titulo: 'Solicitud', principalEnMovil: true, render: (fila) => <div><p className="cifra font-semibold">{fila.id}</p><p className="cifra text-xs text-texto-2">{formatearFechaHora(fila.fechaSolicitud)}</p></div> },
    { clave: 'monto', titulo: 'Monto', alinear: 'derecha', render: (fila) => <span className="cifra whitespace-nowrap font-semibold">{formatearMonto(fila.monto)}</span> },
    { clave: 'liquidaciones', titulo: 'Liquidaciones', render: (fila) => <span className="cifra text-[12px] text-texto-2">{fila.liquidacionIds.join(', ')}</span> },
    { clave: 'destino', titulo: 'Destino', ocultarEnMovil: true, render: (fila) => <span className="text-[12px] text-texto-2">{fila.destino}</span> },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <div className="flex flex-col items-start gap-1"><Insignia tono={estadosRetiro[fila.estado].tono} icono={estadosRetiro[fila.estado].icono}>{estadosRetiro[fila.estado].etiqueta}</Insignia>{fila.motivoRechazo && <span className="text-[11.5px] text-texto-2">{fila.motivoRechazo}</span>}{fila.comprobante && <span className="cifra text-[11.5px] text-texto-2">{fila.comprobante}</span>}</div> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <p className="flex items-start gap-2 rounded-xl bg-oro-suave px-3 py-2.5 text-[12.5px] text-[#7C4A03]">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        Cobro simulado de DEMOSTRACIÓN: no se guardan números de cuenta completos ni se realizan transferencias. Monto mínimo de retiro ilustrativo: {formatearMonto(MONTO_MINIMO_RETIRO)}.
      </p>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
        <Tarjeta titulo="Mis datos de cobro" subtitulo="Dónde recibirías tus pagos" icono={Landmark} acciones={datos && <Boton tamano="sm" variante="secundario" icono={Pencil} onClick={() => setEditando(true)}>Cambiar</Boton>}>
          {datos ? (
            <div className="flex flex-col gap-3 text-[13px]">
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primario-suave text-primario">{datos.metodo === 'transferencia' ? <Landmark className="size-5" aria-hidden /> : <CreditCard className="size-5" aria-hidden />}</span>
                <div className="min-w-0"><p className="font-semibold">{describirDestino(datos)}</p><p className="text-texto-2">{datos.titular} · {datos.documentoTitular}</p></div>
              </div>
              <div className="flex flex-wrap items-center gap-2"><Insignia tono={estadosDatosCobro[datos.estado].tono} icono={estadosDatosCobro[datos.estado].icono}>{estadosDatosCobro[datos.estado].etiqueta}</Insignia>{datos.observacion && <span className="text-[12px] text-texto-2">{datos.observacion}</span>}</div>
              {datos.estado !== 'verificado' && <p className="text-[12px] text-texto-2">Corporativo debe verificar tus datos antes de que puedas solicitar retiros.</p>}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3 text-[13px] text-texto-2">
              <p>Aún no registras dónde recibir tus pagos.</p>
              <Boton icono={Landmark} onClick={() => setEditando(true)}>Registrar datos de cobro</Boton>
            </div>
          )}
        </Tarjeta>
        <Tarjeta titulo="Saldo disponible para retiro" subtitulo="Liquidaciones aptas para desembolso" icono={Wallet}>
          <div className="flex flex-col gap-3">
            <p className="cifra text-3xl font-extrabold">{formatearMonto(saldo)}</p>
            <ul className="flex flex-col gap-1 text-[12.5px] text-texto-2">
              {disponibles.map((liquidacion) => <li key={liquidacion.id} className="cifra">{liquidacion.id} · {formatearMonto(liquidacion.total)}</li>)}
              {porHabilitar.length > 0 && <li>{porHabilitar.length} liquidación aprobada pendiente de habilitarse para desembolso ({formatearMonto(porHabilitar.reduce((suma, item) => suma + item.total, 0))}).</li>}
              {retenidas.length > 0 && <li>{retenidas.length} liquidación retenida ({estadosLiquidacion.retenida.etiqueta.toLowerCase()}): {retenidas[0].motivoRetencion}</li>}
              {enProceso.length > 0 && <li>{enProceso.length} retiro en proceso por {formatearMonto(enProceso.reduce((suma, item) => suma + item.monto, 0))}.</li>}
            </ul>
            {error && <EstadoError queOcurrio={error} />}
            <Boton icono={Send} onClick={solicitar} disabled={saldo <= 0} className="self-start">Solicitar retiro de {formatearMonto(saldo)}</Boton>
          </div>
        </Tarjeta>
      </div>
      <section className="flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-[15px] font-bold"><Banknote className="size-4 text-acento" aria-hidden />Mis solicitudes de retiro</h3>
        <Tabla columnas={columnas} filas={propias} claveFila={(fila) => fila.id} textoVacio="Aún no has solicitado retiros." />
      </section>
      <p className="flex items-center gap-2 text-[12px] text-texto-2"><ShieldCheck className="size-4 text-acento" aria-hidden />Cada cambio queda en la bitácora y te llega un aviso en el centro de notificaciones.</p>
      {editando && <FormularioDatosCobro actuales={datos ?? null} alCerrar={() => setEditando(false)} />}
    </div>
  );
}

function FormularioDatosCobro({ actuales, alCerrar }: { actuales: DatosCobro | null; alCerrar: () => void }) {
  const persona = usePersonaSesion();
  const toast = useToast();
  const [entrada, setEntrada] = useState<EntradaDatosCobro>({
    metodo: actuales?.metodo ?? 'transferencia', titular: actuales?.titular ?? (persona ? `${persona.nombres} ${persona.apellidos}` : ''),
    documentoTitular: actuales?.documentoTitular ?? persona?.documento ?? '', entidad: actuales?.entidad ?? '', tipoCuenta: actuales?.tipoCuenta ?? 'ahorros', numeroCuenta: '',
  });
  const [error, setError] = useState<string | null>(null);
  const cambiar = <K extends keyof EntradaDatosCobro>(clave: K, valor: EntradaDatosCobro[K]) => setEntrada((previo) => ({ ...previo, [clave]: valor }));
  const guardar = () => {
    if (!persona) return;
    const resultado = guardarDatosCobro(persona.id, entrada);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    toast.exito('Datos de cobro enviados', 'Quedan pendientes de verificación por corporativo.');
    alCerrar();
  };
  const esCuenta = entrada.metodo === 'transferencia';
  return (
    <Modal abierto alCerrar={alCerrar} titulo={actuales ? 'Cambiar datos de cobro' : 'Registrar datos de cobro'} descripcion="Usa datos ficticios. Solo se guardan los últimos 4 dígitos." ancho="md" pie={<><Boton variante="secundario" onClick={alCerrar}>Cancelar</Boton><Boton icono={ShieldCheck} onClick={guardar}>Enviar a verificación</Boton></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        {error && <div className="sm:col-span-2"><EstadoError queOcurrio={error} /></div>}
        <Selector etiqueta="Método" value={entrada.metodo} onChange={(evento) => cambiar('metodo', evento.target.value as EntradaDatosCobro['metodo'])} opciones={[{ valor: 'transferencia', texto: 'Transferencia bancaria' }, { valor: 'billetera', texto: 'Billetera digital' }]} />
        {esCuenta && <Selector etiqueta="Tipo de cuenta" value={entrada.tipoCuenta ?? 'ahorros'} onChange={(evento) => cambiar('tipoCuenta', evento.target.value as 'ahorros' | 'corriente')} opciones={[{ valor: 'ahorros', texto: 'Ahorros' }, { valor: 'corriente', texto: 'Corriente' }]} />}
        <Campo etiqueta={esCuenta ? 'Banco' : 'Proveedor de la billetera'} value={entrada.entidad} onChange={(evento) => cambiar('entidad', evento.target.value)} placeholder={esCuenta ? 'Ejemplo: Banco Demostración' : 'Ejemplo: Billetera Demo'} />
        <Campo etiqueta={esCuenta ? 'Número de cuenta' : 'Número de la billetera'} inputMode="numeric" autoComplete="off" value={entrada.numeroCuenta} onChange={(evento) => cambiar('numeroCuenta', evento.target.value)} ayuda="Entre 8 y 20 dígitos. Se guardan solo los últimos 4." />
        <Campo etiqueta="Titular" value={entrada.titular} onChange={(evento) => cambiar('titular', evento.target.value)} />
        <Campo etiqueta="Documento del titular" value={entrada.documentoTitular} onChange={(evento) => cambiar('documentoTitular', evento.target.value)} />
        <p className="text-[12px] text-texto-2 sm:col-span-2">Al cambiar los datos vuelven a quedar pendientes de verificación y no podrás retirar hasta que corporativo los apruebe.</p>
      </div>
    </Modal>
  );
}
