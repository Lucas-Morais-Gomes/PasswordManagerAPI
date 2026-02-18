import { useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { email, password });
            alert('Conta criada! Faça login.');
            navigate('/login');
        } catch (error) {
            alert('Erro ao criar conta.');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '400px', marginTop: '50px' }}>
            <h2>Criar Conta</h2>
            <form onSubmit={handleRegister} className="card">
                <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="Senha Mestra" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="submit" style={{ width: '100%', marginTop: '10px' }}>Cadastrar</button>
            </form>
            <p>Já tem conta? <Link to="/login">Faça Login</Link></p>
        </div>
    );
}