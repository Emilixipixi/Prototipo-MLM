import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BadgeCheck, Briefcase, CircleAlert, CircleCheck, FileText, GraduationCap, IdCard, Link2, LogIn, Mail, Network, Phone,
  ShoppingBag, User, UserPlus, type LucideIcon,
} from 'lucide-react';
import { Avatar } from '../../componentes/ui/Avatar';
import { Boton } from '../../componentes/ui/Boton';
import { Campo } from '../../componentes/ui/Campo';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { EstadoError } from '../../componentes/ui/EstadoError';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { useToast } from '../../componentes/ui/useToast';
import { registrarPersona } from '../../servicios/red';
import { usePersonasStore } from '../../store/usePersonasStore';
import { rutaInicioPorPerfil, useSesionStore } from '../../store/useSesionStore';
import type { Persona } from '../../tipos/persona';
import { unirClases } from '../../utilidades/clases';

type TipoRegistro = 'cliente' | 'alumno' | 'empresario';

const opcionesTipo: Array<{ valor: TipoRegistro; titulo: string; icono: LucideIcon; capacidades: string[] }> = [
  { valor: 'cliente', titulo: 'Cliente', icono: ShoppingBag, capacidades: ['Compra bienes y servicios', 'Consulta sus pedidos y comprobantes', 'No participa en comisiones'] },
  { valor: 'alumno', titulo: 'Alumno', icono: GraduationCap, capacidades: ['Accede a programas formativos', 'Ve su estado académico (dato de prueba)', 'No participa en comisiones'] },
  { valor: 'empresario', titulo: 'Empresario independiente', icono: Briefcase, capacidades: ['Participa en la red Unilevel y Trinaria', 'Puede generar comisiones según reglas', 'Queda pendiente hasta que corporativo asigne su posición'] },
];

interface Formulario { nombres: string; apellidos: string; correo: string; telefono: string; documento: string; acepta: boolean; }

const vacio: Formulario = { nombres: '', apellidos: '', correo: '', telefono: '', documento: '', acepta: false };

