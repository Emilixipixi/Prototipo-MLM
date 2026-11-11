import { cloneElement, isValidElement, type ReactElement } from 'react';
import { Lock } from 'lucide-react';
import { nombresModulos } from '../../datos/permisosIniciales';
import { usePermiso } from '../../hooks/usePermiso';
import type { AccionPermiso, ModuloPermiso } from '../../tipos/permisos';
import { Tooltip } from './Tooltip';

interface PropsConPermiso {
  modulo: ModuloPermiso;
  accion: AccionPermiso;
  children: ReactElement<{ disabled?: boolean; 'aria-disabled'?: boolean }>;
}

export function ConPermiso({ modulo, accion, children }: PropsConPermiso) {
  const permitido = usePermiso(modulo, accion);
  if (permitido || !isValidElement(children)) return children;
  return (
    <Tooltip contenido={`Requiere permiso: ${accion} en ${nombresModulos[modulo]}`}>
      <span className="relative inline-flex" tabIndex={0}>
        {cloneElement(children, { disabled: true, 'aria-disabled': true })}
        <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full border border-borde bg-superficie text-texto-2 shadow-sm">
          <Lock className="size-3" aria-hidden />
        </span>
      </span>
    </Tooltip>
  );
}
