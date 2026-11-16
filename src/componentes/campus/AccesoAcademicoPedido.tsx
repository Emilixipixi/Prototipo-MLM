import { ArrowRight, CirclePause, GraduationCap } from 'lucide-react';
import { EnlaceBoton } from '../ui/EnlaceBoton';
import { Insignia } from '../ui/Insignia';
import { Tarjeta } from '../ui/Tarjeta';
import { relativoHoy } from '../../datos/academico/fechasCampus';
import { estadosAcceso } from '../../datos/academico/presentacionCampus';
import { estadoMatricula, estadoMembresia } from '../../motores/academico/accesos';
import { useAcademicoStore } from '../../store/useAcademicoStore';
import { useCampusStore } from '../../store/useCampusStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import { formatearFecha } from '../../utilidades/fechas';

export function AccesoAcademicoPedido({ pedidoId, compradorId }: { pedidoId: string; compradorId: string }) {
  const persona = usePersonaSesion();
  const matriculas = useCampusStore((estado) => estado.matriculas);
  const membresias = useCampusStore((estado) => estado.membresias);
  const programas = useAcademicoStore((estado) => estado.programas);
  const planes = useAcademicoStore((estado) => estado.planes);
  const hoy = relativoHoy(0);
  const propias = matriculas.filter((matricula) => matricula.pedidoId === pedidoId || matricula.historial.some((movimiento) => movimiento.motivo?.includes(pedidoId)));
  const membresia = membresias.find((item) => item.pedidoIds.includes(pedidoId));
  if (propias.length === 0 && !membresia) return null;
  const esComprador = persona?.id === compradorId && (persona.perfil === 'cliente_alumno' || persona.perfil === 'afiliado');
  const filas = [
    ...propias.map((matricula) => ({ id: matricula.id, nombre: programas.find((item) => item.id === matricula.programaId)?.nombre ?? matricula.programaId, estado: estadoMatricula(matricula, hoy), vencimiento: matricula.vencimiento })),
    ...(membresia ? [{ id: membresia.id, nombre: planes.find((item) => item.id === membresia.planId)?.nombre ?? 'Membresía ERICK', estado: estadoMembresia(membresia, hoy), vencimiento: membresia.vencimiento }] : []),
  ];
  return (
    <Tarjeta
      titulo="Acceso académico generado"
      subtitulo="Campus ERICK activó este acceso al confirmarse el cobro del pedido."
      icono={GraduationCap}
      acciones={esComprador ? <EnlaceBoton to="/campus" tamano="sm" iconoDerecha={ArrowRight}>Ir a Campus ERICK</EnlaceBoton> : undefined}
    >
      <ul className="flex flex-col gap-2">
        {filas.map((fila) => {
          const acceso = estadosAcceso[fila.estado];
          return (
            <li key={fila.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-fondo px-3 py-2.5 text-[13px]">
              <span className="cifra text-xs text-texto-3">{fila.id}</span>
              <span className="min-w-0 flex-1 font-semibold text-texto">{fila.nombre}</span>
              <span className="text-xs text-texto-2">hasta {formatearFecha(fila.vencimiento)}</span>
              <Insignia tono={acceso.tono} icono={fila.estado === 'suspendida' ? CirclePause : acceso.icono}>{acceso.texto}</Insignia>
            </li>
          );
        })}
      </ul>
    </Tarjeta>
  );
}
