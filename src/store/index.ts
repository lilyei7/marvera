import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import productsReducer from './slices/productsSlice';
import orderReducer from './slices/orderSlice';
import userReducer from './slices/userSlice';
import authReducer from './slices/authSlice';
import notificationReducer from './slices/notificationSlice';
import featuredProductsReducer from './slices/featuredProductsSlice';
import branchReducer from './slices/branchSlice';
import offersReducer from './slices/offersSlice';
import { adminProductsApi } from '../services/adminProductsApi';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productsReducer,
    orders: orderReducer,
    user: userReducer,
    auth: authReducer,
    notifications: notificationReducer,
    featuredProducts: featuredProductsReducer,
    branches: branchReducer,
    offers: offersReducer,
    [adminProductsApi.reducerPath]: adminProductsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(adminProductsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
