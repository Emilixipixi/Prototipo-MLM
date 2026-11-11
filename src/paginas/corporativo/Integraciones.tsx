import { useState } from 'react';
import {
  Bell, CircleDashed, CreditCard, DatabaseBackup, GraduationCap, Globe2, KeyRound, LifeBuoy, MonitorCheck, Play, Plug, ShieldCheck, ShoppingCart, type LucideIcon,
} from 'lucide-react';
import { Boton } from '../../componentes/ui/Boton';
import { Insignia, type TonoInsignia } from '../../componentes/ui/Insignia';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { useIntegracionesStore } from '../../store/useIntegracionesStore';
import type { Conector } from '../../tipos/integraciones';

const iconos: Record<Conector['tipo'], LucideIcon> = { lms: GraduationCap, ecommerce: ShoppingCart, pagos: CreditCard, notificaciones: Bell };
const estados: Record<Conector['estado'], { etiqueta: string; tono: TonoInsignia }> = {
  pendiente_integracion: { etiqueta: 'Pendiente de integración', tono: 'advertencia' },
  simulado: { etiqueta: 'Simulado', tono: 'info' },
  futuro: { etiqueta: 'Conector futuro', tono: 'neutra' },
};
const detalles: Record<Conector['tipo'], string[]> = {
  lms: ['Estados recibidos: matriculado, cursando, aprobado.', 'El estado "aprobado" puede ser condición de rango.', 'Hoy se simula con el botón de Mi formación.'],
  ecommerce: ['Importaría ventas y estatus desde otra tienda.', 'Cada venta generaría movimientos VP/VC al confirmarse.', 'Sin conexión en este prototipo.'],
  pagos: ['Confirmación de cobro del pedido: simulada.', 'Pago posterior de liquidaciones: simulado, sin transferencia.', 'Interfaz desacoplada: el proveedor real se conecta por adaptador.'],
  notificaciones: ['Avisos internos en el centro de notificaciones.', 'Compra, cambio de estado, cierre y liquidaciones.', 'Sin envío real de correos ni mensajes.'],
};
const flujoPagos = ['Pedido pendiente', 'Cobro confirmado (simulado)', 'Liquidación aprobada', 'Apta para desembolso', 'Liquidada (simulada, sin transferencia)'];
const resiliencia: Array<{ icono: LucideIcon; titulo: string; texto: string }> = [
  { icono: DatabaseBackup, titulo: 'Respaldos', texto: 'Copias periódicas de transacciones, genealogías, parámetros versionados y bitácora.' },
  { icono: MonitorCheck, titulo: 'Monitoreo', texto: 'Alertas operativas sobre colas de confirmación, recálculos, cierres y exportaciones.' },
  { icono: LifeBuoy, titulo: 'Recuperación', texto: 'Reintentos con idempotencia: un reintento no duplica liquidaciones ni pagos.' },
  { icono: KeyRound, titulo: 'Permisos sobre datos sensibles', texto: 'Acceso mínimo, secretos en servidor y cifrado de datos personales y montos.' },
];

export default function Integraciones() {
  const conectores = useIntegracionesStore((estado) => estado.conectores);
  const mercados = useIntegracionesStore((estado) => estado.mercados);
  const [pasoPago, setPasoPago] = useState(0);
  return (
    <div className="flex flex-col gap-5">
      <p className="flex items-start gap-2 rounded-xl bg-oro-suave px-3 py-2.5 text-[12.5px] text-[#7C4A03]"><Plug className="mt-0.5 size-4 shrink-0" aria-hidden />Ningún conector está conectado. Las tarjetas muestran cómo se integrará cada servicio; todo flujo económico es simulado.</p>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2">
        {conectores.map((conector) => {
          const Icono = iconos[conector.tipo];
          return (
            <Tarjeta key={conector.id} className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primario-suave text-primario"><Icono className="size-5" aria-hidden /></span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] font-bold">{conector.nombre}</h3>
                  <p className="cifra text-[11.5px] text-texto-3">{conector.id}</p>
                </div>
                <Insignia tono={estados[conector.estado].tono} icono={CircleDashed}>{estados[conector.estado].etiqueta}</Insignia>
              </div>
              <p className="text-[12.5px] text-texto-2">{conector.descripcion}</p>
              <ul className="list-disc pl-5 text-[12.5px] text-texto-2">{detalles[conector.tipo].map((linea) => <li key={linea}>{linea}</li>)}</ul>
            </Tarjeta>
          );
        })}
      </div>
      <Tarjeta titulo="Interfaz de pagos desacoplada" subtitulo="Estados de cobro y de pago posterior, siempre simulados" icono={CreditCard} variante="simulacion">
        <ol className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {flujoPagos.map((paso, indice) => (
            <li key={paso} className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 text-[12.5px] font-semibold ${indice <= pasoPago ? 'border-acento bg-acento-suave text-[#155E75]' : 'border-borde bg-superficie text-texto-3'}`}>
              <span className="cifra">{indice + 1}</span>{paso}
            </li>
          ))}
        </ol>
        <Boton tamano="sm" variante="secundario" icono={Play} className="mt-3" onClick={() => setPasoPago((paso) => (paso + 1) % flujoPagos.length)}>{pasoPago === flujoPagos.length - 1 ? 'Reiniciar ejemplo' : 'Avanzar ejemplo'}</Boton>
      </Tarjeta>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
        <Tarjeta titulo="Mercados" subtitulo="País, moneda, idioma, tributos y método de pago" icono={Globe2}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[440px] text-[12.5px]">
              <thead><tr className="border-b border-borde text-left text-[10.5px] font-bold uppercase tracking-[0.08em] text-texto-3"><th className="py-2 pr-3">País</th><th className="py-2 pr-3">Moneda</th><th className="py-2 pr-3">Idioma</th><th className="py-2 pr-3">Tributos</th><th className="py-2">Pago</th></tr></thead>
              <tbody>
                {mercados.map((mercado) => (
                  <tr key={mercado.pais} className="border-b border-borde last:border-0 align-top">
                    <td className="py-2 pr-3 font-semibold">{mercado.pais}</td>
                    <td className="cifra py-2 pr-3">{mercado.moneda}</td>
                    <td className="cifra py-2 pr-3">{mercado.idioma}</td>
                    <td className="py-2 pr-3 text-texto-2">{mercado.tributos}</td>
                    <td className="py-2 text-texto-2">{mercado.metodosPago.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tarjeta>
        <Tarjeta titulo="Resiliencia y operación" subtitulo="Descriptivo para el producto real; no funcional en la demo" icono={ShieldCheck}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {resiliencia.map(({ icono: Icono, titulo, texto }) => (
              <li key={titulo} className="rounded-xl bg-fondo p-3">
                <p className="flex items-center gap-2 text-[13px] font-semibold"><Icono className="size-4 text-acento" aria-hidden />{titulo}</p>
                <p className="mt-1 text-[12px] text-texto-2">{texto}</p>
              </li>
            ))}
          </ul>
        </Tarjeta>
      </div>
    </div>
  );
}
