import { useState } from 'react';
import { Archive, CircleCheck, Eye, FilePen, Plus, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Boton } from '../../../componentes/ui/Boton';
import { Campo } from '../../../componentes/ui/Campo';
import { ChipsFiltro } from '../../../componentes/ui/ChipsFiltro';
import { ConPermiso } from '../../../componentes/ui/ConPermiso';
import { Insignia } from '../../../componentes/ui/Insignia';
import { Modal } from '../../../componentes/ui/Modal';
import { Selector } from '../../../componentes/ui/Selector';
import { Tabla, type ColumnaTabla } from '../../../componentes/ui/Tabla';
import { useToast } from '../../../componentes/ui/useToast';
import { nombresTipoPrograma } from '../../../datos/academico/presentacionCampus';
import { usePermiso } from '../../../hooks/usePermiso';
import { cambiarEstadoPrograma, crearPrograma, validarPrograma } from '../../../servicios/academico';
import { useAcademicoStore } from '../../../store/useAcademicoStore';
import { useCampusStore } from '../../../store/useCampusStore';
import { useCatalogoStore } from '../../../store/useCatalogoStore';
import { usePersonaSesion } from '../../../store/useSesionStore';
import type { EstadoPrograma, Programa } from '../../../tipos/academico';

const tonosEstado: Record<EstadoPrograma, 'exito' | 'neutra' | 'retenida'> = { publicado: 'exito', borrador: 'neutra', archivado: 'retenida' };

function NuevoPrograma({ abierto, alCerrar }: { abierto: boolean; alCerrar: () => void }) {
  const programas = useAcademicoStore((estado) => estado.programas);
  const productos = useCatalogoStore((estado) => estado.productos);
  const persona = usePersonaSesion();
  const toast = useToast();
  const [tipo, setTipo] = useState<'curso' | 'diplomado'>('curso');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [plantilla, setPlantilla] = useState('DEMO-CUR-03');
  const [productoId, setProductoId] = useState('');
  const [cursos, setCursos] = useState<[string, string]>(['', '']);
  const [membresia, setMembresia] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cursosPublicados = programas.filter((programa) => programa.tipo === 'curso' && programa.estado === 'publicado');
  const guardar = () => {
    const resultado = crearPrograma({ tipo, nombre, descripcion, productoId: productoId || null, incluidoEnMembresia: membresia, plantillaId: tipo === 'curso' ? plantilla || null : null, cursoIds: tipo === 'diplomado' ? cursos.filter(Boolean) : [] }, persona?.id ?? 'DEMO-U01');
    if (!resultado.ok) { setError(resultado.error); return; }
    toast.exito('Programa creado en borrador', `${resultado.valor.id}. Revisa su estructura y publícalo cuando esté completo.`);
    alCerrar();
  };
  return (
    <Modal abierto={abierto} alCerrar={alCerrar} titulo="Nuevo programa" descripcion="Se crea en borrador. Un curso tiene 3 módulos de 20 h (5 temas de 3 h y 1 TIM de 5 h)." ancho="lg"
      pie={<><Boton variante="secundario" onClick={alCerrar}>Cancelar</Boton><Boton icono={Plus} onClick={guardar}>Crear programa</Boton></>}>
      <div className="flex flex-col gap-3">
        <Selector etiqueta="Tipo" value={tipo} onChange={(evento) => setTipo(evento.target.value as 'curso' | 'diplomado')} opciones={[{ valor: 'curso', texto: 'Curso de 60 h' }, { valor: 'diplomado', texto: 'Diplomado de 120 h (2 cursos)' }]} />
        <Campo etiqueta="Nombre" value={nombre} onChange={(evento) => setNombre(evento.target.value)} />
        <Campo etiqueta="Descripción" value={descripcion} onChange={(evento) => setDescripcion(evento.target.value)} />
        {tipo === 'curso' ? (
          <Selector etiqueta="Estructura inicial" value={plantilla} onChange={(evento) => setPlantilla(evento.target.value)}
            opciones={[{ valor: '', texto: 'Estructura vacía (contenidos por cargar)' }, ...programas.filter((programa) => programa.tipo === 'curso').map((programa) => ({ valor: programa.id, texto: `Copiar de ${programa.nombre}` }))]} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {[0, 1].map((indice) => (
              <Selector key={indice} etiqueta={`Curso ${indice + 1}`} value={cursos[indice]} onChange={(evento) => setCursos((actual) => (indice === 0 ? [evento.target.value, actual[1]] : [actual[0], evento.target.value]))}
                opciones={[{ valor: '', texto: 'Selecciona un curso publicado' }, ...cursosPublicados.map((programa) => ({ valor: programa.id, texto: programa.nombre }))]} />
            ))}
          </div>
        )}
        <Selector etiqueta="Producto del catálogo vinculado (para la venta)" value={productoId} onChange={(evento) => setProductoId(evento.target.value)}
          opciones={[{ valor: '', texto: 'Sin producto (solo matrícula manual o membresía)' }, ...productos.filter((producto) => producto.categoria === 'programa_formativo').map((producto) => ({ valor: producto.id, texto: `${producto.codigo} · ${producto.nombre}` }))]} />
        <label className="flex min-h-11 items-center gap-2 text-[13.5px]"><input type="checkbox" className="size-4 accent-[#0E7490]" checked={membresia} onChange={(evento) => setMembresia(evento.target.checked)} />Incluido en la membresía ERICK</label>
        {error && <p className="text-[13px] font-medium text-error">{error}</p>}
      </div>
    </Modal>
  );
}

