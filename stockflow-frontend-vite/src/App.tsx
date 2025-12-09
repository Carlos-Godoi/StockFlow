import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';



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

          {/* Rota Padrão: Redireciona para o Dashboard (se logado) ou login */}
          <Route path='/' element={<Navigate to='/dashboard' replace />} />

          {/* Adicione outras rotas aqui: /products, /sales, etc. */}


        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
