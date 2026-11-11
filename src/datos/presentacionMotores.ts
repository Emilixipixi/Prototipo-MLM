import { Award, Crown, Layers, Network, ShoppingBag, Trophy, UserPlus, type LucideIcon } from 'lucide-react';
import type { CodigoMotor } from '../tipos/reglas';

export const presentacionMotores: Record<CodigoMotor, { nombre: string; icono: LucideIcon; resumen: string }> = {
  actividad_comercial: { nombre: 'Actividad comercial', icono: ShoppingBag, resumen: 'Ventas personales y de clientes referidos en el ciclo.' },
  patrocinio_activacion: { nombre: 'Patrocinio y activación', icono: UserPlus, resumen: 'Primer pedido confirmado de cada nuevo directo; el alta sola no genera bono.' },
  unilevel: { nombre: 'Unilevel', icono: Layers, resumen: 'Volumen comisionable por nivel de patrocinio, hasta 7 niveles.' },
  trinario: { nombre: 'Trinario', icono: Network, resumen: 'Volumen utilizado de los brazos A, B y C según la regla de equilibrio.' },
  generaciones: { nombre: 'Generaciones', icono: Crown, resumen: 'Desarrollo de líderes y generaciones calificadas.' },
  bono_rango: { nombre: 'Bono de rango', icono: Award, resumen: 'Ascenso o mantenimiento del RUN de Cobro.' },
  fondo_liderazgo: { nombre: 'Fondo de liderazgo', icono: Trophy, resumen: 'Bolsa compartida entre rangos superiores.' },
};
