import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt, FaPizzaSlice } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="relative pt-16 pb-8 overflow-hidden">
      {/* Фоновый градиент */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-800 to-red-900 -z-10"></div>
      
      {/* Декоративная волнистая линия сверху */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMnB4IiB2aWV3Qm94PSIwIDAgMTI4MCAxNDAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iI0ZGRkZGRiI+PHBhdGggZD0iTTAgMHYxNDBoMTI4MFYwSDB6IiBmaWxsLW9wYWNpdHk9Ii4wNSIvPjxwYXRoIGQ9Ik0wIDQydjk4aDEyODBWNDJIMHoiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PHBhdGggZD0iTTAgOTB2NTBoMTI4MFY5MEgweiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48cGF0aCBkPSJNMTI4MCA3NWMtMTczIDAtMzQ0IDkuNy01MDcgMTQuMkM2MDcgOTMuNyA0MjcgOTAuNiAzMDkgODJDMjE0IDc0LjUgMTI0IDEwMC41IDAgNzV2NjVoMTI4MFY3NXoiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20 rotate-180 transform"></div>

      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Раздел о нас */}
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <FaPizzaSlice className="text-yellow-400 mr-2 text-xl" />
              <h3 className="text-xl font-bold text-white">
                <span className="text-white">Pizza</span>
                <span className="text-yellow-400">Delicious</span>
              </h3>
            </div>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              Лучшая пицца в городе, приготовленная из свежих ингредиентов с любовью. Мы обслуживаем наше сообщество с 2077 года.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-red-700 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors">
                <FaFacebook />
              </a>
              <a href="#" className="w-10 h-10 bg-red-700 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors">
                <FaTwitter />
              </a>
              <a href="#" className="w-10 h-10 bg-red-700 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors">
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* Быстрые ссылки */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white relative inline-block">
              Быстрые ссылки
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-yellow-400 rounded"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-yellow-400 transition flex items-center">
                  <span className="bg-red-700 w-2 h-2 rounded-full mr-2"></span>
                  Главная страница
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-gray-300 hover:text-yellow-400 transition flex items-center">
                  <span className="bg-red-700 w-2 h-2 rounded-full mr-2"></span>
                  Меню
                </Link>
              </li>
              <li>
                <Link to="/promotions" className="text-gray-300 hover:text-yellow-400 transition flex items-center">
                  <span className="bg-red-700 w-2 h-2 rounded-full mr-2"></span>
                  Акции
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white relative inline-block">
              Контакты
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-yellow-400 rounded"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-yellow-400 mr-3 mt-1" />
                <span className="text-gray-300">123 Pizza Street, Night City, FC 2077</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="text-yellow-400 mr-3" />
                <span className="text-gray-300">8 (800) 555-35-35</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-yellow-400 mr-3" />
                <a href="mailto:info@pizzadelicious.com" className="text-gray-300 hover:text-yellow-400 transition">
                  info@pizzadelicious.com
                </a>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white relative inline-block">
              Время работы
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-yellow-400 rounded"></span>
            </h3>
            <div className="bg-red-800 bg-opacity-50 rounded-lg p-4 backdrop-blur-sm border border-red-700">
              <ul className="text-gray-300 space-y-3">
                <li className="flex justify-between items-center border-b border-red-700 pb-2">
                  <span>Понедельник - Пятница:</span>
                  <span className="text-yellow-400 font-semibold">10:00 - 22:00</span>
                </li>
                <li className="flex justify-between items-center border-b border-red-700 pb-2">
                  <span>Суббота:</span>
                  <span className="text-yellow-400 font-semibold">11:00 - 23:00</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Воскресенье:</span>
                  <span className="text-yellow-400 font-semibold">12:00 - 21:00</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-red-700 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} <span className="text-white">Pizza</span><span className="text-yellow-400">Delicious</span>. Бог вам судья.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
