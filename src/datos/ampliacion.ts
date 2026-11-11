import type { AlertaIntegridad } from '../tipos/compliance';
import type { HistorialRunPrevio } from '../tipos/calificacion';
import type { Producto } from '../tipos/catalogo';
import type { EstadoFormativo } from '../tipos/formacion';
import type { EstadoPedido, EventoPedido, ItemPedido, MovimientoVolumen, Pedido } from '../tipos/pedidos';
import type { EstadoCuenta, Persona, TipoPersona } from '../tipos/persona';
import type { CodigoRun } from '../tipos/reglas';

export const productosAmpliados: Producto[] = [
  {
    id: 'DEMO-PRD-07', codigo: 'DEMO-PRD-07', nombre: 'Programa Liderazgo Comercial - Nivel 2',
    descripcion: 'Continuación del programa de liderazgo con módulos de gestión de equipos. Plataforma educativa ERIC S.A.C. (vínculo conceptual).',
    categoria: 'programa_formativo', precio: 320, vp: 130, vc: 100, moneda: 'USD',
    vigenteDesde: '2026-03-01', vigenteHasta: null, activo: true, proveedorFormativo: 'ERIC S.A.C.',
  },
  {
    id: 'DEMO-PRD-08', codigo: 'DEMO-PRD-08', nombre: 'Batido Proteico Vainilla',
    descripcion: 'Bien físico de nutrición en presentación de 900 g. Producto ficticio para la demostración.',
    categoria: 'bien_fisico', precio: 45, vp: 20, vc: 15, moneda: 'USD',
    vigenteDesde: '2026-01-01', vigenteHasta: null, activo: true,
  },
  {
    id: 'DEMO-PRD-09', codigo: 'DEMO-PRD-09', nombre: 'Pack Bienestar Familiar',
    descripcion: 'Bien físico con selección de productos de nutrición y cuidado para el hogar. Producto ficticio para la demostración.',
    categoria: 'bien_fisico', precio: 210, vp: 95, vc: 75, moneda: 'USD',
    vigenteDesde: '2026-02-15', vigenteHasta: null, activo: true,
  },
  {
    id: 'DEMO-PRD-10', codigo: 'DEMO-PRD-10', nombre: 'Mentoría Grupal de Negocios',
    descripcion: 'Servicio de cuatro sesiones grupales de acompañamiento comercial. Producto ficticio para la demostración.',
    categoria: 'servicio', precio: 95, vp: 35, vc: 40, moneda: 'USD',
    vigenteDesde: '2026-04-01', vigenteHasta: null, activo: true,
  },
  {
    id: 'DEMO-PRD-11', codigo: 'DEMO-PRD-11', nombre: 'Curso de Finanzas Personales',
    descripcion: 'Programa formativo breve sobre presupuesto y ahorro, ofrecido por ERIC S.A.C. (vínculo conceptual).',
    categoria: 'programa_formativo', precio: 110, vp: 50, vc: 40, moneda: 'USD',
    vigenteDesde: '2026-05-01', vigenteHasta: null, activo: true, proveedorFormativo: 'ERIC S.A.C.',
  },
  {
    id: 'DEMO-PRD-12', codigo: 'DEMO-PRD-12', nombre: 'Kit de Inicio Empresario',
    descripcion: 'Bien físico con material de presentación y muestras para nuevos empresarios. Producto ficticio para la demostración.',
    categoria: 'bien_fisico', precio: 180, vp: 80, vc: 60, moneda: 'USD',
    vigenteDesde: '2026-01-01', vigenteHasta: null, activo: true,
  },
  {
    id: 'DEMO-PRD-13', codigo: 'DEMO-PRD-13', nombre: 'Taller de Oratoria Comercial',
    descripcion: 'Programa formativo descontinuado. Se mantiene inactivo para mostrar productos fuera de catálogo.',
    categoria: 'programa_formativo', precio: 90, vp: 40, vc: 30, moneda: 'USD',
    vigenteDesde: '2025-06-01', vigenteHasta: '2026-06-30', activo: false, proveedorFormativo: 'ERIC S.A.C.',
  },
];

