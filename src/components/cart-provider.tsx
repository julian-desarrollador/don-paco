"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type CartItem = {
  slug: string;
  name: string;
  price: number;
  quantity: number;
  imageSrc?: string;
};

type AddCartItemInput = {
  slug: string;
  name: string;
  price: number;
  quantity?: number;
  imageSrc?: string;
};

export type CartToastData = {
  id: number;
  nombre: string;
  imagen: string;
  cantidad: number;
};

type CartContextValue = {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  toast: CartToastData | null;
  addItem: (item: AddCartItemInput) => void;
  updateQuantity: (slug: string, delta: number) => void;
  removeItem: (slug: string) => void;
  dismissToast: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<CartToastData | null>(null);

  const dismissToast = useCallback(() => setToast(null), []);

  const addItem = useCallback((item: AddCartItemInput) => {
    const quantityToAdd = Math.max(1, item.quantity ?? 1);

    setItems((previousItems) => {
      const existingItem = previousItems.find((cartItem) => cartItem.slug === item.slug);
      if (existingItem) {
        return previousItems.map((cartItem) =>
          cartItem.slug === item.slug
            ? {
                ...cartItem,
                quantity: cartItem.quantity + quantityToAdd,
                imageSrc: cartItem.imageSrc || item.imageSrc,
              }
            : cartItem,
        );
      }
      return [
        ...previousItems,
        {
          slug: item.slug,
          name: item.name,
          price: item.price,
          quantity: quantityToAdd,
          imageSrc: item.imageSrc,
        },
      ];
    });

    setToast({
      id: Date.now(),
      nombre: item.name,
      imagen: item.imageSrc?.trim() ?? "",
      cantidad: quantityToAdd,
    });
  }, []);

  const updateQuantity = useCallback((slug: string, delta: number) => {
    setItems((previousItems) =>
      previousItems
        .map((item) => (item.slug === slug ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((slug: string) => {
    setItems((previousItems) => previousItems.filter((item) => item.slug !== slug));
  }, []);

  const totalQuantity = useMemo(
    () => items.reduce((accumulator, item) => accumulator + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((accumulator, item) => accumulator + item.price * item.quantity, 0),
    [items],
  );

  const contextValue = useMemo(
    () => ({
      items,
      totalQuantity,
      subtotal,
      toast,
      addItem,
      updateQuantity,
      removeItem,
      dismissToast,
    }),
    [items, totalQuantity, subtotal, toast, addItem, updateQuantity, removeItem, dismissToast],
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
}
