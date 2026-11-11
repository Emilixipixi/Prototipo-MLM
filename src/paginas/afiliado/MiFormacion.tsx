import { useMemo } from 'react';
import { ArrowRight, BookOpen, CircleCheck, CircleDashed, GraduationCap, Plug, RefreshCw } from 'lucide-react';
import { Boton } from '../../componentes/ui/Boton';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { EstadoVacio } from '../../componentes/ui/EstadoVacio';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { useToast } from '../../componentes/ui/useToast';
import { useDatosAfiliado } from '../../hooks/useDatosAfiliado';
import { simularActualizacionLms } from '../../servicios/formacion';
import type { EstadoFormacion } from '../../tipos/formacion';
import { unirClases } from '../../utilidades/clases';
import { formatearFecha } from '../../utilidades/fechas';

const pasos: EstadoFormacion[] = ['matriculado', 'cursando', 'aprobado'];
const etiquetas: Record<EstadoFormacion, string> = { matriculado: 'Matriculado', cursando: 'Cursando', aprobado: 'Aprobado' };
const siguiente: Partial<Record<EstadoFormacion, EstadoFormacion>> = { matriculado: 'cursando', cursando: 'aprobado' };

export default function MiFormacion() {
  const { fuente, persona, periodoActual, calificaciones } = useDatosAfiliado();
  const toast = useToast();
  const programas = useMemo(() => fuente.formacion.filter((item) => item.personaId === persona?.id), [fuente.formacion, persona]);
  if (!persona) return null;
  const calificacion = periodoActual ? calificaciones[periodoActual.id]?.find((item) => item.personaId === persona.id) : undefined;
  const requisito = calificacion?.desgloseSiguiente.find((item) => item.requisitoId.endsWith('formacion'));

  const simular = (id: string, hacia: EstadoFormacion) => {
    const resultado = simularActualizacionLms(id, hacia, persona.id);
    if (resultado.ok) toast.exito('Estado actualizado (dato de prueba)', `El programa figura ahora como ${etiquetas[hacia].toLowerCase()}.`);
    else toast.error('No se pudo actualizar', resultado.error);
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-4">
        {programas.length === 0 ? (
          <Tarjeta><EstadoVacio icono={BookOpen} titulo="Sin programas vinculados" texto="Cuando compres un programa formativo de ERIC S.A.C., su estado aparecerá aquí." accion={<EnlaceBoton to="/catalogo?categoria=programa_formativo" icono={GraduationCap}>Ver programas</EnlaceBoton>} /></Tarjeta>
        ) : programas.map((programa) => {
          const indice = pasos.indexOf(programa.estado);
          const proximo = siguiente[programa.estado];
          return (
            <Tarjeta key={programa.id} titulo={programa.programaExterno} subtitulo={`${programa.proveedor} · actualizado ${formatearFecha(programa.fechaActualizacion)}`} icono={GraduationCap} acciones={<Insignia tono={programa.estado === 'aprobado' ? 'exito' : programa.estado === 'cursando' ? 'info' : 'neutra'}>{etiquetas[programa.estado]}</Insignia>}>
              <ol className="grid grid-cols-3 gap-2">
                {pasos.map((paso, posicion) => {
                  const logrado = posicion <= indice;
                  const Icono = logrado ? CircleCheck : CircleDashed;
                  return (
                    <li key={paso} className={unirClases('flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center text-[12.5px] font-semibold', logrado ? 'border-green-200 bg-green-50 text-exito' : 'border-dashed border-borde text-texto-3')}>
                      <Icono className="size-5" aria-hidden />
                      {etiquetas[paso]}
                    </li>
                  );
                })}
              </ol>
              {proximo ? (
                <Boton variante="secundario" icono={RefreshCw} className="mt-4" onClick={() => simular(programa.id, proximo)}>Simular actualización desde LMS: {etiquetas[proximo].toLowerCase()}</Boton>
              ) : <p className="mt-4 text-[13px] font-semibold text-exito">Programa aprobado: cuenta como formación aprobada para la calificación.</p>}
            </Tarjeta>
          );
        })}
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <Tarjeta titulo="Formación como condición de rango" icono={CircleCheck}>
          {requisito ? (
            <div className="flex items-start gap-3">
              <span className={unirClases('grid size-10 shrink-0 place-items-center rounded-xl', requisito.cumple ? 'bg-green-100 text-exito' : 'bg-amber-100 text-advertencia')}>{requisito.cumple ? <CircleCheck className="size-5" aria-hidden /> : <CircleDashed className="size-5" aria-hidden />}</span>
              <div>
                <p className="font-semibold text-texto">{requisito.cumple ? 'Requisito cumplido' : 'Requisito pendiente'} para {calificacion?.siguienteRun}</p>
                <p className="text-[12.5px] text-texto-2">{requisito.descripcion}. Fuente: {requisito.fuente}.</p>
              </div>
            </div>
          ) : <p className="text-[13px] text-texto-2">Tu próximo RUN no exige formación aprobada con las reglas vigentes.</p>}
          <EnlaceBoton to="/afiliado/run" variante="fantasma" tamano="sm" iconoDerecha={ArrowRight} className="mt-3">Ver todos los requisitos</EnlaceBoton>
        </Tarjeta>
        <Tarjeta titulo="Conector LMS" icono={Plug}>
          <Insignia tono="advertencia">Pendiente de integración</Insignia>
          <p className="mt-2 text-[13px] text-texto-2">La plataforma educativa ERIC S.A.C. sigue siendo un sistema independiente. Los estados que ves son datos de prueba; no hay inscripción real ni conexión activa.</p>
        </Tarjeta>
      </div>
    </div>
  );
}
