const API_BASE_URL = "http://localhost:8762"; // Cambiar si el backend se mueve

const getToken = () => localStorage.getItem("token");

const getHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const request = async (path, body = {}, method = "GET") => {
  const isGetLike = method === "GET" || method === "DELETE";

  const gatewayPayload = {
    targetMethod: method,
    queryParams: {},
    body: body,
  };

  return fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      ...getHeaders(),
      ...(isGetLike && { "X-HTTP-Method-Override": method }),
    },
    body: JSON.stringify(gatewayPayload),
  });
};

// Login
export const login = async (matricula, contrasena) => {
  const res = await requestRaw("/auth/login", { matricula, contrasena }, "POST");
  if (!res.ok) throw new Error("Login fallido");
  const data = await res.json();
  localStorage.setItem("token", data.token);
  return data.token;
};

// Refrescar token
export const refreshToken = async () => {
  const res = await requestRaw("/auth/refresh", {}, "POST");
  if (!res.ok) throw new Error("No se pudo refrescar el token");
  const data = await res.json();
  localStorage.setItem("token", data.token);
  return data.token;
};

export const requestRaw = async (path, body = {}, method = "POST") => {
  return fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
};