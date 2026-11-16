import { useEffect, useMemo } from 'react';
import { ArrowLeftCircle } from 'lucide-react';
import { navegacionCampus } from '../rutas/navegacionCampus';
import type { GrupoNavegacion } from '../rutas/navegacion';
import { rutaInicioPorPerfil, usePersonaSesion } from '../store/useSesionStore';
import { LayoutPanel } from './compartidos/LayoutPanel';
import { revisarVencimientos } from '../servicios/matriculas';
import { useTemaErick } from '../hooks/useTemaErick';

export default function LayoutCampus() {
  const persona = usePersonaSesion();
  useTemaErick();
  const grupos = useMemo<GrupoNavegacion[]>(() => [
    ...navegacionCampus,
    { titulo: 'MLM 2027', items: [{ texto: 'Volver a MLM 2027', ruta: rutaInicioPorPerfil(persona?.perfil), icono: ArrowLeftCircle }] },
  ], [persona?.perfil]);
  useEffect(() => {
    if (persona?.id) revisarVencimientos(persona.id);
  }, [persona?.id]);
  return <LayoutPanel grupos={grupos} subtitulo="Plataforma ERICK S.A.C." contexto="Campus ERICK" marca="campus" />;
}
