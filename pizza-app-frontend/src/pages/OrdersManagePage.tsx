import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { orderAPI, pizzaAPI, menuAPI, reviewAPI, authAPI } from '../services/api';
import { FaSpinner, FaExclamationCircle, FaCheckCircle, FaUser, FaFilter } from 'react-icons/fa';

interface Order {
  Id: string;
  OrderDate: string;
  Status: string;
  CustomerId: string;
  DeliveryAddress: string;
  EmployeeId: string;
  Customer?: {
    Name: string;
    Id?: string;
    ContactInfo: string;
  };
  orderedPizzas?: Array<{
    Id: string;
    OrderId: string;
    PizzaId: string;
    Quantity: number;
    pizza?: {
      Name: string;
      Ingredients: string;
      Price: number;
    };
  }>;
  reviews?: Array<{
    Id: string;
    ReviewText: string;
    Rating: number;
    ReviewDate: string;
    CustomerId: string;
    OrderId: string;
  }>;
}

const OrdersManagePage: React.FC = () => {
  const { user, userType } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Кэш имен клиентов для избежания повторных запросов
  const [customerNames, setCustomerNames] = useState<Record<string, string>>({});
  
  // Определяем, является ли пользователь курьером
  const isCourier = userType === 'courier';
  
  // Фильтр статуса с учетом типа пользователя
  const [statusFilter, setStatusFilter] = useState<string>(
    isCourier ? 'В пути' : 'В обработке'
  );

  // Состояние для отслеживания открытого меню статуса
  const [openStatusMenu, setOpenStatusMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Функция для получения имени клиента с кэшированием
  const getCustomerName = useCallback((customerId: string): string => {
    // Возвращаем либо кэшированное имя, либо форматированный ID
    return customerNames[customerId] || `Клиент ${customerId.substring(0, 8)}...`;
  }, [customerNames]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const ordersData = await orderAPI.getOrders();
      console.log('Полученные заказы:', ordersData);
      
      // Получаем все MenuItems для цен
      const menuItems = await menuAPI.getMenuItems();
      console.log('Получены MenuItems:', menuItems);

      // Собираем уникальные ID клиентов для всех заказов
      const uniqueCustomerIds = new Set<string>();
      ordersData.forEach((order: Order) => {
        uniqueCustomerIds.add(order.CustomerId);
      });
      
      // Получаем данные клиентов заранее
      const customerDataMap: Record<string, any> = {};
      await Promise.all(Array.from(uniqueCustomerIds).map(async (customerId) => {
        try {
          const customer = await authAPI.getCustomer(customerId);
          if (customer && customer.Name) {
            customerDataMap[customerId] = customer;
            console.log(`Получены данные клиента: ${customer.Name} для ID: ${customerId}`);
          }
        } catch (err) {
          console.error(`Ошибка при получении клиента ${customerId}:`, err);
        }
      }));

      const ordersWithDetails = await Promise.all(
        ordersData.map(async (order: Order) => {
          try {
            const orderedPizzas = await orderAPI.getOrderedPizzasByOrderId(order.Id);
            
            // Получаем отзывы для заказа
            const reviews = await reviewAPI.getReviewsByOrderId(order.Id);
            console.log(`Получены отзывы для заказа ${order.Id}:`, reviews);
            
            // Получаем информацию о каждой пицце и её цене
            const orderedPizzasWithDetails = await Promise.all(
              orderedPizzas.map(async (item: any) => {
                try {
                  const pizzaDetails = await pizzaAPI.getPizzaById(item.PizzaId);
                  const menuItem = menuItems.find((mi: any) => mi.PizzaId === item.PizzaId);
                  
                  return {
                    ...item,
                    pizza: {
                      ...pizzaDetails,
                      Price: menuItem?.TotalPrice || 0
                    }
                  };
                } catch (error) {
                  console.error(`Ошибка при получении информации о пицце ${item.PizzaId}:`, error);
                  return item;
                }
              })
            );

            // Используем данные клиента из предварительно загруженной карты или создаем стандартный объект
            const customerData = customerDataMap[order.CustomerId];
            const customerDisplay = {
              name: customerData ? customerData.Name : 'Клиент',
              id: order.CustomerId
            };

            return {
              ...order,
              Customer: { 
                Name: customerDisplay.name,
                Id: customerDisplay.id,
                ContactInfo: customerData?.ContactInfo || 'Н/Д' 
              },
              orderedPizzas: orderedPizzasWithDetails,
              reviews: reviews
            };
          } catch (err) {
            console.error(`Ошибка при получении деталей заказа ${order.Id}:`, err);
            return {
              ...order,
              Customer: { Name: 'Неизвестный клиент', ContactInfo: 'Н/Д' },
              orderedPizzas: [],
              reviews: []
            };
          }
        })
      );
      setOrders(ordersWithDetails);
      
      // Собираем уникальные ID клиентов из всех отзывов для отображения имен в отзывах
      const reviewerIds = new Set<string>();
      ordersWithDetails.forEach(order => {
        if (order.reviews && order.reviews.length > 0) {
          order.reviews.forEach((review: any) => {
            reviewerIds.add(review.CustomerId);
          });
        }
      });
      
      console.log('Уникальные ID клиентов для отзывов:', Array.from(reviewerIds));
      
      // Обновляем кэш имен клиентов для отзывов
      const namesCacheUpdate: Record<string, string> = {};
      
      // Сначала используем уже загруженные данные клиентов
      Array.from(reviewerIds).forEach(id => {
        if (customerDataMap[id] && customerDataMap[id].Name) {
          namesCacheUpdate[id] = customerDataMap[id].Name;
        }
      });
      
      // Затем загружаем остальные (если такие есть)
      await Promise.all(Array.from(reviewerIds)
        .filter(id => !namesCacheUpdate[id] && !customerNames[id])
        .map(async (reviewerId) => {
          try {
            const customer = await authAPI.getCustomer(reviewerId);
            if (customer && customer.Name) {
              namesCacheUpdate[reviewerId] = customer.Name;
            } else {
              namesCacheUpdate[reviewerId] = `Клиент`;
            }
          } catch (apiErr) {
            console.error(`Ошибка API при получении данных клиента ${reviewerId}:`, apiErr);
            namesCacheUpdate[reviewerId] = `Клиент`;
          }
        })
      );
      
      // Обновляем кэш имен клиентов
      setCustomerNames(prev => ({ ...prev, ...namesCacheUpdate }));
      
    } catch (err) {
      setError('Ошибка при загрузке заказов');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Функция для отображения рейтинга звездочками
  const renderReviewStars = (rating: number) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={`star-${i}`}
          className={`text-xl ${i <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
        >
          ★
        </span>
      );
    }
    
    return stars;
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Находим текущий заказ
      const currentOrder = orders.find(order => order.Id === orderId);
      if (!currentOrder) {
        throw new Error('Заказ не найден');
      }

      // Отправляем обновление с сохранением всех необходимых полей
      await orderAPI.updateOrderStatus(orderId, newStatus);
      setSuccessMessage('Статус заказа успешно обновлен');
      fetchOrders(); // Обновляем список заказов
      
      // Сбрасываем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError('Ошибка при обновлении статуса заказа');
      console.error('Error updating order status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Преобразование статусов для отображения
  const getStatusDisplayName = (status: string): string => {
    switch (status) {
      case 'Processing':
      case 'В обработке':
        return 'В обработке';
      case 'Preparing':
      case 'Готовится':
        return 'Готовится';
      case 'OnTheWay':
      case 'В пути':
        return 'В пути';
      case 'Completed':
      case 'Выполнен':
        return 'Выполнен';
      case 'Cancelled':
      case 'Отменён':
        return 'Отменён';
      default:
        return status;
    }
  };

  // Проверка, может ли пользователь изменять статус заказа
  const canChangeOrderStatus = userType === 'admin' || userType === 'employee' || isCourier;

  // Получаем отфильтрованные заказы
  const filteredOrders = orders.filter(order => {
    // Если выбраны все заказы
    if (statusFilter === 'Все заказы') return true;
    // В противном случае фильтруем по статусу
    return order.Status === statusFilter;
  });

  // Устанавливаем цвет фона для строк, основываясь на статусе и роли пользователя
  const getRowClassName = (status: string) => {
    if (isCourier && status === 'В пути') {
      return 'bg-yellow-50 hover:bg-yellow-100';
    }
    return 'hover:bg-gray-50';
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Управление заказами</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <FaExclamationCircle className="mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <FaCheckCircle className="mr-2" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Фильтр статусов */}
      <div className="mb-6 flex items-center">
        <div className="flex items-center space-x-2">
          <FaFilter className="text-gray-500" />
          <span className="text-gray-700">Фильтр по статусу:</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="ml-3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {isCourier ? (
            <>
              <option value="В пути">В пути</option>
              <option value="Выполнен">Выполнен</option>
              <option value="Отменён">Отменён</option>
            </>
          ) : (
            <>
              <option value="Все заказы">Все заказы</option>
              <option value="В обработке">В обработке</option>
              <option value="Готовится">Готовится</option>
              <option value="В пути">В пути</option>
              <option value="Выполнен">Выполнен</option>
              <option value="Отменён">Отменён</option>
            </>
          )}
        </select>
        {isCourier ? (
        <button
          onClick={() => setStatusFilter('В пути')}
          className="ml-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Сбросить
        </button>
        ) : (
          <button
            onClick={() => setStatusFilter('Все заказы')}
            className="ml-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Сбросить
          </button>
        )}
      </div>

      <div className="x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID заказа
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Клиент
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Адрес доставки
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Позиции
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={canChangeOrderStatus ? 7 : 6} className="px-6 py-4 text-center text-gray-500">
                  Заказы не найдены
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.Id} className={getRowClassName(order.Status)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.Id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.OrderDate).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{order.Customer?.Name || 'Неизвестный клиент'}</div>
                      <hr className="my-1" />
                      <div className="text-xs text-gray-500">{order.Customer?.Id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.DeliveryAddress || 'Н/Д'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <ul className="list-disc list-inside">
                      {order.orderedPizzas?.map((item) => (
                        <li key={item.Id}>
                          {item.pizza?.Name || 'Неизвестная пицца'} x {item.Quantity}
                          {item.pizza?.Price && (
                            <span className="ml-2 text-gray-500">
                              ({item.pizza.Price * item.Quantity} ₽)
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                    {order.orderedPizzas && order.orderedPizzas.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-sm font-medium text-gray-700">
                          Итого: {order.orderedPizzas.reduce((total, item) => 
                            total + (item.pizza?.Price || 0) * item.Quantity, 0
                          )} ₽
                        </p>
                      </div>
                    )}
                    
                    {/* Отзывы клиента */}
                    {order.reviews && order.reviews.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium text-gray-700 mb-2">Отзывы:</p>
                        <div className="space-y-3">
                          {order.reviews.map(review => (
                            <div key={`review-${review.Id}`} className="p-3 bg-gray-50 rounded">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center">
                                  {renderReviewStars(review.Rating)}
                                  <span className="ml-2 text-xs text-gray-500">
                                    {new Date(review.ReviewDate).toLocaleString()}
                                  </span>
                                </div>
                                <span className="text-sm font-medium text-blue-600 flex items-center">
                                  <FaUser className="mr-1 text-blue-500" size={14} />
                                  {getCustomerName(review.CustomerId)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{review.ReviewText}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {canChangeOrderStatus ? (
                      <div className="relative">
                        <button
                          onClick={() => setOpenStatusMenu(openStatusMenu === order.Id ? null : order.Id)}
                          className={`inline-flex items-center px-3 py-1 border rounded-md font-medium ${getStatusColor(order.Status)}`}
                        >
                          <span className={order.Status === 'В пути' && isCourier ? 'font-bold' : ''}>
                            {getStatusDisplayName(order.Status)}
                          </span>
                          <svg className="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {openStatusMenu === order.Id && (
                          <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1" role="menu" aria-orientation="vertical">
                              {isCourier ? (
                                // Для курьеров ограниченный список статусов
                                <>
                                  <button
                                    onClick={() => {
                                      handleStatusChange(order.Id, 'В пути');
                                      setOpenStatusMenu(null);
                                    }}
                                    className={`block w-full text-left px-4 py-2 text-sm ${order.Status === 'В пути' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
                                    role="menuitem"
                                  >
                                    В пути
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleStatusChange(order.Id, 'Выполнен');
                                      setOpenStatusMenu(null);
                                    }}
                                    className={`block w-full text-left px-4 py-2 text-sm ${order.Status === 'Выполнен' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
                                    role="menuitem"
                                  >
                                    Выполнен
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleStatusChange(order.Id, 'Отменён');
                                      setOpenStatusMenu(null);
                                    }}
                                    className={`block w-full text-left px-4 py-2 text-sm ${order.Status === 'Отменён' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
                                    role="menuitem"
                                  >
                                    Отменён
                                  </button>
                                </>
                              ) : (
                                // Для админов и сотрудников полный список статусов
                                <>
                                  <button
                                    onClick={() => {
                                      handleStatusChange(order.Id, 'В обработке');
                                      setOpenStatusMenu(null);
                                    }}
                                    className={`block w-full text-left px-4 py-2 text-sm ${order.Status === 'В обработке' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
                                    role="menuitem"
                                  >
                                    В обработке
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleStatusChange(order.Id, 'Готовится');
                                      setOpenStatusMenu(null);
                                    }}
                                    className={`block w-full text-left px-4 py-2 text-sm ${order.Status === 'Готовится' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
                                    role="menuitem"
                                  >
                                    Готовится
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleStatusChange(order.Id, 'В пути');
                                      setOpenStatusMenu(null);
                                    }}
                                    className={`block w-full text-left px-4 py-2 text-sm ${order.Status === 'В пути' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
                                    role="menuitem"
                                  >
                                    В пути
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleStatusChange(order.Id, 'Выполнен');
                                      setOpenStatusMenu(null);
                                    }}
                                    className={`block w-full text-left px-4 py-2 text-sm ${order.Status === 'Выполнен' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
                                    role="menuitem"
                                  >
                                    Выполнен
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleStatusChange(order.Id, 'Отменён');
                                      setOpenStatusMenu(null);
                                    }}
                                    className={`block w-full text-left px-4 py-2 text-sm ${order.Status === 'Отменён' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
                                    role="menuitem"
                                  >
                                    Отменён
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className={order.Status === 'В пути' && isCourier ? 'font-bold text-blue-700' : ''}>
                        {getStatusDisplayName(order.Status)}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Функция для определения цвета статуса
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'В обработке':
      return 'border-yellow-300 bg-yellow-50 text-yellow-800';
    case 'Готовится':
      return 'border-blue-300 bg-blue-50 text-blue-800';
    case 'В пути':
      return 'border-indigo-300 bg-indigo-50 text-indigo-800';
    case 'Выполнен':
      return 'border-green-300 bg-green-50 text-green-800';
    case 'Отменён':
      return 'border-red-300 bg-red-50 text-red-800';
    default:
      return 'border-gray-300 bg-gray-50 text-gray-800';
  }
};

export default OrdersManagePage; 