function TarjetaPatrocinador({ patrocinador }: { patrocinador: Persona }) {
  return (
    <div className="fondo-calificacion relative overflow-hidden rounded-tarjeta p-5 text-white shadow-tarjeta">
      <span className="absolute -right-10 -top-10 size-32 rounded-full border-[20px] border-acento-brillo/10" aria-hidden />
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-acento-brillo"><Link2 className="size-4" aria-hidden />Te invita</p>
      <div className="mt-3 flex items-center gap-3">
        <Avatar nombres={patrocinador.nombres} apellidos={patrocinador.apellidos} tamano="lg" />
        <div className="min-w-0">
          <p className="truncate text-lg font-extrabold">{patrocinador.nombres} {patrocinador.apellidos}</p>
          <p className="cifra text-[13px] text-[#9FDFF0]">{patrocinador.codigo}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-[#A9BCD9]">Este patrocinador queda registrado con tu alta y no se puede cambiar desde el formulario.</p>
    </div>
  );
}

export default function Registro() {
  const [parametros] = useSearchParams();
  const referencia = parametros.get('ref')?.trim().toUpperCase() ?? '';
  const candidato = usePersonasStore((estado) => estado.personas.find((persona) => persona.id === referencia));
  const patrocinador = candidato && candidato.tipo === 'empresario' && candidato.estado !== 'bloqueado' ? candidato : undefined;
  const iniciarSesion = useSesionStore((estado) => estado.iniciarSesion);
  const navegar = useNavigate();
  const toast = useToast();
  const [tipo, setTipo] = useState<TipoRegistro>('cliente');
  const [datos, setDatos] = useState<Formulario>(vacio);
  const [errores, setErrores] = useState<Partial<Record<keyof Formulario, string>>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [registrada, setRegistrada] = useState<Persona | null>(null);

  const cambiar = (campo: keyof Formulario, valor: string | boolean) => setDatos((actual) => ({ ...actual, [campo]: valor }));

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    const nuevos: Partial<Record<keyof Formulario, string>> = {};
    if (datos.nombres.trim().length < 2) nuevos.nombres = 'Ingresa tus nombres.';
    if (datos.apellidos.trim().length < 2) nuevos.apellidos = 'Ingresa tus apellidos.';
    if (!/^\S+@\S+\.\S+$/.test(datos.correo.trim())) nuevos.correo = 'Ingresa un correo válido.';
    if (datos.telefono.trim().length < 6) nuevos.telefono = 'Ingresa un teléfono de contacto.';
    if (datos.documento.trim().length < 4) nuevos.documento = 'Ingresa tu documento (dato ficticio).';
    if (!datos.acepta) nuevos.acepta = 'Debes aceptar los términos de la demostración.';
    setErrores(nuevos);
    setErrorGeneral(null);
    if (Object.keys(nuevos).length > 0) return;
    const resultado = registrarPersona({ ...datos, tipo, patrocinadorId: patrocinador?.id ?? null });
    if (!resultado.ok) {
      setErrorGeneral(resultado.error);
      return;
    }
    setRegistrada(resultado.valor);
    toast.exito('Registro completado', `Tu código es ${resultado.valor.codigo}.`);
  };

  const ingresar = () => {
    if (!registrada) return;
    const persona = iniciarSesion(registrada.id);
    if (persona) navegar(rutaInicioPorPerfil(persona.perfil));
  };

  if (registrada) {
    const esEmpresario = registrada.tipo === 'empresario';
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <Tarjeta>
          <div className="flex flex-col items-center text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-green-100 text-exito"><CircleCheck className="size-7" aria-hidden /></span>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-texto">Registro completado</h2>
            <p className="mt-1 text-[13.5px] text-texto-2">Guardamos tu alta en la demostración. Estos son tus datos.</p>
          </div>
          <dl className="mt-6 grid gap-3 rounded-xl bg-fondo p-4 text-[13.5px] sm:grid-cols-2">
            <div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Código asignado</dt><dd className="cifra mt-0.5 font-semibold text-texto">{registrada.codigo}</dd></div>
            <div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Tipo</dt><dd className="mt-0.5 font-semibold capitalize text-texto">{registrada.tipo}</dd></div>
            <div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">{esEmpresario ? 'Patrocinador' : 'Referente'}</dt><dd className="mt-0.5 font-semibold text-texto">{patrocinador ? `${patrocinador.nombres} ${patrocinador.apellidos} (${patrocinador.codigo})` : 'Sin patrocinador: corporativo lo asignará'}</dd></div>
            <div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Estado de la cuenta</dt><dd className="mt-0.5 font-semibold capitalize text-texto">{registrada.estado}</dd></div>
          </dl>
          {esEmpresario && (
            <ol className="mt-5 flex flex-col gap-3">
              {[
                { icono: CircleCheck, texto: 'Patrocinio registrado en la genealogía Unilevel.', hecho: true },
                { icono: Network, texto: 'Corporativo asignará tu posición en la red Trinaria (brazo A, B o C). Tu patrocinador no cambia.', hecho: false },
                { icono: BadgeCheck, texto: 'Al asignarse la posición, tu cuenta pasa a activa.', hecho: false },
              ].map(({ icono: Icono, texto, hecho }) => (
                <li key={texto} className="flex items-start gap-3 text-[13.5px]">
                  <span className={unirClases('grid size-8 shrink-0 place-items-center rounded-full', hecho ? 'bg-green-100 text-exito' : 'bg-slate-100 text-texto-3')}><Icono className="size-4" aria-hidden /></span>
                  <span className={hecho ? 'text-texto' : 'text-texto-2'}>{texto}</span>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
            <EnlaceBoton to="/catalogo" variante="secundario" icono={ShoppingBag}>Ver catálogo</EnlaceBoton>
            <Boton icono={LogIn} onClick={ingresar}>Ingresar con mi cuenta</Boton>
          </div>
        </Tarjeta>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-8">
      <aside className="flex flex-col gap-4 lg:sticky lg:top-32 lg:self-start">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-texto sm:text-[28px]">Crear cuenta</h2>
          <p className="mt-1 text-[13.5px] text-texto-2">Completa tus datos para registrarte en la demostración.</p>
        </div>
        {patrocinador && <TarjetaPatrocinador patrocinador={patrocinador} />}
        {referencia && !patrocinador && (
          <EstadoError titulo="Enlace no válido" queOcurrio={`El código ${referencia} no corresponde a un afiliado habilitado.`} comoSeguir="Puedes registrarte sin patrocinador; corporativo lo asignará después." />
        )}
        {!referencia && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13px] text-advertencia">
            <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
            <p><strong className="font-bold">Registro sin patrocinador.</strong> Si alguien te invitó, usa su enlace. Si no, corporativo asignará el patrocinador.</p>
          </div>
        )}
      </aside>

      <form onSubmit={enviar} noValidate className="flex flex-col gap-5">
        {errorGeneral && <EstadoError titulo="No se pudo completar el registro" queOcurrio={errorGeneral} />}
        <Tarjeta titulo="Tipo de cuenta" subtitulo="Cada tipo tiene capacidades distintas." icono={UserPlus}>
          <div className="grid gap-3 md:grid-cols-3" role="radiogroup" aria-label="Tipo de cuenta">
            {opcionesTipo.map(({ valor, titulo, icono: Icono, capacidades }) => {
              const seleccionado = tipo === valor;
              return (
                <button
                  key={valor}
                  type="button"
                  role="radio"
                  aria-checked={seleccionado}
                  onClick={() => setTipo(valor)}
                  className={unirClases('flex min-h-11 flex-col gap-2 rounded-xl border p-4 text-left transition-colors', seleccionado ? 'border-acento bg-acento-suave/50 ring-2 ring-acento-suave' : 'border-borde hover:border-texto-3')}
                >
                  <span className="flex items-center gap-2 text-[14px] font-bold text-texto"><Icono className={unirClases('size-[18px]', seleccionado ? 'text-acento' : 'text-texto-3')} aria-hidden />{titulo}</span>
                  <ul className="flex flex-col gap-1">
                    {capacidades.map((capacidad) => <li key={capacidad} className="text-[12px] leading-snug text-texto-2">{capacidad}</li>)}
                  </ul>
                </button>
              );
            })}
          </div>
        </Tarjeta>
        <Tarjeta titulo="Datos personales" subtitulo="Usa datos ficticios: es una demostración." icono={User}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Nombres" value={datos.nombres} onChange={(evento) => cambiar('nombres', evento.target.value)} error={errores.nombres} autoComplete="given-name" />
            <Campo etiqueta="Apellidos" value={datos.apellidos} onChange={(evento) => cambiar('apellidos', evento.target.value)} error={errores.apellidos} autoComplete="family-name" />
            <Campo etiqueta="Correo" type="email" icono={Mail} value={datos.correo} onChange={(evento) => cambiar('correo', evento.target.value)} error={errores.correo} autoComplete="email" />
            <Campo etiqueta="Teléfono" type="tel" icono={Phone} value={datos.telefono} onChange={(evento) => cambiar('telefono', evento.target.value)} error={errores.telefono} autoComplete="tel" />
            <Campo etiqueta="Documento" icono={IdCard} value={datos.documento} onChange={(evento) => cambiar('documento', evento.target.value)} error={errores.documento} ayuda="Dato ficticio de demostración." className="sm:col-span-2" />
          </div>
          <label className="mt-5 flex cursor-pointer items-start gap-3 text-[13px] text-texto">
            <input type="checkbox" checked={datos.acepta} onChange={(evento) => cambiar('acepta', evento.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[#0E7490]" />
            <span>Acepto los términos de la demostración y entiendo que los datos y montos son ficticios.<FileText className="ml-1 inline size-3.5 align-[-2px] text-texto-3" aria-hidden /></span>
          </label>
          {errores.acepta && <p className="mt-1 text-xs font-medium text-error">{errores.acepta}</p>}
        </Tarjeta>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <EnlaceBoton to="/" variante="fantasma">Cancelar</EnlaceBoton>
          <Boton type="submit" icono={UserPlus}>Crear mi cuenta</Boton>
        </div>
      </form>
    </div>
  );
}
