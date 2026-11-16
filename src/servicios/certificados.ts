import { relativoHoy } from '../datos/academico/fechasCampus';
import { anularDocumento as anularPuro, documentoVigente, emitirDocumento, reemitirDocumento, verificarCodigo } from '../motores/academico/certificacion';
import { resumirPrograma } from '../motores/academico/progreso';
import { useAcademicoStore } from '../store/useAcademicoStore';
import { useCampusStore } from '../store/useCampusStore';
import type { DocumentoAcademico } from '../tipos/academico';
import { exito, fallo, type Resultado } from '../validaciones/resultado';
import { fechaActualLocal, registrarEventoLms } from './eventosLms';
import { notificar, registrarBitacora } from './registro';

export const nombresDocumento: Record<DocumentoAcademico['tipo'], string> = {
  certificado: 'Certificado', diploma: 'Diploma', constancia_mid: 'Constancia MID',
};

function guardar(documento: DocumentoAcademico): void {
  const { documentos, actualizar } = useCampusStore.getState();
  actualizar({ documentos: [...documentos, documento] });
}

export function emitirPendientes(personaId: string, actorId = 'DEMO-CON-LMS'): DocumentoAcademico[] {
  const { programas, modulos } = useAcademicoStore.getState();
  const nuevos: DocumentoAcademico[] = [];
  const registro = () => {
    const { matriculas, progreso, intentos } = useCampusStore.getState();
    return { matriculas, progreso, intentos };
  };
  const emitir = (datos: Parameters<typeof emitirDocumento>[1], programaNombre: string) => {
    const { documento, nuevo } = emitirDocumento(useCampusStore.getState().documentos, datos);
    if (!nuevo) return;
    guardar(documento);
    nuevos.push(documento);
    registrarEventoLms(documento.tipo === 'diploma' ? 'diploma_emitido' : 'curso_aprobado', personaId, documento.programaId,
      { documento: documento.codigo, nota: documento.nota, horas: documento.horas }, `${nombresDocumento[documento.tipo]} ${documento.codigo} emitido`);
    registrarBitacora({ actorId, accion: `${nombresDocumento[documento.tipo]} emitido`, modulo: 'certificados', referenciaId: documento.codigo, despues: { persona: personaId, programa: documento.programaId, nota: documento.nota } });
    notificar({ personaId, tipo: 'estado', titulo: `${nombresDocumento[documento.tipo]} disponible`, mensaje: `Aprobaste ${programaNombre} con ${documento.nota.toFixed(2)}. Tu ${nombresDocumento[documento.tipo].toLowerCase()} ${documento.codigo} ya se puede descargar.` });
  };
  programas.filter((programa) => programa.tipo === 'curso').forEach((curso) => {
    if (documentoVigente(useCampusStore.getState().documentos, personaId, curso.id, 'certificado')) return;
    const resumen = resumirPrograma(personaId, curso.id, { programas, modulos }, registro());
    if (!resumen || resumen.nota.estado !== 'aprobado' || resumen.nota.nota === null) return;
    const ahora = fechaActualLocal();
    emitir({
      tipo: 'certificado', personaId, programaId: curso.id, nota: resumen.nota.nota, horas: curso.horas,
      fechaCulminacion: (resumen.fechaCulminacion ?? ahora).slice(0, 10), fechaEmision: ahora,
      detalle: resumen.cursos[0].modulos.map((modulo) => ({ nombre: modulo.modulo.nombre, horas: modulo.modulo.horas, nota: modulo.nota.nota ?? 0 })),
    }, curso.nombre);
  });
  const matriculas = useCampusStore.getState().matriculas.filter((matricula) => matricula.personaId === personaId);
  programas.filter((programa) => programa.tipo === 'diplomado' && matriculas.some((matricula) => matricula.programaId === programa.id)).forEach((diplomado) => {
    if (documentoVigente(useCampusStore.getState().documentos, personaId, diplomado.id, 'diploma')) return;
    const resumen = resumirPrograma(personaId, diplomado.id, { programas, modulos }, registro());
    if (!resumen || resumen.nota.estado !== 'aprobado' || resumen.nota.nota === null) return;
    const ahora = fechaActualLocal();
    emitir({
      tipo: 'diploma', personaId, programaId: diplomado.id, nota: resumen.nota.nota, horas: diplomado.horas,
      fechaCulminacion: (resumen.fechaCulminacion ?? ahora).slice(0, 10), fechaEmision: ahora,
      detalle: resumen.cursos.flatMap((curso) => curso.modulos.map((modulo) => ({ nombre: modulo.modulo.nombre, horas: modulo.modulo.horas, nota: modulo.nota.nota ?? 0 }))),
    }, diplomado.nombre);
  });
  return nuevos;
}

