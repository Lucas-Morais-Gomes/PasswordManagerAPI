import { useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { mySwal } from '../utils/swal';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { email, password });
            await mySwal.fire('Sucesso!', 'Conta criada! Faça login.', 'success');
            navigate('/login');
        } catch (error: any) {
            if (error.response && error.response.data) {
                mySwal.fire('Erro!', error.response.data, 'error');
            } else {
                mySwal.fire('Oops...', 'Erro ao criar conta. Tente novamente.', 'error');
            }
        }
    };

    return (
        <div className="w-full max-w-md mt-20 px-4">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-brand-DEFAULT mb-2">
                    Criar Conta
                </h1>
                <p className="text-gray-400">Seu novo cofre digital</p>
            </div>

            <form onSubmit={handleRegister} className="glass-card flex flex-col gap-2">
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
                    Cadastrar
                </button>
            </form>
            
            <p className="text-center mt-6 text-gray-400">
                Já tem conta? <Link to="/login" className="text-brand-light hover:text-white transition-colors">Faça Login</Link>
            </p>
        </div>
    );
}
