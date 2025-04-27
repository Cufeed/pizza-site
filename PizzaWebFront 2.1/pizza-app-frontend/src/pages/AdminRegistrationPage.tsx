import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { FaUser, FaEnvelope, FaLock, FaBriefcase, FaTruck, FaExclamationCircle } from 'react-icons/fa';

const AdminRegistrationPage: React.FC = () => {
  const { userType } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    position: '',
    maxCapacity: 5,
    userType: 'employee' // По умолчанию регистрируем сотрудника
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Если пользователь не админ, показываем сообщение об ошибке
  if (userType !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="rounded-md bg-red-50 p-4">
            <h3 className="text-lg font-medium text-red-800">Доступ запрещен</h3>
            <p className="mt-2 text-sm text-red-700">
              У вас нет прав для доступа к этой странице.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Проверка формы
    if (!formData.name.trim()) {
      setError('Имя обязательно');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email обязателен');
      return;
    }

    if (!formData.password.trim()) {
      setError('Пароль обязателен');
      return;
    }

    if (formData.password.length < 8) {
      setError('Пароль должен быть не менее 8 символов');
      return;
    }

    if (formData.userType === 'employee' && !formData.position.trim()) {
      setError('Должность обязательна для сотрудника');
      return;
    }

    try {
      setIsLoading(true);

      if (formData.userType === 'employee') {
        await authAPI.registerEmployee({
          name: formData.name,
          contactInfo: formData.email,
          position: formData.position,
          password: formData.password
        });
      } else {
        await authAPI.registerCourier({
          name: formData.name,
          contactInfo: formData.email,
          maxCapacity: formData.maxCapacity,
          password: formData.password
        });
      }

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        password: '',
        position: '',
        maxCapacity: 5,
        userType: 'employee'
      });

      // Сбрасываем успешное сообщение через 3 секунды
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Регистрация нового пользователя
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative">
              <label htmlFor="name" className="sr-only">
                Имя
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Имя"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="relative">
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Пароль
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Пароль (мин. 8 символов)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="relative">
              <label htmlFor="userType" className="sr-only">
                Тип пользователя
              </label>
              <select
                id="userType"
                name="userType"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                value={formData.userType}
                onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
              >
                <option value="employee">Сотрудник</option>
                <option value="courier">Курьер</option>
              </select>
            </div>

            {formData.userType === 'employee' && (
              <div className="relative">
                <label htmlFor="position" className="sr-only">
                  Должность
                </label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaBriefcase className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="position"
                  name="position"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder="Должность"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </div>
            )}

            {formData.userType === 'courier' && (
              <div className="relative">
                <label htmlFor="maxCapacity" className="sr-only">
                  Максимальная вместимость
                </label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaTruck className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="maxCapacity"
                  name="maxCapacity"
                  type="number"
                  min="1"
                  max="10"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder="Максимальная вместимость (1-10)"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Пользователь успешно зарегистрирован!
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading
                  ? 'bg-red-400 cursor-not-allowed'
                  : 'bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
              }`}
            >
              {isLoading ? 'Регистрация...' : 'Зарегистрировать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRegistrationPage; 