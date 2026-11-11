import { useMemo, useState } from 'react';
import { Eye, ScrollText } from 'lucide-react';
import { BarraExportar } from '../../componentes/ui/BarraExportar';
import { Boton } from '../../componentes/ui/Boton';
import { Campo } from '../../componentes/ui/Campo';
import { Insignia } from '../../componentes/ui/Insignia';
import { Modal } from '../../componentes/ui/Modal';
import { Selector } from '../../componentes/ui/Selector';
import { Tabla, type ColumnaTabla } from '../../componentes/ui/Tabla';
import { nombresModulos } from '../../datos/permisosIniciales';
import { useBitacoraStore } from '../../store/useBitacoraStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import type { Bitacora } from '../../tipos/bitacora';
import type { ModuloPermiso } from '../../tipos/permisos';
import { formatearFechaHora } from '../../utilidades/fechas';

const texto = (valor: unknown) => (valor === null || valor === undefined ? '-' : typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2));

export default function Auditoria() {
  const registros = useBitacoraStore((estado) => estado.registros);
  const personas = usePersonasStore((estado) => estado.personas);
  const [actor, setActor] = useState('todos');
  const [modulo, setModulo] = useState('todos');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [detalle, setDetalle] = useState<Bitacora | null>(null);
  const nombreActor = (id: string) => {
    const persona = personas.find((item) => item.id === id);
    return persona ? `${persona.nombres} ${persona.apellidos}` : id;
  };
  const actores = [...new Set(registros.map((registro) => registro.actorId))].sort();
  const modulos = [...new Set(registros.map((registro) => registro.modulo))].sort();
  const filas = useMemo(() => registros
    .filter((registro) => (actor === 'todos' || registro.actorId === actor) && (modulo === 'todos' || registro.modulo === modulo)
      && (!desde || registro.fechaHora.slice(0, 10) >= desde) && (!hasta || registro.fechaHora.slice(0, 10) <= hasta))
    .sort((a, b) => b.fechaHora.localeCompare(a.fechaHora)), [registros, actor, modulo, desde, hasta]);

  const columnas: ColumnaTabla<Bitacora>[] = [
    { clave: 'fecha', titulo: 'Fecha y hora', valorOrden: (fila) => fila.fechaHora, render: (fila) => <span className="cifra text-[12.5px]">{formatearFechaHora(fila.fechaHora)}</span> },
    { clave: 'accion', titulo: 'Acción', principalEnMovil: true, valorOrden: (fila) => fila.accion, render: (fila) => <span className="font-semibold">{fila.accion}</span> },
    { clave: 'modulo', titulo: 'Módulo', render: (fila) => <Insignia tono="neutra">{nombresModulos[fila.modulo as ModuloPermiso] ?? fila.modulo}</Insignia> },
    { clave: 'actor', titulo: 'Actor', render: (fila) => <span className="text-[12.5px]">{nombreActor(fila.actorId)} <span className="cifra text-texto-3">{fila.actorId}</span></span> },
    { clave: 'referencia', titulo: 'Referencia', render: (fila) => <span className="cifra text-[12.5px]">{fila.referenciaId ?? '-'}</span> },
    { clave: 'motivo', titulo: 'Motivo', ocultarEnMovil: true, render: (fila) => <span className="text-xs text-texto-2">{fila.motivo || '-'}</span> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Selector etiqueta="Actor" value={actor} onChange={(evento) => setActor(evento.target.value)} opciones={[{ valor: 'todos', texto: 'Todos' }, ...actores.map((id) => ({ valor: id, texto: `${id} · ${nombreActor(id)}` }))]} />
        <Selector etiqueta="Módulo" value={modulo} onChange={(evento) => setModulo(evento.target.value)} opciones={[{ valor: 'todos', texto: 'Todos' }, ...modulos.map((id) => ({ valor: id, texto: nombresModulos[id as ModuloPermiso] ?? id }))]} />
        <Campo etiqueta="Desde" type="date" value={desde} onChange={(evento) => setDesde(evento.target.value)} />
        <Campo etiqueta="Hasta" type="date" value={hasta} onChange={(evento) => setHasta(evento.target.value)} />
      </div>
      <Tabla
        columnas={columnas}
        filas={filas}
        claveFila={(fila) => fila.id}
        textoBusqueda={(fila) => `${fila.accion} ${fila.referenciaId ?? ''} ${fila.motivo} ${fila.actorId}`}
        placeholderBusqueda="Buscar acción, referencia o motivo"
        accionesCabecera={<BarraExportar modulo="auditoria" nombreArchivo="DEMO-bitacora" filas={() => filas.map((fila) => ({ fecha: fila.fechaHora, actor: fila.actorId, modulo: fila.modulo, accion: fila.accion, referencia: fila.referenciaId, motivo: fila.motivo, antes: texto(fila.antes), despues: texto(fila.despues) }))} />}
        accionesFila={(fila) => <Boton tamano="sm" variante="fantasma" icono={Eye} onClick={() => setDetalle(fila)}>Detalle</Boton>}
        alSeleccionarFila={setDetalle}
      />
      <Modal abierto={Boolean(detalle)} alCerrar={() => setDetalle(null)} titulo={detalle?.accion ?? ''} descripcion={detalle ? <span className="cifra">{formatearFechaHora(detalle.fechaHora)} · {detalle.actorId} · {detalle.referenciaId ?? 'sin referencia'}</span> : null} ancho="lg">
        {detalle && (
          <div className="flex flex-col gap-3 text-[13px]">
            <p><strong>Quién:</strong> {nombreActor(detalle.actorId)} · <strong>Módulo:</strong> {nombresModulos[detalle.modulo as ModuloPermiso] ?? detalle.modulo}</p>
            <p><strong>Por qué:</strong> {detalle.motivo || 'Sin motivo registrado'}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[['Valor anterior', detalle.antes], ['Valor nuevo', detalle.despues]].map(([etiqueta, valor]) => (
                <div key={String(etiqueta)} className="min-w-0"><p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3"><ScrollText className="size-3.5" aria-hidden />{String(etiqueta)}</p><pre className="cifra max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-fondo p-3 text-[12px]">{texto(valor)}</pre></div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
