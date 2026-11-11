import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, House, ShieldAlert } from 'lucide-react';
import { LeyendaDemostracion } from '../../componentes/demo/LeyendaDemostracion';
import { Boton } from '../../componentes/ui/Boton';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { nombresPerfiles } from '../../datos/perfiles';
import type { EstadoAccesoRestringido } from '../../rutas/Guardas';
import { rutaInicioPorPerfil, usePersonaSesion } from '../../store/useSesionStore';

export default function AccesoRestringido() {
  const persona = usePersonaSesion();
  const navegar = useNavigate();
  const estado = useLocation().state as EstadoAccesoRestringido | null;

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-30"><LeyendaDemostracion /></div>
      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center">
        <Tarjeta className="w-full max-w-lg">
          <div className="flex flex-col items-center text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-red-50 text-error"><ShieldAlert className="size-7" aria-hidden /></span>
            <h1 className="mt-4 text-xl font-extrabold tracking-tight text-texto">Acceso restringido</h1>
            <p className="mt-1 text-[13.5px] text-texto-2">No tienes autorización para ver esta sección con tu sesión actual.</p>
          </div>
          <dl className="mt-5 grid gap-3 rounded-xl bg-fondo p-4 text-[13px] sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Tu perfil</dt>
              <dd className="mt-0.5 font-semibold text-texto">{persona ? nombresPerfiles[persona.perfil] : 'Sin sesión'}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Se requiere</dt>
              <dd className="mt-0.5 font-semibold text-error">{estado?.requerido ?? 'Permiso no disponible'}</dd>
            </div>
            {estado?.ruta && (
              <div className="sm:col-span-2">
                <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Ruta solicitada</dt>
                <dd className="cifra mt-0.5 break-all text-texto">{estado.ruta}</dd>
              </div>
            )}
          </dl>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
            <Boton variante="secundario" icono={ArrowLeft} onClick={() => navegar(-1)}>Volver</Boton>
            <EnlaceBoton to={persona ? rutaInicioPorPerfil(persona.perfil) : '/ingresar'} icono={House}>Ir a mi inicio</EnlaceBoton>
          </div>
        </Tarjeta>
      </main>
    </div>
  );
}
