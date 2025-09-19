import React from 'react';
import { MenuItem, Pizza } from '../types';

interface CartItemProps {
  menuItem: MenuItem;
  quantity: number;
  updateQuantity: (newQuantity: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ menuItem, quantity, updateQuantity }) => {
  const pizza = menuItem.pizza;
  const name = pizza?.Name || '';
  const price = menuItem.TotalPrice || menuItem.Price || 0;
  const imageUrl = pizza?.Image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&h=300';

  return (
    <div className="flex justify-between items-center p-4 border-b">
      <div className="flex items-center">
        <img src={imageUrl} alt={name} className="w-16 h-16 object-cover rounded" />
        <div className="ml-4">
          <h3 className="font-medium">{name}</h3>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-red-700">
              {price} ₽
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateQuantity(quantity - 1)}
                  className="text-red-700 hover:text-red-800"
                >
                  -
                </button>
                <span className="mx-2">{quantity}</span>
                <button
                  onClick={() => updateQuantity(quantity + 1)}
                  className="text-red-700 hover:text-red-800"
                >
                  +
                </button>
              </div>
            </div> 
        </div>
      </div>
    </div>
  );
};

export default CartItem; 