type FilaPersona = [id: string, nombres: string, apellidos: string, tipo: Exclude<TipoPersona, 'corporativo'>, estado: EstadoCuenta, pais: string, fechaAlta: string, referenteId: string];

const filasPersonas: FilaPersona[] = [
  ['DEMO-A16', 'Lucía', 'Fernández Gil', 'empresario', 'activo', 'Colombia', '2025-02-10', 'DEMO-A00'],
  ['DEMO-A17', 'Martín', 'Aguirre Soto', 'empresario', 'activo', 'Chile', '2025-03-03', 'DEMO-A00'],
  ['DEMO-A18', 'Daniela', 'Ruiz Peña', 'empresario', 'activo', 'México', '2025-06-21', 'DEMO-A02'],
  ['DEMO-A19', 'Felipe', 'Morales Díaz', 'empresario', 'activo', 'Colombia', '2025-05-14', 'DEMO-A16'],
  ['DEMO-A20', 'Carolina', 'Silva Ochoa', 'empresario', 'activo', 'Colombia', '2025-06-02', 'DEMO-A16'],
  ['DEMO-A21', 'Javier', 'Navarro Ríos', 'empresario', 'activo', 'Ecuador', '2025-08-19', 'DEMO-A16'],
  ['DEMO-A22', 'Isabel', 'Romero Cano', 'empresario', 'activo', 'Chile', '2025-07-07', 'DEMO-A17'],
  ['DEMO-A23', 'Sebastián', 'Molina Vidal', 'empresario', 'activo', 'Chile', '2025-09-25', 'DEMO-A17'],
  ['DEMO-A24', 'Adriana', 'Gutiérrez Lima', 'empresario', 'activo', 'México', '2025-10-30', 'DEMO-A18'],
  ['DEMO-A25', 'Óscar', 'Benítez Prado', 'empresario', 'activo', 'México', '2025-12-04', 'DEMO-A18'],
  ['DEMO-A26', 'Fernanda', 'León Arias', 'empresario', 'activo', 'Colombia', '2026-01-12', 'DEMO-A19'],
  ['DEMO-A27', 'Pablo', 'Cabrera Núñez', 'empresario', 'suspendido', 'Colombia', '2026-01-28', 'DEMO-A19'],
  ['DEMO-A28', 'Mónica', 'Reyes Valdez', 'empresario', 'activo', 'Ecuador', '2026-02-16', 'DEMO-A20'],
  ['DEMO-A29', 'Gustavo', 'Ibáñez Rojas', 'empresario', 'activo', 'Ecuador', '2026-03-09', 'DEMO-A21'],
  ['DEMO-A30', 'Lorena', 'Campos Fuentes', 'empresario', 'activo', 'Chile', '2026-03-30', 'DEMO-A22'],
  ['DEMO-A31', 'Raúl', 'Espinoza Mejía', 'empresario', 'pendiente', 'Chile', '2026-11-09', 'DEMO-A22'],
  ['DEMO-A32', 'Verónica', 'Salas Duarte', 'empresario', 'activo', 'Bolivia', '2026-04-22', 'DEMO-A23'],
  ['DEMO-A33', 'Emilio', 'Carrasco Paz', 'empresario', 'activo', 'México', '2026-05-18', 'DEMO-A24'],
  ['DEMO-A34', 'Patricia', 'Vargas Ortega', 'empresario', 'activo', 'Colombia', '2026-06-11', 'DEMO-A26'],
  ['DEMO-A35', 'Hugo', 'Delgado Ponce', 'empresario', 'activo', 'Colombia', '2026-07-03', 'DEMO-A26'],
  ['DEMO-A36', 'Silvia', 'Muñoz Herrera', 'empresario', 'activo', 'Ecuador', '2026-08-14', 'DEMO-A28'],
  ['DEMO-A37', 'Ernesto', 'Palacios Vera', 'empresario', 'activo', 'Chile', '2026-09-05', 'DEMO-A30'],
  ['DEMO-A38', 'Julia', 'Montes Aranda', 'empresario', 'pendiente', 'México', '2026-11-10', 'DEMO-A33'],
  ['DEMO-A39', 'Alberto', 'Cordero Luna', 'empresario', 'activo', 'Colombia', '2026-10-24', 'DEMO-A34'],
  ['DEMO-C04', 'Andrea', 'Paz Quiroga', 'cliente', 'activo', 'Colombia', '2026-03-18', 'DEMO-A16'],
  ['DEMO-C05', 'Manuel', 'Ochoa Rivas', 'cliente', 'activo', 'Colombia', '2026-04-07', 'DEMO-A19'],
  ['DEMO-C06', 'Claudia', 'Serrano Mora', 'cliente', 'activo', 'Chile', '2026-05-26', 'DEMO-A17'],
  ['DEMO-C07', 'Iván', 'Torres Bustos', 'cliente', 'activo', 'Chile', '2026-06-30', 'DEMO-A22'],
  ['DEMO-C08', 'Beatriz', 'Lozano Cruz', 'cliente', 'activo', 'México', '2026-07-15', 'DEMO-A18'],
  ['DEMO-C09', 'Rodrigo', 'Pineda Gallo', 'cliente', 'bloqueado', 'México', '2026-08-02', 'DEMO-A24'],
  ['DEMO-C10', 'Teresa', 'Cáceres Polo', 'cliente', 'activo', 'Ecuador', '2026-08-29', 'DEMO-A21'],
  ['DEMO-C11', 'Mauricio', 'Valencia Ruiz', 'cliente', 'activo', 'Colombia', '2026-09-17', 'DEMO-A26'],
  ['DEMO-C12', 'Gloria', 'Andrade Sosa', 'cliente', 'activo', 'Bolivia', '2026-10-03', 'DEMO-A23'],
  ['DEMO-C13', 'Arturo', 'Ponce Medina', 'cliente', 'pendiente', 'México', '2026-11-07', 'DEMO-A33'],
  ['DEMO-L02', 'Ximena', 'Rivera Toledo', 'alumno', 'activo', 'Colombia', '2026-05-09', 'DEMO-A20'],
  ['DEMO-L03', 'Diego', 'Arana Becerra', 'alumno', 'activo', 'Chile', '2026-06-19', 'DEMO-A23'],
  ['DEMO-L04', 'Paula', 'Mejía Cordero', 'alumno', 'activo', 'México', '2026-07-24', 'DEMO-A25'],
  ['DEMO-L05', 'Samuel', 'Guerrero Lima', 'alumno', 'activo', 'Ecuador', '2026-08-21', 'DEMO-A29'],
  ['DEMO-L06', 'Renata', 'Ortega Salcedo', 'alumno', 'activo', 'Colombia', '2026-09-28', 'DEMO-A34'],
  ['DEMO-L07', 'Nicolás', 'Bravo Ferrer', 'alumno', 'activo', 'Chile', '2026-10-12', 'DEMO-A37'],
];

