import { Award, BookOpenCheck, ClipboardPen, FileBadge, History, Library, Microscope } from 'lucide-react';
import { ChartNoAxesColumn, ListChecks, Plug, UserCheck, WalletCards } from 'lucide-react';
import { CalendarDays, GraduationCap, ScrollText, Settings2, Users } from 'lucide-react';
import type { GrupoNavegacion } from './navegacion';

export const navegacionCampus: GrupoNavegacion[] = [
  {
    titulo: 'Mi aprendizaje',
    items: [
      { texto: 'Mis programas', ruta: '/campus/programas', icono: Library },
      { texto: 'Mis notas', ruta: '/campus/notas', icono: BookOpenCheck },
      { texto: 'Historial académico', ruta: '/campus/historial', icono: History },
    ],
  },
  {
    titulo: 'Documentos y acceso',
    items: [
      { texto: 'Mis certificados', ruta: '/campus/certificados', icono: FileBadge },
      { texto: 'Mi membresía', ruta: '/campus/membresia', icono: Award },
      { texto: 'Mi MID', ruta: '/campus/mid', icono: Microscope },
    ],
  },
];

export const navegacionEvaluador: GrupoNavegacion[] = [
  { titulo: 'Evaluación académica', items: [{ texto: 'Sustentaciones MID', ruta: '/evaluador', icono: ClipboardPen }] },
];

export const navegacionErick: GrupoNavegacion[] = [
  { titulo: 'General', items: [{ texto: 'Resumen educativo', ruta: '/erick/resumen', icono: ChartNoAxesColumn, modulo: 'academico' }] },
  {
    titulo: 'Oferta académica',
    items: [
      { texto: 'Programas', ruta: '/erick/programas', icono: Library, modulo: 'academico' },
      { texto: 'Banco de preguntas', ruta: '/erick/preguntas', icono: ListChecks, modulo: 'academico' },
    ],
  },
  {
    titulo: 'Comunidad',
    items: [
      { texto: 'Estudiantes', ruta: '/erick/estudiantes', icono: GraduationCap, modulo: 'academico' },
      { texto: 'Docentes', ruta: '/erick/docentes', icono: Users, modulo: 'docentes' },
      { texto: 'Calendario académico', ruta: '/erick/calendario', icono: CalendarDays, modulo: 'calendario' },
    ],
  },
  {
    titulo: 'Estudiantes',
    items: [
      { texto: 'Matrículas', ruta: '/erick/matriculas', icono: UserCheck, modulo: 'matriculas' },
      { texto: 'Membresías', ruta: '/erick/membresias', icono: WalletCards, modulo: 'matriculas' },
      { texto: 'Certificados', ruta: '/erick/certificados', icono: FileBadge, modulo: 'certificados' },
      { texto: 'Sustentaciones MID', ruta: '/erick/mid', icono: Microscope, modulo: 'academico' },
    ],
  },
  {
    titulo: 'Análisis',
    items: [
      { texto: 'Reportes académicos', ruta: '/erick/reportes', icono: BookOpenCheck, modulo: 'academico' },
      { texto: 'Integración con MLM', ruta: '/erick/integracion', icono: Plug, modulo: 'academico' },
    ],
  },
  {
    titulo: 'Plataforma',
    items: [
      { texto: 'Configuración', ruta: '/erick/configuracion', icono: Settings2, modulo: 'configuracion_erick' },
      { texto: 'Bitácora académica', ruta: '/erick/bitacora', icono: ScrollText, modulo: 'academico' },
    ],
  },
];

export const navegacionDocente: GrupoNavegacion[] = [
  {
    titulo: 'Docencia',
    items: [
      { texto: 'Mis cursos', ruta: '/docente/cursos', icono: GraduationCap },
      { texto: 'Calendario', ruta: '/docente/calendario', icono: CalendarDays },
    ],
  },
  { titulo: 'Evaluación académica', items: [{ texto: 'Sustentaciones MID', ruta: '/docente/sustentaciones', icono: ClipboardPen }] },
];

navegacionCampus[0].items.push({ texto: 'Mi calendario', ruta: '/campus/calendario', icono: CalendarDays });
