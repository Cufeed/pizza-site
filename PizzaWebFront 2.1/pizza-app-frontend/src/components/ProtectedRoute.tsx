import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false,
  allowedRoles = [] 
}) => {
  const { isAuthenticated, isLoading, userType } = useAuth();
  const location = useLocation();

  // Если идет загрузка, показываем индикатор загрузки
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
      </div>
    );
  }

  // Если не авторизован и загрузка завершена, перенаправляем на страницу входа
  if (!isAuthenticated) {
    // Перенаправляем на страницу входа, сохраняя URL, с которого пришел пользователь
    return <Navigate to="/login" state={{ redirectTo: location.pathname }} replace />;
  }

  // Проверка на adminOnly
  if (adminOnly && userType !== 'admin' && userType !== 'employee') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="rounded-md bg-red-50 p-4">
            <h3 className="text-lg font-medium text-red-800">Доступ запрещен</h3>
            <p className="mt-2 text-sm text-red-700">
              У вас нет прав для доступа к этой странице. Только администраторы и сотрудники могут просматривать эту страницу.
            </p>
            <div className="mt-4">
              <Link to="/" className="text-blue-600 hover:text-blue-800">
                Вернуться на главную страницу
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Проверка на allowedRoles
  if (allowedRoles.length > 0 && (!userType || !allowedRoles.includes(userType))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="rounded-md bg-red-50 p-4">
            <h3 className="text-lg font-medium text-red-800">Доступ запрещен</h3>
            <p className="mt-2 text-sm text-red-700">
              У вас нет прав для доступа к этой странице. Эта страница доступна только для следующих ролей: {allowedRoles.join(', ')}.
            </p>
            <div className="mt-4">
              <Link to="/" className="text-blue-600 hover:text-blue-800">
                Вернуться на главную страницу
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 