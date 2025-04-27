import React, { useState, useEffect } from 'react';
import { menuAPI, pizzaAPI, promotionAPI } from '../services/api';
import { MenuItem, Pizza, Promotion } from '../types';
import PizzaCard from '../components/PizzaCard';
import { FaSearch } from 'react-icons/fa';

interface CombinedItem {
  menuItem: MenuItem;
  pizza: Pizza;
}

const MenuPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<CombinedItem[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

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
        setMenuItems(combinedItems);
        
        // Обработка данных акций
        const processedPromotions = Array.isArray(promotionsData) ? promotionsData.map((promo: any) => {
          // Находим пиццу по pizzaId
          const pizza = pizzasData.find((p: any) => p.Id === promo.PizzaId);
          
          return {
            id: promo.Id,
            promotionName: promo.PromotionName,
            startDate: promo.StartDate,
            endDate: promo.EndDate,
            conditions: pizza ? pizza.Name : promo.Conditions,
            discountAmount: Number(promo.DiscountAmount || 0),
            pizzaId: promo.PizzaId
          };
        }) : [];

        console.log('Processed Promotions:', processedPromotions);
        setPromotions(processedPromotions);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load menu. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Применяем поиск к списку пицц
  const filteredMenuItems = searchTerm
    ? menuItems.filter(item => 
        item.pizza.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.pizza.Ingredients.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : menuItems;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Наше меню</h1>

      {/* Поиск */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          {/* ввод поиска */}
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Найти пиццу..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* сетка пицц */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-700 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Загрузка меню...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : filteredMenuItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Нет пиццы, соответствующей вашему критерию поиска.</p>
          <button
            onClick={() => {
              setSearchTerm('');
            }}
            className="mt-4 text-red-700 hover:text-red-800 font-medium"
          >
            Очистить поиск
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMenuItems.map(({ menuItem, pizza }) => (
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
  );
};

export default MenuPage;
