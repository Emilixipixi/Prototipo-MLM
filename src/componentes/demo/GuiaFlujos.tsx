import { useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Circle, CircleCheckBig, Route, Sparkles, UserRound, X } from 'lucide-react';
import { flujosDemostracion, type EstadoGuia, type PasoFlujo } from '../../datos/guiaFlujos';
import { useBitacoraStore } from '../../store/useBitacoraStore';
import { useCompensacionStore } from '../../store/useCompensacionStore';
import { useComplianceStore } from '../../store/useComplianceStore';
import { useFormacionStore } from '../../store/useFormacionStore';
import { useGuiaStore } from '../../store/useGuiaStore';
import { usePedidosStore } from '../../store/usePedidosStore';
import { usePermisosStore } from '../../store/usePermisosStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import { useRedStore } from '../../store/useRedStore';
import { usePersonaSesion, useSesionStore } from '../../store/useSesionStore';
import { unirClases } from '../../utilidades/clases';
import { BotonIcono } from '../ui/BotonIcono';
import { Cajon } from '../ui/Cajon';
import { useToast } from '../ui/useToast';

const nombresRol: Record<string, string> = {
  'DEMO-U01': 'Superadministrador', 'DEMO-U02': 'Operador', 'DEMO-A01': 'Afiliado DEMO-A01', 'DEMO-C01': 'Cliente DEMO-C01',
};

function useEstadoGuia(): EstadoGuia {
  const personas = usePersonasStore((estado) => estado.personas);
  const posiciones = useRedStore((estado) => estado.posiciones);
  const pedidos = usePedidosStore((estado) => estado.pedidos);
  const movimientos = usePedidosStore((estado) => estado.movimientos);
  const corridas = useCompensacionStore((estado) => estado.corridas);
  const liquidaciones = useCompensacionStore((estado) => estado.liquidaciones);
  const ajustes = useCompensacionStore((estado) => estado.ajustes);
  const formacion = useFormacionStore((estado) => estado.estados);
  const alertas = useComplianceStore((estado) => estado.alertas);
  const bitacora = useBitacoraStore((estado) => estado.registros);
  const permisos = usePermisosStore((estado) => estado.tabla);
  return useMemo(() => ({ personas, posiciones, pedidos, movimientos, corridas, liquidaciones, ajustes, formacion, alertas, bitacora, permisos }), [personas, posiciones, pedidos, movimientos, corridas, liquidaciones, ajustes, formacion, alertas, bitacora, permisos]);
}

