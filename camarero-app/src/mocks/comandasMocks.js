export const mockComandas = [
  // Mesa A1 con varios pedidos
  {
    id: 1,
    codigo: 'A1-001',
    mesa: 'A1',
    estado: 'pendiente',
    horaEntrada: '14:30',
    horaPreparacion: null,
    horaListo: null,
    horaEntregado: null,
    items: [
      { nombre: 'Hamburguesa Completa', cantidad: 2 },
      { nombre: 'Coca-Cola', cantidad: 2 },
      { nombre: 'Patatas Fritas', cantidad: 1 }
    ],
    total: 25.80
  },
  {
    id: 9,
    codigo: 'A1-002',
    mesa: 'A1',
    estado: 'preparacion',
    horaEntrada: '15:10',
    horaPreparacion: '15:15',
    horaListo: null,
    horaEntregado: null,
    items: [
      { nombre: 'Ensalada Mixta', cantidad: 1 },
      { nombre: 'Agua con Gas', cantidad: 2 }
    ],
    total: 10.50
  },
  {
    id: 10,
    codigo: 'A1-003',
    mesa: 'A1',
    estado: 'listo',
    horaEntrada: '15:20',
    horaPreparacion: '15:25',
    horaListo: '15:40',
    horaEntregado: null,
    items: [
      { nombre: 'Pizza Barbacoa', cantidad: 1 }
    ],
    total: 13.90
  },
  // Mesa B3
  {
    id: 2,
    codigo: 'B3-001',
    mesa: 'B3',
    estado: 'preparacion',
    horaEntrada: '14:45',
    horaPreparacion: '14:50',
    horaListo: null,
    horaEntregado: null,
    items: [
      { nombre: 'Pizza Margarita', cantidad: 1 },
      { nombre: 'Ensalada César', cantidad: 1 },
      { nombre: 'Agua Mineral', cantidad: 2 }
    ],
    total: 18.50
  },
  // Mesa C2
  {
    id: 3,
    codigo: 'C2-001',
    mesa: 'C2',
    estado: 'listo',
    horaEntrada: '14:20',
    horaPreparacion: '14:25',
    horaListo: '14:40',
    horaEntregado: null,
    items: [
      { nombre: 'Pasta Carbonara', cantidad: 1 },
      { nombre: 'Tiramisú', cantidad: 1 },
      { nombre: 'Copa de Vino Tinto', cantidad: 1 }
    ],
    total: 21.75
  },
  // Mesa A4
  {
    id: 4,
    codigo: 'A4-001',
    mesa: 'A4',
    estado: 'entregado',
    horaEntrada: '13:50',
    horaPreparacion: '13:55',
    horaListo: '14:10',
    horaEntregado: '14:15',
    items: [
      { nombre: 'Sándwich Club', cantidad: 2 },
      { nombre: 'Refresco de Naranja', cantidad: 2 },
      { nombre: 'Brownie de Chocolate', cantidad: 2 }
    ],
    total: 24.60
  },
  // Mesa D1
  {
    id: 5,
    codigo: 'D1-001',
    mesa: 'D1',
    estado: 'pendiente',
    horaEntrada: '15:00',
    horaPreparacion: null,
    horaListo: null,
    horaEntregado: null,
    items: [
      { nombre: 'Paella Mixta', cantidad: 2 },
      { nombre: 'Sangría', cantidad: 1 },
      { nombre: 'Pan', cantidad: 1 }
    ],
    total: 42.30
  },
  // Mesa B2
  {
    id: 6,
    codigo: 'B2-001',
    mesa: 'B2',
    estado: 'preparacion',
    horaEntrada: '15:15',
    horaPreparacion: '15:20',
    horaListo: null,
    horaEntregado: null,
    items: [
      { nombre: 'Tortilla Española', cantidad: 1 },
      { nombre: 'Croquetas de Jamón', cantidad: 4 },
      { nombre: 'Cerveza', cantidad: 2 }
    ],
    total: 16.90
  },
  // Mesa C4
  {
    id: 7,
    codigo: 'C4-001',
    mesa: 'C4',
    estado: 'listo',
    horaEntrada: '15:05',
    horaPreparacion: '15:10',
    horaListo: '15:25',
    horaEntregado: null,
    items: [
      { nombre: 'Sopa de Marisco', cantidad: 1 },
      { nombre: 'Lubina a la Plancha', cantidad: 1 },
      { nombre: 'Vino Blanco', cantidad: 1 }
    ],
    total: 32.50
  },
  // Mesa A2
  {
    id: 8,
    codigo: 'A2-001',
    mesa: 'A2',
    estado: 'entregado',
    horaEntrada: '14:00',
    horaPreparacion: '14:05',
    horaListo: '14:20',
    horaEntregado: '14:30',
    items: [
      { nombre: 'Tacos de Pollo', cantidad: 3 },
      { nombre: 'Nachos con Guacamole', cantidad: 1 },
      { nombre: 'Margarita', cantidad: 2 }
    ],
    total: 29.75
  }
];

// Función para obtener comandas de un bar específico
export const obtenerComandasDelBar = (barId) => {
  // En una implementación real, esto filtraría por el barId
  // Aquí simplemente devolvemos todas las comandas
  return mockComandas;
};