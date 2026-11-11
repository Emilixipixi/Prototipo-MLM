import { Download, Printer } from 'lucide-react';
import { usePermiso } from '../../hooks/usePermiso';
import { descargarCsv, type FilaExportable } from '../../servicios/exportar';
import type { ModuloPermiso } from '../../tipos/permisos';
import { Boton } from './Boton';
import { ConPermiso } from './ConPermiso';

interface PropsBarraExportar {
  modulo: ModuloPermiso;
  nombreArchivo: string;
  filas: () => FilaExportable[];
}

export function BarraExportar({ modulo, nombreArchivo, filas }: PropsBarraExportar) {
  const puede = usePermiso(modulo, 'exportar');
  return (
    <div className="no-imprimir flex flex-wrap gap-2">
      <ConPermiso modulo={modulo} accion="exportar">
        <Boton tamano="sm" variante="secundario" icono={Download} onClick={() => puede && descargarCsv(nombreArchivo, filas())}>Exportar CSV</Boton>
      </ConPermiso>
      <Boton tamano="sm" variante="secundario" icono={Printer} onClick={() => window.print()}>Imprimir</Boton>
    </div>
  );
}
