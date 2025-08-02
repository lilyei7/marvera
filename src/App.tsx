import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { store } from './store';
import { fetchProducts } from './store/slices/productsSlice';
import { fetchFeaturedProducts } from './store/slices/featuredProductsSlice';
import { verifyToken } from './store/slices/authSlice';
import Navigation from './components/Navigation';
import ShoppingCart from './components/ShoppingCart';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import WholesalePage from './pages/WholesalePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/user/ProfilePage';
import AdminPanel from './components/AdminPanel';
import AdminAccess from './components/AdminAccess';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import BranchesAdmin from './components/admin/BranchesAdmin';
import ProductsAdmin from './components/admin/ProductsAdmin';
import CategoryManager from './components/admin/CategoryManager';
import WholesaleManager from './components/admin/WholesaleManager';
import OrdersManager from './pages/admin/OrdersManager';
import ReportsManager from './pages/admin/ReportsManager';
import SettingsManager from './pages/admin/SettingsManager';
import BranchesPage from './pages/BranchesPage';
import NotificationManager from './components/NotificationManager';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = location.pathname.startsWith('/login') || location.pathname.startsWith('/register');

  useEffect(() => {
    // Verificar token de autenticación al iniciar la app
    const token = localStorage.getItem('token');
    if (token) {
      console.log('🔍 Token encontrado al iniciar app, verificando...');
      store.dispatch(verifyToken());
    }

    // Cargamos los featured products primero
    store.dispatch(fetchFeaturedProducts());
    
    // Cargamos los productos normales después de un pequeño retraso
    // para evitar el error de "Too Many Requests"
    const timer = setTimeout(() => {
      store.dispatch(fetchProducts());
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Solo mostrar Navigation, Footer y ShoppingCart en rutas que NO sean de admin o auth */}
      {!isAdminRoute && !isAuthRoute && <Navigation />}
      <main className={isAdminRoute || isAuthRoute ? "flex-grow" : "flex-grow"}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/mayoreo" element={<WholesalePage />} />
          <Route path="/sucursales" element={<BranchesPage />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* User Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requireAdmin>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/branches" element={
            <ProtectedRoute requireAdmin>
              <BranchesAdmin />
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute requireAdmin>
              <ProductsAdmin />
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute requireAdmin>
              <CategoryManager />
            </ProtectedRoute>
          } />
          <Route path="/admin/wholesale" element={
            <ProtectedRoute requireAdmin>
              <WholesaleManager />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute requireAdmin>
              <OrdersManager />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute requireAdmin>
              <ReportsManager />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute requireAdmin>
              <SettingsManager />
            </ProtectedRoute>
          } />
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/admin-access" element={<AdminAccess />} />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      {!isAdminRoute && !isAuthRoute && <Footer />}
      {!isAdminRoute && !isAuthRoute && <ShoppingCart />}
      <NotificationManager />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
