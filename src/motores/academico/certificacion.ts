import type { DetalleDocumento, DocumentoAcademico, ResultadoNota, TipoDocumento } from '../../tipos/academico';
import { generadorAleatorio } from './calificacion';

export const prefijosDocumento: Record<TipoDocumento, string> = {
  certificado: 'ERK-CER', diploma: 'ERK-DIP', constancia_mid: 'ERK-MID',
};

const alfabetoVerificacion = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function claveDocumento(personaId: string, programaId: string, tipo: TipoDocumento): string {
  return `${personaId}|${programaId}|${tipo}`;
}

export function documentoVigente(documentos: DocumentoAcademico[], personaId: string, programaId: string, tipo: TipoDocumento): DocumentoAcademico | null {
  return documentos.find((documento) => documento.estado === 'emitido' && documento.personaId === personaId
    && documento.programaId === programaId && documento.tipo === tipo) ?? null;
}

export function codigoDocumento(tipo: TipoDocumento, anio: string, secuencia: number): string {
  return `${prefijosDocumento[tipo]}-${anio}-${String(secuencia).padStart(5, '0')}`;
}

export function siguienteSecuencia(documentos: DocumentoAcademico[], tipo: TipoDocumento, anio: string): number {
  const prefijo = `${prefijosDocumento[tipo]}-${anio}-`;
  const usadas = documentos
    .filter((documento) => documento.codigo.startsWith(prefijo))
    .map((documento) => Number(documento.codigo.slice(prefijo.length)) || 0);
  return (usadas.length === 0 ? 0 : Math.max(...usadas)) + 1;
}

export function codigoVerificacion(semilla: string, existentes: string[] = []): string {
  for (let intento = 0; intento < 50; intento += 1) {
    const aleatorio = generadorAleatorio(`${semilla}|${intento}`);
    let codigo = '';
    for (let indice = 0; indice < 8; indice += 1) codigo += alfabetoVerificacion[Math.floor(aleatorio() * alfabetoVerificacion.length)];
    if (!existentes.includes(codigo)) return codigo;
  }
  return `${semilla.length}`.padStart(8, 'X');
}

export function puedeEmitirCertificado(nota: ResultadoNota): boolean {
  return nota.estado === 'aprobado';
}

export function puedeEmitirDiploma(cursos: ResultadoNota[], tieneMatriculaDiplomado: boolean): boolean {
  return tieneMatriculaDiplomado && cursos.length >= 2 && cursos.every((curso) => curso.estado === 'aprobado');
}

export interface DatosEmision {
  tipo: TipoDocumento; personaId: string; programaId: string; nota: number; horas: number;
  fechaCulminacion: string; fechaEmision: string; detalle: DetalleDocumento[];
}

export interface ResultadoEmision { documento: DocumentoAcademico; nuevo: boolean }

export function emitirDocumento(documentos: DocumentoAcademico[], datos: DatosEmision, reemplazaA: string | null = null): ResultadoEmision {
  const existente = documentoVigente(documentos, datos.personaId, datos.programaId, datos.tipo);
  if (existente) return { documento: existente, nuevo: false };
  const anio = datos.fechaEmision.slice(0, 4);
  const codigo = codigoDocumento(datos.tipo, anio, siguienteSecuencia(documentos, datos.tipo, anio));
  const documento: DocumentoAcademico = {
    id: codigo, codigo,
    codigoVerificacion: codigoVerificacion(`${claveDocumento(datos.personaId, datos.programaId, datos.tipo)}|${codigo}`, documentos.map((item) => item.codigoVerificacion)),
    tipo: datos.tipo, personaId: datos.personaId, programaId: datos.programaId, nota: datos.nota, horas: datos.horas,
    fechaCulminacion: datos.fechaCulminacion, fechaEmision: datos.fechaEmision, detalle: datos.detalle,
    estado: 'emitido', motivoAnulacion: null, reemplazaA, reemplazadoPor: null,
  };
  return { documento, nuevo: true };
}

export function anularDocumento(documento: DocumentoAcademico, motivo: string, reemplazadoPor: string | null = null): DocumentoAcademico {
  return { ...documento, estado: 'anulado', motivoAnulacion: motivo, reemplazadoPor };
}

export function reemitirDocumento(documentos: DocumentoAcademico[], documento: DocumentoAcademico, motivo: string, fechaEmision: string): { anulado: DocumentoAcademico; nuevo: DocumentoAcademico } {
  const sinOriginal = documentos.map((item) => (item.id === documento.id ? anularDocumento(item, motivo) : item));
  const { documento: nuevo } = emitirDocumento(sinOriginal, {
    tipo: documento.tipo, personaId: documento.personaId, programaId: documento.programaId, nota: documento.nota,
    horas: documento.horas, fechaCulminacion: documento.fechaCulminacion, fechaEmision, detalle: documento.detalle,
  }, documento.id);
  return { anulado: anularDocumento(documento, motivo, nuevo.id), nuevo };
}

export type EstadoVerificacion = 'valido' | 'anulado' | 'inexistente';

export function verificarCodigo(documentos: DocumentoAcademico[], codigo: string): { estado: EstadoVerificacion; documento: DocumentoAcademico | null } {
  const buscado = codigo.trim().toUpperCase();
  const documento = documentos.find((item) => item.codigo === buscado || item.codigoVerificacion === buscado) ?? null;
  if (!documento) return { estado: 'inexistente', documento: null };
  return { estado: documento.estado === 'emitido' ? 'valido' : 'anulado', documento };
}
