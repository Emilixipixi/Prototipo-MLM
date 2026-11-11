import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRightLeft, History, MapPin, Network, ShieldAlert, Users, Workflow } from 'lucide-react';
import { ArbolTrinario } from '../../componentes/redes/ArbolTrinario';
import { ArbolUnilevelSimple } from '../../componentes/redes/ArbolUnilevelSimple';
import { BuscadorRed } from '../../componentes/redes/BuscadorRed';
import { DetallePersonaRed } from '../../componentes/redes/DetallePersonaRed';
import type { ResumenNodo } from '../../componentes/redes/tipos';
import { Boton } from '../../componentes/ui/Boton';
import { Campo } from '../../componentes/ui/Campo';
import { ChipBrazo } from '../../componentes/ui/ChipBrazo';
import { EstadoError } from '../../componentes/ui/EstadoError';
import { Pestanas } from '../../componentes/ui/Pestanas';
import { Selector } from '../../componentes/ui/Selector';
import { Tabla, type ColumnaTabla } from '../../componentes/ui/Tabla';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { useToast } from '../../componentes/ui/useToast';
import { usePermiso } from '../../hooks/usePermiso';
import { useResumenRed } from '../../hooks/useResumenRed';
import { hijosUnilevel } from '../../motores/utilidadesMotor';
import { asignarPosicion, cambiarPatrocinador } from '../../servicios/red';
import { useBitacoraStore } from '../../store/useBitacoraStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { Bitacora } from '../../tipos/bitacora';
import type { Brazo } from '../../tipos/red';
import { formatearFechaHora } from '../../utilidades/fechas';

const brazos: Brazo[] = ['A', 'B', 'C'];
const RAIZ_UNILEVEL = 'DEMO-A00';
const RAIZ_TRINARIA = 'DEMO-POS-000';

