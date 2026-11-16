import type { Producto } from '../../tipos/catalogo';
import type { PlanMembresia } from '../../tipos/academico';
import { PROVEEDOR_ACADEMICO } from './programas';

const filasPlanes: Array<[PlanMembresia['meses'], number, number, number]> = [
  [1, 45, 18, 14], [2, 85, 34, 26], [3, 120, 48, 37], [6, 210, 84, 64], [9, 290, 116, 88], [12, 360, 144, 110],
];

export const planesMembresiaIniciales: PlanMembresia[] = filasPlanes.map(([meses], indice) => ({
  id: `DEMO-PLAN-0${indice + 1}`, nombre: `Membresía ERICK ${meses} ${meses === 1 ? 'mes' : 'meses'}`, meses,
  productoId: `DEMO-PRD-${21 + indice}`, activo: true,
}));

export const productosCampus: Producto[] = [
  {
    id: 'DEMO-PRD-20', codigo: 'DEMO-PRD-20', nombre: 'Diplomado en Liderazgo y Gestión Comercial',
    descripcion: 'Diplomado virtual de 120 horas de ERICK S.A.C.: Curso Liderazgo Comercial y Curso Gestión de Equipos y Ventas, con diploma digital verificable.',
    categoria: 'programa_formativo', precio: 520, vp: 210, vc: 160, moneda: 'USD',
    vigenteDesde: '2026-03-01', vigenteHasta: null, activo: true, proveedorFormativo: PROVEEDOR_ACADEMICO,
  },
  ...filasPlanes.map(([meses, precio, vp, vc], indice): Producto => ({
    id: `DEMO-PRD-${21 + indice}`, codigo: `DEMO-PRD-${21 + indice}`, nombre: `Membresía ERICK ${meses} ${meses === 1 ? 'mes' : 'meses'}`,
    descripcion: `Acceso por ${meses} ${meses === 1 ? 'mes' : 'meses'} a todos los cursos y diplomados incluidos en la membresía del Campus ERICK.`,
    categoria: 'programa_formativo', precio, vp, vc, moneda: 'USD',
    vigenteDesde: '2026-03-01', vigenteHasta: null, activo: true, proveedorFormativo: PROVEEDOR_ACADEMICO,
  })),
];
