import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Order, OrderStatus, Address, DeliveryTracker } from '../../types';

interface OrderState {
  currentOrder: Order | null;
  orders: Order[];
  loading: boolean;
  error: string | null;
  deliveryTracking: DeliveryTracker | null;
}

const initialState: OrderState = {
  currentOrder: null,
  orders: [],
  loading: false,
  error: null,
  deliveryTracking: null,
};

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    // Simulate API call
    return new Promise<Order>((resolve) => {
      setTimeout(() => {
        const newOrder: Order = {
          ...orderData,
          id: `order-${Date.now()}`,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        resolve(newOrder);
      }, 1000);
    });
  }
);

export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
    // Simulate API call
    return new Promise<{ orderId: string; status: OrderStatus }>((resolve) => {
      setTimeout(() => {
        resolve({ orderId, status });
      }, 500);
    });
  }
);

export const trackDelivery = createAsyncThunk(
  'order/trackDelivery',
  async () => {
    // Simulate API call for delivery tracking
    return new Promise<DeliveryTracker>((resolve) => {
      setTimeout(() => {
        const mockTracker: DeliveryTracker = {
          orderId: `order-${Date.now()}`,
          driver: {
            id: 1,
            name: 'Carlos Martínez',
            phone: '+52 555 123 4567',
            vehicle: 'Camioneta refrigerada',
            rating: 4.8,
            location: {
              lat: 19.4326,
              lng: -99.1332,
            }
          },
          estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000),
          currentLocation: {
            lat: 19.4326,
            lng: -99.1332,
          },
          route: [
            { lat: 19.4326, lng: -99.1332 },
            { lat: 19.4350, lng: -99.1400 },
            { lat: 19.4400, lng: -99.1450 },
          ],
          status: 'on_the_way',
        };
        resolve(mockTracker);
      }, 800);
    });
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.deliveryTracking = null;
    },
    
    updateDeliveryLocation: (state, action: PayloadAction<{ lat: number; lng: number }>) => {
      if (state.deliveryTracking) {
        state.deliveryTracking.currentLocation = action.payload;
      }
    },
    
    setDeliveryAddress: (state, action: PayloadAction<Address>) => {
      if (state.currentOrder) {
        state.currentOrder.deliveryAddress = action.payload;
      }
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.orders.push(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al crear el pedido';
      })
      
      // Update Order Status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const { orderId, status } = action.payload;
        
        if (state.currentOrder?.id === orderId) {
          state.currentOrder.status = status;
          state.currentOrder.updatedAt = new Date();
        }
        
        const orderIndex = state.orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
          state.orders[orderIndex].status = status;
          state.orders[orderIndex].updatedAt = new Date();
        }
      })
      
      // Track Delivery
      .addCase(trackDelivery.pending, (state) => {
        state.loading = true;
      })
      .addCase(trackDelivery.fulfilled, (state, action) => {
        state.loading = false;
        state.deliveryTracking = action.payload;
        
        if (state.currentOrder) {
          state.currentOrder.deliveryTracker = action.payload;
        }
      })
      .addCase(trackDelivery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al rastrear la entrega';
      });
  },
});

export const {
  clearCurrentOrder,
  updateDeliveryLocation,
  setDeliveryAddress,
} = orderSlice.actions;

export default orderSlice.reducer;
