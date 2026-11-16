import { useState } from 'react';
import { CirclePause, CirclePlay, Plus, RotateCcw, UserPlus } from 'lucide-react';
import { BarraExportar } from '../../../componentes/ui/BarraExportar';
import { Boton } from '../../../componentes/ui/Boton';
import { Campo } from '../../../componentes/ui/Campo';
import { ChipsFiltro } from '../../../componentes/ui/ChipsFiltro';
import { ConPermiso } from '../../../componentes/ui/ConPermiso';
import { Confirmacion } from '../../../componentes/ui/Confirmacion';
import { Insignia } from '../../../componentes/ui/Insignia';
import { Modal } from '../../../componentes/ui/Modal';
import { Selector } from '../../../componentes/ui/Selector';
import { Tabla, type ColumnaTabla } from '../../../componentes/ui/Tabla';
import { useToast } from '../../../componentes/ui/useToast';
import { estadosAcceso } from '../../../datos/academico/presentacionCampus';
import { useDatosAcademicos, type FilaMatricula } from '../../../hooks/useDatosAcademicos';
import { usePermiso } from '../../../hooks/usePermiso';
import { resumirPrograma } from '../../../motores/academico/progreso';
import { otorgarIntentoExtra } from '../../../servicios/evaluaciones';
import { cambiarSuspension, matricularManual, nombresOrigen, programaMatriculable } from '../../../servicios/matriculas';
import { usePersonaSesion } from '../../../store/useSesionStore';
import type { EstadoMatricula } from '../../../tipos/academico';
import { formatearFecha } from '../../../utilidades/fechas';
import { formatearNumero } from '../../../utilidades/formatos';
import { CalendarPlus } from 'lucide-react';
import { extenderAcceso, mesesExtension } from '../../../servicios/matriculas';

type Filtro = 'todas' | EstadoMatricula;

