import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

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
        } catch (error) {
            alert('Falha no login. Verifique seus dados.');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '400px', marginTop: '50px' }}>
            <h2>Entrar no Cofre</h2>
            <form onSubmit={handleLogin} className="card">
                <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="Senha Mestra" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="submit" style={{ width: '100%', marginTop: '10px' }}>Entrar</button>
            </form>
            <p>Não tem conta? <Link to="/register">Cadastre-se</Link></p>
        </div>
    );
}