import { ArrowRight, BookOpen, CalendarDays, CircleCheck, Layers, NotebookPen, RefreshCw } from 'lucide-react';
import { BarraProgreso } from '../rangos/BarraProgreso';
import { EnlaceBoton } from '../ui/EnlaceBoton';
import { Insignia } from '../ui/Insignia';
import { estadosAcceso, estadosNota, nombresTipoPrograma } from '../../datos/academico/presentacionCampus';
import type { ProgramaCampus } from '../../hooks/useCampusPersona';
import { esVigente } from '../../motores/academico/accesos';
import { nombresOrigen } from '../../servicios/matriculas';
import { formatearFecha } from '../../utilidades/fechas';
import { formatearNumero } from '../../utilidades/formatos';
import { rutaRenovacion } from './rutasCampus';

export function TarjetaProgramaCampus({ item }: { item: ProgramaCampus }) {
  const { programa, resumen, matricula } = item;
  const acceso = estadosAcceso[item.estado];
  const vigente = esVigente(item.estado);
  const nota = resumen.nota;
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-tarjeta border border-borde bg-superficie shadow-tarjeta">
      <div className="relative flex h-24 items-start justify-between gap-2 p-4" style={{ background: `linear-gradient(135deg, ${programa.colores[0]}, ${programa.colores[1]})` }}>
        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11.5px] font-semibold text-white">{nombresTipoPrograma[programa.tipo]} · {programa.horas} h</span>
        <span className="cifra rounded-md bg-black/20 px-2 py-0.5 text-[11px] font-medium text-white">{programa.codigo}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="min-w-0 text-[16px] font-bold leading-snug tracking-tight text-texto">{programa.nombre}</h3>
          <Insignia tono={acceso.tono} icono={acceso.icono}>{acceso.texto}</Insignia>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-texto-2">
          <span className="inline-flex items-center gap-1.5"><Layers className="size-3.5" aria-hidden />{programa.tipo === 'diplomado' ? `${programa.cursoIds.length} cursos · ` : ''}{item.modulos} módulos</span>
          <span className="inline-flex items-center gap-1.5"><BookOpen className="size-3.5" aria-hidden />{item.temas} temas</span>
          <span className="inline-flex items-center gap-1.5"><NotebookPen className="size-3.5" aria-hidden />{nota.nota !== null ? <>Nota <b className="cifra text-texto">{formatearNumero(nota.nota, 2)}</b></> : 'Nota pendiente'}</span>
        </div>
        <div>
          <div className="mb-1.5 flex justify-between text-[12.5px]"><span className="text-texto-2">Avance ({resumen.aprobados} de {resumen.total})</span><b className="cifra text-texto">{resumen.avance}%</b></div>
          <BarraProgreso valor={resumen.avance} maximo={100} etiqueta={`Avance de ${programa.nombre}`} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Insignia tono={estadosNota[nota.estado].tono} icono={nota.estado === 'aprobado' ? CircleCheck : undefined}>{estadosNota[nota.estado].texto}</Insignia>
          {programa.tipo === 'diplomado' && item.cursos.map((curso, indice) => (
            <Insignia key={curso.programa.id} tono={curso.estado === 'aprobado' ? 'exito' : curso.avance > 0 ? 'info' : 'neutra'}>
              Curso {indice + 1} {curso.estado === 'aprobado' ? 'aprobado' : `${curso.avance}%`}
            </Insignia>
          ))}
          {programa.midId && <Insignia tono="neutra">MID opcional</Insignia>}
          <Insignia tono={matricula.origen === 'membresia' ? 'acento' : 'neutra'}>{nombresOrigen[matricula.origen]}{matricula.pedidoId ? ` ${matricula.pedidoId}` : ''}</Insignia>
        </div>
        <p className="flex items-center gap-1.5 text-[12.5px] text-texto-2">
          <CalendarDays className="size-3.5 shrink-0" aria-hidden />
          {item.estado === 'vencida' ? `Venció el ${formatearFecha(matricula.vencimiento)}` : `Acceso hasta el ${formatearFecha(matricula.vencimiento)}`}
          {vigente && <span className="cifra">({item.dias} {item.dias === 1 ? 'día' : 'días'})</span>}
        </p>
        {!vigente && (
          <p className="rounded-xl bg-fondo px-3 py-2 text-[12.5px] text-texto-2">
            {item.estado === 'suspendida' ? 'El acceso a los contenidos está suspendido.' : 'Los contenidos están bloqueados.'} Tus notas, tu historial y tus certificados siguen disponibles.
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="min-w-0 text-[12.5px] text-texto-2">{vigente && item.siguiente ? <>Siguiente: <span className="text-texto">{item.siguiente}</span></> : nota.estado === 'aprobado' ? 'Programa completado' : ''}</span>
          {vigente
            ? <EnlaceBoton to={`/campus/programas/${programa.id}`} iconoDerecha={ArrowRight} tamano="sm">{nota.estado === 'aprobado' ? 'Ver ruta' : 'Continuar'}</EnlaceBoton>
            : item.estado === 'vencida'
              ? <EnlaceBoton to={rutaRenovacion(item)} variante="secundario" icono={RefreshCw} tamano="sm">Renovar</EnlaceBoton>
              : <EnlaceBoton to={`/campus/programas/${programa.id}`} variante="secundario" tamano="sm">Ver notas</EnlaceBoton>}
        </div>
      </div>
    </article>
  );
}
