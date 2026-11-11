import { Briefcase, GraduationCap, ShieldCheck, ShoppingBag, UserCog, type LucideIcon } from 'lucide-react';

export interface SesionDemo { personaId: string; etiqueta: string; detalle: string; icono: LucideIcon; }

export const sesionesDemo: SesionDemo[] = [
  { personaId: 'DEMO-U01', etiqueta: 'Superadministrador', detalle: 'Admin Demo', icono: ShieldCheck },
  { personaId: 'DEMO-U02', etiqueta: 'Operador', detalle: 'Operador Demo', icono: UserCog },
  { personaId: 'DEMO-A01', etiqueta: 'Afiliado', detalle: 'Mariana Vega - DEMO-A01', icono: Briefcase },
  { personaId: 'DEMO-C01', etiqueta: 'Cliente', detalle: 'Rosa Delgado - DEMO-C01', icono: ShoppingBag },
  { personaId: 'DEMO-L01', etiqueta: 'Alumno', detalle: 'Gabriela Ponce - DEMO-L01', icono: GraduationCap },
];