export default function MatriculasAcademicas() {
  const datos = useDatosAcademicos();
  const persona = usePersonaSesion();
  const toast = useToast();
  const puedeEditar = usePermiso('matriculas', 'editar');
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [manual, setManual] = useState(false);
  const [alumnoId, setAlumnoId] = useState('');
  const [programaId, setProgramaId] = useState('DEMO-CUR-01');
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [suspension, setSuspension] = useState<FilaMatricula | null>(null);
  const [extra, setExtra] = useState<FilaMatricula | null>(null);
  const [elementoExtra, setElementoExtra] = useState('');
  const [motivoExtra, setMotivoExtra] = useState('');
  const [extension, setExtension] = useState<FilaMatricula | null>(null);
  const [mesesExtra, setMesesExtra] = useState('3');
  const [motivoExtension, setMotivoExtension] = useState('');
  const actor = persona?.id ?? 'DEMO-U01';
  const filas = datos.filasMatriculas.filter((fila) => filtro === 'todas' || fila.estado === filtro);
  const candidatos = datos.personas.filter((item) => item.tipo !== 'corporativo' && item.estado === 'activo');

  const columnas: ColumnaTabla<FilaMatricula>[] = [
    { clave: 'id', titulo: 'Matrícula', render: (fila) => <span className="cifra text-xs">{fila.matricula.id}</span>, valorOrden: (fila) => fila.matricula.id },
    { clave: 'persona', titulo: 'Estudiante', principalEnMovil: true, render: (fila) => <span><b>{fila.persona ? `${fila.persona.nombres} ${fila.persona.apellidos}` : fila.matricula.personaId}</b><span className="cifra block text-xs text-texto-3">{fila.matricula.personaId}</span></span>, valorOrden: (fila) => fila.persona?.nombres ?? '' },
    { clave: 'programa', titulo: 'Programa', render: (fila) => fila.programa, valorOrden: (fila) => fila.programa },
    { clave: 'origen', titulo: 'Origen', ocultarEnMovil: true, render: (fila) => `${nombresOrigen[fila.matricula.origen]}${fila.matricula.pedidoId ? ` ${fila.matricula.pedidoId}` : ''}` },
    { clave: 'estado', titulo: 'Acceso', render: (fila) => <Insignia tono={estadosAcceso[fila.estado].tono}>{estadosAcceso[fila.estado].texto}</Insignia>, valorOrden: (fila) => fila.estado },
    { clave: 'vence', titulo: 'Vence', render: (fila) => <span className="cifra">{formatearFecha(fila.matricula.vencimiento)}</span>, valorOrden: (fila) => fila.matricula.vencimiento },
    { clave: 'avance', titulo: 'Avance', alinear: 'derecha', render: (fila) => <span className="cifra">{fila.avance}%</span>, valorOrden: (fila) => fila.avance },
    { clave: 'nota', titulo: 'Nota', alinear: 'derecha', render: (fila) => <span className="cifra">{fila.nota.nota !== null ? formatearNumero(fila.nota.nota, 2) : '-'}</span> },
  ];
  const elementosExtra = extra ? (() => {
    const resumen = resumirPrograma(extra.matricula.personaId, extra.matricula.programaId, { programas: datos.academico.programas, modulos: datos.academico.modulos }, datos.campus);
    return (resumen?.ruta ?? []).filter((elemento) => ['bloqueado_por_intentos', 'desaprobado'].includes(resumen?.estados[elemento.id] ?? ''))
      .map((elemento) => ({ valor: elemento.id, texto: `${elemento.id} · ${datos.academico.temas.find((tema) => tema.id === elemento.id)?.nombre ?? datos.academico.tims.find((tim) => tim.id === elemento.id)?.nombre ?? ''}` }));
  })() : [];

  return (
    <div className="flex flex-col gap-5">
      <Tabla columnas={columnas} filas={filas} claveFila={(fila) => fila.matricula.id} textoBusqueda={(fila) => `${fila.matricula.id} ${fila.matricula.personaId} ${fila.persona?.nombres ?? ''} ${fila.persona?.apellidos ?? ''} ${fila.programa}`} placeholderBusqueda="Buscar estudiante o programa"
        filtros={<ChipsFiltro etiqueta="Estado de acceso" activo={filtro} alCambiar={setFiltro} opciones={[{ valor: 'todas', texto: 'Todas' }, { valor: 'activa', texto: 'Activas' }, { valor: 'por_vencer', texto: 'Por vencer' }, { valor: 'vencida', texto: 'Vencidas' }, { valor: 'suspendida', texto: 'Suspendidas' }]} />}
        accionesCabecera={<>
          <BarraExportar modulo="matriculas" nombreArchivo="matriculas_campus" filas={() => filas.map((fila) => ({ matricula: fila.matricula.id, persona: fila.matricula.personaId, programa: fila.programa, origen: fila.matricula.origen, estado: fila.estado, vencimiento: fila.matricula.vencimiento, avance: fila.avance, nota: fila.nota.nota }))} />
          <ConPermiso modulo="matriculas" accion="crear"><Boton tamano="sm" icono={UserPlus} onClick={() => { setManual(true); setError(null); }}>Matrícula manual</Boton></ConPermiso>
        </>}
        accionesFila={(fila) => puedeEditar ? (
          <div className="flex flex-wrap justify-end gap-1.5">
            <Boton tamano="sm" variante="fantasma" icono={fila.matricula.suspendida ? CirclePlay : CirclePause} onClick={() => setSuspension(fila)}>{fila.matricula.suspendida ? 'Reactivar' : 'Suspender'}</Boton>
            <Boton tamano="sm" variante="fantasma" icono={RotateCcw} onClick={() => { setExtra(fila); setElementoExtra(''); setMotivoExtra(''); setError(null); }}>Intento extra</Boton>
            {fila.matricula.origen !== 'membresia' && <Boton tamano="sm" variante="fantasma" icono={CalendarPlus} onClick={() => { setExtension(fila); setMesesExtra('3'); setMotivoExtension(''); setError(null); }}>Extender</Boton>}
          </div>
        ) : null}
      />
      {manual && (
        <Modal abierto alCerrar={() => setManual(false)} titulo="Matrícula manual" descripcion="Matricula sin pago (beca, cortesía o corrección). Queda en la bitácora." ancho="lg"
          pie={<><Boton variante="secundario" onClick={() => setManual(false)}>Cancelar</Boton><Boton icono={Plus} onClick={() => {
            const resultado = matricularManual(alumnoId, programaId, actor, motivo);
            if (!resultado.ok) { setError(resultado.error); return; }
            toast.exito(resultado.valor.renovada ? 'Acceso extendido' : 'Matrícula creada', `${resultado.valor.matricula.id} hasta el ${formatearFecha(resultado.valor.matricula.vencimiento)}`);
            setManual(false); setMotivo('');
          }}>Matricular</Boton></>}>
          <div className="flex flex-col gap-3">
            <Selector etiqueta="Estudiante" value={alumnoId} onChange={(evento) => setAlumnoId(evento.target.value)} opciones={[{ valor: '', texto: 'Selecciona una persona' }, ...candidatos.map((item) => ({ valor: item.id, texto: `${item.codigo} · ${item.nombres} ${item.apellidos}` }))]} />
            <Selector etiqueta="Programa" value={programaId} onChange={(evento) => setProgramaId(evento.target.value)} opciones={datos.academico.programas.filter(programaMatriculable).map((programa) => ({ valor: programa.id, texto: programa.nombre }))} />
            <Campo etiqueta="Motivo (obligatorio)" value={motivo} onChange={(evento) => setMotivo(evento.target.value)} placeholder="Beca, cortesía o corrección" />
            {error && <p className="text-[13px] font-medium text-error">{error}</p>}
          </div>
        </Modal>
      )}
      {extra && (
        <Modal abierto alCerrar={() => setExtra(null)} titulo={`Intento adicional · ${extra.matricula.id}`} descripcion="Solo para temas o TIM desaprobados o sin intentos."
          pie={<><Boton variante="secundario" onClick={() => setExtra(null)}>Cancelar</Boton><Boton onClick={() => {
            const resultado = otorgarIntentoExtra(extra.matricula.id, elementoExtra, 1, actor, motivoExtra);
            if (!resultado.ok) { setError(resultado.error); return; }
            toast.exito('Intento adicional otorgado', `${elementoExtra}: +1 intento.`);
            setExtra(null);
          }} disabled={!elementoExtra}>Otorgar</Boton></>}>
          {elementosExtra.length === 0 ? <p className="text-[13px] text-texto-2">El estudiante no tiene temas desaprobados ni sin intentos en este programa.</p> : (
            <div className="flex flex-col gap-3">
              <Selector etiqueta="Tema o TIM" value={elementoExtra} onChange={(evento) => setElementoExtra(evento.target.value)} opciones={[{ valor: '', texto: 'Selecciona' }, ...elementosExtra]} />
              <Campo etiqueta="Motivo (obligatorio)" value={motivoExtra} onChange={(evento) => setMotivoExtra(evento.target.value)} />
              {error && <p className="text-[13px] font-medium text-error">{error}</p>}
            </div>
          )}
        </Modal>
      )}
      {extension && (
        <Modal abierto alCerrar={() => setExtension(null)} titulo={`Extender acceso · ${extension.matricula.id}`} descripcion="Amplía el vencimiento sin nuevo pago (cortesía, compensación o corrección). Queda en la bitácora y en el historial de la matrícula."
          pie={<><Boton variante="secundario" onClick={() => setExtension(null)}>Cancelar</Boton><Boton icono={CalendarPlus} onClick={() => {
            const resultado = extenderAcceso(extension.matricula.id, Number(mesesExtra), actor, motivoExtension);
            if (!resultado.ok) { setError(resultado.error); return; }
            toast.exito('Acceso extendido', `${resultado.valor.id} hasta el ${formatearFecha(resultado.valor.vencimiento)}`);
            setExtension(null);
          }}>Extender</Boton></>}>
          <div className="flex flex-col gap-3">
            <p className="rounded-xl bg-fondo px-3 py-2.5 text-[13px] text-texto-2">{extension.persona ? `${extension.persona.nombres} ${extension.persona.apellidos}` : extension.matricula.personaId} · {extension.programa}. Vencimiento actual: <span className="cifra">{formatearFecha(extension.matricula.vencimiento)}</span>; si ya venció, la extensión se cuenta desde hoy.</p>
            <Selector etiqueta="Meses a extender" value={mesesExtra} onChange={(evento) => setMesesExtra(evento.target.value)} opciones={mesesExtension.map((meses) => ({ valor: String(meses), texto: `${meses} ${meses === 1 ? 'mes' : 'meses'}` }))} />
            <Campo etiqueta="Motivo (obligatorio)" value={motivoExtension} onChange={(evento) => setMotivoExtension(evento.target.value)} placeholder="Cortesía, compensación o corrección" />
            {error && <p className="text-[13px] font-medium text-error">{error}</p>}
          </div>
        </Modal>
      )}
      <Confirmacion abierto={Boolean(suspension)} alCerrar={() => setSuspension(null)} requiereMotivo peligro={!suspension?.matricula.suspendida}
        titulo={suspension?.matricula.suspendida ? 'Reactivar acceso' : 'Suspender acceso'}
        resumen={suspension ? `${suspension.programa} de ${suspension.persona?.nombres ?? suspension.matricula.personaId}. Las notas y los certificados se conservan.` : ''}
        textoConfirmar={suspension?.matricula.suspendida ? 'Reactivar' : 'Suspender'}
        alConfirmar={(texto) => {
          if (!suspension) return;
          const resultado = cambiarSuspension(suspension.matricula.id, !suspension.matricula.suspendida, actor, texto);
          if (resultado.ok) toast.exito(resultado.valor.suspendida ? 'Acceso suspendido' : 'Acceso reactivado', resultado.valor.id); else toast.error('No se pudo aplicar', resultado.error);
          setSuspension(null);
        }} />
    </div>
  );
}
