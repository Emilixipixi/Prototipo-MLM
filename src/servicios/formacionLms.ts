import { programaExternoPorPrograma } from '../datos/academico/formacionCampus';
import { PROVEEDOR_ACADEMICO } from '../datos/academico/programas';
import { claveProgreso, resumirPrograma } from '../motores/academico/progreso';
import { useAcademicoStore } from '../store/useAcademicoStore';
import { useCampusStore } from '../store/useCampusStore';
import { useCatalogoStore } from '../store/useCatalogoStore';
import { useFormacionStore } from '../store/useFormacionStore';
import type { Programa } from '../tipos/academico';
import type { EstadoFormacion, EstadoFormativo } from '../tipos/formacion';
import { fechaHoraActualIso } from '../utilidades/fechas';
import { registrarEventoLms } from './eventosLms';
import { notificar, registrarBitacora } from './registro';

const orden: Record<EstadoFormacion, number> = { matriculado: 0, cursando: 1, aprobado: 2 };

export function nombreExterno(programa: Programa): string {
  const producto = useCatalogoStore.getState().productos.find((item) => item.id === programa.productoId);
  return programaExternoPorPrograma[programa.id] ?? producto?.nombre ?? programa.nombre;
}

export function estadoFormativoCampus(personaId: string, programa: Programa): EstadoFormacion | null {
  const { programas, modulos } = useAcademicoStore.getState();
  const { matriculas, progreso, intentos, documentos } = useCampusStore.getState();
  const emitido = documentos.some((documento) => documento.estado === 'emitido' && documento.personaId === personaId && documento.programaId === programa.id
    && documento.tipo !== 'constancia_mid');
  if (emitido) return 'aprobado';
  const resumen = resumirPrograma(personaId, programa.id, { programas, modulos }, { matriculas, progreso, intentos });
  if (resumen?.nota.estado === 'aprobado') return 'aprobado';
  const conAvance = Boolean(resumen && (resumen.aprobados > 0 || resumen.ruta.some((elemento) => progreso[claveProgreso(personaId, elemento.id)])));
  if (conAvance) return 'cursando';
  const matriculado = matriculas.some((matricula) => matricula.personaId === personaId && (matricula.programaId === programa.id
    || programas.some((item) => item.id === matricula.programaId && item.cursoIds.includes(programa.id))));
  return matriculado ? 'matriculado' : null;
}

function siguienteIdFormacion(estados: EstadoFormativo[]): string {
  const numeros = estados.map((item) => Number(item.id.replace('DEMO-FOR-', ''))).filter((numero) => !Number.isNaN(numero));
  return `DEMO-FOR-${String(Math.max(0, ...numeros) + 1).padStart(2, '0')}`;
}

export function sincronizarFormacion(personaId: string, actorId = 'DEMO-CON-LMS'): EstadoFormativo[] {
  const programas = useAcademicoStore.getState().programas.filter((programa) => programa.tipo === 'curso' || programa.tipo === 'diplomado');
  const cambios: EstadoFormativo[] = [];
  programas.forEach((programa) => {
    const campus = estadoFormativoCampus(personaId, programa);
    if (!campus) return;
    const { estados, establecer } = useFormacionStore.getState();
    const nombre = nombreExterno(programa);
    const actual = estados.find((item) => item.personaId === personaId && item.programaExterno === nombre);
    if (actual && orden[actual.estado] >= orden[campus]) return;
    const fecha = fechaHoraActualIso().slice(0, 10);
    const nuevo: EstadoFormativo = actual
      ? { ...actual, estado: campus, fechaActualizacion: fecha }
      : { id: siguienteIdFormacion(estados), personaId, programaExterno: nombre, proveedor: PROVEEDOR_ACADEMICO, estado: campus, fechaActualizacion: fecha };
    establecer(actual ? estados.map((item) => (item.id === actual.id ? nuevo : item)) : [...estados, nuevo]);
    cambios.push(nuevo);
    registrarBitacora({ actorId, accion: 'Estado formativo actualizado por el conector LMS', modulo: 'integraciones', referenciaId: personaId, antes: actual?.estado ?? null, despues: campus, motivo: `${nombre} (Campus ERICK)` });
    if (campus === 'aprobado') {
      notificar({ personaId, tipo: 'estado', titulo: 'Formación aprobada', mensaje: `${nombre}: el Campus ERICK informó tu aprobación. El requisito de formación de tu rango se actualiza solo.` });
    }
    registrarEventoLms('avance_actualizado', personaId, programa.id, { estadoFormativo: campus, registro: nuevo.id }, `Estado formativo en MLM 2027: ${campus}`);
  });
  return cambios;
}
