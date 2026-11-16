import { useMemo, useState } from 'react';
import { BookOpen, CalendarDays, ClipboardPen, History, Plus, UserPlus, Users, X } from 'lucide-react';
import { Avatar } from '../../componentes/ui/Avatar';
import { Boton } from '../../componentes/ui/Boton';
import { Campo } from '../../componentes/ui/Campo';
import { Confirmacion } from '../../componentes/ui/Confirmacion';
import { Insignia } from '../../componentes/ui/Insignia';
import { Modal } from '../../componentes/ui/Modal';
import { Selector } from '../../componentes/ui/Selector';
import { Tabla, type ColumnaTabla } from '../../componentes/ui/Tabla';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { TarjetaKpi } from '../../componentes/ui/TarjetaKpi';
import { useToast } from '../../componentes/ui/useToast';
import { relativoHoy } from '../../datos/academico/fechasCampus';
import { matriculadosDePrograma } from '../../servicios/calendario';
import { asignarDocente, crearDocente, programasDeDocente, retirarDocente, type DatosNuevoDocente } from '../../servicios/docentes';
import { useAcademicoStore } from '../../store/useAcademicoStore';
import { useCampusStore } from '../../store/useCampusStore';
import { useErickStore } from '../../store/useErickStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { AsignacionDocente } from '../../tipos/academico';
import type { Persona } from '../../tipos/persona';
import { formatearFecha } from '../../utilidades/fechas';

const vacio: DatosNuevoDocente = { nombres: '', apellidos: '', correo: '', telefono: '' };

