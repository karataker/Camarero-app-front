// Usar la URL base actual (localhost en desarrollo, dominio real en producción)
const BASE_URL = typeof window !== 'undefined' 
  ? `${window.location.origin}/cliente` 
  : 'http://localhost:3000/cliente';

const baresMock = [
  {
    id: 1,
    nombre: 'Bar Central',
    mesas: [
      // Mesas de Interior existentes
      {
        codigo: 'M01',
        disponible: true,
        comensales: 0,
        pedidoEnviado: false,
        zona: 'Interior',
        qrUrl: `${BASE_URL}/bar/1/mesa/M01`,
        fusionadaCon: null
      },
      {
        codigo: 'M02',
        disponible: false,
        comensales: 4,
        pedidoEnviado: false,
        zona: 'Interior',
        qrUrl: `${BASE_URL}/bar/1/mesa/M02`,
        fusionadaCon: null
      },
      {
        codigo: 'M03',
        disponible: false,
        comensales: 2,
        pedidoEnviado: true,
        zona: 'Interior',
        qrUrl: `${BASE_URL}/bar/1/mesa/M03`,
        fusionadaCon: null
      },
      {
        codigo: 'M10',
        disponible: false,
        comensales: 6,
        pedidoEnviado: true,
        zona: 'Interior',
        qrUrl: `${BASE_URL}/bar/1/mesa/M10`,
        fusionadaCon: null
      },
      {
        codigo: 'M11',
        disponible: false,
        comensales: 0,
        pedidoEnviado: false,
        zona: 'Interior',
        qrUrl: `${BASE_URL}/bar/1/mesa/M11`,
        fusionadaCon: 'M10'
      },
      
      // NUEVAS MESAS PARA TERRAZA
      {
        codigo: 'T01',
        disponible: true,
        comensales: 0,
        pedidoEnviado: false,
        zona: 'Terraza',
        qrUrl: `${BASE_URL}/bar/1/mesa/T01`,
        fusionadaCon: null
      },
      {
        codigo: 'T02',
        disponible: false,
        comensales: 3,
        pedidoEnviado: true,
        zona: 'Terraza',
        qrUrl: `${BASE_URL}/bar/1/mesa/T02`,
        fusionadaCon: null
      },
      {
        codigo: 'T03',
        disponible: false,
        comensales: 2,
        pedidoEnviado: false,
        zona: 'Terraza',
        qrUrl: `${BASE_URL}/bar/1/mesa/T03`,
        fusionadaCon: null
      },
      
      // NUEVAS SILLAS PARA BARRA
      {
        codigo: 'B01',
        disponible: true,
        comensales: 0,
        pedidoEnviado: false,
        zona: 'Barra',
        qrUrl: `${BASE_URL}/bar/1/mesa/B01`,
        fusionadaCon: null
      },
      {
        codigo: 'B02',
        disponible: false,
        comensales: 1,
        pedidoEnviado: true,
        zona: 'Barra',
        qrUrl: `${BASE_URL}/bar/1/mesa/B02`,
        fusionadaCon: null
      },
      {
        codigo: 'B03',
        disponible: false,
        comensales: 1,
        pedidoEnviado: false,
        zona: 'Barra',
        qrUrl: `${BASE_URL}/bar/1/mesa/B03`,
        fusionadaCon: null
      },
      {
        codigo: 'B04',
        disponible: true,
        comensales: 0,
        pedidoEnviado: false,
        zona: 'Barra',
        qrUrl: `${BASE_URL}/bar/1/mesa/B04`,
        fusionadaCon: null
      }
    ]
  },
  {
    id: 2,
    nombre: 'Bar Pepe',
    mesas: []
  },
  {
    id: 3,
    nombre: 'Bar El Patio',
    mesas: []
  }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const obtenerBares = async () => {
  await delay(300);
  return baresMock;
};

export const crearMesa = async (barId, nuevaMesa) => {
  await delay(300);
  const bar = baresMock.find(bar => bar.id === barId);
  if (!bar) throw new Error('Bar no encontrado');

  // Aquí también generamos el QR dinámicamente con la URL base actual
  const mesaConQR = {
    ...nuevaMesa,
    qrUrl: `${BASE_URL}/bar/${barId}/mesa/${nuevaMesa.codigo}`
  };

  return mesaConQR;
};

export const desfusionarMesa = async (barId, codigoMaestra) => {
  await delay(200);
  const bar = baresMock.find(bar => bar.id === barId);
  if (!bar) throw new Error('Bar no encontrado');

  bar.mesas.forEach(mesa => {
    if (mesa.fusionadaCon === codigoMaestra) {
      mesa.fusionadaCon = null;
    }
  });
  
  return true;
};
