import { InsigniaRun } from '../rangos/InsigniaRun';
import { Avatar } from '../ui/Avatar';
import { unirClases } from '../../utilidades/clases';
import { formatearNumero } from '../../utilidades/formatos';
import type { ResumenNodo } from './tipos';

interface PropsNodoPersona {
  nodo: ResumenNodo;
  resaltado?: boolean;
  esRaiz?: boolean;
  colorBorde?: string;
  alSeleccionar: (nodo: ResumenNodo) => void;
  anchoFijo?: boolean;
  nota?: string;
}

export function NodoPersona({ nodo, resaltado = false, esRaiz = false, colorBorde, alSeleccionar, anchoFijo = false, nota }: PropsNodoPersona) {
  const [nombres, ...resto] = nodo.nombre.split(' ');
  return (
    <button
      type="button"
      id={`nodo-${nodo.personaId}`}
      onClick={() => alSeleccionar(nodo)}
      className={unirClases(
        'relative flex min-h-11 min-w-0 items-center gap-2.5 overflow-hidden rounded-[14px] border px-3 py-2 text-left transition-shadow',
        anchoFijo ? 'w-[228px]' : 'w-full',
        esRaiz ? 'border-primario bg-primario text-white' : 'border-borde bg-superficie text-texto hover:shadow-tarjeta',
        resaltado && 'ring-4 ring-acento-brillo/60',
        nodo.estado !== 'activo' && !esRaiz && 'bg-slate-50',
      )}
      style={colorBorde && !esRaiz ? { borderColor: colorBorde, boxShadow: `inset 4px 0 0 ${colorBorde}` } : undefined}
    >
      <Avatar nombres={nombres} apellidos={resto.join(' ')} tamano="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-bold">{nodo.nombre}</span>
        <span className={unirClases('flex min-w-0 items-center gap-1.5 text-[11px]', esRaiz ? 'text-[#9FDFF0]' : 'text-texto-2')}>
          {anchoFijo && !esRaiz && <InsigniaRun run={nodo.runCobro} tipo="cobro" className="shrink-0 px-1.5 py-0 text-[9.5px]" />}
          <span className="cifra truncate">{nodo.codigo} · {formatearNumero(nodo.vpCiclo)} VP</span>
        </span>
        {nota && <span className={unirClases('block truncate text-[10.5px] font-semibold', esRaiz ? 'text-[#F2C46D]' : 'text-acento')}>{nota}</span>}
      </span>
      {!esRaiz && !anchoFijo && <InsigniaRun run={nodo.runCobro} tipo="cobro" className="shrink-0 px-1.5 text-[10px]" />}
    </button>
  );
}