export default function Docentes() {
  const actor = usePersonaSesion()?.id ?? 'DEMO-U04';
  const toast = useToast();
  const personas = usePersonasStore((estado) => estado.personas);
  const programas = useAcademicoStore((estado) => estado.programas);
  const matriculas = useCampusStore((estado) => estado.matriculas);
  const sustentaciones = useCampusStore((estado) => estado.sustentaciones);
  const asignaciones = useErickStore((estado) => estado.asignacionesDocentes);
  const eventos = useErickStore((estado) => estado.eventosCalendario);
  const [asignando, setAsignando] = useState<Persona | null>(null);
  const [programaElegido, setProgramaElegido] = useState('');
  const [retirando, setRetirando] = useState<AsignacionDocente | null>(null);
  const [nuevo, setNuevo] = useState<DatosNuevoDocente | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hoy = relativoHoy(0);
  const docentes = personas.filter((persona) => persona.perfil === 'evaluador');
  const nombrePrograma = (id: string) => programas.find((item) => item.id === id)?.nombre ?? id;
  const nombre = (id: string) => { const persona = personas.find((item) => item.id === id); return persona ? `${persona.nombres} ${persona.apellidos}` : id; };

  const carga = useMemo(() => docentes.map((docente) => {
    const programasDocente = programasDeDocente(docente.id, asignaciones, programas);
    const estudiantes = new Set(programasDocente.flatMap((programaId) => matriculadosDePrograma(programaId, matriculas, programas)));
    return {
      docente, directas: asignaciones.filter((item) => item.activa && item.docenteId === docente.id), programasDocente, estudiantes: estudiantes.size,
      pendientes: sustentaciones.filter((item) => item.evaluadorId === docente.id && item.estado === 'asignado').length,
      calificadas: sustentaciones.filter((item) => item.evaluadorId === docente.id && ['aprobado', 'desaprobado'].includes(item.estado)).length,
      fechas: eventos.filter((evento) => evento.creadoPor === docente.id && evento.estado === 'programado' && evento.fecha >= hoy).length,
    };
  }), [docentes, asignaciones, programas, matriculas, sustentaciones, eventos, hoy]);

  const columnas: ColumnaTabla<AsignacionDocente>[] = [
    { clave: 'id', titulo: 'Asignación', render: (fila) => <span className="cifra text-xs">{fila.id}</span>, valorOrden: (fila) => fila.id },
    { clave: 'docente', titulo: 'Docente', principalEnMovil: true, render: (fila) => <b>{nombre(fila.docenteId)}</b>, valorOrden: (fila) => nombre(fila.docenteId) },
    { clave: 'programa', titulo: 'Programa', render: (fila) => nombrePrograma(fila.programaId), valorOrden: (fila) => nombrePrograma(fila.programaId) },
    { clave: 'desde', titulo: 'Desde', render: (fila) => <span className="cifra text-xs">{formatearFecha(fila.desde)}</span>, valorOrden: (fila) => fila.desde },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <Insignia tono={fila.activa ? 'exito' : 'retenida'}>{fila.activa ? 'Activa' : 'Retirada'}</Insignia>, valorOrden: (fila) => String(fila.activa) },
  ];

  const asignar = () => {
    if (!asignando) return;
    const resultado = asignarDocente(asignando.id, programaElegido, actor);
    if (!resultado.ok) { setError(resultado.error); return; }
    toast.exito('Programa asignado', `${nombre(asignando.id)}: ${nombrePrograma(programaElegido)}`);
    setAsignando(null);
  };

  const registrar = () => {
    if (!nuevo) return;
    const resultado = crearDocente(nuevo, actor);
    if (!resultado.ok) { setError(resultado.error); return; }
    toast.exito('Docente registrado', `${resultado.valor.nombres} ${resultado.valor.apellidos} (${resultado.valor.id}). Ahora asígnale programas.`);
    setNuevo(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <TarjetaKpi etiqueta="Docentes activos" valor={docentes.filter((docente) => docente.estado === 'activo').length} icono={Users} tono="primario" />
        <TarjetaKpi etiqueta="Asignaciones activas" valor={asignaciones.filter((item) => item.activa).length} icono={BookOpen} tono="acento" />
        <TarjetaKpi etiqueta="Sustentaciones por calificar" valor={carga.reduce((suma, fila) => suma + fila.pendientes, 0)} icono={ClipboardPen} tono="oro" />
        <TarjetaKpi etiqueta="Fechas de docentes" valor={carga.reduce((suma, fila) => suma + fila.fechas, 0)} icono={CalendarDays} tono="info" />
      </div>
      <div className="flex justify-end"><Boton icono={UserPlus} onClick={() => { setNuevo(vacio); setError(null); }}>Nuevo docente</Boton></div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
        {carga.map((fila) => (
          <Tarjeta key={fila.docente.id}>
            <div className="flex items-start gap-3">
              <Avatar nombres={fila.docente.nombres} apellidos={fila.docente.apellidos} tamano="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-texto">{fila.docente.nombres} {fila.docente.apellidos}</p>
                <p className="cifra truncate text-[11.5px] text-texto-2">{fila.docente.id} · {fila.docente.correo}</p>
              </div>
              <Insignia tono={fila.docente.estado === 'activo' ? 'exito' : 'retenida'}>{fila.docente.estado}</Insignia>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[['Estudiantes', fila.estudiantes], ['MID por calificar', fila.pendientes], ['MID calificadas', fila.calificadas]].map(([texto, valor]) => (
                <div key={texto} className="rounded-xl bg-fondo px-2 py-2.5"><dt className="text-[11px] text-texto-2">{texto}</dt><dd className="cifra text-[18px] font-bold text-texto">{valor}</dd></div>
              ))}
            </dl>
            <p className="mt-4 text-[12px] font-semibold uppercase tracking-wide text-texto-3">Programas a cargo</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {fila.directas.length === 0 && <li className="text-[13px] text-texto-2">Sin programas asignados.</li>}
              {fila.directas.map((asignacion) => (
                <li key={asignacion.id} className="inline-flex min-h-9 items-center gap-1 rounded-full border border-borde bg-primario-suave pl-3 pr-1 text-[12.5px] font-medium text-primario-profundo">
                  {nombrePrograma(asignacion.programaId)}
                  <button type="button" onClick={() => setRetirando(asignacion)} className="grid size-8 place-items-center rounded-full hover:bg-white" aria-label={`Retirar ${nombrePrograma(asignacion.programaId)}`}><X className="size-3.5" aria-hidden /></button>
                </li>
              ))}
            </ul>
            {fila.programasDocente.length > fila.directas.length && <p className="mt-2 text-[12px] text-texto-2">Incluye por el diplomado: {fila.programasDocente.filter((id) => !fila.directas.some((item) => item.programaId === id)).map(nombrePrograma).join(', ')}.</p>}
            <div className="mt-4 flex justify-end"><Boton tamano="sm" variante="secundario" icono={Plus} onClick={() => { setAsignando(fila.docente); setProgramaElegido(programas.find((programa) => programa.estado === 'publicado')?.id ?? ''); setError(null); }}>Asignar programa</Boton></div>
          </Tarjeta>
        ))}
      </div>
      <Tarjeta titulo="Historial de asignaciones" icono={History} sinRelleno>
        <Tabla columnas={columnas} filas={[...asignaciones].sort((a, b) => b.desde.localeCompare(a.desde))} claveFila={(fila) => fila.id} porPagina={8}
          textoBusqueda={(fila) => `${fila.id} ${nombre(fila.docenteId)} ${nombrePrograma(fila.programaId)}`} placeholderBusqueda="Buscar docente o programa" />
      </Tarjeta>

      {asignando && (
        <Modal abierto alCerrar={() => setAsignando(null)} titulo={`Asignar programa a ${asignando.nombres}`} descripcion="Al asignar un diplomado, el docente también gestiona sus cursos y su MID."
          pie={<><Boton variante="secundario" onClick={() => setAsignando(null)}>Cancelar</Boton><Boton icono={Plus} onClick={asignar}>Asignar</Boton></>}>
          <div className="flex flex-col gap-3">
            <Selector etiqueta="Programa" value={programaElegido} onChange={(evento) => setProgramaElegido(evento.target.value)} opciones={programas.filter((programa) => programa.estado !== 'archivado').map((programa) => ({ valor: programa.id, texto: `${programa.nombre} (${programa.estado})` }))} />
            {error && <p role="alert" className="text-[13px] font-medium text-error">{error}</p>}
          </div>
        </Modal>
      )}
      {nuevo && (
        <Modal abierto alCerrar={() => setNuevo(null)} titulo="Nuevo docente" descripcion="Se crea con perfil Docente evaluador; luego asígnale sus programas."
          pie={<><Boton variante="secundario" onClick={() => setNuevo(null)}>Cancelar</Boton><Boton icono={UserPlus} onClick={registrar}>Registrar docente</Boton></>}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo etiqueta="Nombres" value={nuevo.nombres} onChange={(evento) => setNuevo({ ...nuevo, nombres: evento.target.value })} />
            <Campo etiqueta="Apellidos" value={nuevo.apellidos} onChange={(evento) => setNuevo({ ...nuevo, apellidos: evento.target.value })} />
            <Campo etiqueta="Correo" type="email" value={nuevo.correo} onChange={(evento) => setNuevo({ ...nuevo, correo: evento.target.value })} />
            <Campo etiqueta="Teléfono" value={nuevo.telefono} onChange={(evento) => setNuevo({ ...nuevo, telefono: evento.target.value })} />
            {error && <p role="alert" className="text-[13px] font-medium text-error sm:col-span-2">{error}</p>}
          </div>
        </Modal>
      )}
      <Confirmacion abierto={Boolean(retirando)} alCerrar={() => setRetirando(null)} titulo="Retirar programa del docente" peligro requiereMotivo textoConfirmar="Retirar"
        resumen={retirando ? `${nombre(retirando.docenteId)} dejará de gestionar ${nombrePrograma(retirando.programaId)}. Las notas y fechas ya registradas se conservan.` : ''}
        alConfirmar={(motivo) => {
          if (!retirando) return;
          const resultado = retirarDocente(retirando.id, actor, motivo);
          if (resultado.ok) toast.info('Asignación retirada', nombrePrograma(retirando.programaId));
          else toast.error('No se pudo retirar', resultado.error);
          setRetirando(null);
        }} />
    </div>
  );
}
