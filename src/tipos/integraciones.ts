export interface Conector {
  id: string; nombre: string; tipo: 'lms' | 'ecommerce' | 'pagos' | 'notificaciones';
  estado: 'pendiente_integracion' | 'simulado' | 'futuro'; descripcion: string;
}

export interface Mercado { pais: string; moneda: string; idioma: string; tributos: string; metodosPago: string[]; }
