import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaPizzaSlice } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header: React.FC = () => {
  const { isAuthenticated, userType, logout } = useAuth();
  const { getTotalItems } = useCart();

  return (
    <header className="bg-gradient-to-r from-red-800 via-red-700 to-red-800 text-white shadow-lg relative">
      {/* Декоративная полоса сверху */}
      <div className="h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400"></div>
      
      <div className="container mx-auto px-4 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center">
          <FaPizzaSlice className="text-yellow-400 mr-2 text-2xl" />
          <Link to="/" className="text-2xl font-bold">
            <span className="text-white">Pizza</span>
            <span className="text-yellow-400">Delicious</span>
          </Link>
        </div>

        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-yellow-300 transition font-medium">Главная</Link>
          <Link to="/menu" className="hover:text-yellow-300 transition font-medium">Меню</Link>
          <Link to="/promotions" className="hover:text-yellow-300 transition font-medium">Акции</Link>

          {/* Ссылки для администратора */}
          {userType === 'admin' && (
            <>
              <Link to="/admin/pizzas" className="hover:text-yellow-300 transition font-medium">Управление пиццами</Link>
              <Link to="/admin/employees" className="hover:text-yellow-300 transition font-medium">Управление сотрудниками</Link>
              <Link to="/admin/couriers" className="hover:text-yellow-300 transition font-medium">Управление курьерами</Link>
              <Link to="/admin/promotions" className="hover:text-yellow-300 transition font-medium">Управление акциями</Link>
              <Link to="/admin/register" className="hover:text-yellow-300 transition font-medium">Регистрация пользователей</Link>
            </>
          )}
          {/* Ссылки для менеджеров */}
          {/*{(userType === 'manager' || userType === 'admin') && (*/}
          {(userType === 'manager') && (
            <>
              <Link to="/orders/manage" className="hover:text-yellow-300 transition font-medium">Управление заказами</Link>
              <Link to="/admin/promotions" className="hover:text-yellow-300 transition font-medium">Управление акциями</Link>
              <Link to="/admin/pizzas" className="hover:text-yellow-300 transition font-medium">Управление пиццами</Link>
            </>
          )}

          {/* Ссылки для сотрудников */}
          {(userType === 'employee' || userType === 'admin') && (
            <>
              <Link to="/orders/manage" className="hover:text-yellow-300 transition font-medium">Управление заказами</Link>
            </>
          )}

          {/* Ссылки для курьеров */}
          {userType === 'courier' && (
            <Link to="/orders/manage" className="hover:text-yellow-300 transition font-medium">Заказы</Link>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {/* Иконка корзины с счетчиком */}
          <Link
            to="/cart"
            className="relative hover:text-yellow-300 transition group"
            aria-label="Shopping Cart"
          >
            <FaShoppingCart className="text-xl" />
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-red-800 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                {getTotalItems()}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="hover:text-yellow-300 transition" aria-label="User Profile">
                <FaUser className="text-xl" />
              </Link>
              <button
                onClick={logout}
                className="hover:text-yellow-300 transition flex items-center"
              >
                <FaSignOutAlt className="text-xl" />
                <span className="ml-2 hidden md:inline">Выход</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="bg-white text-red-700 px-4 py-2 rounded-md hover:bg-yellow-300 transition shadow hover:shadow-md"
              >
                Вход
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-red-800 px-4 py-2 rounded-md hover:from-yellow-400 hover:to-yellow-300 transition shadow hover:shadow-md"
              >
                Регистрация
              </Link>
            </div>
          )}

          {/* Кнопка мобильного меню */}
          <button className="md:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Декоративный узор внизу хедера */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNIDAgMSBMIDE1IDEgTCAxNSAwIEwgMzAgMSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMikiIGZpbGw9Im5vbmUiLz48L3N2Zz4=')] opacity-50"></div>
    </header>
  );
};

export default Header;
