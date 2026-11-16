import { Lock } from 'lucide-react';
import { EnlaceBoton } from '../ui/EnlaceBoton';
import { EstadoVacio } from '../ui/EstadoVacio';
import { Tarjeta } from '../ui/Tarjeta';

export function AvisoSinAcceso({ texto, programaId }: { texto: string; programaId?: string }) {
  return (
    <Tarjeta>
      <EstadoVacio icono={Lock} titulo="Contenido no disponible" texto={texto}
        accion={<EnlaceBoton to={programaId ? `/campus/programas/${programaId}` : '/campus/programas'}>Volver a la ruta</EnlaceBoton>} />
    </Tarjeta>
  );
}
