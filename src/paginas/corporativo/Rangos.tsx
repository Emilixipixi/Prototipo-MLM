import { useMemo, useState } from 'react';
import { Award, Eye, GitBranch, History, Pencil, Save, Undo2 } from 'lucide-react';
import { InsigniaRun } from '../../componentes/rangos/InsigniaRun';
import { Boton } from '../../componentes/ui/Boton';
import { BotonIcono } from '../../componentes/ui/BotonIcono';
import { Campo } from '../../componentes/ui/Campo';
import { EstadoError } from '../../componentes/ui/EstadoError';
import { Insignia } from '../../componentes/ui/Insignia';
import { Modal } from '../../componentes/ui/Modal';
import { Tabla, type ColumnaTabla } from '../../componentes/ui/Tabla';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { useToast } from '../../componentes/ui/useToast';
import { usePermiso } from '../../hooks/usePermiso';
import { crearVersionReglas, previsualizarRangos } from '../../servicios/reglas';
import { usePeriodosStore } from '../../store/usePeriodosStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { DefinicionRango, VersionReglas } from '../../tipos/reglas';
import { formatearFecha, formatearFechaHora } from '../../utilidades/fechas';
import { formatearNumero } from '../../utilidades/formatos';

type Previa = ReturnType<typeof previsualizarRangos>;

