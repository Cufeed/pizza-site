import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PromotionsPage from './pages/PromotionsPage';
import ProfilePage from './pages/ProfilePage';
import AdminRegistrationPage from './pages/AdminRegistrationPage';
import AdminEmployeesPage from './pages/AdminEmployeesPage';
import AdminCouriersPage from './pages/AdminCouriersPage';
import AdminPromotionsPage from './pages/AdminPromotionsPage';
import AdminPizzasPage from './pages/AdminPizzasPage';
import OrdersManagePage from './pages/OrdersManagePage';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/promotions" element={<PromotionsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/register"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminRegistrationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/employees"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminEmployeesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/couriers"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminCouriersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/promotions"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <AdminPromotionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/pizzas"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <AdminPizzasPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/manage"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'employee', 'courier']}>
                    <OrdersManagePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
