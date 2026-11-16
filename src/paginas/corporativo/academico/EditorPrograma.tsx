import { useState, type ChangeEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, BookOpen, CircleCheck, Layers, ListChecks, Minus, Plus, Save, Settings2, SquarePen } from 'lucide-react';
import { Boton } from '../../../componentes/ui/Boton';
import { Campo } from '../../../componentes/ui/Campo';
import { EstadoVacio } from '../../../componentes/ui/EstadoVacio';
import { Insignia } from '../../../componentes/ui/Insignia';
import { Pestanas } from '../../../componentes/ui/Pestanas';
import { Selector } from '../../../componentes/ui/Selector';
import { Tarjeta } from '../../../componentes/ui/Tarjeta';
import { useToast } from '../../../componentes/ui/useToast';
import { nombresPolitica, nombresTipoPrograma } from '../../../datos/academico/presentacionCampus';
import { usePermiso } from '../../../hooks/usePermiso';
import { agregarTema, guardarDatosPrograma, guardarModulo, guardarReglas, guardarTema, quitarTema, validarPrograma } from '../../../servicios/academico';
import { useAcademicoStore } from '../../../store/useAcademicoStore';
import { useCatalogoStore } from '../../../store/useCatalogoStore';
import { usePersonaSesion } from '../../../store/useSesionStore';
import type { Programa, ReglasPrograma, Tema } from '../../../tipos/academico';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CampoPortadaVideo } from '../../../componentes/campus/CampoPortadaVideo';
import { moverModulo, moverTema } from '../../../servicios/academico';
import { idYoutube, miniaturaYoutube } from '../../../utilidades/youtube';

const claseArea = 'w-full rounded-xl border border-borde bg-superficie p-3 text-sm outline-none focus:border-acento focus:ring-2 focus:ring-acento-suave disabled:bg-fondo';

function FormDatos({ programa, editable }: { programa: Programa; editable: boolean }) {
  const productos = useCatalogoStore((estado) => estado.productos);
  const persona = usePersonaSesion();
  const toast = useToast();
  const [nombre, setNombre] = useState(programa.nombre);
  const [descripcion, setDescripcion] = useState(programa.descripcion);
  const [productoId, setProductoId] = useState(programa.productoId ?? '');
  const [membresia, setMembresia] = useState(programa.incluidoEnMembresia);
  const guardar = () => {
    const resultado = guardarDatosPrograma(programa.id, { nombre, descripcion, productoId: productoId || null, incluidoEnMembresia: membresia }, persona?.id ?? 'DEMO-U01');
    if (resultado.ok) toast.exito('Datos guardados'); else toast.error('No se pudo guardar', resultado.error);
  };
  return (
    <div className="flex flex-col gap-3">
      <Campo etiqueta="Nombre" value={nombre} disabled={!editable} onChange={(evento) => setNombre(evento.target.value)} />
      <div className="flex flex-col gap-1.5"><label htmlFor="descripcion-programa" className="text-[13px] font-semibold">Descripción</label><textarea id="descripcion-programa" rows={3} disabled={!editable} value={descripcion} onChange={(evento) => setDescripcion(evento.target.value)} className={claseArea} /></div>
      <Selector etiqueta="Producto vinculado" value={productoId} disabled={!editable} onChange={(evento) => setProductoId(evento.target.value)}
        opciones={[{ valor: '', texto: 'Sin producto' }, ...productos.filter((producto) => producto.categoria === 'programa_formativo').map((producto) => ({ valor: producto.id, texto: `${producto.codigo} · ${producto.nombre}` }))]} />
      <label className="flex min-h-11 items-center gap-2 text-[13.5px]"><input type="checkbox" disabled={!editable} className="size-4 accent-[#0E7490]" checked={membresia} onChange={(evento) => setMembresia(evento.target.checked)} />Incluido en la membresía ERICK</label>
      {editable && <Boton icono={Save} className="self-start" onClick={guardar}>Guardar datos</Boton>}
    </div>
  );
}

