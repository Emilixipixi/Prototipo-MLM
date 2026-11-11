import { useMemo, useState, type ReactNode } from 'react';
import { Bell, BellOff, CalendarCheck, CheckCheck, Receipt, RefreshCw, ShoppingCart, X, type LucideIcon } from 'lucide-react';
import { useClicFuera } from '../../hooks/useClicFuera';
import { useEsMovil } from '../../hooks/useEsMovil';
import { filtrarPorPersona, useNotificacionesStore } from '../../store/useNotificacionesStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { Notificacion } from '../../tipos/notificacion';
import { unirClases } from '../../utilidades/clases';
import { formatearFechaHora } from '../../utilidades/fechas';
import { BotonIcono } from '../ui/BotonIcono';
import { Cajon } from '../ui/Cajon';
import { EstadoVacio } from '../ui/EstadoVacio';

const iconos: Record<Notificacion['tipo'], { icono: LucideIcon; clase: string }> = {
  compra: { icono: ShoppingCart, clase: 'bg-acento-suave text-acento' },
  estado: { icono: RefreshCw, clase: 'bg-amber-100 text-advertencia' },
  cierre: { icono: CalendarCheck, clase: 'bg-primario-suave text-primario' },
  liquidacion: { icono: Receipt, clase: 'bg-green-100 text-exito' },
};

export function CentroNotificaciones() {
  const [abierto, setAbierto] = useState(false);
  const persona = usePersonaSesion();
  const todas = useNotificacionesStore((estado) => estado.notificaciones);
  const marcarLeida = useNotificacionesStore((estado) => estado.marcarLeida);
  const marcarTodasLeidas = useNotificacionesStore((estado) => estado.marcarTodasLeidas);
  const esMovil = useEsMovil();
  const referencia = useClicFuera<HTMLDivElement>(abierto && !esMovil, () => setAbierto(false));
  const lista = useMemo(() => filtrarPorPersona(todas, persona), [todas, persona]);
  const noLeidas = lista.filter((item) => !item.leida).length;

  const panel: ReactNode = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-borde px-4 py-3">
        <div>
          <p className="text-[15px] font-bold text-texto">Notificaciones</p>
          <p className="text-xs text-texto-2">{noLeidas === 0 ? 'Todo al día' : `${noLeidas} sin leer`}</p>
        </div>
        <div className="flex items-center gap-1">
          {noLeidas > 0 && (
            <button type="button" onClick={() => marcarTodasLeidas(persona)} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-acento hover:bg-acento-suave md:min-h-9">
              <CheckCheck className="size-4" aria-hidden />
              Marcar todas como leídas
            </button>
          )}
          {esMovil && (
            <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar notificaciones" className="grid size-11 place-items-center rounded-lg text-texto-2 hover:bg-fondo">
              <X className="size-5" aria-hidden />
            </button>
          )}
        </div>
      </div>
      {lista.length === 0 ? (
        <EstadoVacio icono={BellOff} titulo="Sin notificaciones" texto="Aquí verás avisos de compras, cambios de estado, cierres y liquidaciones." />
      ) : (
        <ul className="flex-1 divide-y divide-borde overflow-y-auto md:max-h-[420px]">
          {lista.map((item) => {
            const { icono: Icono, clase } = iconos[item.tipo];
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => marcarLeida(item.id)}
                  className={unirClases('flex w-full gap-3 px-4 py-3 text-left hover:bg-fondo', !item.leida && 'bg-primario-suave/50')}
                >
                  <span className={unirClases('grid size-9 shrink-0 place-items-center rounded-[10px]', clase)}>
                    <Icono className="size-[18px]" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-texto">{item.titulo}</span>
                      {!item.leida && <span className="size-2 shrink-0 rounded-full bg-brazo-c" aria-label="No leída" />}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] leading-snug text-texto-2">{item.mensaje}</span>
                    <span className="cifra mt-1 block text-[11px] text-texto-3">{formatearFechaHora(item.fecha)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  return (
    <div ref={referencia} className="relative">
      <BotonIcono
        icono={Bell}
        etiqueta={noLeidas > 0 ? `Notificaciones, ${noLeidas} sin leer` : 'Notificaciones'}
        onClick={() => setAbierto((valor) => !valor)}
        aria-expanded={abierto}
        indicador={noLeidas > 0 ? (
          <span className="cifra absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full border-2 border-white bg-brazo-c px-1 text-[10px] font-semibold text-white">{noLeidas}</span>
        ) : null}
      />
      {esMovil ? (
        <Cajon abierto={abierto} alCerrar={() => setAbierto(false)} etiqueta="Notificaciones" lado="derecha" ancho="w-full" className="bg-superficie">
          {panel}
        </Cajon>
      ) : abierto && (
        <div className="animar-aparecer absolute right-0 top-full z-50 mt-2 w-[380px] overflow-hidden rounded-xl border border-borde bg-superficie shadow-flotante">
          {panel}
        </div>
      )}
    </div>
  );
}
