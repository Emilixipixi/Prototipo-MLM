import { useState, type ReactNode } from 'react';
import { Boton } from './Boton';
import { Modal } from './Modal';

const MINIMO_MOTIVO = 10;

interface PropsConfirmacion {
  abierto: boolean;
  alCerrar: () => void;
  alConfirmar: (motivo: string) => void;
  titulo: string;
  resumen: ReactNode;
  textoConfirmar?: string;
  peligro?: boolean;
  requiereMotivo?: boolean;
}

export function Confirmacion(props: PropsConfirmacion) {
  if (!props.abierto) return null;
  return <ContenidoConfirmacion {...props} />;
}

function ContenidoConfirmacion({
  abierto, alCerrar, alConfirmar, titulo, resumen, textoConfirmar = 'Confirmar', peligro = false, requiereMotivo = false,
}: PropsConfirmacion) {
  const [motivo, setMotivo] = useState('');
  const [intentado, setIntentado] = useState(false);
  const motivoValido = !requiereMotivo || motivo.trim().length >= MINIMO_MOTIVO;

  const confirmar = () => {
    setIntentado(true);
    if (!motivoValido) return;
    alConfirmar(motivo.trim());
  };

  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      titulo={titulo}
      ancho="sm"
      pie={(
        <>
          <Boton variante="secundario" onClick={alCerrar}>Cancelar</Boton>
          <Boton variante={peligro ? 'peligro' : 'primario'} onClick={confirmar}>{textoConfirmar}</Boton>
        </>
      )}
    >
      <div className="text-[13.5px] text-texto">{resumen}</div>
      {requiereMotivo && (
        <div className="mt-4 flex flex-col gap-1.5">
          <label htmlFor="motivo-confirmacion" className="text-[13px] font-semibold">Motivo (obligatorio)</label>
          <textarea
            id="motivo-confirmacion"
            value={motivo}
            onChange={(evento) => setMotivo(evento.target.value)}
            rows={3}
            className="w-full rounded-xl border border-borde bg-superficie p-3 text-sm outline-none focus:border-acento focus:ring-2 focus:ring-acento-suave"
            placeholder="Describe por qué realizas esta acción"
          />
          <p className={intentado && !motivoValido ? 'text-xs font-medium text-error' : 'text-xs text-texto-2'}>
            {intentado && !motivoValido
              ? `Escribe al menos ${MINIMO_MOTIVO} caracteres.`
              : 'El motivo queda registrado en la bitácora.'}
          </p>
        </div>
      )}
    </Modal>
  );
}
