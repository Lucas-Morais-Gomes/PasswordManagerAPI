import { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

interface VaultItem {
    id: number;
    siteName: string;
    username: string;
}

export default function Dashboard() {
    const [passwords, setPasswords] = useState<VaultItem[]>([]);
    const [newItem, setNewItem] = useState({ siteName: '', username: '', password: '' });
    const { logout } = useContext(AuthContext);

    useEffect(() => {
        carregarSenhas();
    }, []);

    const carregarSenhas = async () => {
        try {
            const response = await api.get('/vault');
            setPasswords(response.data);
        } catch (error) {
            console.error('Erro ao buscar', error);
        }
    };

    const salvarSenha = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/vault', newItem);
            setNewItem({ siteName: '', username: '', password: '' });
            carregarSenhas();
            alert('Senha salva com segurança!');
        } catch (error) {
            alert('Erro ao salvar.');
        }
    };

    const deletarSenha = async (id: number) => {
        if (!confirm("Tem certeza que deseja excluir?")) return;
        try {
            await api.delete(`/vault/${id}`);
            carregarSenhas();
        } catch (error) {
            alert('Erro ao deletar.');
        }
    };

    const revelarSenha = async (id: number) => {
        try {
            const response = await api.get(`/vault/decrypt/${id}`);
            prompt(`A senha para este site é:`, response.data.password);
        } catch (error) {
            alert('Erro ao descriptografar.');
        }
    };

    return (
        <div className="container">
            <header className="header">
                <h1>🔐 Meu Cofre</h1>
                <button onClick={logout} className="secondary">Sair</button>
            </header>

            <div className="card">
                <h3>Adicionar Nova Senha</h3>
                <form onSubmit={salvarSenha}>
                    <div className="flex">
                        <input placeholder="Site (ex: Netflix)" value={newItem.siteName} onChange={e => setNewItem({ ...newItem, siteName: e.target.value })} required />
                        <input placeholder="Usuário/Email" value={newItem.username} onChange={e => setNewItem({ ...newItem, username: e.target.value })} required />
                        <input type="password" placeholder="Senha" value={newItem.password} onChange={e => setNewItem({ ...newItem, password: e.target.value })} required />
                    </div>
                    <button type="submit" style={{ marginTop: '10px' }}>Salvar Criptografado</button>
                </form>
            </div>

            <div style={{ marginTop: '20px' }}>
                {passwords.map(item => (
                    <div key={item.id} className="card flex" style={{ justifyContent: 'space-between' }}>
                        <div>
                            <strong>{item.siteName}</strong>
                            <div style={{ color: '#aaa', fontSize: '0.9em' }}>{item.username}</div>
                        </div>
                        <div className="flex">
                            <button onClick={() => revelarSenha(item.id)}>👁 Ver Senha</button>
                            <button onClick={() => deletarSenha(item.id)} className="secondary">🗑</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}