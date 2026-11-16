import { firmasInstitucionales } from '../../datos/academico/firmas';
import { titulosDocumento, urlVerificacion } from '../../servicios/pdfCertificados';
import type { DocumentoAcademico, Programa } from '../../tipos/academico';
import type { Persona } from '../../tipos/persona';
import { formatearFecha } from '../../utilidades/fechas';
import { QrCodigo } from './QrCodigo';

const frases: Record<DocumentoAcademico['tipo'], string> = {
  certificado: 'por haber aprobado el curso', diploma: 'por haber aprobado el diplomado', constancia_mid: 'por haber aprobado la sustentación del',
};

export function VistaPreviaCertificado({ documento, persona, programa }: { documento: DocumentoAcademico; persona: Persona; programa: Programa }) {
  return (
    <div className="@container w-full">
      <div className="relative aspect-[297/210] w-full overflow-hidden rounded-xl border-[6px] border-[#0E3B4A] bg-white text-[#0F172A] shadow-tarjeta">
        <div className="absolute inset-[1.5%] rounded-md border border-[#B8862B]" aria-hidden />
        <div className="absolute inset-0 flex flex-col px-[6%] py-[4.5%]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-[1.2cqw]">
              <span className="grid aspect-square w-[4cqw] place-items-center rounded bg-[#0E3B4A] font-bold text-[#E2C46E]" style={{ fontSize: '2cqw' }}>E</span>
              <div className="leading-tight">
                <p className="font-extrabold text-[#0E3B4A]" style={{ fontSize: '2.1cqw' }}>ERICK S.A.C.</p>
                <p className="text-slate-500" style={{ fontSize: '1.3cqw' }}>Campus ERICK - Educación continua</p>
              </div>
            </div>
            <p className="font-semibold text-red-700" style={{ fontSize: '1.2cqw' }}>DEMOSTRACIÓN</p>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="font-extrabold tracking-[0.12em] text-[#B8862B]" style={{ fontSize: '5cqw' }}>{titulosDocumento[documento.tipo]}</p>
            <p className="text-slate-500" style={{ fontSize: '1.6cqw' }}>Se otorga a</p>
            <p className="font-extrabold" style={{ fontSize: '3.4cqw' }}>{persona.nombres} {persona.apellidos}</p>
            <p className="text-slate-500" style={{ fontSize: '1.1cqw' }}>Documento de identidad: {persona.documento}</p>
            <p className="text-slate-500" style={{ fontSize: '1.6cqw' }}>{frases[documento.tipo]}</p>
            <p className="font-bold text-[#0E3B4A]" style={{ fontSize: '2.4cqw' }}>{programa.nombre}</p>
            <p className="mt-[0.6cqw]" style={{ fontSize: '1.5cqw' }}>{documento.horas} horas académicas · {programa.modalidad} · nota final {documento.nota.toFixed(2).replace('.', ',')} / 20</p>
            <p className="text-slate-500" style={{ fontSize: '1.3cqw' }}>Culminación {formatearFecha(documento.fechaCulminacion)} · Emisión {formatearFecha(documento.fechaEmision)}</p>
          </div>
          <div className="flex items-end justify-between gap-[2cqw]">
            <div className="leading-tight" style={{ fontSize: '1.2cqw' }}>
              <p className="font-bold">Código: {documento.codigo}</p>
              <p>Verificación: {documento.codigoVerificacion}</p>
            </div>
            {firmasInstitucionales.map((firma) => (
              <div key={firma.nombre} className="hidden flex-1 border-t border-slate-700 pt-[0.4cqw] text-center leading-tight @[420px]:block" style={{ fontSize: '1.1cqw' }}>
                <p className="font-bold">{firma.nombre}</p><p className="text-slate-500">{firma.cargo}</p>
              </div>
            ))}
            <div className="w-[11cqw] shrink-0"><QrCodigo texto={urlVerificacion(documento.codigo)} tamano={160} etiqueta={`Código QR de verificación de ${documento.codigo}`} /></div>
          </div>
        </div>
        {documento.estado === 'anulado' && (
          <span className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="rotate-[-18deg] rounded-lg border-4 border-red-600 px-[3cqw] font-extrabold text-red-600/80" style={{ fontSize: '7cqw' }}>ANULADO</span>
          </span>
        )}
      </div>
    </div>
  );
}
