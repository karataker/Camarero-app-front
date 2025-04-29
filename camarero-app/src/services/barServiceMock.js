const baresMock = [
  {
    id: 1,
    nombre: 'Bar Central',
    mesas: [
      { codigo: 'M01', disponible: true, comensales: 0, pedidoEnviado: false },
      { codigo: 'M02', disponible: false, comensales: 4, pedidoEnviado: false },
      { codigo: 'M03', disponible: false, comensales: 2, pedidoEnviado: true }
    ]
  },
  {
    id: 2,
    nombre: 'Bar Pepe',
    mesas: [
      { codigo: 'P01', disponible: true, comensales: 0, pedidoEnviado: false },
      { codigo: 'P02', disponible: false, comensales: 3, pedidoEnviado: true }
    ]
  },
  {
    id: 3,
    nombre: 'Bar El Patio',
    mesas: []
  }
];

// Simula una pequeña demora para imitar llamadas al servidor
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const obtenerBares = async () => {
  await delay(300);
  return baresMock;
};

export const crearMesa = async (barId, nuevaMesa) => {
  await delay(300);
  const bar = baresMock.find(bar => bar.id === barId);
  if (bar) {
    bar.mesas.push(nuevaMesa);
    return nuevaMesa;
  } else {
    throw new Error('Bar no encontrado');
  }
};

export const obtenerMesas = async (barId) => {
  await delay(300);
  const bar = baresMock.find(bar => bar.id === barId);
  if (bar) {
    return bar.mesas;
  } else {
    throw new Error('Bar no encontrado');
  }
};