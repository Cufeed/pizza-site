import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { orderAPI, reviewAPI } from '../services/api';
import { Order, CreateReviewRequest, Review } from '../types';

const ProfilePage: React.FC = () => {
  const { user, userId } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewForms, setReviewForms] = useState<{ [key: string]: boolean }>({});
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [reviewTexts, setReviewTexts] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState<{ [key: string]: boolean }>({});
  const [orderReviews, setOrderReviews] = useState<{ [key: string]: Review[] }>({});
  const [editingReview, setEditingReview] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const userOrders = await orderAPI.getOrdersByCustomerId(userId);
        console.log('Полученные заказы:', userOrders);
        
        // Сортируем заказы по дате (от новых к старым)
        const sortedOrders = [...userOrders].sort((a, b) => 
          new Date(b.OrderDate).getTime() - new Date(a.OrderDate).getTime()
        );
        
        setOrders(sortedOrders);
        
        // Загружаем отзывы для каждого заказа
        const reviewsMap: { [key: string]: Review[] } = {};
        for (const order of sortedOrders) {
          const reviews = await reviewAPI.getReviewsByOrderId(order.Id);
          reviewsMap[order.Id] = reviews;
        }
        setOrderReviews(reviewsMap);
      } catch (err) {
        console.error('Ошибка при получении заказов:', err);
        setError('Не удалось загрузить историю заказов');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const toggleReviewForm = (orderId: string) => {
    setReviewForms(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
    
    // Инициализируем значения формы, если она открывается
    if (!reviewForms[orderId]) {
      setRatings(prev => ({ ...prev, [orderId]: 5 }));
      setReviewTexts(prev => ({ ...prev, [orderId]: '' }));
    }
  };

  const handleRatingChange = (orderId: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [orderId]: rating
    }));
  };

  const handleReviewTextChange = (orderId: string, text: string) => {
    setReviewTexts(prev => ({
      ...prev,
      [orderId]: text
    }));
  };

  const submitReview = async (orderId: string) => {
    if (!userId) return;
    
    try {
      setSubmitting(prev => ({ ...prev, [orderId]: true }));
      
      const response = await reviewAPI.createReview({
        reviewText: reviewTexts[orderId],
        rating: ratings[orderId],
        customerId: userId,
        orderId: orderId
      });
      
      // Обновляем список отзывов для заказа
      setOrderReviews(prev => ({
        ...prev,
        [orderId]: [...(prev[orderId] || []), response]
      }));
      
      // Закрываем форму после успешной отправки
      setReviewForms(prev => ({ ...prev, [orderId]: false }));
    } catch (err) {
      console.error('Ошибка при отправке отзыва:', err);
    } finally {
      setSubmitting(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const startEditingReview = (review: Review) => {
    setEditingReview(prev => ({
      ...prev,
      [review.Id]: review.Id
    }));
    
    setRatings(prev => ({
      ...prev,
      [review.Id]: review.Rating
    }));
    
    setReviewTexts(prev => ({
      ...prev,
      [review.Id]: review.ReviewText
    }));
  };

  const cancelEditingReview = (reviewId: string) => {
    setEditingReview(prev => {
      const newEditing = { ...prev };
      delete newEditing[reviewId];
      return newEditing;
    });
  };

  const updateReview = async (review: Review) => {
    if (!userId) return;
    
    try {
      console.log('Обновляем отзыв с данными:', {
        reviewId: review.Id,
        reviewText: reviewTexts[review.Id],
        rating: ratings[review.Id], 
        customerId: userId,
        orderId: review.OrderId
      });
      
      setSubmitting(prev => ({ ...prev, [review.Id]: true }));
      
      const updatedReview = await reviewAPI.updateReview(review.Id, {
        reviewText: reviewTexts[review.Id],
        rating: ratings[review.Id],
        customerId: userId,
        orderId: review.OrderId
      });
      
      console.log('Получен обновленный отзыв:', updatedReview);
      
      // Проверяем, что все необходимые поля присутствуют
      if (!updatedReview.ReviewDate || new Date(updatedReview.ReviewDate).toString() === 'Invalid Date') {
        console.warn('Получен отзыв с некорректной датой, устанавливаем текущую дату');
        updatedReview.ReviewDate = new Date().toISOString();
      }
      
      if (typeof updatedReview.Rating !== 'number') {
        console.warn('Получен отзыв с некорректным рейтингом, используем значение из формы');
        updatedReview.Rating = ratings[review.Id];
      }
      
      if (!updatedReview.ReviewText) {
        console.warn('Получен отзыв без текста, используем значение из формы');
        updatedReview.ReviewText = reviewTexts[review.Id];
      }
      
      // Обновляем список отзывов
      setOrderReviews(prev => {
        const updatedReviews = prev[review.OrderId].map(r => 
          r.Id === review.Id ? updatedReview : r
        );
        
        return {
          ...prev,
          [review.OrderId]: updatedReviews
        };
      });
      
      // Закрываем форму редактирования
      cancelEditingReview(review.Id);
    } catch (err) {
      console.error('Ошибка при обновлении отзыва:', err);
    } finally {
      setSubmitting(prev => {
        const newSubmitting = { ...prev };
        delete newSubmitting[review.Id];
        return newSubmitting;
      });
    }
  };

  const renderStars = (itemId: string) => {
    const stars = [];
    const currentRating = ratings[itemId] || 0;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={`rating-star-${itemId}-${i}`}
          type="button"
          onClick={() => handleRatingChange(itemId, i)}
          className={`text-2xl ${i <= currentRating ? 'text-yellow-500' : 'text-gray-300'}`}
        >
          ★
        </button>
      );
    }
    
    return stars;
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Профиль пользователя</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Информация о пользователе</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Email:</span> {user?.email}</p>
            <p><span className="font-medium">Тип пользователя:</span> {user?.userType}</p>
            <p><span className="font-medium">ID пользователя:</span> {user?.id}</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">История заказов</h2>
          
          {isLoading ? (
            <p className="text-gray-600">Загрузка заказов...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-600">У вас пока нет заказов</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={`order-container-${order.Id}`} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Заказ #{order.Id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-600">
                        Дата: {new Date(order.OrderDate).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Адрес доставки: {order.DeliveryAddress}
                      </p>
                      {order.orderedPizzas && order.orderedPizzas.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700">Состав заказа:</p>
                          <ul className="mt-1 space-y-1">
                            {order.orderedPizzas.map((item) => {
                              console.log('Пицца в заказе:', item.pizza);
                              return (
                                <li key={`ordered-pizza-${item.Id}`} className="text-sm text-gray-600">
                                  {item.pizza?.Name || `Пицца #${item.PizzaId}`} - {item.Quantity} шт.
                                  {item.pizza?.Price && (
                                    <span className="ml-2 text-gray-500">
                                      ({item.pizza.Price * item.Quantity} ₽)
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-sm font-medium text-gray-700">
                              Итого: {order.orderedPizzas.reduce((total, item) => 
                                total + (item.pizza?.Price || 0) * item.Quantity, 0
                              )} ₽
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      order.Status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.Status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      order.Status === 'Completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.Status}
                    </span>
                  </div>
                  
                  {/* Отзывы к заказу */}
                  {orderReviews[order.Id] && orderReviews[order.Id].length > 0 && (
                    <div className="mt-4 pt-3 border-t">
                      <p className="text-sm font-medium text-gray-700 mb-2">Ваши отзывы:</p>
                      <div className="space-y-3">
                        {orderReviews[order.Id].map(review => (
                          <div key={`review-container-${review.Id}`} className="p-3 bg-gray-50 rounded">
                            {editingReview[review.Id] ? (
                              <div key={`edit-form-${review.Id}`} className="review-edit-form">
                                <div className="mb-2">
                                  <p className="text-sm font-medium mb-1">Ваша оценка:</p>
                                  <div className="flex">{renderStars(review.Id)}</div>
                                </div>
                                <textarea
                                  className="w-full p-2 border rounded mb-2"
                                  rows={3}
                                  placeholder="Напишите ваше мнение о заказе..."
                                  value={reviewTexts[review.Id] || ''}
                                  onChange={(e) => handleReviewTextChange(review.Id, e.target.value)}
                                ></textarea>
                                <div className="flex space-x-2">
                                  <button
                                    className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                                    onClick={() => updateReview(review)}
                                    disabled={submitting[review.Id] || !reviewTexts[review.Id]}
                                  >
                                    {submitting[review.Id] ? 'Сохранение...' : 'Сохранить'}
                                  </button>
                                  <button
                                    className="border border-gray-300 px-4 py-1 rounded hover:bg-gray-100"
                                    onClick={() => cancelEditingReview(review.Id)}
                                  >
                                    Отмена
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <React.Fragment key={`review-content-${review.Id}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center mb-1">
                                    {renderReviewStars(review.Rating)}
                                    <span className="ml-2 text-xs text-gray-500">
                                      {new Date(review.ReviewDate).toLocaleString()}
                                    </span>
                                  </div>
                                  <button
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                    onClick={() => startEditingReview(review)}
                                  >
                                    Редактировать
                                  </button>
                                </div>
                                <p className="text-sm text-gray-600">{review.ReviewText}</p>
                              </React.Fragment>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Кнопка для отзыва */}
                  <div className="mt-4 pt-3 border-t">
                    {reviewForms[order.Id] ? (
                      <div key={`new-review-form-${order.Id}`} className="review-form">
                        <div className="mb-2">
                          <p className="text-sm font-medium mb-1">Ваша оценка:</p>
                          <div className="flex">{renderStars(order.Id)}</div>
                        </div>
                        <textarea
                          className="w-full p-2 border rounded mb-2"
                          rows={3}
                          placeholder="Напишите ваше мнение о заказе..."
                          value={reviewTexts[order.Id] || ''}
                          onChange={(e) => handleReviewTextChange(order.Id, e.target.value)}
                        ></textarea>
                        <div className="flex space-x-2">
                          <button
                            className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                            onClick={() => submitReview(order.Id)}
                            disabled={submitting[order.Id] || !reviewTexts[order.Id]}
                          >
                            {submitting[order.Id] ? 'Отправка...' : 'Отправить отзыв'}
                          </button>
                          <button
                            className="border border-gray-300 px-4 py-1 rounded hover:bg-gray-100"
                            onClick={() => toggleReviewForm(order.Id)}
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="text-red-600 text-sm hover:text-red-800"
                        onClick={() => toggleReviewForm(order.Id)}
                      >
                        Оставить отзыв
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 