const prefijosTelefono: Record<string, string> = { Colombia: '+57 300', Chile: '+56 9', México: '+52 55', Ecuador: '+593 99', Bolivia: '+591 7' };

function correo(nombres: string, apellidos: string): string {
  const limpiar = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  return `${limpiar(nombres)}.${limpiar(apellidos.split(' ')[0])}@correo.demo`;
}

export const personasAmpliadas: Persona[] = filasPersonas.map(([id, nombres, apellidos, tipo, estado, pais, fechaAlta, referenteId], indice) => {
  const numero = String(100 + indice).padStart(3, '0');
  return {
    id, codigo: id, nombres, apellidos, tipo, perfil: tipo === 'empresario' ? 'afiliado' : 'cliente_alumno', estado,
    correo: correo(nombres, apellidos), telefono: `${prefijosTelefono[pais]} 000 ${numero}`, documento: `DEMO-DOC-${numero}`,
    pais, moneda: 'USD', idioma: 'es', fechaAlta, referenteId,
  };
});

const empresarios = personasAmpliadas.filter((persona) => persona.tipo === 'empresario');

export const relacionesAmpliadas: Array<[string, string, string]> = empresarios.map((persona) => [persona.id, persona.referenteId ?? 'DEMO-A00', persona.fechaAlta]);

