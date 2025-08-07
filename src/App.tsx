import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { store } from './store';
import SessionManager from './components/SessionManager';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ShoppingCart from './components/ShoppingCart';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProductsPageSimple from './pages/ProductsPageSimple';
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
import OffersAdmin from './pages/admin/OffersAdmin';
import SlideshowAdmin from './pages/admin/SlideshowAdmin';
import { FRONTEND_ROUTES } from './config/routes';
import BranchesPage from './pages/BranchesPage';
import NotificationManager from './components/NotificationManager';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = location.pathname.startsWith('/login') || location.pathname.startsWith('/register');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Solo mostrar Navigation, Footer y ShoppingCart en rutas que NO sean de admin o auth */}
      {!isAdminRoute && !isAuthRoute && <Navigation />}
      <main className={isAdminRoute || isAuthRoute ? "flex-grow" : "flex-grow"}>
        <Routes>
          <Route path={FRONTEND_ROUTES.HOME} element={<HomePage />} />
          <Route path={FRONTEND_ROUTES.PRODUCTS} element={<ProductsPageSimple />} />
          <Route path={FRONTEND_ROUTES.WHOLESALE} element={<WholesalePage />} />
          <Route path={FRONTEND_ROUTES.BRANCHES} element={<BranchesPage />} />
          
          {/* Auth Routes */}
          <Route path={FRONTEND_ROUTES.AUTH.LOGIN} element={<LoginPage />} />
          <Route path={FRONTEND_ROUTES.AUTH.REGISTER} element={<RegisterPage />} />
          
          {/* User Routes */}
          <Route path={FRONTEND_ROUTES.AUTH.PROFILE} element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path={FRONTEND_ROUTES.ADMIN.DASHBOARD} element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path={FRONTEND_ROUTES.ADMIN.USERS} element={
            <ProtectedRoute requireAdmin>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path={FRONTEND_ROUTES.ADMIN.BRANCHES} element={
            <ProtectedRoute requireAdmin>
              <BranchesAdmin />
            </ProtectedRoute>
          } />
          <Route path={FRONTEND_ROUTES.ADMIN.PRODUCTS} element={
            <ProtectedRoute requireAdmin>
              <ProductsAdmin />
            </ProtectedRoute>
          } />
          <Route path={FRONTEND_ROUTES.ADMIN.CATEGORIES} element={
            <ProtectedRoute requireAdmin>
              <CategoryManager />
            </ProtectedRoute>
          } />
          <Route path={FRONTEND_ROUTES.ADMIN.OFFERS} element={
            <ProtectedRoute requireAdmin>
              <OffersAdmin />
            </ProtectedRoute>
          } />
          <Route path={FRONTEND_ROUTES.ADMIN.SLIDESHOW} element={
            <ProtectedRoute requireAdmin>
              <SlideshowAdmin />
            </ProtectedRoute>
          } />
          <Route path={FRONTEND_ROUTES.ADMIN.WHOLESALE} element={
            <ProtectedRoute requireAdmin>
              <WholesaleManager />
            </ProtectedRoute>
          } />
          <Route path={FRONTEND_ROUTES.ADMIN.ORDERS} element={
            <ProtectedRoute requireAdmin>
              <OrdersManager />
            </ProtectedRoute>
          } />
          <Route path={FRONTEND_ROUTES.ADMIN.REPORTS} element={
            <ProtectedRoute requireAdmin>
              <ReportsManager />
            </ProtectedRoute>
          } />
          <Route path={FRONTEND_ROUTES.ADMIN.SETTINGS} element={
            <ProtectedRoute requireAdmin>
              <SettingsManager />
            </ProtectedRoute>
          } />
          <Route path={FRONTEND_ROUTES.ADMIN.ANALYTICS} element={
            <ProtectedRoute requireAdmin>
              <ReportsManager />
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
        <SessionManager>
          <AppContent />
        </SessionManager>
      </Router>
    </Provider>
  );
}

export default App;
