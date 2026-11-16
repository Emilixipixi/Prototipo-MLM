import { useMemo, useState } from 'react';
import { FilePen, Plus, Power } from 'lucide-react';
import { Boton } from '../../../componentes/ui/Boton';
import { Campo } from '../../../componentes/ui/Campo';
import { ConPermiso } from '../../../componentes/ui/ConPermiso';
import { Insignia } from '../../../componentes/ui/Insignia';
import { Modal } from '../../../componentes/ui/Modal';
import { Selector } from '../../../componentes/ui/Selector';
import { Tabla, type ColumnaTabla } from '../../../componentes/ui/Tabla';
import { useToast } from '../../../componentes/ui/useToast';
import { nombresTipoPregunta } from '../../../datos/academico/presentacionCampus';
import { opcionesVerdaderoFalso } from '../../../datos/academico/preguntas';
import { usePermiso } from '../../../hooks/usePermiso';
import { alternarPregunta, guardarPregunta } from '../../../servicios/academico';
import { useAcademicoStore } from '../../../store/useAcademicoStore';
import { usePersonaSesion } from '../../../store/useSesionStore';
import type { Pregunta, TipoPregunta } from '../../../tipos/academico';

const claseArea = 'w-full rounded-xl border border-borde bg-superficie p-3 text-sm outline-none focus:border-acento focus:ring-2 focus:ring-acento-suave';

function lineas(texto: string): string[] {
  return texto.split('\n').map((linea) => linea.trim()).filter(Boolean);
}

