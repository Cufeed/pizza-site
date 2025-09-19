type DecodedToken = Record<string, any>;

export function jwtDecode(token: string): DecodedToken | null {
  try {
    // Разделяем токен на части и берем payload
    const base64Url = token.split('.')[1];
    // Заменяем специальные символы для корректного декодирования
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Декодируем base64 в строку
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Ошибка декодирования JWT токена', error);
    return null;
  }
}
