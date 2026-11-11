import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, CircleCheck, CircleDashed, FileText, GraduationCap, IdCard, Info, Mail, MapPin, Phone, Plug, ShoppingBag, UserRound,
} from 'lucide-react';
import { ComprobanteSimulado } from '../../componentes/catalogo/ComprobanteSimulado';
import { Avatar } from '../../componentes/ui/Avatar';
import { Boton } from '../../componentes/ui/Boton';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { EstadoVacio } from '../../componentes/ui/EstadoVacio';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tabla, type ColumnaTabla } from '../../componentes/ui/Tabla';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { estadosPedido } from '../../datos/presentacionEstados';
import { useFormacionStore } from '../../store/useFormacionStore';
import { usePedidosStore } from '../../store/usePedidosStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { EstadoFormacion } from '../../tipos/formacion';
import type { Pedido } from '../../tipos/pedidos';
import { unirClases } from '../../utilidades/clases';
import { formatearFecha, formatearFechaHora } from '../../utilidades/fechas';
import { formatearMonto } from '../../utilidades/formatos';

const pasosFormacion: EstadoFormacion[] = ['matriculado', 'cursando', 'aprobado'];
const etiquetasFormacion: Record<EstadoFormacion, string> = { matriculado: 'Matriculado', cursando: 'Cursando', aprobado: 'Aprobado' };