export default function Rangos() {
  const versiones = usePeriodosStore((estado) => estado.versiones);
  const periodos = usePeriodosStore((estado) => estado.periodos);
  const personas = usePersonasStore((estado) => estado.personas);
  const actor = usePersonaSesion();
  const toast = useToast();
  const puedeEditar = usePermiso('rangos', 'editar');
  const abierto = periodos.find((periodo) => periodo.tipo === 'ciclo' && periodo.estado === 'abierto') ?? periodos.find((periodo) => periodo.tipo === 'ciclo' && periodo.estado === 'en_cierre');
  const siguiente = periodos.filter((periodo) => periodo.tipo === 'ciclo' && periodo.estado === 'programado').sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))[0];
  const ultima = useMemo(() => [...versiones].sort((a, b) => b.numero - a.numero)[0], [versiones]);
  const [baseId, setBaseId] = useState<string | null>(null);
  const base = versiones.find((version) => version.id === baseId) ?? ultima;
  const [borrador, setBorrador] = useState<DefinicionRango[] | null>(null);
  const [editando, setEditando] = useState<DefinicionRango | null>(null);
  const [previa, setPrevia] = useState<Previa | null>(null);
  const [vigencia, setVigencia] = useState(siguiente?.fechaInicio ?? '');
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const rangos = borrador ?? base.rangos;
  const modificado = borrador !== null;
  const nombre = (id: string) => personas.find((persona) => persona.id === id);

  const reglasBorrador = (): VersionReglas => ({ ...base, rangos });
  const previsualizar = () => {
    if (!abierto) return;
    setPrevia(previsualizarRangos(abierto.id, reglasBorrador()));
  };
  const publicar = () => {
    const resultado = crearVersionReglas(base.id, { rangos }, vigencia, motivo, actor?.id ?? 'DEMO-U01');
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    setError(null);
    setBorrador(null);
    setPrevia(null);
    setMotivo('');
    setBaseId(resultado.valor.id);
    toast.exito('Versión de reglas creada', `${resultado.valor.id} vigente desde ${formatearFecha(vigencia)}. Los cierres anteriores conservan su versión.`);
  };

  const columnasVersiones: ColumnaTabla<VersionReglas>[] = [
    { clave: 'id', titulo: 'Versión', principalEnMovil: true, render: (fila) => <span className="cifra font-semibold">{fila.id}</span> },
    { clave: 'vigencia', titulo: 'Vigencia', render: (fila) => <span className="text-[12.5px]">{formatearFecha(fila.vigenteDesde)} - {fila.vigenteHasta ? formatearFecha(fila.vigenteHasta) : 'sin fin'}</span> },
    { clave: 'periodos', titulo: 'Períodos', render: (fila) => <span className="cifra text-[12.5px]">{periodos.filter((periodo) => periodo.versionReglasId === fila.id).map((periodo) => periodo.id).join(', ') || '-'}</span> },
    { clave: 'actor', titulo: 'Actor y fecha', render: (fila) => <span className="cifra text-[12.5px]">{fila.actorId} · {formatearFechaHora(fila.fecha)}</span> },
    { clave: 'motivo', titulo: 'Motivo', render: (fila) => <span className="text-xs text-texto-2">{fila.motivo}</span> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13px] text-texto-2">Versión base:</span>
        {[...versiones].sort((a, b) => a.numero - b.numero).map((version) => (
          <button key={version.id} type="button" aria-pressed={version.id === base.id} onClick={() => { setBaseId(version.id); setBorrador(null); setPrevia(null); }} className={`cifra min-h-11 rounded-xl border px-3 text-[13px] font-semibold md:min-h-9 ${version.id === base.id ? 'border-primario bg-primario text-white' : 'border-borde bg-superficie hover:border-texto-3'}`}>{version.id}</button>
        ))}
        {modificado && <Insignia tono="advertencia" icono={Pencil}>Borrador sin publicar</Insignia>}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rangos.map((rango) => (
          <Tarjeta key={rango.codigo} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <InsigniaRun run={rango.codigo} tipo="cobro" />
              <span className="text-[13px] font-semibold">{rango.nombreVisible}</span>
              {puedeEditar && <BotonIcono icono={Pencil} etiqueta={`Editar requisitos de ${rango.codigo}`} onClick={() => setEditando(rango)} className="ml-auto" />}
            </div>
            <ul className="flex flex-col gap-1.5 text-[12.5px]">
              {rango.requisitos.map((requisito) => (
                <li key={requisito.id} className="flex items-start justify-between gap-3">
                  <span className="text-texto-2">{requisito.descripcion}{requisito.evaluacion === 'mensual' && <span className="text-texto-3"> (mensual)</span>}</span>
                  <span className="cifra shrink-0 font-semibold">{requisito.tipo === 'formacion_aprobada' ? 'Sí' : requisito.tipo === 'equilibrio_brazos' ? `${requisito.valor} %` : formatearNumero(requisito.valor)}</span>
                </li>
              ))}
            </ul>
          </Tarjeta>
        ))}
      </div>

      {puedeEditar && (
        <Tarjeta titulo="Publicar nueva versión" subtitulo="Una regla nueva aplica desde su vigencia; no reescribe cierres anteriores." icono={GitBranch} variante="simulacion">
          <div className="flex flex-col gap-4">
            {error && <EstadoError queOcurrio={error} />}
            <div className="grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)]">
              <Campo etiqueta="Vigente desde" type="date" value={vigencia} onChange={(evento) => setVigencia(evento.target.value)} />
              <Campo etiqueta="Motivo (obligatorio)" value={motivo} onChange={(evento) => setMotivo(evento.target.value)} placeholder="Razón del cambio de requisitos" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Boton variante="secundario" icono={Eye} onClick={previsualizar} disabled={!modificado || !abierto}>Previsualizar impacto en {abierto?.id ?? 'ciclo abierto'}</Boton>
              <Boton variante="fantasma" icono={Undo2} onClick={() => { setBorrador(null); setPrevia(null); }} disabled={!modificado}>Descartar borrador</Boton>
              <Boton icono={Save} onClick={publicar} disabled={!modificado}>Publicar versión</Boton>
            </div>
            {previa && (
              <div className="rounded-xl border border-borde bg-superficie p-3">
                <p className="text-[13px] font-semibold">{previa.length === 0 ? 'Ninguna calificación cambia con este borrador.' : `${previa.length} calificaciones cambiarían en ${abierto?.id}:`}</p>
                <ul className="mt-2 flex flex-col gap-2">
                  {previa.map((fila) => {
                    const persona = nombre(fila.personaId);
                    return (
                      <li key={fila.personaId} className="flex flex-wrap items-center gap-2 text-[12.5px]">
                        <span className="min-w-40 font-semibold">{persona ? `${persona.nombres} ${persona.apellidos}` : fila.personaId}</span>
                        <InsigniaRun run={fila.actual} tipo="cobro" /><span className="text-texto-3">a</span><InsigniaRun run={fila.nuevo} tipo="cobro" />
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </Tarjeta>
      )}

      <section className="flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-[15px] font-bold"><History className="size-4 text-acento" aria-hidden />Historial de versiones</h3>
        <Tabla columnas={columnasVersiones} filas={[...versiones].sort((a, b) => b.numero - a.numero)} claveFila={(fila) => fila.id} />
      </section>
      {editando && <EditorRango rango={editando} alCerrar={() => setEditando(null)} alGuardar={(nuevo) => { setBorrador(rangos.map((rango) => (rango.codigo === nuevo.codigo ? nuevo : rango))); setPrevia(null); setEditando(null); }} />}
    </div>
  );
}

function EditorRango({ rango, alCerrar, alGuardar }: { rango: DefinicionRango; alCerrar: () => void; alGuardar: (rango: DefinicionRango) => void }) {
  const [valores, setValores] = useState(() => Object.fromEntries(rango.requisitos.map((requisito) => [requisito.id, String(requisito.valor)])));
  const [error, setError] = useState<string | null>(null);
  const guardar = () => {
    const invalido = rango.requisitos.find((requisito) => !Number.isFinite(Number(valores[requisito.id])) || Number(valores[requisito.id]) < 0);
    if (invalido) {
      setError(`El valor de "${invalido.descripcion}" debe ser un número mayor o igual a cero.`);
      return;
    }
    alGuardar({ ...rango, requisitos: rango.requisitos.map((requisito) => ({ ...requisito, valor: Number(valores[requisito.id]) })) });
  };
  return (
    <Modal abierto alCerrar={alCerrar} titulo={`Requisitos de ${rango.codigo}`} descripcion="Los cambios quedan en un borrador hasta publicar una versión." ancho="md" pie={<><Boton variante="secundario" onClick={alCerrar}>Cancelar</Boton><Boton icono={Award} onClick={guardar}>Aplicar al borrador</Boton></>}>
      <div className="flex flex-col gap-4">
        {error && <EstadoError queOcurrio={error} />}
        {rango.requisitos.filter((requisito) => requisito.tipo !== 'formacion_aprobada').map((requisito) => (
          <Campo key={requisito.id} etiqueta={requisito.descripcion} type="number" min={0} value={valores[requisito.id]} onChange={(evento) => setValores((previo) => ({ ...previo, [requisito.id]: evento.target.value }))} ayuda={requisito.tipo === 'equilibrio_brazos' ? 'Porcentaje' : undefined} />
        ))}
      </div>
    </Modal>
  );
}
