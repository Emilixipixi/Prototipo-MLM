import type { Producto } from '../tipos/catalogo';

export const productosIniciales: Producto[] = [
  {
    id: 'DEMO-PRD-01', codigo: 'DEMO-PRD-01', nombre: 'Programa Liderazgo Comercial - Nivel 1',
    descripcion: 'Programa formativo de liderazgo y gestión comercial. Acceso a través de la plataforma educativa ERIC S.A.C. (vínculo conceptual).',
    categoria: 'programa_formativo', precio: 250, vp: 100, vc: 80, moneda: 'USD',
    vigenteDesde: '2026-01-01', vigenteHasta: null, activo: true, proveedorFormativo: 'ERIC S.A.C.',
  },
  {
    id: 'DEMO-PRD-02', codigo: 'DEMO-PRD-02', nombre: 'Kit Nutricional Premium',
    descripcion: 'Kit de bienes físicos con suplementos y accesorios de nutrición. Producto ficticio para la demostración.',
    categoria: 'bien_fisico', precio: 120, vp: 60, vc: 45, moneda: 'USD',
    vigenteDesde: '2026-01-01', vigenteHasta: null, activo: true,
  },
  {
    id: 'DEMO-PRD-03', codigo: 'DEMO-PRD-03', nombre: 'Asesoría de Imagen Personal',
    descripcion: 'Servicio de asesoría personalizada. Su VC es mayor que su VP a propósito: no existe equivalencia obligatoria entre valores.',
    categoria: 'servicio', precio: 80, vp: 20, vc: 30, moneda: 'USD',
    vigenteDesde: '2026-01-01', vigenteHasta: null, activo: true,
  },
  {
    id: 'DEMO-PRD-04', codigo: 'DEMO-PRD-04', nombre: 'Set de Cuidado Personal',
    descripcion: 'Bien físico con productos de cuidado personal. Producto ficticio para la demostración.',
    categoria: 'bien_fisico', precio: 65, vp: 30, vc: 25, moneda: 'USD',
    vigenteDesde: '2026-01-01', vigenteHasta: null, activo: true,
  },
  {
    id: 'DEMO-PRD-05', codigo: 'DEMO-PRD-05', nombre: 'Taller de Ventas Digitales',
    descripcion: 'Programa formativo práctico de ventas en canales digitales, ofrecido por ERIC S.A.C. (vínculo conceptual).',
    categoria: 'programa_formativo', precio: 150, vp: 70, vc: 50, moneda: 'USD',
    vigenteDesde: '2026-01-01', vigenteHasta: null, activo: true, proveedorFormativo: 'ERIC S.A.C.',
  },
  {
    id: 'DEMO-PRD-06', codigo: 'DEMO-PRD-06', nombre: 'Membresía Anual de Servicios',
    descripcion: 'Servicio con vigencia vencida. Se mantiene inactivo para mostrar el control de vigencia del catálogo.',
    categoria: 'servicio', precio: 300, vp: 120, vc: 90, moneda: 'USD',
    vigenteDesde: '2025-01-01', vigenteHasta: '2025-12-31', activo: false,
  },
];
