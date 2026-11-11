export type FilaExportable = Record<string, string | number | null | undefined>;

function escapar(valor: string | number | null | undefined): string {
  const texto = valor === null || valor === undefined ? '' : String(valor);
  return /[";\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export function generarCsv(filas: FilaExportable[]): string {
  if (filas.length === 0) return '';
  const columnas = Object.keys(filas[0]);
  return [columnas.join(';'), ...filas.map((fila) => columnas.map((columna) => escapar(fila[columna])).join(';'))].join('\n');
}

export function descargarCsv(nombreArchivo: string, filas: FilaExportable[]): void {
  const contenido = `﻿${generarCsv(filas)}`;
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(new Blob([contenido], { type: 'text/csv;charset=utf-8' }));
  enlace.download = nombreArchivo.endsWith('.csv') ? nombreArchivo : `${nombreArchivo}.csv`;
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}
