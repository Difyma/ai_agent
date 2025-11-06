import { useState, useCallback } from 'react';
import { Supplement } from '@/data/supplements';

export interface CartItem {
  supplement: Supplement;
  quantity: number;
}

export interface DeliveryInfo {
  name: string;
  phone: string;
  address: string;
  deliveryMethod: 'courier' | 'pickup' | 'post';
  paymentMethod: 'card' | 'cash' | 'online';
}

export interface UseCartReturn {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  deliveryCost: number;
  finalPrice: number;
  addItem: (supplement: Supplement) => void;
  removeItem: (supplementId: string) => void;
  updateQuantity: (supplementId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (supplementId: string) => boolean;
  getItemQuantity: (supplementId: string) => number;
}

const DELIVERY_COSTS = {
  courier: 300,
  pickup: 0,
  post: 250
};

export const useCart = (): UseCartReturn => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((supplement: Supplement) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.supplement.id === supplement.id);
      
      if (existingItem) {
        return prev.map(item =>
          item.supplement.id === supplement.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prev, { supplement, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((supplementId: string) => {
    setItems(prev => prev.filter(item => item.supplement.id !== supplementId));
  }, []);

  const updateQuantity = useCallback((supplementId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(supplementId);
      return;
    }
    
    setItems(prev =>
      prev.map(item =>
        item.supplement.id === supplementId
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback((supplementId: string) => {
    return items.some(item => item.supplement.id === supplementId);
  }, [items]);

  const getItemQuantity = useCallback((supplementId: string) => {
    const item = items.find(item => item.supplement.id === supplementId);
    return item?.quantity || 0;
  }, [items]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.supplement.price * item.quantity), 0);
  
  // Бесплатная доставка от 3000 рублей
  const deliveryCost = totalPrice >= 3000 ? 0 : DELIVERY_COSTS.courier;
  const finalPrice = totalPrice + deliveryCost;

  return {
    items,
    totalItems,
    totalPrice,
    deliveryCost,
    finalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity
  };
};