function FormReglas({ programa, editable }: { programa: Programa; editable: boolean }) {
  const persona = usePersonaSesion();
  const toast = useToast();
  const [reglas, setReglas] = useState<ReglasPrograma>(programa.reglas);
  const numero = (clave: keyof ReglasPrograma) => (evento: ChangeEvent<HTMLInputElement>) => setReglas((actual) => ({ ...actual, [clave]: Number(evento.target.value) }));
  const guardar = () => {
    const resultado = guardarReglas(programa.id, reglas, persona?.id ?? 'DEMO-U01');
    if (resultado.ok) toast.exito('Reglas guardadas', 'Se aplican a los próximos intentos.'); else toast.error('Reglas no válidas', resultado.error);
  };
  return (
    <div className="flex flex-col gap-3">
      <p className="rounded-xl bg-acento-suave px-3 py-2.5 text-[12.5px] text-[#155E75]">La nota aprobatoria es fija: mayor a 14 sobre 20 (RA-01). Estas reglas aplican a todas las evaluaciones del programa.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Campo etiqueta="Intentos máximos" type="number" min={1} max={10} disabled={!editable} value={reglas.intentosMaximos} onChange={numero('intentosMaximos')} />
        <Campo etiqueta="Espera entre intentos (min)" type="number" min={0} disabled={!editable} value={reglas.esperaMinutos} onChange={numero('esperaMinutos')} />
        <Campo etiqueta="Minutos por evaluación" type="number" min={5} disabled={!editable} value={reglas.minutosEvaluacion} onChange={numero('minutosEvaluacion')} />
        <Campo etiqueta="Preguntas por evaluación" type="number" min={1} max={8} disabled={!editable} value={reglas.preguntasPorEvaluacion} onChange={numero('preguntasPorEvaluacion')} />
        <Selector etiqueta="Nota registrada" disabled={!editable} value={reglas.politicaNota} onChange={(evento) => setReglas((actual) => ({ ...actual, politicaNota: evento.target.value as ReglasPrograma['politicaNota'] }))} opciones={Object.entries(nombresPolitica).map(([valor, texto]) => ({ valor, texto }))} />
        <Selector etiqueta="Desbloqueo de contenidos" disabled={!editable} value={reglas.modoDesbloqueo} onChange={(evento) => setReglas((actual) => ({ ...actual, modoDesbloqueo: evento.target.value as ReglasPrograma['modoDesbloqueo'] }))} opciones={[{ valor: 'aprobar_para_avanzar', texto: 'Aprobar para avanzar' }, { valor: 'libre', texto: 'Libre (TIM tras los 5 temas)' }]} />
        <Selector etiqueta="Meses de acceso por compra" disabled={!editable} value={String(reglas.mesesAcceso)} onChange={(evento) => setReglas((actual) => ({ ...actual, mesesAcceso: Number(evento.target.value) }))} opciones={[1, 2, 3, 6, 9, 12].map((meses) => ({ valor: String(meses), texto: `${meses} ${meses === 1 ? 'mes' : 'meses'}` }))} />
      </div>
      <label className="flex min-h-11 items-center gap-2 text-[13.5px]"><input type="checkbox" disabled={!editable} className="size-4 accent-[#0E7490]" checked={reglas.mostrarRespuestas} onChange={(evento) => setReglas((actual) => ({ ...actual, mostrarRespuestas: evento.target.checked }))} />Mostrar respuestas correctas y explicación al terminar</label>
      {editable && <Boton icono={Save} className="self-start" onClick={guardar}>Guardar reglas</Boton>}
    </div>
  );
}

