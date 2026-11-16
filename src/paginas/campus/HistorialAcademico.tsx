import { Award, CircleCheck, Clock, History, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { TarjetaKpi } from '../../componentes/ui/TarjetaKpi';
import { estadosAcceso, nombresTipoPrograma } from '../../datos/academico/presentacionCampus';
import { useCampusPersona, type ProgramaCampus } from '../../hooks/useCampusPersona';
import { esVigente } from '../../motores/academico/accesos';
import { nombresDocumento } from '../../servicios/certificados';
import { useCampusStore } from '../../store/useCampusStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import { formatearFecha } from '../../utilidades/fechas';
import { formatearNumero } from '../../utilidades/formatos';

function Grupo({ titulo, items, icono }: { titulo: string; items: ProgramaCampus[]; icono: typeof History }) {
  return (
    <Tarjeta titulo={`${titulo} (${items.length})`} icono={icono}>
      {items.length === 0 ? <p className="text-[13px] text-texto-2">Sin programas en este grupo.</p> : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.matricula.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-fondo px-3 py-2.5 text-[13px]">
              <Link to={`/campus/programas/${item.programa.id}`} className="min-w-0 flex-1 font-semibold text-texto hover:text-acento">{item.programa.nombre}</Link>
              <span className="text-xs text-texto-2">{nombresTipoPrograma[item.programa.tipo]} · {item.programa.horas} h · {item.resumen.avance}%</span>
              <Insignia tono={estadosAcceso[item.estado].tono}>{estadosAcceso[item.estado].texto}</Insignia>
              <span className="cifra w-14 text-right font-bold">{item.resumen.nota.nota !== null ? formatearNumero(item.resumen.nota.nota, 2) : '-'}</span>
            </li>
          ))}
        </ul>
      )}
    </Tarjeta>
  );
}

export default function HistorialAcademico() {
  const persona = usePersonaSesion();
  const datos = useCampusPersona(persona?.id);
  const documentos = useCampusStore((estado) => estado.documentos).filter((documento) => documento.personaId === persona?.id);
  const intentos = useCampusStore((estado) => estado.intentos).filter((intento) => intento.personaId === persona?.id);
  if (!persona) return null;
  const aprobados = datos.programas.filter((item) => item.resumen.nota.estado === 'aprobado');
  const enCurso = datos.programas.filter((item) => item.resumen.nota.estado !== 'aprobado' && esVigente(item.estado));
  const sinAcceso = datos.programas.filter((item) => item.resumen.nota.estado !== 'aprobado' && !esVigente(item.estado));
  const horas = documentos.filter((documento) => documento.estado === 'emitido' && documento.tipo === 'certificado').reduce((suma, documento) => suma + documento.horas, 0);
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <TarjetaKpi etiqueta="Aprobados" valor={aprobados.length} icono={CircleCheck} tono="exito" />
        <TarjetaKpi etiqueta="Horas certificadas" valor={horas} icono={Clock} tono="acento" />
        <TarjetaKpi etiqueta="Evaluaciones" valor={intentos.length} icono={History} tono="primario" />
        <TarjetaKpi etiqueta="Documentos" valor={documentos.filter((documento) => documento.estado === 'emitido').length} icono={Award} tono="oro" />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-2">
        <Grupo titulo="Aprobados" items={aprobados} icono={CircleCheck} />
        <Grupo titulo="En curso" items={enCurso} icono={History} />
        <Grupo titulo="Sin acceso vigente" items={sinAcceso} icono={Lock} />
        <Tarjeta titulo="Documentos emitidos" icono={Award} acciones={<EnlaceBoton to="/campus/certificados" tamano="sm" variante="secundario">Ver todos</EnlaceBoton>}>
          {documentos.length === 0 ? <p className="text-[13px] text-texto-2">Aún no tienes documentos.</p> : (
            <ul className="flex flex-col gap-2">
              {documentos.map((documento) => (
                <li key={documento.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-fondo px-3 py-2.5 text-[13px]">
                  <span className="cifra text-xs text-texto-2">{documento.codigo}</span>
                  <span className="min-w-0 flex-1 font-semibold">{nombresDocumento[documento.tipo]}</span>
                  <span className="text-xs text-texto-2">{formatearFecha(documento.fechaEmision)}</span>
                  <Insignia tono={documento.estado === 'emitido' ? 'exito' : 'error'}>{documento.estado === 'emitido' ? 'Vigente' : 'Anulado'}</Insignia>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>
    </div>
  );
}
