import type { Persona } from '../tipos/persona';
import { personasAmpliadas } from './ampliacion';

const personasFase1: Persona[] = [
  {
    id: 'DEMO-U01', codigo: 'DEMO-U01', nombres: 'Admin', apellidos: 'Demo',
    tipo: 'corporativo', perfil: 'superadministrador', estado: 'activo',
    correo: 'admin@correo.demo', telefono: '+51 900 000 001', documento: 'DEMO-DOC-001',
    pais: 'Perú', moneda: 'USD', idioma: 'es', fechaAlta: '2026-01-05', referenteId: null,
  },
  {
    id: 'DEMO-U02', codigo: 'DEMO-U02', nombres: 'Operador', apellidos: 'Demo',
    tipo: 'corporativo', perfil: 'operador', estado: 'activo',
    correo: 'operador@correo.demo', telefono: '+51 900 000 002', documento: 'DEMO-DOC-002',
    pais: 'Perú', moneda: 'USD', idioma: 'es', fechaAlta: '2026-02-10', referenteId: null,
  },
  {
    id: 'DEMO-A01', codigo: 'DEMO-A01', nombres: 'Mariana', apellidos: 'Vega Ruiz',
    tipo: 'empresario', perfil: 'afiliado', estado: 'activo',
    correo: 'mariana.vega@correo.demo', telefono: '+51 900 000 011', documento: 'DEMO-DOC-011',
    pais: 'Perú', moneda: 'USD', idioma: 'es', fechaAlta: '2025-03-14', referenteId: 'DEMO-A00',
  },
  {
    id: 'DEMO-C01', codigo: 'DEMO-C01', nombres: 'Rosa', apellidos: 'Delgado Arce',
    tipo: 'cliente', perfil: 'cliente_alumno', estado: 'activo',
    correo: 'rosa.delgado@correo.demo', telefono: '+51 900 000 051', documento: 'DEMO-DOC-051',
    pais: 'Perú', moneda: 'USD', idioma: 'es', fechaAlta: '2026-06-22', referenteId: 'DEMO-A01',
  },
  {
    id: 'DEMO-L01', codigo: 'DEMO-L01', nombres: 'Gabriela', apellidos: 'Ponce Lara',
    tipo: 'alumno', perfil: 'cliente_alumno', estado: 'activo',
    correo: 'gabriela.ponce@correo.demo', telefono: '+51 900 000 061', documento: 'DEMO-DOC-061',
    pais: 'Perú', moneda: 'USD', idioma: 'es', fechaAlta: '2026-09-03', referenteId: 'DEMO-A04',
  },
];

