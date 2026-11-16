import { Bell, FileUp, GraduationCap, Microscope, Video, type LucideIcon } from 'lucide-react';
import type { TipoEventoCalendario } from '../../tipos/academico';

export const estilosTipoEvento: Record<TipoEventoCalendario, { icono: LucideIcon; clase: string; punto: string }> = {
  examen_final: { icono: GraduationCap, clase: 'border-[#E9A95B] bg-[#FDF0E1] text-[#7A410B]', punto: 'bg-[#D9822B]' },
  clase_en_vivo: { icono: Video, clase: 'border-[#4FA37B] bg-[#E3F3EA] text-[#1E5A3F]', punto: 'bg-[#2F7D5B]' },
  entrega: { icono: FileUp, clase: 'border-[#6C8FD8] bg-[#E6EEFB] text-[#1E3F8F]', punto: 'bg-[#3E64B8]' },
  sustentacion: { icono: Microscope, clase: 'border-[#9C7AD8] bg-[#EFE8FB] text-[#55298F]', punto: 'bg-[#7C4DC4]' },
  recordatorio: { icono: Bell, clase: 'border-[#97A3B3] bg-[#EEF1F4] text-[#364252]', punto: 'bg-[#64748B]' },
};
