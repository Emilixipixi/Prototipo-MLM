import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, RefreshCw, UserPlus } from 'lucide-react';
import { DialogoEstadoCuenta } from '../../componentes/demo/DialogoEstadoCuenta';
import { DialogoNuevoUsuario } from '../../componentes/demo/DialogoNuevoUsuario';
import { Avatar } from '../../componentes/ui/Avatar';
import { Boton } from '../../componentes/ui/Boton';
import { ConPermiso } from '../../componentes/ui/ConPermiso';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tabla, type ColumnaTabla } from '../../componentes/ui/Tabla';
import { estadosCuenta, nombresTipo } from '../../datos/presentacionCuentas';
import { nombresPerfiles } from '../../datos/perfiles';
import { usePersonasStore } from '../../store/usePersonasStore';
import { useRedStore } from '../../store/useRedStore';
import type { Persona, TipoPersona } from '../../tipos/persona';
import { unirClases } from '../../utilidades/clases';
import { formatearFecha } from '../../utilidades/fechas';

type Filtro = TipoPersona | 'todos';

export default function Usuarios() {
  const personas = usePersonasStore((estado) => estado.personas);
  const patrocinios = useRedStore((estado) => estado.patrocinios);
  const navegar = useNavigate();
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [nuevo, setNuevo] = useState(false);
  const [cambiando, setCambiando] = useState<Persona | null>(null);
  const filas = useMemo(() => personas.filter((persona) => filtro === 'todos' || persona.tipo === filtro), [personas, filtro]);
  const vinculo = (persona: Persona) => patrocinios.find((relacion) => relacion.personaId === persona.id)?.patrocinadorId ?? persona.referenteId;

  const columnas: ColumnaTabla<Persona>[] = [
    { clave: 'persona', titulo: 'Usuario', principalEnMovil: true, valorOrden: (fila) => fila.nombres, render: (fila) => <span className="flex items-center gap-2.5"><Avatar nombres={fila.nombres} apellidos={fila.apellidos} tamano="sm" /><span className="min-w-0"><span className="block font-semibold">{fila.nombres} {fila.apellidos}</span><span className="cifra block text-xs text-texto-2">{fila.codigo}</span></span></span> },
    { clave: 'tipo', titulo: 'Tipo', valorOrden: (fila) => fila.tipo, render: (fila) => nombresTipo[fila.tipo] },
    { clave: 'perfil', titulo: 'Perfil', valorOrden: (fila) => fila.perfil, render: (fila) => <span className="text-[12.5px] text-texto-2">{nombresPerfiles[fila.perfil]}</span> },
    { clave: 'estado', titulo: 'Estado', valorOrden: (fila) => fila.estado, render: (fila) => <Insignia tono={estadosCuenta[fila.estado].tono} icono={estadosCuenta[fila.estado].icono}>{estadosCuenta[fila.estado].etiqueta}</Insignia> },
    { clave: 'vinculo', titulo: 'Patrocinador / referente', render: (fila) => <span className="cifra text-[12.5px]">{vinculo(fila) ?? '-'}</span> },
    { clave: 'alta', titulo: 'Alta', valorOrden: (fila) => fila.fechaAlta, render: (fila) => <span className="cifra text-[12.5px]">{formatearFecha(fila.fechaAlta)}</span> },
  ];

  const chips: Array<{ valor: Filtro; texto: string }> = [{ valor: 'todos', texto: 'Todos' }, { valor: 'empresario', texto: 'Empresarios' }, { valor: 'cliente', texto: 'Clientes' }, { valor: 'alumno', texto: 'Alumnos' }, { valor: 'corporativo', texto: 'Corporativos' }];

  return (
    <div className="flex flex-col gap-4">
      <Tabla
        columnas={columnas}
        filas={filas}
        claveFila={(fila) => fila.id}
        porPagina={12}
        textoBusqueda={(fila) => `${fila.nombres} ${fila.apellidos} ${fila.codigo} ${fila.correo} ${fila.estado} ${fila.perfil}`}
        placeholderBusqueda="Buscar por nombre, código, correo o estado"
        alSeleccionarFila={(fila) => navegar(`/corporativo/usuarios/${fila.id}`)}
        filtros={chips.map((chip) => (
          <button key={chip.valor} type="button" aria-pressed={filtro === chip.valor} onClick={() => setFiltro(chip.valor)} className={unirClases('inline-flex min-h-11 items-center rounded-full border px-3.5 text-[12.5px] font-semibold md:min-h-9', filtro === chip.valor ? 'border-primario bg-primario text-white' : 'border-borde text-texto-2 hover:border-texto-3')}>{chip.texto}</button>
        ))}
        accionesCabecera={<ConPermiso modulo="usuarios" accion="crear"><Boton icono={UserPlus} tamano="sm" onClick={() => setNuevo(true)}>Nuevo usuario</Boton></ConPermiso>}
        accionesFila={(fila) => (
          <div className="flex justify-end gap-2">
            <Boton tamano="sm" variante="fantasma" icono={Eye} onClick={() => navegar(`/corporativo/usuarios/${fila.id}`)}>Ficha</Boton>
            <ConPermiso modulo="usuarios" accion="editar"><Boton tamano="sm" variante="secundario" icono={RefreshCw} onClick={() => setCambiando(fila)}>Estado</Boton></ConPermiso>
          </div>
        )}
      />
      <DialogoNuevoUsuario abierto={nuevo} alCerrar={() => setNuevo(false)} />
      <DialogoEstadoCuenta persona={cambiando} alCerrar={() => setCambiando(null)} />
    </div>
  );
}
