import { navegacionAfiliado } from '../rutas/navegacion';
import { LayoutPanel } from './compartidos/LayoutPanel';

export default function LayoutAfiliado() {
  return <LayoutPanel grupos={navegacionAfiliado} subtitulo="Back office afiliado" contexto="Back office afiliado" />;
}
