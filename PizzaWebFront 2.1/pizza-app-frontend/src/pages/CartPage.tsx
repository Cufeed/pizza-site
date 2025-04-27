import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderAPI, pizzaAPI } from '../services/api';
import { authAPI } from '../services/api';
import axios from 'axios';

// Интерфейс для подсказок адресов
interface AddressSuggestion {
  value: string;
  details?: string;
  distance?: string;
}

const CartPage: React.FC = () => {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCart();
  const { isAuthenticated, userId, userType } = useAuth();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [floor, setFloor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);

  // Эффект для проверки и очистки корзины при загрузке страницы
  useEffect(() => {
    if (items.length === 0) return;
    
    // Проверяем наличие необходимых полей в элементах корзины
    // и удаляем невалидные элементы
    const hasInvalidItems = items.some(item => 
      !item.menuItemId || !item.pizzaId || typeof item.price !== 'number');
    
    if (hasInvalidItems) {
      console.warn('В корзине обнаружены невалидные элементы. Очистка корзины...');
      clearCart();
    }
  }, [items, clearCart]);

  const fetchSuggestions = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      // Используем полный URL бэкенда для отладки проблемы с API
      console.log('Отправляем запрос для адреса:', query);
      const response = await axios.get('http://localhost:5023/api/AddressSuggestions/suggest', {
        params: {
          query: query
        }
      });
      
      console.log('Ответ сервера:', response.status, response.data);
      
      // Проверяем, что ответ имеет статус успеха
      if (response.status !== 200) {
        console.error('Ошибка API:', response.status, response.statusText);
        setSuggestions([]);
        return;
      }
      
      // Парсим JSON-ответ только если это строка и предварительно логируем тип
      let data = response.data;
      console.log('Тип данных ответа:', typeof data);
      
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.error('Ошибка при парсинге JSON:', e);
          // Логируем первые 100 символов ответа для отладки
          console.error('Начало ответа:', data.substring(0, 100));
          setSuggestions([]);
          return;
        }
      }
      
      console.log('Распарсенные данные:', data);
      // Проверяем наличие results в ответе и преобразуем их в формат для отображения
      if (data?.results && Array.isArray(data.results)) {
        const formattedSuggestions = data.results.map((item: any) => ({
          value: item.title?.text || '',
          details: item.subtitle?.text || ''
        }));
        console.log('Форматированные подсказки:', formattedSuggestions);
        setSuggestions(formattedSuggestions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Ошибка при получении подсказок:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Статус ответа:', error.response.status);
        console.error('Данные ответа:', error.response.data);
      }
      setSuggestions([]);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDeliveryAddress(value);
    fetchSuggestions(value);
  };

  // Функция для формирования полного адреса, включая город
  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    // Формируем полный адрес: город + улица
    let fullAddress = '';
    
    // Если есть details (город), добавляем его первым
    if (suggestion.details) {
      fullAddress = suggestion.details + ', ';
    }
    
    // Добавляем value (улица, дом)
    fullAddress += suggestion.value;
    
    setDeliveryAddress(fullAddress);
    // Очищаем подсказки после выбора
    setSuggestions([]);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: '/cart' } });
      return;
    }

    if (!deliveryAddress.trim()) {
      setError('Пожалуйста, введите адрес доставки');
      return;
    }

    if (items.length === 0) {
      setError('Ваша корзина пуста');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (!userId) {
        throw new Error('User ID is not available');
      }

      // Получаем список сотрудников
      const employees = await authAPI.getEmployees();
      console.log('Полученные сотрудники:', employees);
      
      if (!employees || employees.length === 0) {
        throw new Error('No employees available to process your order');
      }

      // Проверяем структуру первого сотрудника
      const firstEmployee = employees[0];
      console.log('Структура первого сотрудника:', Object.keys(firstEmployee));

      // Берем ID сотрудника, учитывая возможные варианты названия поля
      const employeeId = firstEmployee.id || firstEmployee.Id || firstEmployee.employeeId;
      console.log('Выбранный ID сотрудника:', employeeId);

      if (!employeeId) {
        throw new Error('Could not find employee ID in the response');
      }

      // Комбинируем адрес, квартиру и этаж в единую строку
      const fullAddress = `${deliveryAddress}${apartment ? ', кв. ' + apartment : ''}${floor ? ', этаж ' + floor : ''}`;

      // Создать заказ
      const order = {
        customerId: userId,
        employeeId: employeeId,
        deliveryAddress: fullAddress,
        status: 'В обработке'
      };

      console.log('Отправляем заказ:', order);
      const createdOrder = await orderAPI.createOrder(order);
      console.log('Проверяем ответ сервера:', createdOrder);
      
      // Получаем ID заказа, учитывая возможные варианты именования
      const orderId = createdOrder?.Id || createdOrder?.id;
      console.log('Полученный ID заказа:', orderId);

      // Если заказ создан успешно, создаем позиции заказа
      if (createdOrder && orderId) {
        console.log('Заказ создан успешно, ID:', orderId);
        console.log('Начинаем создавать позиции заказа. Количество позиций:', items.length);
        console.log('Содержимое корзины:', items);
        
        // Создаем позиции заказа
        for (const item of items) {
          const orderedPizza = {
            orderId: orderId,
            pizzaId: item.pizzaId,
            quantity: item.quantity
          };
          console.log('Создаем позицию заказа:', orderedPizza);
          
          try {
            const response = await orderAPI.createOrderedPizza(orderedPizza);
            console.log('Позиция заказа успешно создана:', response);
          } catch (error) {
            console.error('Ошибка при создании позиции заказа:', error);
            throw error;
          }
        }

        console.log('Все позиции заказа созданы успешно');

        // Очищаем корзину и перенаправляем
        clearCart();
        setSuccessMessage('Заказ успешно создан! Вы будете перенаправлены на главную страницу.');

        // Перенаправление на страницу профиля через 3 секунды
        setTimeout(() => {
          navigate('/profile', { replace: true });
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Отрисовка элементов корзины с безопасным доступом к свойствам
  const renderCartItems = () => {
    return items.map((item) => (
      <tr key={item.menuItemId || 'unknown'} className="border-t">
        <td className="py-4 px-4">
          <div className="font-medium text-gray-800">{item.name || 'Unknown Pizza'}</div>
        </td>
        <td className="py-4 px-4 text-center">{item.price || 0} ₽</td>
        <td className="py-4 px-4">
          <div className="flex items-center justify-center">
            <button
              onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
              className="bg-gray-200 rounded-l-md p-2 hover:bg-gray-300"
            >
              <FaMinus size={12} />
            </button>
            <span className="px-4 py-1 bg-gray-100">{item.quantity || 1}</span>
            <button
              onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
              className="bg-gray-200 rounded-r-md p-2 hover:bg-gray-300"
            >
              <FaPlus size={12} />
            </button>
          </div>
        </td>
        <td className="py-4 px-4 text-right">
          {((item.price || 0) * (item.quantity || 1))} ₽
        </td>
        <td className="py-4 px-4 text-center">
          <button
            onClick={() => removeItem(item.menuItemId)}
            className="text-red-600 hover:text-red-800"
          >
            <FaTrash />
          </button>
        </td>
      </tr>
    ));
  };

  if (successMessage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Успешно! Отслеживайте заказ в профиле</p>
          <p>{successMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Ваша корзина</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-6">Ваша корзина пуста</p>
          <Link to="/menu" className="inline-flex items-center text-red-700 hover:text-red-800 font-semibold">
            <FaArrowLeft className="mr-2" /> Продолжить покупки
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Корзина */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left">Пицца</th>
                    <th className="py-3 px-4 text-center">Цена</th>
                    <th className="py-3 px-4 text-center">Количество</th>
                    <th className="py-3 px-4 text-right">Сумма</th>
                    <th className="py-3 px-4 text-center">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {renderCartItems()}
                </tbody>
              </table>
              <div className="p-4 border-t flex justify-between items-center">
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-800"
                >
                  Очистить корзину
                </button>
                <Link
                  to="/menu"
                  className="inline-flex items-center text-red-700 hover:text-red-800 font-semibold"
                >
                  <FaArrowLeft className="mr-2" /> Продолжить покупки
                </Link>
              </div>
            </div>
          </div>

          {/* Подсчёт ордера */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-bold mb-4">Сводка заказа</h2>
              <div className="border-t border-b py-4 mb-4">
                <div className="flex justify-between font-bold">
                  <span>Сумма</span>
                  <span>{getTotal()} ₽</span>
                </div>
              </div>

              {/* Адрес доставки (нужен?) */}
              <div className="mb-4">
                <label htmlFor="address" className="block text-gray-700 mb-2">
                  Адрес доставки
                </label>
                <textarea
                  id="address"
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
                  placeholder="Введите адрес доставки"
                  value={deliveryAddress}
                  onChange={handleAddressChange}
                ></textarea>
                {suggestions.length > 0 && (
                  <ul className="border border-gray-300 rounded mt-2">
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="font-medium">{suggestion.value}</div>
                        {suggestion.details && (
                          <div className="text-xs text-gray-500">{suggestion.details}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label htmlFor="apartment" className="block text-gray-700 mb-2">
                      Квартира
                    </label>
                    <input
                      id="apartment"
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
                      placeholder="Номер квартиры"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="floor" className="block text-gray-700 mb-2">
                      Этаж
                    </label>
                    <input
                      id="floor"
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
                      placeholder="Этаж"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={isSubmitting || items.length === 0}
                className={`w-full p-3 rounded-lg font-bold text-white ${
                  isSubmitting || items.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-700 hover:bg-red-800'
                }`}
              >
                {isSubmitting ? 'Processing...' : 'Checkout'}
              </button>

              {!isAuthenticated && (
                <p className="mt-4 text-sm text-gray-600">
                  You need to{' '}
                  <Link to="/login" className="text-red-700 hover:underline">
                    login
                  </Link>{' '}
                  to complete your order.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