function FormTema({ tema, editable }: { tema: Tema; editable: boolean }) {
  const colores: [string, string] = useAcademicoStore((estado) => estado.programas.find((programa) => programa.moduloIds.includes(tema.moduloId))?.colores) ?? ['#14305A', '#0E7490'];
  const persona = usePersonaSesion();
  const toast = useToast();
  const [borrador, setBorrador] = useState<Tema>(tema);
  const guardar = () => {
    const resultado = guardarTema(borrador, persona?.id ?? 'DEMO-U01');
    if (resultado.ok) toast.exito('Contenido guardado', borrador.nombre); else toast.error('No se pudo guardar', resultado.error);
  };
  return (
    <div className="flex flex-col gap-3">
      <Campo etiqueta="Nombre del tema" disabled={!editable} value={borrador.nombre} onChange={(evento) => setBorrador({ ...borrador, nombre: evento.target.value })} />
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
        <Campo etiqueta="Título del video" disabled={!editable} value={borrador.video.titulo} onChange={(evento) => setBorrador({ ...borrador, video: { ...borrador.video, titulo: evento.target.value } })} />
        <Campo etiqueta="Minutos" type="number" disabled={!editable} value={borrador.video.minutos} onChange={(evento) => setBorrador({ ...borrador, video: { ...borrador.video, minutos: Number(evento.target.value) } })} />
      </div>
      <Campo etiqueta="Enlace de YouTube de la clase (opcional)" disabled={!editable} value={borrador.video.urlVideo ?? ''} placeholder="https://" onChange={(evento) => setBorrador({ ...borrador, video: { ...borrador.video, urlVideo: evento.target.value } })} />
      {Boolean(borrador.video.urlVideo?.trim()) && <p className={idYoutube(borrador.video.urlVideo) ? 'text-xs font-semibold text-exito' : 'text-xs font-semibold text-error'}>{idYoutube(borrador.video.urlVideo) ? 'Clase de YouTube reconocida: el campus la reproducirá en lugar del video simulado.' : 'Pega un enlace de YouTube: youtube.com/watch?v=..., youtu.be/... o youtube.com/shorts/...'}</p>}
      <CampoPortadaVideo miniatura={idYoutube(borrador.video.urlVideo) ? miniaturaYoutube(idYoutube(borrador.video.urlVideo) ?? '') : undefined} portada={borrador.video.portada} colores={colores} editable={editable} alCambiar={(portada) => setBorrador({ ...borrador, video: { ...borrador.video, portada } })} />
      <div className="flex flex-col gap-1.5"><label htmlFor={`lectura-${tema.id}`} className="text-[13px] font-semibold">Lectura (usa ## para subtítulos)</label><textarea id={`lectura-${tema.id}`} rows={8} disabled={!editable} value={borrador.lectura.contenido} onChange={(evento) => setBorrador({ ...borrador, lectura: { ...borrador.lectura, contenido: evento.target.value } })} className={claseArea} /></div>
      <div className="flex flex-col gap-1.5"><label htmlFor={`objetivos-${tema.id}`} className="text-[13px] font-semibold">Objetivos (uno por línea)</label><textarea id={`objetivos-${tema.id}`} rows={3} disabled={!editable} value={borrador.objetivos.join('\n')} onChange={(evento) => setBorrador({ ...borrador, objetivos: evento.target.value.split('\n') })} className={claseArea} /></div>
      <label className="flex min-h-11 items-center gap-2 text-[13.5px]"><input type="checkbox" disabled={!editable} className="size-4 accent-[#0E7490]" checked={borrador.lectura.descargable} onChange={(evento) => setBorrador({ ...borrador, lectura: { ...borrador.lectura, descargable: evento.target.checked } })} />Lectura descargable en PDF</label>
      <div className="flex flex-col gap-1.5"><label htmlFor={`caso-${tema.id}`} className="text-[13px] font-semibold">Caso práctico</label><textarea id={`caso-${tema.id}`} rows={3} disabled={!editable} value={borrador.caso.enunciado} onChange={(evento) => setBorrador({ ...borrador, caso: { ...borrador.caso, enunciado: evento.target.value } })} className={claseArea} /></div>
      {editable && <Boton icono={Save} className="self-start" onClick={guardar}>Guardar contenido</Boton>}
    </div>
  );
}

export default function EditorPrograma() {
  const { id } = useParams();
  const datos = useAcademicoStore();
  const persona = usePersonaSesion();
  const editable = usePermiso('academico', 'editar');
  const toast = useToast();
  const [pestana, setPestana] = useState('estructura');
  const [temaId, setTemaId] = useState<string>('');
  const programa = datos.programas.find((item) => item.id === id);
  if (!programa) return <Tarjeta><EstadoVacio icono={BookOpen} titulo="Programa no encontrado" texto="Vuelve al listado de programas." /></Tarjeta>;
  const errores = validarPrograma(programa, datos);
  const modulos = programa.moduloIds.map((moduloId) => datos.modulos.find((modulo) => modulo.id === moduloId)).filter((modulo): modulo is NonNullable<typeof modulo> => Boolean(modulo));
  const temasPrograma = modulos.flatMap((modulo) => modulo.temaIds.map((temaIdItem) => datos.temas.find((tema) => tema.id === temaIdItem)).filter((tema): tema is Tema => Boolean(tema)));
  const temaActivo = temasPrograma.find((tema) => tema.id === temaId) ?? temasPrograma[0];
  const actor = persona?.id ?? 'DEMO-U01';
  const accion = (resultado: { ok: boolean; error?: string }, mensaje: string) => (resultado.ok ? toast.exito(mensaje) : toast.error('No se pudo aplicar', resultado.error));

  return (
    <div className="flex flex-col gap-5">
      <Link to="/erick/programas" className="inline-flex min-h-11 w-fit items-center gap-1.5 text-[13px] font-semibold text-acento md:min-h-0"><ArrowLeft className="size-4" aria-hidden />Programas</Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="cifra text-xs text-texto-3">{programa.codigo}</p>
          <h2 className="text-2xl font-extrabold tracking-tight text-texto">{programa.nombre}</h2>
          <p className="text-[13px] text-texto-2">{nombresTipoPrograma[programa.tipo]} · {programa.horas} h · {programa.modalidad}</p>
        </div>
        <Insignia tono={programa.estado === 'publicado' ? 'exito' : 'neutra'}>{programa.estado}</Insignia>
      </div>
      <div className={errores.length ? 'rounded-tarjeta border border-amber-200 bg-amber-50 p-4 text-[13px] text-[#92400E]' : 'rounded-tarjeta border border-green-200 bg-green-50 p-4 text-[13px] text-[#166534]'}>
        <p className="flex items-center gap-2 font-semibold">{errores.length ? <AlertTriangle className="size-4" aria-hidden /> : <CircleCheck className="size-4" aria-hidden />}{errores.length ? `La estructura no cuadra (${errores.length})` : 'Estructura válida: horas, módulos, temas y bancos de preguntas completos.'}</p>
        {errores.length > 0 && <ul className="mt-2 list-disc pl-5">{errores.slice(0, 8).map((error) => <li key={error}>{error}</li>)}</ul>}
      </div>
      <Pestanas etiqueta="Secciones del programa" activa={pestana} alCambiar={setPestana} pestanas={[
        { id: 'estructura', texto: 'Estructura', icono: Layers },
        ...(programa.tipo === 'curso' ? [{ id: 'contenidos', texto: 'Contenidos', icono: SquarePen }] : []),
        { id: 'reglas', texto: 'Reglas de aprobación', icono: Settings2 },
        { id: 'datos', texto: 'Datos', icono: ListChecks },
      ]} />
      {pestana === 'datos' && <Tarjeta><FormDatos key={programa.id} programa={programa} editable={editable} /></Tarjeta>}
      {pestana === 'reglas' && <Tarjeta><FormReglas key={programa.id} programa={programa} editable={editable} /></Tarjeta>}
      {pestana === 'estructura' && programa.tipo === 'diplomado' && (
        <Tarjeta titulo="Cursos del diplomado" icono={Layers}>
          <ul className="flex flex-col gap-2">{programa.cursoIds.map((cursoId, indice) => {
            const curso = datos.programas.find((item) => item.id === cursoId);
            return <li key={cursoId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-fondo px-3 py-2.5 text-[13px]"><Link to={`/erick/programas/${cursoId}`} className="font-semibold hover:text-acento">Curso {indice + 1}: {curso?.nombre ?? cursoId}</Link><span className="cifra">{curso?.horas ?? 0} h</span></li>;
          })}</ul>
          <p className="mt-3 text-[12.5px] text-texto-2">Nota del diplomado: promedio simple de los dos cursos. El MID ({programa.midId ?? 'sin MID'}) es opcional y no altera el diploma.</p>
        </Tarjeta>
      )}
      {pestana === 'estructura' && programa.tipo === 'mid' && <Tarjeta><p className="text-[13px] text-texto-2">Módulo complementario de 20 h. Se evalúa por sustentación con rúbrica (pantalla Sustentaciones MID).</p></Tarjeta>}
      {pestana === 'estructura' && programa.tipo === 'curso' && (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-3">
          {modulos.map((modulo, indice) => (
            <Tarjeta key={modulo.id} titulo={`Módulo ${indice + 1}`} subtitulo={`${modulo.temaIds.length} temas x 3 h + TIM 5 h = ${modulo.temaIds.length * 3 + 5} h`} icono={Layers}>
              <form className="mb-3 flex gap-2" onSubmit={(evento) => { evento.preventDefault(); const valor = new FormData(evento.currentTarget).get('nombre'); accion(guardarModulo(modulo.id, String(valor ?? ''), actor), 'Módulo actualizado'); }}>
                <input name="nombre" aria-label={`Nombre del módulo ${indice + 1}`} defaultValue={modulo.nombre} disabled={!editable} className="min-h-11 min-w-0 flex-1 rounded-xl border border-borde px-3 text-sm outline-none focus:border-acento" />
                {editable && <Boton tamano="sm" variante="secundario" type="submit" icono={Save}>Guardar</Boton>}
              </form>
              {editable && programa.estado === 'borrador' && (
                <div className="mb-3 flex flex-wrap gap-2">
                  <Boton tamano="sm" variante="fantasma" icono={ChevronUp} disabled={indice === 0} onClick={() => accion(moverModulo(programa.id, modulo.id, 'subir', actor), 'Módulo movido')}>Subir módulo</Boton>
                  <Boton tamano="sm" variante="fantasma" icono={ChevronDown} disabled={indice === modulos.length - 1} onClick={() => accion(moverModulo(programa.id, modulo.id, 'bajar', actor), 'Módulo movido')}>Bajar módulo</Boton>
                </div>
              )}
              <ol className="flex flex-col gap-1.5 text-[13px]">
                {modulo.temaIds.map((temaIdItem, orden) => (
                  <li key={temaIdItem} className="flex items-center gap-2 rounded-lg bg-fondo px-2.5 py-1.5">
                    <span className="cifra w-5 text-texto-3">{orden + 1}</span>
                    <button type="button" className="min-w-0 flex-1 truncate text-left hover:text-acento" onClick={() => { setTemaId(temaIdItem); setPestana('contenidos'); }}>{datos.temas.find((tema) => tema.id === temaIdItem)?.nombre ?? temaIdItem}</button>
                    <span className="cifra text-xs text-texto-3">{datos.preguntas.filter((pregunta) => pregunta.ambitoId === temaIdItem && pregunta.activa).length} preg.</span>
                    {editable && programa.estado === 'borrador' && <button type="button" aria-label="Subir tema" disabled={orden === 0} onClick={() => accion(moverTema(modulo.id, temaIdItem, 'subir', actor), 'Tema movido')} className="grid size-9 place-items-center rounded-lg text-texto-2 hover:bg-superficie disabled:opacity-30"><ChevronUp className="size-4" aria-hidden /></button>}
                    {editable && programa.estado === 'borrador' && <button type="button" aria-label="Bajar tema" disabled={orden === modulo.temaIds.length - 1} onClick={() => accion(moverTema(modulo.id, temaIdItem, 'bajar', actor), 'Tema movido')} className="grid size-9 place-items-center rounded-lg text-texto-2 hover:bg-superficie disabled:opacity-30"><ChevronDown className="size-4" aria-hidden /></button>}
                    {editable && programa.estado === 'borrador' && <button type="button" aria-label="Quitar tema" onClick={() => accion(quitarTema(modulo.id, temaIdItem, actor), 'Tema retirado')} className="grid size-9 place-items-center rounded-lg text-error hover:bg-red-50"><Minus className="size-4" aria-hidden /></button>}
                  </li>
                ))}
                <li className="mt-1 rounded-lg border border-dashed border-borde px-2.5 py-1.5 text-texto-2">TIM: {datos.tims.find((tim) => tim.id === modulo.timId)?.nombre ?? modulo.timId}</li>
              </ol>
              {editable && programa.estado === 'borrador' && <Boton tamano="sm" variante="fantasma" icono={Plus} className="mt-2" onClick={() => accion(agregarTema(modulo.id, actor), 'Tema agregado')}>Agregar tema</Boton>}
              {programa.estado !== 'borrador' && <p className="mt-2 text-xs text-texto-3">La estructura de un programa publicado no se modifica; los contenidos sí.</p>}
            </Tarjeta>
          ))}
        </div>
      )}
      {pestana === 'contenidos' && programa.tipo === 'curso' && temaActivo && (
        <Tarjeta>
          <Selector etiqueta="Tema" value={temaActivo.id} onChange={(evento) => setTemaId(evento.target.value)} opciones={temasPrograma.map((tema, indice) => ({ valor: tema.id, texto: `${indice + 1}. ${tema.nombre}` }))} className="mb-4" />
          <FormTema key={temaActivo.id} tema={temaActivo} editable={editable} />
        </Tarjeta>
      )}
    </div>
  );
}
