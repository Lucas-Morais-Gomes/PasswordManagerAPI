import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { mySwal } from '../utils/swal';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data.token);
            navigate('/');
        } catch (error: any) {
            mySwal.fire('Erro!', error.response?.data || 'Erro no login', 'error');
        }
    };

    return (
        <div className="w-full max-w-md mt-20 px-4">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-brand-DEFAULT mb-2">
                    🔐 Cofre
                </h1>
                <p className="text-gray-400">Acesse suas senhas com segurança</p>
            </div>

            <form onSubmit={handleLogin} className="glass-card flex flex-col gap-2">
                <input 
                    type="email"
                    className="glass-input"
                    placeholder="E-mail" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required
                />
                <input 
                    type="password" 
                    className="glass-input"
                    placeholder="Senha Mestra" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required
                />
                <button type="submit" className="btn-primary mt-4">
                    Entrar
                </button>
            </form>

            <p className="text-center mt-6 text-gray-400">
                Não tem conta? <Link to="/register" className="text-brand-light hover:text-white transition-colors">Cadastre-se</Link>
            </p>
        </div>
    );
}