type Brazo = 'A' | 'B' | 'C';
const brazos: Brazo[] = ['A', 'B', 'C'];

function siguienteDia(fecha: string): string {
  const dia = new Date(`${fecha}T00:00:00Z`);
  dia.setUTCDate(dia.getUTCDate() + 1);
  return dia.toISOString().slice(0, 10);
}

function construirUbicaciones(): Array<[string, string, string, Brazo, string]> {
  const filas: Array<[string, string, string, Brazo, string]> = [];
  const posicionDe = new Map<string, string>([['DEMO-A00', 'DEMO-POS-000']]);
  const ocupados = new Set<string>(['DEMO-POS-000-A']);
  const orden: string[] = ['DEMO-POS-000'];
  let consecutivo = 15;
  const libre = (posicionId: string) => brazos.find((brazo) => !ocupados.has(`${posicionId}-${brazo}`));
  empresarios.filter((persona) => persona.estado !== 'pendiente').forEach((persona) => {
    const delPatrocinador = persona.referenteId ? posicionDe.get(persona.referenteId) : undefined;
    let padre = delPatrocinador && libre(delPatrocinador) ? delPatrocinador : orden.find((posicionId) => libre(posicionId));
    if (!padre) padre = 'DEMO-POS-000';
    const brazo = libre(padre) ?? 'C';
    const id = `DEMO-POS-${String(consecutivo).padStart(3, '0')}`;
    consecutivo += 1;
    ocupados.add(`${padre}-${brazo}`);
    posicionDe.set(persona.id, id);
    orden.push(id);
    filas.push([id, persona.id, padre, brazo, siguienteDia(persona.fechaAlta)]);
  });
  return filas;
}

export const ubicacionesAmpliadas = construirUbicaciones();

