import type { StoreApi, UseBoundStore } from 'zustand';
import { pedidosIniciales } from '../datos/pedidos';
import { personasIniciales } from '../datos/personas';
import { productosIniciales } from '../datos/productos';
import { useBitacoraStore } from './useBitacoraStore';
import { useCarritoStore } from './useCarritoStore';
import { useCatalogoStore } from './useCatalogoStore';
import { useCompensacionStore } from './useCompensacionStore';
import { useComplianceStore } from './useComplianceStore';
import { useDescuentosStore } from './useDescuentosStore';
import { useFormacionStore } from './useFormacionStore';
import { useGuiaStore } from './useGuiaStore';
import { useIntegracionesStore } from './useIntegracionesStore';
import { useNotificacionesStore } from './useNotificacionesStore';
import { usePedidosStore } from './usePedidosStore';
import { usePeriodosStore } from './usePeriodosStore';
import { usePermisosStore } from './usePermisosStore';
import { usePersonasStore } from './usePersonasStore';
import { useRedStore } from './useRedStore';
import { useSesionStore } from './useSesionStore';

type Tienda = UseBoundStore<StoreApi<object>>;
type Instantanea = Record<string, Record<string, unknown>>;

const version = `v1-${personasIniciales.length}-${pedidosIniciales.length}-${productosIniciales.length}`;
const claveCompartida = `mlm2027-demo-datos-${version}`;
const claveSesion = `mlm2027-demo-sesion-${version}`;

const compartidas: Record<string, Tienda> = {
  personas: usePersonasStore, red: useRedStore, catalogo: useCatalogoStore, pedidos: usePedidosStore,
  periodos: usePeriodosStore, formacion: useFormacionStore, compliance: useComplianceStore,
  integraciones: useIntegracionesStore, compensacion: useCompensacionStore, permisos: usePermisosStore,
  notificaciones: useNotificacionesStore, bitacora: useBitacoraStore, descuentos: useDescuentosStore,
};

const porPestana: Record<string, Tienda> = { sesion: useSesionStore, guia: useGuiaStore, carrito: useCarritoStore };

function datos(tienda: Tienda): Record<string, unknown> {
  return Object.fromEntries(Object.entries(tienda.getState()).filter(([, valor]) => typeof valor !== 'function'));
}

function capturar(tiendas: Record<string, Tienda>): string {
  return JSON.stringify(Object.fromEntries(Object.entries(tiendas).map(([nombre, tienda]) => [nombre, datos(tienda)])));
}

function aplicar(tiendas: Record<string, Tienda>, texto: string | null): void {
  if (!texto) return;
  let instantanea: Instantanea;
  try {
    instantanea = JSON.parse(texto) as Instantanea;
  } catch {
    return;
  }
  Object.entries(tiendas).forEach(([nombre, tienda]) => {
    const guardado = instantanea[nombre];
    if (guardado && typeof guardado === 'object') tienda.setState(guardado);
  });
}

function leer(almacen: Storage | undefined, clave: string): string | null {
  try {
    return almacen?.getItem(clave) ?? null;
  } catch {
    return null;
  }
}

function escribir(almacen: Storage | undefined, clave: string, valor: string): void {
  try {
    if (almacen && almacen.getItem(clave) !== valor) almacen.setItem(clave, valor);
  } catch {
    return;
  }
}

function limpiarVersionesAnteriores(almacen: Storage | undefined, vigente: string, prefijo: string): void {
  try {
    if (!almacen) return;
    Object.keys(almacen).filter((clave) => clave.startsWith(prefijo) && clave !== vigente).forEach((clave) => almacen.removeItem(clave));
  } catch {
    return;
  }
}

function sincronizar(tiendas: Record<string, Tienda>, almacen: Storage | undefined, clave: string): void {
  let pendiente: ReturnType<typeof setTimeout> | null = null;
  const guardar = () => {
    if (pendiente) clearTimeout(pendiente);
    pendiente = setTimeout(() => escribir(almacen, clave, capturar(tiendas)), 150);
  };
  Object.values(tiendas).forEach((tienda) => tienda.subscribe(guardar));
}

export function iniciarPersistencia(): void {
  if (typeof window === 'undefined') return;
  const local = window.localStorage as Storage | undefined;
  const sesion = window.sessionStorage as Storage | undefined;
  limpiarVersionesAnteriores(local, claveCompartida, 'mlm2027-demo-datos-');
  limpiarVersionesAnteriores(sesion, claveSesion, 'mlm2027-demo-sesion-');
  aplicar(compartidas, leer(local, claveCompartida));
  aplicar(porPestana, leer(sesion, claveSesion));
  sincronizar(compartidas, local, claveCompartida);
  sincronizar(porPestana, sesion, claveSesion);
  window.addEventListener('storage', (evento) => {
    if (evento.key === claveCompartida) aplicar(compartidas, evento.newValue);
  });
}
