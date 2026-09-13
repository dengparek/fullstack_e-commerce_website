// src/context/CartContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { CartContextType, CartItem, Product } from "../types/api";
import { cartApi } from "../api/cart.api";
import { useAuth } from "./AuthContext";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  // Fetch cart items from API
  const refreshCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await cartApi.getCart();
      setItems(response.data?.items || []);
    } catch (err) {
      console.error("Failed to load cart:", err);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch cart whenever authentication state updates
  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    refreshCart();
  }, [refreshCart, isAuthenticated]);
  // Derived computations
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  // Add Item
  const addItem = async (product: Product, quantity: number = 1) => {
    try {
      await cartApi.addItem({ productId: product.id, quantity });
      await refreshCart();
      openDrawer();
    } catch (err) {
      console.error("Failed to add item to cart:", err);
      await refreshCart(); // Revert on error
    }
  };

  // Update Item Quantity
  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(cartItemId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item,
      ),
    );

    try {
      await cartApi.updateQuantity(cartItemId, { quantity });
      await refreshCart();
    } catch (err) {
      console.error("Failed to update item quantity:", err);
      await refreshCart();
    }
  };

  // Remove Item
  const removeItem = async (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));

    try {
      await cartApi.removeItem(cartItemId);
      await refreshCart();
    } catch (err) {
      console.error("Failed to remove item from cart:", err);
      await refreshCart();
    }
  };

  // Clear Cart
  const clearCart = async () => {
    setItems([]);
    try {
      await cartApi.clearCart();
    } catch (err) {
      console.error("Failed to clear cart:", err);
      await refreshCart();
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isLoading,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
