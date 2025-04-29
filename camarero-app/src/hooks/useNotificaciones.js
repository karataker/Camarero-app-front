import { useUser } from './useUser';

export const useNotificaciones = () => {
  const { usuario } = useUser();

  // Aquí se podrían hacer peticiones al backend según el tipo
  let notificaciones = 0;

  if (usuario?.tipo === 'admin') {
    notificaciones = 3; // ejemplo: 3 comandas nuevas
  }

  if (usuario?.tipo === 'cliente') {
    notificaciones = 1; // ejemplo: pedido listo o algo similar
  }

  return { notificaciones };
};
