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
    const [editingId, setEditingId] = useState<number | null>(null);
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

    const iniciarEdicao = async (id: number) => {
        try {
            const item = passwords.find(p => p.id === id);
            if (!item) return;

            const response = await api.get(`/vault/decrypt/${id}`);
            const realPassword = response.data.password;
        
            setNewItem({ 
                siteName: item.siteName, 
                username: item.username, 
                password: realPassword 
            });
            
            setEditingId(id);
        } catch (error) {
            alert('Erro ao carregar dados para edição.');
        }
    };

    const cancelarEdicao = () => {
        setEditingId(null);
        setNewItem({ siteName: '', username: '', password: '' });
    };

    const salvarSenha = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
            
                await api.put(`/vault/${editingId}`, newItem);
                alert('Senha atualizada com sucesso!');
                setEditingId(null);
            } else {
            
                await api.post('/vault', newItem);
                alert('Senha salva com segurança!');
            }
            
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
        
            alert(`Senha do site: ${response.data.password}`);
        } catch (error) {
            alert('Erro ao descriptografar.');
        }
    };

    return (
        <div className="container">
            <header className="header">
                <h1>🔐 Meu Cofre</h1>
                <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                    <span>Usuário Logado</span>
                    <button onClick={logout} className="secondary">Sair</button>
                </div>
            </header>

            <div className="card">
                <h3>{editingId ? '✏️ Editando Senha' : '➕ Adicionar Nova Senha'}</h3>
                
                <form onSubmit={salvarSenha}>
                    <div className="flex">
                        <input 
                            placeholder="Site (ex: Netflix)" 
                            value={newItem.siteName} 
                            onChange={e => setNewItem({ ...newItem, siteName: e.target.value })} 
                            required 
                        />
                        <input 
                            placeholder="Usuário/Email" 
                            value={newItem.username} 
                            onChange={e => setNewItem({ ...newItem, username: e.target.value })} 
                            required 
                        />
                        <input 
                            type="password" 
                            placeholder="Senha" 
                            value={newItem.password} 
                            onChange={e => setNewItem({ ...newItem, password: e.target.value })} 
                            required 
                        />
                    </div>
                    
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                        <button type="submit">
                            {editingId ? 'Salvar Alterações' : 'Salvar Criptografado'}
                        </button>
                        
                        {editingId && (
                            <button type="button" className="secondary" onClick={cancelarEdicao}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div style={{ marginTop: '20px' }}>
                {passwords.map(item => (
                    <div key={item.id} className="card flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <strong>{item.siteName}</strong>
                            <div style={{ color: '#aaa', fontSize: '0.9em' }}>{item.username}</div>
                        </div>
                        <div className="flex" style={{ gap: '8px' }}>
                            <button onClick={() => revelarSenha(item.id)} title="Ver Senha">👁</button>
                            <button onClick={() => iniciarEdicao(item.id)} title="Editar">✏️</button>
                            <button onClick={() => deletarSenha(item.id)} className="secondary" title="Excluir">🗑</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}