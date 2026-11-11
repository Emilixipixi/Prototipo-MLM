import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LeyendaDemostracion } from '../../componentes/demo/LeyendaDemostracion';
import { Cajon } from '../../componentes/ui/Cajon';
import { CargandoPantalla } from '../../componentes/ui/CargandoPantalla';
import type { GrupoNavegacion } from '../../rutas/navegacion';
import { unirClases } from '../../utilidades/clases';
import { BarraSuperior } from './BarraSuperior';
import { MenuLateral } from './MenuLateral';

interface PropsLayoutPanel {
  grupos: GrupoNavegacion[];
  subtitulo: string;
  contexto: string;
}

const claveMenuOculto = 'mlm2027-menu-oculto';

function leerMenuOculto(): boolean {
  try {
    return window.localStorage.getItem(claveMenuOculto) === '1';
  } catch {
    return false;
  }
}

export function LayoutPanel({ grupos, subtitulo, contexto }: PropsLayoutPanel) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuOculto, setMenuOculto] = useState(leerMenuOculto);

  const alternarMenu = () => {
    const siguiente = !menuOculto;
    setMenuOculto(siguiente);
    try {
      window.localStorage.setItem(claveMenuOculto, siguiente ? '1' : '0');
    } catch {
      return;
    }
  };

  return (
    <div className={unirClases('min-h-dvh lg:grid', menuOculto ? 'lg:grid-cols-[minmax(0,1fr)]' : 'lg:grid-cols-[264px_minmax(0,1fr)]')}>
      {!menuOculto && (
        <aside className="sticky top-0 hidden h-dvh lg:block">
          <MenuLateral grupos={grupos} subtitulo={subtitulo} />
        </aside>
      )}
      <Cajon abierto={menuAbierto} alCerrar={() => setMenuAbierto(false)} etiqueta="Menú de navegación">
        <MenuLateral grupos={grupos} subtitulo={subtitulo} alNavegar={() => setMenuAbierto(false)} />
      </Cajon>
      <div className="flex min-w-0 flex-col">
        <div className="sticky top-0 z-30">
          <LeyendaDemostracion />
          <BarraSuperior alAbrirMenu={() => setMenuAbierto(true)} menuOculto={menuOculto} alAlternarMenu={alternarMenu} contexto={contexto} />
        </div>
        <main className="min-w-0 flex-1 px-4 pb-12 pt-5 sm:pt-6 lg:px-8">
          <Suspense fallback={<CargandoPantalla />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
