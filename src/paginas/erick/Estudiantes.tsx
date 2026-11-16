import { useMemo, useState } from 'react';
import { Award, BookOpenCheck, GraduationCap, MessageSquareText, UserCheck, Users, WalletCards, X } from 'lucide-react';
import { FichaAcademica } from '../../componentes/campus/FichaAcademica';
import { BarraProgreso } from '../../componentes/rangos/BarraProgreso';
import { Avatar } from '../../componentes/ui/Avatar';
import { BarraExportar } from '../../componentes/ui/BarraExportar';
import { BotonIcono } from '../../componentes/ui/BotonIcono';
import { Cajon } from '../../componentes/ui/Cajon';
import { ChipsFiltro } from '../../componentes/ui/ChipsFiltro';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tabla, type ColumnaTabla } from '../../componentes/ui/Tabla';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { TarjetaKpi } from '../../componentes/ui/TarjetaKpi';
import { useDatosAcademicos } from '../../hooks/useDatosAcademicos';
import { esVigente } from '../../motores/academico/accesos';
import { useCampusStore } from '../../store/useCampusStore';
import { useErickStore } from '../../store/useErickStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import type { Persona } from '../../tipos/persona';
import { formatearFecha, formatearFechaHora } from '../../utilidades/fechas';
import { formatearNumero } from '../../utilidades/formatos';

type Filtro = 'todos' | 'con_acceso' | 'sin_acceso' | 'membresia' | 'diploma' | 'afiliados';

interface FilaEstudiante {
  persona: Persona; programas: string[]; vigentes: number; avance: number; aprobados: number; documentos: number; diplomas: number;
  membresia: string | null; ultima: string | null;
}

