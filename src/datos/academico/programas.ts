import type { Programa, ReglasPrograma } from '../../tipos/academico';

export const PROVEEDOR_ACADEMICO = 'ERICK S.A.C.';

export const reglasPorDefecto: ReglasPrograma = {
  intentosMaximos: 3, esperaMinutos: 0, politicaNota: 'mejor', minutosEvaluacion: 30,
  preguntasPorEvaluacion: 5, mostrarRespuestas: true, modoDesbloqueo: 'aprobar_para_avanzar', mesesAcceso: 6,
};

const base = { modalidad: 'Virtual asincrónica' as const, estado: 'publicado' as const, creadoPor: 'DEMO-U01', fecha: '2026-03-02' };

export const programasIniciales: Programa[] = [
  {
    ...base, id: 'DEMO-DIP-01', codigo: 'DEMO-DIP-01', tipo: 'diplomado', nombre: 'Diplomado en Liderazgo y Gestión Comercial',
    descripcion: 'Programa de 120 horas que integra el Curso Liderazgo Comercial y el Curso Gestión de Equipos y Ventas. Al aprobar ambos cursos se emite el diploma.',
    horas: 120, productoId: 'DEMO-PRD-20', cursoIds: ['DEMO-CUR-01', 'DEMO-CUR-02'], moduloIds: [], midId: 'DEMO-MID-01',
    incluidoEnMembresia: true, reglas: { ...reglasPorDefecto, mesesAcceso: 12 }, colores: ['#1E4A37', '#3D8B66'],
  },
  {
    ...base, id: 'DEMO-CUR-01', codigo: 'DEMO-CUR-01', tipo: 'curso', nombre: 'Curso Liderazgo Comercial',
    descripcion: 'Fundamentos del liderazgo, comunicación efectiva y motivación del equipo comercial. 3 módulos de 20 horas.',
    horas: 60, productoId: 'DEMO-PRD-01', cursoIds: [], moduloIds: ['DEMO-MOD-01', 'DEMO-MOD-02', 'DEMO-MOD-03'], midId: null,
    incluidoEnMembresia: true, reglas: { ...reglasPorDefecto }, colores: ['#2E6B4F', '#4FA37B'],
  },
  {
    ...base, id: 'DEMO-CUR-02', codigo: 'DEMO-CUR-02', tipo: 'curso', nombre: 'Curso Gestión de Equipos y Ventas',
    descripcion: 'Planificación comercial, gestión de equipos e indicadores de seguimiento. 3 módulos de 20 horas.',
    horas: 60, productoId: 'DEMO-PRD-07', cursoIds: [], moduloIds: ['DEMO-MOD-04', 'DEMO-MOD-05', 'DEMO-MOD-06'], midId: null,
    incluidoEnMembresia: true, reglas: { ...reglasPorDefecto }, colores: ['#245C43', '#4C9A86'],
  },
  {
    ...base, id: 'DEMO-CUR-03', codigo: 'DEMO-CUR-03', tipo: 'curso', nombre: 'Curso Ventas Digitales',
    descripcion: 'Presencia digital, embudo de conversión y fidelización de clientes en canales digitales. 3 módulos de 20 horas.',
    horas: 60, productoId: 'DEMO-PRD-05', cursoIds: [], moduloIds: ['DEMO-MOD-07', 'DEMO-MOD-08', 'DEMO-MOD-09'], midId: null,
    incluidoEnMembresia: true, reglas: { ...reglasPorDefecto }, colores: ['#2F6F5E', '#5AAE8E'],
  },
  {
    ...base, id: 'DEMO-MID-01', codigo: 'DEMO-MID-01', tipo: 'mid', nombre: 'Módulo de Investigación y Desarrollo',
    descripcion: 'Módulo complementario de 20 horas con sustentación evaluada por un evaluador autorizado. No es requisito del diploma.',
    horas: 20, productoId: null, cursoIds: [], moduloIds: [], midId: null,
    incluidoEnMembresia: false, reglas: { ...reglasPorDefecto }, colores: ['#7C5A12', '#C8A24A'],
  },
];
