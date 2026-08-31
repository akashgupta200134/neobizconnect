import { SapProduct } from "@/modules/sales-order/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { BrandType } from "./auth.store";

export interface CartItem extends SapProduct {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (product: SapProduct) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalUnits: () => number;
  getSubtotal: () => number;
  selectedBrand: BrandType | null;
  setSelectedBrand: (brand: BrandType | null) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedBrand: null,
      setSelectedBrand: (brand) => set({ selectedBrand: brand }),
      addToCart: (product) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.id === product.id,
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          }
          return { items: [...state.items, { ...product, quantity: 1 }] };
        });
      },

      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.id !== productId),
            };
          }
          return {
            items: state.items.map((item) =>
              item.id === productId ? { ...item, quantity } : item,
            ),
          };
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalUnits: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
