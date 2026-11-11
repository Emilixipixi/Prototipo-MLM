import type { Pedido } from '../tipos/pedidos';

export const pedidosIniciales: Pedido[] = [
  {
    id: 'DEMO-P01', compradorId: 'DEMO-L01', referenteId: 'DEMO-A04', periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 1, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }],
    totalPrecio: 250, totalVp: 100, totalVc: 80, estado: 'confirmada', fecha: '2026-11-04T10:12:00', comprobante: 'DEMO-CMP-0001',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-04T10:06:00', actorId: 'DEMO-L01', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-04T10:09:00', actorId: 'DEMO-L01', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-04T10:12:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P02', compradorId: 'DEMO-C01', referenteId: 'DEMO-A01', periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-02', cantidad: 2, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }],
    totalPrecio: 240, totalVp: 120, totalVc: 90, estado: 'devuelta', fecha: '2026-10-27T15:30:00', comprobante: 'DEMO-CMP-0002',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-27T15:24:00', actorId: 'DEMO-C01', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-27T15:27:00', actorId: 'DEMO-C01', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-27T15:30:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
      { estado: 'devuelta', fecha: '2026-11-05T09:40:00', actorId: 'DEMO-U01', detalle: 'Devolución del bien físico registrada por corporativo' },
    ],
  },
  {
    id: 'DEMO-P03', compradorId: 'DEMO-C02', referenteId: 'DEMO-A03', periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-04', cantidad: 1, precioUnitario: 65, vpUnitario: 30, vcUnitario: 25 }],
    totalPrecio: 65, totalVp: 30, totalVc: 25, estado: 'confirmada', fecha: '2026-11-06T12:20:00', comprobante: 'DEMO-CMP-0003',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-06T12:14:00', actorId: 'DEMO-C02', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-06T12:17:00', actorId: 'DEMO-C02', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-06T12:20:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P04', compradorId: 'DEMO-A08', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 3, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-04', cantidad: 1, precioUnitario: 65, vpUnitario: 30, vcUnitario: 25 }, { productoId: 'DEMO-PRD-05', cantidad: 1, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 965, totalVp: 400, totalVc: 315, estado: 'confirmada', fecha: '2026-10-19T09:09:00', comprobante: 'DEMO-CMP-0004',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-19T09:03:00', actorId: 'DEMO-A08', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-19T09:06:00', actorId: 'DEMO-A08', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-19T09:09:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P05', compradorId: 'DEMO-A15', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-03', cantidad: 1, precioUnitario: 80, vpUnitario: 20, vcUnitario: 30 }, { productoId: 'DEMO-PRD-05', cantidad: 1, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 350, totalVp: 150, totalVc: 125, estado: 'confirmada', fecha: '2026-10-19T14:38:00', comprobante: 'DEMO-CMP-0005',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-19T14:32:00', actorId: 'DEMO-A15', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-19T14:35:00', actorId: 'DEMO-A15', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-19T14:38:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P06', compradorId: 'DEMO-A07', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 2, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 920, totalVp: 400, totalVc: 305, estado: 'confirmada', fecha: '2026-10-20T09:15:00', comprobante: 'DEMO-CMP-0006',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-20T09:09:00', actorId: 'DEMO-A07', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-20T09:12:00', actorId: 'DEMO-A07', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-20T09:15:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P07', compradorId: 'DEMO-A04', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 4, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-05', cantidad: 1, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 1270, totalVp: 530, totalVc: 415, estado: 'confirmada', fecha: '2026-10-20T14:35:00', comprobante: 'DEMO-CMP-0007',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-20T14:29:00', actorId: 'DEMO-A04', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-20T14:32:00', actorId: 'DEMO-A04', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-20T14:35:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P08', compradorId: 'DEMO-A14', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-04', cantidad: 1, precioUnitario: 65, vpUnitario: 30, vcUnitario: 25 }],
    totalPrecio: 185, totalVp: 90, totalVc: 70, estado: 'confirmada', fecha: '2026-10-20T14:44:00', comprobante: 'DEMO-CMP-0008',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-20T14:38:00', actorId: 'DEMO-A14', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-20T14:41:00', actorId: 'DEMO-A14', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-20T14:44:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P09', compradorId: 'DEMO-A10', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 1, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-03', cantidad: 1, precioUnitario: 80, vpUnitario: 20, vcUnitario: 30 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 630, totalVp: 260, totalVc: 210, estado: 'confirmada', fecha: '2026-10-21T10:10:00', comprobante: 'DEMO-CMP-0009',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-21T10:04:00', actorId: 'DEMO-A10', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-21T10:07:00', actorId: 'DEMO-A10', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-21T10:10:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P10', compradorId: 'DEMO-A03', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-03', cantidad: 1, precioUnitario: 80, vpUnitario: 20, vcUnitario: 30 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 380, totalVp: 160, totalVc: 130, estado: 'confirmada', fecha: '2026-10-21T14:41:00', comprobante: 'DEMO-CMP-0010',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-21T14:35:00', actorId: 'DEMO-A03', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-21T14:38:00', actorId: 'DEMO-A03', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-21T14:41:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P11', compradorId: 'DEMO-A00', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 3, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }],
    totalPrecio: 750, totalVp: 300, totalVc: 240, estado: 'confirmada', fecha: '2026-10-22T10:07:00', comprobante: 'DEMO-CMP-0011',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-22T10:01:00', actorId: 'DEMO-A00', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-22T10:04:00', actorId: 'DEMO-A00', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-22T10:07:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P12', compradorId: 'DEMO-A09', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 3, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-04', cantidad: 1, precioUnitario: 65, vpUnitario: 30, vcUnitario: 25 }, { productoId: 'DEMO-PRD-05', cantidad: 1, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 965, totalVp: 400, totalVc: 315, estado: 'confirmada', fecha: '2026-10-22T10:16:00', comprobante: 'DEMO-CMP-0012',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-22T10:10:00', actorId: 'DEMO-A09', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-22T10:13:00', actorId: 'DEMO-A09', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-22T10:16:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P13', compradorId: 'DEMO-A02', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 3, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-05', cantidad: 3, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 1320, totalVp: 570, totalVc: 435, estado: 'confirmada', fecha: '2026-10-22T14:47:00', comprobante: 'DEMO-CMP-0013',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-22T14:41:00', actorId: 'DEMO-A02', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-22T14:44:00', actorId: 'DEMO-A02', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-22T14:47:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P14', compradorId: 'DEMO-A08', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 3, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-05', cantidad: 1, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 900, totalVp: 370, totalVc: 290, estado: 'confirmada', fecha: '2026-10-23T10:22:00', comprobante: 'DEMO-CMP-0014',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-23T10:16:00', actorId: 'DEMO-A08', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-23T10:19:00', actorId: 'DEMO-A08', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-23T10:22:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P15', compradorId: 'DEMO-A06', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 3, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-05', cantidad: 1, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 1020, totalVp: 430, totalVc: 335, estado: 'confirmada', fecha: '2026-10-23T15:42:00', comprobante: 'DEMO-CMP-0015',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-23T15:36:00', actorId: 'DEMO-A06', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-23T15:39:00', actorId: 'DEMO-A06', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-23T15:42:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P16', compradorId: 'DEMO-A15', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-03', cantidad: 1, precioUnitario: 80, vpUnitario: 20, vcUnitario: 30 }, { productoId: 'DEMO-PRD-04', cantidad: 1, precioUnitario: 65, vpUnitario: 30, vcUnitario: 25 }],
    totalPrecio: 145, totalVp: 50, totalVc: 55, estado: 'confirmada', fecha: '2026-10-23T15:51:00', comprobante: 'DEMO-CMP-0016',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-23T15:45:00', actorId: 'DEMO-A15', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-23T15:48:00', actorId: 'DEMO-A15', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-23T15:51:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P17', compradorId: 'DEMO-C03', referenteId: 'DEMO-A02', periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }],
    totalPrecio: 120, totalVp: 60, totalVc: 45, estado: 'confirmada', fecha: '2026-10-23T16:40:00', comprobante: 'DEMO-CMP-0017',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-23T16:34:00', actorId: 'DEMO-C03', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-23T16:37:00', actorId: 'DEMO-C03', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-23T16:40:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P18', compradorId: 'DEMO-A07', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 2, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-04', cantidad: 1, precioUnitario: 65, vpUnitario: 30, vcUnitario: 25 }, { productoId: 'DEMO-PRD-05', cantidad: 1, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 715, totalVp: 300, totalVc: 235, estado: 'confirmada', fecha: '2026-10-24T10:28:00', comprobante: 'DEMO-CMP-0018',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-24T10:22:00', actorId: 'DEMO-A07', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-24T10:25:00', actorId: 'DEMO-A07', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-24T10:28:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P19', compradorId: 'DEMO-A12', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 1, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 550, totalVp: 240, totalVc: 180, estado: 'confirmada', fecha: '2026-10-24T11:17:00', comprobante: 'DEMO-CMP-0019',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-24T11:11:00', actorId: 'DEMO-A12', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-24T11:14:00', actorId: 'DEMO-A12', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-24T11:17:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P20', compradorId: 'DEMO-A04', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 4, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-04', cantidad: 1, precioUnitario: 65, vpUnitario: 30, vcUnitario: 25 }],
    totalPrecio: 1065, totalVp: 430, totalVc: 345, estado: 'confirmada', fecha: '2026-10-24T15:48:00', comprobante: 'DEMO-CMP-0020',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-24T15:42:00', actorId: 'DEMO-A04', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-24T15:45:00', actorId: 'DEMO-A04', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-24T15:48:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P21', compradorId: 'DEMO-A01', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 2, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }],
    totalPrecio: 500, totalVp: 200, totalVc: 160, estado: 'confirmada', fecha: '2026-10-25T11:14:00', comprobante: 'DEMO-CMP-0021',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-25T11:08:00', actorId: 'DEMO-A01', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-25T11:11:00', actorId: 'DEMO-A01', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-25T11:14:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P22', compradorId: 'DEMO-A10', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 1, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 550, totalVp: 240, totalVc: 180, estado: 'confirmada', fecha: '2026-10-25T11:23:00', comprobante: 'DEMO-CMP-0022',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-25T11:17:00', actorId: 'DEMO-A10', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-25T11:20:00', actorId: 'DEMO-A10', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-25T11:23:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P23', compradorId: 'DEMO-A00', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 2, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }],
    totalPrecio: 500, totalVp: 200, totalVc: 160, estado: 'confirmada', fecha: '2026-10-26T11:20:00', comprobante: 'DEMO-CMP-0023',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-26T11:14:00', actorId: 'DEMO-A00', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-26T11:17:00', actorId: 'DEMO-A00', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-26T11:20:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P24', compradorId: 'DEMO-A09', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 3, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 1050, totalVp: 440, totalVc: 340, estado: 'confirmada', fecha: '2026-10-26T11:29:00', comprobante: 'DEMO-CMP-0024',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-26T11:23:00', actorId: 'DEMO-A09', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-26T11:26:00', actorId: 'DEMO-A09', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-26T11:29:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P25', compradorId: 'DEMO-A02', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 3, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-05', cantidad: 3, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 1320, totalVp: 570, totalVc: 435, estado: 'confirmada', fecha: '2026-10-26T15:00:00', comprobante: 'DEMO-CMP-0025',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-26T14:54:00', actorId: 'DEMO-A02', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-26T14:57:00', actorId: 'DEMO-A02', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-26T15:00:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P26', compradorId: 'DEMO-A07', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 2, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 920, totalVp: 400, totalVc: 305, estado: 'confirmada', fecha: '2026-10-26T16:49:00', comprobante: 'DEMO-CMP-0026',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-26T16:43:00', actorId: 'DEMO-A07', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-26T16:46:00', actorId: 'DEMO-A07', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-26T16:49:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P27', compradorId: 'DEMO-A13', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 1, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-03', cantidad: 1, precioUnitario: 80, vpUnitario: 20, vcUnitario: 30 }, { productoId: 'DEMO-PRD-05', cantidad: 1, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 480, totalVp: 190, totalVc: 160, estado: 'confirmada', fecha: '2026-10-27T12:24:00', comprobante: 'DEMO-CMP-0027',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-27T12:18:00', actorId: 'DEMO-A13', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-27T12:21:00', actorId: 'DEMO-A13', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-27T12:24:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P28', compradorId: 'DEMO-A06', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 3, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 1050, totalVp: 440, totalVc: 340, estado: 'confirmada', fecha: '2026-10-27T16:55:00', comprobante: 'DEMO-CMP-0028',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-27T16:49:00', actorId: 'DEMO-A06', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-27T16:52:00', actorId: 'DEMO-A06', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-27T16:55:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P29', compradorId: 'DEMO-A05', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }],
    totalPrecio: 120, totalVp: 60, totalVc: 45, estado: 'confirmada', fecha: '2026-10-28T10:05:00', comprobante: 'DEMO-CMP-0029',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-28T09:59:00', actorId: 'DEMO-A05', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-28T10:02:00', actorId: 'DEMO-A05', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-28T10:05:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P30', compradorId: 'DEMO-A05', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-05', cantidad: 3, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 450, totalVp: 210, totalVc: 150, estado: 'devuelta', fecha: '2026-10-28T10:14:00', comprobante: 'DEMO-CMP-0030',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-28T10:08:00', actorId: 'DEMO-A05', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-28T10:11:00', actorId: 'DEMO-A05', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-28T10:14:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
      { estado: 'devuelta', fecha: '2026-10-30T11:20:00', actorId: 'DEMO-U01', detalle: 'Devolución registrada por el cliente final (DEMOSTRACIÓN)' },
    ],
  },
  {
    id: 'DEMO-P31', compradorId: 'DEMO-A05', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 1, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }],
    totalPrecio: 250, totalVp: 100, totalVc: 80, estado: 'confirmada', fecha: '2026-10-28T10:26:00', comprobante: 'DEMO-CMP-0031',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-28T10:20:00', actorId: 'DEMO-A05', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-28T10:23:00', actorId: 'DEMO-A05', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-28T10:26:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P32', compradorId: 'DEMO-A05', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-03', cantidad: 1, precioUnitario: 80, vpUnitario: 20, vcUnitario: 30 }],
    totalPrecio: 80, totalVp: 20, totalVc: 30, estado: 'cancelada', fecha: '2026-10-28T10:38:00', comprobante: '',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-28T10:32:00', actorId: 'DEMO-A05', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-28T10:35:00', actorId: 'DEMO-A05', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'cancelada', fecha: '2026-10-28T10:38:00', actorId: 'DEMO-A05', detalle: 'Pedido cancelado antes de la confirmación' },
    ],
  },
  {
    id: 'DEMO-P33', compradorId: 'DEMO-A05', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-04', cantidad: 4, precioUnitario: 65, vpUnitario: 30, vcUnitario: 25 }],
    totalPrecio: 260, totalVp: 120, totalVc: 100, estado: 'cancelada', fecha: '2026-10-28T10:50:00', comprobante: '',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-28T10:44:00', actorId: 'DEMO-A05', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-28T10:47:00', actorId: 'DEMO-A05', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'cancelada', fecha: '2026-10-28T10:50:00', actorId: 'DEMO-A05', detalle: 'Pedido cancelado antes de la confirmación' },
    ],
  },
  {
    id: 'DEMO-P34', compradorId: 'DEMO-A02', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 4, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-03', cantidad: 1, precioUnitario: 80, vpUnitario: 20, vcUnitario: 30 }, { productoId: 'DEMO-PRD-05', cantidad: 3, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 1530, totalVp: 630, totalVc: 500, estado: 'confirmada', fecha: '2026-10-28T12:21:00', comprobante: 'DEMO-CMP-0032',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-28T12:15:00', actorId: 'DEMO-A02', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-28T12:18:00', actorId: 'DEMO-A02', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-28T12:21:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P35', compradorId: 'DEMO-A12', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-03', cantidad: 1, precioUnitario: 80, vpUnitario: 20, vcUnitario: 30 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 380, totalVp: 160, totalVc: 130, estado: 'confirmada', fecha: '2026-10-28T12:30:00', comprobante: 'DEMO-CMP-0033',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-28T12:24:00', actorId: 'DEMO-A12', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-28T12:27:00', actorId: 'DEMO-A12', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-28T12:30:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P36', compradorId: 'DEMO-A04', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 4, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-05', cantidad: 1, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 1150, totalVp: 470, totalVc: 370, estado: 'confirmada', fecha: '2026-10-28T16:01:00', comprobante: 'DEMO-CMP-0034',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-28T15:55:00', actorId: 'DEMO-A04', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-28T15:58:00', actorId: 'DEMO-A04', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-28T16:01:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P37', compradorId: 'DEMO-A08', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 3, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-05', cantidad: 1, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 1020, totalVp: 430, totalVc: 335, estado: 'confirmada', fecha: '2026-10-29T17:56:00', comprobante: 'DEMO-CMP-0035',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-29T17:50:00', actorId: 'DEMO-A08', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-29T17:53:00', actorId: 'DEMO-A08', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-29T17:56:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P38', compradorId: 'DEMO-A09', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 2, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 920, totalVp: 400, totalVc: 305, estado: 'confirmada', fecha: '2026-10-30T12:42:00', comprobante: 'DEMO-CMP-0036',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-30T12:36:00', actorId: 'DEMO-A09', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-30T12:39:00', actorId: 'DEMO-A09', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-30T12:42:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P39', compradorId: 'DEMO-A14', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-04', cantidad: 1, precioUnitario: 65, vpUnitario: 30, vcUnitario: 25 }, { productoId: 'DEMO-PRD-05', cantidad: 1, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 335, totalVp: 160, totalVc: 120, estado: 'confirmada', fecha: '2026-10-30T13:31:00', comprobante: 'DEMO-CMP-0037',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-30T13:25:00', actorId: 'DEMO-A14', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-30T13:28:00', actorId: 'DEMO-A14', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-30T13:31:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P40', compradorId: 'DEMO-A07', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 2, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 920, totalVp: 400, totalVc: 305, estado: 'confirmada', fecha: '2026-10-30T17:02:00', comprobante: 'DEMO-CMP-0038',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-30T16:56:00', actorId: 'DEMO-A07', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-30T16:59:00', actorId: 'DEMO-A07', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-30T17:02:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P41', compradorId: 'DEMO-A03', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 1, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 550, totalVp: 240, totalVc: 180, estado: 'confirmada', fecha: '2026-10-31T13:28:00', comprobante: 'DEMO-CMP-0039',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-31T13:22:00', actorId: 'DEMO-A03', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-31T13:25:00', actorId: 'DEMO-A03', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-31T13:28:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P42', compradorId: 'DEMO-A13', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-04', cantidad: 1, precioUnitario: 65, vpUnitario: 30, vcUnitario: 25 }, { productoId: 'DEMO-PRD-05', cantidad: 1, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 335, totalVp: 160, totalVc: 120, estado: 'confirmada', fecha: '2026-10-31T13:37:00', comprobante: 'DEMO-CMP-0040',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-31T13:31:00', actorId: 'DEMO-A13', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-31T13:34:00', actorId: 'DEMO-A13', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-31T13:37:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P43', compradorId: 'DEMO-A06', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 2, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-05', cantidad: 1, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 770, totalVp: 330, totalVc: 255, estado: 'confirmada', fecha: '2026-10-31T17:08:00', comprobante: 'DEMO-CMP-0041',
    eventos: [
      { estado: 'borrador', fecha: '2026-10-31T17:02:00', actorId: 'DEMO-A06', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-10-31T17:05:00', actorId: 'DEMO-A06', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-10-31T17:08:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P44', compradorId: 'DEMO-A09', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 3, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 1170, totalVp: 500, totalVc: 385, estado: 'confirmada', fecha: '2026-11-01T09:03:00', comprobante: 'DEMO-CMP-0042',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-01T08:57:00', actorId: 'DEMO-A09', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-01T09:00:00', actorId: 'DEMO-A09', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-01T09:03:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P45', compradorId: 'DEMO-A02', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 3, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-05', cantidad: 3, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 1320, totalVp: 570, totalVc: 435, estado: 'confirmada', fecha: '2026-11-01T13:34:00', comprobante: 'DEMO-CMP-0043',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-01T13:28:00', actorId: 'DEMO-A02', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-01T13:31:00', actorId: 'DEMO-A02', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-01T13:34:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P46', compradorId: 'DEMO-A04', referenteId: null, periodoId: 'DEMO-C01',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 4, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-05', cantidad: 1, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 1150, totalVp: 470, totalVc: 370, estado: 'confirmada', fecha: '2026-11-01T17:14:00', comprobante: 'DEMO-CMP-0044',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-01T17:08:00', actorId: 'DEMO-A04', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-01T17:11:00', actorId: 'DEMO-A04', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-01T17:14:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P47', compradorId: 'DEMO-A12', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-04', cantidad: 2, precioUnitario: 65, vpUnitario: 30, vcUnitario: 25 }],
    totalPrecio: 130, totalVp: 60, totalVc: 50, estado: 'confirmada', fecha: '2026-11-02T10:10:00', comprobante: 'DEMO-CMP-0045',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-02T10:04:00', actorId: 'DEMO-A12', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-02T10:07:00', actorId: 'DEMO-A12', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-02T10:10:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P48', compradorId: 'DEMO-A02', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 1, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 670, totalVp: 300, totalVc: 225, estado: 'confirmada', fecha: '2026-11-02T15:54:00', comprobante: 'DEMO-CMP-0046',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-02T15:48:00', actorId: 'DEMO-A02', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-02T15:51:00', actorId: 'DEMO-A02', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-02T15:54:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P49', compradorId: 'DEMO-A09', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 1, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 550, totalVp: 240, totalVc: 180, estado: 'confirmada', fecha: '2026-11-02T16:04:00', comprobante: 'DEMO-CMP-0047',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-02T15:58:00', actorId: 'DEMO-A09', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-02T16:01:00', actorId: 'DEMO-A09', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-02T16:04:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P50', compradorId: 'DEMO-A10', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-04', cantidad: 2, precioUnitario: 65, vpUnitario: 30, vcUnitario: 25 }],
    totalPrecio: 130, totalVp: 60, totalVc: 50, estado: 'confirmada', fecha: '2026-11-03T10:16:00', comprobante: 'DEMO-CMP-0048',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-03T10:10:00', actorId: 'DEMO-A10', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-03T10:13:00', actorId: 'DEMO-A10', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-03T10:16:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P51', compradorId: 'DEMO-A04', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 3, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 1050, totalVp: 440, totalVc: 340, estado: 'confirmada', fecha: '2026-11-03T16:49:00', comprobante: 'DEMO-CMP-0049',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-03T16:43:00', actorId: 'DEMO-A04', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-03T16:46:00', actorId: 'DEMO-A04', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-03T16:49:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P52', compradorId: 'DEMO-A08', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 1, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-04', cantidad: 1, precioUnitario: 65, vpUnitario: 30, vcUnitario: 25 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 615, totalVp: 270, totalVc: 205, estado: 'confirmada', fecha: '2026-11-04T10:22:00', comprobante: 'DEMO-CMP-0050',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-04T10:16:00', actorId: 'DEMO-A08', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-04T10:19:00', actorId: 'DEMO-A08', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-04T10:22:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P53', compradorId: 'DEMO-A02', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 2, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 920, totalVp: 400, totalVc: 305, estado: 'confirmada', fecha: '2026-11-04T13:28:00', comprobante: 'DEMO-CMP-0051',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-04T13:22:00', actorId: 'DEMO-A02', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-04T13:25:00', actorId: 'DEMO-A02', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-04T13:28:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P54', compradorId: 'DEMO-A09', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 1, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 670, totalVp: 300, totalVc: 225, estado: 'confirmada', fecha: '2026-11-04T14:38:00', comprobante: 'DEMO-CMP-0052',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-04T14:32:00', actorId: 'DEMO-A09', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-04T14:35:00', actorId: 'DEMO-A09', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-04T14:38:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P55', compradorId: 'DEMO-A04', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 2, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-03', cantidad: 1, precioUnitario: 80, vpUnitario: 20, vcUnitario: 30 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 880, totalVp: 360, totalVc: 290, estado: 'confirmada', fecha: '2026-11-05T10:28:00', comprobante: 'DEMO-CMP-0053',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-05T10:22:00', actorId: 'DEMO-A04', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-05T10:25:00', actorId: 'DEMO-A04', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-05T10:28:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P56', compradorId: 'DEMO-A13', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-04', cantidad: 1, precioUnitario: 65, vpUnitario: 30, vcUnitario: 25 }],
    totalPrecio: 65, totalVp: 30, totalVc: 25, estado: 'confirmada', fecha: '2026-11-05T11:17:00', comprobante: 'DEMO-CMP-0054',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-05T11:11:00', actorId: 'DEMO-A13', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-05T11:14:00', actorId: 'DEMO-A13', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-05T11:17:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P57', compradorId: 'DEMO-A01', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-04', cantidad: 1, precioUnitario: 65, vpUnitario: 30, vcUnitario: 25 }],
    totalPrecio: 185, totalVp: 90, totalVc: 70, estado: 'confirmada', fecha: '2026-11-05T13:34:00', comprobante: 'DEMO-CMP-0055',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-05T13:28:00', actorId: 'DEMO-A01', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-05T13:31:00', actorId: 'DEMO-A01', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-05T13:34:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P58', compradorId: 'DEMO-A06', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 1, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-05', cantidad: 1, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 520, totalVp: 230, totalVc: 175, estado: 'confirmada', fecha: '2026-11-05T14:44:00', comprobante: 'DEMO-CMP-0056',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-05T14:38:00', actorId: 'DEMO-A06', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-05T14:41:00', actorId: 'DEMO-A06', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-05T14:44:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P59', compradorId: 'DEMO-A07', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 1, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-05', cantidad: 1, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 520, totalVp: 230, totalVc: 175, estado: 'confirmada', fecha: '2026-11-05T16:01:00', comprobante: 'DEMO-CMP-0057',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-05T15:55:00', actorId: 'DEMO-A07', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-05T15:58:00', actorId: 'DEMO-A07', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-05T16:01:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P60', compradorId: 'DEMO-A02', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 1, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 670, totalVp: 300, totalVc: 225, estado: 'confirmada', fecha: '2026-11-06T16:07:00', comprobante: 'DEMO-CMP-0058',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-06T16:01:00', actorId: 'DEMO-A02', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-06T16:04:00', actorId: 'DEMO-A02', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-06T16:07:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P61', compradorId: 'DEMO-A08', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 2, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-05', cantidad: 3, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 950, totalVp: 410, totalVc: 310, estado: 'confirmada', fecha: '2026-11-06T17:56:00', comprobante: 'DEMO-CMP-0059',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-06T17:50:00', actorId: 'DEMO-A08', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-06T17:53:00', actorId: 'DEMO-A08', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-06T17:56:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P62', compradorId: 'DEMO-A07', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 2, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 800, totalVp: 340, totalVc: 260, estado: 'confirmada', fecha: '2026-11-07T14:35:00', comprobante: 'DEMO-CMP-0060',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-07T14:29:00', actorId: 'DEMO-A07', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-07T14:32:00', actorId: 'DEMO-A07', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-07T14:35:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P63', compradorId: 'DEMO-A04', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 2, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 920, totalVp: 400, totalVc: 305, estado: 'confirmada', fecha: '2026-11-07T17:02:00', comprobante: 'DEMO-CMP-0061',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-07T16:56:00', actorId: 'DEMO-A04', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-07T16:59:00', actorId: 'DEMO-A04', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-07T17:02:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P64', compradorId: 'DEMO-A00', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 3, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }],
    totalPrecio: 750, totalVp: 300, totalVc: 240, estado: 'confirmada', fecha: '2026-11-08T11:14:00', comprobante: 'DEMO-CMP-0062',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-08T11:08:00', actorId: 'DEMO-A00', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-08T11:11:00', actorId: 'DEMO-A00', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-08T11:14:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P65', compradorId: 'DEMO-A08', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 1, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-05', cantidad: 3, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 700, totalVp: 310, totalVc: 230, estado: 'confirmada', fecha: '2026-11-08T11:35:00', comprobante: 'DEMO-CMP-0063',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-08T11:29:00', actorId: 'DEMO-A08', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-08T11:32:00', actorId: 'DEMO-A08', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-08T11:35:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P66', compradorId: 'DEMO-A14', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-03', cantidad: 1, precioUnitario: 80, vpUnitario: 20, vcUnitario: 30 }],
    totalPrecio: 80, totalVp: 20, totalVc: 30, estado: 'confirmada', fecha: '2026-11-08T12:24:00', comprobante: 'DEMO-CMP-0064',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-08T12:18:00', actorId: 'DEMO-A14', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-08T12:21:00', actorId: 'DEMO-A14', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-08T12:24:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P67', compradorId: 'DEMO-A02', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 2, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-04', cantidad: 1, precioUnitario: 65, vpUnitario: 30, vcUnitario: 25 }, { productoId: 'DEMO-PRD-05', cantidad: 1, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 715, totalVp: 300, totalVc: 235, estado: 'confirmada', fecha: '2026-11-08T14:41:00', comprobante: 'DEMO-CMP-0065',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-08T14:35:00', actorId: 'DEMO-A02', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-08T14:38:00', actorId: 'DEMO-A02', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-08T14:41:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P68', compradorId: 'DEMO-A09', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 1, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-03', cantidad: 1, precioUnitario: 80, vpUnitario: 20, vcUnitario: 30 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 630, totalVp: 260, totalVc: 210, estado: 'confirmada', fecha: '2026-11-08T15:51:00', comprobante: 'DEMO-CMP-0066',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-08T15:45:00', actorId: 'DEMO-A09', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-08T15:48:00', actorId: 'DEMO-A09', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-08T15:51:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P69', compradorId: 'DEMO-A10', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-03', cantidad: 1, precioUnitario: 80, vpUnitario: 20, vcUnitario: 30 }, { productoId: 'DEMO-PRD-04', cantidad: 1, precioUnitario: 65, vpUnitario: 30, vcUnitario: 25 }],
    totalPrecio: 145, totalVp: 50, totalVc: 55, estado: 'confirmada', fecha: '2026-11-09T09:03:00', comprobante: 'DEMO-CMP-0067',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-09T08:57:00', actorId: 'DEMO-A10', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-09T09:00:00', actorId: 'DEMO-A10', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-09T09:03:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P70', compradorId: 'DEMO-A08', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 2, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 800, totalVp: 340, totalVc: 260, estado: 'confirmada', fecha: '2026-11-10T09:09:00', comprobante: 'DEMO-CMP-0068',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-10T09:03:00', actorId: 'DEMO-A08', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-10T09:06:00', actorId: 'DEMO-A08', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-10T09:09:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P71', compradorId: 'DEMO-A03', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-02', cantidad: 2, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }],
    totalPrecio: 240, totalVp: 120, totalVc: 90, estado: 'confirmada', fecha: '2026-11-10T15:42:00', comprobante: 'DEMO-CMP-0069',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-10T15:36:00', actorId: 'DEMO-A03', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-10T15:39:00', actorId: 'DEMO-A03', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-10T15:42:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P72', compradorId: 'DEMO-C02', referenteId: 'DEMO-A03', periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-05', cantidad: 1, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 150, totalVp: 70, totalVc: 50, estado: 'pendiente', fecha: '2026-11-10T18:05:00', comprobante: '',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-10T17:59:00', actorId: 'DEMO-C02', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-10T18:02:00', actorId: 'DEMO-C02', detalle: 'Pedido enviado a confirmación de cobro' },
    ],
  },
  {
    id: 'DEMO-P73', compradorId: 'DEMO-A04', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 2, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-05', cantidad: 2, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 920, totalVp: 400, totalVc: 305, estado: 'confirmada', fecha: '2026-11-11T09:15:00', comprobante: 'DEMO-CMP-0070',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-11T09:09:00', actorId: 'DEMO-A04', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-11T09:12:00', actorId: 'DEMO-A04', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-11T09:15:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P74', compradorId: 'DEMO-A01', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-04', cantidad: 1, precioUnitario: 65, vpUnitario: 30, vcUnitario: 25 }],
    totalPrecio: 185, totalVp: 90, totalVc: 70, estado: 'confirmada', fecha: '2026-11-11T12:21:00', comprobante: 'DEMO-CMP-0071',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-11T12:15:00', actorId: 'DEMO-A01', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-11T12:18:00', actorId: 'DEMO-A01', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-11T12:21:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P75', compradorId: 'DEMO-A06', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 2, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-05', cantidad: 1, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 650, totalVp: 270, totalVc: 210, estado: 'confirmada', fecha: '2026-11-11T13:31:00', comprobante: 'DEMO-CMP-0072',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-11T13:25:00', actorId: 'DEMO-A06', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-11T13:28:00', actorId: 'DEMO-A06', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-11T13:31:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
  {
    id: 'DEMO-P76', compradorId: 'DEMO-A07', referenteId: null, periodoId: 'DEMO-C02',
    items: [{ productoId: 'DEMO-PRD-01', cantidad: 1, precioUnitario: 250, vpUnitario: 100, vcUnitario: 80 }, { productoId: 'DEMO-PRD-02', cantidad: 1, precioUnitario: 120, vpUnitario: 60, vcUnitario: 45 }, { productoId: 'DEMO-PRD-05', cantidad: 1, precioUnitario: 150, vpUnitario: 70, vcUnitario: 50 }],
    totalPrecio: 520, totalVp: 230, totalVc: 175, estado: 'confirmada', fecha: '2026-11-11T15:48:00', comprobante: 'DEMO-CMP-0073',
    eventos: [
      { estado: 'borrador', fecha: '2026-11-11T15:42:00', actorId: 'DEMO-A07', detalle: 'Pedido creado' },
      { estado: 'pendiente', fecha: '2026-11-11T15:45:00', actorId: 'DEMO-A07', detalle: 'Pedido enviado a confirmación de cobro' },
      { estado: 'confirmada', fecha: '2026-11-11T15:48:00', actorId: 'DEMO-U02', detalle: 'Confirmación de cobro simulada (sin transacción real)' },
    ],
  },
];
