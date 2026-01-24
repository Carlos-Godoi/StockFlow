import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ProductsPage from './pages/ProductsPage';
import SalesPage from './pages/SalesPage';
import SuppliersPage from './pages/SuppliersPage';
import ReportsPage from './pages/ReportsPage';
import PosPage from './pages/PosPage';
import RegisterPage from './pages/RegisterPage';
import SalesHistoryPage from './pages/SalesHistoryPage';
import UsersPage from './pages/UsersPage';



const App: React.FC = () => {
  return (
    // O AurhProvider envolve toda a aplicação
    <AuthProvider>
      <Router>
        <Routes>

          {/* Rota de Login (Pública) */}
          <Route path='/login' element={<LoginPage />} />

          {/* Rotas Protegidas (Agora envolvidas pelo ProtectedRoute/Sidebar) */}
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

          {/* NOVA ROTA PROTEGIDA: Vendas */}
          <Route path='/sales'
            element={
              <ProtectedRoute>
                <SalesPage />
              </ProtectedRoute>
            }
          />

          <Route path="/suppliers"
            element={
              <ProtectedRoute>
                <SuppliersPage />
              </ProtectedRoute>
            }
          />
          <Route path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pos"
            element={
              <ProtectedRoute>
                <PosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/register'
            element={<RegisterPage />}
          />
          <Route
            path="/sales-history"
            element={
              <ProtectedRoute>
                <SalesHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UsersPage />
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
