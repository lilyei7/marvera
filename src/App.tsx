import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { store } from './store';
import { fetchProducts } from './store/slices/productsSlice';
import Navigation from './components/Navigation';
import ShoppingCart from './components/ShoppingCart';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import AdminPanel from './components/AdminPanel';
import NotificationManager from './components/NotificationManager';
import './App.css';

function AppContent() {
  useEffect(() => {
    store.dispatch(fetchProducts());
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
