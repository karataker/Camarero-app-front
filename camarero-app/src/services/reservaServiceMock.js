const baresMock = [
    { id: 1, nombre: 'Bar Central', zonas: ['Interior', 'Terraza'] },
    { id: 2, nombre: 'Bar Pepe', zonas: ['Interior'] },
    { id: 3, nombre: 'Bar El Patio', zonas: ['Terraza'] }
  ];
  
  const delay = (ms) => new Promise(res => setTimeout(res, ms));
  
  export const obtenerBaresYzonas = async () => {
    await delay(300);
    return baresMock;
  };
  
  export const enviarReserva = async (reserva) => {
    console.log('Reserva enviada al mock:', reserva);
    await delay(500);
    return { ok: true, mensaje: 'Reserva registrada' };
  };
  