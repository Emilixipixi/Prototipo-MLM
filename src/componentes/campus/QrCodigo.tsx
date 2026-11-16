import { useEffect, useState } from 'react';
import { qrComoImagen } from '../../servicios/pdfCertificados';

export function QrCodigo({ texto, tamano = 96, etiqueta }: { texto: string; tamano?: number; etiqueta: string }) {
  const [imagen, setImagen] = useState<string | null>(null);
  useEffect(() => {
    let activo = true;
    qrComoImagen(texto).then((datos) => { if (activo) setImagen(datos); }).catch(() => setImagen(null));
    return () => { activo = false; };
  }, [texto]);
  return imagen
    ? <img src={imagen} alt={etiqueta} width={tamano} height={tamano} className="h-auto max-w-full rounded-md bg-white" />
    : <span className="block animate-pulse rounded-md bg-slate-100" style={{ width: tamano, height: tamano }} aria-hidden />;
}
