import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CircleAlert, CircleCheck, CircleX, Search, ShieldCheck } from 'lucide-react';
import { Boton } from '../../componentes/ui/Boton';
import { Campo } from '../../componentes/ui/Campo';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { nombresDocumento, verificar } from '../../servicios/certificados';
import { useAcademicoStore } from '../../store/useAcademicoStore';
import { useCampusStore } from '../../store/useCampusStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import { unirClases } from '../../utilidades/clases';
import { formatearFecha } from '../../utilidades/fechas';
import { formatearNumero } from '../../utilidades/formatos';
import { useTemaErick } from '../../hooks/useTemaErick';

function enmascarar(texto: string): string {
  return texto.length <= 4 ? '****' : `${'*'.repeat(texto.length - 4)}${texto.slice(-4)}`;
}

export default function VerificarDocumento() {
  useTemaErick();
  const { codigo } = useParams();
  const navegar = useNavigate();
  const [texto, setTexto] = useState(codigo ?? '');
  useCampusStore((estado) => estado.documentos);
  const personas = usePersonasStore((estado) => estado.personas);
  const programas = useAcademicoStore((estado) => estado.programas);
  const resultado = codigo ? verificar(codigo) : null;
  const documento = resultado?.documento ?? null;
  const persona = documento ? personas.find((item) => item.id === documento.personaId) : null;
  const programa = documento ? programas.find((item) => item.id === documento.programaId) : null;
  const vistas = {
    valido: { icono: CircleCheck, titulo: 'Documento válido', clase: 'border-green-300 bg-green-50 text-[#166534]', texto: 'El documento fue emitido por ERICK S.A.C. y se encuentra vigente.' },
    anulado: { icono: CircleX, titulo: 'Documento anulado', clase: 'border-red-300 bg-red-50 text-[#991B1B]', texto: 'El documento existió, pero fue anulado y ya no tiene validez.' },
    inexistente: { icono: CircleAlert, titulo: 'Código no encontrado', clase: 'border-amber-300 bg-amber-50 text-[#92400E]', texto: 'No existe ningún documento con ese código. Revisa que esté bien escrito.' },
  };
  const vista = resultado ? vistas[resultado.estado] : null;
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-acento">Campus ERICK · ERICK S.A.C.</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-texto sm:text-[28px]">Verificación de certificados y diplomas</h2>
        <p className="mt-1 text-[13.5px] text-texto-2">Ingresa el código del documento (por ejemplo ERK-CER-2026-00001) o el código de verificación de 8 caracteres, o escanea el QR.</p>
      </div>
      <Tarjeta>
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={(evento) => { evento.preventDefault(); if (texto.trim()) navegar(`/verificar/${texto.trim().toUpperCase()}`); }}>
          <Campo etiqueta="Código del documento" icono={Search} value={texto} onChange={(evento) => setTexto(evento.target.value)} className="flex-1" autoComplete="off" />
          <Boton type="submit" icono={ShieldCheck}>Verificar</Boton>
        </form>
      </Tarjeta>
      {vista && resultado && (
        <section className={unirClases('rounded-tarjeta border-2 p-5', vista.clase)} aria-live="polite">
          <div className="flex items-start gap-3">
            <vista.icono className="size-8 shrink-0" aria-hidden />
            <div className="min-w-0">
              <h3 className="text-xl font-extrabold">{vista.titulo}</h3>
              <p className="text-[13.5px]">{vista.texto}</p>
            </div>
          </div>
          {documento && (
            <dl className="mt-4 grid gap-3 rounded-xl bg-white/70 p-4 text-[13.5px] text-texto sm:grid-cols-2">
              <div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Documento</dt><dd className="font-semibold">{nombresDocumento[documento.tipo]} · <span className="cifra">{documento.codigo}</span></dd></div>
              <div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Estudiante</dt><dd className="font-semibold">{persona ? `${persona.nombres} ${persona.apellidos}` : '-'}</dd><dd className="cifra text-xs text-texto-2">Documento de identidad {persona ? enmascarar(persona.documento) : '-'}</dd></div>
              <div className="sm:col-span-2"><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Programa</dt><dd className="font-semibold">{programa?.nombre ?? documento.programaId}</dd></div>
              <div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Horas y nota</dt><dd className="cifra">{documento.horas} h · {formatearNumero(documento.nota, 2)} / 20</dd></div>
              <div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Emisión</dt><dd className="cifra">{formatearFecha(documento.fechaEmision)}</dd></div>
              {documento.estado === 'anulado' && <div className="sm:col-span-2"><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Motivo de anulación</dt><dd>{documento.motivoAnulacion}{documento.reemplazadoPor ? ` Documento vigente: ${documento.reemplazadoPor}.` : ''}</dd></div>}
            </dl>
          )}
        </section>
      )}
      <p className="text-center text-xs text-texto-3">Verificación de DEMOSTRACIÓN: los documentos y códigos son ficticios.</p>
    </div>
  );
}
