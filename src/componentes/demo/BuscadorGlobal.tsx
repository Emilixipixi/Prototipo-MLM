import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, LayoutGrid, Receipt, Search, UserRound, type LucideIcon } from 'lucide-react';
import { useClicFuera } from '../../hooks/useClicFuera';
import { pantallas } from '../../rutas/pantallas';
import { usePedidosStore } from '../../store/usePedidosStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import { esCorporativo } from '../../utilidades/visibilidad';

interface Resultado { clave: string; titulo: string; detalle: string; ruta: string; icono: LucideIcon; }

const normalizar = (texto: string) => texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function BuscadorGlobal() {
  const sesion = usePersonaSesion();
  const personas = usePersonasStore((estado) => estado.personas);
  const pedidos = usePedidosStore((estado) => estado.pedidos);
  const navegar = useNavigate();
  const [texto, setTexto] = useState('');
  const [abierto, setAbierto] = useState(false);
  const referencia = useClicFuera<HTMLDivElement>(abierto, () => setAbierto(false));
  const corporativo = esCorporativo(sesion);
  const prefijo = corporativo ? '/corporativo' : '/afiliado';

  const resultados = useMemo<Resultado[]>(() => {
    const termino = normalizar(texto.trim());
    if (termino.length < 2) return [];
    const lista: Resultado[] = pantallas
      .filter((pantalla) => pantalla.patron.startsWith(prefijo) && !pantalla.patron.includes(':') && normalizar(`${pantalla.nombre} ${pantalla.numero}`).includes(termino))
      .map((pantalla) => ({ clave: pantalla.patron, titulo: pantalla.nombre, detalle: `Pantalla ${pantalla.numero}`, ruta: pantalla.patron, icono: LayoutGrid }));
    if (corporativo) {
      personas.filter((persona) => normalizar(`${persona.nombres} ${persona.apellidos} ${persona.codigo}`).includes(termino)).slice(0, 6)
        .forEach((persona) => lista.push({ clave: persona.id, titulo: `${persona.nombres} ${persona.apellidos}`, detalle: persona.codigo, ruta: `/corporativo/usuarios/${persona.id}`, icono: UserRound }));
    }
    pedidos.filter((pedido) => (corporativo || pedido.compradorId === sesion?.id || pedido.referenteId === sesion?.id) && normalizar(pedido.id).includes(termino)).slice(0, 6)
      .forEach((pedido) => lista.push({ clave: pedido.id, titulo: pedido.id, detalle: `Pedido ${pedido.estado} · ${pedido.periodoId}`, ruta: `/pedido/${pedido.id}`, icono: Receipt }));
    return lista.slice(0, 10);
  }, [texto, personas, pedidos, corporativo, prefijo, sesion]);

  const elegir = (resultado: Resultado) => {
    setTexto('');
    setAbierto(false);
    navegar(resultado.ruta);
  };

  return (
    <div ref={referencia} className="relative hidden w-[260px] xl:block">
      <label className="flex min-h-10 items-center gap-2 rounded-xl border border-borde bg-superficie px-3 text-texto-3 focus-within:border-acento">
        <Search className="size-4 shrink-0" aria-hidden />
        <span className="sr-only">Búsqueda global</span>
        <input
          value={texto}
          onChange={(evento) => { setTexto(evento.target.value); setAbierto(true); }}
          onFocus={() => setAbierto(true)}
          onKeyDown={(evento) => { if (evento.key === 'Enter' && resultados[0]) elegir(resultados[0]); }}
          placeholder={corporativo ? 'Buscar afiliado, código o pedido' : 'Buscar pantalla o pedido'}
          className="min-w-0 flex-1 bg-transparent py-2 text-[13px] text-texto outline-none placeholder:text-texto-3"
        />
      </label>
      {abierto && texto.trim().length >= 2 && (
        <div role="listbox" className="absolute right-0 top-full z-30 mt-1.5 w-[340px] overflow-hidden rounded-xl border border-borde bg-superficie shadow-flotante">
          {resultados.length === 0 ? <p className="flex items-center gap-2 p-3 text-[12.5px] text-texto-2"><FileText className="size-4" aria-hidden />Sin resultados para "{texto}".</p> : resultados.map((resultado) => (
            <button key={resultado.clave} type="button" role="option" aria-selected={false} onClick={() => elegir(resultado)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-fondo">
              <resultado.icono className="size-4 shrink-0 text-acento" aria-hidden />
              <span className="min-w-0"><span className="block truncate text-[13px] font-semibold">{resultado.titulo}</span><span className="cifra block text-[11.5px] text-texto-2">{resultado.detalle}</span></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
