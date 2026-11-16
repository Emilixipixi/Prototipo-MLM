import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { EstadoVacio } from '../ui/EstadoVacio';
import { Tarjeta } from '../ui/Tarjeta';

export function SinProgramaAsignado() {
  return (
    <Tarjeta>
      <EstadoVacio icono={Lock} titulo="Este programa no está asignado a ti" texto="Solo ves y gestionas los programas que el administrador educativo te asignó."
        accion={<Link to="/docente/cursos" className="inline-flex min-h-11 items-center text-[13px] font-semibold text-acento">Volver a Mis cursos</Link>} />
    </Tarjeta>
  );
}
