// utils/tokenUtils.js
export const decodeToken = (token) => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error al decodificar token:', error);
    return null;
  }
};

export const isTokenExpired = (token) => {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  
  // Agregamos un buffer de 30 segundos para evitar race conditions
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  const bufferTime = 30 * 1000; // 30 segundos
  
  return currentTime >= (expirationTime - bufferTime);
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};