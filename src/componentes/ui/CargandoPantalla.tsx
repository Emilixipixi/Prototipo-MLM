import { LoaderCircle } from 'lucide-react';

export function CargandoPantalla({ texto = 'Cargando' }: { texto?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center gap-2 text-[13px] font-medium text-texto-2" role="status">
      <LoaderCircle className="size-5 animate-spin text-acento" aria-hidden />
      {texto}
    </div>
  );
}
