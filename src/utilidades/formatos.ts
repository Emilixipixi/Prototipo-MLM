const LOCALE = 'es-AR';

export function redondear(valor: number, decimales = 2): number {
  const factor = 10 ** decimales;
  return Math.round((valor + Number.EPSILON) * factor) / factor;
}

export function formatearNumero(valor: number, decimales = 0): string {
  return new Intl.NumberFormat(LOCALE, { minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(valor);
}

export function formatearMonto(valor: number, moneda = 'USD'): string {
  return `${moneda} ${formatearNumero(valor, 2)}`;
}

export function formatearPorcentaje(valor: number): string {
  return `${formatearNumero(valor, Number.isInteger(valor) ? 0 : 1)}%`;
}
