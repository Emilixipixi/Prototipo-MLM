import { navegacionEvaluador } from '../rutas/navegacionCampus';
import { LayoutPanel } from './compartidos/LayoutPanel';
import { useTemaErick } from '../hooks/useTemaErick';

export default function LayoutEvaluador() {
  useTemaErick();
  return <LayoutPanel grupos={navegacionEvaluador} subtitulo="Evaluación académica" contexto="Campus ERICK · Docente" marca="campus" />;
}
