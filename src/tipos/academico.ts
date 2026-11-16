export type TipoPrograma = 'curso' | 'diplomado' | 'mid';
export type EstadoPrograma = 'borrador' | 'publicado' | 'archivado';
export type ModoDesbloqueo = 'aprobar_para_avanzar' | 'libre';
export type PoliticaNota = 'mejor' | 'ultimo' | 'promedio';

export interface ReglasPrograma {
  intentosMaximos: number; esperaMinutos: number; politicaNota: PoliticaNota;
  minutosEvaluacion: number; preguntasPorEvaluacion: number; mostrarRespuestas: boolean;
  modoDesbloqueo: ModoDesbloqueo; mesesAcceso: number;
}

export interface Programa {
  id: string; codigo: string; tipo: TipoPrograma; nombre: string; descripcion: string;
  horas: number; modalidad: 'Virtual asincrónica'; estado: EstadoPrograma;
  productoId: string | null; cursoIds: string[]; moduloIds: string[]; midId: string | null;
  incluidoEnMembresia: boolean; reglas: ReglasPrograma; portada?: string;
  colores: [string, string]; creadoPor: string; fecha: string;
}

export interface Modulo {
  id: string; programaId: string; orden: number; nombre: string; horas: number;
  temaIds: string[]; timId: string;
}

export interface ContenidoVideo { titulo: string; minutos: number; portada?: string; urlVideo?: string }
export interface ContenidoLectura { titulo: string; contenido: string; minutos: number; descargable: boolean }
export interface ContenidoCaso { enunciado: string; ejercicios: Array<{ pregunta: string; respuestaGuia: string }>; minutos: number }

export interface Tema {
  id: string; moduloId: string; orden: number; nombre: string; horas: number; objetivos: string[];
  video: ContenidoVideo; lectura: ContenidoLectura; caso: ContenidoCaso; evaluacionMinutos: number;
}

export interface Tim { id: string; moduloId: string; nombre: string; horas: number; instrucciones: string; preguntaIds: string[] }

export type TipoPregunta = 'opcion_multiple' | 'seleccion_multiple' | 'verdadero_falso' | 'emparejar' | 'ordenar' | 'numerica';
export type AmbitoEvaluacion = 'tema' | 'tim';

export interface Pregunta {
  id: string; ambito: AmbitoEvaluacion; ambitoId: string; tipo: TipoPregunta; enunciado: string;
  opciones: string[]; correctas: number[]; pares?: Array<[string, string]>; orden?: string[];
  valorNumerico?: number; tolerancia?: number; explicacion?: string; activa: boolean;
}

export type Respuesta = number | number[] | null;

export interface PlanMembresia { id: string; nombre: string; meses: 1 | 2 | 3 | 6 | 9 | 12; productoId: string; activo: boolean }

export type EstadoMatricula = 'activa' | 'por_vencer' | 'vencida' | 'suspendida';
export type OrigenMatricula = 'compra' | 'membresia' | 'manual';

export interface MovimientoMatricula { fecha: string; actorId: string; accion: string; motivo?: string }

export interface Matricula {
  id: string; personaId: string; programaId: string; origen: OrigenMatricula; pedidoId: string | null;
  membresiaId: string | null; inicio: string; vencimiento: string; suspendida: boolean;
  intentosExtra: Record<string, number>; historial: MovimientoMatricula[];
}

export interface Membresia {
  id: string; personaId: string; planId: string; pedidoIds: string[];
  inicio: string; vencimiento: string; suspendida: boolean;
}

export interface ProgresoComponente { video: boolean; lectura: boolean; caso: boolean }

export interface IntentoEvaluacion {
  id: string; personaId: string; ambito: AmbitoEvaluacion; ambitoId: string; matriculaId: string;
  preguntaIds: string[]; respuestas: Record<string, Respuesta>; nota: number; aprobado: boolean;
  inicio: string; fin: string;
}

export type TipoDocumento = 'certificado' | 'diploma' | 'constancia_mid';

export interface DetalleDocumento { nombre: string; horas: number; nota: number }

export interface DocumentoAcademico {
  id: string; codigo: string; codigoVerificacion: string; tipo: TipoDocumento;
  personaId: string; programaId: string; nota: number; horas: number;
  fechaCulminacion: string; fechaEmision: string; detalle: DetalleDocumento[];
  estado: 'emitido' | 'anulado'; motivoAnulacion: string | null; reemplazaA: string | null; reemplazadoPor: string | null;
}

export type EstadoMid = 'solicitado' | 'asignado' | 'sustentado' | 'aprobado' | 'desaprobado';

export interface CriterioRubrica { criterio: string; peso: number; nota: number | null }

export interface SustentacionMid {
  id: string; personaId: string; programaId: string; titulo: string; resumen: string; archivo: string;
  fechaPropuesta: string; evaluadorId: string | null; fechaAsignada: string | null;
  rubrica: CriterioRubrica[]; notaFinal: number | null; observaciones: string | null; estado: EstadoMid;
}

export type TipoEventoLms = 'matricula_creada' | 'avance_actualizado' | 'curso_aprobado' | 'diploma_emitido'
  | 'certificado_anulado' | 'acceso_vencido' | 'mid_aprobado'
  | 'acceso_suspendido' | 'membresia_activada';

export interface EventoIntegracion {
  id: string; tipo: TipoEventoLms; personaId: string; programaId: string | null; fecha: string;
  carga: Record<string, string | number | boolean | null>; estado: 'enviado' | 'procesado' | 'error'; detalle: string;
}

export type EstadoElemento = 'bloqueado' | 'disponible' | 'en_curso' | 'aprobado' | 'desaprobado' | 'bloqueado_por_intentos';
export type EstadoNota = 'pendiente' | 'aprobado' | 'desaprobado';

export interface ResultadoNota { nota: number | null; estado: EstadoNota }

export type TipoEventoCalendario = 'examen_final' | 'clase_en_vivo' | 'entrega' | 'sustentacion' | 'recordatorio';

export interface EventoCalendario {
  id: string; programaId: string; tipo: TipoEventoCalendario; titulo: string; descripcion: string;
  fecha: string; horaInicio: string; horaFin: string | null; enlace: string | null;
  creadoPor: string; estado: 'programado' | 'cancelado'; actualizado: string;
}

export interface AsignacionDocente { id: string; docenteId: string; programaId: string; desde: string; activa: boolean }

export interface ObservacionDocente { id: string; docenteId: string; personaId: string; programaId: string; fecha: string; texto: string }

export interface ConfiguracionErick {
  razonSocial: string; ruc: string; direccion: string; correoContacto: string; telefono: string;
  textoCertificado: string; mesesAccesoPorDefecto: number; intentosPorDefecto: number;
}

export interface ContenidoVideo { archivoVideoId?: string; nombreArchivo?: string }
