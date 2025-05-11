// Mock de reservas para la vista de Empleado Reservas

export const mockReservas = [
  {
    id: 1,
    fecha: '2025-05-05',
    hora: '20:30',
    nombre: 'Juan Pérez',
    personas: 4,
    telefono: '666555444',
    email: 'juan@email.com',
    estado: 'pendiente',
    mensaje: 'Mesa cerca de ventana si es posible',
    fechaSolicitud: '2025-05-04T10:30:00',
    mesa: null
  },
  {
    id: 2,
    fecha: '2025-05-05',
    hora: '21:00',
    nombre: 'María García',
    personas: 2,
    telefono: '666777888',
    email: 'maria@email.com',
    estado: 'confirmada',
    mensaje: '',
    fechaSolicitud: '2025-05-03T15:20:00',
    mesa: 'M01'
  },
  {
    id: 3,
    fecha: '2025-05-05',
    hora: '21:30',
    nombre: 'Carlos Rodríguez',
    personas: 6,
    telefono: '666999000',
    email: 'carlos@email.com',
    estado: 'confirmada',
    mensaje: 'Celebración de cumpleaños',
    fechaSolicitud: '2025-05-03T09:15:00',
    mesa: 'M04'
  },
  {
    id: 4,
    fecha: '2025-05-06',
    hora: '14:00',
    nombre: 'Ana Martínez',
    personas: 3,
    telefono: '666111222',
    email: 'ana@email.com',
    estado: 'pendiente',
    mensaje: '',
    fechaSolicitud: '2025-05-04T18:45:00',
    mesa: null
  },
  {
    id: 5,
    fecha: '2025-05-06',
    hora: '14:30',
    nombre: 'Luis Sánchez',
    personas: 2,
    telefono: '666333444',
    email: 'luis@email.com',
    estado: 'confirmada',
    mensaje: 'Mesa tranquila para reunión',
    fechaSolicitud: '2025-05-02T11:20:00',
    mesa: 'M02'
  },
  {
    id: 6,
    fecha: '2025-05-07',
    hora: '13:30',
    nombre: 'Elena López',
    personas: 5,
    telefono: '666555666',
    email: 'elena@email.com',
    estado: 'confirmada',
    mensaje: 'Comida familiar',
    fechaSolicitud: '2025-05-03T16:10:00',
    mesa: 'M03'
  },
  {
    id: 7,
    fecha: '2025-05-07',
    hora: '14:00',
    nombre: 'Roberto Díaz',
    personas: 4,
    telefono: '666777999',
    email: 'roberto@email.com',
    estado: 'confirmada',
    mensaje: '',
    fechaSolicitud: '2025-05-03T17:30:00',
    mesa: 'M01'
  },
  {
    id: 8,
    fecha: '2025-05-07',
    hora: '21:00',
    nombre: 'Carmen Ruiz',
    personas: 2,
    telefono: '666888000',
    email: 'carmen@email.com',
    estado: 'pendiente',
    mensaje: 'Mesa para dos',
    fechaSolicitud: '2025-05-04T19:15:00',
    mesa: null
  }
];

export const mockMesasPorBar = {
  "1": [
    { id: 'M01', nombre: 'M01', capacidad: 4 },
    { id: 'M02', nombre: 'M02', capacidad: 2 },
    { id: 'M03', nombre: 'M03', capacidad: 6 },
    { id: 'M04', nombre: 'M04', capacidad: 4 },
    { id: 'M05', nombre: 'M05', capacidad: 2 },
    { id: 'M06', nombre: 'M06', capacidad: 4 },
    { id: 'M07', nombre: 'M07', capacidad: 2 },
    { id: 'M08', nombre: 'M08', capacidad: 8 },
  ],
  // Puedes agregar más bares aquí
};

export const obtenerMesasDelBar = (barId) => {
  return mockMesasPorBar[barId] || [];
};