export default function Estudiantes() {
  const datos = useDatosAcademicos();
  const documentos = useCampusStore((estado) => estado.documentos);
  const intentos = useCampusStore((estado) => estado.intentos);
  const observaciones = useErickStore((estado) => estado.observacionesDocentes);
  const personas = usePersonasStore((estado) => estado.personas);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [seleccion, setSeleccion] = useState<FilaEstudiante | null>(null);

  const filas = useMemo<FilaEstudiante[]>(() => {
    const ids = [...new Set(datos.filasMatriculas.map((fila) => fila.matricula.personaId))];
    return ids.map((id) => {
      const propias = datos.filasMatriculas.filter((fila) => fila.matricula.personaId === id);
      const persona = propias[0].persona ?? personas.find((item) => item.id === id);
      const docs = documentos.filter((documento) => documento.personaId === id && documento.estado === 'emitido');
      const membresia = datos.filasMembresias.filter((fila) => fila.membresia.personaId === id).sort((a, b) => b.membresia.vencimiento.localeCompare(a.membresia.vencimiento))[0];
      const ultima = intentos.filter((intento) => intento.personaId === id).map((intento) => intento.fin).sort().at(-1) ?? null;
      return {
        persona: persona as Persona, programas: propias.map((fila) => fila.programa),
        vigentes: propias.filter((fila) => esVigente(fila.estado)).length,
        avance: Math.round(propias.reduce((suma, fila) => suma + fila.avance, 0) / propias.length),
        aprobados: propias.filter((fila) => fila.nota.estado === 'aprobado').length,
        documentos: docs.length, diplomas: docs.filter((documento) => documento.tipo === 'diploma').length,
        membresia: membresia ? (esVigente(membresia.estado) ? membresia.plan : `${membresia.plan} (vencida)`) : null, ultima,
      };
    }).filter((fila) => Boolean(fila.persona));
  }, [datos, documentos, intentos, personas]);

  const visibles = filas.filter((fila) => filtro === 'todos'
    || (filtro === 'con_acceso' && fila.vigentes > 0) || (filtro === 'sin_acceso' && fila.vigentes === 0)
    || (filtro === 'membresia' && fila.membresia !== null && !fila.membresia.includes('vencida'))
    || (filtro === 'diploma' && fila.diplomas > 0) || (filtro === 'afiliados' && fila.persona.tipo === 'empresario'));

  const columnas: ColumnaTabla<FilaEstudiante>[] = [
    {
      clave: 'estudiante', titulo: 'Estudiante', principalEnMovil: true, valorOrden: (fila) => `${fila.persona.apellidos} ${fila.persona.nombres}`,
      render: (fila) => (
        <span className="flex items-center gap-2.5">
          <Avatar nombres={fila.persona.nombres} apellidos={fila.persona.apellidos} />
          <span className="min-w-0"><b className="block truncate">{fila.persona.nombres} {fila.persona.apellidos}</b><span className="cifra block text-[11px] text-texto-3">{fila.persona.id} · {fila.persona.pais}</span></span>
        </span>
      ),
    },
    { clave: 'programas', titulo: 'Programas', valorOrden: (fila) => fila.programas.length, render: (fila) => <span className="text-[12.5px]">{fila.programas.join(', ')}</span> },
    { clave: 'avance', titulo: 'Avance', valorOrden: (fila) => fila.avance, render: (fila) => <span className="flex min-w-[110px] items-center gap-2"><span className="flex-1"><BarraProgreso valor={fila.avance} maximo={100} etiqueta={`Avance de ${fila.persona.nombres}`} /></span><span className="cifra text-xs">{fila.avance}%</span></span> },
    { clave: 'acceso', titulo: 'Acceso', valorOrden: (fila) => fila.vigentes, render: (fila) => (fila.vigentes > 0 ? <Insignia tono="exito" icono={UserCheck}>{fila.vigentes} vigente{fila.vigentes === 1 ? '' : 's'}</Insignia> : <Insignia tono="retenida">Sin acceso vigente</Insignia>) },
    { clave: 'documentos', titulo: 'Documentos', ocultarEnMovil: true, valorOrden: (fila) => fila.documentos, render: (fila) => <span className="inline-flex items-center gap-1 text-[12.5px]"><Award className="size-3.5 text-oro" aria-hidden />{fila.documentos}{fila.diplomas ? ` (${fila.diplomas} diploma)` : ''}</span> },
    { clave: 'membresia', titulo: 'Membresía', ocultarEnMovil: true, valorOrden: (fila) => fila.membresia ?? '', render: (fila) => <span className="text-[12.5px] text-texto-2">{fila.membresia ?? '-'}</span> },
    { clave: 'ultima', titulo: 'Última evaluación', ocultarEnMovil: true, valorOrden: (fila) => fila.ultima ?? '', render: (fila) => <span className="cifra text-xs">{fila.ultima ? formatearFecha(fila.ultima) : '-'}</span> },
  ];

  const notasSeleccion = seleccion ? observaciones.filter((item) => item.personaId === seleccion.persona.id).sort((a, b) => b.fecha.localeCompare(a.fecha)) : [];
  const nombre = (id: string) => { const persona = personas.find((item) => item.id === id); return persona ? `${persona.nombres} ${persona.apellidos}` : id; };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <TarjetaKpi etiqueta="Estudiantes" valor={formatearNumero(filas.length)} icono={Users} tono="primario" />
        <TarjetaKpi etiqueta="Con acceso vigente" valor={formatearNumero(filas.filter((fila) => fila.vigentes > 0).length)} icono={UserCheck} tono="exito" />
        <TarjetaKpi etiqueta="Con membresía activa" valor={formatearNumero(filas.filter((fila) => fila.membresia && !fila.membresia.includes('vencida')).length)} icono={WalletCards} tono="acento" />
        <TarjetaKpi etiqueta="Con diploma" valor={formatearNumero(filas.filter((fila) => fila.diplomas > 0).length)} icono={GraduationCap} tono="oro" />
      </div>
      <Tarjeta titulo="Directorio de estudiantes" subtitulo="Toca un estudiante para ver su ficha académica completa" icono={BookOpenCheck} sinRelleno>
        <Tabla columnas={columnas} filas={visibles} claveFila={(fila) => fila.persona.id} porPagina={12}
          textoBusqueda={(fila) => `${fila.persona.id} ${fila.persona.nombres} ${fila.persona.apellidos} ${fila.persona.correo} ${fila.programas.join(' ')}`}
          placeholderBusqueda="Buscar por nombre, código, correo o programa" alSeleccionarFila={setSeleccion} textoVacio="No hay estudiantes con este filtro."
          filtros={<ChipsFiltro etiqueta="Filtrar estudiantes" activo={filtro} alCambiar={setFiltro} opciones={[
            { valor: 'todos', texto: 'Todos' }, { valor: 'con_acceso', texto: 'Con acceso' }, { valor: 'sin_acceso', texto: 'Sin acceso' },
            { valor: 'membresia', texto: 'Con membresía' }, { valor: 'diploma', texto: 'Con diploma' }, { valor: 'afiliados', texto: 'Afiliados MLM' },
          ]} />}
          accionesCabecera={<BarraExportar modulo="academico" nombreArchivo="estudiantes-erick" filas={() => visibles.map((fila) => ({
            Codigo: fila.persona.id, Estudiante: `${fila.persona.nombres} ${fila.persona.apellidos}`, Correo: fila.persona.correo, Pais: fila.persona.pais,
            Programas: fila.programas.join(' | '), Avance: fila.avance, Vigentes: fila.vigentes, Documentos: fila.documentos, Membresia: fila.membresia ?? '',
          }))} />} />
      </Tarjeta>
      <Cajon abierto={Boolean(seleccion)} alCerrar={() => setSeleccion(null)} etiqueta="Ficha del estudiante" lado="derecha" ancho="w-[94vw] max-w-[760px]">
        {seleccion && (
          <div className="flex h-full flex-col overflow-y-auto bg-fondo">
            <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-borde bg-superficie px-4 py-3">
              <Avatar nombres={seleccion.persona.nombres} apellidos={seleccion.persona.apellidos} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold text-texto">{seleccion.persona.nombres} {seleccion.persona.apellidos}</p>
                <p className="cifra truncate text-[11.5px] text-texto-2">{seleccion.persona.id} · {seleccion.persona.correo}</p>
              </div>
              <BotonIcono icono={X} etiqueta="Cerrar ficha" onClick={() => setSeleccion(null)} />
            </div>
            <div className="flex flex-col gap-4 p-4">
              <Tarjeta titulo="Observaciones docentes" icono={MessageSquareText}>
                {notasSeleccion.length === 0 ? <p className="text-[13px] text-texto-2">Sin observaciones registradas.</p> : (
                  <ul className="flex flex-col gap-2">
                    {notasSeleccion.map((nota) => <li key={nota.id} className="rounded-xl bg-fondo px-3 py-2.5 text-[13px]"><p>{nota.texto}</p><p className="mt-1 text-[11.5px] text-texto-2">{nombre(nota.docenteId)} · {formatearFechaHora(nota.fecha)}</p></li>)}
                  </ul>
                )}
              </Tarjeta>
              <FichaAcademica personaId={seleccion.persona.id} />
            </div>
          </div>
        )}
      </Cajon>
    </div>
  );
}
