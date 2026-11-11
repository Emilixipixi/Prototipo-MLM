import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { BuscadorGlobal } from '../../componentes/demo/BuscadorGlobal';
import { BotonReiniciarDemo } from '../../componentes/demo/BotonReiniciarDemo';
import { CentroNotificaciones } from '../../componentes/demo/CentroNotificaciones';
import { SelectorRolDemo } from '../../componentes/demo/SelectorRolDemo';
import { BotonIcono } from '../../componentes/ui/BotonIcono';
import { buscarPantalla } from '../../rutas/buscarPantalla';
import { MenuUsuario } from './MenuUsuario';

interface PropsBarraSuperior {
  alAbrirMenu: () => void;
  contexto: string;
}

export function BarraSuperior({ alAbrirMenu, contexto }: PropsBarraSuperior) {
  const { pathname } = useLocation();
  const pantalla = buscarPantalla(pathname);
  return (
    <header className="border-b border-borde bg-fondo/90 backdrop-blur">
      <div className="flex items-center gap-2 px-4 py-3 sm:gap-3 lg:px-8">
        <BotonIcono icono={Menu} etiqueta="Abrir menú" onClick={alAbrirMenu} className="lg:hidden" />
        <div className="min-w-0 flex-1">
          <p className="hidden text-[11px] font-bold uppercase tracking-[0.1em] text-texto-3 sm:block">{contexto}</p>
          <h1 className="truncate text-lg font-extrabold tracking-tight text-texto sm:text-[22px]">{pantalla?.nombre ?? 'MLM 2027'}</h1>
        </div>
        <BuscadorGlobal />
        <SelectorRolDemo />
        <CentroNotificaciones />
        <BotonReiniciarDemo className="hidden md:grid" />
        <MenuUsuario />
      </div>
    </header>
  );
}
