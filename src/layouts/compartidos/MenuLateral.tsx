import { NavLink, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Avatar } from '../../componentes/ui/Avatar';
import { Tooltip } from '../../componentes/ui/Tooltip';
import { nombresModulos } from '../../datos/permisosIniciales';
import type { GrupoNavegacion, ItemNavegacion } from '../../rutas/navegacion';
import { usePermisosStore } from '../../store/usePermisosStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import { unirClases } from '../../utilidades/clases';
import { Logo } from './Logo';

interface PropsMenuLateral {
  grupos: GrupoNavegacion[];
  subtitulo: string;
  alNavegar?: () => void;
}

const claseItem = 'flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-[13.5px] font-medium transition-colors md:min-h-10';

export function MenuLateral({ grupos, subtitulo, alNavegar }: PropsMenuLateral) {
  const persona = usePersonaSesion();
  const tabla = usePermisosStore((estado) => estado.tabla);
  const { pathname } = useLocation();

  const permitido = (item: ItemNavegacion) => !item.modulo || !persona || tabla[persona.perfil][item.modulo].includes('consultar');

  return (
    <nav aria-label="Menú principal" className="fondo-menu-lateral flex h-full flex-col px-3.5 pb-4 pt-5 text-[#C7D3E6]">
      <div className="px-2.5 pb-4"><Logo subtitulo={subtitulo} oscuro /></div>
      <div className="flex-1 overflow-y-auto">
        {grupos.map((grupo) => (
          <div key={grupo.titulo} className="mb-1">
            <p className="px-3 pb-1.5 pt-3.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#6F86AA]">{grupo.titulo}</p>
            <ul className="flex flex-col gap-0.5">
              {grupo.items.map((item) => {
                const Icono = item.icono;
                if (!permitido(item)) {
                  return (
                    <li key={item.ruta}>
                      <Tooltip contenido={`Requiere permiso: consultar en ${nombresModulos[item.modulo!]}`} className="w-full">
                        <span aria-disabled="true" tabIndex={0} className={unirClases(claseItem, 'w-full cursor-not-allowed text-[#6F86AA] opacity-70')}>
                          <Icono className="size-[18px] shrink-0" aria-hidden />
                          {item.texto}
                          <Lock className="ml-auto size-3.5" aria-label="Sin permiso" />
                        </span>
                      </Tooltip>
                    </li>
                  );
                }
                if (item.hijos) {
                  const grupoActivo = pathname.startsWith(item.ruta);
                  return (
                    <li key={item.ruta}>
                      <span className={unirClases(claseItem, grupoActivo ? 'text-white' : '')}>
                        <Icono className="size-[18px] shrink-0" aria-hidden />
                        {item.texto}
                      </span>
                      <ul className="ml-[22px] flex flex-col gap-0.5 border-l border-white/10 pl-3">
                        {item.hijos.map((hijo) => (
                          <li key={hijo.ruta}>
                            <NavLink
                              to={hijo.ruta}
                              onClick={alNavegar}
                              className={({ isActive }) => unirClases(
                                claseItem, 'text-[13px]',
                                isActive ? 'bg-white/10 text-white shadow-[inset_3px_0_0_#22B8D6]' : 'hover:bg-white/5 hover:text-white',
                              )}
                            >
                              {hijo.texto}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                }
                return (
                  <li key={item.ruta}>
                    <NavLink
                      to={item.ruta}
                      onClick={alNavegar}
                      className={({ isActive }) => unirClases(
                        claseItem,
                        isActive ? 'bg-white/10 text-white shadow-[inset_3px_0_0_#22B8D6]' : 'hover:bg-white/5 hover:text-white',
                      )}
                    >
                      <Icono className="size-[18px] shrink-0" aria-hidden />
                      {item.texto}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      {persona && (
        <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-white/[0.06] p-3">
          <Avatar nombres={persona.nombres} apellidos={persona.apellidos} />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-white">{persona.nombres} {persona.apellidos}</p>
            <p className="cifra truncate text-[11px] text-[#8FA3C2]">{persona.codigo}</p>
          </div>
        </div>
      )}
    </nav>
  );
}
