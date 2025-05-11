/**
 * Devuelve un conteo mockeado de notificaciones para un tipo específico.
 * Puedes hacer esta lógica tan simple o compleja como necesites para tu mock.
 * @param {string} tipoNotificacion - El tipo de notificación para el cual obtener el conteo.
 * @returns {number} - El número de notificaciones mockeadas.
 */
export const getMockNotificationCount = (tipoNotificacion) => {
  // Aquí puedes definir conteos fijos o aleatorios para diferentes tipos
  switch (tipoNotificacion) {
    case 'nueva_reserva':
      return 3; // Ejemplo: 3 notificaciones para reservas
    case 'nuevo_pedido':
      return 5; // Ejemplo: 5 notificaciones para pedidos
    case 'bajo_stock':
      return 1; // Ejemplo: 1 notificación para bajo stock
    case 'pedido_listo_cocina':
      return 2;
    // Añade más casos según los 'tipoNotificacion' que definas en HomeAdmin
    default:
      return 0; // Por defecto, 0 notificaciones
  }
};

// Si quisieras mockear la estructura completa de las notificaciones (para usar con useNotificaciones)
// podrías tener algo como:
/*
export const mockNotificationsData = [
  { id: 1, tipo: 'nueva_reserva', mensaje: 'Nueva reserva de Mesa 5', leida: false, fecha: new Date() },
  { id: 2, tipo: 'nueva_reserva', mensaje: 'Reserva para Juan Pérez confirmada', leida: true, fecha: new Date() },
  { id: 3, tipo: 'nuevo_pedido', mensaje: 'Nuevo pedido en Mesa 3', leida: false, fecha: new Date() },
  // ... más notificaciones mockeadas
];
*/