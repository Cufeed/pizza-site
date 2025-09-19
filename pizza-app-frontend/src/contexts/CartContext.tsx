import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MenuItem, Pizza } from '../types';

export interface CartItem {
  menuItemId: string;
  pizzaId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (menuItem: MenuItem, pizzaName: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Загрузите корзину из localStorage во время инициализации (переделать)
    const savedCart = localStorage.getItem('pizzaCart');
    if (!savedCart) return [];
    
    try {
      // Проверяем сохраненные элементы и обновляем их формат, если необходимо
      const parsedItems = JSON.parse(savedCart);
      // Очищаем localStorage, чтобы избежать проблем совместимости
      localStorage.removeItem('pizzaCart');
      return parsedItems;
    } catch (error) {
      console.error('Ошибка при загрузке корзины из localStorage:', error);
      return [];
    }
  });

  // Сохраните корзину в localStorage при ее изменении (переделать)
  useEffect(() => {
    localStorage.setItem('pizzaCart', JSON.stringify(items));
  }, [items]);

  const addItem = (menuItem: MenuItem, pizzaName: string) => {
    setItems((prevItems) => {
      // Существует ли элемент в корзине
      const existingItemIndex = prevItems.findIndex(
        (item) => item.menuItemId === menuItem.Id
      );

      if (existingItemIndex >= 0) {
        // Элемент существует, увеличить количество
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += 1;
        return updatedItems;
      } else {
        // Элемент не существует, добавить новый элемент
        return [
          ...prevItems,
          {
            menuItemId: menuItem.Id,
            pizzaId: menuItem.PizzaId,
            name: pizzaName,
            price: menuItem.TotalPrice,
            quantity: 1,
          },
        ];
      }
    });
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.menuItemId !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.menuItemId === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
