const BASE = 'erick-videos';
const ALMACEN = 'videos';
export const TAMANO_MAXIMO_VIDEO = 300 * 1024 * 1024;
export const FORMATOS_VIDEO = ['video/mp4', 'video/webm'];

export function validarArchivoVideo(archivo: { type: string; size: number }): string | null {
  if (!FORMATOS_VIDEO.includes(archivo.type)) return 'Usa un video MP4 o WEBM.';
  if (archivo.size <= 0) return 'El archivo está vacío.';
  if (archivo.size > TAMANO_MAXIMO_VIDEO) return 'El video supera los 300 MB.';
  return null;
}

export function indexedDbDisponible(): boolean {
  return typeof indexedDB !== 'undefined';
}

function abrir(): Promise<IDBDatabase> {
  return new Promise((resolver, rechazar) => {
    if (!indexedDbDisponible()) {
      rechazar(new Error('Este navegador no permite guardar videos localmente; usa un enlace de YouTube.'));
      return;
    }
    const solicitud = indexedDB.open(BASE, 1);
    solicitud.onupgradeneeded = () => {
      if (!solicitud.result.objectStoreNames.contains(ALMACEN)) solicitud.result.createObjectStore(ALMACEN);
    };
    solicitud.onsuccess = () => resolver(solicitud.result);
    solicitud.onerror = () => rechazar(solicitud.error ?? new Error('No se pudo abrir el almacenamiento de videos.'));
  });
}

async function operar<T>(modo: IDBTransactionMode, accion: (almacen: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const base = await abrir();
  return new Promise((resolver, rechazar) => {
    const transaccion = base.transaction(ALMACEN, modo);
    const solicitud = accion(transaccion.objectStore(ALMACEN));
    transaccion.oncomplete = () => { base.close(); resolver(solicitud.result); };
    transaccion.onerror = () => { base.close(); rechazar(transaccion.error ?? new Error('No se pudo completar la operación con el video.')); };
    transaccion.onabort = () => { base.close(); rechazar(transaccion.error ?? new Error('El navegador no tiene espacio para guardar el video.')); };
  });
}

export async function guardarVideoLocal(archivo: Blob): Promise<string> {
  const error = validarArchivoVideo(archivo);
  if (error) throw new Error(error);
  const id = `VID-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  await operar('readwrite', (almacen) => almacen.put(archivo, id));
  return id;
}

export async function leerVideoLocal(id: string): Promise<Blob | null> {
  const resultado = await operar<unknown>('readonly', (almacen) => almacen.get(id));
  return resultado instanceof Blob ? resultado : null;
}

export async function borrarVideoLocal(id: string): Promise<void> {
  await operar('readwrite', (almacen) => almacen.delete(id));
}

export async function borrarTodosLosVideos(): Promise<void> {
  if (!indexedDbDisponible()) return;
  await operar('readwrite', (almacen) => almacen.clear());
}
