import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, BadgeCheck, GraduationCap, Link2, Network, ShieldCheck, ShoppingBag, UserPlus,
} from 'lucide-react';
import { ImagenProducto } from '../../componentes/catalogo/ImagenProducto';
import { TarjetaProducto } from '../../componentes/catalogo/TarjetaProducto';
import { Boton } from '../../componentes/ui/Boton';
import { Campo } from '../../componentes/ui/Campo';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { useToast } from '../../componentes/ui/useToast';
import { categorias } from '../../datos/presentacionCatalogo';
import { useCarritoStore } from '../../store/useCarritoStore';
import { useCatalogoStore } from '../../store/useCatalogoStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { CategoriaProducto, Producto } from '../../tipos/catalogo';
import { formatearMonto } from '../../utilidades/formatos';
import { puedeVerVolumen } from '../../utilidades/visibilidad';

const pasos = [
  { icono: ShoppingBag, titulo: 'Compra', texto: 'Elige bienes, servicios o programas. Cada compra confirmada registra su precio, VP y VC por separado.' },
  { icono: UserPlus, titulo: 'Afíliate', texto: 'Regístrate con el enlace de tu patrocinador. Tu relación de patrocinio y tu posición en la red se gestionan por separado.' },
  { icono: GraduationCap, titulo: 'Fórmate', texto: 'Accede a programas de ERIC S.A.C. Tu estado académico podrá considerarse como condición de rango.' },
];

const garantias = [
  { icono: Network, texto: 'Dos estructuras independientes: Unilevel y Trinaria' },
  { icono: ShieldCheck, texto: 'Trazabilidad de cada venta, ajuste y decisión' },
  { icono: BadgeCheck, texto: 'Simulación y revisión antes de cualquier liquidación' },
];

