import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Food } from "@/lib/menu-data";

export type CartItem = { food: Food; quantity: number };
export type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  defaultAddress?: string;
  role?: "customer" | "admin";
};
export type Order = {
  id: string;
  orderNumber: string;
  status: string;
  customerId?: string | null;
  customerName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  items: Array<{ food: string; name: string; price: number; quantity: number }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  createdAt?: string;
  notes?: string;
};

type StoreState = {
  cart: CartItem[];
  user: Customer | null;
  orders: Order[];
  lastOrder: Order | null;
  ordersError: string;
  initialized: boolean;
};

const initialState: StoreState = {
  cart: [],
  user: null,
  orders: [],
  lastOrder: null,
  ordersError: "",
  initialized: false,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    initialize(state, action: PayloadAction<{ cart: CartItem[]; lastOrder: Order | null }>) {
      state.cart = action.payload.cart;
      state.lastOrder = action.payload.lastOrder;
      state.initialized = true;
    },
    setUser(state, action: PayloadAction<Customer | null>) {
      state.user = action.payload;
      if (!action.payload) {
        state.orders = [];
        state.ordersError = "";
      }
    },
    setOrders(state, action: PayloadAction<Order[]>) {
      state.orders = action.payload;
      state.ordersError = "";
    },
    setOrdersError(state, action: PayloadAction<string>) {
      state.ordersError = action.payload;
    },
    addToCart(state, action: PayloadAction<{ food: Food; quantity?: number }>) {
      const quantity = action.payload.quantity ?? 1;
      const item = state.cart.find(({ food }) => food.id === action.payload.food.id);
      if (item) item.quantity += quantity;
      else state.cart.push({ food: action.payload.food, quantity });
    },
    updateCartItem(state, action: PayloadAction<{ id: string; quantity: number }>) {
      if (action.payload.quantity < 1) {
        state.cart = state.cart.filter(({ food }) => food.id !== action.payload.id);
      } else {
        const item = state.cart.find(({ food }) => food.id === action.payload.id);
        if (item) item.quantity = action.payload.quantity;
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.cart = state.cart.filter(({ food }) => food.id !== action.payload);
    },
    completeOrder(state, action: PayloadAction<Order>) {
      state.lastOrder = action.payload;
      state.orders = [action.payload, ...state.orders.filter((order) => order.id !== action.payload.id)];
      state.cart = [];
    },
    updateOrder(state, action: PayloadAction<Order>) {
      state.orders = state.orders.map((order) =>
        order.id === action.payload.id ? action.payload : order,
      );
    },
    updateProfile(state, action: PayloadAction<Customer>) {
      state.user = action.payload;
    },
  },
});

export const {
  initialize,
  setUser,
  setOrders,
  setOrdersError,
  addToCart,
  updateCartItem,
  removeFromCart,
  completeOrder,
  updateOrder,
  updateProfile,
} = appSlice.actions;

export const makeStore = () =>
  configureStore({
    reducer: { app: appSlice.reducer },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
