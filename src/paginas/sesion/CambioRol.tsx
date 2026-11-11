import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CargandoPantalla } from '../../componentes/ui/CargandoPantalla';
import { useToast } from '../../componentes/ui/useToast';
import { rutaInicioPorPerfil, useSesionStore } from '../../store/useSesionStore';

export default function CambioRol() {
  const { personaId } = useParams();
  const cambiarRol = useSesionStore((estado) => estado.cambiarRol);
  const navegar = useNavigate();
  const toast = useToast();
  const ejecutado = useRef(false);

  useEffect(() => {
    if (ejecutado.current) return;
    ejecutado.current = true;
    const persona = personaId ? cambiarRol(personaId) : null;
    if (!persona) {
      navegar('/ingresar', { replace: true });
      return;
    }
    toast.info('Rol de demostración cambiado', `Ahora navegas como ${persona.nombres} ${persona.apellidos}.`);
    navegar(rutaInicioPorPerfil(persona.perfil), { replace: true });
  }, [personaId, cambiarRol, navegar, toast]);

  return <CargandoPantalla texto="Cambiando de rol" />;
}
