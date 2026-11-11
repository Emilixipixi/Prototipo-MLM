import { useMemo, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { crearUsuarioCorporativo } from '../../servicios/cuentas';
import { registrarPersona } from '../../servicios/red';
import { usePersonasStore } from '../../store/usePersonasStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { TipoPersona } from '../../tipos/persona';
import { Boton } from '../ui/Boton';
import { Campo } from '../ui/Campo';
import { EstadoError } from '../ui/EstadoError';
import { Modal } from '../ui/Modal';
import { Selector } from '../ui/Selector';
import { useToast } from '../ui/useToast';

export function DialogoNuevoUsuario({ abierto, alCerrar }: { abierto: boolean; alCerrar: () => void }) {
  if (!abierto) return null;
  return <Contenido alCerrar={alCerrar} />;
}

function Contenido({ alCerrar }: { alCerrar: () => void }) {
  const actor = usePersonaSesion();
  const personas = usePersonasStore((estado) => estado.personas);
  const toast = useToast();
  const empresarios = useMemo(() => personas.filter((persona) => persona.tipo === 'empresario' && persona.estado === 'activo'), [personas]);
  const [tipo, setTipo] = useState<TipoPersona>('corporativo');
  const [perfil, setPerfil] = useState<'operador' | 'superadministrador'>('operador');
  const [patrocinador, setPatrocinador] = useState('');
  const [datos, setDatos] = useState({ nombres: '', apellidos: '', correo: '', telefono: '', documento: '' });
  const [error, setError] = useState<string | null>(null);
  const cambiar = (campo: keyof typeof datos, valor: string) => setDatos((actual) => ({ ...actual, [campo]: valor }));

  const guardar = () => {
    setError(null);
    const resultado = tipo === 'corporativo'
      ? crearUsuarioCorporativo({ ...datos, perfil }, actor?.id ?? 'DEMO-U01')
      : (datos.nombres.trim() && /^\S+@\S+\.\S+$/.test(datos.correo.trim()))
        ? registrarPersona({ ...datos, tipo, patrocinadorId: patrocinador || null })
        : { ok: false as const, error: 'Ingresa al menos nombres y un correo válido.' };
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    toast.exito('Usuario creado', `${resultado.valor.codigo} · ${resultado.valor.nombres} ${resultado.valor.apellidos}`);
    alCerrar();
  };

  return (
    <Modal abierto alCerrar={alCerrar} titulo="Nuevo usuario" descripcion="Alta administrativa con datos ficticios." pie={<><Boton variante="secundario" onClick={alCerrar}>Cancelar</Boton><Boton icono={UserPlus} onClick={guardar}>Crear usuario</Boton></>}>
      <div className="flex flex-col gap-4">
        {error && <EstadoError queOcurrio={error} />}
        <div className="grid gap-4 sm:grid-cols-2">
          <Selector etiqueta="Tipo" value={tipo} onChange={(evento) => setTipo(evento.target.value as TipoPersona)} opciones={[{ valor: 'corporativo', texto: 'Usuario corporativo' }, { valor: 'empresario', texto: 'Empresario independiente' }, { valor: 'cliente', texto: 'Cliente' }, { valor: 'alumno', texto: 'Alumno' }]} />
          {tipo === 'corporativo' ? (
            <Selector etiqueta="Perfil" value={perfil} onChange={(evento) => setPerfil(evento.target.value as 'operador' | 'superadministrador')} opciones={[{ valor: 'operador', texto: 'Operador corporativo' }, { valor: 'superadministrador', texto: 'Superadministrador' }]} ayuda="Un operador no recibe permisos de superadministrador." />
          ) : (
            <Selector etiqueta={tipo === 'empresario' ? 'Patrocinador' : 'Referente'} value={patrocinador} onChange={(evento) => setPatrocinador(evento.target.value)} opciones={[{ valor: '', texto: 'Sin asignar' }, ...empresarios.map((persona) => ({ valor: persona.id, texto: `${persona.codigo} · ${persona.nombres} ${persona.apellidos}` }))]} />
          )}
          <Campo etiqueta="Nombres" value={datos.nombres} onChange={(evento) => cambiar('nombres', evento.target.value)} />
          <Campo etiqueta="Apellidos" value={datos.apellidos} onChange={(evento) => cambiar('apellidos', evento.target.value)} />
          <Campo etiqueta="Correo" type="email" value={datos.correo} onChange={(evento) => cambiar('correo', evento.target.value)} />
          <Campo etiqueta="Teléfono" value={datos.telefono} onChange={(evento) => cambiar('telefono', evento.target.value)} />
          <Campo etiqueta="Documento" value={datos.documento} onChange={(evento) => cambiar('documento', evento.target.value)} className="sm:col-span-2" />
        </div>
        {tipo === 'empresario' && <p className="text-xs text-texto-2">El empresario queda pendiente hasta que se le asigne una posición Trinaria en Árboles.</p>}
      </div>
    </Modal>
  );
}
