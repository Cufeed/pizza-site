import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { promotionAPI, pizzaAPI } from '../services/api';
import { FaSpinner, FaExclamationCircle, FaCheckCircle, FaTrash, FaEdit, FaPlus } from 'react-icons/fa';

interface Pizza {
  Id: string;
  Name: string;
  Ingredients: string;
  CostPrice: number;
}

interface Promotion {
  Id: string;
  PromotionName: string;
  StartDate: string;
  EndDate: string;
  Conditions: string;
  DiscountAmount: number;
  PizzaId: string;
  Pizza?: Pizza;
}

interface NewPromotion {
  PromotionName: string;
  StartDate: string;
  EndDate: string;
  Conditions: string;
  DiscountAmount: number;
  PizzaId: string;
}

const AdminPromotionsPage: React.FC = () => {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Состояние для модального окна добавления акции
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPromotion, setNewPromotion] = useState<NewPromotion>({
    PromotionName: '',
    StartDate: new Date().toISOString().split('T')[0],
    EndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // + 30 дней
    Conditions: '',
    DiscountAmount: 0,
    PizzaId: ''
  });
  
  // Состояние для редактирования акции
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  useEffect(() => {
    fetchPromotions();
    fetchPizzas();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      const promotionsData = await promotionAPI.getPromotions();
      console.log('Полученные акции:', promotionsData);
      setPromotions(promotionsData);
    } catch (err) {
      setError('Ошибка при загрузке списка акций');
      console.error('Error fetching promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPizzas = async () => {
    try {
      const pizzasData = await pizzaAPI.getPizzas();
      console.log('Полученные пиццы:', pizzasData);
      setPizzas(pizzasData);
    } catch (err) {
      console.error('Error fetching pizzas:', err);
    }
  };

  const handleDeletePromotion = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту акцию?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await promotionAPI.deletePromotion(id);
      setSuccessMessage('Акция успешно удалена');
      fetchPromotions();
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError('Ошибка при удалении акции');
      console.error('Error deleting promotion:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPromotion = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Проверка обязательных полей
      if (!newPromotion.PromotionName || !newPromotion.PizzaId) {
        setError('Название акции и пицца обязательны для заполнения');
        setLoading(false);
        return;
      }
      
      if (new Date(newPromotion.StartDate) > new Date(newPromotion.EndDate)) {
        setError('Дата начала акции не может быть позже даты окончания');
        setLoading(false);
        return;
      }
      
      // Подготовим данные для отправки
      const dataToSend = {
        PromotionName: newPromotion.PromotionName,
        StartDate: new Date(newPromotion.StartDate).toISOString(),
        EndDate: new Date(newPromotion.EndDate).toISOString(),
        Conditions: newPromotion.Conditions || '',
        DiscountAmount: Number(newPromotion.DiscountAmount),
        PizzaId: newPromotion.PizzaId
      };
      
      console.log('Отправляемые данные для добавления акции:', dataToSend);
      
      await promotionAPI.addPromotion(dataToSend);
      setSuccessMessage('Акция успешно добавлена');
      fetchPromotions();
      setShowAddModal(false);
      
      // Сбрасываем форму
      setNewPromotion({
        PromotionName: '',
        StartDate: new Date().toISOString().split('T')[0],
        EndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        Conditions: '',
        DiscountAmount: 0,
        PizzaId: ''
      });
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError('Ошибка при добавлении акции');
      console.error('Error adding promotion:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPromotion = async () => {
    if (!editingPromotion) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Проверка обязательных полей
      if (!editingPromotion.PromotionName || !editingPromotion.PizzaId) {
        setError('Название акции и пицца обязательны для заполнения');
        setLoading(false);
        return;
      }
      
      if (new Date(editingPromotion.StartDate) > new Date(editingPromotion.EndDate)) {
        setError('Дата начала акции не может быть позже даты окончания');
        setLoading(false);
        return;
      }
      
      // Подготовим данные для отправки
      const dataToSend = {
        Id: editingPromotion.Id,
        PromotionName: editingPromotion.PromotionName,
        StartDate: new Date(editingPromotion.StartDate).toISOString(),
        EndDate: new Date(editingPromotion.EndDate).toISOString(),
        Conditions: editingPromotion.Conditions || '',
        DiscountAmount: Number(editingPromotion.DiscountAmount),
        PizzaId: editingPromotion.PizzaId
      };
      
      console.log('Отправляемые данные для обновления акции:', dataToSend);
      
      await promotionAPI.updatePromotion(editingPromotion.Id, dataToSend);
      setSuccessMessage('Акция успешно обновлена');
      fetchPromotions();
      setEditingPromotion(null);
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError('Ошибка при обновлении акции');
      console.error('Error updating promotion:', err);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (promotion: Promotion) => {
    setEditingPromotion({
      ...promotion,
      StartDate: new Date(promotion.StartDate).toISOString().split('T')[0],
      EndDate: new Date(promotion.EndDate).toISOString().split('T')[0]
    });
  };

  const cancelEditing = () => {
    setEditingPromotion(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU').format(date);
  };

  const getPizzaName = (pizzaId: string) => {
    const pizza = pizzas.find(p => p.Id === pizzaId);
    return pizza ? pizza.Name : 'Неизвестная пицца';
  };

  if (loading && promotions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Управление акциями</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
          disabled={loading}
        >
          <FaPlus className="mr-2" /> Добавить акцию
        </button>
      </div>

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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Название акции
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Пицца
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Период действия
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Условия
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Скидка
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {promotions.map((promotion) => (
              <tr key={promotion.Id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {promotion.PromotionName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getPizzaName(promotion.PizzaId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(promotion.StartDate)} - {formatDate(promotion.EndDate)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {promotion.Conditions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {promotion.DiscountAmount} ₽
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditing(promotion)}
                      className="text-blue-600 hover:text-blue-900"
                      disabled={loading}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeletePromotion(promotion.Id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={loading}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Модальное окно добавления акции */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Добавить новую акцию</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Название акции</label>
                <input
                  type="text"
                  value={newPromotion.PromotionName}
                  onChange={(e) => setNewPromotion({...newPromotion, PromotionName: e.target.value})}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Введите название акции"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Пицца</label>
                <select
                  value={newPromotion.PizzaId}
                  onChange={(e) => setNewPromotion({...newPromotion, PizzaId: e.target.value})}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Выберите пиццу</option>
                  {pizzas.map((pizza) => (
                    <option key={pizza.Id} value={pizza.Id}>{pizza.Name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">Дата начала</label>
                  <input
                    type="date"
                    value={newPromotion.StartDate}
                    onChange={(e) => setNewPromotion({...newPromotion, StartDate: e.target.value})}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Дата окончания</label>
                  <input
                    type="date"
                    value={newPromotion.EndDate}
                    onChange={(e) => setNewPromotion({...newPromotion, EndDate: e.target.value})}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Условия</label>
                <textarea
                  value={newPromotion.Conditions}
                  onChange={(e) => setNewPromotion({...newPromotion, Conditions: e.target.value})}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  placeholder="Опишите условия акции"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Скидка (₽)</label>
                <input
                  type="number"
                  min="0"
                  value={newPromotion.DiscountAmount}
                  onChange={(e) => setNewPromotion({...newPromotion, DiscountAmount: parseFloat(e.target.value)})}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Отмена
              </button>
              <button
                onClick={handleAddPromotion}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? <FaSpinner className="animate-spin" /> : 'Добавить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования акции */}
      {editingPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Редактировать акцию</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Название акции</label>
                <input
                  type="text"
                  value={editingPromotion.PromotionName}
                  onChange={(e) => setEditingPromotion({...editingPromotion, PromotionName: e.target.value})}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Введите название акции"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Пицца</label>
                <select
                  value={editingPromotion.PizzaId}
                  onChange={(e) => setEditingPromotion({...editingPromotion, PizzaId: e.target.value})}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Выберите пиццу</option>
                  {pizzas.map((pizza) => (
                    <option key={pizza.Id} value={pizza.Id}>{pizza.Name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">Дата начала</label>
                  <input
                    type="date"
                    value={editingPromotion.StartDate}
                    onChange={(e) => setEditingPromotion({...editingPromotion, StartDate: e.target.value})}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Дата окончания</label>
                  <input
                    type="date"
                    value={editingPromotion.EndDate}
                    onChange={(e) => setEditingPromotion({...editingPromotion, EndDate: e.target.value})}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Условия</label>
                <textarea
                  value={editingPromotion.Conditions}
                  onChange={(e) => setEditingPromotion({...editingPromotion, Conditions: e.target.value})}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  placeholder="Опишите условия акции"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Скидка (₽)</label>
                <input
                  type="number"
                  min="0"
                  value={editingPromotion.DiscountAmount}
                  onChange={(e) => setEditingPromotion({...editingPromotion, DiscountAmount: parseFloat(e.target.value)})}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={cancelEditing}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Отмена
              </button>
              <button
                onClick={handleEditPromotion}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? <FaSpinner className="animate-spin" /> : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromotionsPage; 