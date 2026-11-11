import {
  Award, CalendarRange, Database, ClipboardCheck, FileChartColumn, Gift, GraduationCap, House, KeyRound,
  LayoutDashboard, Network, Package, Plug, Receipt, ScrollText, ShieldAlert, ShoppingCart, SlidersHorizontal,
  Calculator, TrendingUp, Users, Workflow, type LucideIcon,
} from 'lucide-react';
import type { ModuloPermiso } from '../tipos/permisos';

export interface ItemNavegacion {
  texto: string;
  ruta: string;
  icono: LucideIcon;
  modulo?: ModuloPermiso;
  hijos?: Array<{ texto: string; ruta: string }>;
}

export interface GrupoNavegacion { titulo: string; items: ItemNavegacion[]; }

export const navegacionAfiliado: GrupoNavegacion[] = [
  {
    titulo: 'General',
    items: [
      { texto: 'Mi inicio', ruta: '/afiliado/inicio', icono: House },
      {
        texto: 'Mis redes', ruta: '/afiliado/redes', icono: Network,
        hijos: [
          { texto: 'Unilevel', ruta: '/afiliado/redes/unilevel' },
          { texto: 'Trinaria', ruta: '/afiliado/redes/trinaria' },
        ],
      },
      { texto: 'Mi equipo', ruta: '/afiliado/equipo', icono: Users },
    ],
  },
  {
    titulo: 'Desempeño',
    items: [
      { texto: 'Mi volumen', ruta: '/afiliado/volumen', icono: TrendingUp },
      { texto: 'Mi RUN', ruta: '/afiliado/run', icono: Award },
      { texto: 'Mis bonos', ruta: '/afiliado/bonos', icono: Gift },
    ],
  },
  {
    titulo: 'Historial',
    items: [
      { texto: 'Mis compras', ruta: '/afiliado/compras', icono: ShoppingCart },
      { texto: 'Mis liquidaciones', ruta: '/afiliado/liquidaciones', icono: Receipt },
      { texto: 'Mi formación', ruta: '/afiliado/formacion', icono: GraduationCap },
    ],
  },
];

export const navegacionCorporativo: GrupoNavegacion[] = [
  { titulo: 'General', items: [{ texto: 'Resumen', ruta: '/corporativo/resumen', icono: LayoutDashboard }] },
  {
    titulo: 'Comercial',
    items: [
      { texto: 'Usuarios', ruta: '/corporativo/usuarios', icono: Users, modulo: 'usuarios' },
      { texto: 'Permisos', ruta: '/corporativo/permisos', icono: KeyRound, modulo: 'permisos' },
      { texto: 'Productos', ruta: '/corporativo/productos', icono: Package, modulo: 'catalogo' },
    ],
  },
  {
    titulo: 'Red y calificación',
    items: [
      { texto: 'Árboles', ruta: '/corporativo/arboles', icono: Workflow, modulo: 'redes' },
      { texto: 'Períodos', ruta: '/corporativo/periodos', icono: CalendarRange, modulo: 'periodos' },
      { texto: 'Rangos', ruta: '/corporativo/rangos', icono: Award, modulo: 'rangos' },
    ],
  },
  {
    titulo: 'Compensación',
    items: [
      { texto: 'Bonos', ruta: '/corporativo/bonos', icono: SlidersHorizontal, modulo: 'bonos' },
      { texto: 'Simulador', ruta: '/corporativo/simulador', icono: Calculator, modulo: 'simulador' },
      { texto: 'Liquidaciones', ruta: '/corporativo/liquidaciones', icono: ClipboardCheck, modulo: 'liquidaciones' },
    ],
  },
  {
    titulo: 'Control',
    items: [
      { texto: 'Compliance', ruta: '/corporativo/compliance', icono: ShieldAlert, modulo: 'compliance' },
      { texto: 'Auditoría', ruta: '/corporativo/auditoria', icono: ScrollText, modulo: 'auditoria' },
      { texto: 'Reportes', ruta: '/corporativo/reportes', icono: FileChartColumn, modulo: 'reportes' },
      { texto: 'Integraciones', ruta: '/corporativo/integraciones', icono: Plug, modulo: 'integraciones' },
    ],
  },
  {
    titulo: 'Demostración',
    items: [{ texto: 'Datos DEMO', ruta: '/demo/datos', icono: Database, modulo: 'configuracion' }],
  },
];

