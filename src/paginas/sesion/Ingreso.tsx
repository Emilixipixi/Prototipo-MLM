import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Calculator, Eye, EyeOff, KeyRound, LogIn, Mail, Network, ShieldCheck } from 'lucide-react';
import { LeyendaDemostracion } from '../../componentes/demo/LeyendaDemostracion';
import { sesionesDemo } from '../../componentes/demo/sesionesDemo';
import { Boton } from '../../componentes/ui/Boton';
import { Campo } from '../../componentes/ui/Campo';
import { EstadoError } from '../../componentes/ui/EstadoError';
import { useToast } from '../../componentes/ui/useToast';
import { Logo } from '../../layouts/compartidos/Logo';
import { usePersonasStore } from '../../store/usePersonasStore';
import { rutaInicioPorPerfil, useSesionStore } from '../../store/useSesionStore';

const puntosClave = [
  { icono: Network, titulo: 'Dos estructuras independientes', texto: 'Genealogía Unilevel de patrocinio y red Trinaria de posiciones A, B y C.' },
  { icono: Calculator, titulo: 'Simulación antes de liquidar', texto: 'Corridas reproducibles con reglas versionadas y revisión previa.' },
  { icono: ShieldCheck, titulo: 'Trazabilidad completa', texto: 'Ajustes, reversiones y decisiones registradas en la bitácora.' },
];

export default function Ingreso() {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [errores, setErrores] = useState<{ correo?: string; clave?: string }>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const buscarPorCorreo = usePersonasStore((estado) => estado.buscarPorCorreo);
  const iniciarSesion = useSesionStore((estado) => estado.iniciarSesion);
  const navegar = useNavigate();
  const toast = useToast();

  const entrar = (personaId: string) => {
    const persona = iniciarSesion(personaId);
    if (!persona) {
      setErrorGeneral('La cuenta está bloqueada y no puede ingresar.');
      return;
    }
    toast.exito(`Hola, ${persona.nombres}`, 'Ingresaste a la demostración. El acceso quedó registrado en la bitácora.');
    navegar(rutaInicioPorPerfil(persona.perfil), { replace: true });
  };

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    const nuevosErrores: { correo?: string; clave?: string } = {};
    if (!correo.trim()) nuevosErrores.correo = 'Ingresa tu correo.';
    if (!clave.trim()) nuevosErrores.clave = 'Ingresa tu clave.';
    setErrores(nuevosErrores);
    setErrorGeneral(null);
    if (Object.keys(nuevosErrores).length > 0) return;
    const persona = buscarPorCorreo(correo);
    if (!persona) {
      setErrorGeneral('El correo no corresponde a un usuario de demostración. Usa uno de los accesos rápidos de abajo.');
      return;
    }
    entrar(persona.id);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-30"><LeyendaDemostracion /></div>
      <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <aside className="fondo-calificacion relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col">
          <span className="absolute -bottom-24 -right-24 size-80 rounded-full border-[48px] border-acento-brillo/10" aria-hidden />
          <Logo subtitulo="Plataforma comercial multinivel" oscuro />
          <div className="mt-auto max-w-md">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-acento-brillo">Principio funcional</p>
            <p className="mt-3 text-[26px] font-extrabold leading-tight tracking-tight">
              Las ventas alimentan VP y VC; las reglas del período definen calificaciones y bonos, con trazabilidad antes de pagar.
            </p>
            <ul className="mt-8 flex flex-col gap-5">
              {puntosClave.map(({ icono: Icono, titulo, texto }) => (
                <li key={titulo} className="flex gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10">
                    <Icono className="size-5 text-acento-brillo" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{titulo}</span>
                    <span className="block text-[13px] text-[#A9BCD9]">{texto}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="flex items-start justify-center px-4 py-8 sm:items-center sm:py-12">
          <div className="w-full max-w-[440px]">
            <div className="mb-6 lg:hidden"><Logo subtitulo="Plataforma comercial multinivel" /></div>
            <h1 className="text-2xl font-extrabold tracking-tight text-texto sm:text-[26px]">Ingresar</h1>
            <p className="mt-1 text-[13.5px] text-texto-2">Accede con tu usuario de demostración. Cualquier clave es válida.</p>

            <form onSubmit={enviar} noValidate className="mt-6 flex flex-col gap-4">
              {errorGeneral && <EstadoError titulo="No se pudo ingresar" queOcurrio={errorGeneral} />}
              <Campo
                etiqueta="Correo"
                type="email"
                icono={Mail}
                autoComplete="username"
                placeholder="usuario@correo.demo"
                value={correo}
                onChange={(evento) => setCorreo(evento.target.value)}
                error={errores.correo}
              />
              <Campo
                etiqueta="Clave"
                type={verClave ? 'text' : 'password'}
                icono={KeyRound}
                autoComplete="current-password"
                placeholder="Cualquier clave"
                value={clave}
                onChange={(evento) => setClave(evento.target.value)}
                error={errores.clave}
                accionDerecha={(
                  <button type="button" onClick={() => setVerClave((valor) => !valor)} aria-label={verClave ? 'Ocultar clave' : 'Mostrar clave'} className="grid size-9 place-items-center rounded-lg text-texto-3 hover:text-texto">
                    {verClave ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                  </button>
                )}
              />
              <div className="flex justify-end">
                <Link to="/recuperar-acceso" className="inline-flex min-h-11 items-center text-[13px] font-semibold text-acento hover:underline md:min-h-0">Recuperar acceso</Link>
              </div>
              <Boton type="submit" icono={LogIn} anchoCompleto>Ingresar</Boton>
            </form>

            <div className="mt-8">
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-borde" />
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-texto-3">Acceso rápido de demostración</p>
                <span className="h-px flex-1 bg-borde" />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {sesionesDemo.map(({ personaId, etiqueta, detalle, icono: Icono }) => (
                  <button
                    key={personaId}
                    type="button"
                    onClick={() => entrar(personaId)}
                    className="group flex min-h-14 items-center gap-3 rounded-xl border border-borde bg-superficie px-3 py-2.5 text-left transition-colors hover:border-acento hover:bg-acento-suave/40 last:sm:col-span-2"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-primario-suave text-primario">
                      <Icono className="size-[18px]" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-bold text-texto">{etiqueta}</span>
                      <span className="block truncate text-[11.5px] text-texto-2">{detalle}</span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-texto-3 transition-transform group-hover:translate-x-0.5 group-hover:text-acento" aria-hidden />
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-6 text-center text-[13px] text-texto-2">
              <Link to="/" className="inline-flex min-h-11 items-center font-semibold text-acento hover:underline">Volver al inicio público</Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
