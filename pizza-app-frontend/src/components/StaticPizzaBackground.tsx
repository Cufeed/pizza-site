import React from 'react';

// Компонент иконки куска пиццы
const PizzaSliceIcon: React.FC<{ size: number, rotation: number, left: string, top: string }> = ({ 
  size, 
  rotation,
  left,
  top
}) => {
  return (
    <div 
      className="absolute pointer-events-none" 
      style={{ left, top }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 50 50" 
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Треугольный кусок пиццы */}
        <path 
          d="M25,25 L5,15 A22,22 0 0,1 15,5 Z" 
          fill="transparent" 
          stroke="rgba(120, 120, 120, 0.45)" 
          strokeWidth="1.2" 
        />
        
        {/* Начинка (пара кружочков) */}
        <circle cx="18" cy="15" r="2" fill="rgba(130, 130, 130, 0.4)" />
        <circle cx="12" cy="10" r="1.5" fill="rgba(130, 130, 130, 0.4)" />
      </svg>
    </div>
  );
};

// Предопределенные позиции и размеры кусочков пицц для статичного фона
const staticPizzaElements = [
  // Кусочки пицц
  { id: 1, size: 55, rotation: 120, left: '80%', top: '15%' },
  { id: 2, size: 45, rotation: 90, left: '70%', top: '60%' },
  { id: 3, size: 40, rotation: 220, left: '90%', top: '40%' },
  { id: 4, size: 35, rotation: 45, left: '10%', top: '85%' },
  { id: 5, size: 50, rotation: 80, left: '25%', top: '25%' },
  { id: 6, size: 45, rotation: 135, left: '50%', top: '5%' },
  { id: 7, size: 35, rotation: 270, left: '35%', top: '35%' },
  { id: 8, size: 50, rotation: 60, left: '5%', top: '40%' },
  { id: 9, size: 40, rotation: 210, left: '88%', top: '28%' },
  { id: 10, size: 45, rotation: 180, left: '65%', top: '45%' },
  { id: 11, size: 40, rotation: 75, left: '82%', top: '55%' },
  { id: 12, size: 45, rotation: 160, left: '18%', top: '93%' },
  { id: 13, size: 35, rotation: 300, left: '38%', top: '52%' },
  { id: 14, size: 40, rotation: 190, left: '45%', top: '92%' },
  { id: 15, size: 45, rotation: 340, left: '92%', top: '88%' },
  { id: 16, size: 40, rotation: 250, left: '52%', top: '32%' },
  { id: 17, size: 35, rotation: 30, left: '15%', top: '10%' },
  { id: 18, size: 40, rotation: 110, left: '72%', top: '22%' },
  { id: 19, size: 45, rotation: 290, left: '32%', top: '65%' },
  { id: 20, size: 50, rotation: 10, left: '82%', top: '5%' },
  { id: 21, size: 35, rotation: 130, left: '28%', top: '45%' },
  { id: 22, size: 40, rotation: 70, left: '55%', top: '72%' },
  { id: 23, size: 45, rotation: 240, left: '42%', top: '15%' },
  { id: 24, size: 40, rotation: 180, left: '3%', top: '25%' },
  { id: 25, size: 35, rotation: 320, left: '95%', top: '65%' },
  { id: 26, size: 45, rotation: 100, left: '12%', top: '58%' },
  { id: 27, size: 40, rotation: 50, left: '60%', top: '90%' },
  { id: 28, size: 35, rotation: 280, left: '78%', top: '78%' },
  { id: 29, size: 40, rotation: 200, left: '7%', top: '75%' },
  { id: 30, size: 50, rotation: 150, left: '68%', top: '10%' },
  { id: 31, size: 40, rotation: 95, left: '22%', top: '18%' },
  { id: 32, size: 35, rotation: 260, left: '48%', top: '62%' },
  { id: 33, size: 45, rotation: 40, left: '13%', top: '35%' },
  { id: 34, size: 40, rotation: 170, left: '86%', top: '42%' },
  { id: 35, size: 35, rotation: 330, left: '58%', top: '22%' },
  { id: 36, size: 40, rotation: 125, left: '33%', top: '78%' },
  { id: 37, size: 45, rotation: 210, left: '75%', top: '32%' },
  { id: 38, size: 35, rotation: 85, left: '93%', top: '15%' },
  { id: 39, size: 40, rotation: 310, left: '18%', top: '82%' },
  { id: 40, size: 45, rotation: 55, left: '62%', top: '45%' },
  { id: 41, size: 40, rotation: 230, left: '8%', top: '92%' },
  { id: 42, size: 35, rotation: 350, left: '38%', top: '8%' },
  { id: 43, size: 45, rotation: 140, left: '96%', top: '53%' },
  { id: 44, size: 40, rotation: 25, left: '52%', top: '47%' },
  { id: 45, size: 35, rotation: 300, left: '27%', top: '93%' }
];

interface StaticPizzaBackgroundProps {
  children: React.ReactNode;
}

const StaticPizzaBackground: React.FC<StaticPizzaBackgroundProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Статичные элементы пиццы */}
      {staticPizzaElements.map(pizza => (
        <div key={pizza.id}>
          <PizzaSliceIcon 
            size={pizza.size} 
            rotation={pizza.rotation}
            left={pizza.left}
            top={pizza.top}
          />
        </div>
      ))}
      
      {/* Основное содержимое */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default StaticPizzaBackground; 