export default function Inicio() {
  const todos = useCatalogoStore((estado) => estado.productos);
  const productos = useMemo(() => todos.filter((producto) => producto.activo), [todos]);
  const agregar = useCarritoStore((estado) => estado.agregar);
  const persona = usePersonaSesion();
  const navegar = useNavigate();
  const toast = useToast();
  const [codigo, setCodigo] = useState('');
  const mostrarVolumen = puedeVerVolumen(persona);
  const destacados = productos.slice(0, 3);

  const agregarProducto = (producto: Producto) => {
    agregar(producto.id);
    toast.exito('Agregado al carrito', producto.nombre);
  };

  const irARegistro = (evento: FormEvent) => {
    evento.preventDefault();
    const limpio = codigo.trim().toUpperCase();
    navegar(limpio ? `/registro?ref=${encodeURIComponent(limpio)}` : '/registro');
  };

  return (
    <div className="flex flex-col gap-12 sm:gap-16">
      <section className="fondo-calificacion relative -mx-4 overflow-hidden px-4 py-10 text-white sm:mx-0 sm:rounded-[24px] sm:px-10 sm:py-14 lg:px-14">
        <span className="absolute -right-24 -top-24 size-80 rounded-full border-[48px] border-acento-brillo/10" aria-hidden />
        <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-acento-brillo">Plataforma comercial multinivel</p>
            <h2 className="mt-3 text-[30px] font-extrabold leading-[1.1] tracking-tight sm:text-[42px]">Bienes, servicios y formación en una sola plataforma.</h2>
            <p className="mt-4 max-w-xl text-[15px] text-[#C7D3E6]">
              Compra con claridad, conoce el volumen que genera cada pedido y sigue tu crecimiento con información trazable.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <EnlaceBoton to="/catalogo" variante="acento" icono={ShoppingBag}>Ver catálogo</EnlaceBoton>
              <EnlaceBoton to="/registro" variante="secundario" icono={UserPlus} className="border-white/20 bg-white/10 text-white hover:bg-white/15">Afiliarme</EnlaceBoton>
            </div>
            <ul className="mt-8 flex flex-col gap-2.5">
              {garantias.map(({ icono: Icono, texto }) => (
                <li key={texto} className="flex items-center gap-2.5 text-[13px] text-[#C7D3E6]">
                  <Icono className="size-4 shrink-0 text-acento-brillo" aria-hidden />
                  {texto}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mx-auto hidden w-full max-w-sm sm:block">
            {destacados.map((producto, indice) => (
              <div
                key={producto.id}
                className="mb-3 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur"
                style={{ marginLeft: `${indice * 24}px` }}
              >
                <ImagenProducto producto={producto} tamano="sm" className="size-16 shrink-0 rounded-xl" />
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-bold">{producto.nombre}</p>
                  <p className="text-[11.5px] text-[#A9BCD9]">{categorias[producto.categoria].nombre}</p>
                  <p className="cifra mt-0.5 text-sm font-semibold">{formatearMonto(producto.precio, producto.moneda)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="titulo-categorias">
        <h2 id="titulo-categorias" className="text-xl font-extrabold tracking-tight text-texto sm:text-2xl">Explora por categoría</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {(Object.entries(categorias) as Array<[CategoriaProducto, (typeof categorias)[CategoriaProducto]]>).map(([clave, categoria]) => {
            const Icono = categoria.icono;
            const cantidad = productos.filter((producto) => producto.categoria === clave).length;
            return (
              <button
                key={clave}
                type="button"
                onClick={() => navegar(`/catalogo?categoria=${clave}`)}
                className="group flex min-h-11 items-start gap-4 rounded-tarjeta border border-borde bg-superficie p-5 text-left shadow-tarjeta transition-colors hover:border-acento"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl text-white" style={{ background: `linear-gradient(135deg, ${categoria.degradado[0]}, ${categoria.degradado[1]})` }}>
                  <Icono className="size-6" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[15px] font-bold text-texto">{categoria.plural}</span>
                    <ArrowRight className="size-4 text-texto-3 transition-transform group-hover:translate-x-0.5 group-hover:text-acento" aria-hidden />
                  </span>
                  <span className="mt-1 block text-[12.5px] text-texto-2">{categoria.descripcion}</span>
                  <span className="cifra mt-2 block text-xs font-semibold text-acento">{cantidad} {cantidad === 1 ? 'disponible' : 'disponibles'}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="titulo-destacados">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="titulo-destacados" className="text-xl font-extrabold tracking-tight text-texto sm:text-2xl">Destacados</h2>
            <p className="mt-1 text-[13.5px] text-texto-2">{mostrarVolumen ? 'Como afiliado ves el VP y el VC de cada producto.' : 'Precios de referencia de la demostración.'}</p>
          </div>
          <EnlaceBoton to="/catalogo" variante="secundario" tamano="sm" icono={ArrowRight}>Ver todo el catálogo</EnlaceBoton>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destacados.map((producto) => <TarjetaProducto key={producto.id} producto={producto} mostrarVolumen={mostrarVolumen} alAgregar={agregarProducto} />)}
        </div>
      </section>

      <section aria-labelledby="titulo-pasos" className="rounded-[24px] border border-borde bg-superficie p-6 shadow-tarjeta sm:p-10">
        <h2 id="titulo-pasos" className="text-xl font-extrabold tracking-tight text-texto sm:text-2xl">Cómo funciona</h2>
        <ol className="mt-6 grid gap-6 md:grid-cols-3">
          {pasos.map(({ icono: Icono, titulo, texto }, indice) => (
            <li key={titulo} className="flex gap-4">
              <span className="cifra grid size-10 shrink-0 place-items-center rounded-xl bg-primario-suave text-sm font-semibold text-primario">{indice + 1}</span>
              <div>
                <p className="flex items-center gap-2 text-[15px] font-bold text-texto"><Icono className="size-[18px] text-acento" aria-hidden />{titulo}</p>
                <p className="mt-1 text-[13px] text-texto-2">{texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="titulo-enlace" className="grid items-center gap-6 rounded-[24px] bg-primario-suave p-6 sm:p-10 lg:grid-cols-2">
        <div>
          <h2 id="titulo-enlace" className="text-xl font-extrabold tracking-tight text-primario sm:text-2xl">¿Tienes un enlace de patrocinador?</h2>
          <p className="mt-2 text-[13.5px] text-texto-2">Escribe el código de quien te invitó. Tu registro conservará a ese patrocinador.</p>
        </div>
        <form onSubmit={irARegistro} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Campo etiqueta="Código de patrocinador" icono={Link2} placeholder="Ejemplo: DEMO-A01" value={codigo} onChange={(evento) => setCodigo(evento.target.value)} className="flex-1" />
          <Boton type="submit" iconoDerecha={ArrowRight}>Continuar</Boton>
        </form>
      </section>
    </div>
  );
}
