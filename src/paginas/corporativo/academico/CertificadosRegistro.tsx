import { useState } from 'react';
import { Ban, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarraExportar } from '../../../componentes/ui/BarraExportar';
import { Boton } from '../../../componentes/ui/Boton';
import { ChipsFiltro } from '../../../componentes/ui/ChipsFiltro';
import { Confirmacion } from '../../../componentes/ui/Confirmacion';
import { Insignia } from '../../../componentes/ui/Insignia';
import { Tabla, type ColumnaTabla } from '../../../componentes/ui/Tabla';
import { useToast } from '../../../componentes/ui/useToast';
import { useDatosAcademicos } from '../../../hooks/useDatosAcademicos';
import { usePermiso } from '../../../hooks/usePermiso';
import { anularDocumento, nombresDocumento, reemitir } from '../../../servicios/certificados';
import { descargarPdfDocumento } from '../../../servicios/pdfCertificados';
import { usePersonaSesion } from '../../../store/useSesionStore';
import type { DocumentoAcademico } from '../../../tipos/academico';
import { formatearFecha } from '../../../utilidades/fechas';
import { formatearNumero } from '../../../utilidades/formatos';

type Filtro = 'todos' | 'emitido' | 'anulado';

export default function CertificadosRegistro() {
  const datos = useDatosAcademicos();
  const persona = usePersonaSesion();
  const toast = useToast();
  const puedeEditar = usePermiso('certificados', 'editar');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [accion, setAccion] = useState<{ tipo: 'anular' | 'reemitir'; documento: DocumentoAcademico } | null>(null);
  const filas = [...datos.campus.documentos].filter((documento) => filtro === 'todos' || documento.estado === filtro).sort((a, b) => b.fechaEmision.localeCompare(a.fechaEmision));
  const descargar = async (documento: DocumentoAcademico) => {
    const titular = datos.personas.find((item) => item.id === documento.personaId);
    const programa = datos.academico.programas.find((item) => item.id === documento.programaId);
    if (titular && programa) await descargarPdfDocumento({ documento, persona: titular, programa });
  };
  const columnas: ColumnaTabla<DocumentoAcademico>[] = [
    { clave: 'codigo', titulo: 'Código', render: (fila) => <span className="cifra text-xs">{fila.codigo}<span className="block text-texto-3">{fila.codigoVerificacion}</span></span>, valorOrden: (fila) => fila.codigo },
    { clave: 'tipo', titulo: 'Tipo', render: (fila) => nombresDocumento[fila.tipo] },
    { clave: 'persona', titulo: 'Estudiante', principalEnMovil: true, render: (fila) => datos.nombrePersona(fila.personaId), valorOrden: (fila) => datos.nombrePersona(fila.personaId) },
    { clave: 'programa', titulo: 'Programa', render: (fila) => datos.nombrePrograma(fila.programaId) },
    { clave: 'nota', titulo: 'Nota', alinear: 'derecha', render: (fila) => <span className="cifra">{formatearNumero(fila.nota, 2)}</span> },
    { clave: 'fecha', titulo: 'Emisión', render: (fila) => <span className="cifra">{formatearFecha(fila.fechaEmision)}</span>, valorOrden: (fila) => fila.fechaEmision },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <span><Insignia tono={fila.estado === 'emitido' ? 'exito' : 'error'}>{fila.estado === 'emitido' ? 'Vigente' : 'Anulado'}</Insignia>{fila.reemplazaA && <span className="block text-[11px] text-texto-3">Reemplaza {fila.reemplazaA}</span>}</span> },
  ];
  return (
    <div className="flex flex-col gap-5">
      <Tabla columnas={columnas} filas={filas} claveFila={(fila) => fila.id} textoBusqueda={(fila) => `${fila.codigo} ${fila.codigoVerificacion} ${datos.nombrePersona(fila.personaId)} ${datos.nombrePrograma(fila.programaId)}`} placeholderBusqueda="Buscar código, estudiante o programa"
        filtros={<ChipsFiltro etiqueta="Estado" activo={filtro} alCambiar={setFiltro} opciones={[{ valor: 'todos', texto: 'Todos' }, { valor: 'emitido', texto: 'Vigentes' }, { valor: 'anulado', texto: 'Anulados' }]} />}
        accionesCabecera={<BarraExportar modulo="certificados" nombreArchivo="certificados_campus" filas={() => filas.map((fila) => ({ codigo: fila.codigo, verificacion: fila.codigoVerificacion, tipo: fila.tipo, persona: fila.personaId, programa: fila.programaId, nota: fila.nota, horas: fila.horas, emision: fila.fechaEmision, estado: fila.estado, motivo: fila.motivoAnulacion }))} />}
        accionesFila={(fila) => (
          <div className="flex flex-wrap justify-end gap-1.5">
            <Boton tamano="sm" variante="fantasma" icono={Download} onClick={() => { void descargar(fila); }}>PDF</Boton>
            <Link to={`/verificar/${fila.codigo}`} target="_blank" className="inline-flex min-h-11 items-center gap-1 px-2 text-[13px] font-semibold text-acento md:min-h-9"><ExternalLink className="size-4" aria-hidden />Verificar</Link>
            {puedeEditar && fila.estado === 'emitido' && <>
              <Boton tamano="sm" variante="fantasma" icono={RefreshCw} onClick={() => setAccion({ tipo: 'reemitir', documento: fila })}>Reemitir</Boton>
              <Boton tamano="sm" variante="fantasma" icono={Ban} onClick={() => setAccion({ tipo: 'anular', documento: fila })}>Anular</Boton>
            </>}
          </div>
        )}
      />
      <p className="text-xs text-texto-2">Los documentos nunca se borran: se anulan con motivo y, si corresponde, se reemiten con un código nuevo enlazado al anterior.</p>
      <Confirmacion abierto={Boolean(accion)} alCerrar={() => setAccion(null)} requiereMotivo peligro={accion?.tipo === 'anular'}
        titulo={accion?.tipo === 'anular' ? 'Anular documento' : 'Reemitir documento'}
        resumen={accion ? `${accion.documento.codigo} de ${datos.nombrePersona(accion.documento.personaId)}. ${accion.tipo === 'reemitir' ? 'Se anula el actual y se emite uno nuevo con otro código.' : 'La verificación pública mostrará el documento como anulado.'}` : ''}
        textoConfirmar={accion?.tipo === 'anular' ? 'Anular' : 'Reemitir'}
        alConfirmar={(motivo) => {
          if (!accion) return;
          const resultado = accion.tipo === 'anular' ? anularDocumento(accion.documento.id, motivo, persona?.id ?? 'DEMO-U01') : reemitir(accion.documento.id, motivo, persona?.id ?? 'DEMO-U01');
          if (resultado.ok) toast.exito(accion.tipo === 'anular' ? 'Documento anulado' : 'Documento reemitido', resultado.valor.codigo); else toast.error('No se pudo aplicar', resultado.error);
          setAccion(null);
        }} />
    </div>
  );
}
