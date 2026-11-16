import type { Bitacora } from '../tipos/bitacora';
import type { AlertaIntegridad } from '../tipos/compliance';
import type { Ajuste, CorridaCalculo, Liquidacion } from '../tipos/compensacion';
import type { EstadoFormativo } from '../tipos/formacion';
import type { MovimientoVolumen, Pedido } from '../tipos/pedidos';
import type { TablaPermisos } from './permisosIniciales';
import type { Persona } from '../tipos/persona';
import type { PosicionTrinaria } from '../tipos/red';
import { pedidosIniciales } from './pedidos';
import { personasIniciales } from './personas';
import type { DocumentoAcademico, IntentoEvaluacion, Matricula, Membresia, ProgresoComponente, SustentacionMid } from '../tipos/academico';
import { documentosIniciales, matriculasIniciales } from './academico/matriculasIniciales';

interface DatosCampusGuia {
  matriculas: Matricula[]; membresias: Membresia[]; progreso: Record<string, ProgresoComponente>;
  intentos: IntentoEvaluacion[]; documentos: DocumentoAcademico[]; sustentaciones: SustentacionMid[];
}

const matriculasBase = new Set(matriculasIniciales.map((matricula) => matricula.id));
const documentosBase = new Set(documentosIniciales.map((documento) => documento.id));
const documentoNuevo = (estado: EstadoGuia, personaId: string, tipo: DocumentoAcademico['tipo']) => (estado.campus?.documentos ?? []).some((documento) => !documentosBase.has(documento.id) && documento.personaId === personaId && documento.tipo === tipo);
const sustentacionL03 = (estado: EstadoGuia) => (estado.campus?.sustentaciones ?? []).find((item) => item.personaId === 'DEMO-L03');

export interface EstadoGuia {
  personas: Persona[]; posiciones: PosicionTrinaria[]; pedidos: Pedido[]; movimientos: MovimientoVolumen[];
  corridas: CorridaCalculo[]; liquidaciones: Liquidacion[]; ajustes: Ajuste[]; formacion: EstadoFormativo[];
  alertas: AlertaIntegridad[]; bitacora: Bitacora[]; permisos: TablaPermisos;
  campus?: Pick<DatosCampusGuia, 'matriculas' | 'membresias' | 'progreso' | 'intentos' | 'documentos' | 'sustentaciones'>;
}

export interface PasoFlujo {
  id: string;
  texto: string;
  ruta: string;
  rolId: string | null;
  detectar?: (estado: EstadoGuia) => boolean;
}

export interface FlujoDemostracion { id: string; titulo: string; objetivo: string; pasos: PasoFlujo[]; }

const idsIniciales = new Set(personasIniciales.map((persona) => persona.id));
const pedidosBase = new Set(pedidosIniciales.map((pedido) => pedido.id));
const nuevosEmpresarios = (estado: EstadoGuia) => estado.personas.filter((persona) => !idsIniciales.has(persona.id) && persona.tipo === 'empresario' && persona.referenteId === 'DEMO-A01');
const corridaC02 = (estado: EstadoGuia) => estado.corridas.find((corrida) => corrida.periodoId === 'DEMO-C02' && !corrida.parametrosTemporales) ?? estado.corridas.find((corrida) => corrida.periodoId === 'DEMO-C02');
const accionDe = (estado: EstadoGuia, accion: string, actorId: string, referenciaId?: string) => estado.bitacora.some((registro) => registro.accion === accion && registro.actorId === actorId && (!referenciaId || registro.referenciaId === referenciaId));
const hayAccion = (estado: EstadoGuia, accion: string, referenciaId?: string) => estado.bitacora.some((registro) => registro.accion === accion && (!referenciaId || registro.referenciaId === referenciaId));

