import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { VaultProvider } from './context/VaultContext';
import { useContext } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PasswordGenerator from './pages/PasswordGenerator';
import './App.css';

// Componente para proteger rotas privadas
function PrivateRoute({ children }: { children: JSX.Element }) {
    const { isAuthenticated } = useContext(AuthContext);
    return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
    return (
        <AuthProvider>
            <VaultProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route 
                            path="/" 
                            element={
                                <PrivateRoute>
                                    <Dashboard />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/generator" 
                            element={
                                <PrivateRoute>
                                    <PasswordGenerator />
                                </PrivateRoute>
                            } 
                        />
                    </Routes>
                </BrowserRouter>
            </VaultProvider>
        </AuthProvider>
    );
}