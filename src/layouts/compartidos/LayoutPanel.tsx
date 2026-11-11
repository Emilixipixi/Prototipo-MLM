import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LeyendaDemostracion } from '../../componentes/demo/LeyendaDemostracion';
import { Cajon } from '../../componentes/ui/Cajon';
import { CargandoPantalla } from '../../componentes/ui/CargandoPantalla';
import type { GrupoNavegacion } from '../../rutas/navegacion';
import { BarraSuperior } from './BarraSuperior';
import { MenuLateral } from './MenuLateral';

interface PropsLayoutPanel {
  grupos: GrupoNavegacion[];
  subtitulo: string;
  contexto: string;
}

export function LayoutPanel({ grupos, subtitulo, contexto }: PropsLayoutPanel) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh lg:block">
        <MenuLateral grupos={grupos} subtitulo={subtitulo} />
      </aside>
      <Cajon abierto={menuAbierto} alCerrar={() => setMenuAbierto(false)} etiqueta="Menú de navegación">
        <MenuLateral grupos={grupos} subtitulo={subtitulo} alNavegar={() => setMenuAbierto(false)} />
      </Cajon>
      <div className="flex min-w-0 flex-col">
        <div className="sticky top-0 z-30">
          <LeyendaDemostracion />
          <BarraSuperior alAbrirMenu={() => setMenuAbierto(true)} contexto={contexto} />
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
