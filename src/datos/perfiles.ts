import type { PerfilAcceso } from '../tipos/persona';

export const nombresPerfiles: Record<PerfilAcceso, string> = {
  superadministrador: 'Superadministrador',
  operador: 'Operador corporativo',
  afiliado: 'Afiliado / empresario',
  cliente_alumno: 'Cliente / alumno',
};
