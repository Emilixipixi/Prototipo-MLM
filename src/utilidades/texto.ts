export function obtenerIniciales(nombres: string, apellidos: string): string {
  const primera = nombres.trim().charAt(0);
  const segunda = apellidos.trim().charAt(0);
  return `${primera}${segunda}`.toUpperCase();
}

export function nombreCorto(nombres: string, apellidos: string): string {
  const primerNombre = nombres.trim().split(' ')[0] ?? '';
  const primerApellido = apellidos.trim().split(' ')[0] ?? '';
  return `${primerNombre} ${primerApellido}`.trim();
}
