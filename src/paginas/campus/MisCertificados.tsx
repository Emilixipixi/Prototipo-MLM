import { useState } from 'react';
import { Award, Copy, Download, ExternalLink, FileBadge, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VistaPreviaCertificado } from '../../componentes/campus/VistaPreviaCertificado';
import { Boton } from '../../componentes/ui/Boton';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { EstadoVacio } from '../../componentes/ui/EstadoVacio';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { useToast } from '../../componentes/ui/useToast';
import { nombresDocumento } from '../../servicios/certificados';
import { descargarPdfDocumento, urlVerificacion } from '../../servicios/pdfCertificados';
import { useAcademicoStore } from '../../store/useAcademicoStore';
import { useCampusStore } from '../../store/useCampusStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { DocumentoAcademico } from '../../tipos/academico';
import { unirClases } from '../../utilidades/clases';
import { formatearFecha } from '../../utilidades/fechas';
import { formatearNumero } from '../../utilidades/formatos';

export default function MisCertificados() {
  const persona = usePersonaSesion();
  const todos = useCampusStore((estado) => estado.documentos);
  const programas = useAcademicoStore((estado) => estado.programas);
  const toast = useToast();
  const documentos = todos.filter((documento) => documento.personaId === persona?.id).sort((a, b) => b.fechaEmision.localeCompare(a.fechaEmision));
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [descargando, setDescargando] = useState<string | null>(null);
  if (!persona) return null;
  if (documentos.length === 0) {
    return <Tarjeta><EstadoVacio icono={FileBadge} titulo="Aún no tienes certificados" texto="Al aprobar un curso se emite tu certificado al instante; al aprobar los dos cursos de un diplomado, tu diploma." accion={<EnlaceBoton to="/campus/programas">Mis programas</EnlaceBoton>} /></Tarjeta>;
  }
  const activo = documentos.find((documento) => documento.id === seleccion) ?? documentos.find((documento) => documento.estado === 'emitido') ?? documentos[0];
  const programaDe = (documento: DocumentoAcademico) => programas.find((programa) => programa.id === documento.programaId);
  const descargar = async (documento: DocumentoAcademico) => {
    const programa = programaDe(documento);
    if (!programa) return;
    setDescargando(documento.id);
    try {
      await descargarPdfDocumento({ documento, persona, programa });
      toast.exito('PDF generado', `${documento.codigo}.pdf`);
    } catch {
      toast.error('No se pudo generar el PDF', 'Intenta nuevamente.');
    } finally {
      setDescargando(null);
    }
  };
  const copiar = async (documento: DocumentoAcademico) => {
    try {
      await navigator.clipboard.writeText(urlVerificacion(documento.codigo));
      toast.info('Enlace copiado', urlVerificacion(documento.codigo));
    } catch {
      toast.info('Enlace de verificación', urlVerificacion(documento.codigo));
    }
  };
  const programaActivo = programaDe(activo);

  return (
    <div className="flex flex-col gap-5">
      <p className="flex items-start gap-2 rounded-xl bg-oro-suave px-3 py-2.5 text-[12.5px] text-[#7C4A03]"><Info className="mt-0.5 size-4 shrink-0" aria-hidden />Tus documentos se conservan siempre, incluso si tu acceso venció. Cada uno tiene un código único y un QR para verificar su autenticidad.</p>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <ul className="flex flex-col gap-3">
          {documentos.map((documento) => {
            const programa = programaDe(documento);
            return (
              <li key={documento.id}>
                <div className={unirClases('flex flex-col gap-3 rounded-tarjeta border bg-superficie p-4 shadow-tarjeta', documento.id === activo.id ? 'border-acento ring-2 ring-acento-suave' : 'border-borde')}>
                  <button type="button" onClick={() => setSeleccion(documento.id)} className="flex min-h-11 items-start gap-3 text-left">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-oro-suave text-oro"><Award className="size-5" aria-hidden /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">{nombresDocumento[documento.tipo]} · {documento.horas} h</span>
                      <span className="block font-semibold text-texto">{programa?.nombre ?? documento.programaId}</span>
                      <span className="cifra block text-xs text-texto-2">{documento.codigo} · {formatearFecha(documento.fechaEmision)} · nota {formatearNumero(documento.nota, 2)}</span>
                    </span>
                    <Insignia tono={documento.estado === 'emitido' ? 'exito' : 'error'}>{documento.estado === 'emitido' ? 'Vigente' : 'Anulado'}</Insignia>
                  </button>
                  {documento.estado === 'anulado' && <p className="text-xs text-error">Motivo: {documento.motivoAnulacion}{documento.reemplazadoPor ? ` Reemplazado por ${documento.reemplazadoPor}.` : ''}</p>}
                  <div className="flex flex-wrap gap-2">
                    <Boton tamano="sm" icono={Download} cargando={descargando === documento.id} onClick={() => { void descargar(documento); }}>Descargar PDF</Boton>
                    <Boton tamano="sm" variante="secundario" icono={Copy} onClick={() => { void copiar(documento); }}>Copiar enlace</Boton>
                    <Link to={`/verificar/${documento.codigo}`} target="_blank" className="inline-flex min-h-11 items-center gap-1 px-2 text-[13px] font-semibold text-acento md:min-h-9"><ExternalLink className="size-4" aria-hidden />Verificar</Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {programaActivo && (
          <Tarjeta titulo="Vista previa" subtitulo="Anverso del documento. El PDF incluye el reverso con la relación de módulos, horas y notas." icono={FileBadge} className="xl:sticky xl:top-32 xl:self-start">
            <VistaPreviaCertificado documento={activo} persona={persona} programa={programaActivo} />
            <ul className="mt-4 grid gap-1.5 text-[12.5px] sm:grid-cols-2">
              {activo.detalle.map((fila) => <li key={fila.nombre} className="flex justify-between gap-2 rounded-lg bg-fondo px-2.5 py-1.5"><span className="min-w-0 truncate">{fila.nombre}</span><span className="cifra shrink-0">{fila.horas} h · {formatearNumero(fila.nota, 2)}</span></li>)}
            </ul>
          </Tarjeta>
        )}
      </div>
    </div>
  );
}