const personasRed: Persona[] = [
  {
    id: 'DEMO-A00', codigo: 'DEMO-A00', nombres: 'Organización Raíz', apellidos: 'Demo',
    tipo: 'empresario', perfil: 'afiliado', estado: 'activo',
    correo: 'raiz.demo@correo.demo', telefono: '+51 900 000 010', documento: 'DEMO-DOC-010',
    pais: 'Perú', moneda: 'USD', idioma: 'es', fechaAlta: '2024-01-15', referenteId: null,
  },
  {
    id: 'DEMO-A02', codigo: 'DEMO-A02', nombres: 'Jorge', apellidos: 'Salinas Paz',
    tipo: 'empresario', perfil: 'afiliado', estado: 'activo',
    correo: 'jorge.salinas@correo.demo', telefono: '+51 900 000 012', documento: 'DEMO-DOC-012',
    pais: 'Perú', moneda: 'USD', idioma: 'es', fechaAlta: '2025-04-02', referenteId: 'DEMO-A00',
  },
  {
    id: 'DEMO-A03', codigo: 'DEMO-A03', nombres: 'Diego', apellidos: 'Paredes Luna',
    tipo: 'empresario', perfil: 'afiliado', estado: 'activo',
    correo: 'diego.paredes@correo.demo', telefono: '+51 900 000 013', documento: 'DEMO-DOC-013',
    pais: 'Perú', moneda: 'USD', idioma: 'es', fechaAlta: '2025-05-19', referenteId: 'DEMO-A01',
  },
  {
    id: 'DEMO-A04', codigo: 'DEMO-A04', nombres: 'Sofía', apellidos: 'Ramos Celi',
    tipo: 'empresario', perfil: 'afiliado', estado: 'activo',
    correo: 'sofia.ramos@correo.demo', telefono: '+51 900 000 014', documento: 'DEMO-DOC-014',
    pais: 'Perú', moneda: 'USD', idioma: 'es', fechaAlta: '2025-07-08', referenteId: 'DEMO-A01',
  },
  {
    id: 'DEMO-A05', codigo: 'DEMO-A05', nombres: 'Andrés', apellidos: 'Quispe Mamani',
    tipo: 'empresario', perfil: 'afiliado', estado: 'suspendido',
    correo: 'andres.quispe@correo.demo', telefono: '+51 900 000 015', documento: 'DEMO-DOC-015',
    pais: 'Perú', moneda: 'USD', idioma: 'es', fechaAlta: '2025-09-11', referenteId: 'DEMO-A01',
  },
  {
    id: 'DEMO-A06', codigo: 'DEMO-A06', nombres: 'Valeria', apellidos: 'Torres Ríos',
    tipo: 'empresario', perfil: 'afiliado', estado: 'activo',
    correo: 'valeria.torres@correo.demo', telefono: '+51 900 000 016', documento: 'DEMO-DOC-016',
    pais: 'Perú', moneda: 'USD', idioma: 'es', fechaAlta: '2026-10-20', referenteId: 'DEMO-A01',
  },
  {
    id: 'DEMO-A07', codigo: 'DEMO-A07', nombres: 'Luis', apellidos: 'Herrera Campos',
    tipo: 'empresario', perfil: 'afiliado', estado: 'activo',
    correo: 'luis.herrera@correo.demo', telefono: '+51 900 000 017', documento: 'DEMO-DOC-017',
    pais: 'Perú', moneda: 'USD', idioma: 'es', fechaAlta: '2025-11-03', referenteId: 'DEMO-A03',
  },
  {
    id: 'DEMO-A08', codigo: 'DEMO-A08', nombres: 'Camila', apellidos: 'Ortiz Vera',
    tipo: 'empresario', perfil: 'afiliado', estado: 'activo',
    correo: 'camila.ortiz@correo.demo', telefono: '+51 900 000 018', documento: 'DEMO-DOC-018',
    pais: 'Perú', moneda: 'USD', idioma: 'es', fechaAlta: '2026-01-22', referenteId: 'DEMO-A04',
  },
  {
    id: 'DEMO-A09', codigo: 'DEMO-A09', nombres: 'Ricardo', apellidos: 'Méndez Soto',
    tipo: 'empresario', perfil: 'afiliado', estado: 'activo',
    correo: 'ricardo.mendez@correo.demo', telefono: '+51 900 000 029', documento: 'DEMO-DOC-029',
    pais: 'Perú', moneda: 'USD', idioma: 'es', fechaAlta: '2026-03-14', referenteId: 'DEMO-A06',
  },
  {
    id: 'DEMO-A10', codigo: 'DEMO-A10', nombres: 'Paola', apellidos: 'Castro Jiménez',
    tipo: 'empresario', perfil: 'afiliado', estado: 'activo',
    correo: 'paola.castro@correo.demo', telefono: '+51 900 000 020', documento: 'DEMO-DOC-020',
    pais: 'Perú', moneda: 'USD', idioma: 'es', fechaAlta: '2026-02-09', referenteId: 'DEMO-A07',
  },
  {
    id: 'DEMO-A11', codigo: 'DEMO-A11', nombres: 'Ricardo', apellidos: 'Mendes Soto',
    tipo: 'empresario', perfil: 'afiliado', estado: 'pendiente',
    correo: 'r.mendes.soto@correo.demo', telefono: '+51 900 000 029', documento: 'DEMO-DOC-029',
    pais: 'Perú', moneda: 'USD', idioma: 'es', fechaAlta: '2026-11-08', referenteId: 'DEMO-A06',
  },
  {
    id: 'DEMO-A12', codigo: 'DEMO-A12', nombres: 'Tomás', apellidos: 'Vargas León',
    tipo: 'empresario', perfil: 'afiliado', estado: 'activo',
    correo: 'tomas.vargas@correo.demo', telefono: '+51 900 000 022', documento: 'DEMO-DOC-022',
    pais: 'Perú', moneda: 'USD', idioma: 'es', fechaAlta: '2026-10-21', referenteId: 'DEMO-A10',
  },
  {
    id: 'DEMO-A13', codigo: 'DEMO-A13', nombres: 'Elena', apellidos: 'Rojas Pinto',
    tipo: 'empresario', perfil: 'afiliado', estado: 'activo',
    correo: 'elena.rojas@correo.demo', telefono: '+51 900 000 023', documento: 'DEMO-DOC-023',
    pais: 'Perú', moneda: 'USD', idioma: 'es', fechaAlta: '2026-04-27', referenteId: 'DEMO-A12',
  },
  {
    id: 'DEMO-A14', codigo: 'DEMO-A14', nombres: 'Marco', apellidos: 'Flores Aguilar',
    tipo: 'empresario', perfil: 'afiliado', estado: 'activo',
    correo: 'marco.flores@correo.demo', telefono: '+51 900 000 024', documento: 'DEMO-DOC-024',
    pais: 'Perú', moneda: 'USD', idioma: 'es', fechaAlta: '2026-06-05', referenteId: 'DEMO-A13',
  },
  {
    id: 'DEMO-A15', codigo: 'DEMO-A15', nombres: 'Natalia', apellidos: 'Cruz Medina',
    tipo: 'empresario', perfil: 'afiliado', estado: 'activo',
    correo: 'natalia.cruz@correo.demo', telefono: '+51 900 000 025', documento: 'DEMO-DOC-025',
    pais: 'Perú', moneda: 'USD', idioma: 'es', fechaAlta: '2026-08-17', referenteId: 'DEMO-A14',
  },
  {
    id: 'DEMO-C02', codigo: 'DEMO-C02', nombres: 'Héctor', apellidos: 'Núñez Bravo',
    tipo: 'cliente', perfil: 'cliente_alumno', estado: 'activo',
    correo: 'hector.nunez@correo.demo', telefono: '+51 900 000 052', documento: 'DEMO-DOC-052',
    pais: 'Perú', moneda: 'USD', idioma: 'es', fechaAlta: '2026-07-30', referenteId: 'DEMO-A03',
  },
  {
    id: 'DEMO-C03', codigo: 'DEMO-C03', nombres: 'Bruno', apellidos: 'Salazar Ibarra',
    tipo: 'cliente', perfil: 'cliente_alumno', estado: 'bloqueado',
    correo: 'bruno.salazar@correo.demo', telefono: '+51 900 000 053', documento: 'DEMO-DOC-053',
    pais: 'Perú', moneda: 'USD', idioma: 'es', fechaAlta: '2026-05-12', referenteId: 'DEMO-A02',
  },
];

export const personasIniciales: Persona[] = [...personasFase1, ...personasRed, ...personasAmpliadas];
