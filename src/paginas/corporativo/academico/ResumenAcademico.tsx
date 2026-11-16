import { Activity, AlertTriangle, Award, ClipboardCheck, GraduationCap, Library, UserCheck, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarraProgreso } from '../../../componentes/rangos/BarraProgreso';
import { Insignia } from '../../../componentes/ui/Insignia';
import { Tarjeta } from '../../../componentes/ui/Tarjeta';
import { TarjetaKpi } from '../../../componentes/ui/TarjetaKpi';
import { nombresEventoLms, nombresTipoPrograma } from '../../../datos/academico/presentacionCampus';
import { useDatosAcademicos } from '../../../hooks/useDatosAcademicos';
import { esVigente } from '../../../motores/academico/accesos';
import { formatearFechaHora } from '../../../utilidades/fechas';
import { formatearNumero, formatearPorcentaje } from '../../../utilidades/formatos';
import { GraficosAcademicos } from '../../../componentes/campus/GraficosAcademicos';

export default function ResumenAcademico() {
  const datos = useDatosAcademicos();
  const vigentes = datos.filasMatriculas.filter((fila) => esVigente(fila.estado));
  const estudiantes = new Set(vigentes.map((fila) => fila.matricula.personaId)).size;
  const intentos = datos.campus.intentos;
  const aprobados = intentos.filter((intento) => intento.aprobado).length;
  const documentos = datos.campus.documentos.filter((documento) => documento.estado === 'emitido');
  const membresias = datos.filasMembresias.filter((fila) => esVigente(fila.estado)).length;
  const errores = datos.campus.eventos.filter((evento) => evento.estado === 'error').length;
  const porPrograma = datos.academico.programas.filter((programa) => programa.tipo !== 'mid').map((programa) => {
    const filas = datos.filasMatriculas.filter((fila) => fila.matricula.programaId === programa.id);
    const notas = filas.map((fila) => fila.nota.nota).filter((nota): nota is number => nota !== null);
    return {
      programa, total: filas.length, vigentes: filas.filter((fila) => esVigente(fila.estado)).length,
      avance: filas.length ? Math.round(filas.reduce((suma, fila) => suma + fila.avance, 0) / filas.length) : 0,
      aprobados: filas.filter((fila) => fila.nota.estado === 'aprobado').length,
      promedio: notas.length ? notas.reduce((suma, nota) => suma + nota, 0) / notas.length : null,
    };
  });
  const recientes = [...datos.campus.eventos].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 8);
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <TarjetaKpi etiqueta="Estudiantes activos" valor={estudiantes} icono={GraduationCap} tono="acento" />
        <TarjetaKpi etiqueta="Matrículas vigentes" valor={vigentes.length} icono={UserCheck} tono="primario" />
        <TarjetaKpi etiqueta="Evaluaciones aprobadas" valor={formatearPorcentaje(intentos.length ? Math.round((aprobados / intentos.length) * 1000) / 10 : 0)} icono={ClipboardCheck} tono="exito" />
        <TarjetaKpi etiqueta="Documentos vigentes" valor={documentos.length} icono={Award} tono="oro" />
        <TarjetaKpi etiqueta="Membresías activas" valor={membresias} icono={WalletCards} tono="info" />
        <TarjetaKpi etiqueta="Programas publicados" valor={datos.academico.programas.filter((programa) => programa.estado === 'publicado').length} icono={Library} tono="primario" />
        <TarjetaKpi etiqueta="Intentos registrados" valor={intentos.length} icono={Activity} tono="acento" />
        <TarjetaKpi etiqueta="Eventos con error" valor={errores} icono={AlertTriangle} tono={errores ? 'error' : 'exito'} />
      </div>
      <GraficosAcademicos intentos={intentos} programas={porPrograma.map((fila) => ({ codigo: fila.programa.codigo, nombre: fila.programa.nombre, avance: fila.avance, matriculas: fila.total }))} />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Tarjeta titulo="Desempeño por programa" subtitulo="Matrículas, avance promedio y aprobación" icono={Library}>
          <ul className="flex flex-col gap-4">
            {porPrograma.map((fila) => (
              <li key={fila.programa.id} className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                  <Link to={`/erick/programas/${fila.programa.id}`} className="font-semibold text-texto hover:text-acento">{fila.programa.nombre}</Link>
                  <span className="flex items-center gap-2"><Insignia tono="neutra">{nombresTipoPrograma[fila.programa.tipo]}</Insignia><Insignia tono={fila.programa.estado === 'publicado' ? 'exito' : 'neutra'}>{fila.programa.estado}</Insignia></span>
                </div>
                <BarraProgreso valor={fila.avance} maximo={100} etiqueta={`Avance promedio de ${fila.programa.nombre}`} />
                <p className="text-xs text-texto-2">{fila.total} matrículas ({fila.vigentes} vigentes) · avance promedio {fila.avance}% · {fila.aprobados} aprobados · nota promedio {fila.promedio !== null ? formatearNumero(fila.promedio, 2) : '-'}</p>
              </li>
            ))}
          </ul>
        </Tarjeta>
        <Tarjeta titulo="Actividad reciente del conector" icono={Activity} acciones={<Link to="/erick/integracion" className="text-[13px] font-semibold text-acento">Ver registro</Link>}>
          <ul className="flex flex-col gap-2">
            {recientes.map((evento) => (
              <li key={evento.id} className="rounded-xl bg-fondo px-3 py-2 text-[12.5px]">
                <div className="flex flex-wrap items-center justify-between gap-2"><b>{nombresEventoLms[evento.tipo]}</b><Insignia tono={evento.estado === 'error' ? 'error' : 'exito'}>{evento.estado}</Insignia></div>
                <p className="text-texto-2">{datos.nombrePersona(evento.personaId)} · {evento.detalle}</p>
                <p className="cifra text-[11px] text-texto-3">{formatearFechaHora(evento.fecha)}</p>
              </li>
            ))}
          </ul>
        </Tarjeta>
      </div>
    </div>
  );
}
