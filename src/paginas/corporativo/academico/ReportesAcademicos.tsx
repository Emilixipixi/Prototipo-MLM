import { useState } from 'react';
import { FileDown } from 'lucide-react';
import { BarraExportar } from '../../../componentes/ui/BarraExportar';
import { Boton } from '../../../componentes/ui/Boton';
import { ConPermiso } from '../../../componentes/ui/ConPermiso';
import { Pestanas } from '../../../componentes/ui/Pestanas';
import { Tarjeta } from '../../../componentes/ui/Tarjeta';
import { nombresEventoLms } from '../../../datos/academico/presentacionCampus';
import { useDatosAcademicos } from '../../../hooks/useDatosAcademicos';
import { usePermiso } from '../../../hooks/usePermiso';
import { nombresOrigen } from '../../../servicios/matriculas';
import { descargarPdfTabla } from '../../../servicios/pdfCertificados';
import type { FilaExportable } from '../../../servicios/exportar';
import { CalendarRange, X } from 'lucide-react';
import { Campo } from '../../../componentes/ui/Campo';

function enRango(fecha: string, desde: string, hasta: string): boolean {
  const dia = fecha.slice(0, 10);
  return (!desde || dia >= desde) && (!hasta || dia <= hasta);
}

type Reporte = 'matriculas' | 'notas' | 'documentos' | 'eventos';

export default function ReportesAcademicos() {
  const datosCompletos = useDatosAcademicos();
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const datos = {
    ...datosCompletos,
    filasMatriculas: datosCompletos.filasMatriculas.filter((fila) => enRango(fila.matricula.inicio, desde, hasta)),
    campus: {
      ...datosCompletos.campus,
      documentos: datosCompletos.campus.documentos.filter((documento) => enRango(documento.fechaEmision, desde, hasta)),
      eventos: datosCompletos.campus.eventos.filter((evento) => enRango(evento.fecha, desde, hasta)),
    },
  };
  const rangoInvalido = Boolean(desde && hasta && desde > hasta);
  const puedeExportar = usePermiso('academico', 'exportar');
  const [reporte, setReporte] = useState<Reporte>('matriculas');
  const construir = (): FilaExportable[] => {
    if (reporte === 'matriculas') return datos.filasMatriculas.map((fila) => ({ Matricula: fila.matricula.id, Estudiante: datos.nombrePersona(fila.matricula.personaId), Programa: fila.programa, Origen: nombresOrigen[fila.matricula.origen], Estado: fila.estado, Vence: fila.matricula.vencimiento, Avance: `${fila.avance}%` }));
    if (reporte === 'notas') return datos.filasMatriculas.map((fila) => ({ Estudiante: datos.nombrePersona(fila.matricula.personaId), Programa: fila.programa, Nota: fila.nota.nota !== null ? fila.nota.nota.toFixed(2) : '-', Resultado: fila.nota.estado, Avance: `${fila.avance}%` }));
    if (reporte === 'documentos') return datos.campus.documentos.map((documento) => ({ Codigo: documento.codigo, Tipo: documento.tipo, Estudiante: datos.nombrePersona(documento.personaId), Programa: datos.nombrePrograma(documento.programaId), Nota: documento.nota.toFixed(2), Emision: documento.fechaEmision.slice(0, 10), Estado: documento.estado }));
    return [...datos.campus.eventos].reverse().map((evento) => ({ Evento: evento.id, Fecha: evento.fecha.replace('T', ' '), Tipo: nombresEventoLms[evento.tipo], Persona: evento.personaId, Programa: evento.programaId ?? '-', Resultado: evento.estado }));
  };
  const filas = construir();
  const columnas = filas.length ? Object.keys(filas[0]) : [];
  const titulos: Record<Reporte, string> = { matriculas: 'Reporte de matrículas', notas: 'Reporte de notas por programa', documentos: 'Reporte de certificados y diplomas', eventos: 'Registro de eventos del conector LMS' };
  return (
    <div className="flex flex-col gap-5">
      <Pestanas etiqueta="Reportes" activa={reporte} alCambiar={(valor) => setReporte(valor as Reporte)} pestanas={[
        { id: 'matriculas', texto: 'Matrículas', contador: datos.filasMatriculas.length },
        { id: 'notas', texto: 'Notas' },
        { id: 'documentos', texto: 'Documentos', contador: datos.campus.documentos.length },
        { id: 'eventos', texto: 'Eventos', contador: datos.campus.eventos.length },
      ]} />
      <div className="flex flex-col gap-3 rounded-tarjeta border border-borde bg-superficie p-4 sm:flex-row sm:items-end">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-texto sm:mb-3"><CalendarRange className="size-4 text-acento" aria-hidden />Rango de fechas</p>
        <Campo etiqueta="Desde" type="date" value={desde} max={hasta || undefined} onChange={(evento) => setDesde(evento.target.value)} />
        <Campo etiqueta="Hasta" type="date" value={hasta} min={desde || undefined} onChange={(evento) => setHasta(evento.target.value)} />
        {(desde || hasta) && <Boton tamano="sm" variante="fantasma" icono={X} className="sm:mb-1" onClick={() => { setDesde(''); setHasta(''); }}>Quitar filtro</Boton>}
        <p className="text-xs text-texto-2 sm:mb-3 sm:ml-auto">{rangoInvalido ? 'La fecha inicial es posterior a la final.' : 'Matrículas por fecha de inicio, documentos por emisión y eventos por fecha de registro.'}</p>
      </div>
      <Tarjeta titulo={titulos[reporte]} subtitulo={`${filas.length} filas`}>
        <div className="mb-3 flex flex-wrap gap-2">
          <BarraExportar modulo="academico" nombreArchivo={`reporte_${reporte}`} filas={construir} />
          <ConPermiso modulo="academico" accion="exportar"><Boton tamano="sm" variante="secundario" icono={FileDown} onClick={() => { if (puedeExportar) void descargarPdfTabla(titulos[reporte], construir() as Array<Record<string, string | number | null>>, `reporte_${reporte}`); }}>Exportar PDF</Boton></ConPermiso>
        </div>
        <div className="max-h-[560px] overflow-auto">
          <table className="w-full min-w-[640px] text-[12.5px]">
            <thead className="sticky top-0 bg-superficie"><tr className="border-b border-borde text-left text-[10.5px] font-bold uppercase tracking-[0.08em] text-texto-3">{columnas.map((columna) => <th key={columna} className="px-2 py-2">{columna}</th>)}</tr></thead>
            <tbody>{filas.map((fila, indice) => <tr key={indice} className="border-b border-borde last:border-0">{columnas.map((columna) => <td key={columna} className="px-2 py-1.5">{fila[columna]}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </Tarjeta>
    </div>
  );
}