export function GuiaFlujos() {
  const { abierta, abrir, cerrar, marcados, alternarPaso, flujoActivo, elegirFlujo } = useGuiaStore();
  const estado = useEstadoGuia();
  const sesion = usePersonaSesion();
  const cambiarRol = useSesionStore((actual) => actual.cambiarRol);
  const navegar = useNavigate();
  const { pathname } = useLocation();
  const conMenuLateral = /^\/(afiliado|corporativo|demo)/.test(pathname);
  const toast = useToast();
  const completado = (paso: PasoFlujo) => Boolean(paso.detectar?.(estado)) || marcados.includes(paso.id);
  const total = flujosDemostracion.reduce((suma, flujo) => suma + flujo.pasos.length, 0);
  const hechos = flujosDemostracion.reduce((suma, flujo) => suma + flujo.pasos.filter(completado).length, 0);
  const flujo = flujosDemostracion.find((item) => item.id === flujoActivo) ?? flujosDemostracion[0];

  const destino = useRef<string | null>(null);

  useEffect(() => {
    if (!destino.current) return;
    const ruta = destino.current;
    destino.current = null;
    navegar(ruta);
  }, [sesion, navegar]);

  const ir = (paso: PasoFlujo) => {
    cerrar();
    if (paso.rolId && sesion?.id !== paso.rolId) {
      const persona = cambiarRol(paso.rolId);
      if (persona) {
        destino.current = paso.ruta;
        toast.info('Rol cambiado para el paso', `Ahora navegas como ${persona.nombres} ${persona.apellidos}.`);
        return;
      }
    }
    navegar(paso.ruta);
  };

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        aria-label="Abrir guía de flujos de demostración"
        className={unirClases('no-imprimir fixed bottom-4 left-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-primario-profundo px-4 text-[13px] font-semibold text-white shadow-flotante transition-transform hover:-translate-y-0.5', conMenuLateral && 'lg:left-[280px]')}
      >
        <Route className="size-5" aria-hidden />
        <span className="hidden sm:inline">Guía de flujos</span>
        <span className="cifra rounded-full bg-white/15 px-2 py-0.5 text-[11.5px]">{hechos}/{total}</span>
      </button>
      <Cajon abierto={abierta} alCerrar={cerrar} etiqueta="Guía de flujos de demostración" lado="derecha" ancho="w-[94vw] max-w-[460px]" className="bg-superficie">
        <div className="flex items-start gap-3 border-b border-borde p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-acento-suave text-acento"><Route className="size-5" aria-hidden /></span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-extrabold">Guía de flujos</h2>
            <p className="text-[12.5px] text-texto-2">F01 a F08 con datos de DEMOSTRACIÓN. Cada paso lleva a su pantalla y cambia de rol si hace falta.</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-fondo"><div className="h-full rounded-full bg-acento transition-all" style={{ width: `${Math.round((hechos / total) * 100)}%` }} /></div>
            <p className="cifra mt-1 text-[11.5px] text-texto-3">{hechos} de {total} pasos completados</p>
          </div>
          <BotonIcono icono={X} etiqueta="Cerrar guía" onClick={cerrar} />
        </div>
        <div className="grid grid-cols-4 gap-1.5 border-b border-borde p-3">
          {flujosDemostracion.map((item) => {
            const listos = item.pasos.filter(completado).length;
            const terminado = listos === item.pasos.length;
            return (
              <button key={item.id} type="button" aria-pressed={item.id === flujo.id} onClick={() => elegirFlujo(item.id)} className={unirClases('flex min-h-11 flex-col items-center justify-center rounded-xl border text-[12px] font-bold', item.id === flujo.id ? 'border-primario bg-primario text-white' : terminado ? 'border-green-200 bg-green-50 text-exito' : 'border-borde text-texto-2 hover:border-texto-3')}>
                <span className="flex items-center gap-1">{terminado && <CheckCircle2 className="size-3.5" aria-hidden />}{item.id}</span>
                <span className="cifra text-[10.5px] font-medium opacity-80">{listos}/{item.pasos.length}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-3 p-4">
          <div>
            <h3 className="text-[15px] font-bold">{flujo.id} · {flujo.titulo}</h3>
            <p className="text-[12.5px] text-texto-2">{flujo.objetivo}</p>
          </div>
          <ol className="flex flex-col gap-2">
            {flujo.pasos.map((paso, indice) => {
              const detectado = Boolean(paso.detectar?.(estado));
              const hecho = detectado || marcados.includes(paso.id);
              return (
                <li key={paso.id} className={unirClases('rounded-xl border p-3', hecho ? 'border-green-200 bg-green-50/60' : 'border-borde')}>
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={hecho}
                      aria-label={`Marcar paso ${indice + 1} como completado`}
                      disabled={detectado}
                      onClick={() => alternarPaso(paso.id)}
                      className="-m-2 grid size-11 shrink-0 place-items-center text-texto-3 disabled:cursor-default"
                    >
                      {hecho ? <CircleCheckBig className="size-5 text-exito" aria-hidden /> : <Circle className="size-5" aria-hidden />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px]"><span className="cifra mr-1 font-bold text-texto-3">{indice + 1}.</span>{paso.texto}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11.5px] text-texto-2">
                        <span className="inline-flex items-center gap-1"><UserRound className="size-3.5" aria-hidden />{paso.rolId ? nombresRol[paso.rolId] ?? paso.rolId : 'Visitante (sin cambiar rol)'}</span>
                        {detectado && <span className="inline-flex items-center gap-1 font-semibold text-exito"><Sparkles className="size-3.5" aria-hidden />Detectado en los datos</span>}
                      </div>
                    </div>
                    <button type="button" onClick={() => ir(paso)} className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-2 text-[12.5px] font-semibold text-acento hover:bg-acento-suave md:min-h-9">
                      Ir<ArrowRight className="size-3.5" aria-hidden />
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="text-[11.5px] text-texto-3">Los pasos con evidencia en los datos se marcan solos; el resto se marca a mano. "Reiniciar demostración" limpia la guía. Recargar el navegador también reinicia los datos.</p>
        </div>
      </Cajon>
    </>
  );
}
