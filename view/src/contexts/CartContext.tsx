import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCart } from '../api/cart-api';

type CartContextType = {
  totalAmount: number;
  setTotalAmount: (amount: number) => void;
  itemsCount: number;
  addItem: () => void;
  addItems: (count: number) => void;
  removeItem: () => void;
  removeItems: (count: number) => void;
  refreshFromServer: () => Promise<void>;
  cartProductIds: Set<string>;
  addProductId: (id: string) => void;
  removeProductId: (id: string) => void;
  clearProductIds: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [totalAmount, setTotalAmount] = useState(0);
  const [itemsCount, setItemsCount] = useState(0);
  const [cartProductIds, setCartProductIds] = useState<Set<string>>(new Set());

  const addItem = () => {
    setItemsCount((c) => Math.max(0, c + 1));
  };

  const addItems = (count: number) => {
    setItemsCount((c) => c + Math.max(0, count));
  };

  const removeItem = () => {
    setItemsCount((c) => (c > 0 ? c - 1 : 0));
  };

  const removeItems = (count: number) => {
    setItemsCount((c) => {
      const next = c - Math.max(0, count);
      return next < 0 ? 0 : next;
    });
  };

  const refreshFromServer = async () => {
    try {
      const res = await getCart();
      const list = Array.isArray(res?.data) ? res.data : [];
      const count = list.reduce((acc: number, ci: any) => acc + (Number(ci?.quantity) || 0), 0);
      setItemsCount(count);
      const total = list.reduce((acc: number, ci: any) => acc + (Number(ci?.quantity) || 0) * (Number(ci?.product?.price) || 0), 0);
      setTotalAmount(total);
      const ids = new Set<string>();
      for (const ci of list) {
        const pid = ci?.product?._id;
        if (pid) ids.add(String(pid));
      }
      setCartProductIds(ids);
    } catch {
      // ignore; keep last known counts
    }
  };

  const addProductId = (id: string) => {
    setCartProductIds((prev) => {
      const next = new Set(prev);
      next.add(String(id));
      return next;
    });
  };

  const removeProductId = (id: string) => {
    setCartProductIds((prev) => {
      const next = new Set(prev);
      next.delete(String(id));
      return next;
    });
  };

  const clearProductIds = () => {
    setCartProductIds(new Set());
  };

  useEffect(() => {
    // Initialize counts on app start
    void refreshFromServer();
  }, []);

  return (
    <CartContext.Provider
      value={{ totalAmount, setTotalAmount, itemsCount, addItem, addItems, removeItem, removeItems, refreshFromServer, cartProductIds, addProductId, removeProductId, clearProductIds }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
