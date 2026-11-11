import { ScrollText } from 'lucide-react';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tabla, type ColumnaTabla } from '../../componentes/ui/Tabla';
import { useBitacoraStore } from '../../store/useBitacoraStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import type { Bitacora } from '../../tipos/bitacora';
import { formatearFechaHora } from '../../utilidades/fechas';
import PantallaProvisional from '../PantallaProvisional';

export default function AuditoriaProvisional() {
  const registros = useBitacoraStore((estado) => estado.registros);
  const personas = usePersonasStore((estado) => estado.personas);
  const nombreActor = (id: string) => {
    const persona = personas.find((item) => item.id === id);
    return persona ? `${persona.nombres} ${persona.apellidos}` : id;
  };

  const columnas: ColumnaTabla<Bitacora>[] = [
    { clave: 'fecha', titulo: 'Fecha y hora', render: (fila) => <span className="cifra text-[12.5px]">{formatearFechaHora(fila.fechaHora)}</span>, valorOrden: (fila) => fila.fechaHora },
    { clave: 'accion', titulo: 'Acción', render: (fila) => <span className="font-semibold">{fila.accion}</span>, valorOrden: (fila) => fila.accion, principalEnMovil: true },
    { clave: 'actor', titulo: 'Actor', render: (fila) => <span>{nombreActor(fila.actorId)} <span className="cifra text-[11.5px] text-texto-3">{fila.actorId}</span></span>, valorOrden: (fila) => fila.actorId },
    { clave: 'modulo', titulo: 'Módulo', render: (fila) => <Insignia tono="primaria">{fila.modulo}</Insignia> },
    { clave: 'motivo', titulo: 'Motivo', render: (fila) => <span className="text-texto-2">{fila.motivo || 'Sin motivo'}</span> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PantallaProvisional />
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-3 flex items-center gap-2">
          <ScrollText className="size-[18px] text-primario" aria-hidden />
          <h2 className="text-[15px] font-bold text-texto">Bitácora de la sesión (vista provisional)</h2>
        </div>
        <Tabla
          columnas={columnas}
          filas={registros}
          claveFila={(fila) => fila.id}
          textoBusqueda={(fila) => `${fila.accion} ${fila.actorId} ${nombreActor(fila.actorId)} ${fila.modulo} ${fila.motivo}`}
          placeholderBusqueda="Buscar en la bitácora"
          textoVacio="Todavía no hay acciones registradas en esta sesión."
        />
      </div>
    </div>
  );
}
