import { useLocation } from 'react-router-dom';
import { Construction, GraduationCap } from 'lucide-react';
import { EstadoVacio } from '../../componentes/ui/EstadoVacio';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { buscarPantalla } from '../../rutas/buscarPantalla';

export default function PantallaProvisionalLms() {
  const { pathname } = useLocation();
  const pantalla = buscarPantalla(pathname);
  if (!pantalla) return null;
  const fase = pantalla.etiquetaFase ?? String(pantalla.fase);
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Tarjeta>
        <div className="flex flex-wrap items-center gap-2">
          <Insignia tono="primaria" icono={GraduationCap}>Campus ERICK · {pantalla.numero}</Insignia>
          <Insignia tono="advertencia" icono={Construction}>Se construye en la FASE {fase}</Insignia>
        </div>
        <h2 className="mt-3 text-xl font-extrabold tracking-tight text-texto sm:text-2xl">{pantalla.nombre}</h2>
        <p className="mt-1 text-[13.5px] text-texto-2">{pantalla.descripcion}</p>
        <div className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-texto-3">Requerimientos que cubrirá</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {pantalla.requerimientos.map((id) => <span key={id} className="cifra rounded-md bg-primario-suave px-2 py-0.5 text-xs font-medium text-primario">{id}</span>)}
          </div>
        </div>
      </Tarjeta>
      <Tarjeta>
        <EstadoVacio
          icono={Construction}
          titulo="Pantalla en construcción"
          texto={`La ruta, el menú y los permisos ya funcionan, y los datos académicos de demostración ya están cargados. El contenido de esta pantalla se desarrolla en la FASE ${fase} de la integración Campus ERICK.`}
        />
      </Tarjeta>
    </div>
  );
}
