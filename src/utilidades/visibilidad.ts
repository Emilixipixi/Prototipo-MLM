import type { Persona } from '../tipos/persona';

export function puedeVerVolumen(persona: Persona | null | undefined): boolean {
  return persona?.perfil === 'afiliado' || persona?.perfil === 'superadministrador' || persona?.perfil === 'operador';
}

export function esCorporativo(persona: Persona | null | undefined): boolean {
  return persona?.perfil === 'superadministrador' || persona?.perfil === 'operador';
}

export function enmascararCorreo(correo: string): string {
  const [usuario, dominio] = correo.split('@');
  if (!dominio) return correo;
  return `${usuario.charAt(0)}***@${dominio}`;
}

export function enmascararTelefono(telefono: string): string {
  return telefono.replace(/\d(?=\d{2})/g, '*');
}
