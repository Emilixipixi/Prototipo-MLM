import { House, MapPinOff } from 'lucide-react';
import { LeyendaDemostracion } from '../../componentes/demo/LeyendaDemostracion';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { rutaInicioPorPerfil, usePersonaSesion } from '../../store/useSesionStore';

export default function NoEncontrada() {
  const persona = usePersonaSesion();
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-30"><LeyendaDemostracion /></div>
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-primario-suave text-primario"><MapPinOff className="size-8" aria-hidden /></span>
        <p className="cifra mt-5 text-sm font-semibold text-acento">Error 404</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-texto">Página no encontrada</h1>
        <p className="mt-1 max-w-sm text-[13.5px] text-texto-2">La dirección que buscas no existe en el prototipo o fue movida.</p>
        <EnlaceBoton to={persona ? rutaInicioPorPerfil(persona.perfil) : '/'} icono={House} className="mt-6">Ir al inicio</EnlaceBoton>
      </main>
    </div>
  );
}
