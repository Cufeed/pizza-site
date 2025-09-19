import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { menuAPI, pizzaAPI, promotionAPI } from '../services/api';
import { MenuItem, Pizza, Promotion } from '../types';
import PizzaCard from '../components/PizzaCard';
import PizzaChat from '../components/PizzaChat';
import { FaArrowRight, FaMotorcycle, FaPizzaSlice, FaMedal } from 'react-icons/fa';
import FallingPizzaBackground from '../components/FallingPizzaBackground';

interface CombinedItem {
  menuItem: MenuItem;
  pizza: Pizza;
}

const HomePage: React.FC = () => {
  const [featuredItems, setFeaturedItems] = useState<CombinedItem[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Получить элементы меню, пиццы и акции
        const [menuItemsData, pizzasData, promotionsData] = await Promise.all([
          menuAPI.getMenuItems(),
          pizzaAPI.getPizzas(),
          promotionAPI.getPromotions(),
        ]);

        console.log('Menu Items:', menuItemsData);
        console.log('Pizzas:', pizzasData);
        console.log('Raw Promotions Data:', promotionsData);

        if (!Array.isArray(menuItemsData) || !Array.isArray(pizzasData)) {
          throw new Error('Invalid data format received from API');
        }

        // Создать избранные товары путем объединения элементов меню с их пиццами
        const combinedItems = menuItemsData
          .map((menuItem: any) => {
            if (!menuItem || !menuItem.PizzaId) {
              console.warn('Invalid menuItem:', menuItem);
              return null;
            }

            const pizza = pizzasData.find((p: any) => p.Id === menuItem.PizzaId);
            if (!pizza) {
              console.warn(`No pizza found for menuItem ${menuItem.Id}, pizzaId: ${menuItem.PizzaId}`);
              return null;
            }
            
            // Преобразование данных в нужный формат
            const processedMenuItem: MenuItem = {
              Id: menuItem.Id,
              PizzaId: menuItem.PizzaId,
              Price: Number(menuItem.Price || 0),
              TotalPrice: Number(menuItem.TotalPrice || menuItem.Price || 0)
            };

            // Преобразование данных пиццы в нужный формат
            const processedPizza: Pizza = {
              Id: pizza.Id,
              Name: pizza.Name,
              Ingredients: pizza.Ingredients,
              CostPrice: Number(pizza.CostPrice || 0),
              Price: Number(pizza.Price || 0),
              Image: pizza.Image
            };

            console.log('Processing item:', {
              originalMenuItem: menuItem,
              processedMenuItem,
              originalPizza: pizza,
              processedPizza
            });
            
            return {
              menuItem: processedMenuItem,
              pizza: processedPizza
            };
          })
          .filter((item: CombinedItem | null): item is CombinedItem => {
            if (!item) return false;
            if (!item.menuItem || !item.pizza) {
              console.warn('Invalid combined item:', item);
              return false;
            }
            return true;
          });

        console.log('Final Combined Items:', combinedItems);

        // Преобразование данных акций
        const processedPromotions = Array.isArray(promotionsData) ? promotionsData.map((promo: any) => {
          // Находим пиццу по pizzaId
          const pizza = pizzasData.find((p: any) => p.Id === promo.PizzaId);
          const menuItem = menuItemsData.find((m: any) => m.PizzaId === promo.PizzaId);
          
          console.log('Processing promotion:', {
            originalPromo: promo,
            id: promo.Id,
            name: promo.PromotionName,
            discount: promo.DiscountAmount,
            pizzaId: promo.PizzaId,
            foundPizza: pizza,
            foundMenuItem: menuItem
          });
          
          // Рассчитываем процент скидки
          let discountPercent = 0;
          if (menuItem && menuItem.Price) {
            discountPercent = Math.round((Number(promo.DiscountAmount) / Number(menuItem.Price)) * 100);
          }
          
          return {
            id: promo.Id,
            promotionName: promo.PromotionName,
            startDate: promo.StartDate,
            endDate: promo.EndDate,
            conditions: pizza ? pizza.Name : promo.Conditions, // Используем название пиццы, если найдена
            discountAmount: Number(promo.DiscountAmount || 0),
            discountPercent: discountPercent,
            pizzaId: promo.PizzaId
          };
        }) : [];

        console.log('Processed Promotions:', processedPromotions);
        console.log('Number of promotions:', processedPromotions.length);

        // Ограниченное количество пицц и акций
        setFeaturedItems(combinedItems.slice(0, 4));
        setPromotions(processedPromotions); // Показываем все доступные акции
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Баннер чуть ниже верхнего меню*/}
      <FallingPizzaBackground className="py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg">
            Delicious Pizza <br/> Быстрая Доставка
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto drop-shadow-md">
            Свежие ингредиенты, оригинальные рецепты и любовь к пицце.
          </p>
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-400 blur-lg opacity-70 -z-10 scale-110"></div>
            <Link
              to="/menu"
              className="inline-flex items-center bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-red-800 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Заказать <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </FallingPizzaBackground>

      {/* Преимущества */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center hover:shadow-lg transition-all">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FaPizzaSlice className="text-2xl text-red-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Свежие ингредиенты</h3>
              <p className="text-gray-600">Мы используем только самые свежие и качественные продукты для приготовления наших блюд.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center hover:shadow-lg transition-all">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FaMotorcycle className="text-2xl text-red-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Быстрая доставка</h3>
              <p className="text-gray-600">Доставляем ваш заказ горячим в течение 2 дней или возвращаем деньги.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center hover:shadow-lg transition-all">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FaMedal className="text-2xl text-red-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Лучший вкус</h3>
              <p className="text-gray-600">Наши рецепты признаны лучшими в городе по мнению 101% наших клиентов.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Избранные пиццы */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 relative inline-block">
                Популярные пиццы
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-red-600 rounded"></span>
              </h2>
              <p className="text-gray-600 mt-4 max-w-2xl">Самые популярные пиццы, которые выбирают наши клиенты. Попробуйте и вы!</p>
            </div>
            <Link to="/menu" className="mt-4 md:mt-0 text-red-700 hover:text-red-800 font-semibold flex items-center group">
              Посмотреть все 
              <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">
                <FaArrowRight className="inline" />
              </span>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-700 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Загружаем вкусные пиццы...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : featuredItems.length === 0 ? (
            <div className="text-center py-12 text-gray-600">Нет пиццы в наличии. Проверьте позже!</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredItems.map(({ menuItem, pizza }) => (
                <PizzaCard 
                  key={`${menuItem.Id}-${pizza.Id}`}
                  menuItem={menuItem}
                  pizza={pizza}
                  promotions={promotions}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ИИ-чат */}
      {!loading && featuredItems.length > 0 && <PizzaChat menuItems={featuredItems} />}

      {/* Раздел акций  */}
      <section className="py-16 bg-gradient-to-b from-white to-yellow-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 relative inline-block">
                Акции
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-yellow-500 rounded"></span>
              </h2>
              <p className="text-gray-600 mt-4 max-w-2xl">Не упустите шанс попробовать наши лучшие пиццы по выгодной цене!</p>
            </div>
            <Link to="/promotions" className="mt-4 md:mt-0 text-orange-600 hover:text-orange-700 font-semibold flex items-center group">
              Посмотреть все акции 
              <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">
                <FaArrowRight className="inline" />
              </span>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Загружаем акции...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-12 text-gray-600">Сейчас нет акций. Проверьте позже!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {promotions.map((promo) => (
                <div key={promo.id} className="bg-white border-2 border-yellow-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:border-yellow-300 relative overflow-hidden">
                  {/* Декоративный уголок */}
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rotate-45 transform"></div>
                  
                  <h3 className="text-xl font-bold text-red-700 mb-3 relative z-10">{promo.promotionName}</h3>
                  <p className="text-gray-700 mb-3">{promo.conditions}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 font-bold text-lg bg-green-50 px-3 py-1 rounded-full">Скидка {promo.discountPercent}%</span>
                    <span className="text-sm text-gray-500">
                      Действует до {new Date(promo.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
