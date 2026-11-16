import { useState } from 'react';
import { Activity } from 'lucide-react';
import { BarraExportar } from '../ui/BarraExportar';
import { Insignia } from '../ui/Insignia';
import { Selector } from '../ui/Selector';
import { Tabla, type ColumnaTabla } from '../ui/Tabla';
import { Tarjeta } from '../ui/Tarjeta';
import { nombresEventoLms } from '../../datos/academico/presentacionCampus';
import { useAcademicoStore } from '../../store/useAcademicoStore';
import { useCampusStore } from '../../store/useCampusStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import type { EventoIntegracion, TipoEventoLms } from '../../tipos/academico';
import { formatearFechaHora } from '../../utilidades/fechas';

export function RegistroEventosLms({ personaId }: { personaId?: string }) {
  const eventos = useCampusStore((estado) => estado.eventos);
  const personas = usePersonasStore((estado) => estado.personas);
  const programas = useAcademicoStore((estado) => estado.programas);
  const [tipo, setTipo] = useState('');
  const [resultado, setResultado] = useState('');
  const nombre = (id: string) => { const persona = personas.find((item) => item.id === id); return persona ? `${persona.nombres} ${persona.apellidos}` : id; };
  const filas = [...eventos].filter((evento) => (!personaId || evento.personaId === personaId) && (!tipo || evento.tipo === tipo) && (!resultado || evento.estado === resultado)).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const columnas: ColumnaTabla<EventoIntegracion>[] = [
    { clave: 'fecha', titulo: 'Fecha', render: (fila) => <span className="cifra text-xs">{formatearFechaHora(fila.fecha)}</span>, valorOrden: (fila) => fila.fecha },
    { clave: 'tipo', titulo: 'Evento', principalEnMovil: true, render: (fila) => <span><b>{nombresEventoLms[fila.tipo]}</b><span className="cifra block text-[11px] text-texto-3">{fila.id}</span></span>, valorOrden: (fila) => fila.tipo },
    { clave: 'persona', titulo: 'Persona', render: (fila) => nombre(fila.personaId) },
    { clave: 'programa', titulo: 'Programa', ocultarEnMovil: true, render: (fila) => (fila.programaId ? programas.find((programa) => programa.id === fila.programaId)?.nombre ?? fila.programaId : '-') },
    { clave: 'detalle', titulo: 'Detalle', ocultarEnMovil: true, render: (fila) => <span className="text-xs text-texto-2">{fila.detalle}</span> },
    { clave: 'estado', titulo: 'Resultado', render: (fila) => <Insignia tono={fila.estado === 'error' ? 'error' : fila.estado === 'enviado' ? 'info' : 'exito'}>{fila.estado}</Insignia> },
  ];
  return (
    <Tarjeta titulo="Registro de eventos del conector LMS" subtitulo="Cada matrícula, avance, aprobación, documento y vencimiento queda registrado (simulado)." icono={Activity} sinRelleno>
      <div className="px-4 pb-4 pt-3 sm:px-5">
        <Tabla columnas={columnas} filas={filas} claveFila={(fila) => fila.id} textoBusqueda={(fila) => `${fila.id} ${fila.personaId} ${nombre(fila.personaId)} ${fila.detalle}`} placeholderBusqueda="Buscar evento" porPagina={8}
          filtros={<>
            <Selector etiqueta="Tipo de evento" ocultarEtiqueta value={tipo} onChange={(evento) => setTipo(evento.target.value)} opciones={[{ valor: '', texto: 'Todos los eventos' }, ...(Object.keys(nombresEventoLms) as TipoEventoLms[]).map((clave) => ({ valor: clave, texto: nombresEventoLms[clave] }))]} />
            <Selector etiqueta="Resultado" ocultarEtiqueta value={resultado} onChange={(evento) => setResultado(evento.target.value)} opciones={[{ valor: '', texto: 'Todos los resultados' }, { valor: 'procesado', texto: 'Procesado' }, { valor: 'error', texto: 'Error' }, { valor: 'enviado', texto: 'Enviado' }]} />
          </>}
          accionesCabecera={<BarraExportar modulo="integraciones" nombreArchivo="eventos_conector_lms" filas={() => filas.map((fila) => ({ id: fila.id, fecha: fila.fecha, tipo: fila.tipo, persona: fila.personaId, programa: fila.programaId, resultado: fila.estado, detalle: fila.detalle }))} />} />
      </div>
    </Tarjeta>
  );
}
