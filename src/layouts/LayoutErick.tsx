import { navegacionErick } from '../rutas/navegacionCampus';
import { LayoutPanel } from './compartidos/LayoutPanel';
import { useTemaErick } from '../hooks/useTemaErick';

export default function LayoutErick() {
  useTemaErick();
  return <LayoutPanel grupos={navegacionErick} subtitulo="Administración educativa" contexto="ERICK S.A.C. · Administración" marca="erick" />;
}
