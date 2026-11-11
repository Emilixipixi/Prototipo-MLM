import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { nombresModulos } from '../datos/permisosIniciales';
import { nombresPerfiles } from '../datos/perfiles';
import { usePermisosStore } from '../store/usePermisosStore';
import { usePersonaSesion } from '../store/useSesionStore';
import type { ModuloPermiso } from '../tipos/permisos';
import type { PerfilAcceso } from '../tipos/persona';

export interface EstadoAccesoRestringido { requerido: string; ruta: string; }

interface PropsRutaPorPerfil { perfiles: PerfilAcceso[]; children: ReactNode; }

export function RutaPorPerfil({ perfiles, children }: PropsRutaPorPerfil) {
  const persona = usePersonaSesion();
  const { pathname } = useLocation();
  if (!persona) return <Navigate to="/ingresar" replace state={{ desde: pathname }} />;
  if (!perfiles.includes(persona.perfil)) {
    const estado: EstadoAccesoRestringido = {
      requerido: `Perfil ${perfiles.map((perfil) => nombresPerfiles[perfil]).join(' u ')}`,
      ruta: pathname,
    };
    return <Navigate to="/acceso-restringido" replace state={estado} />;
  }
  return children;
}

interface PropsRutaPorPermiso { modulo: ModuloPermiso; children: ReactNode; }

export function RutaPorPermiso({ modulo, children }: PropsRutaPorPermiso) {
  const persona = usePersonaSesion();
  const tabla = usePermisosStore((estado) => estado.tabla);
  const { pathname } = useLocation();
  if (!persona) return <Navigate to="/ingresar" replace state={{ desde: pathname }} />;
  if (!tabla[persona.perfil][modulo].includes('consultar')) {
    const estado: EstadoAccesoRestringido = { requerido: `Permiso consultar en ${nombresModulos[modulo]}`, ruta: pathname };
    return <Navigate to="/acceso-restringido" replace state={estado} />;
  }
  return children;
}
