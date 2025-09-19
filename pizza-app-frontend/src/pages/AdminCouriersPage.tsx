import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { FaSpinner, FaExclamationCircle, FaCheckCircle, FaTrash } from 'react-icons/fa';

interface Courier {
  Id: string;
  Name: string;
  ContactInfo: string;
  MaxCapacity: number;
}

const AdminCouriersPage: React.FC = () => {
  const { user } = useAuth();
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editedCapacities, setEditedCapacities] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchCouriers();
  }, []);

  const fetchCouriers = async () => {
    try {
      setLoading(true);
      setError(null);
      const couriersData = await authAPI.getCouriers();
      console.log('Полученные курьеры:', couriersData);
      setCouriers(couriersData);
      
      // Инициализируем состояние редактирования
      const capacities: Record<string, number> = {};
      couriersData.forEach((courier: Courier) => {
        capacities[courier.Id] = courier.MaxCapacity;
      });
      setEditedCapacities(capacities);
    } catch (err) {
      setError('Ошибка при загрузке списка курьеров');
      console.error('Error fetching couriers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCapacityChange = (id: string, value: number) => {
    // Проверка на NaN и допустимые пределы
    if (!isNaN(value)) {
      // Ограничиваем значение в диапазоне от 1 до 10
      const validValue = Math.min(Math.max(1, value), 10);
      setEditedCapacities(prev => ({
        ...prev,
        [id]: validValue
      }));
    }
  };

  const updateCapacity = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const newCapacity = editedCapacities[id];
      
      // Проверяем, что значение в пределах допустимого диапазона
      if (newCapacity < 1 || newCapacity > 10) {
        setError('Вместимость должна быть в диапазоне от 1 до 10');
        setLoading(false);
        return;
      }
      
      await authAPI.updateCourierCapacity(id, newCapacity);
      setSuccessMessage('Максимальная вместимость курьера успешно обновлена');
      
      // Обновляем значение в текущем массиве курьеров
      setCouriers(prevCouriers => prevCouriers.map(courier => 
        courier.Id === id ? { ...courier, MaxCapacity: newCapacity } : courier
      ));
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError('Ошибка при обновлении максимальной вместимости курьера');
      console.error('Error updating courier capacity:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCapacityBlur = (id: string) => {
    const courier = couriers.find(c => c.Id === id);
    if (courier && courier.MaxCapacity !== editedCapacities[id]) {
      // Проверяем, что значение действительно изменилось и не равно null или undefined
      if (editedCapacities[id] != null && editedCapacities[id] !== courier.MaxCapacity) {
        updateCapacity(id);
      } else {
        // Возвращаем исходное значение, если новое значение некорректно
        setEditedCapacities(prev => ({
          ...prev,
          [id]: courier.MaxCapacity
        }));
      }
    }
  };

  const handleCapacityKeyDown = (id: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const courier = couriers.find(c => c.Id === id);
      // Проверяем валидность значения и реальное изменение
      if (courier && editedCapacities[id] != null && editedCapacities[id] !== courier.MaxCapacity) {
        updateCapacity(id);
      } else if (courier) {
        // Возвращаем исходное значение, если оно не изменилось
        setEditedCapacities(prev => ({
          ...prev,
          [id]: courier.MaxCapacity
        }));
      }
      // Снимаем фокус с поля ввода
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого курьера?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authAPI.deleteCourier(id);
      setSuccessMessage('Курьер успешно удален');
      fetchCouriers();
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError('Ошибка при удалении курьера');
      console.error('Error deleting courier:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && couriers.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Управление курьерами</h1>

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
                Имя
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Контактная информация
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Максимальная вместимость
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {couriers.map((courier) => (
              <tr key={courier.Id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {courier.Name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {courier.ContactInfo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editedCapacities[courier.Id] || courier.MaxCapacity}
                    onChange={(e) => handleCapacityChange(courier.Id, parseInt(e.target.value))}
                    onBlur={() => handleCapacityBlur(courier.Id)}
                    onKeyDown={(e) => handleCapacityKeyDown(courier.Id, e)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    disabled={loading}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDelete(courier.Id)}
                    className="text-red-600 hover:text-red-900"
                    disabled={loading}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCouriersPage; 