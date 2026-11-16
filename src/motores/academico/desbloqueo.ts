import type { EstadoElemento, ModoDesbloqueo, Modulo, ProgresoComponente, Programa } from '../../tipos/academico';

export interface ElementoRuta { tipo: 'tema' | 'tim'; id: string; moduloId: string; cursoId: string; orden: number }

export interface AvanceElemento { componentes?: ProgresoComponente; intentos: number; aprobado: boolean; intentosPermitidos: number }

export function cursosDePrograma(programa: Programa, programas: Programa[]): Programa[] {
  if (programa.tipo === 'diplomado') {
    return programa.cursoIds
      .map((id) => programas.find((item) => item.id === id))
      .filter((item): item is Programa => Boolean(item));
  }
  return programa.tipo === 'curso' ? [programa] : [];
}

export function construirRuta(programaId: string, programas: Programa[], modulos: Modulo[]): ElementoRuta[] {
  const programa = programas.find((item) => item.id === programaId);
  if (!programa) return [];
  const ruta: ElementoRuta[] = [];
  cursosDePrograma(programa, programas).forEach((curso) => {
    curso.moduloIds.forEach((moduloId) => {
      const modulo = modulos.find((item) => item.id === moduloId);
      if (!modulo) return;
      modulo.temaIds.forEach((temaId) => ruta.push({ tipo: 'tema', id: temaId, moduloId, cursoId: curso.id, orden: ruta.length }));
      ruta.push({ tipo: 'tim', id: modulo.timId, moduloId, cursoId: curso.id, orden: ruta.length });
    });
  });
  return ruta;
}

export function evaluacionHabilitada(componentes: ProgresoComponente | undefined): boolean {
  return Boolean(componentes?.video && componentes.lectura && componentes.caso);
}

function estadoAbierto(elemento: ElementoRuta, avance: AvanceElemento | undefined): EstadoElemento {
  if (!avance) return 'disponible';
  if (avance.aprobado) return 'aprobado';
  if (avance.intentos >= avance.intentosPermitidos) return 'bloqueado_por_intentos';
  if (avance.intentos > 0) return 'desaprobado';
  const componentes = elemento.tipo === 'tema' ? avance.componentes : undefined;
  if (componentes && (componentes.video || componentes.lectura || componentes.caso)) return 'en_curso';
  return 'disponible';
}

export function calcularDesbloqueos(
  ruta: ElementoRuta[], avance: Record<string, AvanceElemento>, modo: ModoDesbloqueo,
): Record<string, EstadoElemento> {
  const estados: Record<string, EstadoElemento> = {};
  let previoAprobado = true;
  ruta.forEach((elemento) => {
    const datos = avance[elemento.id];
    let abierto: boolean;
    if (modo === 'aprobar_para_avanzar') {
      abierto = previoAprobado;
    } else if (elemento.tipo === 'tema') {
      abierto = true;
    } else {
      abierto = ruta.filter((item) => item.tipo === 'tema' && item.moduloId === elemento.moduloId).every((item) => avance[item.id]?.aprobado);
    }
    const estado: EstadoElemento = datos?.aprobado ? 'aprobado' : abierto ? estadoAbierto(elemento, datos) : 'bloqueado';
    estados[elemento.id] = estado;
    previoAprobado = estado === 'aprobado';
  });
  return estados;
}

export function siguienteElemento(ruta: ElementoRuta[], estados: Record<string, EstadoElemento>): ElementoRuta | null {
  return ruta.find((elemento) => estados[elemento.id] !== 'aprobado' && estados[elemento.id] !== 'bloqueado') ?? null;
}