function generador(semilla: number) {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const aleatorio = generador(2027);
const entero = (minimo: number, maximo: number) => minimo + Math.floor(aleatorio() * (maximo - minimo + 1));
const elegir = <T,>(lista: T[]): T => lista[Math.floor(aleatorio() * lista.length)];

const catalogoVenta: Array<{ id: string; precio: number; vp: number; vc: number }> = [
  { id: 'DEMO-PRD-01', precio: 250, vp: 100, vc: 80 },
  { id: 'DEMO-PRD-02', precio: 120, vp: 60, vc: 45 },
  { id: 'DEMO-PRD-03', precio: 80, vp: 20, vc: 30 },
  { id: 'DEMO-PRD-04', precio: 65, vp: 30, vc: 25 },
  { id: 'DEMO-PRD-05', precio: 150, vp: 70, vc: 50 },
  ...productosAmpliados.filter((producto) => producto.activo).map((producto) => ({ id: producto.id, precio: producto.precio, vp: producto.vp, vc: producto.vc })),
];

const ciclosVenta = [
  { id: 'DEMO-C01', inicio: '2026-10-19', dias: 14 },
  { id: 'DEMO-C02', inicio: '2026-11-02', dias: 10 },
];

function fechaEn(inicio: string, dias: number): string {
  const fecha = new Date(`${inicio}T00:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + entero(0, dias - 1));
  const hora = String(entero(8, 19)).padStart(2, '0');
  const minuto = String(entero(0, 59)).padStart(2, '0');
  return `${fecha.toISOString().slice(0, 10)}T${hora}:${minuto}:00`;
}

function desplazar(fecha: string, minutos: number): string {
  const base = new Date(`${fecha}Z`);
  base.setUTCMinutes(base.getUTCMinutes() + minutos);
  return base.toISOString().slice(0, 19);
}

function armarItems(cantidadLineas: number): ItemPedido[] {
  const elegidos = new Map<string, ItemPedido>();
  for (let indice = 0; indice < cantidadLineas; indice += 1) {
    const producto = elegir(catalogoVenta);
    const previo = elegidos.get(producto.id);
    if (previo) { previo.cantidad += 1; continue; }
    elegidos.set(producto.id, { productoId: producto.id, cantidad: entero(1, 2), precioUnitario: producto.precio, vpUnitario: producto.vp, vcUnitario: producto.vc });
  }
  return [...elegidos.values()];
}

interface Borrador { compradorId: string; referenteId: string | null; periodoId: string; fecha: string; items: ItemPedido[]; estado: EstadoPedido; }

function planificarPedidos(): Borrador[] {
  const plan: Borrador[] = [];
  const activos = empresarios.filter((persona) => persona.estado === 'activo' || persona.estado === 'suspendido');
  ciclosVenta.forEach((ciclo, indiceCiclo) => {
    activos.forEach((persona) => {
      const cantidad = persona.estado === 'suspendido' ? (indiceCiclo === 0 ? 2 : 0) : entero(1, indiceCiclo === 0 ? 4 : 3);
      for (let indice = 0; indice < cantidad; indice += 1) {
        plan.push({ compradorId: persona.id, referenteId: null, periodoId: ciclo.id, fecha: fechaEn(ciclo.inicio, ciclo.dias), items: armarItems(entero(1, 3)), estado: 'confirmada' });
      }
    });
    personasAmpliadas.filter((persona) => persona.tipo !== 'empresario' && persona.estado === 'activo').forEach((persona) => {
      const cantidad = entero(0, 2);
      for (let indice = 0; indice < cantidad; indice += 1) {
        plan.push({ compradorId: persona.id, referenteId: persona.referenteId, periodoId: ciclo.id, fecha: fechaEn(ciclo.inicio, ciclo.dias), items: armarItems(entero(1, 2)), estado: 'confirmada' });
      }
    });
  });
  plan.sort((a, b) => a.fecha.localeCompare(b.fecha));
  const marcar = (indices: number[], estado: EstadoPedido) => indices.forEach((indice) => { if (plan[indice]) plan[indice].estado = estado; });
  const ultimos = plan.length;
  marcar([7, 33, ultimos - 22], 'devuelta');
  marcar([19, ultimos - 15], 'cancelada');
  marcar([ultimos - 6, ultimos - 4, ultimos - 2], 'pendiente');
  marcar([ultimos - 1], 'borrador');
  return plan;
}

function construirEventos(borrador: Borrador, comprobante: string): EventoPedido[] {
  const eventos: EventoPedido[] = [{ estado: 'borrador', fecha: desplazar(borrador.fecha, -6), actorId: borrador.compradorId, detalle: 'Pedido creado' }];
  if (borrador.estado === 'borrador') return eventos;
  eventos.push({ estado: 'pendiente', fecha: desplazar(borrador.fecha, -3), actorId: borrador.compradorId, detalle: 'Pedido enviado a confirmación de cobro' });
  if (borrador.estado === 'pendiente') return eventos;
  if (borrador.estado === 'cancelada') {
    eventos.push({ estado: 'cancelada', fecha: borrador.fecha, actorId: 'DEMO-U02', detalle: 'Cobro no confirmado: pedido cancelado (simulado)' });
    return eventos;
  }
  eventos.push({ estado: 'confirmada', fecha: borrador.fecha, actorId: 'DEMO-U02', detalle: `Confirmación de cobro simulada (sin transacción real) - ${comprobante}` });
  if (borrador.estado === 'devuelta') eventos.push({ estado: 'devuelta', fecha: desplazar(borrador.fecha, 60 * 24), actorId: 'DEMO-U01', detalle: 'Devolución registrada por corporativo' });
  return eventos;
}

function construirPedidos(): { pedidos: Pedido[]; movimientos: MovimientoVolumen[] } {
  const pedidos: Pedido[] = [];
  const movimientos: MovimientoVolumen[] = [];
  let numeroMovimiento = 76;
  planificarPedidos().forEach((borrador, indice) => {
    const id = `DEMO-P${String(77 + indice).padStart(2, '0')}`;
    const comprobante = `DEMO-CMP-${String(74 + indice).padStart(4, '0')}`;
    const totalPrecio = borrador.items.reduce((suma, item) => suma + item.precioUnitario * item.cantidad, 0);
    const totalVp = borrador.items.reduce((suma, item) => suma + item.vpUnitario * item.cantidad, 0);
    const totalVc = borrador.items.reduce((suma, item) => suma + item.vcUnitario * item.cantidad, 0);
    pedidos.push({
      id, compradorId: borrador.compradorId, referenteId: borrador.referenteId, periodoId: borrador.periodoId,
      items: borrador.items, totalPrecio, totalVp, totalVc, estado: borrador.estado, fecha: borrador.fecha, comprobante,
      eventos: construirEventos(borrador, comprobante),
    });
    if (borrador.estado !== 'confirmada' && borrador.estado !== 'devuelta') return;
    const personaId = borrador.referenteId ?? borrador.compradorId;
    const origenId = `DEMO-MV-${String(numeroMovimiento).padStart(4, '0')}`;
    numeroMovimiento += 1;
    movimientos.push({ id: origenId, tipo: 'origen', pedidoId: id, movimientoOrigenId: null, personaId, periodoId: borrador.periodoId, vp: totalVp, vc: totalVc, fecha: borrador.fecha, motivo: 'Pedido confirmado' });
    if (borrador.estado === 'devuelta') {
      movimientos.push({
        id: `DEMO-MV-${String(numeroMovimiento).padStart(4, '0')}`, tipo: 'reversion', pedidoId: id, movimientoOrigenId: origenId, personaId,
        periodoId: borrador.periodoId, vp: -totalVp, vc: -totalVc, fecha: desplazar(borrador.fecha, 60 * 24), motivo: `Reversión por devolución del pedido ${id}`,
      });
      numeroMovimiento += 1;
    }
  });
  return { pedidos, movimientos };
}

const ventas = construirPedidos();
export const pedidosAmpliados = ventas.pedidos;
export const movimientosAmpliados = ventas.movimientos;

export const historialAmpliado: HistorialRunPrevio[] = ([
  ['DEMO-A16', 'RUN50K', 'RUN10K'], ['DEMO-A17', 'RUN30K', 'RUN5K'], ['DEMO-A18', 'RUN10K', 'RUN3K'],
  ['DEMO-A19', 'RUN5K', 'RUN3K'], ['DEMO-A20', 'RUN3K', 'RUN1K'], ['DEMO-A21', 'RUN3K', 'RUN1K'],
  ['DEMO-A22', 'RUN5K', 'RUN3K'], ['DEMO-A23', 'RUN1K', 'RUN1K'], ['DEMO-A24', 'RUN1K', 'RUN300'],
  ['DEMO-A25', 'RUN1K', 'RUN300'], ['DEMO-A26', 'RUN1K', 'RUN1K'], ['DEMO-A27', 'RUN1K', 'RUN300'],
  ['DEMO-A28', 'RUN300', 'RUN300'], ['DEMO-A30', 'RUN300', null],
] as Array<[string, CodigoRun, CodigoRun | null]>).map(([personaId, runHistoricoPrevio, runCobroCicloAnterior]) => ({
  personaId, runHistoricoPrevio, runCobroCicloAnterior, nota: 'Trayectoria anterior al ciclo DEMO-C01 (dato de demostración)',
}));

export const formacionAmpliada: EstadoFormativo[] = ([
  ['DEMO-A16', 'Programa Liderazgo Comercial - Nivel 2', 'aprobado', '2026-08-30'],
  ['DEMO-A17', 'Programa Liderazgo Comercial - Nivel 1', 'aprobado', '2026-07-14'],
  ['DEMO-A18', 'Programa Liderazgo Comercial - Nivel 1', 'cursando', '2026-10-21'],
  ['DEMO-A19', 'Taller de Ventas Digitales', 'aprobado', '2026-09-08'],
  ['DEMO-A22', 'Curso de Finanzas Personales', 'cursando', '2026-11-02'],
  ['DEMO-A24', 'Taller de Ventas Digitales', 'matriculado', '2026-11-06'],
  ['DEMO-A26', 'Programa Liderazgo Comercial - Nivel 1', 'cursando', '2026-10-15'],
  ['DEMO-A30', 'Curso de Finanzas Personales', 'matriculado', '2026-11-09'],
  ['DEMO-L02', 'Programa Liderazgo Comercial - Nivel 1', 'aprobado', '2026-09-27'],
  ['DEMO-L03', 'Taller de Ventas Digitales', 'cursando', '2026-10-30'],
  ['DEMO-L04', 'Curso de Finanzas Personales', 'aprobado', '2026-10-18'],
  ['DEMO-L05', 'Programa Liderazgo Comercial - Nivel 2', 'matriculado', '2026-11-04'],
  ['DEMO-L06', 'Taller de Ventas Digitales', 'cursando', '2026-11-01'],
  ['DEMO-L07', 'Programa Liderazgo Comercial - Nivel 1', 'matriculado', '2026-11-08'],
] as Array<[string, string, EstadoFormativo['estado'], string]>).map(([personaId, programaExterno, estado, fechaActualizacion], indice) => ({
  id: `DEMO-FOR-${String(5 + indice).padStart(2, '0')}`, personaId, programaExterno, proveedor: 'ERIC S.A.C.', estado, fechaActualizacion,
}));

export const alertasAmpliadas: AlertaIntegridad[] = [
  {
    id: 'DEMO-ALR-04', tipo: 'patron_atipico', personasIds: ['DEMO-A27'], severidad: 'alta', estado: 'abierta', resolucion: null,
    descripcion: 'DEMO-A27 concentró su volumen del ciclo DEMO-C01 en dos pedidos de alto monto registrados el mismo día. Cuenta suspendida de forma preventiva.',
    fecha: '2026-11-03T15:30:00',
  },
  {
    id: 'DEMO-ALR-05', tipo: 'duplicado', personasIds: ['DEMO-C09', 'DEMO-C08'], severidad: 'media', estado: 'en_revision', resolucion: null,
    descripcion: 'DEMO-C09 registró la misma dirección de entrega y tarjeta simulada que DEMO-C08. Cliente bloqueado mientras se revisa.',
    fecha: '2026-11-06T10:05:00',
  },
  {
    id: 'DEMO-ALR-06', tipo: 'estructura_inconsistente', personasIds: ['DEMO-A31'], severidad: 'baja', estado: 'abierta', resolucion: null,
    descripcion: 'DEMO-A31 tiene alta pendiente de colocación en el árbol Trinario: no tiene posición asignada.',
    fecha: '2026-11-09T18:20:00',
  },
  {
    id: 'DEMO-ALR-07', tipo: 'patron_atipico', personasIds: ['DEMO-A25'], severidad: 'baja', estado: 'resuelta',
    resolucion: 'Se verificó que los pedidos corresponden a compras para un evento comercial autorizado.',
    descripcion: 'DEMO-A25 superó en 3 veces su promedio de compras del último trimestre.',
    fecha: '2026-10-27T09:45:00',
  },
];
