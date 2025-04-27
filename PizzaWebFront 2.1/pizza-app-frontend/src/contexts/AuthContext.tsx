import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { AuthRequest, AuthResponse, Customer, Employee, Courier } from '../types';
import { jwtDecode } from '../utils/jwtDecode';

interface AuthContextType {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    userType: string;
  } | null;
  login: (credentials: AuthRequest) => Promise<void>;
  register: (email: string, password: string, userType: string) => Promise<void>;
  logout: () => void;
  userId: string | null;
  userType: string | null;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userType, setUserType] = useState<'customer' | 'employee' | 'courier' | 'admin' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email: string; userType: string; } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getUserEmail = async (id: string, role: string): Promise<string> => {
    try {
      let response: Customer | Employee | Courier;
      const lowerCaseRole = role.toLowerCase();
      
      console.log('Получаем email для роли:', role, 'приведенная к lowercase:', lowerCaseRole);
      
      switch (lowerCaseRole) {
        case 'customer':
          response = await authAPI.getCustomer(id);
          break;
        case 'employee':
        case 'admin':
        case 'manager':
          response = await authAPI.getEmployee(id);
          break;
        case 'courier':
          response = await authAPI.getCourier(id);
          break;
        default:
          console.error('Неизвестная роль пользователя:', role);
          throw new Error('Invalid user role');
      }
      console.log('Ответ от API:', response);
      return response.ContactInfo;
    } catch (err) {
      console.error('Error fetching user email:', err);
      throw err; // Проброс ошибки для обработки в вызывающем коде
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          console.log('Полный декодированный токен:', decodedToken);
          if (decodedToken) {
            console.log('Все claims в токене:', Object.keys(decodedToken));
          }
          
          const role = decodedToken?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || '';
          const id = decodedToken?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '';

          console.log('Извлеченные данные:', { role, id });

          if (role && id) {
            setIsAuthenticated(true);
            setUserId(id);
            
            // Получаем email пользователя
            const email = await getUserEmail(id, role);
            console.log('Полученный email:', email);
            
            setUser({ id, email, userType: role.toLowerCase() });

            const lowerCaseRole = role.toLowerCase();
            if (lowerCaseRole === 'customer') {
              setUserType('customer');
            } else if (lowerCaseRole === 'employee') {
              setUserType('employee');
            } else if (lowerCaseRole === 'courier') {
              setUserType('courier');
            } else if (lowerCaseRole === 'admin') {
              setUserType('admin');
            } else if (lowerCaseRole === 'manager') {
              setUserType('employee'); // Manager считаем типом сотрудника
            }
          }
        } catch (err) {
          console.error('Ошибка при декодировании токена:', err);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: AuthRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('AuthContext: Sending login request with credentials:', credentials);
      const response = await authAPI.login(credentials);
      console.log('AuthContext: Login response:', response);

      if (!response || !response.Token) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', response.Token);
      const decodedToken = jwtDecode(response.Token);
      
      if (!decodedToken) {
        throw new Error('Invalid token received');
      }

      console.log('AuthContext: Decoded token:', decodedToken);
      console.log('AuthContext: All claims in token:', Object.keys(decodedToken));

      const role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || '';
      const id = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '';

      console.log('AuthContext: Extracted data:', { role, id });

      if (!role || !id) {
        throw new Error('Invalid token data');
      }

      // Получаем email пользователя через API
      const email = await getUserEmail(id, role);
      console.log('AuthContext: Полученный email:', email);

      setIsAuthenticated(true);
      setUserId(id);
      setUser({ id, email, userType: role.toLowerCase() });

      const lowerCaseRole = role.toLowerCase();
      if (lowerCaseRole === 'customer') {
        setUserType('customer');
      } else if (lowerCaseRole === 'employee') {
        setUserType('employee');
      } else if (lowerCaseRole === 'courier') {
        setUserType('courier');
      } else if (lowerCaseRole === 'admin') {
        setUserType('admin');
      } else if (lowerCaseRole === 'manager') {
        setUserType('employee'); // Manager считаем типом сотрудника
      } else {
        throw new Error('Invalid user role');
      }
    } catch (err) {
      console.error('AuthContext: Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to login');
      setIsAuthenticated(false);
      setUserType(null);
      setUserId(null);
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, userType: string) => {
    setIsLoading(true);
    setError(null);

    try {
      let response;
      switch (userType.toLowerCase()) {
        case 'customer':
          response = await authAPI.registerCustomer({
            name: email.split('@')[0],
            contactInfo: email,
            password
          });
          break;
        case 'employee':
          response = await authAPI.registerEmployee({
            name: email.split('@')[0],
            contactInfo: email,
            position: 'Employee',
            password
          });
          break;
        case 'courier':
          response = await authAPI.registerCourier({
            name: email.split('@')[0],
            contactInfo: email,
            maxCapacity: 5,
            password
          });
          break;
        case 'admin':
          response = await authAPI.createAdmin({
            name: email.split('@')[0],
            contactInfo: email,
            position: 'Admin',
            password
          });
          break;
        default:
          throw new Error('Invalid user type');
      }

      if (!response || !response.Token) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', response.Token);
      const decodedToken = jwtDecode(response.Token);
      
      if (!decodedToken) {
        throw new Error('Invalid token received');
      }

      const role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || '';
      const id = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '';

      if (!role || !id) {
        throw new Error('Invalid token data');
      }

      // Получаем email пользователя через API
      const userEmail = await getUserEmail(id, role);
      console.log('AuthContext: Полученный email при регистрации:', userEmail);

      setIsAuthenticated(true);
      setUserId(id);
      setUser({ id, email: userEmail, userType: role.toLowerCase() });

      const lowerCaseRole = role.toLowerCase();
      if (lowerCaseRole === 'customer') {
        setUserType('customer');
      } else if (lowerCaseRole === 'employee') {
        setUserType('employee');
      } else if (lowerCaseRole === 'courier') {
        setUserType('courier');
      } else if (lowerCaseRole === 'admin') {
        setUserType('admin');
      } else if (lowerCaseRole === 'manager') {
        setUserType('employee'); // Manager считаем типом сотрудника
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
      setIsAuthenticated(false);
      setUserType(null);
      setUserId(null);
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserType(null);
    setUserId(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userType,
        userId,
        user,
        login,
        register,
        logout,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
