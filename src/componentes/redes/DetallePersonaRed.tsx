import { ArrowUpRight, GitBranch, Mail, Phone, Users } from 'lucide-react';
import { usePersonasStore } from '../../store/usePersonasStore';
import { enmascararCorreo, enmascararTelefono } from '../../utilidades/visibilidad';
import { formatearNumero } from '../../utilidades/formatos';
import { InsigniaRun } from '../rangos/InsigniaRun';
import { Avatar } from '../ui/Avatar';
import { ChipBrazo } from '../ui/ChipBrazo';
import { Insignia } from '../ui/Insignia';
import { Modal } from '../ui/Modal';
import type { ResumenNodo } from './tipos';

interface PropsDetalle { nodo: ResumenNodo | null; resumen: Map<string, ResumenNodo>; alCerrar: () => void; directos: number; }

export function DetallePersonaRed({ nodo, resumen, alCerrar, directos }: PropsDetalle) {
  const persona = usePersonasStore((estado) => estado.personas.find((item) => item.id === nodo?.personaId));
  if (!nodo || !persona) return null;
  const patrocinador = nodo.patrocinadorId ? resumen.get(nodo.patrocinadorId) : undefined;
  const padre = nodo.padrePosicionPersonaId ? resumen.get(nodo.padrePosicionPersonaId) : undefined;
  const distintos = patrocinador && padre && patrocinador.personaId !== padre.personaId;
  return (
    <Modal abierto alCerrar={alCerrar} titulo={nodo.nombre} descripcion={<span className="cifra">{nodo.codigo}</span>} ancho="sm">
      <div className="flex items-center gap-3">
        <Avatar nombres={persona.nombres} apellidos={persona.apellidos} tamano="lg" />
        <div className="flex flex-wrap gap-2">
          <InsigniaRun run={nodo.runCobro} tipo="cobro" />
          <Insignia tono={nodo.estado === 'activo' ? 'exito' : nodo.estado === 'suspendido' ? 'retenida' : 'advertencia'} className="capitalize">{nodo.estado}</Insignia>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-fondo p-3 text-center">
        <div><dt className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-texto-3">VP del ciclo</dt><dd className="cifra mt-0.5 text-lg font-semibold">{formatearNumero(nodo.vpCiclo)}</dd></div>
        <div><dt className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-texto-3">VC del ciclo</dt><dd className="cifra mt-0.5 text-lg font-semibold">{formatearNumero(nodo.vcCiclo)}</dd></div>
      </dl>
      <dl className="mt-4 flex flex-col gap-3 text-[13.5px]">
        <div className="flex items-start gap-3"><Users className="mt-0.5 size-4 shrink-0 text-texto-3" aria-hidden /><div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Patrocinador (Unilevel)</dt><dd className="font-semibold">{patrocinador ? `${patrocinador.nombre} · ${patrocinador.codigo}` : 'Sin patrocinador'}</dd></div></div>
        <div className="flex items-start gap-3"><GitBranch className="mt-0.5 size-4 shrink-0 text-texto-3" aria-hidden /><div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Padre de posición (Trinaria)</dt><dd className="flex flex-wrap items-center gap-2 font-semibold">{padre ? <>{padre.nombre} · {padre.codigo}{nodo.brazo && <ChipBrazo brazo={nodo.brazo} />}</> : nodo.posicionId ? 'Raíz de la red' : 'Sin posición asignada'}</dd></div></div>
        {distintos && <p className="flex items-start gap-2 rounded-xl bg-acento-suave px-3 py-2 text-xs text-[#155E75]"><ArrowUpRight className="mt-0.5 size-4 shrink-0" aria-hidden />El patrocinador y el padre de posición son distintos: las dos estructuras son independientes.</p>}
        <div className="flex items-start gap-3"><Mail className="mt-0.5 size-4 shrink-0 text-texto-3" aria-hidden /><div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Correo</dt><dd>{enmascararCorreo(persona.correo)}</dd></div></div>
        <div className="flex items-start gap-3"><Phone className="mt-0.5 size-4 shrink-0 text-texto-3" aria-hidden /><div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Teléfono</dt><dd>{enmascararTelefono(persona.telefono)}</dd></div></div>
      </dl>
      <p className="mt-4 text-xs text-texto-2">Directos patrocinados: <span className="cifra font-semibold">{directos}</span>. Por privacidad no se muestran datos de contacto completos ni ganancias de otros afiliados.</p>
    </Modal>
  );
}
