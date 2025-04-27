import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { AuthRequest, AuthResponse, CustomerRegistration, EmployeeRegistration, CourierRegistration, AdminRegistration, CreateOrderRequest, CreateReviewRequest } from '../types';

// Используем переменную окружения, если доступна, иначе используем localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5023/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик запросов для добавления токена авторизации
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API аутентификации
export const authAPI = {
  login: async (credentials: AuthRequest): Promise<AuthResponse> => {
    try {
      // Преобразуем данные в формат, который ожидает бэкенд
      const requestData = {
        Identifier: credentials.identifier,
        Password: credentials.password
      };

      console.log('API: Sending login request with credentials:', requestData);
      console.log('API: Request URL:', `${API_URL}/Auth/login`);
      console.log('API: Request headers:', {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });
      
      const response = await api.post<AuthResponse>('/Auth/login', requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('API: Login response:', response.data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('API: Login error details:', {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status,
        headers: axiosError.response?.headers,
        request: {
          data: axiosError.config?.data,
          headers: axiosError.config?.headers
        }
      });
      throw handleApiError(axiosError);
    }
  },

  registerCustomer: async (data: CustomerRegistration) => {
    try {
      const response = await api.post('/Auth/register/customer', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  registerEmployee: async (data: EmployeeRegistration) => {
    try {
      const response = await api.post('/Auth/register/employee', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  registerCourier: async (data: CourierRegistration) => {
    try {
      const response = await api.post('/Auth/register/courier', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  createAdmin: async (data: AdminRegistration) => {
    try {
      const response = await api.post('/Auth/create-admin', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  getCustomer: async (id: string) => {
    try {
      const response = await api.get(`/Customers/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  getEmployee: async (id: string) => {
    try {
      const response = await api.get(`/Employees/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  getEmployees: async () => {
    try {
      console.log('Запрос списка сотрудников');
      const response = await api.get('/Employees');
      console.log('Ответ сервера:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении списка сотрудников:', error);
      throw handleApiError(error as AxiosError);
    }
  },

  getEmployeeRole: async (id: string) => {
    try {
      console.log('Запрос роли сотрудника:', id);
      const response = await api.get(`/Employees/${id}/role`);
      console.log('Ответ сервера при получении роли:', response.data);
      return response.data.role;
    } catch (error) {
      console.error('Ошибка при получении роли сотрудника:', error);
      throw handleApiError(error as AxiosError);
    }
  },

  updateEmployeePosition: async (id: string, position: string) => {
    try {
      console.log('Обновление должности сотрудника:', { id, position });
      const response = await api.put(`/Employees/${id}/position`, { position });
      console.log('Ответ сервера при обновлении должности:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении должности сотрудника:', error);
      throw handleApiError(error as AxiosError);
    }
  },

  updateEmployeeRole: async (id: string, role: string) => {
    try {
      console.log('Обновление роли сотрудника:', { id, role });
      const response = await api.put(`/Employees/${id}/role`, { role });
      console.log('Ответ сервера при обновлении роли:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении роли сотрудника:', error);
      throw handleApiError(error as AxiosError);
    }
  },

  deleteEmployee: async (id: string) => {
    try {
      console.log('Удаление сотрудника:', id);
      const response = await api.delete(`/Employees/${id}`);
      console.log('Ответ сервера при удалении сотрудника:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при удалении сотрудника:', error);
      throw handleApiError(error as AxiosError);
    }
  },

  getCourier: async (id: string) => {
    try {
      const response = await api.get(`/Couriers/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  getCouriers: async () => {
    try {
      console.log('Запрос списка курьеров');
      const response = await api.get('/Couriers');
      console.log('Ответ сервера:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении списка курьеров:', error);
      throw handleApiError(error as AxiosError);
    }
  },

  updateCourierCapacity: async (id: string, capacity: number) => {
    try {
      console.log('Обновление вместимости курьера:', { id, capacity });
      
      // Используем специальный эндпоинт для обновления только вместимости
      const response = await api.put(`/Couriers/${id}/capacity`, { maxCapacity: capacity });
      
      console.log('Ответ сервера при обновлении вместимости:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении вместимости курьера:', error);
      throw handleApiError(error as AxiosError);
    }
  },

  deleteCourier: async (id: string) => {
    try {
      console.log('Удаление курьера:', id);
      const response = await api.delete(`/Couriers/${id}`);
      console.log('Ответ сервера при удалении курьера:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при удалении курьера:', error);
      throw handleApiError(error as AxiosError);
    }
  },
};

// Menu API
export const menuAPI = {
  getMenuItems: async () => {
    try {
      const response = await api.get('/MenuItems');
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  getMenuItem: async (id: string) => {
    try {
      const response = await api.get(`/MenuItems/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  createMenuItem: async (menuItemData: any) => {
    try {
      console.log('Создание пункта меню:', menuItemData);
      
      // Преобразуем данные в формат, который ожидает бэкенд (PascalCase)
      const requestData = {
        PizzaId: menuItemData.pizzaId,
        Price: menuItemData.price,
        TotalPrice: menuItemData.totalPrice
      };
      
      const response = await api.post('/MenuItems', requestData);
      console.log('Ответ сервера при создании пункта меню:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании пункта меню:', error);
      throw handleApiError(error as AxiosError);
    }
  },

  updateMenuItem: async (id: string, menuItemData: any) => {
    try {
      console.log('Обновление пункта меню:', { id, menuItemData });
      
      // Преобразуем данные в формат, который ожидает бэкенд (PascalCase)
      const requestData = {
        Id: id,
        PizzaId: menuItemData.pizzaId,
        Price: menuItemData.price,
        TotalPrice: menuItemData.totalPrice
      };
      
      const response = await api.put(`/MenuItems/${id}`, requestData);
      console.log('Ответ сервера при обновлении пункта меню:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении пункта меню:', error);
      throw handleApiError(error as AxiosError);
    }
  },

  deleteMenuItem: async (id: string) => {
    try {
      console.log('Удаление пункта меню:', id);
      const response = await api.delete(`/MenuItems/${id}`);
      console.log('Ответ сервера при удалении пункта меню:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при удалении пункта меню:', error);
      throw handleApiError(error as AxiosError);
    }
  },
};

// Pizza API
export const pizzaAPI = {
  getPizzas: async () => {
    try {
      console.log('Запрос списка пицц');
      const response = await api.get('/Pizzas');
      console.log('Ответ сервера (пиццы):', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении списка пицц:', error);
      throw handleApiError(error as AxiosError);
    }
  },

  getPizzaById: async (id: string) => {
    try {
      const response = await api.get(`/Pizzas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении пиццы по ID:', error);
      throw handleApiError(error as AxiosError);
    }
  },

  getPizza: async (id: string) => {
    try {
      const response = await api.get(`/Pizzas/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  createPizza: async (pizzaData: any) => {
    try {
      console.log('Создание пиццы:', pizzaData);
      const response = await api.post('/Pizzas', pizzaData);
      console.log('Ответ сервера при создании пиццы:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании пиццы:', error);
      throw handleApiError(error as AxiosError);
    }
  },

  updatePizza: async (id: string, pizzaData: any) => {
    try {
      console.log('Обновление пиццы:', { id, pizzaData });
      const response = await api.put(`/Pizzas/${id}`, pizzaData);
      console.log('Ответ сервера при обновлении пиццы:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении пиццы:', error);
      throw handleApiError(error as AxiosError);
    }
  },

  deletePizza: async (id: string) => {
    try {
      console.log('Удаление пиццы:', id);
      const response = await api.delete(`/Pizzas/${id}`);
      console.log('Ответ сервера при удалении пиццы:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при удалении пиццы:', error);
      throw handleApiError(error as AxiosError);
    }
  },
};

// Order API
export const orderAPI = {
  getOrders: async () => {
    try {
      const response = await api.get('/Orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw handleApiError(error as AxiosError);
    }
  },

  getOrderedPizzasByOrderId: async (orderId: string) => {
    try {
      const response = await api.get(`/OrderedPizzas/order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ordered pizzas:', error);
      throw handleApiError(error as AxiosError);
    }
  },

  getOrdersByCustomerId: async (customerId: string) => {
    try {
      console.log('API: Получаем все заказы');
      const response = await api.get('/Orders');
      console.log('API: Получены все заказы:', response.data);
      
      // Фильтруем заказы по CustomerId
      const userOrders = response.data.filter((order: any) => order.CustomerId === customerId);
      console.log('API: Отфильтрованные заказы пользователя:', userOrders);

      // Получаем все MenuItems
      const menuItems = await menuAPI.getMenuItems();
      console.log('API: Получены все MenuItems:', menuItems);

      // Получаем позиции для каждого заказа
      const ordersWithItems = await Promise.all(userOrders.map(async (order: any) => {
        try {
          const orderedPizzas = await orderAPI.getOrderedPizzasByOrderId(order.Id);
          
          // Получаем информацию о каждой пицце и её цене из меню
          const orderedPizzasWithDetails = await Promise.all(
            orderedPizzas.map(async (item: any) => {
              try {
                const pizzaDetails = await pizzaAPI.getPizzaById(item.PizzaId);
                // Находим MenuItem по PizzaId
                const menuItem = menuItems.find((mi: any) => mi.PizzaId === item.PizzaId);
                if (!menuItem) {
                  console.error(`API: MenuItem не найден для пиццы ${item.PizzaId}`);
                }
                return {
                  ...item,
                  pizza: {
                    ...pizzaDetails,
                    Price: menuItem?.TotalPrice || 0
                  }
                };
              } catch (error) {
                console.error(`API: Ошибка при получении информации о пицце ${item.PizzaId}:`, error);
                return item;
              }
            })
          );

          return {
            ...order,
            orderedPizzas: orderedPizzasWithDetails
          };
        } catch (error) {
          console.error(`API: Ошибка при получении позиций для заказа ${order.Id}:`, error);
          return {
            ...order,
            orderedPizzas: []
          };
        }
      }));
      
      console.log('API: Заказы с позициями:', ordersWithItems);
      return ordersWithItems;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('API: Ошибка при получении заказов:', {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status
      });
      throw handleApiError(error as AxiosError);
    }
  },

  getOrder: async (id: string) => {
    try {
      const response = await api.get(`/Orders/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  createOrder: async (orderData: CreateOrderRequest) => {
    try {
      console.log('API: Отправляем заказ:', orderData);
      console.log('API: URL запроса:', `${API_URL}/Orders`);
      console.log('API: Заголовки запроса:', {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      });
      
      const response = await api.post('/Orders', orderData);
      console.log('API: Ответ от сервера:', response.data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('API: Ошибка при создании заказа:', {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status
      });
      throw handleApiError(error as AxiosError);
    }
  },

  createOrderedPizza: async (orderedPizza: { orderId: string; pizzaId: string; quantity: number }) => {
    try {
      console.log('API: Отправляем позицию заказа:', orderedPizza);
      console.log('API: URL запроса:', `${API_URL}/OrderedPizzas`);
      console.log('API: Заголовки запроса:', {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      });
      
      const response = await api.post('/OrderedPizzas', orderedPizza);
      console.log('API: Ответ от сервера:', response.data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('API: Ошибка при создании позиции заказа:', {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status
      });
      throw handleApiError(error as AxiosError);
    }
  },

  updateOrderStatus: async (orderId: string, newStatus: string) => {
    try {
      console.log(`API: Обновляем статус заказа ${orderId} на ${newStatus}`);
      
      // Получаем текущий заказ
      const order = await api.get(`/Orders/${orderId}`);
      console.log('API: Текущий заказ:', order.data);
      
      // Обновляем только статус заказа
      const updatedOrder = {
        ...order.data,
        Status: newStatus
      };
      
      console.log('API: Отправляем обновленный заказ:', updatedOrder);
      const response = await api.put(`/Orders/${orderId}`, updatedOrder);
      console.log('API: Ответ сервера при обновлении заказа:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('API: Ошибка при обновлении статуса заказа:', error);
      throw handleApiError(error as AxiosError);
    }
  },
};

// Reviews API
export const reviewAPI = {
  getReviews: async () => {
    try {
      const response = await api.get('/Reviews');
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  getReviewsByOrderId: async (orderId: string) => {
    try {
      const response = await api.get('/Reviews');
      const reviews = response.data;
      return reviews.filter((review: any) => review.OrderId === orderId);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  createReview: async (reviewData: CreateReviewRequest) => {
    try {
      console.log('API: Отправляем отзыв:', reviewData);
      
      // Преобразуем данные в формат, который ожидает бэкенд (PascalCase)
      const requestData = {
        ReviewText: reviewData.reviewText,
        Rating: reviewData.rating,
        CustomerId: reviewData.customerId,
        OrderId: reviewData.orderId
      };
      
      const response = await api.post('/Reviews', requestData);
      console.log('API: Отзыв успешно создан:', response.data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('API: Ошибка при создании отзыва:', {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status
      });
      throw handleApiError(error as AxiosError);
    }
  },

  getReview: async (reviewId: string) => {
    try {
      const response = await api.get(`/Reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  updateReview: async (reviewId: string, reviewData: CreateReviewRequest) => {
    try {
      console.log(`API: Обновляем отзыв ${reviewId}:`, reviewData);
      
      // Используем только самые нужные поля в PascalCase (соответствующие бэкенду)
      const requestData = {
        Id: reviewId,
        ReviewText: reviewData.reviewText,
        Rating: reviewData.rating,
        CustomerId: reviewData.customerId,
        OrderId: reviewData.orderId
      };
      
      console.log(`API: Отправляемый запрос PUT на ${API_URL}/Reviews/${reviewId}:`, requestData);
      
      const response = await api.put(`/Reviews/${reviewId}`, requestData);
      console.log('API: Отзыв успешно обновлен:', response.data);
      
      // Если в ответе нет поля ReviewDate или оно недействительно, добавим его
      let updatedReview = response.data;
      if (!updatedReview.ReviewDate || new Date(updatedReview.ReviewDate).toString() === 'Invalid Date') {
        console.log('API: В ответе сервера отсутствует или некорректное поле ReviewDate, получаем актуальные данные');
        try {
          // Получаем актуальные данные отзыва
          const fullReview = await reviewAPI.getReview(reviewId);
          updatedReview = fullReview;
        } catch (fetchError) {
          console.error('API: Не удалось получить актуальные данные отзыва', fetchError);
          // Если не удалось получить актуальные данные, добавляем текущую дату
          updatedReview = {
            ...updatedReview,
            ReviewDate: new Date().toISOString()
          };
        }
      }
      
      return updatedReview;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('API: Ошибка при обновлении отзыва:', {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status,
        headers: axiosError.response?.headers
      });
      
      throw handleApiError(error as AxiosError);
    }
  },
};

// Promotions API
export const promotionAPI = {
  getPromotions: async () => {
    try {
      console.log('Запрос списка акций');
      const response = await api.get('/Promotions');
      console.log('Ответ сервера (акции):', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении списка акций:', error);
      throw handleApiError(error as AxiosError);
    }
  },

  addPromotion: async (promotion: any) => {
    try {
      console.log('Добавление акции:', promotion);
      const response = await api.post('/Promotions', promotion);
      console.log('Ответ сервера при добавлении акции:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при добавлении акции:', error);
      throw handleApiError(error as AxiosError);
    }
  },

  updatePromotion: async (id: string, promotion: any) => {
    try {
      console.log('Обновление акции:', { id, promotion });
      const response = await api.put(`/Promotions/${id}`, promotion);
      console.log('Ответ сервера при обновлении акции:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении акции:', error);
      throw handleApiError(error as AxiosError);
    }
  },

  deletePromotion: async (id: string) => {
    try {
      console.log('Удаление акции:', id);
      const response = await api.delete(`/Promotions/${id}`);
      console.log('Ответ сервера при удалении акции:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при удалении акции:', error);
      throw handleApiError(error as AxiosError);
    }
  },
};

// Обработки ошибок API
function handleApiError(error: AxiosError) {
  if (error.response) {
    // Запрос был выполнен, и сервер ответил с кодом состояния который выходит за пределы диапазона
    const status = error.response.status;
    const data = error.response.data as any;

    let errorMessage = '';
    if (data && data.title) {
      errorMessage = `${data.title}`;
    }
    if (data && data.detail) {
      errorMessage += `: ${data.detail}`;
    }
    if (data && data.errors) {
      errorMessage += ': ' + Object.entries(data.errors)
        .map(([key, value]) => `${key}: ${(value as any).join(', ')}`)
        .join('; ');
    }

    switch (status) {
      case 400:
        return new Error(`Ошибка запроса: ${errorMessage || 'Неверный запрос'}`);
      case 401:
        return new Error('Неавторизован: Неверные учетные данные');
      case 403:
        return new Error('Доступ запрещен: У вас нет прав для доступа к этому ресурсу');
      case 404:
        return new Error('Не найдено: Запрашиваемый ресурс не найден');
      case 500:
        return new Error('Ошибка сервера: Что-то пошло не так на нашей стороне. Пожалуйста, попробуйте позже.');
      default:
        return new Error(errorMessage || data.message || `Ошибка сервера: ${status}`);
    }
  } else if (error.request) {
    // Запрос был выполнен, но ответ не был получен
    return new Error('Ошибка сети: Пожалуйста, проверьте подключение к интернету');
  } else {
    // Что-то произошло при настройке запроса, что вызвало ошибку
    return new Error('Ошибка запроса: Не удалось отправить запрос на сервер');
  }
}

export default api;
