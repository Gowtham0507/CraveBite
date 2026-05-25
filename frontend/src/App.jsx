import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const RestaurantMenu = lazy(() => import('./pages/RestaurantMenu'));
const CartPage = lazy(() => import('./pages/CartPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans transition-colors duration-300">
      <Navbar />
      <main className="flex-grow flex pb-10">
        <Suspense fallback={<div className="w-full flex items-center justify-center py-12 text-gray-600">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/restaurant/:id" element={<RestaurantMenu />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
