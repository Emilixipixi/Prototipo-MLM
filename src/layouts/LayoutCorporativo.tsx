import { navegacionCorporativo } from '../rutas/navegacion';
import { LayoutPanel } from './compartidos/LayoutPanel';

export default function LayoutCorporativo() {
  return <LayoutPanel grupos={navegacionCorporativo} subtitulo="Administración corporativa" contexto="Administración corporativa" />;
}