export default function ProgramasAcademicos() {
  const programas = useAcademicoStore((estado) => estado.programas);
  useAcademicoStore((estado) => estado.preguntas);
  const matriculas = useCampusStore((estado) => estado.matriculas);
  const persona = usePersonaSesion();
  const puedeEditar = usePermiso('academico', 'editar');
  const toast = useToast();
  const [nuevo, setNuevo] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | Programa['tipo']>('todos');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | EstadoPrograma>('todos');
  const visibles = programas.filter((programa) => (filtroTipo === 'todos' || programa.tipo === filtroTipo) && (filtroEstado === 'todos' || programa.estado === filtroEstado));
  const cambiar = (programa: Programa, hacia: EstadoPrograma) => {
    const resultado = cambiarEstadoPrograma(programa.id, hacia, persona?.id ?? 'DEMO-U01');
    if (resultado.ok) toast.exito('Estado actualizado', `${programa.nombre}: ${hacia}.`);
    else toast.error('No se pudo cambiar', resultado.error);
  };
  const columnas: ColumnaTabla<Programa>[] = [
    { clave: 'codigo', titulo: 'Código', render: (fila) => <span className="cifra text-xs">{fila.codigo}</span>, valorOrden: (fila) => fila.codigo },
    { clave: 'nombre', titulo: 'Programa', principalEnMovil: true, render: (fila) => <Link to={`/erick/programas/${fila.id}`} className="font-semibold text-texto hover:text-acento">{fila.nombre}</Link>, valorOrden: (fila) => fila.nombre },
    { clave: 'tipo', titulo: 'Tipo', render: (fila) => `${nombresTipoPrograma[fila.tipo]} · ${fila.horas} h` },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <Insignia tono={tonosEstado[fila.estado]}>{fila.estado}</Insignia> },
    { clave: 'matriculas', titulo: 'Matrículas', alinear: 'derecha', render: (fila) => <span className="cifra">{matriculas.filter((matricula) => matricula.programaId === fila.id).length}</span> },
    {
      clave: 'validacion', titulo: 'Estructura', render: (fila) => {
        const errores = validarPrograma(fila);
        return errores.length ? <Insignia tono="advertencia">{errores.length} observaciones</Insignia> : <Insignia tono="exito" icono={CircleCheck}>Completa</Insignia>;
      },
    },
  ];
  return (
    <div className="flex flex-col gap-5">
      <Tabla
        columnas={columnas} filas={visibles} claveFila={(fila) => fila.id} textoBusqueda={(fila) => `${fila.codigo} ${fila.nombre}`} placeholderBusqueda="Buscar programa"
        filtros={<>
          <ChipsFiltro etiqueta="Tipo" activo={filtroTipo} alCambiar={setFiltroTipo} opciones={[{ valor: 'todos', texto: 'Todos' }, { valor: 'curso', texto: 'Cursos' }, { valor: 'diplomado', texto: 'Diplomados' }, { valor: 'mid', texto: 'MID' }]} />
          <ChipsFiltro etiqueta="Estado" activo={filtroEstado} alCambiar={setFiltroEstado} opciones={[{ valor: 'todos', texto: 'Todos' }, { valor: 'publicado', texto: 'Publicados' }, { valor: 'borrador', texto: 'Borrador' }, { valor: 'archivado', texto: 'Archivados' }]} />
        </>}
        accionesCabecera={<ConPermiso modulo="academico" accion="crear"><Boton tamano="sm" icono={Plus} onClick={() => setNuevo(true)}>Nuevo programa</Boton></ConPermiso>}
        accionesFila={(fila) => (
          <div className="flex flex-wrap justify-end gap-1.5">
            <Link to={`/erick/programas/${fila.id}`} className="inline-flex min-h-11 items-center gap-1 px-2 text-[13px] font-semibold text-acento md:min-h-9">{puedeEditar ? <FilePen className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}{puedeEditar ? 'Editar' : 'Ver'}</Link>
            {puedeEditar && fila.estado === 'borrador' && <Boton tamano="sm" variante="secundario" icono={Upload} onClick={() => cambiar(fila, 'publicado')}>Publicar</Boton>}
            {puedeEditar && fila.estado === 'publicado' && <Boton tamano="sm" variante="fantasma" icono={Archive} onClick={() => cambiar(fila, 'archivado')}>Archivar</Boton>}
          </div>
        )}
      />
      {nuevo && <NuevoPrograma abierto={nuevo} alCerrar={() => setNuevo(false)} />}
    </div>
  );
}
