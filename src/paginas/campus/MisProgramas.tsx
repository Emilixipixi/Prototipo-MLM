import { AlertTriangle, ArrowRight, Award, CalendarClock, CalendarX2, GraduationCap, Library, NotebookPen, Plus, ShoppingBag, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { rutaRenovacion } from '../../componentes/campus/rutasCampus';
import { TarjetaProgramaCampus } from '../../componentes/campus/TarjetaProgramaCampus';
import { Boton } from '../../componentes/ui/Boton';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { EstadoVacio } from '../../componentes/ui/EstadoVacio';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { TarjetaKpi } from '../../componentes/ui/TarjetaKpi';
import { useToast } from '../../componentes/ui/useToast';
import { nombresTipoPrograma } from '../../datos/academico/presentacionCampus';
import { useCampusPersona } from '../../hooks/useCampusPersona';
import { esVigente } from '../../motores/academico/accesos';
import { inscribirConMembresia } from '../../servicios/matriculas';
import { usePersonaSesion } from '../../store/useSesionStore';
import { formatearFecha } from '../../utilidades/fechas';
import { formatearNumero } from '../../utilidades/formatos';

function Sub({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-snug text-texto-2">{children}</p>;
}

export default function MisProgramas() {
  const persona = usePersonaSesion();
  const datos = useCampusPersona(persona?.id);
  const toast = useToast();
  if (!persona) return null;

  const vigentes = datos.programas.filter((item) => esVigente(item.estado));
  const porVencer = datos.programas.filter((item) => item.estado === 'por_vencer' && item.matricula.origen !== 'membresia');
  const vencidas = datos.programas.filter((item) => item.estado === 'vencida' || item.estado === 'suspendida');
  const proximo = [...vigentes].sort((a, b) => a.matricula.vencimiento.localeCompare(b.matricula.vencimiento))[0];
  const membresiaVigente = datos.membresia && datos.estadoMembresia && esVigente(datos.estadoMembresia);
  const diplomados = vigentes.filter((item) => item.programa.tipo === 'diplomado').length;

  const inscribir = (programaId: string) => {
    const resultado = inscribirConMembresia(persona.id, programaId, persona.id);
    if (resultado.ok) toast.exito('Inscripción registrada', `Ya puedes estudiar este programa hasta el ${formatearFecha(resultado.valor.matricula.vencimiento)}.`);
    else toast.error('No se pudo inscribir', resultado.error);
  };

  if (datos.programas.length === 0 && !datos.membresia) {
    return (
      <Tarjeta className="mx-auto max-w-2xl">
        <EstadoVacio
          icono={GraduationCap}
          titulo="Aún no tienes programas en Campus ERICK"
          texto="Cuando compres un curso, un diplomado o una membresía y se confirme el pago, tu matrícula aparecerá aquí automáticamente."
          accion={<><EnlaceBoton to="/catalogo" icono={ShoppingBag}>Ver catálogo</EnlaceBoton><EnlaceBoton to="/campus/membresia" variante="secundario">Conocer las membresías</EnlaceBoton></>}
        />
      </Tarjeta>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <TarjetaKpi etiqueta="Con acceso" valor={vigentes.length} icono={Library} tono="acento" grafico={<Sub>{`${diplomados} ${diplomados === 1 ? 'diplomado' : 'diplomados'} · ${vigentes.length - diplomados} ${vigentes.length - diplomados === 1 ? 'curso' : 'cursos'}`}</Sub>} />
        <TarjetaKpi etiqueta="Promedio" valor={<span className="cifra">{datos.promedio !== null ? formatearNumero(datos.promedio, 2) : '-'}</span>} icono={NotebookPen} tono="primario" grafico={<Sub>Aprobado: mayor a 14</Sub>} />
        <TarjetaKpi etiqueta="Certificados" valor={datos.documentos} icono={Award} tono="oro" grafico={<Sub>Descargables siempre</Sub>} />
        <TarjetaKpi
          etiqueta="Vencimiento"
          valor={<span className="cifra text-[20px] sm:text-[22px]">{proximo ? formatearFecha(proximo.matricula.vencimiento) : '-'}</span>}
          icono={CalendarClock}
          tono={proximo && proximo.estado === 'por_vencer' ? 'error' : 'info'}
          grafico={<Sub>{proximo ? `${proximo.dias} ${proximo.dias === 1 ? 'día' : 'días'} · ${proximo.matricula.origen === 'membresia' ? 'membresía' : proximo.programa.codigo}` : 'Sin accesos vigentes'}</Sub>}
        />
      </div>

      {datos.membresia && datos.estadoMembresia === 'por_vencer' && (
        <div className="flex flex-wrap items-center gap-3 rounded-tarjeta border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-[#92400E]">
          <AlertTriangle className="size-5 shrink-0" aria-hidden />
          <p className="min-w-0 flex-1">Tu membresía vence el <b>{formatearFecha(datos.membresia.vencimiento)}</b>. Al renovarla, el nuevo plazo se suma desde esa fecha.</p>
          <EnlaceBoton to="/campus/membresia" tamano="sm" variante="secundario">Renovar membresía</EnlaceBoton>
        </div>
      )}
      {porVencer.map((item) => (
        <div key={item.matricula.id} className="flex flex-wrap items-center gap-3 rounded-tarjeta border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-[#92400E]">
          <AlertTriangle className="size-5 shrink-0" aria-hidden />
          <p className="min-w-0 flex-1">El acceso a <b>{item.programa.nombre}</b> vence el {formatearFecha(item.matricula.vencimiento)} ({item.dias} {item.dias === 1 ? 'día' : 'días'}).</p>
          <EnlaceBoton to={rutaRenovacion(item)} tamano="sm" variante="secundario">Renovar</EnlaceBoton>
        </div>
      ))}
      {vencidas.length > 0 && (
        <div className="flex items-start gap-3 rounded-tarjeta border border-borde bg-superficie px-4 py-3 text-[13px] text-texto-2">
          <CalendarX2 className="mt-0.5 size-5 shrink-0 text-error" aria-hidden />
          <p className="min-w-0">Tienes {vencidas.length} {vencidas.length === 1 ? 'programa' : 'programas'} sin acceso vigente. Los contenidos y las evaluaciones están bloqueados, pero tus notas, tu historial y tus <Link to="/campus/certificados" className="font-semibold text-acento underline-offset-2 hover:underline">certificados</Link> siguen disponibles.</p>
        </div>
      )}

      <section className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
        {datos.programas.map((item) => <TarjetaProgramaCampus key={item.matricula.id} item={item} />)}
      </section>

      {membresiaVigente && datos.membresia && datos.incluidos.length > 0 && (
        <Tarjeta titulo="Incluidos en tu membresía" subtitulo={`${datos.plan?.nombre ?? 'Membresía'} · vigente hasta el ${formatearFecha(datos.membresia.vencimiento)}`} icono={Sparkles}>
          <ul className="grid gap-3 md:grid-cols-2">
            {datos.incluidos.map((programa) => (
              <li key={programa.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-borde p-3">
                <span className="size-10 shrink-0 rounded-[10px]" style={{ background: `linear-gradient(135deg, ${programa.colores[0]}, ${programa.colores[1]})` }} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold text-texto">{programa.nombre}</p>
                  <p className="text-xs text-texto-2">{nombresTipoPrograma[programa.tipo]} · {programa.horas} h</p>
                </div>
                <Boton tamano="sm" variante="secundario" icono={Plus} onClick={() => inscribir(programa.id)}>Inscribirme</Boton>
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}

      {!membresiaVigente && (
        <Tarjeta variante="simulacion">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Insignia tono="acento" icono={Sparkles}>Membresía ERICK</Insignia>
            <p className="min-w-0 text-[13px] text-texto-2 sm:flex-1">Con una membresía de 1 a 12 meses accedes a todos los cursos y diplomados incluidos, sin comprarlos uno por uno.</p>
            <EnlaceBoton to="/campus/membresia" tamano="sm" variante="fantasma" iconoDerecha={ArrowRight}>Ver planes</EnlaceBoton>
          </div>
        </Tarjeta>
      )}
    </div>
  );
}
