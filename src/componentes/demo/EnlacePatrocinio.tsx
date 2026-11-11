import { useState } from 'react';
import { Check, Copy, ExternalLink, Link2 } from 'lucide-react';
import { Boton } from '../ui/Boton';
import { EnlaceBoton } from '../ui/EnlaceBoton';
import { Tarjeta } from '../ui/Tarjeta';
import { useToast } from '../ui/useToast';

export function EnlacePatrocinio({ codigo }: { codigo: string }) {
  const [copiado, setCopiado] = useState(false);
  const toast = useToast();
  const ruta = `/registro?ref=${codigo}`;
  const enlace = `${window.location.origin}${ruta}`;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(enlace);
    } catch {
      const area = document.createElement('textarea');
      area.value = enlace;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    setCopiado(true);
    toast.exito('Enlace copiado', 'Compártelo con la persona que quieres invitar.');
    window.setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <Tarjeta titulo="Mi enlace de patrocinio" subtitulo="Quien se registre con este enlace conservará tu patrocinio." icono={Link2}>
      <div className="flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-borde bg-fondo px-3 py-2">
        <span className="cifra min-w-0 flex-1 truncate text-[12.5px] text-texto">{enlace}</span>
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Boton icono={copiado ? Check : Copy} onClick={copiar} className="sm:flex-1">{copiado ? 'Copiado' : 'Copiar enlace'}</Boton>
        <EnlaceBoton to={ruta} variante="secundario" icono={ExternalLink} className="sm:flex-1">Ver registro</EnlaceBoton>
      </div>
    </Tarjeta>
  );
}
