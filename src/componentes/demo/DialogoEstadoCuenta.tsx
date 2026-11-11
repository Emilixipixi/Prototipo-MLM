import { useState } from 'react';
import { estadosCuenta } from '../../datos/presentacionCuentas';
import { cambiarEstadoCuenta } from '../../servicios/cuentas';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { EstadoCuenta, Persona } from '../../tipos/persona';
import { transicionesCuenta } from '../../validaciones/transiciones';
import { Boton } from '../ui/Boton';
import { EstadoError } from '../ui/EstadoError';
import { Modal } from '../ui/Modal';
import { Selector } from '../ui/Selector';
import { useToast } from '../ui/useToast';

interface PropsDialogo { persona: Persona | null; alCerrar: () => void; }

export function DialogoEstadoCuenta({ persona, alCerrar }: PropsDialogo) {
  if (!persona) return null;
  return <Contenido key={persona.id} persona={persona} alCerrar={alCerrar} />;
}

function Contenido({ persona, alCerrar }: { persona: Persona; alCerrar: () => void }) {
  const actor = usePersonaSesion();
  const toast = useToast();
  const opciones = transicionesCuenta[persona.estado];
  const [nuevo, setNuevo] = useState<EstadoCuenta>(opciones[0]);
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const confirmar = () => {
    const resultado = cambiarEstadoCuenta(persona.id, nuevo, actor?.id ?? 'DEMO-U01', motivo);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    toast.exito('Estado actualizado', `${persona.codigo} ahora está ${estadosCuenta[nuevo].etiqueta.toLowerCase()}.`);
    alCerrar();
  };

  return (
    <Modal
      abierto
      alCerrar={alCerrar}
      titulo={`Cambiar estado de ${persona.codigo}`}
      descripcion={`${persona.nombres} ${persona.apellidos} · estado actual: ${estadosCuenta[persona.estado].etiqueta}`}
      ancho="sm"
      pie={<><Boton variante="secundario" onClick={alCerrar}>Cancelar</Boton><Boton variante={nuevo === 'activo' ? 'primario' : 'peligro'} onClick={confirmar}>Confirmar cambio</Boton></>}
    >
      <div className="flex flex-col gap-4">
        {error && <EstadoError queOcurrio={error} />}
        <Selector etiqueta="Nuevo estado" value={nuevo} onChange={(evento) => setNuevo(evento.target.value as EstadoCuenta)} opciones={opciones.map((estado) => ({ valor: estado, texto: estadosCuenta[estado].etiqueta }))} />
        <p className="rounded-xl bg-fondo px-3 py-2 text-[12.5px] text-texto-2"><strong className="text-texto">Efecto operativo:</strong> {estadosCuenta[nuevo].efecto}</p>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="motivo-estado" className="text-[13px] font-semibold">Motivo (obligatorio)</label>
          <textarea id="motivo-estado" rows={3} value={motivo} onChange={(evento) => setMotivo(evento.target.value)} className="w-full rounded-xl border border-borde p-3 text-sm outline-none focus:border-acento focus:ring-2 focus:ring-acento-suave" placeholder="Describe la razón del cambio" />
          <p className="text-xs text-texto-2">Se registra en la bitácora. La historia de operación no se borra.</p>
        </div>
      </div>
    </Modal>
  );
}
