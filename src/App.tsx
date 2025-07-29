import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { store } from './store';
import { fetchProducts } from './store/slices/productsSlice';
import { fetchFeaturedProducts } from './store/slices/featuredProductsSlice';
import Navigation from './components/Navigation';
import ShoppingCart from './components/ShoppingCart';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import AdminPanel from './components/AdminPanel';
import AdminAccess from './components/AdminAccess';
import AdminDashboard from './pages/AdminDashboard';
import NotificationManager from './components/NotificationManager';
import './App.css';

function AppContent() {
  useEffect(() => {
    store.dispatch(fetchProducts());
    store.dispatch(fetchFeaturedProducts());
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin-access" element={<AdminAccess />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
        <ShoppingCart />
        <NotificationManager />
      </div>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
