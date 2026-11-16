import { firmasInstitucionales, leyendaDocumentos } from '../datos/academico/firmas';
import type { DocumentoAcademico, Programa, Tema } from '../tipos/academico';
import type { Persona } from '../tipos/persona';
import { formatearFecha } from '../utilidades/fechas';

type Pdf = import('jspdf').jsPDF;

const PETROLEO: [number, number, number] = [46, 107, 79];
const ORO: [number, number, number] = [184, 134, 43];
const TEXTO: [number, number, number] = [15, 23, 42];
const GRIS: [number, number, number] = [100, 116, 139];

export const titulosDocumento: Record<DocumentoAcademico['tipo'], string> = {
  certificado: 'CERTIFICADO', diploma: 'DIPLOMA', constancia_mid: 'CONSTANCIA',
};

const frases: Record<DocumentoAcademico['tipo'], string> = {
  certificado: 'por haber aprobado el curso', diploma: 'por haber aprobado el diplomado', constancia_mid: 'por haber aprobado la sustentación del',
};

export function urlVerificacion(codigo: string): string {
  const origen = typeof window !== 'undefined' ? window.location.origin : 'https://campus.erick.demo';
  return `${origen}/verificar/${codigo}`;
}

export async function qrComoImagen(texto: string): Promise<string> {
  const QRCode = (await import('qrcode')).default;
  return QRCode.toDataURL(texto, { margin: 1, width: 320, color: { dark: '#0E3B4A', light: '#FFFFFF' } });
}

async function nuevoPdf(orientacion: 'landscape' | 'portrait'): Promise<Pdf> {
  const { jsPDF } = await import('jspdf');
  return new jsPDF({ orientation: orientacion, unit: 'mm', format: 'a4' });
}

function marcoCertificado(pdf: Pdf): void {
  pdf.setDrawColor(...PETROLEO);
  pdf.setLineWidth(2.2);
  pdf.rect(8, 8, 281, 194);
  pdf.setDrawColor(...ORO);
  pdf.setLineWidth(0.6);
  pdf.rect(12, 12, 273, 186);
}

function encabezado(pdf: Pdf): void {
  pdf.setFillColor(...PETROLEO);
  pdf.roundedRect(22, 20, 12, 12, 2, 2, 'F');
  pdf.setTextColor(226, 196, 110);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('E', 28, 28, { align: 'center' });
  pdf.setTextColor(...PETROLEO);
  pdf.setFontSize(14);
  pdf.text('ERICK S.A.C.', 38, 26);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...GRIS);
  pdf.text('Campus ERICK - Educación continua', 38, 31);
  pdf.setTextColor(185, 28, 28);
  pdf.setFontSize(8);
  pdf.text('DEMOSTRACIÓN - documento sin validez oficial', 275, 24, { align: 'right' });
}

function selloAnulado(pdf: Pdf): void {
  pdf.setTextColor(220, 38, 38);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(64);
  pdf.text('ANULADO', 148, 120, { align: 'center', angle: 20 });
}

export interface DatosPdfDocumento { documento: DocumentoAcademico; persona: Persona; programa: Programa }

