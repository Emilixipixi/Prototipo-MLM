import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { House, LogOut, RotateCcw } from 'lucide-react';
import { DialogoReiniciarDemo } from '../../componentes/demo/BotonReiniciarDemo';
import { Avatar } from '../../componentes/ui/Avatar';
import { useToast } from '../../componentes/ui/useToast';
import { nombresPerfiles } from '../../datos/perfiles';
import { useClicFuera } from '../../hooks/useClicFuera';
import { rutaInicioPorPerfil, usePersonaSesion, useSesionStore } from '../../store/useSesionStore';

export function MenuUsuario() {
  const [abierto, setAbierto] = useState(false);
  const [reiniciando, setReiniciando] = useState(false);
  const persona = usePersonaSesion();
  const cerrarSesion = useSesionStore((estado) => estado.cerrarSesion);
  const navegar = useNavigate();
  const toast = useToast();
  const referencia = useClicFuera<HTMLDivElement>(abierto, () => setAbierto(false));

  if (!persona) return null;

  const salir = () => {
    setAbierto(false);
    cerrarSesion();
    toast.info('Sesión cerrada', 'El cierre de sesión quedó registrado en la bitácora.');
    navegar('/ingresar');
  };

  const claseOpcion = 'flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-[13px] font-medium text-texto hover:bg-fondo md:min-h-10';

  return (
    <div ref={referencia} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        aria-expanded={abierto}
        aria-haspopup="menu"
        aria-label="Menú de usuario"
        className="grid size-11 place-items-center rounded-xl hover:bg-primario-suave md:size-10"
      >
        <Avatar nombres={persona.nombres} apellidos={persona.apellidos} tamano="sm" />
      </button>
      {abierto && (
        <div role="menu" className="animar-aparecer absolute right-0 top-full z-50 mt-2 w-[260px] max-w-[calc(100vw-24px)] rounded-xl border border-borde bg-superficie p-1.5 shadow-flotante">
          <div className="border-b border-borde px-3 pb-3 pt-2">
            <p className="text-[13.5px] font-bold text-texto">{persona.nombres} {persona.apellidos}</p>
            <p className="cifra text-[11.5px] text-texto-2">{persona.codigo}</p>
            <p className="mt-1 text-xs text-acento">{nombresPerfiles[persona.perfil]}</p>
          </div>
          <div className="pt-1.5">
            <Link role="menuitem" to={rutaInicioPorPerfil(persona.perfil)} onClick={() => setAbierto(false)} className={claseOpcion}>
              <House className="size-4 text-texto-2" aria-hidden />
              {persona.perfil === 'cliente_alumno' ? 'Mi cuenta' : 'Mi inicio'}
            </Link>
            <button role="menuitem" type="button" onClick={() => { setAbierto(false); setReiniciando(true); }} className={claseOpcion}>
              <RotateCcw className="size-4 text-texto-2" aria-hidden />
              Reiniciar demostración
            </button>
            <button role="menuitem" type="button" onClick={salir} className={`${claseOpcion} text-error`}>
              <LogOut className="size-4" aria-hidden />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
      <DialogoReiniciarDemo abierto={reiniciando} alCerrar={() => setReiniciando(false)} />
    </div>
  );
}
