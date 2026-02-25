import { useEffect, useState, useContext, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        carregarSenhas();
    }, []);

    const handleDrag = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (selectedFile: File) => {
        if (selectedFile.name.endsWith('.csv')) {
            setFile(selectedFile);
        } else {
            alert("Por favor, selecione apenas arquivos .csv");
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await api.post('/vault/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert(response.data.message);
            setFile(null);
            setIsModalOpen(false);
            carregarSenhas();
        } catch (error: any) {
            alert(error.response?.data || "Erro ao importar arquivo");
        } finally {
            setUploading(false);
        }
    };

    const carregarSenhas = async () => {
        try {
            const response = await api.get('/vault');
            setPasswords(response.data);
        } catch (error: any) {
            console.error('Erro ao buscar', error);

            if (error.response && error.response.status === 401) {
                alert("Sua sessão expirou. Por favor, faça login novamente.");
                logout();
            }
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const deletarTodasAsSenhas = async () => {
        const primeiraConfirmacao = confirm("⚠️ ATENÇÃO: Tem certeza que deseja excluir TODAS as suas senhas?");
        if (!primeiraConfirmacao) return;

        const segundaConfirmacao = confirm("Esta ação é IRREVERSÍVEL! Deseja realmente esvaziar seu cofre?");
        if (!segundaConfirmacao) return;

        try {
            const response = await api.delete('/vault/all');
            alert(response.data.message || 'Cofre esvaziado com sucesso.');
            carregarSenhas();
        } catch (error: any) {
            alert(error.response?.data || 'Erro ao deletar todas as senhas.');
        }
    };

    const senhasFiltradas = passwords.filter(item => 
        item.siteName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container">
            <header className="header">
                <h1>🔐 Meu Cofre</h1>
                <button onClick={() => setIsModalOpen(true)} style={{ marginBottom: '20px' }}>
                    📁 Importar CSV
                </button>
                <div className="flex">
                    <button onClick={logout} className="secondary">Sair</button>
                </div>
                {passwords.length > 0 && (
                        <button onClick={deletarTodasAsSenhas} style={{ backgroundColor: '#dc3545' }}>
                            🚨 Deletar Tudo
                        </button>
                    )}
            </header>

            <div className="card">
                <h3>{editingId ? '✏️ Editando Senha' : '➕ Adicionar Nova Senha'}</h3>
                
                <form onSubmit={salvarSenha}>
                    <div className="flex form-row">
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
                    
                    <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ flex: 1 }}>
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

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Importar Senhas</h3>
                        <p>Arraste seu arquivo .csv ou clique para selecionar.</p>

                        <div 
                            className={`drag-area ${dragActive ? 'active' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => inputRef.current?.click()}
                        >
                            <input 
                                ref={inputRef}
                                type="file" 
                                accept=".csv" 
                                onChange={handleChange} 
                                style={{ display: 'none' }}
                            />
                            {file ? (
                                <p>✅ Arquivo selecionado: <br/><strong>{file.name}</strong></p>
                            ) : (
                                <p>Arraste e solte o arquivo aqui<br/>ou clique para buscar</p>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button className="secondary" onClick={() => { setIsModalOpen(false); setFile(null); }} disabled={uploading}>
                                Cancelar
                            </button>
                            <button onClick={handleUpload} disabled={!file || uploading}>
                                {uploading ? 'Importando...' : 'Importar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '30px', marginBottom: '15px' }}>
                <input 
                    type="text" 
                    placeholder="🔍 Pesquisar por nome do site..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ borderRadius: '20px', paddingLeft: '20px' }} 
                />
            </div>

            <div>
                {senhasFiltradas.length > 0 ? (
                    senhasFiltradas.map(item => (
                        <div key={item.id} className="card flex list-item" style={{ justifyContent: 'space-between' }}>
                            <div className="list-item-info">
                                <strong style={{ fontSize: '1.1em' }}>{item.siteName}</strong>
                                <div style={{ color: '#aaa', fontSize: '0.9em', marginTop: '4px' }}>{item.username}</div>
                            </div>

                            <div className="flex list-item-actions" style={{ gap: '8px' }}>
                                <button onClick={() => revelarSenha(item.id)} title="Ver Senha">👁</button>
                                <button onClick={() => iniciarEdicao(item.id)} title="Editar">✏️</button>
                                <button onClick={() => deletarSenha(item.id)} className="secondary" title="Excluir">🗑</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>
                        Nenhuma senha encontrada.
                    </p>
                )}
            </div>
        </div>
    );
}