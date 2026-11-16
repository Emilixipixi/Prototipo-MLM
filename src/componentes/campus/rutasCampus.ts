import type { ProgramaCampus } from '../../hooks/useCampusPersona';

export function rutaRenovacion(item: ProgramaCampus): string {
  if (item.matricula.origen === 'membresia') return '/campus/membresia';
  return item.programa.productoId ? `/catalogo/${item.programa.productoId}` : '/catalogo';
}
