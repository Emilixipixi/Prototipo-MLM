import { useErickStore } from '../store/useErickStore';
import type { ConfiguracionErick } from '../tipos/academico';
import { exito, fallo, type Resultado } from '../validaciones/resultado';
import { registrarBitacora } from './registro';

export function validarConfiguracion(datos: ConfiguracionErick): string | null {
  if (datos.razonSocial.trim().length < 3) return 'Ingresa la razón social.';
  if (!/^\d{11,13}$/.test(datos.ruc.trim())) return 'El RUC debe tener entre 11 y 13 dígitos.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correoContacto.trim())) return 'Ingresa un correo de contacto válido.';
  if (datos.textoCertificado.trim().length < 20) return 'El texto del certificado debe tener al menos 20 caracteres.';
  if (!Number.isInteger(datos.mesesAccesoPorDefecto) || datos.mesesAccesoPorDefecto < 1 || datos.mesesAccesoPorDefecto > 24) return 'Los meses de acceso deben estar entre 1 y 24.';
  if (!Number.isInteger(datos.intentosPorDefecto) || datos.intentosPorDefecto < 1 || datos.intentosPorDefecto > 10) return 'Los intentos deben estar entre 1 y 10.';
  return null;
}

export function guardarConfiguracion(datos: ConfiguracionErick, actorId: string): Resultado<ConfiguracionErick> {
  const error = validarConfiguracion(datos);
  if (error) return fallo(error);
  const { configuracion, actualizar } = useErickStore.getState();
  const nueva: ConfiguracionErick = {
    ...datos, razonSocial: datos.razonSocial.trim(), ruc: datos.ruc.trim(), direccion: datos.direccion.trim(),
    correoContacto: datos.correoContacto.trim(), telefono: datos.telefono.trim(), textoCertificado: datos.textoCertificado.trim(),
  };
  const cambios = (Object.keys(nueva) as Array<keyof ConfiguracionErick>).filter((clave) => nueva[clave] !== configuracion[clave]);
  if (cambios.length === 0) return fallo('No hay cambios para guardar.');
  actualizar({ configuracion: nueva });
  registrarBitacora({
    actorId, accion: 'Configuración ERICK actualizada', modulo: 'configuracion_erick', motivo: `Campos: ${cambios.join(', ')}`,
    antes: Object.fromEntries(cambios.map((clave) => [clave, configuracion[clave]])), despues: Object.fromEntries(cambios.map((clave) => [clave, nueva[clave]])),
  });
  return exito(nueva);
}
