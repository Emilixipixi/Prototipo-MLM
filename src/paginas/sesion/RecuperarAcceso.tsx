import { useState, type FormEvent } from 'react';
import { ArrowLeft, MailCheck, Mail, Send } from 'lucide-react';
import { LeyendaDemostracion } from '../../componentes/demo/LeyendaDemostracion';
import { Boton } from '../../componentes/ui/Boton';
import { Campo } from '../../componentes/ui/Campo';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { Logo } from '../../layouts/compartidos/Logo';

export default function RecuperarAcceso() {
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(correo.trim())) {
      setError('Ingresa un correo válido.');
      return;
    }
    setError(null);
    setEnviado(true);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-30"><LeyendaDemostracion /></div>
      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center">
        <div className="w-full max-w-[440px]">
          <div className="mb-6"><Logo subtitulo="Plataforma comercial multinivel" /></div>
          <Tarjeta>
            {enviado ? (
              <div className="flex flex-col items-center py-4 text-center">
                <span className="grid size-14 place-items-center rounded-2xl bg-green-100 text-exito"><MailCheck className="size-7" aria-hidden /></span>
                <h1 className="mt-4 text-lg font-bold text-texto">Solicitud registrada</h1>
                <p className="mt-1 text-[13.5px] text-texto-2">Si el correo existe, se enviaría un enlace de recuperación (simulado). En esta demostración no se envían correos.</p>
                <EnlaceBoton to="/ingresar" variante="secundario" icono={ArrowLeft} className="mt-6">Volver al ingreso</EnlaceBoton>
              </div>
            ) : (
              <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-texto">Recuperar acceso</h1>
                  <p className="mt-1 text-[13.5px] text-texto-2">Escribe el correo de tu cuenta y te indicaremos cómo restablecer la clave.</p>
                </div>
                <Campo etiqueta="Correo" type="email" icono={Mail} value={correo} onChange={(evento) => setCorreo(evento.target.value)} error={error} placeholder="usuario@correo.demo" />
                <Boton type="submit" icono={Send} anchoCompleto>Enviar enlace</Boton>
                <EnlaceBoton to="/ingresar" variante="fantasma" icono={ArrowLeft} anchoCompleto>Volver al ingreso</EnlaceBoton>
              </form>
            )}
          </Tarjeta>
        </div>
      </main>
    </div>
  );
}
