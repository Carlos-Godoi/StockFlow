import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ProductsPage from './pages/ProductsPage';



const App: React.FC = () => {
  return (
    // O AurhProvider envolve toda a aplicação
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rota de Login (Pública) */}
          <Route path='/login' element={<LoginPage />} />

          {/* Rota protegida: Apenas acessível se logado */}
          <Route
            path='/dashboard'
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* ROTA protegida: Produtos */}
          <Route
            path='/products'
            element={
              <ProtectedRoute>
                <ProductsPage />
              </ProtectedRoute>
            }
          />

          {/* Rota Padrão: Redireciona para o Dashboard (se logado) ou login */}
          <Route path='/' element={<Navigate to='/dashboard' replace />} />


        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
