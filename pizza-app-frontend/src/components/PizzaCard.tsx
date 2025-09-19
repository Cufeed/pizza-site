import React, { useMemo, useEffect } from 'react';
import { FaCartPlus, FaHotjar, FaTag } from 'react-icons/fa';
import { MenuItem, Pizza, Promotion } from '../types';
import { useCart } from '../contexts/CartContext';

interface PizzaCardProps {
  menuItem: MenuItem;
  pizza: Pizza;
  promotions?: Promotion[]; // Список всех акций
}

const PizzaCard: React.FC<PizzaCardProps> = ({ menuItem, pizza, promotions = [] }) => {
  const { addItem } = useCart();

  // Выведем в консоль данные пиццы для отладки
  useEffect(() => {
    console.log('PizzaCard получил данные:', pizza);
    console.log('Image URL:', pizza.Image);
  }, [pizza]);

  // Используем изображение из базы данных или запасное изображение
  const pizzaImage = useMemo(() => {
    const defaultPizzaImages = [
      'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e',
      'https://images.unsplash.com/photo-1594007654729-407eedc4be65',
      'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
      'https://images.unsplash.com/photo-1513104890138-7c749659a591',
    ];
    
    // Проверяем наличие изображения в объекте пиццы
    if (pizza.Image && pizza.Image.trim() !== '') {
      return pizza.Image;
    }
    
    // Если изображения нет, используем псевдослучайное изображение из массива
    const pizzaId = pizza.Id || (pizza as any).id;
    
    if (!pizzaId) {
      return defaultPizzaImages[0]; // Возвращаем первое изображение как дефолтное
    }
    
    // Используем последние символы ID пиццы для получения индекса
    const lastChar = pizzaId.charCodeAt(pizzaId.length - 1) || 0;
    const index = lastChar % defaultPizzaImages.length;
    
    return `${defaultPizzaImages[index]}?auto=format&fit=crop&w=500&h=300`;
  }, [pizza]);

  const handleAddToCart = () => {
    // Проверяем, какое свойство доступно (Name или name) и используем его
    const pizzaName = pizza.Name || (pizza as any).name;
    addItem(menuItem, pizzaName);
  };

  // Получаем цену с проверкой на undefined
  const price = menuItem?.TotalPrice || menuItem?.Price || 0;

  // Получаем свойства пиццы с учетом возможных форматов
  const pizzaName = pizza.Name || (pizza as any).name;
  const pizzaIngredients = pizza.Ingredients || (pizza as any).ingredients;
  const pizzaId = pizza.Id || (pizza as any).id;

  // Определяем, является ли пицца "острой" на основе ингредиентов
  const isSpicy = pizzaIngredients?.toLowerCase().includes('перец') || 
                 pizzaIngredients?.toLowerCase().includes('халапеньо') ||
                 pizzaIngredients?.toLowerCase().includes('острый');

  // Проверяем, есть ли акция для данной пиццы
  const activePromotion = useMemo(() => {
    if (!promotions || !pizzaId) return null;
    
    const now = new Date();
    return promotions.find(promo => {
      // Проверяем, что акция относится к данной пицце и активна в текущее время
      const isPizzaMatch = promo.pizzaId === pizzaId;
      const startDate = new Date(promo.startDate);
      const endDate = new Date(promo.endDate);
      const isActive = now >= startDate && now <= endDate;
      
      return isPizzaMatch && isActive;
    });
  }, [promotions, pizzaId]);

  // Вычисляем цену со скидкой, если есть акция
  const discountedPrice = useMemo(() => {
    if (!activePromotion) return null;
    return Math.max(price - activePromotion.discountAmount, 0);
  }, [activePromotion, price]);

  // Вычисляем процент скидки
  const discountPercent = useMemo(() => {
    if (!activePromotion || !price) return 0;
    return Math.round((activePromotion.discountAmount / price) * 100);
  }, [activePromotion, price]);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 group">
      <div className="relative overflow-hidden">
        <img
          src={pizzaImage}
          alt={pizzaName}
          className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            console.error('Ошибка загрузки изображения:', pizzaImage);
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&h=300';
          }}
        />
        {/* Градиентное наложение снизу для лучшей читаемости названия - всегда видимое с нужной прозрачностью */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
        
        {/* Значок для острых пицц */}
        {isSpicy && (
          <div className="absolute top-2 right-2 bg-red-600 text-yellow-300 px-2 py-1 rounded-full text-xs font-bold flex items-center shadow-md z-10">
            <FaHotjar className="mr-1" /> Острая
          </div>
        )}
        
        {/* Бейдж со скидкой, если есть акция */}
        {activePromotion && (
          <div className="absolute top-2 left-2 bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center shadow-md z-10">
            <FaTag className="mr-1" /> Акция
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-red-700 group-hover:text-red-800 transition-colors">{pizzaName}</h3>
        <p className="text-gray-600 mt-2 text-sm h-12 overflow-hidden leading-tight">
          {pizzaIngredients}
        </p>

        <div className="mt-4 flex justify-between items-center">
          <div className="flex flex-col">
            {activePromotion ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                    {discountedPrice} ₽
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    {price} ₽
                  </span>
                </div>
                <span className="text-xs text-green-600 font-semibold">
                  Скидка {discountPercent}%
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold bg-gradient-to-r from-red-700 to-orange-600 bg-clip-text text-transparent">
                  {price} ₽
                </span>
                <span className="text-xs text-gray-500">Бесплатная доставка</span>
              </>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center"
          >
            <FaCartPlus className="mr-2" />
            В корзину
          </button>
        </div>
      </div>
    </div>
  );
};

export default PizzaCard;
