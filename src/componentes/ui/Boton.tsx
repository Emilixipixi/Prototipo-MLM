import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoaderCircle, type LucideIcon } from 'lucide-react';
import { clasesBoton, type TamanoBoton, type VarianteBoton } from './estilosBoton';

interface PropsBoton extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  icono?: LucideIcon;
  iconoDerecha?: LucideIcon;
  cargando?: boolean;
  anchoCompleto?: boolean;
  children?: ReactNode;
}

export function Boton({
  variante = 'primario', tamano = 'md', icono: Icono, iconoDerecha: IconoDerecha,
  cargando = false, anchoCompleto = false, disabled, className, children, type = 'button', ...resto
}: PropsBoton) {
  return (
    <button type={type} disabled={disabled || cargando} className={clasesBoton(variante, tamano, anchoCompleto, className)} {...resto}>
      {cargando ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : Icono && <Icono className="size-4" aria-hidden />}
      {children}
      {IconoDerecha && !cargando && <IconoDerecha className="size-4" aria-hidden />}
    </button>
  );
}
