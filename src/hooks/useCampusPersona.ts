import { useMemo } from 'react';
import { relativoHoy } from '../datos/academico/fechasCampus';
import { diasRestantes, estadoMatricula, estadoMembresia, esVigente } from '../motores/academico/accesos';
import { siguienteElemento } from '../motores/academico/desbloqueo';
import { resumirPrograma, type ResumenPrograma } from '../motores/academico/progreso';
import { membresiaDePersona, programaMatriculable } from '../servicios/matriculas';
import { useAcademicoStore } from '../store/useAcademicoStore';
import { useCampusStore } from '../store/useCampusStore';
import type { EstadoMatricula, Matricula, Membresia, PlanMembresia, Programa } from '../tipos/academico';

export interface CursoEnPrograma { programa: Programa; avance: number; estado: ResumenPrograma['nota']['estado']; nota: number | null }

export interface ProgramaCampus {
  programa: Programa; matricula: Matricula; estado: EstadoMatricula; dias: number; resumen: ResumenPrograma;
  cursos: CursoEnPrograma[]; siguiente: string | null; modulos: number; temas: number;
}

export interface DatosCampusPersona {
  hoy: string; programas: ProgramaCampus[]; membresia: Membresia | null; estadoMembresia: EstadoMatricula | null;
  plan: PlanMembresia | null; incluidos: Programa[]; documentos: number; promedio: number | null;
}

const prioridad: Record<EstadoMatricula, number> = { activa: 0, por_vencer: 1, suspendida: 2, vencida: 3 };

export function useCampusPersona(personaId: string | null | undefined): DatosCampusPersona {
  const programas = useAcademicoStore((estado) => estado.programas);
  const modulos = useAcademicoStore((estado) => estado.modulos);
  const temas = useAcademicoStore((estado) => estado.temas);
  const tims = useAcademicoStore((estado) => estado.tims);
  const planes = useAcademicoStore((estado) => estado.planes);
  const matriculas = useCampusStore((estado) => estado.matriculas);
  const membresias = useCampusStore((estado) => estado.membresias);
  const progreso = useCampusStore((estado) => estado.progreso);
  const intentos = useCampusStore((estado) => estado.intentos);
  const documentosTodos = useCampusStore((estado) => estado.documentos);

  return useMemo(() => {
    const hoy = relativoHoy(0);
    const estructura = { programas, modulos };
    const registro = { matriculas, progreso, intentos };
    const propias = matriculas.filter((matricula) => matricula.personaId === personaId);
    const porPrograma = new Map<string, Matricula>();
    propias.forEach((matricula) => {
      const actual = porPrograma.get(matricula.programaId);
      const mejor = !actual
        || prioridad[estadoMatricula(matricula, hoy)] < prioridad[estadoMatricula(actual, hoy)]
        || (prioridad[estadoMatricula(matricula, hoy)] === prioridad[estadoMatricula(actual, hoy)] && matricula.vencimiento > actual.vencimiento);
      if (mejor) porPrograma.set(matricula.programaId, matricula);
    });

    const lista: ProgramaCampus[] = [];
    porPrograma.forEach((matricula, programaId) => {
      const programa = programas.find((item) => item.id === programaId);
      const resumen = personaId ? resumirPrograma(personaId, programaId, estructura, registro) : null;
      if (!programa || !resumen) return;
      const cursos = resumen.cursos.map((curso) => {
        const ruta = resumen.ruta.filter((elemento) => elemento.cursoId === curso.programa.id);
        const aprobados = ruta.filter((elemento) => resumen.estados[elemento.id] === 'aprobado').length;
        return { programa: curso.programa, avance: ruta.length ? Math.round((aprobados / ruta.length) * 100) : 0, estado: curso.nota.estado, nota: curso.nota.nota };
      });
      const proximo = siguienteElemento(resumen.ruta, resumen.estados);
      let siguiente: string | null = null;
      if (proximo) {
        const modulo = modulos.find((item) => item.id === proximo.moduloId);
        const nombre = proximo.tipo === 'tema' ? temas.find((item) => item.id === proximo.id)?.nombre : tims.find((item) => item.id === proximo.id)?.nombre;
        const numeroModulo = [...new Set(resumen.ruta.map((elemento) => elemento.moduloId))].indexOf(proximo.moduloId) + 1;
        siguiente = proximo.tipo === 'tema'
          ? `Módulo ${numeroModulo} · Tema ${(modulo?.temaIds.indexOf(proximo.id) ?? 0) + 1}: ${nombre ?? ''}`
          : `Módulo ${numeroModulo} · ${nombre ?? 'TIM'}`;
      }
      const idsModulos = cursos.flatMap((curso) => curso.programa.moduloIds);
      lista.push({
        programa, matricula, estado: estadoMatricula(matricula, hoy), dias: diasRestantes(matricula.vencimiento, hoy), resumen, cursos, siguiente,
        modulos: idsModulos.length, temas: modulos.filter((modulo) => idsModulos.includes(modulo.id)).reduce((suma, modulo) => suma + modulo.temaIds.length, 0),
      });
    });
    lista.sort((a, b) => prioridad[a.estado] - prioridad[b.estado] || a.programa.nombre.localeCompare(b.programa.nombre));

    const membresia = personaId ? membresiaDePersona(personaId, membresias) : null;
    const estadoMem = membresia ? estadoMembresia(membresia, hoy) : null;
    const plan = membresia ? planes.find((item) => item.id === membresia.planId) ?? null : null;
    const conAcceso = new Set(lista.filter((item) => esVigente(item.estado)).map((item) => item.programa.id));
    const incluidos = programas.filter((programa) => programaMatriculable(programa) && programa.incluidoEnMembresia && !conAcceso.has(programa.id));
    const notasModulos = new Map<string, number>();
    lista.forEach((item) => item.resumen.cursos.forEach((curso) => curso.modulos.forEach((modulo) => {
      if (modulo.nota.nota !== null) notasModulos.set(modulo.modulo.id, modulo.nota.nota);
    })));
    const valores = [...notasModulos.values()];
    return {
      hoy, programas: lista, membresia, estadoMembresia: estadoMem, plan, incluidos,
      documentos: documentosTodos.filter((documento) => documento.personaId === personaId && documento.estado === 'emitido').length,
      promedio: valores.length ? valores.reduce((suma, valor) => suma + valor, 0) / valores.length : null,
    };
  }, [personaId, programas, modulos, temas, tims, planes, matriculas, membresias, progreso, intentos, documentosTodos]);
}
