import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, ClipboardList, GraduationCap, Lock, Microscope, NotebookPen } from 'lucide-react';
import { AnilloProgreso } from '../../componentes/campus/AnilloProgreso';
import { ProximasFechas } from '../../componentes/campus/ProximasFechas';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { EstadoVacio } from '../../componentes/ui/EstadoVacio';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { relativoHoy } from '../../datos/academico/fechasCampus';
import { estadosAcceso, estadosElemento, estadosNota, nombresTipoPrograma } from '../../datos/academico/presentacionCampus';
import { useResumenProgramaPersona } from '../../hooks/useContextoElemento';
import { accesoPrograma, estadoMatricula } from '../../motores/academico/accesos';
import { siguienteElemento } from '../../motores/academico/desbloqueo';
import { resumirPrograma } from '../../motores/academico/progreso';
import { useAcademicoStore } from '../../store/useAcademicoStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import { unirClases } from '../../utilidades/clases';
import { formatearFecha } from '../../utilidades/fechas';
import { formatearNumero } from '../../utilidades/formatos';

function nota(valor: number | null): string {
  return valor === null ? '-' : formatearNumero(valor, 2);
}

export default function RutaPrograma() {
  const { id } = useParams();
  const persona = usePersonaSesion();
  const datos = useResumenProgramaPersona(persona?.id, id);
  const temas = useAcademicoStore((estado) => estado.temas);
  const tims = useAcademicoStore((estado) => estado.tims);
  const hoy = relativoHoy(0);
  const calculo = useMemo(() => {
    if (!persona || !id) return null;
    const resumen = resumirPrograma(persona.id, id, { programas: datos.programas, modulos: datos.modulos }, datos);
    const acceso = accesoPrograma(persona.id, id, datos.matriculas, datos.membresias, datos.programas, hoy);
    const matriculas = datos.matriculas.filter((matricula) => matricula.personaId === persona.id && (matricula.programaId === id
      || datos.programas.some((programa) => programa.id === matricula.programaId && programa.cursoIds.includes(id))));
    return { resumen, acceso, matriculas };
  }, [persona, id, datos, hoy]);

  if (!persona || !calculo?.resumen) {
    return <Tarjeta><EstadoVacio icono={GraduationCap} titulo="Programa no encontrado" texto="Revisa tus programas matriculados." accion={<EnlaceBoton to="/campus/programas">Mis programas</EnlaceBoton>} /></Tarjeta>;
  }
  const { resumen, acceso, matriculas } = calculo;
  const programa = resumen.programa;
  const tieneHistoria = resumen.aprobados > 0 || resumen.ruta.some((elemento) => resumen.estados[elemento.id] !== 'bloqueado' && resumen.estados[elemento.id] !== 'disponible');
  if (!acceso.acceso && matriculas.length === 0 && !tieneHistoria) {
    return (
      <Tarjeta>
        <EstadoVacio icono={Lock} titulo="No estás matriculado en este programa" texto="Compra el programa o activa una membresía para estudiarlo."
          accion={<EnlaceBoton to={programa.productoId ? `/catalogo/${programa.productoId}` : '/campus/membresia'}>Ver opciones</EnlaceBoton>} />
      </Tarjeta>
    );
  }
  const matriculaPrincipal = acceso.matricula ?? matriculas[0] ?? null;
  const estadoAcceso = acceso.acceso ? (matriculaPrincipal ? estadoMatricula(matriculaPrincipal, hoy) : 'activa') : (matriculaPrincipal ? estadoMatricula(matriculaPrincipal, hoy) : 'vencida');
  const proximo = siguienteElemento(resumen.ruta, resumen.estados);
  const nombreElemento = (elementoId: string, tipo: 'tema' | 'tim') => (tipo === 'tema' ? temas.find((tema) => tema.id === elementoId)?.nombre : tims.find((tim) => tim.id === elementoId)?.nombre) ?? elementoId;
  const ruta = (elementoId: string, tipo: 'tema' | 'tim') => (tipo === 'tema' ? `/campus/temas/${elementoId}` : `/campus/tim/${elementoId}`);
  const inicioCurso = resumen.cursos.map((_curso, indice) => resumen.cursos.slice(0, indice).reduce((suma, curso) => suma + curso.modulos.length, 0));

  return (
    <div className="flex flex-col gap-5">
      <Link to="/campus/programas" className="inline-flex min-h-11 w-fit items-center gap-1.5 text-[13px] font-semibold text-acento md:min-h-0"><ArrowLeft className="size-4" aria-hidden />Mis programas</Link>
      <section className="relative overflow-hidden rounded-[24px] p-5 text-white sm:p-7" style={{ background: `linear-gradient(135deg, ${programa.colores[0]}, ${programa.colores[1]})` }}>
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <AnilloProgreso valor={resumen.avance} tamano={84} etiqueta="Avance del programa" claro />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">{nombresTipoPrograma[programa.tipo]} · {programa.horas} h · {programa.modalidad}</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{programa.nombre}</h2>
            <p className="mt-1 text-[13px] text-white/80">{resumen.aprobados} de {resumen.total} elementos aprobados</p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <Insignia tono={estadosAcceso[estadoAcceso].tono} icono={estadosAcceso[estadoAcceso].icono}>{estadosAcceso[estadoAcceso].texto}</Insignia>
            <p className="cifra text-[28px] font-extrabold leading-none">{nota(resumen.nota.nota)}</p>
            <p className="text-xs text-white/80">{resumen.nota.estado === 'pendiente' ? 'nota pendiente' : estadosNota[resumen.nota.estado].texto.toLowerCase()}</p>
          </div>
        </div>
      </section>

      {!acceso.acceso && (
        <p className="flex items-start gap-2 rounded-tarjeta border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-[#991B1B]">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
          Tu acceso a los contenidos no está vigente. Puedes revisar tus notas y descargar tus certificados; para seguir estudiando renueva el acceso.
        </p>
      )}
      {acceso.acceso && proximo && (
        <Tarjeta className="flex flex-wrap items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-acento-suave text-acento"><NotebookPen className="size-5" aria-hidden /></span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-texto-3">Continúa donde te quedaste</p>
            <p className="font-semibold text-texto">{nombreElemento(proximo.id, proximo.tipo)}</p>
          </div>
          <EnlaceBoton to={ruta(proximo.id, proximo.tipo)} iconoDerecha={ArrowRight}>Continuar</EnlaceBoton>
        </Tarjeta>
      )}
      {acceso.acceso && acceso.vencimiento && (
        <p className="flex items-center gap-2 text-[12.5px] text-texto-2"><CalendarDays className="size-4" aria-hidden />Acceso hasta el {formatearFecha(acceso.vencimiento)}{acceso.via === 'membresia' ? ' (membresía)' : acceso.via === 'diplomado' ? ' (por tu diplomado)' : ''}</p>
      )}
      {persona && <ProximasFechas personaId={persona.id} programaId={programa.id} />}

      {resumen.cursos.map((curso, indiceCurso) => (
        <section key={curso.programa.id} className="flex flex-col gap-3">
          {programa.tipo === 'diplomado' && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[16px] font-bold text-texto">Curso {indiceCurso + 1}: {curso.programa.nombre}</h3>
              <span className="flex items-center gap-2"><Insignia tono={estadosNota[curso.nota.estado].tono}>{estadosNota[curso.nota.estado].texto}</Insignia><span className="cifra text-sm font-bold">{nota(curso.nota.nota)}</span></span>
            </div>
          )}
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-3">
            {curso.modulos.map((modulo, indiceModulo) => {
              const numeroModulo = inicioCurso[indiceCurso] + indiceModulo + 1;
              const elementos = [...modulo.modulo.temaIds.map((temaId) => ({ id: temaId, tipo: 'tema' as const })), { id: modulo.modulo.timId, tipo: 'tim' as const }];
              return (
                <Tarjeta key={modulo.modulo.id} titulo={`Módulo ${numeroModulo}: ${modulo.modulo.nombre}`} subtitulo={`${modulo.modulo.horas} h · nota ${nota(modulo.nota.nota)}`} icono={ClipboardList} sinRelleno>
                  <ol className="flex flex-col px-2 pb-3 pt-3 sm:px-3">
                    {elementos.map((elemento, indice) => {
                      const estado = resumen.estados[elemento.id] ?? 'bloqueado';
                      const info = estadosElemento[estado];
                      const Icono = info.icono;
                      const abierto = acceso.acceso && estado !== 'bloqueado';
                      const contenido = (
                        <>
                          <span className={unirClases('grid size-8 shrink-0 place-items-center rounded-full', info.clase)}><Icono className="size-4" aria-hidden /></span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13px] font-semibold text-texto">{elemento.tipo === 'tema' ? `${indice + 1}. ` : ''}{nombreElemento(elemento.id, elemento.tipo)}</span>
                            <span className="block text-[11.5px] text-texto-2">{elemento.tipo === 'tema' ? '3 h · video, lectura, caso y evaluación' : '5 h · trabajo integrador'} · {info.texto}</span>
                          </span>
                          <span className="cifra text-[13px] font-semibold text-texto">{nota(resumen.notas[elemento.id]?.nota ?? null)}</span>
                        </>
                      );
                      return (
                        <li key={elemento.id} className={unirClases(elemento.tipo === 'tim' && 'mt-1 border-t border-borde pt-1')}>
                          {abierto
                            ? <Link to={ruta(elemento.id, elemento.tipo)} className="flex min-h-12 items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-fondo">{contenido}</Link>
                            : <div className="flex min-h-12 items-center gap-3 rounded-xl px-2 py-1.5 opacity-75" aria-disabled="true">{contenido}</div>}
                        </li>
                      );
                    })}
                  </ol>
                </Tarjeta>
              );
            })}
          </div>
        </section>
      ))}

      {programa.midId && (
        <Tarjeta className="flex flex-wrap items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-oro-suave text-oro"><Microscope className="size-5" aria-hidden /></span>
          <p className="min-w-0 flex-1 text-[13px] text-texto-2"><b className="text-texto">Módulo de Investigación y Desarrollo (opcional).</b> Se sustenta ante un evaluador y no modifica tu diploma.</p>
          <EnlaceBoton to="/campus/mid" variante="secundario" tamano="sm">Mi MID</EnlaceBoton>
        </Tarjeta>
      )}
    </div>
  );
}
