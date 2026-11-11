import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { reiniciarDemo } from '../../store/reiniciarDemo';
import { BotonIcono } from '../ui/BotonIcono';
import { Confirmacion } from '../ui/Confirmacion';
import { useToast } from '../ui/useToast';

interface PropsDialogo {
  abierto: boolean;
  alCerrar: () => void;
}

export function DialogoReiniciarDemo({ abierto, alCerrar }: PropsDialogo) {
  const navegar = useNavigate();
  const toast = useToast();

  const confirmar = () => {
    alCerrar();
    reiniciarDemo();
    toast.exito('Demostración reiniciada', 'Todos los datos volvieron a su estado inicial.');
    navegar('/ingresar');
  };

  return (
    <Confirmacion
      abierto={abierto}
      alCerrar={alCerrar}
      alConfirmar={confirmar}
      titulo="Reiniciar demostración"
      textoConfirmar="Reiniciar"
      peligro
      resumen={(
        <p>
          Se restablecerán todos los datos de la demostración (personas, red, pedidos, períodos, corridas, liquidaciones, permisos, notificaciones y bitácora) a su estado inicial.
          Los cambios hechos durante la demostración se perderán y volverás a la pantalla de ingreso.
        </p>
      )}
    />
  );
}

export function BotonReiniciarDemo({ className }: { className?: string }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <BotonIcono icono={RotateCcw} etiqueta="Reiniciar demostración" onClick={() => setAbierto(true)} className={className} />
      <DialogoReiniciarDemo abierto={abierto} alCerrar={() => setAbierto(false)} />
    </>
  );
}
