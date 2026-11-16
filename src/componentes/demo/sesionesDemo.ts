import { Briefcase, ClipboardPen, GraduationCap, School, ShieldCheck, ShoppingBag, UserCog, type LucideIcon } from 'lucide-react';

export interface SesionDemo { personaId: string; etiqueta: string; detalle: string; icono: LucideIcon; }

export const sesionesDemo: SesionDemo[] = [
  { personaId: 'DEMO-U01', etiqueta: 'Superadministrador', detalle: 'Admin Demo', icono: ShieldCheck },
  { personaId: 'DEMO-U02', etiqueta: 'Operador', detalle: 'Operador Demo', icono: UserCog },
  { personaId: 'DEMO-A01', etiqueta: 'Afiliado', detalle: 'Mariana Vega - DEMO-A01', icono: Briefcase },
  { personaId: 'DEMO-C01', etiqueta: 'Cliente', detalle: 'Rosa Delgado - DEMO-C01', icono: ShoppingBag },
  { personaId: 'DEMO-L01', etiqueta: 'Alumno', detalle: 'Gabriela Ponce - DEMO-L01', icono: GraduationCap },
  { personaId: 'DEMO-U04', etiqueta: 'Administrador educativo', detalle: 'ERICK S.A.C. - DEMO-U04', icono: School },
  { personaId: 'DEMO-U03', etiqueta: 'Docente', detalle: 'Docente Evaluador - DEMO-U03', icono: ClipboardPen },
];