export default function Arboles() {
  const { fuente, resumen } = useResumenRed();
  const [parametros] = useSearchParams();
  const puedeEditar = usePermiso('redes', 'editar');
  const [vista, setVista] = useState('trinaria');
  const [resaltado, setResaltado] = useState<string | null>(parametros.get('persona'));
  const [seleccionado, setSeleccionado] = useState<ResumenNodo | null>(null);
  const hijos = useMemo(() => hijosUnilevel(fuente.patrocinios), [fuente.patrocinios]);
  const registros = useBitacoraStore((estado) => estado.registros);
  const historial = useMemo(() => registros.filter((registro) => registro.modulo === 'redes').sort((a, b) => b.fechaHora.localeCompare(a.fechaHora)), [registros]);
  const nodos = useMemo(() => [...resumen.values()].filter((nodo) => fuente.personas.find((persona) => persona.id === nodo.personaId)?.tipo === 'empresario'), [resumen, fuente.personas]);

  const columnasHistorial: ColumnaTabla<Bitacora>[] = [
    { clave: 'fecha', titulo: 'Fecha', valorOrden: (fila) => fila.fechaHora, render: (fila) => <span className="cifra text-[12.5px]">{formatearFechaHora(fila.fechaHora)}</span> },
    { clave: 'accion', titulo: 'Acción', principalEnMovil: true, render: (fila) => <span className="font-semibold">{fila.accion}</span> },
    { clave: 'persona', titulo: 'Persona', render: (fila) => <span className="cifra text-[12.5px]">{fila.referenciaId ?? '-'}</span> },
    { clave: 'actor', titulo: 'Actor', render: (fila) => <span className="cifra text-[12.5px]">{fila.actorId}</span> },
    { clave: 'motivo', titulo: 'Motivo', render: (fila) => <span className="text-xs text-texto-2">{fila.motivo || '-'}</span> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Pestanas etiqueta="Genealogía" activa={vista} alCambiar={setVista} pestanas={[{ id: 'trinaria', texto: 'Trinaria', icono: Network }, { id: 'unilevel', texto: 'Unilevel', icono: Users }]} />
        <div className="lg:ml-auto lg:w-80"><BuscadorRed nodos={nodos} alElegir={(nodo) => { setResaltado(nodo.personaId); setSeleccionado(nodo); }} /></div>
      </div>
      <Tarjeta titulo={vista === 'trinaria' ? 'Red Trinaria completa' : 'Red Unilevel completa'} subtitulo={vista === 'trinaria' ? 'Posiciones por brazo A, B y C. Los espacios punteados están libres.' : 'Relaciones de patrocinio desde la raíz corporativa.'} icono={Workflow} sinRelleno>
        <div className="p-3 sm:p-4">
          {vista === 'trinaria'
            ? <ArbolTrinario raizPosicionId={RAIZ_TRINARIA} posiciones={fuente.posiciones} resumen={resumen} resaltadoId={resaltado} alSeleccionar={setSeleccionado} alto={600} />
            : <ArbolUnilevelSimple raizId={RAIZ_UNILEVEL} hijos={hijos} resumen={resumen} resaltadoId={resaltado} alSeleccionar={setSeleccionado} expandidosIniciales={3} />}
        </div>
      </Tarjeta>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-2">
        {puedeEditar ? <PanelColocacion /> : <Tarjeta titulo="Colocación administrativa" icono={MapPin}><p className="text-[13px] text-texto-2">Requiere permiso: editar en Redes. La consulta del árbol sigue disponible.</p></Tarjeta>}
        {puedeEditar ? <PanelPatrocinio /> : <Tarjeta titulo="Cambio de patrocinador" icono={ArrowRightLeft}><p className="text-[13px] text-texto-2">Requiere permiso: editar en Redes. La consulta del árbol sigue disponible.</p></Tarjeta>}
      </div>
      <section className="flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-[15px] font-bold"><History className="size-4 text-acento" aria-hidden />Historial estructural</h3>
        <Tabla columnas={columnasHistorial} filas={historial} claveFila={(fila) => fila.id} porPagina={8} textoVacio="Sin movimientos estructurales." textoBusqueda={(fila) => `${fila.accion} ${fila.referenciaId ?? ''} ${fila.motivo}`} />
      </section>
      <DetallePersonaRed nodo={seleccionado} resumen={resumen} alCerrar={() => setSeleccionado(null)} directos={seleccionado ? hijos.get(seleccionado.personaId)?.length ?? 0 : 0} />
    </div>
  );
}

function PanelColocacion() {
  const { fuente } = useResumenRed();
  const actor = usePersonaSesion();
  const toast = useToast();
  const activas = fuente.posiciones.filter((posicion) => posicion.estado === 'activa');
  const sinPosicion = fuente.personas.filter((persona) => persona.tipo === 'empresario' && !activas.some((posicion) => posicion.personaId === persona.id));
  const libres = activas.flatMap((posicion) => brazos.filter((brazo) => !activas.some((hija) => hija.padrePosicionId === posicion.id && hija.brazo === brazo)).map((brazo) => ({ padre: posicion, brazo })));
  const [personaId, setPersonaId] = useState('');
  const [modo, setModo] = useState<'disponible' | 'manual'>('disponible');
  const [espacio, setEspacio] = useState('');
  const [padreManual, setPadreManual] = useState('DEMO-POS-000');
  const [brazoManual, setBrazoManual] = useState<Brazo>('A');
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const elegida = personaId || sinPosicion[0]?.id || '';
  const espacioElegido = espacio || (libres[0] ? `${libres[0].padre.id}|${libres[0].brazo}` : '');

  const colocar = () => {
    const [padre, brazo] = modo === 'manual' ? [padreManual.trim(), brazoManual] : espacioElegido.split('|');
    if (!elegida || !padre) {
      setError('Selecciona la persona y el espacio de destino.');
      return;
    }
    const resultado = asignarPosicion(elegida, padre, brazo as Brazo, actor?.id ?? 'DEMO-U01', motivo);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    setError(null);
    setMotivo('');
    setPersonaId('');
    setEspacio('');
    toast.exito('Posición asignada', `${elegida} ocupa ${resultado.valor.id} en el brazo ${brazo}. El patrocinador no cambió.`);
  };

  return (
    <Tarjeta titulo="Colocación administrativa" subtitulo="Asigna una posición Trinaria sin alterar el patrocinio." icono={MapPin}>
      <div className="flex flex-col gap-4">
        {error && <EstadoError queOcurrio={error} comoSeguir="Revisa el destino: cada brazo admite una sola posición y una persona no puede tener dos posiciones activas." />}
        {sinPosicion.length === 0 && <p className="rounded-xl bg-fondo px-3 py-2 text-[12.5px] text-texto-2">Todos los empresarios tienen posición. Registra un nuevo empresario desde Usuarios para probar la colocación, o usa el modo manual para ver la validación de duplicados.</p>}
        <Selector etiqueta="Persona" value={elegida} onChange={(evento) => setPersonaId(evento.target.value)} opciones={(sinPosicion.length ? sinPosicion : fuente.personas.filter((persona) => persona.tipo === 'empresario')).map((persona) => ({ valor: persona.id, texto: `${persona.codigo} · ${persona.nombres} ${persona.apellidos}${sinPosicion.includes(persona) ? ' (sin posición)' : ''}` }))} />
        <Pestanas etiqueta="Modo de colocación" activa={modo} alCambiar={(valor) => setModo(valor as 'disponible' | 'manual')} pestanas={[{ id: 'disponible', texto: 'Espacio disponible' }, { id: 'manual', texto: 'Manual' }]} />
        {modo === 'disponible' ? (
          <Selector etiqueta="Espacio libre" value={espacioElegido} onChange={(evento) => setEspacio(evento.target.value)} opciones={libres.map(({ padre, brazo }) => ({ valor: `${padre.id}|${brazo}`, texto: `${padre.id} (${padre.personaId}) · brazo ${brazo}` }))} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo etiqueta="Posición padre" value={padreManual} onChange={(evento) => setPadreManual(evento.target.value)} ayuda="Ejemplo: DEMO-POS-000" />
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold">Brazo</span>
              <div className="flex gap-2">{brazos.map((brazo) => <button key={brazo} type="button" aria-pressed={brazoManual === brazo} onClick={() => setBrazoManual(brazo)} className={`grid min-h-11 flex-1 place-items-center rounded-xl border ${brazoManual === brazo ? 'border-acento bg-acento-suave' : 'border-borde'}`}><ChipBrazo brazo={brazo} /></button>)}</div>
            </div>
          </div>
        )}
        <Campo etiqueta="Motivo (obligatorio)" value={motivo} onChange={(evento) => setMotivo(evento.target.value)} placeholder="Razón de la colocación" />
        <Boton icono={MapPin} onClick={colocar} className="self-start">Asignar posición</Boton>
      </div>
    </Tarjeta>
  );
}

function PanelPatrocinio() {
  const { fuente } = useResumenRed();
  const actor = usePersonaSesion();
  const toast = useToast();
  const empresarios = fuente.personas.filter((persona) => persona.tipo === 'empresario');
  const [personaId, setPersonaId] = useState(empresarios.find((persona) => persona.id !== RAIZ_UNILEVEL)?.id ?? '');
  const [nuevoId, setNuevoId] = useState(RAIZ_UNILEVEL);
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const actual = fuente.patrocinios.find((relacion) => relacion.personaId === personaId)?.patrocinadorId ?? 'sin patrocinador';

  const cambiar = () => {
    const resultado = cambiarPatrocinador(personaId, nuevoId, actor?.id ?? 'DEMO-U01', motivo);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    setError(null);
    setMotivo('');
    toast.exito('Patrocinador actualizado', `${personaId} ahora tiene como patrocinador a ${nuevoId}. La posición Trinaria no cambió.`);
  };

  return (
    <Tarjeta titulo="Cambio de patrocinador" subtitulo="Excepción administrativa con validación de ciclos." icono={ArrowRightLeft}>
      <div className="flex flex-col gap-4">
        {error && <EstadoError queOcurrio={error} comoSeguir="Elige un patrocinador que no pertenezca a la descendencia de la persona." />}
        <Selector etiqueta="Persona" value={personaId} onChange={(evento) => setPersonaId(evento.target.value)} opciones={empresarios.filter((persona) => persona.id !== RAIZ_UNILEVEL).map((persona) => ({ valor: persona.id, texto: `${persona.codigo} · ${persona.nombres} ${persona.apellidos}` }))} />
        <p className="text-[12.5px] text-texto-2">Patrocinador actual: <strong className="cifra text-texto">{actual}</strong></p>
        <Selector etiqueta="Nuevo patrocinador" value={nuevoId} onChange={(evento) => setNuevoId(evento.target.value)} opciones={empresarios.map((persona) => ({ valor: persona.id, texto: `${persona.codigo} · ${persona.nombres} ${persona.apellidos}` }))} />
        <Campo etiqueta="Motivo (obligatorio)" value={motivo} onChange={(evento) => setMotivo(evento.target.value)} placeholder="Razón documentada del cambio" />
        <p className="flex items-start gap-2 rounded-xl bg-oro-suave px-3 py-2 text-[12.5px] text-[#7C4A03]"><ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />El cambio se registra con antes y después en la bitácora. No se recalculan cierres anteriores.</p>
        <Boton icono={ArrowRightLeft} onClick={cambiar} className="self-start">Cambiar patrocinador</Boton>
      </div>
    </Tarjeta>
  );
}
