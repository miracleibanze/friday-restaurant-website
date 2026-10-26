import {
  configureStore,
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
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
  paymentStatus?: "pending" | "paid" | "failed";
  paymentReference?: string;
  createdAt?: string;
  notes?: string;
};

type StoreState = {
  cart: CartItem[];
  user: Customer | null;
  orders: Order[];
  lastOrder: Order | null;
  ordersError: string;
  sessionStatus: "idle" | "loading" | "ready" | "error";
  sessionRequestId: string;
  ordersStatus: "idle" | "loading" | "ready" | "error";
  ordersRequestId: string;
  initialized: boolean;
};

const initialState: StoreState = {
  cart: [],
  user: null,
  orders: [],
  lastOrder: null,
  ordersError: "",
  sessionStatus: "idle",
  sessionRequestId: "",
  ordersStatus: "idle",
  ordersRequestId: "",
  initialized: false,
};

export const restoreSession = createAsyncThunk<
  Customer | null,
  void,
  { rejectValue: string }
>("app/restoreSession", async (_, { rejectWithValue, signal }) => {
  try {
    const response = await fetch("/api/auth", { signal });
    const result = await response.json();
    if (!response.ok) return rejectWithValue(result.error || "Could not restore account session.");
    return result.user?.role === "customer" ? (result.user as Customer) : null;
  } catch {
    return rejectWithValue("Could not restore account session.");
  }
});

export const loadOrders = createAsyncThunk<Order[], void, { rejectValue: string }>(
  "app/loadOrders",
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await fetch("/api/orders", { signal });
      const result = await response.json();
      if (!response.ok) return rejectWithValue(result.error || "Could not load your orders.");
      return result.orders as Order[];
    } catch {
      return rejectWithValue("Could not load your orders.");
    }
  },
);

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    initialize(
      state,
      action: PayloadAction<{ cart: CartItem[]; lastOrder: Order | null }>,
    ) {
      state.cart = action.payload.cart;
      state.lastOrder = action.payload.lastOrder;
      state.initialized = true;
    },
    setUser(state, action: PayloadAction<Customer | null>) {
      if (state.user?.id !== action.payload?.id) {
        state.orders = [];
        state.ordersError = "";
        state.ordersStatus = "idle";
        state.ordersRequestId = "";
      }
      state.user = action.payload;
      state.sessionStatus = "ready";
      state.sessionRequestId = "";
      if (!action.payload) {
        state.orders = [];
        state.ordersError = "";
      }
    },
    setOrders(state, action: PayloadAction<Order[]>) {
      state.orders = action.payload;
      state.ordersError = "";
      state.ordersStatus = "ready";
      state.ordersRequestId = "";
    },
    setOrdersError(state, action: PayloadAction<string>) {
      state.ordersError = action.payload;
      state.ordersStatus = "error";
    },
    addToCart(state, action: PayloadAction<{ food: Food; quantity?: number }>) {
      const quantity = action.payload.quantity ?? 1;
      const item = state.cart.find(
        ({ food }) => food.id === action.payload.food.id,
      );
      if (item) item.quantity += quantity;
      else state.cart.push({ food: action.payload.food, quantity });
    },
    syncMenu(state, action: PayloadAction<Food[]>) {
      const catalog = new Map(action.payload.map((food) => [food.id, food]));
      state.cart = state.cart.map((item) => ({
        ...item,
        food: catalog.get(item.food.id) ?? item.food,
      }));
    },
    updateCartItem(
      state,
      action: PayloadAction<{ id: string; quantity: number }>,
    ) {
      if (action.payload.quantity < 1) {
        state.cart = state.cart.filter(
          ({ food }) => food.id !== action.payload.id,
        );
      } else {
        const item = state.cart.find(
          ({ food }) => food.id === action.payload.id,
        );
        if (item) item.quantity = action.payload.quantity;
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.cart = state.cart.filter(({ food }) => food.id !== action.payload);
    },
    completeOrder(state, action: PayloadAction<Order>) {
      state.lastOrder = action.payload;
      state.orders = [
        action.payload,
        ...state.orders.filter((order) => order.id !== action.payload.id),
      ];
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
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state, action) => {
        state.sessionStatus = "loading";
        state.sessionRequestId = action.meta.requestId;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        if (state.sessionRequestId !== action.meta.requestId) return;
        state.user = action.payload;
        state.sessionStatus = "ready";
        state.sessionRequestId = "";
      })
      .addCase(restoreSession.rejected, (state, action) => {
        if (state.sessionRequestId !== action.meta.requestId) return;
        state.sessionStatus = "error";
        state.sessionRequestId = "";
      })
      .addCase(loadOrders.pending, (state, action) => {
        state.ordersStatus = "loading";
        state.ordersError = "";
        state.ordersRequestId = action.meta.requestId;
      })
      .addCase(loadOrders.fulfilled, (state, action) => {
        if (state.ordersRequestId !== action.meta.requestId) return;
        state.orders = action.payload;
        state.ordersStatus = "ready";
        state.ordersError = "";
        state.ordersRequestId = "";
      })
      .addCase(loadOrders.rejected, (state, action) => {
        if (state.ordersRequestId !== action.meta.requestId) return;
        state.ordersRequestId = "";
        if (action.meta.aborted) {
          state.ordersStatus = "idle";
          return;
        }
        state.ordersStatus = "error";
        state.ordersError = action.payload || "Could not load your orders.";
      });
  },
});

export const {
  initialize,
  setUser,
  setOrders,
  setOrdersError,
  addToCart,
  syncMenu,
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