export default function MiCuenta() {
  const persona = usePersonaSesion();
  const personas = usePersonasStore((estado) => estado.personas);
  const todosPedidos = usePedidosStore((estado) => estado.pedidos);
  const todaFormacion = useFormacionStore((estado) => estado.estados);
  const [comprobante, setComprobante] = useState<Pedido | null>(null);
  const pedidos = useMemo(
    () => todosPedidos.filter((pedido) => pedido.compradorId === persona?.id).sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [todosPedidos, persona],
  );
  const formacion = useMemo(() => todaFormacion.filter((item) => item.personaId === persona?.id), [todaFormacion, persona]);
  if (!persona) return null;
  const referente = personas.find((item) => item.id === persona.referenteId);

  const columnas: ColumnaTabla<Pedido>[] = [
    { clave: 'id', titulo: 'Pedido', render: (fila) => <Link to={`/pedido/${fila.id}`} className="cifra inline-flex min-h-11 items-center font-semibold text-acento hover:underline md:min-h-0">{fila.id}</Link>, valorOrden: (fila) => fila.id, principalEnMovil: true },
    { clave: 'fecha', titulo: 'Fecha', render: (fila) => <span className="cifra text-[12.5px]">{formatearFechaHora(fila.fecha)}</span>, valorOrden: (fila) => fila.fecha },
    { clave: 'total', titulo: 'Total', alinear: 'derecha', render: (fila) => <span className="cifra font-semibold">{formatearMonto(fila.totalPrecio)}</span>, valorOrden: (fila) => fila.totalPrecio },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <Insignia tono={estadosPedido[fila.estado].tono} icono={estadosPedido[fila.estado].icono}>{estadosPedido[fila.estado].etiqueta}</Insignia>, valorOrden: (fila) => fila.estado },
    { clave: 'comprobante', titulo: 'Comprobante', render: (fila) => (fila.comprobante ? <span className="cifra text-[12.5px]">{fila.comprobante}</span> : <span className="text-texto-3">Sin comprobante</span>) },
  ];

  return (
    <div className="flex flex-col gap-5">
      <section className="fondo-calificacion relative overflow-hidden rounded-[24px] p-6 text-white sm:p-8">
        <span className="absolute -right-16 -top-16 size-56 rounded-full border-[36px] border-acento-brillo/10" aria-hidden />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar nombres={persona.nombres} apellidos={persona.apellidos} tamano="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-acento-brillo">Mi cuenta</p>
            <h2 className="mt-1 truncate text-2xl font-extrabold tracking-tight">{persona.nombres} {persona.apellidos}</h2>
            <p className="cifra text-[13px] text-[#9FDFF0]">{persona.codigo} · <span className="font-sans capitalize">{persona.tipo}</span></p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Insignia tono={persona.estado === 'activo' ? 'exito' : 'advertencia'} className="capitalize">{persona.estado}</Insignia>
            <Insignia tono="neutra">Alta {formatearFecha(persona.fechaAlta)}</Insignia>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          <Tarjeta titulo="Mis datos" icono={UserRound}>
            <dl className="flex flex-col gap-3 text-[13.5px]">
              {[
                { icono: Mail, etiqueta: 'Correo', valor: persona.correo },
                { icono: Phone, etiqueta: 'Teléfono', valor: persona.telefono },
                { icono: IdCard, etiqueta: 'Documento', valor: persona.documento },
                { icono: MapPin, etiqueta: 'País y moneda', valor: `${persona.pais} · ${persona.moneda}` },
              ].map(({ icono: Icono, etiqueta, valor }) => (
                <div key={etiqueta} className="flex items-start gap-3">
                  <Icono className="mt-0.5 size-4 shrink-0 text-texto-3" aria-hidden />
                  <div className="min-w-0"><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">{etiqueta}</dt><dd className="break-words text-texto">{valor}</dd></div>
                </div>
              ))}
            </dl>
          </Tarjeta>
          <Tarjeta titulo="Mi referente" icono={UserRound}>
            {referente ? (
              <div className="flex items-center gap-3">
                <Avatar nombres={referente.nombres} apellidos={referente.apellidos} />
                <div><p className="font-semibold text-texto">{referente.nombres} {referente.apellidos}</p><p className="cifra text-xs text-texto-2">{referente.codigo}</p></div>
              </div>
            ) : <p className="text-[13px] text-texto-2">No tienes un referente asignado.</p>}
            <p className="mt-3 flex items-start gap-2 text-xs text-texto-2"><Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />Las cuentas de cliente y alumno no participan en comisiones ni ven árboles de red.</p>
          </Tarjeta>
          <Tarjeta titulo="Formación vinculada" subtitulo="Plataforma educativa ERIC S.A.C." icono={GraduationCap}>
            {formacion.length === 0 ? (
              <EstadoVacio icono={BookOpen} titulo="Sin programas" texto="Cuando compres un programa formativo, su estado aparecerá aquí." className="py-4" />
            ) : (
              <ul className="flex flex-col gap-4">
                {formacion.map((item) => {
                  const indice = pasosFormacion.indexOf(item.estado);
                  return (
                    <li key={item.id}>
                      <p className="font-semibold text-texto">{item.programaExterno}</p>
                      <p className="text-xs text-texto-2">Actualizado {formatearFecha(item.fechaActualizacion)}</p>
                      <ol className="mt-3 grid grid-cols-3 gap-2">
                        {pasosFormacion.map((paso, posicion) => {
                          const logrado = posicion <= indice;
                          const Icono = logrado ? CircleCheck : CircleDashed;
                          return (
                            <li key={paso} className={unirClases('flex flex-col items-center gap-1 rounded-xl border p-2 text-center text-[11.5px] font-semibold', logrado ? 'border-green-200 bg-green-50 text-exito' : 'border-dashed border-borde text-texto-3')}>
                              <Icono className="size-4" aria-hidden />
                              {etiquetasFormacion[paso]}
                            </li>
                          );
                        })}
                      </ol>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-4 flex items-center gap-2 rounded-xl bg-fondo px-3 py-2 text-xs text-texto-2"><Plug className="size-4 shrink-0" aria-hidden />Conector LMS pendiente de integración: estados de prueba.</p>
          </Tarjeta>
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-[15px] font-bold text-texto"><ShoppingBag className="size-[18px]" aria-hidden />Mis compras</h3>
            <EnlaceBoton to="/catalogo" tamano="sm" variante="secundario">Seguir comprando</EnlaceBoton>
          </div>
          <Tabla
            columnas={columnas}
            filas={pedidos}
            claveFila={(fila) => fila.id}
            textoBusqueda={(fila) => `${fila.id} ${fila.estado} ${fila.comprobante} ${fila.periodoId}`}
            placeholderBusqueda="Buscar por pedido, estado o comprobante"
            textoVacio="Todavía no tienes compras."
            accionesFila={(fila) => (
              <div className="flex justify-end gap-2">
                <EnlaceBoton to={`/pedido/${fila.id}`} tamano="sm" variante="fantasma">Ver detalle</EnlaceBoton>
                {fila.comprobante && <Boton tamano="sm" variante="secundario" icono={FileText} onClick={() => setComprobante(fila)}>Comprobante</Boton>}
              </div>
            )}
          />
        </div>
      </div>
      <ComprobanteSimulado pedido={comprobante} alCerrar={() => setComprobante(null)} />
    </div>
  );
}