export function emitirConstanciaMid(personaId: string, programaId: string, nota: number, actorId: string): DocumentoAcademico | null {
  const programa = useAcademicoStore.getState().programas.find((item) => item.id === programaId);
  if (!programa) return null;
  const ahora = fechaActualLocal();
  const { documento, nuevo } = emitirDocumento(useCampusStore.getState().documentos, {
    tipo: 'constancia_mid', personaId, programaId, nota, horas: programa.horas, fechaCulminacion: ahora.slice(0, 10), fechaEmision: ahora,
    detalle: [{ nombre: 'Sustentación del trabajo de investigación', horas: programa.horas, nota }],
  });
  if (!nuevo) return documento;
  guardar(documento);
  registrarBitacora({ actorId, accion: 'Constancia MID emitida', modulo: 'certificados', referenciaId: documento.codigo, despues: { persona: personaId, nota } });
  notificar({ personaId, tipo: 'estado', titulo: 'Constancia MID disponible', mensaje: `Tu constancia ${documento.codigo} ya se puede descargar.` });
  return documento;
}

function validarMotivo(motivo: string): string | null {
  return motivo.trim().length < 10 ? 'El motivo debe tener al menos 10 caracteres.' : null;
}

export function anularDocumento(documentoId: string, motivo: string, actorId: string): Resultado<DocumentoAcademico> {
  const error = validarMotivo(motivo);
  if (error) return fallo(error);
  const { documentos, actualizar } = useCampusStore.getState();
  const documento = documentos.find((item) => item.id === documentoId);
  if (!documento) return fallo('Documento no encontrado.');
  if (documento.estado === 'anulado') return fallo('El documento ya está anulado.');
  const anulado = anularPuro(documento, motivo.trim());
  actualizar({ documentos: documentos.map((item) => (item.id === documentoId ? anulado : item)) });
  registrarEventoLms('certificado_anulado', documento.personaId, documento.programaId, { documento: documento.codigo }, motivo.trim());
  registrarBitacora({ actorId, accion: 'Documento anulado', modulo: 'certificados', motivo: motivo.trim(), referenciaId: documento.codigo, antes: 'emitido', despues: 'anulado' });
  notificar({ personaId: documento.personaId, tipo: 'estado', titulo: 'Documento anulado', mensaje: `${nombresDocumento[documento.tipo]} ${documento.codigo} fue anulado: ${motivo.trim()}` });
  return exito(anulado);
}

export function reemitir(documentoId: string, motivo: string, actorId: string): Resultado<DocumentoAcademico> {
  const error = validarMotivo(motivo);
  if (error) return fallo(error);
  const { documentos, actualizar } = useCampusStore.getState();
  const documento = documentos.find((item) => item.id === documentoId);
  if (!documento) return fallo('Documento no encontrado.');
  if (documento.estado === 'anulado') return fallo('Solo se reemite un documento vigente.');
  const { anulado, nuevo } = reemitirDocumento(documentos, documento, motivo.trim(), fechaActualLocal());
  actualizar({ documentos: [...documentos.map((item) => (item.id === documentoId ? anulado : item)), nuevo] });
  registrarEventoLms('certificado_anulado', documento.personaId, documento.programaId, { documento: documento.codigo, reemplazadoPor: nuevo.codigo }, `Reemisión: ${motivo.trim()}`);
  registrarBitacora({ actorId, accion: 'Documento reemitido', modulo: 'certificados', motivo: motivo.trim(), referenciaId: nuevo.codigo, antes: documento.codigo, despues: nuevo.codigo });
  notificar({ personaId: documento.personaId, tipo: 'estado', titulo: 'Documento reemitido', mensaje: `Tu ${nombresDocumento[documento.tipo].toLowerCase()} se reemitió con el código ${nuevo.codigo}.` });
  return exito(nuevo);
}

export function verificar(codigo: string) {
  return verificarCodigo(useCampusStore.getState().documentos, codigo);
}

export function fechaHoyCampus(): string {
  return relativoHoy(0);
}
