import { useEffect, useState, useContext, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { VaultContext } from '../context/VaultContext';
import { mySwal } from '../utils/swal';

export default function Dashboard() {
    const { 
        passwords, 
        fetchPasswords, 
        addPassword, 
        updatePassword, 
        deletePassword, 
        deleteAllPasswords,
        loading 
    } = useContext(VaultContext);
    
    const [newItem, setNewItem] = useState({ siteName: '', username: '', password: '' });
    const [editingId, setEditingId] = useState<number | null>(null);
    const { logout } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPasswords(); // Só vai buscar se ainda não tiver os dados
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
            mySwal.fire({
                text: 'Por favor, selecione apenas arquivos .csv',
                icon: 'info',
            });
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            await api.post('/vault/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            mySwal.fire({
                title: 'Sucesso!',
                text: 'Senhas importadas com sucesso!',
                icon: 'success',
            });
            setFile(null);
            setIsModalOpen(false);
            fetchPasswords(true); // Força refresh após importar
        } catch (error: any) {
            mySwal.fire({
                title: 'Erro!',
                text: error.response?.data || "Erro ao importar arquivo",
                icon: 'error',
            });
        } finally {
            setUploading(false);
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
            mySwal.fire({
                title: 'Erro!',
                text: 'Erro ao carregar dados para edição.',
                icon: 'error',
            });
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
                await updatePassword(editingId, newItem);
                mySwal.fire({
                    title: 'Sucesso!',
                    text: 'Senha atualizada!',
                    icon: 'success',
                });
                setEditingId(null);
            } else {
                await addPassword(newItem);
                mySwal.fire({
                    title: 'Sucesso!',
                    text: 'Senha salva!',
                    icon: 'success',
                });
            }
            setNewItem({ siteName: '', username: '', password: '' });
        } catch (error) {
            mySwal.fire({
                title: 'Erro!',
                text: 'Erro ao salvar.',
                icon: 'error',
            });
        }
    };

    const deletarSenhaClick = async (id: number) => {
        const result = await mySwal.fire({
            title: 'Tem certeza?',
            text: "Você não poderá reverter isso!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await deletePassword(id);
                mySwal.fire('Excluído!', 'Sua senha foi deletada.', 'success');
            } catch (error) {
                mySwal.fire('Erro!', 'Erro ao deletar.', 'error');
            }
        }
    };

    const revelarSenha = async (id: number) => {
        try {
            const response = await api.get(`/vault/decrypt/${id}`);
            mySwal.fire({
                title: 'Sua Senha',
                text: response.data.password,
                icon: 'info',
            });
        } catch (error) {
            mySwal.fire('Erro!', 'Erro ao descriptografar.', 'error');
        }
    };

    const deletarTodasAsSenhasClick = async () => {
        const result = await mySwal.fire({
            title: '⚠️ ATENÇÃO EXTREMA',
            text: "Deseja excluir TODAS as suas senhas? ("+passwords.length+" Senhas)",
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'SIM, DELETAR TUDO',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await deleteAllPasswords();
                mySwal.fire('Sucesso!', 'Cofre esvaziado.', 'success');
            } catch (error: any) {
                mySwal.fire('Erro!', 'Erro ao deletar tudo.', 'error');
            }
        }
    };

    const senhasFiltradas = passwords.filter(item => 
        item.siteName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container">
            <header className="header">
                <h1>🔐 Meu Cofre</h1>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button onClick={() => setIsModalOpen(true)}>
                        📁 Importar CSV
                    </button>
                    <button onClick={() => navigate('/generator')} className="secondary" style={{ backgroundColor: '#646cff', color: 'white' }}>
                        🛠️ Gerador de Senhas
                    </button>
                </div>
                {passwords.length > 0 && (
                        <button onClick={deletarTodasAsSenhasClick} style={{ backgroundColor: '#dc3545' }}>
                            🚨 Deletar Tudo
                        </button>
                    )}
                <div className="flex">
                    <button onClick={logout} className="secondary">Sair</button>
                </div>
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
                {loading && passwords.length === 0 ? (
                    <p style={{ textAlign: 'center' }}>Carregando senhas...</p>
                ) : senhasFiltradas.length > 0 ? (
                    senhasFiltradas.map(item => (
                        <div key={item.id} className="card flex list-item" style={{ justifyContent: 'space-between' }}>
                            <div className="list-item-info">
                                <strong style={{ fontSize: '1.1em' }}>{item.siteName}</strong>
                                <div style={{ color: '#aaa', fontSize: '0.9em', marginTop: '4px' }}>{item.username}</div>
                            </div>

                            <div className="flex list-item-actions" style={{ gap: '8px' }}>
                                <button onClick={() => revelarSenha(item.id)} title="Ver Senha">👁</button>
                                <button onClick={() => iniciarEdicao(item.id)} title="Editar">✏️</button>
                                <button onClick={() => deletarSenhaClick(item.id)} className="secondary" title="Excluir">🗑</button>
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
