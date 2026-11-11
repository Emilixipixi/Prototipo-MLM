import type { ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { clasesBoton, type TamanoBoton, type VarianteBoton } from './estilosBoton';

interface PropsEnlaceBoton extends LinkProps {
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  icono?: LucideIcon;
  iconoDerecha?: LucideIcon;
  anchoCompleto?: boolean;
  children: ReactNode;
}

export function EnlaceBoton({ variante = 'primario', tamano = 'md', icono: Icono, iconoDerecha: IconoDerecha, anchoCompleto = false, className, children, ...resto }: PropsEnlaceBoton) {
  return (
    <Link className={clasesBoton(variante, tamano, anchoCompleto, className)} {...resto}>
      {Icono && <Icono className="size-4" aria-hidden />}
      {children}
      {IconoDerecha && <IconoDerecha className="size-4" aria-hidden />}
    </Link>
  );
}