function FormPregunta({ inicial, ambitos, alCerrar }: { inicial: Pregunta; ambitos: Array<{ valor: string; texto: string; ambito: 'tema' | 'tim' }>; alCerrar: () => void }) {
  const persona = usePersonaSesion();
  const toast = useToast();
  const [tipo, setTipo] = useState<TipoPregunta>(inicial.tipo);
  const [ambitoId, setAmbitoId] = useState(inicial.ambitoId);
  const [enunciado, setEnunciado] = useState(inicial.enunciado);
  const [opciones, setOpciones] = useState(inicial.opciones.join('\n'));
  const [correctas, setCorrectas] = useState(inicial.correctas.map((valor) => valor + 1).join(', '));
  const [pares, setPares] = useState((inicial.pares ?? []).map(([a, b]) => `${a} = ${b}`).join('\n'));
  const [orden, setOrden] = useState((inicial.orden ?? []).join('\n'));
  const [valor, setValor] = useState(String(inicial.valorNumerico ?? ''));
  const [tolerancia, setTolerancia] = useState(String(inicial.tolerancia ?? 0));
  const [explicacion, setExplicacion] = useState(inicial.explicacion ?? '');
  const [error, setError] = useState<string | null>(null);
  const guardar = () => {
    const ambito = ambitos.find((item) => item.valor === ambitoId)?.ambito ?? 'tema';
    const indices = correctas.split(',').map((parte) => Number(parte.trim()) - 1).filter((numero) => Number.isInteger(numero) && numero >= 0);
    const pregunta: Pregunta = {
      id: inicial.id, ambito, ambitoId, tipo, enunciado: enunciado.trim(), activa: inicial.activa, explicacion: explicacion.trim() || undefined,
      opciones: tipo === 'verdadero_falso' ? opcionesVerdaderoFalso : tipo === 'opcion_multiple' || tipo === 'seleccion_multiple' ? lineas(opciones) : [],
      correctas: tipo === 'opcion_multiple' || tipo === 'seleccion_multiple' || tipo === 'verdadero_falso' ? indices : [],
      pares: tipo === 'emparejar' ? lineas(pares).map((linea) => linea.split('=').map((parte) => parte.trim()) as [string, string]).filter((par) => par.length === 2 && par[0] && par[1]) : undefined,
      orden: tipo === 'ordenar' ? lineas(orden) : undefined,
      valorNumerico: tipo === 'numerica' ? Number(valor) : undefined, tolerancia: tipo === 'numerica' ? Number(tolerancia) : undefined,
    };
    if (pregunta.correctas.some((indice) => indice >= pregunta.opciones.length)) { setError('Las respuestas correctas deben referirse a opciones existentes.'); return; }
    const resultado = guardarPregunta(pregunta, persona?.id ?? 'DEMO-U01');
    if (!resultado.ok) { setError(resultado.error); return; }
    toast.exito('Pregunta guardada', resultado.valor.id);
    alCerrar();
  };
  return (
    <Modal abierto alCerrar={alCerrar} titulo={inicial.id ? `Editar ${inicial.id}` : 'Nueva pregunta'} ancho="lg"
      pie={<><Boton variante="secundario" onClick={alCerrar}>Cancelar</Boton><Boton onClick={guardar}>Guardar</Boton></>}>
      <div className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Selector etiqueta="Tipo" value={tipo} onChange={(evento) => setTipo(evento.target.value as TipoPregunta)} opciones={Object.entries(nombresTipoPregunta).map(([clave, texto]) => ({ valor: clave, texto }))} />
          <Selector etiqueta="Tema o TIM" value={ambitoId} onChange={(evento) => setAmbitoId(evento.target.value)} opciones={ambitos} />
        </div>
        <div className="flex flex-col gap-1.5"><label htmlFor="enunciado" className="text-[13px] font-semibold">Enunciado</label><textarea id="enunciado" rows={2} value={enunciado} onChange={(evento) => setEnunciado(evento.target.value)} className={claseArea} /></div>
        {(tipo === 'opcion_multiple' || tipo === 'seleccion_multiple') && (
          <>
            <div className="flex flex-col gap-1.5"><label htmlFor="opciones" className="text-[13px] font-semibold">Opciones (una por línea)</label><textarea id="opciones" rows={4} value={opciones} onChange={(evento) => setOpciones(evento.target.value)} className={claseArea} /></div>
            <Campo etiqueta={tipo === 'opcion_multiple' ? 'Número de la opción correcta' : 'Números de las opciones correctas (separados por coma)'} value={correctas} onChange={(evento) => setCorrectas(evento.target.value)} />
          </>
        )}
        {tipo === 'verdadero_falso' && <Selector etiqueta="Respuesta correcta" value={correctas || '1'} onChange={(evento) => setCorrectas(evento.target.value)} opciones={[{ valor: '1', texto: 'Verdadero' }, { valor: '2', texto: 'Falso' }]} />}
        {tipo === 'emparejar' && <div className="flex flex-col gap-1.5"><label htmlFor="pares" className="text-[13px] font-semibold">Pares (concepto = definición, uno por línea)</label><textarea id="pares" rows={5} value={pares} onChange={(evento) => setPares(evento.target.value)} className={claseArea} /></div>}
        {tipo === 'ordenar' && <div className="flex flex-col gap-1.5"><label htmlFor="orden" className="text-[13px] font-semibold">Pasos en el orden correcto (uno por línea)</label><textarea id="orden" rows={5} value={orden} onChange={(evento) => setOrden(evento.target.value)} className={claseArea} /></div>}
        {tipo === 'numerica' && <div className="grid gap-3 sm:grid-cols-2"><Campo etiqueta="Valor correcto" type="number" value={valor} onChange={(evento) => setValor(evento.target.value)} /><Campo etiqueta="Tolerancia" type="number" min={0} value={tolerancia} onChange={(evento) => setTolerancia(evento.target.value)} /></div>}
        <Campo etiqueta="Explicación (retroalimentación)" value={explicacion} onChange={(evento) => setExplicacion(evento.target.value)} />
        {error && <p className="text-[13px] font-medium text-error">{error}</p>}
      </div>
    </Modal>
  );
}

