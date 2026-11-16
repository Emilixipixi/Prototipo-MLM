import { navegacionDocente } from '../rutas/navegacionCampus';
import { LayoutPanel } from './compartidos/LayoutPanel';
import { useTemaErick } from '../hooks/useTemaErick';

export default function LayoutDocente() {
  useTemaErick();
  return <LayoutPanel grupos={navegacionDocente} subtitulo="Panel docente" contexto="Campus ERICK · Docente" marca="campus" />;
}
