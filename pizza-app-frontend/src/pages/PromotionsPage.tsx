import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaClock, FaPercent, FaPizzaSlice } from 'react-icons/fa';
import { promotionAPI, pizzaAPI } from '../services/api';
import { Promotion, Pizza } from '../types';

const PromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [pizzas, setPizzas] = useState<Record<string, Pizza>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Получить акции и пиццы
        const [promotionsData, pizzasData] = await Promise.all([
          promotionAPI.getPromotions(),
          pizzaAPI.getPizzas(),
        ]);

        console.log('Raw Promotions Data:', promotionsData);
        console.log('Raw Pizzas Data:', pizzasData);

        // Преобразование данных акций
        const processedPromotions = Array.isArray(promotionsData) ? promotionsData.map((promo: any) => ({
          id: promo.Id,
          promotionName: promo.PromotionName,
          startDate: promo.StartDate,
          endDate: promo.EndDate,
          conditions: promo.Conditions,
          discountAmount: Number(promo.DiscountAmount || 0),
          pizzaId: promo.PizzaId
        })) : [];

        console.log('Processed Promotions:', processedPromotions);

        // Преобразование данных пицц
        const processedPizzas = Array.isArray(pizzasData) ? pizzasData.map((pizza: any) => ({
          Id: pizza.Id,
          Name: pizza.Name,
          Ingredients: pizza.Ingredients,
          CostPrice: Number(pizza.CostPrice || 0),
          Price: Number(pizza.Price || 0),
          Image: pizza.Image
        })) : [];

        console.log('Processed Pizzas:', processedPizzas);

        setPromotions(processedPromotions);

        // Создать карту поиска пицц по ID
        const pizzasMap = processedPizzas.reduce((acc: Record<string, Pizza>, pizza: Pizza) => {
          acc[pizza.Id] = pizza;
          return acc;
        }, {});

        console.log('Pizzas Map:', pizzasMap);
        setPizzas(pizzasMap);
      } catch (err) {
        setError('Failed to load promotions. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Форматирование даты для отображения
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Invalid Date';
      }
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      console.error('Error formatting date:', dateString, err);
      return 'Invalid Date';
    }
  };

  // Проверка, активна ли акция
  const isActive = (promo: Promotion) => {
    try {
      const now = new Date();
      const startDate = new Date(promo.startDate);
      const endDate = new Date(promo.endDate);
      return now >= startDate && now <= endDate;
    } catch (err) {
      console.error('Error checking promotion status:', promo, err);
      return false;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Акции</h1>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-700 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading promotions...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Сейчас нет активных акций.</p>
          <Link to="/menu" className="mt-4 inline-flex items-center text-red-700 hover:text-red-800 font-semibold">
            Посмотреть меню <FaArrowRight className="ml-2" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promotions.map((promo) => {
            const pizza = pizzas[promo.pizzaId];
            console.log('Rendering promotion:', { promo, pizza });

            return (
              <div
                key={promo.id}
                className={`
                  border rounded-lg overflow-hidden shadow-lg transform transition duration-300 hover:scale-105
                  ${isActive(promo)
                    ? 'bg-white border-yellow-300'
                    : 'bg-gray-50 border-gray-200 opacity-75'}
                `}
              >
                {/* Изображение пиццы из базы данных */}
                <div className="h-48 bg-gray-200 relative">
                  <img
                    src={pizza?.Image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&h=300'}
                    alt={pizza?.Name || 'Pizza'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Ошибка загрузки изображения пиццы:', pizza?.Id);
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&h=300';
                    }}
                  />
                  {isActive(promo) && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 rounded-bl-lg font-bold">
                      Активна
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h2 className="text-xl font-bold text-red-700 mb-2">{promo.promotionName}</h2>

                  <div className="mb-4">
                    <div className="flex items-center text-gray-700 mb-1">
                      <FaPizzaSlice className="mr-2 text-yellow-500" />
                      <span>Пицца: {pizza?.Name || 'Loading...'}</span>
                    </div>
                    <div className="flex items-center text-gray-700 mb-1">
                      <FaPercent className="mr-2 text-green-500" />
                      <span>Скидка: {promo.discountAmount} ₽</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FaClock className="mr-2 text-blue-500" />
                      <span>Действует: {formatDate(promo.startDate)} - {formatDate(promo.endDate)}</span>
                    </div>
                  </div>

                  <Link
                    to="/menu"
                    className="inline-flex items-center text-white bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg font-medium transition"
                  >
                    Заказать <FaArrowRight className="ml-2" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PromotionsPage;
