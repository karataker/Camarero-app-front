import { useUser } from './useUser';

export const useNotificaciones = () => {
  const { usuario } = useUser();

  let notificaciones = 0;

  if (usuario?.tipo === 'admin') {
    notificaciones = 3;
  }

  if (usuario?.tipo === 'cliente') {
    notificaciones = 1;
  }

  return { notificaciones };
};
