import { BookOpenCheck, GraduationCap } from 'lucide-react';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { EstadoVacio } from '../../componentes/ui/EstadoVacio';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { estadosElemento, estadosNota, nombresTipoPrograma } from '../../datos/academico/presentacionCampus';
import { useCampusPersona } from '../../hooks/useCampusPersona';
import { intentosDe } from '../../motores/academico/progreso';
import { useAcademicoStore } from '../../store/useAcademicoStore';
import { useCampusStore } from '../../store/useCampusStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import { formatearFecha } from '../../utilidades/fechas';
import { formatearNumero } from '../../utilidades/formatos';

function valor(nota: number | null): string {
  return nota === null ? '-' : formatearNumero(nota, 2);
}

export default function MisNotas() {
  const persona = usePersonaSesion();
  const datos = useCampusPersona(persona?.id);
  const temas = useAcademicoStore((estado) => estado.temas);
  const tims = useAcademicoStore((estado) => estado.tims);
  const intentos = useCampusStore((estado) => estado.intentos);
  if (!persona) return null;
  if (datos.programas.length === 0) {
    return <Tarjeta><EstadoVacio icono={GraduationCap} titulo="Aún no tienes notas" texto="Tus notas aparecerán al rendir tus primeras evaluaciones." accion={<EnlaceBoton to="/campus/programas">Mis programas</EnlaceBoton>} /></Tarjeta>;
  }
  return (
    <div className="flex flex-col gap-5">
      <p className="rounded-xl bg-acento-suave px-3 py-2.5 text-[12.5px] text-[#155E75]">Escala de 0 a 20; se aprueba con nota mayor a 14. Módulo: (temas x 3 h + TIM x 5 h) / 20. Curso y diplomado: promedio simple. Un componente sin nota queda pendiente.</p>
      {datos.programas.map((item) => (
        <Tarjeta key={item.matricula.id} titulo={item.programa.nombre} subtitulo={`${nombresTipoPrograma[item.programa.tipo]} · ${item.programa.horas} h`} icono={BookOpenCheck}
          acciones={<span className="flex items-center gap-2"><Insignia tono={estadosNota[item.resumen.nota.estado].tono}>{estadosNota[item.resumen.nota.estado].texto}</Insignia><span className="cifra text-lg font-bold">{valor(item.resumen.nota.nota)}</span></span>}>
          <div className="flex flex-col gap-3">
            {item.resumen.cursos.map((curso) => (
              <div key={curso.programa.id} className="flex flex-col gap-2">
                {item.programa.tipo === 'diplomado' && <p className="flex flex-wrap items-center justify-between gap-2 text-[13.5px] font-bold text-texto">{curso.programa.nombre}<span className="cifra">{valor(curso.nota.nota)}</span></p>}
                {curso.modulos.map((modulo) => (
                  <details key={modulo.modulo.id} className="group rounded-xl border border-borde">
                    <summary className="flex min-h-12 cursor-pointer list-none flex-wrap items-center gap-2 px-3 py-2">
                      <span className="min-w-0 flex-1 text-[13.5px] font-semibold text-texto">{modulo.modulo.nombre}</span>
                      <span className="text-xs text-texto-2">{modulo.modulo.horas} h</span>
                      <Insignia tono={estadosNota[modulo.nota.estado].tono}>{valor(modulo.nota.nota)}</Insignia>
                    </summary>
                    <div className="overflow-x-auto border-t border-borde">
                      <table className="w-full min-w-[520px] text-[12.5px]">
                        <thead><tr className="text-left text-[10.5px] font-bold uppercase tracking-[0.08em] text-texto-3"><th className="px-3 py-2">Componente</th><th className="px-2 py-2">Estado</th><th className="px-2 py-2 text-right">Intentos</th><th className="px-2 py-2">Último</th><th className="px-3 py-2 text-right">Nota</th></tr></thead>
                        <tbody>
                          {[...modulo.temas.map((tema) => ({ id: tema.id, horas: 3 })), { id: modulo.modulo.timId, horas: 5 }].map((elemento) => {
                            const lista = intentosDe(persona.id, elemento.id, intentos);
                            const estado = estadosElemento[item.resumen.estados[elemento.id] ?? 'bloqueado'];
                            const nombre = temas.find((tema) => tema.id === elemento.id)?.nombre ?? tims.find((tim) => tim.id === elemento.id)?.nombre ?? elemento.id;
                            return (
                              <tr key={elemento.id} className="border-t border-borde">
                                <td className="px-3 py-2">{nombre} <span className="text-texto-3">({elemento.horas} h)</span></td>
                                <td className="px-2 py-2"><Insignia tono={estado.tono}>{estado.texto}</Insignia></td>
                                <td className="cifra px-2 py-2 text-right">{lista.length}</td>
                                <td className="px-2 py-2 text-texto-2">{lista.length ? formatearFecha(lista[lista.length - 1].fin) : '-'}</td>
                                <td className="cifra px-3 py-2 text-right font-semibold">{valor(item.resumen.notas[elemento.id]?.nota ?? null)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </details>
                ))}
              </div>
            ))}
          </div>
        </Tarjeta>
      ))}
    </div>
  );
}
