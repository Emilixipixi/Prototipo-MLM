import { useState } from 'react';
import { UserCheck } from 'lucide-react';
import { Boton } from '../../../componentes/ui/Boton';
import { Campo } from '../../../componentes/ui/Campo';
import { Insignia } from '../../../componentes/ui/Insignia';
import { Modal } from '../../../componentes/ui/Modal';
import { Selector } from '../../../componentes/ui/Selector';
import { Tabla, type ColumnaTabla } from '../../../componentes/ui/Tabla';
import { useToast } from '../../../componentes/ui/useToast';
import { relativoHoy } from '../../../datos/academico/fechasCampus';
import { useDatosAcademicos } from '../../../hooks/useDatosAcademicos';
import { usePermiso } from '../../../hooks/usePermiso';
import { asignarEvaluador, nombresEstadoMid } from '../../../servicios/mid';
import { usePersonaSesion } from '../../../store/useSesionStore';
import type { SustentacionMid } from '../../../tipos/academico';
import { formatearFecha } from '../../../utilidades/fechas';
import { formatearNumero } from '../../../utilidades/formatos';

export default function SustentacionesMid() {
  const datos = useDatosAcademicos();
  const persona = usePersonaSesion();
  const toast = useToast();
  const puedeEditar = usePermiso('academico', 'editar');
  const [seleccion, setSeleccion] = useState<SustentacionMid | null>(null);
  const evaluadores = datos.personas.filter((item) => item.perfil === 'evaluador');
  const [evaluadorId, setEvaluadorId] = useState(evaluadores[0]?.id ?? '');
  const [fecha, setFecha] = useState(relativoHoy(7));
  const columnas: ColumnaTabla<SustentacionMid>[] = [
    { clave: 'id', titulo: 'Solicitud', render: (fila) => <span className="cifra text-xs">{fila.id}</span> },
    { clave: 'persona', titulo: 'Estudiante', principalEnMovil: true, render: (fila) => datos.nombrePersona(fila.personaId) },
    { clave: 'titulo', titulo: 'Trabajo', render: (fila) => <span className="line-clamp-2">{fila.titulo}</span> },
    { clave: 'evaluador', titulo: 'Evaluador', render: (fila) => (fila.evaluadorId ? datos.nombrePersona(fila.evaluadorId) : 'Por asignar') },
    { clave: 'fecha', titulo: 'Fecha', render: (fila) => <span className="cifra">{formatearFecha(fila.fechaAsignada ?? fila.fechaPropuesta)}</span> },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <Insignia tono={fila.estado === 'aprobado' ? 'exito' : fila.estado === 'desaprobado' ? 'error' : 'info'}>{nombresEstadoMid[fila.estado]}</Insignia> },
    { clave: 'nota', titulo: 'Nota', alinear: 'derecha', render: (fila) => <span className="cifra">{fila.notaFinal !== null ? formatearNumero(fila.notaFinal, 2) : '-'}</span> },
  ];
  return (
    <div className="flex flex-col gap-5">
      <p className="rounded-xl bg-oro-suave px-3 py-2.5 text-[12.5px] text-[#7C4A03]">El MID es la única evaluación manual. El área académica asigna un evaluador (perfil Evaluador académico) y una fecha; el evaluador califica con la rúbrica desde su bandeja.</p>
      <Tabla columnas={columnas} filas={datos.campus.sustentaciones} claveFila={(fila) => fila.id} textoVacio="Aún no hay solicitudes MID. DEMO-L03 puede solicitar la suya desde Campus ERICK > Mi MID."
        accionesFila={(fila) => (puedeEditar && fila.estado === 'solicitado' ? <Boton tamano="sm" variante="secundario" icono={UserCheck} onClick={() => setSeleccion(fila)}>Asignar</Boton> : null)} />
      {seleccion && (
        <Modal abierto alCerrar={() => setSeleccion(null)} titulo={`Asignar evaluador · ${seleccion.id}`} descripcion={seleccion.titulo}
          pie={<><Boton variante="secundario" onClick={() => setSeleccion(null)}>Cancelar</Boton><Boton onClick={() => {
            const resultado = asignarEvaluador(seleccion.id, evaluadorId, fecha, persona?.id ?? 'DEMO-U01');
            if (resultado.ok) { toast.exito('Evaluador asignado', `${datos.nombrePersona(evaluadorId)} · ${formatearFecha(fecha)}`); setSeleccion(null); } else toast.error('No se pudo asignar', resultado.error);
          }}>Asignar</Boton></>}>
          <div className="flex flex-col gap-3">
            <Selector etiqueta="Evaluador" value={evaluadorId} onChange={(evento) => setEvaluadorId(evento.target.value)} opciones={evaluadores.map((item) => ({ valor: item.id, texto: `${item.nombres} ${item.apellidos} (${item.codigo})` }))} />
            <Campo etiqueta="Fecha de sustentación" type="date" value={fecha} min={relativoHoy(0)} onChange={(evento) => setFecha(evento.target.value)} />
            <p className="text-xs text-texto-2">Propuesta del estudiante: {formatearFecha(seleccion.fechaPropuesta)} · archivo {seleccion.archivo}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
