import { Award, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Insignia } from '../ui/Insignia';
import { Tarjeta } from '../ui/Tarjeta';
import { estadosAcceso, estadosNota } from '../../datos/academico/presentacionCampus';
import { useCampusPersona } from '../../hooks/useCampusPersona';
import { nombresDocumento } from '../../servicios/certificados';
import { nombresOrigen } from '../../servicios/matriculas';
import { useCampusStore } from '../../store/useCampusStore';
import { formatearFecha } from '../../utilidades/fechas';
import { formatearNumero } from '../../utilidades/formatos';
import { RegistroEventosLms } from './RegistroEventosLms';
import { usePersonaSesion } from '../../store/useSesionStore';

export function FichaAcademica({ personaId }: { personaId: string }) {
  const datos = useCampusPersona(personaId);
  const administraErick = usePersonaSesion()?.perfil === 'admin_educativo';
  const documentos = useCampusStore((estado) => estado.documentos).filter((documento) => documento.personaId === personaId);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
        <Tarjeta titulo="Matrículas y notas" subtitulo="Campus ERICK" icono={GraduationCap}>
          {datos.programas.length === 0 ? <p className="text-[13px] text-texto-2">Sin matrículas en el campus.</p> : (
            <ul className="flex flex-col gap-2">
              {datos.programas.map((item) => (
                <li key={item.matricula.id} className="flex flex-col gap-1 rounded-xl bg-fondo px-3 py-2.5 text-[13px]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">{item.programa.nombre}</span>
                    <span className="cifra font-bold">{item.resumen.nota.nota !== null ? formatearNumero(item.resumen.nota.nota, 2) : '-'}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-texto-2">
                    <span className="cifra">{item.matricula.id}</span>·<span>{nombresOrigen[item.matricula.origen]}</span>·<span>vence {formatearFecha(item.matricula.vencimiento)}</span>·<span>avance {item.resumen.avance}%</span>
                    <Insignia tono={estadosAcceso[item.estado].tono}>{estadosAcceso[item.estado].texto}</Insignia>
                    <Insignia tono={estadosNota[item.resumen.nota.estado].tono}>{estadosNota[item.resumen.nota.estado].texto}</Insignia>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {datos.membresia && <p className="mt-3 text-[12.5px] text-texto-2">Membresía {datos.plan?.nombre ?? ''}: {datos.estadoMembresia ? estadosAcceso[datos.estadoMembresia].texto.toLowerCase() : ''}, vence el {formatearFecha(datos.membresia.vencimiento)}.</p>}
          {administraErick
            ? <Link to="/erick/matriculas" className="mt-3 inline-flex min-h-11 items-center text-[13px] font-semibold text-acento md:min-h-0">Gestionar matrículas</Link>
            : <p className="mt-3 text-[12.5px] text-texto-2">Las matrículas se gestionan en la plataforma ERICK S.A.C.</p>}
        </Tarjeta>
        <Tarjeta titulo="Certificados y diplomas" icono={Award}>
          {documentos.length === 0 ? <p className="text-[13px] text-texto-2">Sin documentos emitidos.</p> : (
            <ul className="flex flex-col gap-2">
              {documentos.map((documento) => (
                <li key={documento.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-fondo px-3 py-2.5 text-[13px]">
                  <span className="cifra text-xs">{documento.codigo}</span>
                  <span className="min-w-0 flex-1">{nombresDocumento[documento.tipo]} · nota {formatearNumero(documento.nota, 2)}</span>
                  <Insignia tono={documento.estado === 'emitido' ? 'exito' : 'error'}>{documento.estado === 'emitido' ? 'Vigente' : 'Anulado'}</Insignia>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>
      <RegistroEventosLms personaId={personaId} />
    </div>
  );
}