export default function BancoPreguntas() {
  const { preguntas, programas, modulos, temas, tims } = useAcademicoStore();
  const persona = usePersonaSesion();
  const puedeEditar = usePermiso('academico', 'editar');
  const toast = useToast();
  const cursos = programas.filter((programa) => programa.tipo === 'curso');
  const [cursoId, setCursoId] = useState(cursos[0]?.id ?? '');
  const [tipo, setTipo] = useState('');
  const [editando, setEditando] = useState<Pregunta | null>(null);
  const ambitos = useMemo(() => {
    const curso = programas.find((programa) => programa.id === cursoId);
    return (curso?.moduloIds ?? []).flatMap((moduloId) => {
      const modulo = modulos.find((item) => item.id === moduloId);
      if (!modulo) return [];
      return [
        ...modulo.temaIds.map((temaId) => ({ valor: temaId, texto: `${modulo.nombre} · ${temas.find((tema) => tema.id === temaId)?.nombre ?? temaId}`, ambito: 'tema' as const })),
        { valor: modulo.timId, texto: `${modulo.nombre} · ${tims.find((tim) => tim.id === modulo.timId)?.nombre ?? 'TIM'}`, ambito: 'tim' as const },
      ];
    });
  }, [cursoId, programas, modulos, temas, tims]);
  const filas = preguntas.filter((pregunta) => ambitos.some((ambito) => ambito.valor === pregunta.ambitoId) && (!tipo || pregunta.tipo === tipo));
  const columnas: ColumnaTabla<Pregunta>[] = [
    { clave: 'id', titulo: 'Código', render: (fila) => <span className="cifra text-xs">{fila.id}</span>, valorOrden: (fila) => fila.id },
    { clave: 'enunciado', titulo: 'Enunciado', principalEnMovil: true, render: (fila) => <span className="line-clamp-2">{fila.enunciado}</span> },
    { clave: 'tipo', titulo: 'Tipo', render: (fila) => nombresTipoPregunta[fila.tipo], valorOrden: (fila) => fila.tipo },
    { clave: 'ambito', titulo: 'Tema o TIM', ocultarEnMovil: true, render: (fila) => <span className="text-xs text-texto-2">{ambitos.find((ambito) => ambito.valor === fila.ambitoId)?.texto ?? fila.ambitoId}</span> },
    { clave: 'activa', titulo: 'Estado', render: (fila) => <Insignia tono={fila.activa ? 'exito' : 'neutra'}>{fila.activa ? 'Activa' : 'Inactiva'}</Insignia> },
  ];
  const nueva: Pregunta = { id: '', ambito: 'tema', ambitoId: ambitos[0]?.valor ?? '', tipo: 'opcion_multiple', enunciado: '', opciones: [], correctas: [], activa: true };
  return (
    <div className="flex flex-col gap-5">
      <Tabla columnas={columnas} filas={filas} claveFila={(fila) => fila.id} textoBusqueda={(fila) => `${fila.id} ${fila.enunciado}`} placeholderBusqueda="Buscar pregunta"
        filtros={<>
          <Selector etiqueta="Curso" ocultarEtiqueta value={cursoId} onChange={(evento) => setCursoId(evento.target.value)} opciones={cursos.map((curso) => ({ valor: curso.id, texto: curso.nombre }))} />
          <Selector etiqueta="Tipo de pregunta" ocultarEtiqueta value={tipo} onChange={(evento) => setTipo(evento.target.value)} opciones={[{ valor: '', texto: 'Todos los tipos' }, ...Object.entries(nombresTipoPregunta).map(([valor, texto]) => ({ valor, texto }))]} />
        </>}
        accionesCabecera={<ConPermiso modulo="academico" accion="crear"><Boton tamano="sm" icono={Plus} onClick={() => setEditando(nueva)}>Nueva pregunta</Boton></ConPermiso>}
        accionesFila={(fila) => puedeEditar ? (
          <div className="flex justify-end gap-1.5">
            <Boton tamano="sm" variante="fantasma" icono={FilePen} onClick={() => setEditando(fila)}>Editar</Boton>
            <Boton tamano="sm" variante="fantasma" icono={Power} onClick={() => { const resultado = alternarPregunta(fila.id, persona?.id ?? 'DEMO-U01'); if (resultado.ok) toast.info(resultado.valor ? 'Pregunta activada' : 'Pregunta desactivada', fila.id); }}>{fila.activa ? 'Desactivar' : 'Activar'}</Boton>
          </div>
        ) : null}
      />
      <p className="text-xs text-texto-2">{filas.length} preguntas. Cada tema debe tener al menos tantas preguntas activas como las que usa la evaluación; si no, el programa no se puede publicar.</p>
      {editando && <FormPregunta inicial={editando} ambitos={ambitos} alCerrar={() => setEditando(null)} />}
    </div>
  );
}
