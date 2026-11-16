import { useState } from 'react';
import { Power, WalletCards } from 'lucide-react';
import { Boton } from '../../../componentes/ui/Boton';
import { ConPermiso } from '../../../componentes/ui/ConPermiso';
import { Insignia } from '../../../componentes/ui/Insignia';
import { Modal } from '../../../componentes/ui/Modal';
import { Selector } from '../../../componentes/ui/Selector';
import { Tabla, type ColumnaTabla } from '../../../componentes/ui/Tabla';
import { Tarjeta } from '../../../componentes/ui/Tarjeta';
import { useToast } from '../../../componentes/ui/useToast';
import { estadosAcceso } from '../../../datos/academico/presentacionCampus';
import { useDatosAcademicos, type FilaMembresia } from '../../../hooks/useDatosAcademicos';
import { usePermiso } from '../../../hooks/usePermiso';
import { usePrecios } from '../../../hooks/usePrecios';
import { alternarPlan } from '../../../servicios/academico';
import { activarMembresia } from '../../../servicios/matriculas';
import { useCatalogoStore } from '../../../store/useCatalogoStore';
import { usePersonaSesion } from '../../../store/useSesionStore';
import { formatearFecha } from '../../../utilidades/fechas';
import { formatearMonto } from '../../../utilidades/formatos';

export default function MembresiasAcademicas() {
  const datos = useDatosAcademicos();
  const productos = useCatalogoStore((estado) => estado.productos);
  const precio = usePrecios();
  const persona = usePersonaSesion();
  const toast = useToast();
  const puedeEditar = usePermiso('matriculas', 'editar');
  const [asignar, setAsignar] = useState(false);
  const [alumnoId, setAlumnoId] = useState('');
  const [planId, setPlanId] = useState('DEMO-PLAN-01');
  const actor = persona?.id ?? 'DEMO-U01';
  const columnas: ColumnaTabla<FilaMembresia>[] = [
    { clave: 'id', titulo: 'Membresía', render: (fila) => <span className="cifra text-xs">{fila.membresia.id}</span> },
    { clave: 'persona', titulo: 'Estudiante', principalEnMovil: true, render: (fila) => (fila.persona ? `${fila.persona.nombres} ${fila.persona.apellidos}` : fila.membresia.personaId) },
    { clave: 'plan', titulo: 'Plan', render: (fila) => fila.plan },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <Insignia tono={estadosAcceso[fila.estado].tono}>{estadosAcceso[fila.estado].texto}</Insignia> },
    { clave: 'periodo', titulo: 'Vigencia', render: (fila) => <span className="cifra text-xs">{formatearFecha(fila.membresia.inicio)} al {formatearFecha(fila.membresia.vencimiento)}</span>, valorOrden: (fila) => fila.membresia.vencimiento },
    { clave: 'pedidos', titulo: 'Pedidos', ocultarEnMovil: true, render: (fila) => <span className="cifra text-xs">{fila.membresia.pedidoIds.join(', ') || 'Manual'}</span> },
  ];
  return (
    <div className="flex flex-col gap-5">
      <Tarjeta titulo="Planes de membresía" subtitulo="Cada plan es un producto del catálogo: su precio, VP, VC y descuentos se gestionan en el catálogo del MLM." icono={WalletCards}>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {datos.academico.planes.map((plan) => {
            const producto = productos.find((item) => item.id === plan.productoId);
            return (
              <li key={plan.id} className="flex flex-col gap-1.5 rounded-xl border border-borde p-3">
                <p className="cifra text-2xl font-extrabold">{plan.meses}</p>
                <p className="text-xs text-texto-2">{plan.meses === 1 ? 'mes' : 'meses'} · <span className="cifra">{plan.productoId}</span></p>
                <p className="cifra text-sm font-bold">{producto ? formatearMonto(precio(producto).precioFinal) : '-'}</p>
                <Insignia tono={plan.activo ? 'exito' : 'neutra'}>{plan.activo ? 'Activo' : 'Inactivo'}</Insignia>
                {puedeEditar && <Boton tamano="sm" variante="fantasma" icono={Power} onClick={() => { const resultado = alternarPlan(plan.id, actor); if (resultado.ok) toast.info(resultado.valor ? 'Plan activado' : 'Plan desactivado', plan.nombre); }}>{plan.activo ? 'Desactivar' : 'Activar'}</Boton>}
              </li>
            );
          })}
        </ul>
      </Tarjeta>
      <Tabla columnas={columnas} filas={datos.filasMembresias} claveFila={(fila) => fila.membresia.id} textoBusqueda={(fila) => `${fila.membresia.id} ${fila.persona?.nombres ?? ''} ${fila.persona?.apellidos ?? ''}`}
        accionesCabecera={<ConPermiso modulo="matriculas" accion="crear"><Boton tamano="sm" icono={WalletCards} onClick={() => setAsignar(true)}>Asignar membresía</Boton></ConPermiso>} textoVacio="Aún no hay membresías." />
      {asignar && (
        <Modal abierto alCerrar={() => setAsignar(false)} titulo="Asignar membresía sin pago" descripcion="Si la persona ya tiene una membresía, el plazo se suma desde su vencimiento."
          pie={<><Boton variante="secundario" onClick={() => setAsignar(false)}>Cancelar</Boton><Boton onClick={() => {
            const plan = datos.academico.planes.find((item) => item.id === planId);
            if (!plan || !alumnoId) return;
            const resultado = activarMembresia(alumnoId, plan, null, actor);
            if (resultado.ok) { toast.exito('Membresía asignada', `Vence el ${formatearFecha(resultado.valor.membresia.vencimiento)}`); setAsignar(false); } else toast.error('No se pudo asignar', resultado.error);
          }} disabled={!alumnoId}>Asignar</Boton></>}>
          <div className="flex flex-col gap-3">
            <Selector etiqueta="Estudiante" value={alumnoId} onChange={(evento) => setAlumnoId(evento.target.value)} opciones={[{ valor: '', texto: 'Selecciona una persona' }, ...datos.personas.filter((item) => item.tipo !== 'corporativo' && item.estado === 'activo').map((item) => ({ valor: item.id, texto: `${item.codigo} · ${item.nombres} ${item.apellidos}` }))]} />
            <Selector etiqueta="Plan" value={planId} onChange={(evento) => setPlanId(evento.target.value)} opciones={datos.academico.planes.filter((plan) => plan.activo).map((plan) => ({ valor: plan.id, texto: plan.nombre }))} />
          </div>
        </Modal>
      )}
    </div>
  );
}
