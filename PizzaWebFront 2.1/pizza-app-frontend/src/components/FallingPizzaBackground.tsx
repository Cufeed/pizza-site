import React, { useState, useEffect, useCallback } from 'react';

// Компонент минималистичной иконки пиццы (цельная пицца с вырезанным куском)
const PizzaIcon: React.FC<{ size: number, rotation: number, opacity: number }> = ({ 
  size, 
  rotation,
  opacity
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 50 50" 
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Основа пиццы (дуга без вырезанного куска) */}
      <path
        d="M25,25 L15,5 A22,22 0 1 1 5,15 Z" 
        fill="transparent" 
        stroke="rgba(255, 255, 255, 0.9)" 
        strokeWidth="1.5" 
      />
      
      {/* Линии выреза куска */}
      <path 
        d="M25,25 L5,15 M25,25 L15,5" 
        fill="transparent" 
        stroke="rgba(255, 255, 255, 0.9)" 
        strokeWidth="1.5" 
      />
      
      {/* Начинка (несколько кружочков) */}
      <circle cx="32" cy="15" r="2" fill="rgba(255, 255, 255, 0.7)" />
      <circle cx="35" cy="30" r="2" fill="rgba(255, 255, 255, 0.7)" />
      <circle cx="20" cy="35" r="2" fill="rgba(255, 255, 255, 0.7)" />
    </svg>
  );
};

// Компонент иконки куска пиццы
const PizzaSliceIcon: React.FC<{ size: number, rotation: number, opacity: number }> = ({ 
  size, 
  rotation,
  opacity
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 50 50" 
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Треугольный кусок пиццы */}
      <path 
        d="M25,25 L5,15 A22,22 0 0,1 15,5 Z" 
        fill="rgba(255, 255, 255, 0.2)" 
        stroke="rgba(255, 255, 255, 0.9)" 
        strokeWidth="1.5" 
      />
      
      {/* Начинка (пара кружочков) */}
      <circle cx="18" cy="15" r="2" fill="rgba(255, 255, 255, 0.7)" />
      <circle cx="12" cy="10" r="1.5" fill="rgba(255, 255, 255, 0.7)" />
    </svg>
  );
};

interface FallingPizza {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  type: 'whole' | 'slice'; // тип иконки: целая пицца или кусок
}

const FallingPizzaBackground: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const [pizzas, setPizzas] = useState<FallingPizza[]>([]);

  // Функция создания пицц с учетом размера экрана
  const createPizzas = useCallback(() => {
    const width = window.innerWidth;
    // Меньше пицц на мобильных устройствах для производительности
    const pizzaCount = width < 768 
      ? Math.max(6, Math.floor(width / 120)) 
      : Math.max(12, Math.floor(width / 100));
    
    const initialPizzas: FallingPizza[] = [];
    
    for (let i = 0; i < pizzaCount; i++) {
      // Увеличенные размеры иконок
      const size = width < 768 
        ? Math.random() * 25 + 15  // 15-40px на мобильных
        : Math.random() * 35 + 20; // 20-55px на десктопах
      
      initialPizzas.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * -200,
        size,
        // Медленнее падение на мобильных для производительности
        speed: (width < 768 ? 0.2 : 0.3) + Math.random() * 0.4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * (width < 768 ? 2 : 3),
        opacity: Math.random() * 0.3 + 0.2, // Более низкая прозрачность для белых иконок
        type: Math.random() > 0.3 ? 'whole' : 'slice' // 70% целых пицц, 30% кусочков
      });
    }
    
    return initialPizzas;
  }, []);

  // Инициализация падающих пицц
  useEffect(() => {
    setPizzas(createPizzas());
    
    // Обновление количества пицц при изменении размера окна
    const handleResize = () => {
      setPizzas(createPizzas());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [createPizzas]);

  // Анимация падения
  useEffect(() => {
    let animationFrameId: number;
    
    const animate = () => {
      setPizzas(prevPizzas => 
        prevPizzas.map(pizza => {
          // Обновляем позицию Y (падение вниз)
          let newY = pizza.y + pizza.speed;
          
          // Если пицца выпала за пределы контейнера, возвращаем ее наверх
          if (newY > 100) {
            newY = Math.random() * -50 - 20;
          }
          
          // Обновляем вращение
          let newRotation = (pizza.rotation + pizza.rotationSpeed) % 360;
          
          return {
            ...pizza,
            y: newY,
            rotation: newRotation
          };
        })
      );
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Фон с градиентом и текстурой */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-800 via-red-700 to-red-600 -z-10"></div>
      
      {/* Декоративная текстура */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MiIgaGVpZ2h0PSI1MiI+CjxyZWN0IHdpZHRoPSI1MiIgaGVpZ2h0PSI1MiIgZmlsbD0iI2ZmZiI+PC9yZWN0Pgo8Y2lyY2xlIGN4PSIyNiIgY3k9IjI2IiByPSIxMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiPjwvY2lyY2xlPgo8L3N2Zz4=')] -z-10"></div>
      
      {/* Декоративные элементы */}
      <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-r from-transparent via-white to-transparent opacity-5"></div>
      
      {/* Фоновые падающие пиццы */}
      {pizzas.map(pizza => (
        <div 
          key={pizza.id}
          className="absolute pointer-events-none will-change-transform"
          style={{
            left: `${pizza.x}%`,
            top: `${pizza.y}%`,
            opacity: pizza.opacity,
            zIndex: 0
          }}
        >
          {pizza.type === 'whole' ? (
            <PizzaIcon 
              size={pizza.size} 
              rotation={pizza.rotation}
              opacity={pizza.opacity}
            />
          ) : (
            <PizzaSliceIcon 
              size={pizza.size} 
              rotation={pizza.rotation}
              opacity={pizza.opacity}
            />
          )}
        </div>
      ))}
      
      {/* Полупрозрачное наложение для лучшей читаемости текста */}
      <div className="absolute inset-0 bg-gradient-to-t from-red-900/50 via-transparent to-transparent z-5"></div>
      
      {/* Основное содержимое */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default FallingPizzaBackground; 