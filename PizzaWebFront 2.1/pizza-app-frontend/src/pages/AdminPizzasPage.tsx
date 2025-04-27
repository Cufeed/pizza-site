import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { pizzaAPI, menuAPI } from '../services/api';
import { Pizza, MenuItem } from '../types';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';

const AdminPizzasPage: React.FC = () => {
  const { userType } = useAuth();
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояние для формы редактирования/создания
  const [editingPizza, setEditingPizza] = useState<Pizza | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  
  // Состояние для новой/редактируемой пиццы
  const [formData, setFormData] = useState<Partial<Pizza>>({
    Name: '',
    Ingredients: '',
    Price: 0,
    CostPrice: 0,
    Image: ''
  });

  useEffect(() => {
    // Проверяем, авторизован ли пользователь как админ или менеджер
    if (userType !== 'admin' && userType !== 'employee') {
      setError('У вас нет доступа к этой странице');
      setLoading(false);
      return;
    }

    fetchPizzas();
  }, [userType]);

  const fetchPizzas = async () => {
    try {
      setLoading(true);
      // Получаем одновременно пиццы и пункты меню
      const [pizzasData, menuItemsData] = await Promise.all([
        pizzaAPI.getPizzas(),
        menuAPI.getMenuItems()
      ]);
      
      console.log('Загруженные пиццы:', pizzasData);
      console.log('Загруженные пункты меню:', menuItemsData);
      
      if (Array.isArray(pizzasData) && Array.isArray(menuItemsData)) {
        // Сохраняем оригинальные данные о пиццах
        const pizzasWithPrices = pizzasData.map(pizza => {
          // Ищем соответствующий пункт меню для данной пиццы
          const menuItem = menuItemsData.find(item => item.PizzaId === pizza.Id);
          
          // Если нашли пункт меню, добавляем цену из него
          return {
            ...pizza,
            // Берем цену из TotalPrice пункта меню или оставляем 0, если пункт меню не найден
            Price: menuItem ? menuItem.TotalPrice : 0
          };
        });
        
        setPizzas(pizzasWithPrices);
        setMenuItems(menuItemsData);
      } else {
        throw new Error('Получены неверные данные');
      }
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
      setError('Не удалось загрузить список пицц. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'Price' || name === 'CostPrice' ? Number(value) : value
    }));
  };

  const handleEditClick = (pizza: Pizza) => {
    setEditingPizza(pizza);
    setIsCreating(false);
    setFormData({
      Id: pizza.Id,
      Name: pizza.Name,
      Ingredients: pizza.Ingredients,
      Price: pizza.Price,
      CostPrice: pizza.CostPrice,
      Image: pizza.Image
    });
  };

  const handleCreateClick = () => {
    setEditingPizza(null);
    setIsCreating(true);
    setFormData({
      Name: '',
      Ingredients: '',
      Price: 0,
      CostPrice: 0,
      Image: ''
    });
  };

  const handleCancelEdit = () => {
    setEditingPizza(null);
    setIsCreating(false);
  };

  const handleSaveClick = async () => {
    try {
      setLoading(true);
      
      if (isCreating) {
        // Создание новой пиццы
        const newPizza = await pizzaAPI.createPizza({
          Name: formData.Name,
          Ingredients: formData.Ingredients,
          CostPrice: formData.CostPrice,
          Image: formData.Image
        });
        
        // Создание пункта меню для новой пиццы
        if (newPizza && newPizza.Id) {
          await menuAPI.createMenuItem({
            pizzaId: newPizza.Id,
            price: formData.Price || 0,
            totalPrice: formData.Price || 0
          });
        }
        
        setPizzas(prev => [...prev, {...newPizza, Price: formData.Price || 0}]);
      } else if (editingPizza) {
        // Обновление существующей пиццы
        const updatedPizza = await pizzaAPI.updatePizza(editingPizza.Id, {
          Id: editingPizza.Id,
          Name: formData.Name,
          Ingredients: formData.Ingredients,
          CostPrice: formData.CostPrice,
          Image: formData.Image
        });
        
        // Находим пункт меню для этой пиццы
        const menuItem = menuItems.find(item => item.PizzaId === editingPizza.Id);
        
        if (menuItem) {
          // Обновляем пункт меню с новой ценой
          await menuAPI.updateMenuItem(menuItem.Id, {
            pizzaId: editingPizza.Id,
            price: formData.Price || 0,
            totalPrice: formData.Price || 0
          });
        } else {
          // Если пункт меню не найден, создаем новый
          await menuAPI.createMenuItem({
            pizzaId: editingPizza.Id,
            price: formData.Price || 0,
            totalPrice: formData.Price || 0
          });
        }
        
        setPizzas(prev => 
          prev.map(p => p.Id === updatedPizza.Id ? {...updatedPizza, Price: formData.Price || 0} : p)
        );
      }
      
      // Сброс формы
      setEditingPizza(null);
      setIsCreating(false);
      
      // Обновляем список пицц
      fetchPizzas();
    } catch (err) {
      console.error('Ошибка при сохранении пиццы:', err);
      setError('Не удалось сохранить пиццу. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (pizzaId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту пиццу?')) {
      return;
    }
    
    try {
      setLoading(true);
      await pizzaAPI.deletePizza(pizzaId);
      setPizzas(prev => prev.filter(p => p.Id !== pizzaId));
    } catch (err) {
      console.error('Ошибка при удалении пиццы:', err);
      setError('Не удалось удалить пиццу. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  // Если пользователь не админ или менеджер
  if (userType !== 'admin' && userType !== 'employee' && !loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
          <p className="font-bold">Доступ запрещен</p>
          <p>У вас нет прав для просмотра этой страницы.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление пиццами</h1>
        <button
          onClick={handleCreateClick}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
          disabled={isCreating || editingPizza !== null}
        >
          <FaPlus className="mr-2" /> Добавить пиццу
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
          <p className="font-bold">Ошибка</p>
          <p>{error}</p>
        </div>
      )}

      {/* Форма редактирования/создания пиццы */}
      {(editingPizza || isCreating) && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">
              {isCreating ? 'Создание новой пиццы' : 'Редактирование пиццы'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="Name">
                  Название
                </label>
                <input
                  type="text"
                  id="Name"
                  name="Name"
                  value={formData.Name || ''}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Пепперони"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="Ingredients">
                  Ингредиенты
                </label>
                <textarea
                  id="Ingredients"
                  name="Ingredients"
                  value={formData.Ingredients || ''}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Тесто, соус, сыр, пепперони"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="Price">
                    Цена (₽)
                  </label>
                  <input
                    type="number"
                    id="Price"
                    name="Price"
                    value={formData.Price || ''}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="599"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="CostPrice">
                    Себестоимость (₽)
                  </label>
                  <input
                    type="number"
                    id="CostPrice"
                    name="CostPrice"
                    value={formData.CostPrice || ''}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="Image">
                  URL изображения
                </label>
                <input
                  type="text"
                  id="Image"
                  name="Image"
                  value={formData.Image || ''}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center"
                >
                  <FaTimes className="mr-2" /> Отмена
                </button>
                <button
                  onClick={handleSaveClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
                >
                  <FaSave className="mr-2" /> Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Таблица пицц */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-700 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Загрузка пицц...</p>
        </div>
      ) : pizzas.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          Пиццы не найдены. Добавьте первую пиццу!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Название</th>
                <th className="py-3 px-4 text-left">Ингредиенты</th>
                <th className="py-3 px-4 text-right">Цена (₽)</th>
                <th className="py-3 px-4 text-right">Себестоимость (₽)</th>
                <th className="py-3 px-4 text-center">Изображение</th>
                <th className="py-3 px-4 text-center">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pizzas.map((pizza) => (
                <tr key={pizza.Id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{pizza.Name}</td>
                  <td className="py-3 px-4">
                    <div className="max-w-xs overflow-hidden text-ellipsis">{pizza.Ingredients}</div>
                  </td>
                  <td className="py-3 px-4 text-right">{pizza.Price}</td>
                  <td className="py-3 px-4 text-right">{pizza.CostPrice}</td>
                  <td className="py-3 px-4 text-center">
                    {pizza.Image ? (
                      <div className="relative w-12 h-12 mx-auto">
                        <img 
                          src={pizza.Image} 
                          alt={pizza.Name}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&h=300';
                          }}
                        />
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Нет</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEditClick(pizza)}
                        className="text-blue-600 hover:text-blue-800"
                        disabled={isCreating || editingPizza !== null}
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(pizza.Id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={isCreating || editingPizza !== null}
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPizzasPage; 