import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { FaUser, FaBriefcase, FaEdit, FaSave, FaTimes, FaExclamationCircle, FaTrash, FaUserShield } from 'react-icons/fa';

interface Employee {
  Id: string;
  Name: string;
  ContactInfo: string;
  Position: string;
  Role?: string;
  Salt?: string;
  PasswordHash?: string;
}

const AdminEmployeesPage: React.FC = () => {
  const { userType } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPosition, setEditPosition] = useState('');
  const [editRole, setEditRole] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Если пользователь не админ, показываем сообщение об ошибке
  if (userType !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="rounded-md bg-red-50 p-4">
            <h3 className="text-lg font-medium text-red-800">Доступ запрещен</h3>
            <p className="mt-2 text-sm text-red-700">
              У вас нет прав для доступа к этой странице.
            </p>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await authAPI.getEmployees();
      console.log('Полученные данные сотрудников:', data);
      
      // Загрузим роли для каждого сотрудника
      const employeesWithRoles = await Promise.all(
        data.map(async (employee: Employee) => {
          try {
            // Получаем роль для каждого сотрудника
            const role = await authAPI.getEmployeeRole(employee.Id);
            return {
              ...employee,
              Role: role
            };
          } catch (err) {
            console.error(`Ошибка при получении роли для сотрудника ${employee.Id}:`, err);
            return {
              ...employee,
              Role: 'Employee' // используем значение по умолчанию
            };
          }
        })
      );
      
      setEmployees(employeesWithRoles);
    } catch (err) {
      setError('Ошибка при загрузке списка сотрудников');
      console.error('Error fetching employees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.Id);
    setEditPosition(employee.Position);
    setEditRole(employee.Role || 'Employee');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditPosition('');
    setEditRole('');
  };

  const handleSave = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Отправляем новую должность
      await authAPI.updateEmployeePosition(id, editPosition);
      
      // Отправляем новую роль
      await authAPI.updateEmployeeRole(id, editRole);
      
      // Обновляем локальное состояние
      setEmployees(employees.map(emp => 
        emp.Id === id ? { ...emp, Position: editPosition, Role: editRole } : emp
      ));
      
      setEditingId(null);
      setEditPosition('');
      setEditRole('');
      setSuccessMessage('Информация о сотруднике успешно обновлена');
      
      // Сбрасываем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError('Ошибка при обновлении информации о сотруднике');
      console.error('Error updating employee:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await authAPI.deleteEmployee(id);
      
      // Обновляем локальное состояние
      setEmployees(employees.filter(emp => emp.Id !== id));
      setSuccessMessage('Сотрудник успешно удален');
      
      // Сбрасываем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError('Ошибка при удалении сотрудника');
      console.error('Error deleting employee:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && employees.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-red-700 text-white">
          <h2 className="text-2xl font-bold">Управление сотрудниками</h2>
        </div>
        
        {error && (
          <div className="m-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="m-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
              </div>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Имя
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Должность
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Роль
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(() => {
                console.log('Рендеринг сотрудников:', employees);
                return null;
              })()}
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Сотрудники не найдены
                  </td>
                </tr>
              ) : (
                employees.map((employee) => {
                  console.log('Рендеринг сотрудника:', employee);
                  return (
                    <tr key={employee.Id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                              <FaUser className="h-6 w-6 text-red-700" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{employee.Name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.ContactInfo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === employee.Id ? (
                          <input
                            type="text"
                            className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={editPosition}
                            onChange={(e) => setEditPosition(e.target.value)}
                          />
                        ) : (
                          <div className="flex items-center">
                            <FaBriefcase className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">{employee.Position}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === employee.Id ? (
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          >
                            <option value="Admin">Admin</option>
                            <option value="Employee">Employee</option>
                            <option value="Manager">Manager</option>
                          </select>
                        ) : (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            employee.Role === 'Admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : employee.Role === 'Manager'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {employee.Role || 'Employee'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingId === employee.Id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSave(employee.Id)}
                              className="text-green-600 hover:text-green-900"
                              disabled={isLoading}
                            >
                              <FaSave className="h-5 w-5" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="text-red-600 hover:text-red-900"
                              disabled={isLoading}
                            >
                              <FaTimes className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(employee)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <FaEdit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(employee.Id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={isLoading}
                            >
                              <FaTrash className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminEmployeesPage; 