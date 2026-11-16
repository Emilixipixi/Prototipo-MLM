import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3, CircleCheck, CircleX } from 'lucide-react';
import { Tarjeta } from '../ui/Tarjeta';
import type { IntentoEvaluacion } from '../../tipos/academico';
import { distribuirNotas } from './distribucionNotas';
import { formatearNumero } from '../../utilidades/formatos';

export interface AvancePrograma { codigo: string; nombre: string; avance: number; matriculas: number }

export function GraficosAcademicos({ programas, intentos }: { programas: AvancePrograma[]; intentos: IntentoEvaluacion[] }) {
  const distribucion = distribuirNotas(intentos);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-2">
      <Tarjeta titulo="Avance promedio por programa" subtitulo="Porcentaje medio de avance de las matrículas" icono={BarChart3}>
        <div className="h-56" role="img" aria-label={`Avance promedio: ${programas.map((fila) => `${fila.nombre} ${fila.avance}%`).join(', ')}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={programas} margin={{ top: 6, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="codigo" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} interval={0} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip cursor={{ fill: '#F1F5F9' }} formatter={(valor) => [`${valor}%`, 'Avance promedio']}
                labelFormatter={(codigo) => { const fila = programas.find((item) => item.codigo === codigo); return fila ? `${fila.nombre} (${fila.matriculas} matrículas)` : String(codigo); }} />
              <Bar dataKey="avance" fill="#0E7490" radius={[4, 4, 0, 0]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Tarjeta>
      <Tarjeta titulo="Distribución de notas" subtitulo={`${intentos.length} intentos de evaluación (escala 0 a 20)`} icono={BarChart3}>
        <div className="h-56" role="img" aria-label={`Intentos por rango de nota: ${distribucion.map((fila) => `${fila.etiqueta} ${fila.cantidad}`).join(', ')}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribucion} margin={{ top: 6, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="etiqueta" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} interval={0} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#F1F5F9' }} formatter={(valor, _nombre, item) => [`${formatearNumero(Number(valor), 0)} intentos`, (item.payload as { aprobado: boolean }).aprobado ? 'Aprobados' : 'Desaprobados']} labelFormatter={(etiqueta) => `Nota ${etiqueta}`} />
              <Bar dataKey="cantidad" radius={[4, 4, 0, 0]} maxBarSize={44}>
                {distribucion.map((fila) => <Cell key={fila.etiqueta} fill={fila.aprobado ? '#15803D' : '#B91C1C'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-texto-2">
          <span className="inline-flex items-center gap-1.5"><CircleX className="size-3.5 text-error" aria-hidden />Desaprobado: 14 o menos</span>
          <span className="inline-flex items-center gap-1.5"><CircleCheck className="size-3.5 text-exito" aria-hidden />Aprobado: mayor a 14</span>
        </p>
      </Tarjeta>
    </div>
  );
}
