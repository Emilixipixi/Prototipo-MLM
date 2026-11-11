import {
  Apple, BadgeCheck, Droplets, GraduationCap, MonitorSmartphone, Package, Shirt, Sparkles, type LucideIcon,
} from 'lucide-react';
import type { CategoriaProducto } from '../tipos/catalogo';

export interface EstiloCategoria {
  nombre: string;
  plural: string;
  descripcion: string;
  icono: LucideIcon;
  degradado: [string, string];
  tono: 'acento' | 'primaria' | 'oro';
}

export const categorias: Record<CategoriaProducto, EstiloCategoria> = {
  bien_fisico: {
    nombre: 'Bien físico', plural: 'Bienes físicos', icono: Package,
    descripcion: 'Productos que se entregan al cliente y generan volumen al confirmarse la compra.',
    degradado: ['#0E7490', '#22B8D6'], tono: 'acento',
  },
  servicio: {
    nombre: 'Servicio', plural: 'Servicios', icono: Sparkles,
    descripcion: 'Servicios personales con precio, VP y VC independientes entre sí.',
    degradado: ['#7C3AED', '#A78BFA'], tono: 'primaria',
  },
  programa_formativo: {
    nombre: 'Programa formativo', plural: 'Programas formativos', icono: GraduationCap,
    descripcion: 'Formación ofrecida por ERIC S.A.C.; el estado académico podrá ser condición de rango.',
    degradado: ['#14305A', '#2563EB'], tono: 'oro',
  },
};

export const iconosProducto: Record<string, LucideIcon> = {
  'DEMO-PRD-01': GraduationCap,
  'DEMO-PRD-02': Apple,
  'DEMO-PRD-03': Shirt,
  'DEMO-PRD-04': Droplets,
  'DEMO-PRD-05': MonitorSmartphone,
  'DEMO-PRD-06': BadgeCheck,
};
