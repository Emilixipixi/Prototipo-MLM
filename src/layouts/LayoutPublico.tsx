import { Suspense, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LogIn, Menu, ShoppingCart } from 'lucide-react';
import { CentroNotificaciones } from '../componentes/demo/CentroNotificaciones';
import { LeyendaDemostracion } from '../componentes/demo/LeyendaDemostracion';
import { SelectorRolDemo } from '../componentes/demo/SelectorRolDemo';
import { BotonIcono } from '../componentes/ui/BotonIcono';
import { Cajon } from '../componentes/ui/Cajon';
import { EnlaceBoton } from '../componentes/ui/EnlaceBoton';
import { CargandoPantalla } from '../componentes/ui/CargandoPantalla';
import { useCantidadCarrito } from '../store/useCarritoStore';
import { rutaInicioPorPerfil, usePersonaSesion } from '../store/useSesionStore';
import { unirClases } from '../utilidades/clases';
import { Logo } from './compartidos/Logo';
import { MenuUsuario } from './compartidos/MenuUsuario';

const enlaces = [
  { texto: 'Inicio', ruta: '/' },
  { texto: 'Catálogo', ruta: '/catalogo' },
  { texto: 'Registro', ruta: '/registro' },
];

export default function LayoutPublico() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const persona = usePersonaSesion();
  const cantidadCarrito = useCantidadCarrito();

  const enlacesVisibles = persona
    ? [...enlaces.filter((enlace) => enlace.ruta !== '/registro'), { texto: persona.perfil === 'cliente_alumno' ? 'Mi cuenta' : 'Mi panel', ruta: rutaInicioPorPerfil(persona.perfil) }]
    : enlaces;

  const claseEnlace = ({ isActive }: { isActive: boolean }) => unirClases(
    'inline-flex min-h-11 items-center rounded-lg px-3 text-[13.5px] font-semibold transition-colors md:min-h-10',
    isActive ? 'bg-primario-suave text-primario' : 'text-texto-2 hover:text-primario',
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-30">
        <LeyendaDemostracion />
        <header className="border-b border-borde bg-superficie/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-3 lg:px-8">
            <BotonIcono icono={Menu} etiqueta="Abrir menú" onClick={() => setMenuAbierto(true)} className="md:hidden" />
            <Link to="/" aria-label="MLM 2027, ir al inicio" className="inline-flex min-h-11 items-center"><Logo soloIconoEnMovil /></Link>
            <nav aria-label="Navegación pública" className="ml-6 hidden items-center gap-1 md:flex">
              {enlacesVisibles.map((enlace) => <NavLink key={enlace.ruta} to={enlace.ruta} end={enlace.ruta === '/'} className={claseEnlace}>{enlace.texto}</NavLink>)}
            </nav>
            <div className="ml-auto flex items-center gap-2">
              {persona && <SelectorRolDemo />}
              {persona && <CentroNotificaciones />}
              <Link
                to="/carrito"
                aria-label={`Carrito, ${cantidadCarrito} artículos`}
                className="relative grid size-11 place-items-center rounded-xl border border-borde bg-superficie text-texto-2 hover:text-primario md:size-10"
              >
                <ShoppingCart className="size-[18px]" aria-hidden />
                <span className="cifra absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full border-2 border-white bg-acento px-1 text-[10px] font-semibold text-white">{cantidadCarrito}</span>
              </Link>
              {persona ? <MenuUsuario /> : (
                <span className="hidden sm:block"><EnlaceBoton to="/ingresar" icono={LogIn} tamano="sm">Ingresar</EnlaceBoton></span>
              )}
            </div>
          </div>
        </header>
      </div>

      <Cajon abierto={menuAbierto} alCerrar={() => setMenuAbierto(false)} etiqueta="Menú de navegación" className="bg-superficie">
        <div className="flex h-full flex-col p-4">
          <div className="pb-4"><Logo /></div>
          <nav aria-label="Navegación pública móvil" className="flex flex-col gap-1">
            {enlacesVisibles.map((enlace) => (
              <NavLink key={enlace.ruta} to={enlace.ruta} end={enlace.ruta === '/'} onClick={() => setMenuAbierto(false)} className={claseEnlace}>{enlace.texto}</NavLink>
            ))}
          </nav>
          {!persona && (
            <EnlaceBoton to="/ingresar" onClick={() => setMenuAbierto(false)} icono={LogIn} anchoCompleto className="mt-auto">Ingresar</EnlaceBoton>
          )}
        </div>
      </Cajon>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-12 pt-6 lg:px-8">
        <Suspense fallback={<CargandoPantalla />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="border-t border-borde bg-superficie">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-texto-2 sm:flex-row lg:px-8">
          <Logo className="scale-90" />
          <p>Prototipo de demostración. Datos ficticios, sin cobros ni pagos reales.</p>
        </div>
      </footer>
    </div>
  );
}
