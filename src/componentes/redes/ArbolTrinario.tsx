import { useEffect, useMemo, useRef } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { Crosshair, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import type { Brazo, PosicionTrinaria } from '../../tipos/red';
import { coloresBrazos } from '../graficos/coloresBrazos';
import { BotonIcono } from '../ui/BotonIcono';
import { NodoPersona } from './NodoPersona';
import type { ResumenNodo } from './tipos';

const ANCHO_NODO = 228;
const ALTO_NODO = 66;
const ANCHO_LIBRE = 76;
const SEPARACION_X = 18;
const SEPARACION_Y = 72;
const brazos: Brazo[] = ['A', 'B', 'C'];

interface NodoArbol { tipo: 'nodo'; posicion: PosicionTrinaria; hijos: Array<NodoArbol | Libre>; ancho: number; }
interface Libre { tipo: 'libre'; brazo: Brazo; padreId: string; ancho: number; }
interface Ubicado { tipo: 'nodo' | 'libre'; x: number; y: number; posicion?: PosicionTrinaria; brazo: Brazo | null; padreX?: number; padreY?: number; clave: string; }

function construir(posicion: PosicionTrinaria, activas: PosicionTrinaria[], profundidad: number, maxima: number): NodoArbol {
  const hijos: Array<NodoArbol | Libre> = profundidad >= maxima ? [] : brazos.map((brazo) => {
    const hija = activas.find((item) => item.padrePosicionId === posicion.id && item.brazo === brazo);
    return hija ? construir(hija, activas, profundidad + 1, maxima) : { tipo: 'libre', brazo, padreId: posicion.id, ancho: ANCHO_LIBRE };
  });
  const anchoHijos = hijos.reduce((suma, hijo) => suma + hijo.ancho, 0) + Math.max(0, hijos.length - 1) * SEPARACION_X;
  return { tipo: 'nodo', posicion, hijos, ancho: Math.max(ANCHO_NODO, anchoHijos) };
}

function ubicar(nodo: NodoArbol, izquierda: number, nivel: number, lista: Ubicado[], padre?: { x: number; y: number }) {
  const centro = izquierda + nodo.ancho / 2;
  const y = nivel * (ALTO_NODO + SEPARACION_Y);
  lista.push({ tipo: 'nodo', x: centro, y, posicion: nodo.posicion, brazo: nodo.posicion.brazo, padreX: padre?.x, padreY: padre?.y, clave: nodo.posicion.id });
  const anchoHijos = nodo.hijos.reduce((suma, hijo) => suma + hijo.ancho, 0) + Math.max(0, nodo.hijos.length - 1) * SEPARACION_X;
  let cursor = centro - anchoHijos / 2;
  nodo.hijos.forEach((hijo) => {
    if (hijo.tipo === 'nodo') ubicar(hijo, cursor, nivel + 1, lista, { x: centro, y });
    else lista.push({ tipo: 'libre', x: cursor + hijo.ancho / 2, y: (nivel + 1) * (ALTO_NODO + SEPARACION_Y), brazo: hijo.brazo, padreX: centro, padreY: y, clave: `${hijo.padreId}-${hijo.brazo}` });
    cursor += hijo.ancho + SEPARACION_X;
  });
}

interface PropsArbolTrinario {
  raizPosicionId: string;
  posiciones: PosicionTrinaria[];
  resumen: Map<string, ResumenNodo>;
  resaltadoId: string | null;
  alSeleccionar: (nodo: ResumenNodo) => void;
  profundidadMaxima?: number;
  alto?: number;
}

export function ArbolTrinario({ raizPosicionId, posiciones, resumen, resaltadoId, alSeleccionar, profundidadMaxima = 8, alto = 560 }: PropsArbolTrinario) {
  const { ubicados, ancho, altoTotal } = useMemo(() => {
    const activas = posiciones.filter((posicion) => posicion.estado === 'activa');
    const raiz = activas.find((posicion) => posicion.id === raizPosicionId);
    if (!raiz) return { ubicados: [] as Ubicado[], ancho: 0, altoTotal: 0 };
    const arbol = construir(raiz, activas, 0, profundidadMaxima);
    const lista: Ubicado[] = [];
    ubicar(arbol, 0, 0, lista);
    const niveles = Math.max(...lista.map((item) => item.y)) + ALTO_NODO;
    return { ubicados: lista, ancho: arbol.ancho, altoTotal: niveles };
  }, [posiciones, raizPosicionId, profundidadMaxima]);

  if (ubicados.length === 0) return null;
  const raizPersona = ubicados[0].posicion?.personaId ?? '';

  return (
    <div className="relative overflow-hidden rounded-xl border border-borde bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:18px_18px]">
      <TransformWrapper initialScale={0.6} minScale={0.2} maxScale={1.6} limitToBounds={false} centerOnInit wheel={{ step: 0.08 }} doubleClick={{ disabled: true }}>
        {({ zoomIn, zoomOut, resetTransform, zoomToElement }) => (
          <>
            <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
              <BotonIcono icono={ZoomIn} etiqueta="Acercar" onClick={() => zoomIn()} />
              <BotonIcono icono={ZoomOut} etiqueta="Alejar" onClick={() => zoomOut()} />
              <BotonIcono icono={Maximize2} etiqueta="Ver completo" onClick={() => resetTransform()} />
              <BotonIcono icono={Crosshair} etiqueta="Centrar en mi posición" onClick={() => zoomToElement(`nodo-${raizPersona}`, 1)} />
            </div>
            {resaltadoId && <EnfocarAutomatico id={`nodo-${resaltadoId}`} enfocar={zoomToElement} />}
            <TransformComponent wrapperStyle={{ width: '100%', height: `${alto}px` }}>
              <div className="relative" style={{ width: ancho, height: altoTotal }}>
                <svg className="pointer-events-none absolute inset-0" width={ancho} height={altoTotal} aria-hidden>
                  {ubicados.filter((item) => item.padreX !== undefined).map((item) => {
                    const desdeY = (item.padreY ?? 0) + ALTO_NODO;
                    const medio = desdeY + SEPARACION_Y / 2;
                    const color = item.brazo ? coloresBrazos[item.brazo] : '#CBD5E1';
                    return (
                      <path key={`linea-${item.clave}`} d={`M${item.padreX} ${desdeY} V${medio} H${item.x} V${item.y}`} fill="none" stroke={item.tipo === 'libre' ? '#CBD5E1' : color} strokeWidth={item.tipo === 'libre' ? 1.2 : 1.8} strokeDasharray={item.tipo === 'libre' ? '4 4' : undefined} />
                    );
                  })}
                </svg>
                {ubicados.map((item) => {
                  if (item.tipo === 'libre') {
                    return (
                      <div key={item.clave} className="absolute flex flex-col items-center justify-center rounded-xl border border-dashed border-borde bg-superficie/80 text-center" style={{ left: item.x - ANCHO_LIBRE / 2, top: item.y, width: ANCHO_LIBRE, height: 46 }}>
                        <span className="text-[11px] font-extrabold" style={{ color: item.brazo ? coloresBrazos[item.brazo] : undefined }}>{item.brazo}</span>
                        <span className="text-[10px] font-semibold text-texto-3">Disponible</span>
                      </div>
                    );
                  }
                  const nodo = item.posicion ? resumen.get(item.posicion.personaId) : undefined;
                  if (!nodo) return null;
                  const esRaiz = item.padreX === undefined;
                  const distinto = !esRaiz && nodo.patrocinadorId !== nodo.padrePosicionPersonaId;
                  return (
                    <div key={item.clave} className="absolute" style={{ left: item.x - ANCHO_NODO / 2, top: item.y }}>
                      {item.brazo && !esRaiz && (
                        <span className="absolute -top-3 left-3 z-10 grid size-6 place-items-center rounded-md text-[11px] font-extrabold text-white shadow-sm" style={{ background: coloresBrazos[item.brazo] }}>{item.brazo}</span>
                      )}
                      <NodoPersona nodo={nodo} anchoFijo esRaiz={esRaiz} resaltado={resaltadoId === nodo.personaId} colorBorde={item.brazo ? coloresBrazos[item.brazo] : undefined} alSeleccionar={alSeleccionar} nota={distinto ? `Patrocinador: ${nodo.patrocinadorId ?? 'sin asignar'}` : esRaiz ? item.posicion?.id : undefined} />
                    </div>
                  );
                })}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}

function EnfocarAutomatico({ id, enfocar }: { id: string; enfocar: (nodo: string, escala?: number) => Promise<void> }) {
  const referencia = useRef(enfocar);
  useEffect(() => {
    referencia.current = enfocar;
  }, [enfocar]);
  useEffect(() => {
    const temporizador = window.setTimeout(() => { void referencia.current(id, 1); }, 80);
    return () => window.clearTimeout(temporizador);
  }, [id]);
  return null;
}
