import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, BadgeCheck, BarChart3, GraduationCap, Info, Receipt, School } from 'lucide-react';
import { RegistroEventosLms } from '../../componentes/campus/RegistroEventosLms';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tabla, type ColumnaTabla } from '../../componentes/ui/Tabla';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { TarjetaKpi } from '../../componentes/ui/TarjetaKpi';
import { useCampusStore } from '../../store/useCampusStore';
import { useCatalogoStore } from '../../store/useCatalogoStore';
import { useFormacionStore } from '../../store/useFormacionStore';
import { usePedidosStore } from '../../store/usePedidosStore';
import { usePeriodosStore } from '../../store/usePeriodosStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import type { EstadoFormacion, EstadoFormativo } from '../../tipos/formacion';
import { formatearFecha } from '../../utilidades/fechas';
import { formatearMonto, formatearNumero } from '../../utilidades/formatos';

const etiquetasFormacion: Record<EstadoFormacion, string> = { matriculado: 'Matriculado', cursando: 'Cursando', aprobado: 'Aprobado' };
const tonosFormacion: Record<EstadoFormacion, 'info' | 'advertencia' | 'exito'> = { matriculado: 'info', cursando: 'advertencia', aprobado: 'exito' };

export default function IntegracionErick() {
  const pedidos = usePedidosStore((estado) => estado.pedidos);
  const productos = useCatalogoStore((estado) => estado.productos);
  const periodos = usePeriodosStore((estado) => estado.periodos);
  const formacion = useFormacionStore((estado) => estado.estados);
  const personas = usePersonasStore((estado) => estado.personas);
  const eventos = useCampusStore((estado) => estado.eventos);

  const formativos = useMemo(() => new Set(productos.filter((producto) => producto.categoria === 'programa_formativo').map((producto) => producto.id)), [productos]);
  const ventas = useMemo(() => pedidos
    .filter((pedido) => pedido.estado === 'confirmada')
    .flatMap((pedido) => pedido.items.filter((item) => formativos.has(item.productoId)).map((item) => ({ pedido, item }))), [pedidos, formativos]);
  const monto = ventas.reduce((suma, { item }) => suma + item.precioUnitario * item.cantidad, 0);
  const vp = ventas.reduce((suma, { item }) => suma + item.vpUnitario * item.cantidad, 0);
  const porPeriodo = periodos
    .map((periodo) => ({
      periodo: periodo.id.replace('DEMO-', ''), nombre: periodo.nombre,
      monto: ventas.filter(({ pedido }) => pedido.periodoId === periodo.id).reduce((suma, { item }) => suma + item.precioUnitario * item.cantidad, 0),
    }))
    .filter((fila) => fila.monto > 0);

  const empresarios = new Set(personas.filter((persona) => persona.tipo === 'empresario').map((persona) => persona.id));
  const filasFormacion = formacion.filter((fila) => empresarios.has(fila.personaId));
  const afiliadosAprobados = new Set(filasFormacion.filter((fila) => fila.estado === 'aprobado').map((fila) => fila.personaId)).size;
  const errores = eventos.filter((evento) => evento.estado === 'error').length;
  const nombre = (id: string) => { const persona = personas.find((item) => item.id === id); return persona ? `${persona.nombres} ${persona.apellidos}` : id; };

  const columnas: ColumnaTabla<EstadoFormativo>[] = [
    { clave: 'persona', titulo: 'Afiliado', principalEnMovil: true, render: (fila) => <span><b>{nombre(fila.personaId)}</b><span className="cifra block text-[11px] text-texto-3">{fila.personaId}</span></span>, valorOrden: (fila) => nombre(fila.personaId) },
    { clave: 'programa', titulo: 'Programa', render: (fila) => fila.programaExterno, valorOrden: (fila) => fila.programaExterno },
    { clave: 'estado', titulo: 'Estado formativo', render: (fila) => <Insignia tono={tonosFormacion[fila.estado]}>{etiquetasFormacion[fila.estado]}</Insignia>, valorOrden: (fila) => fila.estado },
    { clave: 'fecha', titulo: 'Actualizado', ocultarEnMovil: true, render: (fila) => <span className="cifra text-xs">{formatearFecha(fila.fechaActualizacion)}</span>, valorOrden: (fila) => fila.fechaActualizacion },
  ];

  return (
    <div className="flex flex-col gap-5">
      <p className="flex items-start gap-2 rounded-xl bg-acento-suave px-3 py-2.5 text-[12.5px] text-[#155E75]">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        La administración académica corresponde a ERICK S.A.C. y se gestiona en su propia plataforma. Aquí el MLM solo consulta lo que necesita: ventas de programas formativos, estado formativo de los afiliados (requisito de rango) y los eventos del conector.
      </p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <TarjetaKpi etiqueta="Ventas formativas" valor={formatearMonto(monto)} icono={Receipt} tono="primario" />
        <TarjetaKpi etiqueta="VP formativo" valor={formatearNumero(vp)} icono={BarChart3} tono="acento" />
        <TarjetaKpi etiqueta="Afiliados con formación aprobada" valor={afiliadosAprobados} icono={BadgeCheck} tono="exito" />
        <TarjetaKpi etiqueta="Eventos del conector con error" valor={errores} icono={AlertTriangle} tono={errores ? 'error' : 'exito'} />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Tarjeta titulo="Ventas de programas formativos por período" subtitulo={`Pedidos confirmados en USD · ${formatearNumero(ventas.length)} líneas`} icono={School}>
          <div className="h-60" role="img" aria-label={`Ventas formativas por período: ${porPeriodo.map((fila) => `${fila.nombre} ${formatearMonto(fila.monto)}`).join(', ')}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porPeriodo} margin={{ top: 6, right: 4, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="periodo" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} formatter={(valor) => [formatearMonto(Number(valor)), 'Ventas']} labelFormatter={(codigo) => porPeriodo.find((fila) => fila.periodo === codigo)?.nombre ?? String(codigo)} />
                <Bar dataKey="monto" fill="#0E7490" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Tarjeta>
        <Tarjeta titulo="Estado formativo de afiliados" subtitulo="Lo actualiza el conector; alimenta el requisito de rango" icono={GraduationCap} sinRelleno>
          <Tabla columnas={columnas} filas={filasFormacion} claveFila={(fila) => fila.id} textoBusqueda={(fila) => `${fila.personaId} ${nombre(fila.personaId)} ${fila.programaExterno}`} placeholderBusqueda="Buscar afiliado o programa" porPagina={6} textoVacio="Sin afiliados con formación registrada." />
        </Tarjeta>
      </div>
      <RegistroEventosLms />
    </div>
  );
}
