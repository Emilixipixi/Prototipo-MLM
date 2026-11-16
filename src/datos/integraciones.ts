import type { Conector, Mercado } from '../tipos/integraciones';

export const conectoresIniciales: Conector[] = [
  { id: 'DEMO-CON-LMS', nombre: 'Campus ERICK (LMS) - ERICK S.A.C.', tipo: 'lms', estado: 'simulado', descripcion: 'Conectado (simulado). El conector servicios/conectorLms.ts recibe pedidos y devoluciones y devuelve matrículas, avances y aprobaciones al MLM.' },
  { id: 'DEMO-CON-ECO', nombre: 'Comercio electrónico externo', tipo: 'ecommerce', estado: 'futuro', descripcion: 'Conector futuro para importar ventas y estatus desde otra plataforma de e-commerce.' },
  { id: 'DEMO-CON-PAG', nombre: 'Proveedor de pagos', tipo: 'pagos', estado: 'simulado', descripcion: 'Interfaz desacoplada para confirmación de cobro y pago posterior de liquidaciones. Todo es simulado.' },
  { id: 'DEMO-CON-NOT', nombre: 'Notificaciones', tipo: 'notificaciones', estado: 'simulado', descripcion: 'Avisos internos de compra, cambio de estado, cierre y liquidaciones. Sin envío real de correos.' },
];

export const mercadosIniciales: Mercado[] = [
  { pais: 'Perú', moneda: 'PEN', idioma: 'es', tributos: 'Campo informativo: tributos según normativa local (sin cálculo oficial)', metodosPago: ['Tarjeta (simulado)', 'Transferencia (simulado)'] },
  { pais: 'Ecuador', moneda: 'USD', idioma: 'es', tributos: 'Campo informativo: tributos según normativa local (sin cálculo oficial)', metodosPago: ['Tarjeta (simulado)', 'Transferencia (simulado)'] },
];