export async function crearPdfDocumento({ documento, persona, programa }: DatosPdfDocumento): Promise<Pdf> {
  const pdf = await nuevoPdf('landscape');
  const url = urlVerificacion(documento.codigo);
  const qr = await qrComoImagen(url);
  marcoCertificado(pdf);
  encabezado(pdf);
  pdf.setTextColor(...ORO);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(34);
  pdf.text(titulosDocumento[documento.tipo], 148.5, 56, { align: 'center' });
  pdf.setTextColor(...GRIS);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text('Se otorga a', 148.5, 70, { align: 'center' });
  pdf.setTextColor(...TEXTO);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(24);
  pdf.text(`${persona.nombres} ${persona.apellidos}`, 148.5, 83, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...GRIS);
  pdf.text(`Documento de identidad: ${persona.documento}`, 148.5, 88, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(...GRIS);
  pdf.text(frases[documento.tipo], 148.5, 95, { align: 'center' });
  pdf.setTextColor(...PETROLEO);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(17);
  pdf.text(pdf.splitTextToSize(programa.nombre, 220), 148.5, 104, { align: 'center' });
  pdf.setTextColor(...TEXTO);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text(`con una duración de ${documento.horas} horas académicas, en modalidad ${programa.modalidad}, con nota final de ${documento.nota.toFixed(2).replace('.', ',')} sobre 20.`, 148.5, 118, { align: 'center' });
  pdf.setFontSize(9.5);
  pdf.setTextColor(...GRIS);
  pdf.text(`Fecha de culminación: ${formatearFecha(documento.fechaCulminacion)}    Fecha de emisión: ${formatearFecha(documento.fechaEmision)}`, 148.5, 127, { align: 'center' });

  firmasInstitucionales.forEach((firma, indice) => {
    const x = indice === 0 ? 92 : 205;
    pdf.setDrawColor(...TEXTO);
    pdf.setLineWidth(0.3);
    pdf.line(x - 32, 155, x + 32, 155);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.setTextColor(...TEXTO);
    pdf.text(firma.nombre, x, 160, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...GRIS);
    pdf.text(firma.cargo, x, 165, { align: 'center' });
  });

  pdf.addImage(qr, 'PNG', 247, 158, 30, 30);
  pdf.setFontSize(8.5);
  pdf.setTextColor(...TEXTO);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Código: ${documento.codigo}`, 22, 180);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Verificación: ${documento.codigoVerificacion}`, 22, 185);
  pdf.setTextColor(...GRIS);
  pdf.text(url, 22, 190);
  pdf.text(leyendaDocumentos, 22, 195);
  if (documento.estado === 'anulado') selloAnulado(pdf);

  pdf.addPage('a4', 'landscape');
  marcoCertificado(pdf);
  encabezado(pdf);
  pdf.setTextColor(...PETROLEO);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text(documento.tipo === 'constancia_mid' ? 'Detalle de la evaluación' : 'Relación de módulos, horas y calificaciones', 22, 48);
  pdf.setFontSize(10);
  pdf.setTextColor(...TEXTO);
  pdf.text(`${persona.nombres} ${persona.apellidos} - ${programa.nombre}`, 22, 56);
  let y = 66;
  pdf.setFillColor(238, 244, 248);
  pdf.rect(22, y - 6, 253, 9, 'F');
  pdf.setFontSize(9.5);
  pdf.text('N.', 26, y);
  pdf.text('Módulo', 38, y);
  pdf.text('Horas', 225, y, { align: 'right' });
  pdf.text('Nota', 265, y, { align: 'right' });
  pdf.setFont('helvetica', 'normal');
  documento.detalle.forEach((fila, indice) => {
    y += 9;
    pdf.text(String(indice + 1), 26, y);
    pdf.text(pdf.splitTextToSize(fila.nombre, 170)[0] ?? '', 38, y);
    pdf.text(String(fila.horas), 225, y, { align: 'right' });
    pdf.text(fila.nota.toFixed(2).replace('.', ','), 265, y, { align: 'right' });
    pdf.setDrawColor(226, 232, 240);
    pdf.line(22, y + 3, 275, y + 3);
  });
  y += 12;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Total', 38, y);
  pdf.text(String(documento.detalle.reduce((suma, fila) => suma + fila.horas, 0)), 225, y, { align: 'right' });
  pdf.text(documento.nota.toFixed(2).replace('.', ','), 265, y, { align: 'right' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...GRIS);
  pdf.text('Escala de 0 a 20. Se aprueba con nota mayor a 14. Nota de módulo ponderada por horas (temas 3 h y TIM 5 h); curso y diplomado por promedio simple.', 22, 186);
  pdf.text(`Verifique este documento en ${url} o escaneando el código QR del anverso.`, 22, 191);
  if (documento.estado === 'anulado') selloAnulado(pdf);
  return pdf;
}

export async function descargarPdfDocumento(datos: DatosPdfDocumento): Promise<void> {
  const pdf = await crearPdfDocumento(datos);
  pdf.save(`${datos.documento.codigo}.pdf`);
}

export async function descargarPdfLectura(tema: Tema, programa: string): Promise<void> {
  const pdf = await nuevoPdf('portrait');
  pdf.setTextColor(...PETROLEO);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text(`ERICK S.A.C. - Campus ERICK - ${programa}`, 18, 16);
  pdf.setTextColor(185, 28, 28);
  pdf.text('DEMOSTRACIÓN', 192, 16, { align: 'right' });
  pdf.setTextColor(...TEXTO);
  pdf.setFontSize(17);
  let y = 30;
  pdf.splitTextToSize(tema.lectura.titulo, 174).forEach((linea: string) => { pdf.text(linea, 18, y); y += 8; });
  y += 2;
  tema.lectura.contenido.split('\n\n').forEach((bloque) => {
    const titulo = bloque.startsWith('## ');
    const [cabecera, ...resto] = titulo ? bloque.slice(3).split('\n') : [null, bloque];
    if (cabecera) {
      if (y > 270) { pdf.addPage(); y = 20; }
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(...PETROLEO);
      pdf.text(cabecera, 18, y);
      y += 6.5;
    }
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10.5);
    pdf.setTextColor(...TEXTO);
    pdf.splitTextToSize(resto.join(' '), 174).forEach((linea: string) => {
      if (y > 280) { pdf.addPage(); y = 20; }
      pdf.text(linea, 18, y);
      y += 5.4;
    });
    y += 4;
  });
  pdf.save(`${tema.id}_lectura.pdf`);
}

export async function descargarPdfTabla(titulo: string, filas: Array<Record<string, string | number | null>>, nombreArchivo: string): Promise<void> {
  const pdf = await nuevoPdf('landscape');
  const columnas = filas.length ? Object.keys(filas[0]) : [];
  const ancho = 261 / Math.max(1, columnas.length);
  let y = 18;
  const cabecera = () => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(...PETROLEO);
    pdf.text(titulo, 18, y);
    pdf.setFontSize(8);
    pdf.setTextColor(185, 28, 28);
    pdf.text('DEMOSTRACIÓN - Campus ERICK', 279, y, { align: 'right' });
    y += 9;
    pdf.setFillColor(238, 244, 248);
    pdf.rect(18, y - 5, 261, 7, 'F');
    pdf.setTextColor(...TEXTO);
    columnas.forEach((columna, indice) => pdf.text(columna, 19 + indice * ancho, y));
    y += 7;
    pdf.setFont('helvetica', 'normal');
  };
  cabecera();
  filas.forEach((fila) => {
    if (y > 196) { pdf.addPage('a4', 'landscape'); y = 18; cabecera(); }
    columnas.forEach((columna, indice) => {
      const texto = pdf.splitTextToSize(String(fila[columna] ?? ''), ancho - 2)[0] ?? '';
      pdf.text(texto, 19 + indice * ancho, y);
    });
    y += 6;
  });
  pdf.save(nombreArchivo.endsWith('.pdf') ? nombreArchivo : `${nombreArchivo}.pdf`);
}