export const flujosDemostracion: FlujoDemostracion[] = [
  {
    id: 'F01', titulo: 'Afiliación por patrocinio', objetivo: 'Un nuevo empresario entra por enlace, conserva a su patrocinador y recibe una posición Trinaria distinta.',
    pasos: [
      { id: 'F01-1', texto: 'DEMO-A01 copia su enlace de patrocinio en Mi inicio.', ruta: '/afiliado/inicio', rolId: 'DEMO-A01' },
      { id: 'F01-2', texto: 'Un visitante se registra como empresario desde el enlace (queda pendiente).', ruta: '/registro?ref=DEMO-A01', rolId: null, detectar: (estado) => nuevosEmpresarios(estado).length > 0 },
      { id: 'F01-3', texto: 'Se confirma el patrocinador y queda registrado en la bitácora.', ruta: '/corporativo/usuarios', rolId: 'DEMO-U01', detectar: (estado) => nuevosEmpresarios(estado).some((persona) => hayAccion(estado, 'Confirmación de patrocinador', persona.id) || hayAccion(estado, 'Registro de persona', persona.id)) },
      { id: 'F01-4', texto: 'Corporativo asigna la posición Trinaria en un brazo libre (panel de colocación).', ruta: '/corporativo/arboles', rolId: 'DEMO-U01', detectar: (estado) => nuevosEmpresarios(estado).some((persona) => estado.posiciones.some((posicion) => posicion.personaId === persona.id && posicion.estado === 'activa')) },
      { id: 'F01-5', texto: 'Ambos árboles muestran a la persona: Unilevel bajo DEMO-A01 y Trinaria bajo su padre de posición.', ruta: '/corporativo/arboles', rolId: 'DEMO-U01' },
    ],
  },
  {
    id: 'F02', titulo: 'Venta y generación de volumen', objetivo: 'Una compra confirmada genera VP y VC en el ciclo abierto.',
    pasos: [
      { id: 'F02-1', texto: 'El cliente elige un producto, lo agrega al carrito y pasa al checkout.', ruta: '/catalogo', rolId: 'DEMO-C01' },
      { id: 'F02-2', texto: 'Se crea el pedido y se simula la confirmación de cobro.', ruta: '/cuenta', rolId: 'DEMO-C01', detectar: (estado) => estado.pedidos.some((pedido) => !pedidosBase.has(pedido.id) && pedido.estado === 'confirmada') },
      { id: 'F02-3', texto: 'Se generan movimientos VP/VC tipo origen en DEMO-C02.', ruta: '/demo/datos', rolId: 'DEMO-U01', detectar: (estado) => estado.movimientos.some((movimiento) => movimiento.tipo === 'origen' && movimiento.pedidoId !== null && !pedidosBase.has(movimiento.pedidoId)) },
      { id: 'F02-4', texto: 'El volumen aparece en Mi volumen del referente y en los reportes.', ruta: '/corporativo/reportes', rolId: 'DEMO-U01' },
    ],
  },
  {
    id: 'F03', titulo: 'Progreso de rango', objetivo: 'RUN Histórico y RUN de Cobro son distintos; Mi RUN explica lo que falta.',
    pasos: [
      { id: 'F03-1', texto: 'DEMO-A01 ve RUN Histórico RUN100K y RUN de Cobro RUN10K en su inicio.', ruta: '/afiliado/inicio', rolId: 'DEMO-A01' },
      { id: 'F03-2', texto: 'Revisa volumen, directos, brazos y formación.', ruta: '/afiliado/volumen', rolId: 'DEMO-A01' },
      { id: 'F03-3', texto: 'En Mi RUN ve los requisitos cumplidos y pendientes para RUN30K con su fuente.', ruta: '/afiliado/run', rolId: 'DEMO-A01' },
    ],
  },
  {
    id: 'F04', titulo: 'Ciclo y bonos', objetivo: 'Una corrida del ciclo abierto muestra los siete conceptos por separado.',
    pasos: [
      { id: 'F04-1', texto: 'El superadministrador revisa el período DEMO-C02.', ruta: '/corporativo/periodos', rolId: 'DEMO-U01' },
      { id: 'F04-2', texto: 'En el simulador elige DEMO-VR-1 o parámetros temporales.', ruta: '/corporativo/simulador', rolId: 'DEMO-U01' },
      { id: 'F04-3', texto: 'Ejecuta la corrida y revisa cada concepto en su pestaña.', ruta: '/corporativo/simulador', rolId: 'DEMO-U01', detectar: (estado) => Boolean(corridaC02(estado)) },
      { id: 'F04-4', texto: 'Envía la corrida a revisión.', ruta: '/corporativo/simulador', rolId: 'DEMO-U01', detectar: (estado) => estado.corridas.some((corrida) => corrida.periodoId === 'DEMO-C02' && corrida.estado !== 'simulada') },
    ],
  },
  {
    id: 'F05', titulo: 'Revisión y liquidación', objetivo: 'El operador con permiso aprueba y genera liquidaciones simuladas sin duplicar.',
    pasos: [
      { id: 'F05-0', texto: 'El superadministrador activa "aprobar" y "liquidar" en Liquidaciones para el operador.', ruta: '/corporativo/permisos', rolId: 'DEMO-U01', detectar: (estado) => estado.permisos.operador.liquidaciones.includes('aprobar') },
      { id: 'F05-1', texto: 'El operador consulta la corrida en revisión.', ruta: '/corporativo/liquidaciones', rolId: 'DEMO-U02' },
      { id: 'F05-2', texto: 'Aprueba o retiene partidas (DEMO-A05 aparece retenida por suspensión) y aprueba la corrida.', ruta: '/corporativo/liquidaciones', rolId: 'DEMO-U02', detectar: (estado) => estado.corridas.some((corrida) => corrida.periodoId === 'DEMO-C02' && corrida.estado === 'aprobada') },
      { id: 'F05-3', texto: 'Genera la liquidación simulada; un segundo intento no duplica.', ruta: '/corporativo/liquidaciones', rolId: 'DEMO-U02', detectar: (estado) => estado.liquidaciones.some((liquidacion) => liquidacion.periodoId === 'DEMO-C02') },
      { id: 'F05-4', texto: 'DEMO-A01 ve el detalle en Mis liquidaciones, sin transferencia monetaria.', ruta: '/afiliado/liquidaciones', rolId: 'DEMO-A01' },
    ],
  },
  {
    id: 'F06', titulo: 'Devolución de venta', objetivo: 'Una devolución revierte volumen y propone ajustes sin reescribir cierres.',
    pasos: [
      { id: 'F06-1', texto: 'En Compliance, pestaña Devoluciones, se elige DEMO-P03 y se revisa la vista previa.', ruta: '/corporativo/compliance', rolId: 'DEMO-U01' },
      { id: 'F06-2', texto: 'Se confirma: se crea el movimiento inverso de VP/VC enlazado al original.', ruta: '/corporativo/compliance', rolId: 'DEMO-U01', detectar: (estado) => estado.movimientos.some((movimiento) => movimiento.tipo === 'reversion' && movimiento.pedidoId === 'DEMO-P03') },
      { id: 'F06-3', texto: 'La proyección de DEMO-C02 se actualiza; DEMO-P02 muestra el ajuste sobre el cierre de C01.', ruta: '/corporativo/compliance', rolId: 'DEMO-U01' },
      { id: 'F06-4', texto: 'Auditoría muestra la cadena pedido, reversión y ajuste.', ruta: '/corporativo/auditoria', rolId: 'DEMO-U01', detectar: (estado) => hayAccion(estado, 'Registro de devolución', 'DEMO-P03') },
    ],
  },
  {
    id: 'F07', titulo: 'Formación como condición', objetivo: 'El estado académico simulado cambia un requisito de rango.',
    pasos: [
      { id: 'F07-1', texto: 'DEMO-A01 abre Mi formación: su programa está cursando.', ruta: '/afiliado/formacion', rolId: 'DEMO-A01' },
      { id: 'F07-2', texto: 'Pulsa "Simular actualización desde LMS" y pasa a aprobado.', ruta: '/afiliado/formacion', rolId: 'DEMO-A01', detectar: (estado) => estado.formacion.some((item) => item.personaId === 'DEMO-A01' && item.estado === 'aprobado') },
      { id: 'F07-3', texto: 'En Mi RUN el requisito "Formación aprobada" aparece cumplido.', ruta: '/afiliado/run', rolId: 'DEMO-A01' },
    ],
  },
  {
    id: 'F08', titulo: 'Control corporativo', objetivo: 'Una alerta de duplicidad se revisa, se decide y queda consolidada.',
    pasos: [
      { id: 'F08-1', texto: 'El administrador ve la alerta DEMO-ALR-01 en el panel.', ruta: '/corporativo/resumen', rolId: 'DEMO-U01' },
      { id: 'F08-2', texto: 'Abre la ficha comparativa: documento y teléfono coinciden.', ruta: '/corporativo/compliance', rolId: 'DEMO-U01' },
      { id: 'F08-3', texto: 'Suspende o libera DEMO-A11 con motivo obligatorio y resuelve la alerta.', ruta: '/corporativo/compliance', rolId: 'DEMO-U01', detectar: (estado) => estado.alertas.some((alerta) => alerta.id === 'DEMO-ALR-01' && alerta.estado === 'resuelta') },
      { id: 'F08-4', texto: 'El reporte de compliance consolida decisiones y la bitácora lo registra.', ruta: '/corporativo/reportes', rolId: 'DEMO-U01' },
    ],
  },
  {
    id: 'F09', titulo: 'Compra y matrícula automática', objetivo: 'Pagar un curso o una membresía activa el acceso al Campus ERICK sin intervención.',
    pasos: [
      { id: 'F09-1', texto: 'La alumna DEMO-L01 agrega la Membresía ERICK de 1 mes al carrito.', ruta: '/catalogo/DEMO-PRD-21', rolId: 'DEMO-L01' },
      { id: 'F09-2', texto: 'En el checkout elige "Pasarela local (simulada)" con respuesta Aprobado y crea el pedido.', ruta: '/checkout', rolId: 'DEMO-L01', detectar: (estado) => (estado.campus?.membresias ?? []).some((membresia) => membresia.personaId === 'DEMO-L01') },
      { id: 'F09-3', texto: 'En Mi membresía se inscribe al Curso Ventas Digitales y lo ve en Mis programas.', ruta: '/campus/membresia', rolId: 'DEMO-L01', detectar: (estado) => (estado.campus?.matriculas ?? []).some((matricula) => !matriculasBase.has(matricula.id) && matricula.personaId === 'DEMO-L01') },
    ],
  },
  {
    id: 'F10', titulo: 'Estudio y evaluación automática', objetivo: 'El tema se estudia por componentes y la evaluación se califica sola de 0 a 20.',
    pasos: [
      { id: 'F10-1', texto: 'DEMO-L01 abre el tema 2: mira el video, lee la lectura (PDF) y completa el caso.', ruta: '/campus/temas/DEMO-TEM-002', rolId: 'DEMO-L01', detectar: (estado) => Boolean(estado.campus?.progreso['DEMO-L01|DEMO-TEM-002']?.caso) },
      { id: 'F10-2', texto: 'Rinde la evaluación: con 3 de 5 obtiene 12 y desaprueba (14 no basta).', ruta: '/campus/temas/DEMO-TEM-002', rolId: 'DEMO-L01', detectar: (estado) => (estado.campus?.intentos ?? []).some((intento) => intento.personaId === 'DEMO-L01' && intento.ambitoId === 'DEMO-TEM-002' && !intento.aprobado) },
      { id: 'F10-3', texto: 'En el segundo intento aprueba y se desbloquea el tema 3.', ruta: '/campus/programas/DEMO-CUR-01', rolId: 'DEMO-L01', detectar: (estado) => (estado.campus?.intentos ?? []).some((intento) => intento.personaId === 'DEMO-L01' && intento.ambitoId === 'DEMO-TEM-002' && intento.aprobado) },
    ],
  },
  {
    id: 'F11', titulo: 'Certificado con QR', objetivo: 'Al aprobar el curso se emite el certificado al instante y se verifica públicamente.',
    pasos: [
      { id: 'F11-1', texto: 'DEMO-L06 rinde el TIM del módulo 9 del Curso Ventas Digitales.', ruta: '/campus/tim/DEMO-TIM-09', rolId: 'DEMO-L06', detectar: (estado) => documentoNuevo(estado, 'DEMO-L06', 'certificado') },
      { id: 'F11-2', texto: 'En Mis certificados descarga el PDF (anverso con QR y reverso con módulos).', ruta: '/campus/certificados', rolId: 'DEMO-L06' },
      { id: 'F11-3', texto: 'Abre "Verificar": la página pública muestra el documento como válido.', ruta: '/verificar', rolId: null },
    ],
  },
  {
    id: 'F12', titulo: 'Certificado y efecto en el rango', objetivo: 'El conector LMS actualiza la formación del afiliado y su requisito de rango sin botón simulado.',
    pasos: [
      { id: 'F12-1', texto: 'DEMO-A01 aprueba el TIM del módulo 3 del Curso Liderazgo Comercial.', ruta: '/campus/tim/DEMO-TIM-03', rolId: 'DEMO-A01', detectar: (estado) => documentoNuevo(estado, 'DEMO-A01', 'certificado') },
      { id: 'F12-2', texto: 'En Mi formación el programa figura aprobado por el conector y en Mi RUN el requisito se cumple.', ruta: '/afiliado/run', rolId: 'DEMO-A01', detectar: (estado) => estado.formacion.some((item) => item.personaId === 'DEMO-A01' && item.estado === 'aprobado') },
      { id: 'F12-3', texto: 'En Integración ERICK, el registro de eventos del conector muestra curso aprobado y avance actualizado.', ruta: '/corporativo/integracion-erick', rolId: 'DEMO-U01' },
    ],
  },
  {
    id: 'F13', titulo: 'Sustentación MID', objetivo: 'La única calificación manual: evaluador asignado, rúbrica y constancia, sin cambiar el diploma.',
    pasos: [
      { id: 'F13-1', texto: 'DEMO-L03 (diploma emitido) solicita el MID con título, resumen y archivo.', ruta: '/campus/mid', rolId: 'DEMO-L03', detectar: (estado) => Boolean(sustentacionL03(estado)) },
      { id: 'F13-2', texto: 'La administradora educativa asigna a DEMO-U03 y la fecha.', ruta: '/erick/mid', rolId: 'DEMO-U04', detectar: (estado) => Boolean(sustentacionL03(estado)?.evaluadorId) },
      { id: 'F13-3', texto: 'El evaluador califica con la rúbrica y observaciones.', ruta: '/docente/sustentaciones', rolId: 'DEMO-U03', detectar: (estado) => ['aprobado', 'desaprobado'].includes(sustentacionL03(estado)?.estado ?? '') },
      { id: 'F13-4', texto: 'DEMO-L03 ve su constancia MID; su diploma sigue igual.', ruta: '/campus/certificados', rolId: 'DEMO-L03', detectar: (estado) => documentoNuevo(estado, 'DEMO-L03', 'constancia_mid') },
    ],
  },
  {
    id: 'F14', titulo: 'Docente agenda el examen final', objetivo: 'Una fecha creada por el docente llega al estudiante como notificación, en Mi calendario y en Próximas fechas.',
    pasos: [
      { id: 'F14-1', texto: 'DEMO-U03 agenda un "Examen final" para el Curso Liderazgo Comercial (DEMO-CUR-01) con el botón Agendar fecha.', ruta: '/docente/calendario', rolId: 'DEMO-U03', detectar: (estado) => accionDe(estado, 'Fecha agendada en el calendario', 'DEMO-U03') },
      { id: 'F14-2', texto: 'DEMO-L01 recibe la notificación (campana) y ve la fecha en Próximas fechas de Mis programas.', ruta: '/campus/programas', rolId: 'DEMO-L01' },
      { id: 'F14-3', texto: 'DEMO-L01 abre Mi calendario y encuentra el examen en la vista mensual y en Próximas.', ruta: '/campus/calendario', rolId: 'DEMO-L01' },
    ],
  },
  {
    id: 'F15', titulo: 'Docente sube una clase en video', objetivo: 'El docente reemplaza la clase de un tema con un archivo propio y el estudiante la reproduce.',
    pasos: [
      { id: 'F15-1', texto: 'DEMO-U03 abre Clases en video del Curso Liderazgo Comercial y sube un MP4 o WEBM al tema 1.2 "Estilos de liderazgo".', ruta: '/docente/cursos/DEMO-CUR-01/clases', rolId: 'DEMO-U03', detectar: (estado) => accionDe(estado, 'Clase en video actualizada', 'DEMO-U03', 'DEMO-TEM-002') },
      { id: 'F15-2', texto: 'DEMO-L01 abre el tema y reproduce la clase subida por su docente (el archivo tiene prioridad sobre YouTube).', ruta: '/campus/temas/DEMO-TEM-002', rolId: 'DEMO-L01' },
    ],
  },
  {
    id: 'F16', titulo: 'Administración asigna un docente', objetivo: 'El administrador educativo decide qué programas ve cada docente.',
    pasos: [
      { id: 'F16-1', texto: 'DEMO-U04 asigna a DEMO-U05 (Docente Ventas) el Curso Liderazgo Comercial en Docentes.', ruta: '/erick/docentes', rolId: 'DEMO-U04', detectar: (estado) => estado.bitacora.some((registro) => registro.accion === 'Docente asignado a programa' && registro.referenciaId === 'DEMO-CUR-01' && JSON.stringify(registro.despues).includes('DEMO-U05')) },
      { id: 'F16-2', texto: 'DEMO-U05 entra a Mis cursos y ya ve el Curso Liderazgo Comercial con su libreta de notas.', ruta: '/docente/cursos', rolId: 'DEMO-U05' },
    ],
  },
];
