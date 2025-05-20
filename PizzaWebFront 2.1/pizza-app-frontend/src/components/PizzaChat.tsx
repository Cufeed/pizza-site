import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaUser, FaTimes, FaCommentDots, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import { AIResponse } from '../types';

// API ключ
const API_KEY = "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";

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface CombinedItem {
  menuItem: {
    Id: string;
    PizzaId: string;
    Price: number;
    TotalPrice: number;
  };
  pizza: {
    Id: string;
    Name: string;
    Ingredients: string;
    CostPrice: number;
    Price: number;
    Image?: string;
  };
}

interface PizzaChatProps {
  menuItems: CombinedItem[];
}

const PizzaChat: React.FC<PizzaChatProps> = ({ menuItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // При открытии - приветствие
  const handleOpenChat = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([
        {
          text: 'Привет! Я могу помочь вам выбрать пиццу. Расскажите, что вы хотите?',
          isUser: false,
          timestamp: new Date()
        }
      ]);
    }
  };

  const handleCloseChat = () => {
    setIsOpen(false);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    
    const userMessage: Message = {
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Установка контекста (скармливаем пиццы, описание и цены)
      const pizzaMenuContext = menuItems.map(item => 
        `${item.pizza.Name}: ${item.pizza.Ingredients}, Цена: ${item.menuItem.Price} руб.`
      ).join('\n');
      
      const prompt = `Доступное меню пицц:\n${pizzaMenuContext}\n\nЗапрос клиента: "${userMessage.text}"\n\nКак консультант пиццерии, порекомендуй клиенту одну из пицц из меню выше, которая лучше всего соответствует его запросу. Выбери только из указанных выше пицц. Опиши своими словами, почему эта пицца соответствует запросу клиента. Будь дружелюбным и разговорчивым. Ответ должен быть на русском языке.`;
      
      const response = await axios.post<AIResponse>(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: "google/gemma-3-27b-it:free",
          messages: [
            { 
              role: "user", 
              content: prompt
            }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
            'HTTP-Referer': 'https://frontend-production-2978.up.railway.app',
            'X-Title': 'Pizza AI Chat'
          }
        }
      );
      
      const aiResponse = response.data.choices[0].message.content;
      
      const aiMessage: Message = {
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Ошибка при получении ответа от AI:', error);
      
      const errorMessage: Message = {
        text: 'Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже.',
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Кнопка открытия чата */}
      {!isOpen && (
        <button 
          className="fixed bottom-6 right-6 bg-red-700 hover:bg-red-800 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 z-50"
          onClick={handleOpenChat}
          aria-label="Открыть чат"
        >
          <FaCommentDots className="text-xl" />
        </button>
      )}

      {/* Чат */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 max-h-[600px] bg-white rounded-xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Шапка чата */}
          <div className="flex justify-between items-center p-4 bg-red-700 text-white rounded-t-xl">
            <div className="flex items-center">
              <FaRobot className="mr-2 text-lg" />
              <h3 className="font-bold">Помощник для выбора пиццы</h3>
            </div>
            <button 
              onClick={handleCloseChat}
              className="text-white hover:text-gray-200"
              aria-label="Закрыть чат"
            >
              <FaTimes />
            </button>
          </div>

          {/* Сообщения */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 max-h-[400px]">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-4 flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`px-4 py-3 rounded-xl max-w-[80%] ${
                    message.isUser 
                      ? 'bg-red-700 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 shadow-md rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {!message.isUser && <FaRobot className="mr-2 text-red-600" />}
                    {message.isUser && <FaUser className="ml-2 text-white" />}
                  </div>
                  <div className="whitespace-pre-wrap">{message.text}</div>
                  <div className={`text-xs mt-1 ${message.isUser ? 'text-red-200' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-white text-gray-800 rounded-xl rounded-tl-none shadow-md px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Ввод */}
          <div className="p-3 border-t flex">
            <input
              type="text"
              placeholder="Напишите, что вы хотите..."
              className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-700"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className={`bg-red-700 text-white px-4 rounded-r-lg ${
                inputValue.trim() === '' || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-800'
              }`}
              onClick={handleSendMessage}
              disabled={inputValue.trim() === '' || isLoading}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PizzaChat; 