import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Banknote, CalendarRange, CreditCard, Info, LogIn, ShieldCheck, ShoppingCart, User, UserPlus, Users,
} from 'lucide-react';
import { ResumenTotales } from '../../componentes/catalogo/ResumenTotales';
import { Avatar } from '../../componentes/ui/Avatar';
import { Boton } from '../../componentes/ui/Boton';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { EstadoError } from '../../componentes/ui/EstadoError';
import { EstadoVacio } from '../../componentes/ui/EstadoVacio';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { useToast } from '../../componentes/ui/useToast';
import { useLineasCarrito } from '../../hooks/useLineasCarrito';
import { crearPedido, enviarPedido } from '../../servicios/pedidos';
import { useCarritoStore } from '../../store/useCarritoStore';
import { usePeriodosStore } from '../../store/usePeriodosStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import { useRedStore } from '../../store/useRedStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import { unirClases } from '../../utilidades/clases';
import { formatearFecha } from '../../utilidades/fechas';
import { puedeVerVolumen } from '../../utilidades/visibilidad';

const metodos = [
  { id: 'tarjeta', texto: 'Tarjeta (simulado)', icono: CreditCard },
  { id: 'transferencia', texto: 'Transferencia (simulado)', icono: Banknote },
];

export default function Checkout() {
  const resumen = useLineasCarrito();
  const vaciar = useCarritoStore((estado) => estado.vaciar);
  const persona = usePersonaSesion();
  const personas = usePersonasStore((estado) => estado.personas);
  const patrocinios = useRedStore((estado) => estado.patrocinios);
  const periodos = usePeriodosStore((estado) => estado.periodos);
  const navegar = useNavigate();
  const toast = useToast();
  const [metodo, setMetodo] = useState('tarjeta');
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const periodo = periodos.find((item) => item.tipo === 'ciclo' && item.estado === 'abierto');

  if (resumen.lineas.length === 0) {
    return (
      <Tarjeta className="mx-auto max-w-xl">
        <EstadoVacio icono={ShoppingCart} titulo="No hay artículos para confirmar" texto="Tu carrito está vacío." accion={<EnlaceBoton to="/catalogo">Ir al catálogo</EnlaceBoton>} />
      </Tarjeta>
    );
  }

  if (!persona) {
    return (
      <Tarjeta className="mx-auto max-w-xl">
        <EstadoVacio
          icono={User}
          titulo="Ingresa para confirmar tu pedido"
          texto="Tu carrito se conserva. Ingresa con un usuario de demostración o crea una cuenta."
          accion={(
            <>
              <EnlaceBoton to="/ingresar" icono={LogIn}>Ingresar</EnlaceBoton>
              <EnlaceBoton to="/registro" variante="secundario" icono={UserPlus}>Crear cuenta</EnlaceBoton>
            </>
          )}
        />
      </Tarjeta>
    );
  }

  const esEmpresario = persona.tipo === 'empresario';
  const vinculoId = esEmpresario ? patrocinios.find((relacion) => relacion.personaId === persona.id)?.patrocinadorId ?? null : persona.referenteId;
  const vinculo = personas.find((item) => item.id === vinculoId);
  const destinoVolumen = esEmpresario ? persona : vinculo;
  const mostrarVolumen = puedeVerVolumen(persona);
  const bloqueada = persona.estado !== 'activo';

  const confirmar = () => {
    setError(null);
    setProcesando(true);
    const creado = crearPedido(persona.id, resumen.lineas.map((linea) => ({ productoId: linea.producto.id, cantidad: linea.cantidad })));
    if (!creado.ok) {
      setError(creado.error);
      setProcesando(false);
      return;
    }
    const enviado = enviarPedido(creado.valor.id, persona.id);
    setProcesando(false);
    if (!enviado.ok) {
      setError(enviado.error);
      return;
    }
    vaciar();
    toast.info('Pedido creado', `${creado.valor.id} quedó pendiente de confirmación de cobro (simulada).`);
    navegar(`/pedido/${creado.valor.id}`);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-texto sm:text-[28px]">Confirmar pedido</h2>
        <p className="mt-1 text-[13.5px] text-texto-2">Revisa la asociación comercial del pedido antes de crearlo.</p>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-4">
          {bloqueada && <EstadoError titulo="Tu cuenta no puede comprar" queOcurrio={`La cuenta ${persona.codigo} está ${persona.estado}.`} comoSeguir="Solo las cuentas activas pueden crear pedidos." />}
          {error && <EstadoError queOcurrio={error} />}
          <Tarjeta titulo="Asociación comercial" subtitulo="Comprador, vínculo comercial y período del pedido (MLM-012)." icono={Users}>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl bg-fondo p-3">
                <Avatar nombres={persona.nombres} apellidos={persona.apellidos} />
                <div className="min-w-0">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Comprador</dt>
                  <dd className="truncate font-semibold text-texto">{persona.nombres} {persona.apellidos}</dd>
                  <dd className="cifra text-xs text-texto-2">{persona.codigo} · {persona.tipo}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-fondo p-3">
                {vinculo ? <Avatar nombres={vinculo.nombres} apellidos={vinculo.apellidos} /> : <span className="grid size-9 place-items-center rounded-full bg-slate-200 text-texto-3"><User className="size-4" aria-hidden /></span>}
                <div className="min-w-0">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">{esEmpresario ? 'Patrocinador' : 'Referente'}</dt>
                  <dd className="truncate font-semibold text-texto">{vinculo ? `${vinculo.nombres} ${vinculo.apellidos}` : 'Sin asignar'}</dd>
                  <dd className="cifra text-xs text-texto-2">{vinculo?.codigo ?? '-'}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-fondo p-3 sm:col-span-2">
                <span className="grid size-9 place-items-center rounded-[10px] bg-primario-suave text-primario"><CalendarRange className="size-[18px]" aria-hidden /></span>
                <div className="min-w-0">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Período comercial</dt>
                  <dd className="font-semibold text-texto">{periodo ? <><span className="cifra">{periodo.id}</span> · {formatearFecha(periodo.fechaInicio)} - {formatearFecha(periodo.fechaFin)}</> : 'Sin ciclo abierto'}</dd>
                </div>
                {periodo && <Insignia tono="info" className="ml-auto">Abierto</Insignia>}
              </div>
            </dl>
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-acento-suave px-3 py-2.5 text-[12.5px] text-[#155E75]">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              {destinoVolumen
                ? `Al confirmarse, el volumen del pedido se asignará a ${destinoVolumen.nombres} ${destinoVolumen.apellidos} (${destinoVolumen.codigo})${esEmpresario ? ', tu propia cuenta' : ', tu referente'}.`
                : 'Este pedido no tiene una cuenta a la que asignar volumen.'}
            </p>
          </Tarjeta>
          <Tarjeta titulo="Método de pago" subtitulo="Selección ilustrativa: no se solicitan ni guardan datos de tarjeta." icono={ShieldCheck}>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Método de pago">
              {metodos.map(({ id, texto, icono: Icono }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={metodo === id}
                  onClick={() => setMetodo(id)}
                  className={unirClases('flex min-h-14 items-center gap-3 rounded-xl border px-4 text-left text-[13.5px] font-semibold', metodo === id ? 'border-acento bg-acento-suave/50 text-texto ring-2 ring-acento-suave' : 'border-borde text-texto-2 hover:border-texto-3')}
                >
                  <Icono className="size-5 text-acento" aria-hidden />
                  {texto}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-texto-2">El pedido quedará pendiente y podrás simular la confirmación del cobro en el siguiente paso.</p>
          </Tarjeta>
        </div>
        <Tarjeta titulo="Resumen" className="lg:sticky lg:top-32 lg:self-start">
          <ul className="mb-4 flex flex-col gap-1.5 border-b border-borde pb-4 text-[13px]">
            {resumen.lineas.map(({ producto, cantidad }) => (
              <li key={producto.id} className="flex justify-between gap-3"><span className="min-w-0 truncate text-texto">{cantidad} x {producto.nombre}</span></li>
            ))}
          </ul>
          <ResumenTotales precio={resumen.precio} vp={resumen.vp} vc={resumen.vc} mostrarVolumen={mostrarVolumen} articulos={resumen.articulos} />
          <Boton anchoCompleto className="mt-5" icono={ShoppingCart} onClick={confirmar} cargando={procesando} disabled={bloqueada || !periodo}>Crear pedido</Boton>
          <EnlaceBoton to="/carrito" variante="fantasma" icono={ArrowLeft} anchoCompleto className="mt-2">Volver al carrito</EnlaceBoton>
        </Tarjeta>
      </div>
    </div>
  );
}
