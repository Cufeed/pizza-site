import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Получаем userType из user объекта
  const userType = user?.userType?.toLowerCase();

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-auto">
              {/* Logo */}
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {/* Navbar items */}
                {isAuthenticated && userType === 'admin' && (
                  <>
                    <Link to="/admin/register" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                      Регистрация админа
                    </Link>
                    <Link to="/admin/employees" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                      Сотрудники
                    </Link>
                    <Link to="/admin/couriers" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                      Курьеры
                    </Link>
                    <Link to="/orders/manage" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                      Управление заказами
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 