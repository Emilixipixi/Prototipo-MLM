import { useMemo, useState, type ReactNode } from 'react';
import { Layers, Users } from 'lucide-react';
import { estadosBono } from '../../datos/presentacionCompensacion';
import { presentacionMotores } from '../../datos/presentacionMotores';
import { ordenMotores } from '../../motores/ejecutarCorrida';
import { useCompensacionStore } from '../../store/useCompensacionStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import type { BonoComision, CorridaCalculo } from '../../tipos/compensacion';
import type { CodigoMotor } from '../../tipos/reglas';
import { formatearMonto } from '../../utilidades/formatos';
import { Insignia } from '../ui/Insignia';
import { Pestanas } from '../ui/Pestanas';
import { Tabla, type ColumnaTabla } from '../ui/Tabla';
import { DesgloseBono } from './DesgloseBono';

interface PropsResultados {
  corrida: CorridaCalculo;
  accionesPartida?: (bono: BonoComision) => ReactNode;
  pestanaInicial?: string;
}

interface FilaAfiliado { personaId: string; nombre: string; porMotor: Partial<Record<CodigoMotor, number>>; total: number; retenidas: number; }

export function ResultadosCorrida({ corrida, accionesPartida, pestanaInicial = 'afiliados' }: PropsResultados) {
  const personas = usePersonasStore((estado) => estado.personas);
  const ajustes = useCompensacionStore((estado) => estado.ajustes);
  const [pestana, setPestana] = useState(pestanaInicial);
  const [desglose, setDesglose] = useState<BonoComision | null>(null);
  const nombre = (id: string) => {
    const persona = personas.find((item) => item.id === id);
    return persona ? `${persona.nombres} ${persona.apellidos}` : id;
  };
  const totales = useMemo(() => ordenMotores.map((motor) => ({ motor, total: corrida.resultados.filter((bono) => bono.motor === motor).reduce((suma, bono) => suma + bono.monto, 0), partidas: corrida.resultados.filter((bono) => bono.motor === motor && bono.monto > 0).length })), [corrida]);
  const porAfiliado = useMemo(() => {
    const mapa = new Map<string, FilaAfiliado>();
    corrida.resultados.forEach((bono) => {
      const persona = personas.find((item) => item.id === bono.personaId);
      const fila = mapa.get(bono.personaId) ?? { personaId: bono.personaId, nombre: persona ? `${persona.nombres} ${persona.apellidos}` : bono.personaId, porMotor: {}, total: 0, retenidas: 0 };
      fila.porMotor[bono.motor] = (fila.porMotor[bono.motor] ?? 0) + bono.monto;
      fila.total += bono.monto;
      if (bono.estado === 'retenida') fila.retenidas += 1;
      mapa.set(bono.personaId, fila);
    });
    return [...mapa.values()].filter((fila) => fila.total > 0 || fila.retenidas > 0).sort((a, b) => b.total - a.total);
  }, [corrida, personas]);

  const columnasPartidas: ColumnaTabla<BonoComision>[] = [
    { clave: 'persona', titulo: 'Afiliado', principalEnMovil: true, valorOrden: (fila) => fila.personaId, render: (fila) => <div><p className="font-semibold">{nombre(fila.personaId)}</p><p className="cifra text-xs text-texto-2">{fila.personaId}</p></div> },
    { clave: 'base', titulo: 'Base', alinear: 'derecha', ocultarEnMovil: true, render: (fila) => <span className="cifra">{fila.base.toLocaleString('es-PE', { maximumFractionDigits: 2 })}</span> },
    { clave: 'calculo', titulo: 'Cálculo', ocultarEnMovil: true, render: (fila) => <span className="text-xs text-texto-2">{fila.elegible ? fila.calculo : `No elegible: ${fila.motivosNoElegible.join('. ')}`}</span> },
    { clave: 'monto', titulo: 'Monto', alinear: 'derecha', valorOrden: (fila) => fila.monto, render: (fila) => <span className="cifra font-semibold">{formatearMonto(fila.monto)}</span> },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <Insignia tono={estadosBono[fila.estado].tono} icono={estadosBono[fila.estado].icono}>{estadosBono[fila.estado].etiqueta}</Insignia> },
  ];
  const columnasAfiliados: ColumnaTabla<FilaAfiliado>[] = [
    { clave: 'persona', titulo: 'Afiliado', principalEnMovil: true, valorOrden: (fila) => fila.nombre, render: (fila) => <div><p className="font-semibold">{fila.nombre}</p><p className="cifra text-xs text-texto-2">{fila.personaId}{fila.retenidas > 0 ? ' · con partidas retenidas' : ''}</p></div> },
    ...ordenMotores.map((motor): ColumnaTabla<FilaAfiliado> => ({ clave: motor, titulo: presentacionMotores[motor].nombre, alinear: 'derecha', ocultarEnMovil: true, render: (fila) => <span className="cifra text-[12.5px]">{formatearMonto(fila.porMotor[motor] ?? 0)}</span> })),
    { clave: 'total', titulo: 'Total', alinear: 'derecha', valorOrden: (fila) => fila.total, render: (fila) => <span className="cifra font-bold">{formatearMonto(fila.total)}</span> },
  ];
  const motorActivo = ordenMotores.find((motor) => motor === pestana);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
        {totales.map(({ motor, total, partidas }) => {
          const Icono = presentacionMotores[motor].icono;
          return (
            <button key={motor} type="button" onClick={() => setPestana(motor)} aria-pressed={pestana === motor} className={`flex min-h-11 flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors ${pestana === motor ? 'border-acento bg-acento-suave' : 'border-borde bg-superficie hover:border-texto-3'}`}>
              <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-texto-2"><Icono className="size-3.5" aria-hidden />{presentacionMotores[motor].nombre}</span>
              <span className="cifra text-[15px] font-bold">{formatearMonto(total)}</span>
              <span className="text-[11px] text-texto-3">{partidas} partidas</span>
            </button>
          );
        })}
      </div>
      <Pestanas
        etiqueta="Vista de resultados"
        activa={pestana}
        alCambiar={setPestana}
        pestanas={[{ id: 'afiliados', texto: 'Por afiliado', icono: Users }, ...ordenMotores.map((motor) => ({ id: motor, texto: presentacionMotores[motor].nombre, icono: presentacionMotores[motor].icono }))]}
      />
      {pestana === 'afiliados' ? (
        <Tabla columnas={columnasAfiliados} filas={porAfiliado} claveFila={(fila) => fila.personaId} textoBusqueda={(fila) => `${fila.nombre} ${fila.personaId}`} placeholderBusqueda="Buscar afiliado" alSeleccionarFila={(fila) => setPestana(corrida.resultados.find((bono) => bono.personaId === fila.personaId && bono.monto > 0)?.motor ?? 'afiliados')} />
      ) : motorActivo ? (
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2 text-[12.5px] text-texto-2"><Layers className="size-4 text-acento" aria-hidden />{presentacionMotores[motorActivo].resumen} Selecciona una fila para ver el desglose.</p>
          <Tabla
            columnas={columnasPartidas}
            filas={corrida.resultados.filter((bono) => bono.motor === motorActivo).sort((a, b) => b.monto - a.monto)}
            claveFila={(fila) => fila.id}
            textoBusqueda={(fila) => `${nombre(fila.personaId)} ${fila.personaId}`}
            placeholderBusqueda="Buscar afiliado"
            alSeleccionarFila={setDesglose}
            accionesFila={accionesPartida}
            textoVacio="Este motor no generó partidas en la corrida."
          />
        </div>
      ) : null}
      <DesgloseBono bono={desglose} ajustes={ajustes} alCerrar={() => setDesglose(null)} versionReglasId={corrida.versionReglasId} />
    </div>
  );
}
