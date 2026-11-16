import { useMemo, useState } from 'react';
import { Eye, ScrollText } from 'lucide-react';
import { BarraExportar } from '../../componentes/ui/BarraExportar';
import { Boton } from '../../componentes/ui/Boton';
import { Campo } from '../../componentes/ui/Campo';
import { Insignia } from '../../componentes/ui/Insignia';
import { Modal } from '../../componentes/ui/Modal';
import { Selector } from '../../componentes/ui/Selector';
import { Tabla, type ColumnaTabla } from '../../componentes/ui/Tabla';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { modulosErick, nombresModulos } from '../../datos/permisosIniciales';
import { useBitacoraStore } from '../../store/useBitacoraStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import type { Bitacora } from '../../tipos/bitacora';
import type { ModuloPermiso } from '../../tipos/permisos';
import { formatearFechaHora } from '../../utilidades/fechas';

const texto = (valor: unknown) => (valor === null || valor === undefined ? '-' : typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2));
const modulosAcademicos = new Set<string>(modulosErick);

export default function BitacoraAcademica() {
  const registros = useBitacoraStore((estado) => estado.registros);
  const personas = usePersonasStore((estado) => estado.personas);
  const [modulo, setModulo] = useState('todos');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [detalle, setDetalle] = useState<Bitacora | null>(null);
  const nombre = (id: string) => { const persona = personas.find((item) => item.id === id); return persona ? `${persona.nombres} ${persona.apellidos}` : id; };
  const filas = useMemo(() => registros
    .filter((registro) => modulosAcademicos.has(registro.modulo) && (modulo === 'todos' || registro.modulo === modulo)
      && (!desde || registro.fechaHora.slice(0, 10) >= desde) && (!hasta || registro.fechaHora.slice(0, 10) <= hasta))
    .sort((a, b) => b.fechaHora.localeCompare(a.fechaHora)), [registros, modulo, desde, hasta]);
  const columnas: ColumnaTabla<Bitacora>[] = [
    { clave: 'fecha', titulo: 'Fecha y hora', valorOrden: (fila) => fila.fechaHora, render: (fila) => <span className="cifra text-[12.5px]">{formatearFechaHora(fila.fechaHora)}</span> },
    { clave: 'accion', titulo: 'Acción', principalEnMovil: true, valorOrden: (fila) => fila.accion, render: (fila) => <span className="font-semibold">{fila.accion}</span> },
    { clave: 'modulo', titulo: 'Módulo', render: (fila) => <Insignia tono="acento">{nombresModulos[fila.modulo as ModuloPermiso] ?? fila.modulo}</Insignia> },
    { clave: 'actor', titulo: 'Responsable', valorOrden: (fila) => nombre(fila.actorId), render: (fila) => nombre(fila.actorId) },
    { clave: 'referencia', titulo: 'Referencia', ocultarEnMovil: true, render: (fila) => <span className="cifra text-xs">{fila.referenciaId ?? '-'}</span> },
    { clave: 'motivo', titulo: 'Motivo', ocultarEnMovil: true, render: (fila) => <span className="text-[12.5px] text-texto-2">{fila.motivo || '-'}</span> },
  ];
  return (
    <Tarjeta titulo="Bitácora académica" subtitulo="Registro inmutable de las acciones sobre la plataforma ERICK" icono={ScrollText} sinRelleno>
      <Tabla columnas={columnas} filas={filas} claveFila={(fila) => fila.id} porPagina={12}
        textoBusqueda={(fila) => `${fila.accion} ${fila.motivo} ${fila.referenciaId ?? ''} ${nombre(fila.actorId)}`} placeholderBusqueda="Buscar acción, motivo o referencia"
        filtros={(
          <div className="grid w-full gap-3 sm:grid-cols-3">
            <Selector etiqueta="Módulo" value={modulo} onChange={(evento) => setModulo(evento.target.value)} opciones={[{ valor: 'todos', texto: 'Todos los módulos' }, ...modulosErick.map((item) => ({ valor: item, texto: nombresModulos[item] }))]} />
            <Campo etiqueta="Desde" type="date" value={desde} onChange={(evento) => setDesde(evento.target.value)} />
            <Campo etiqueta="Hasta" type="date" value={hasta} onChange={(evento) => setHasta(evento.target.value)} />
          </div>
        )}
        accionesCabecera={<BarraExportar modulo="academico" nombreArchivo="bitacora-academica" filas={() => filas.map((fila) => ({ Fecha: fila.fechaHora, Accion: fila.accion, Modulo: fila.modulo, Responsable: nombre(fila.actorId), Referencia: fila.referenciaId ?? '', Motivo: fila.motivo }))} />}
        accionesFila={(fila) => <Boton tamano="sm" variante="fantasma" icono={Eye} onClick={() => setDetalle(fila)}>Detalle</Boton>}
        textoVacio="Sin registros para estos filtros." />
      {detalle && (
        <Modal abierto alCerrar={() => setDetalle(null)} titulo={detalle.accion} descripcion={`${formatearFechaHora(detalle.fechaHora)} · ${nombre(detalle.actorId)}`} ancho="lg">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><p className="mb-1 text-[12px] font-semibold text-texto-2">Antes</p><pre className="cifra overflow-x-auto rounded-xl bg-fondo p-3 text-[12px]">{texto(detalle.antes)}</pre></div>
            <div><p className="mb-1 text-[12px] font-semibold text-texto-2">Después</p><pre className="cifra overflow-x-auto rounded-xl bg-fondo p-3 text-[12px]">{texto(detalle.despues)}</pre></div>
            <p className="text-[13px] sm:col-span-2"><b>Motivo:</b> {detalle.motivo || '-'}</p>
          </div>
        </Modal>
      )}
    </Tarjeta>
  );
}
