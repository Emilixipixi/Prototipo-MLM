import { ArrowRight, CalendarCheck, CalendarClock, CircleCheck, Info, Plus, Receipt, ShoppingCart, Sparkles, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnilloProgreso } from '../../componentes/campus/AnilloProgreso';
import { Boton } from '../../componentes/ui/Boton';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { useToast } from '../../componentes/ui/useToast';
import { estadosAcceso, nombresTipoPrograma } from '../../datos/academico/presentacionCampus';
import { useCampusPersona } from '../../hooks/useCampusPersona';
import { usePrecios } from '../../hooks/usePrecios';
import { diasRestantes, esVigente } from '../../motores/academico/accesos';
import { inscribirConMembresia, programaMatriculable } from '../../servicios/matriculas';
import { useAcademicoStore } from '../../store/useAcademicoStore';
import { useCarritoStore } from '../../store/useCarritoStore';
import { useCatalogoStore } from '../../store/useCatalogoStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import { unirClases } from '../../utilidades/clases';
import { formatearFecha } from '../../utilidades/fechas';
import { formatearMonto } from '../../utilidades/formatos';

export default function MiMembresia() {
  const persona = usePersonaSesion();
  const datos = useCampusPersona(persona?.id);
  const planes = useAcademicoStore((estado) => estado.planes);
  const programas = useAcademicoStore((estado) => estado.programas);
  const productos = useCatalogoStore((estado) => estado.productos);
  const agregar = useCarritoStore((estado) => estado.agregar);
  const precio = usePrecios();
  const toast = useToast();
  if (!persona) return null;

  const { membresia, plan, estadoMembresia, hoy } = datos;
  const vigente = Boolean(estadoMembresia && esVigente(estadoMembresia));
  const incluidos = programas.filter((programa) => programaMatriculable(programa) && programa.incluidoEnMembresia);
  const totalDias = membresia ? Math.max(1, diasRestantes(membresia.vencimiento, membresia.inicio)) : 1;
  const usados = membresia ? Math.min(totalDias, Math.max(0, diasRestantes(hoy, membresia.inicio))) : 0;
  const restantes = membresia ? diasRestantes(membresia.vencimiento, hoy) : 0;

  const inscribir = (programaId: string) => {
    const resultado = inscribirConMembresia(persona.id, programaId, persona.id);
    if (resultado.ok) toast.exito('Inscripción registrada', `Acceso hasta el ${formatearFecha(resultado.valor.matricula.vencimiento)}.`);
    else toast.error('No se pudo inscribir', resultado.error);
  };

  const alCarrito = (productoId: string, nombre: string) => {
    agregar(productoId, 1);
    toast.info('Agregado al carrito', `${nombre}. La membresía se activa o renueva al confirmarse el pago.`);
  };

  return (
    <div className="flex flex-col gap-5">
      {membresia && estadoMembresia ? (
        <section className="fondo-calificacion relative overflow-hidden rounded-[24px] p-5 text-white sm:p-7">
          <span className="absolute -right-16 -top-16 size-56 rounded-full border-[36px] border-white/5" aria-hidden />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <AnilloProgreso valor={Math.round((usados / totalDias) * 100)} tamano={84} etiqueta="Tiempo de membresía utilizado" claro />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#E2C46E]">Mi membresía</p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{plan?.nombre ?? 'Membresía ERICK'}</h2>
              <p className="cifra mt-1 text-[13px] text-[#B9D4E8]">{membresia.id} · {formatearFecha(membresia.inicio)} al {formatearFecha(membresia.vencimiento)}</p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <Insignia tono={estadosAcceso[estadoMembresia].tono} icono={estadosAcceso[estadoMembresia].icono}>{estadosAcceso[estadoMembresia].texto}</Insignia>
              <p className="cifra text-[28px] font-extrabold leading-none">{vigente ? restantes : 0}</p>
              <p className="text-xs text-[#B9D4E8]">{vigente ? 'días restantes' : `venció hace ${Math.abs(restantes)} días`}</p>
            </div>
          </div>
        </section>
      ) : (
        <Tarjeta titulo="Aún no tienes una membresía" subtitulo="Una membresía da acceso a todos los cursos y diplomados incluidos durante el plazo del plan." icono={WalletCards}>
          <p className="flex items-start gap-2 text-[13px] text-texto-2"><Info className="mt-0.5 size-4 shrink-0" aria-hidden />Elige un plan, confírmalo en el checkout y tu membresía se activará automáticamente cuando el pago quede confirmado.</p>
        </Tarjeta>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Tarjeta titulo="Programas incluidos" subtitulo="Cursos y diplomados publicados que forman parte de la membresía." icono={Sparkles}>
          <ul className="flex flex-col gap-2.5">
            {incluidos.map((programa) => {
              const propio = datos.programas.find((item) => item.programa.id === programa.id && esVigente(item.estado));
              return (
                <li key={programa.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-borde p-3">
                  <span className="size-10 shrink-0 rounded-[10px]" style={{ background: `linear-gradient(135deg, ${programa.colores[0]}, ${programa.colores[1]})` }} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold text-texto">{programa.nombre}</p>
                    <p className="text-xs text-texto-2">{nombresTipoPrograma[programa.tipo]} · {programa.horas} h</p>
                  </div>
                  {propio
                    ? <Link to={`/campus/programas/${programa.id}`} className="inline-flex min-h-11 items-center gap-1 text-[13px] font-semibold text-acento md:min-h-0"><CircleCheck className="size-4" aria-hidden />Con acceso</Link>
                    : vigente
                      ? <Boton tamano="sm" variante="secundario" icono={Plus} onClick={() => inscribir(programa.id)}>Inscribirme</Boton>
                      : <Insignia tono="neutra">Requiere membresía vigente</Insignia>}
                </li>
              );
            })}
          </ul>
        </Tarjeta>

        <div className="flex min-w-0 flex-col gap-5">
          {membresia && (
            <Tarjeta titulo="Detalle" icono={CalendarCheck}>
              <dl className="grid grid-cols-2 gap-3 text-[13px]">
                <div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Inicio</dt><dd className="cifra text-texto">{formatearFecha(membresia.inicio)}</dd></div>
                <div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Vencimiento</dt><dd className="cifra text-texto">{formatearFecha(membresia.vencimiento)}</dd></div>
                <div className="col-span-2">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Pedidos asociados</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {membresia.pedidoIds.length === 0
                      ? <span className="text-texto-2">Asignada por el área académica (sin pedido)</span>
                      : membresia.pedidoIds.map((id) => <Link key={id} to={`/pedido/${id}`} className="cifra inline-flex items-center gap-1 rounded-md bg-primario-suave px-2 py-0.5 text-xs font-medium text-primario"><Receipt className="size-3" aria-hidden />{id}</Link>)}
                  </dd>
                </div>
              </dl>
            </Tarjeta>
          )}
          <p className="flex items-start gap-2 rounded-xl bg-acento-suave px-3 py-2.5 text-[12.5px] text-[#155E75]">
            <CalendarClock className="mt-0.5 size-4 shrink-0" aria-hidden />
            Al comprar otro plan, el plazo se suma desde tu fecha de vencimiento vigente; si ya venció, desde hoy. Tus notas y certificados nunca se pierden.
          </p>
        </div>
      </div>

      <Tarjeta titulo={membresia ? 'Renovar o ampliar' : 'Planes disponibles'} subtitulo="Precios del catálogo, con los descuentos vigentes. El pago se confirma de forma simulada." icono={WalletCards}>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {planes.filter((item) => item.activo).map((item) => {
            const producto = productos.find((candidato) => candidato.id === item.productoId);
            if (!producto) return null;
            const valores = precio(producto);
            const actual = item.id === plan?.id;
            return (
              <li key={item.id} className={unirClases('flex min-w-0 flex-col gap-2 rounded-xl border p-3', actual ? 'border-acento ring-2 ring-acento-suave' : 'border-borde')}>
                <p className="cifra text-[26px] font-extrabold leading-none text-texto">{item.meses}</p>
                <p className="text-xs text-texto-2">{item.meses === 1 ? 'mes' : 'meses'}{actual ? ' · tu plan' : ''}</p>
                <p className="cifra text-[14px] font-bold text-texto">{formatearMonto(valores.precioFinal)}</p>
                {valores.ahorro > 0 && <p className="cifra text-[11px] text-texto-3 line-through">{formatearMonto(valores.precioLista)}</p>}
                <div className="mt-auto flex flex-col gap-1.5">
                  <Boton tamano="sm" icono={ShoppingCart} onClick={() => alCarrito(producto.id, producto.nombre)} disabled={!producto.activo}>Agregar</Boton>
                  <EnlaceBoton to={`/catalogo/${producto.id}`} tamano="sm" variante="fantasma" iconoDerecha={ArrowRight}>Ver</EnlaceBoton>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex justify-end"><EnlaceBoton to="/carrito" variante="secundario" icono={ShoppingCart}>Ir al carrito</EnlaceBoton></div>
      </Tarjeta>
    </div>
  );
}
