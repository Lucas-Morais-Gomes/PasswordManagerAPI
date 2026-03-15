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
        fetchPasswords(); 
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
            fetchPasswords(true);
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

    const formatUrl = (url: string) => {
        if (!url) return '';
       
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
       
        if (url.includes('.')) return `https://${url}`;
        return '';
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
            text: `Deseja excluir TODAS as suas senhas? (${passwords.length} Senhas)`,
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
                mySwal.fire('Erro!', error.response?.data || 'Erro ao deletar tudo.', 'error');
            }
        }
    };

    const senhasFiltradas = passwords.filter(item => 
        item.siteName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 glass-card p-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-light to-white">
                        🔐 Meu Cofre
                    </h1>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <button onClick={() => navigate('/generator')} className="btn-primary py-2 px-4 text-sm w-auto">
                        🛠️ Gerador de Senha
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="btn-secondary py-2 px-4 text-sm w-auto">
                        📁 Importar CSV
                    </button>
                    {passwords.length > 0 && (
                        <button onClick={deletarTodasAsSenhasClick} className="btn-danger py-2 px-4 text-sm w-auto">
                            🚨 Deletar Tudo
                        </button>
                    )}
                    <button onClick={logout} className="btn-secondary py-2 px-4 text-sm w-auto ml-2 border-red-500/30 hover:bg-red-500/10 hover:text-red-400">
                        Sair
                    </button>
                </div>
            </header>

            <div className="glass-card">
                <h3 className="text-xl font-semibold mb-4 text-brand-light flex items-center gap-2">
                    {editingId ? '✏️ Editando Senha' : '➕ Adicionar Nova Senha'}
                </h3>
                
                <form onSubmit={salvarSenha} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input 
                            className="glass-input mb-0"
                            placeholder="Site ou URL (ex: netflix.com)" 
                            value={newItem.siteName} 
                            onChange={e => setNewItem({ ...newItem, siteName: e.target.value })} 
                            required 
                        />
                        <input 
                            className="glass-input mb-0"
                            placeholder="Usuário/Email" 
                            value={newItem.username} 
                            onChange={e => setNewItem({ ...newItem, username: e.target.value })} 
                            required 
                        />
                        <input 
                            className="glass-input mb-0"
                            type="password" 
                            placeholder="Senha" 
                            value={newItem.password} 
                            onChange={e => setNewItem({ ...newItem, password: e.target.value })} 
                            required 
                        />
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-3 mt-2">
                        <button type="submit" className="btn-primary md:w-auto md:flex-1">
                            {editingId ? 'Salvar Alterações' : 'Salvar Criptografado'}
                        </button>
                        
                        {editingId && (
                            <button type="button" className="btn-secondary md:w-auto" onClick={cancelarEdicao}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400">🔍</span>
                </div>
                <input 
                    type="text" 
                    className="glass-input pl-11 rounded-full mb-0 bg-dark-card border-white/5"
                    placeholder="Pesquisar por nome do site..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading && passwords.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-gray-400 animate-pulse">
                        Carregando senhas seguramente...
                    </div>
                ) : senhasFiltradas.length > 0 ? (
                    senhasFiltradas.map(item => {
                        const destinationUrl = formatUrl(item.siteName);
                        return (
                            <div key={item.id} className="glass-card p-5 flex flex-col justify-between group hover:border-brand-DEFAULT/40 transition-colors">
                                <div className="mb-4">
                                    {destinationUrl ? (
                                        <a 
                                            href={destinationUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-lg text-white font-bold block mb-1 truncate hover:text-brand-light transition-colors flex items-center gap-2"
                                            title={`Ir para ${item.siteName}`}
                                        >
                                            {item.siteName} <span className="text-xs opacity-50">🔗</span>
                                        </a>
                                    ) : (
                                        <strong className="text-lg text-white block mb-1 truncate" title={item.siteName}>{item.siteName}</strong>
                                    )}
                                    <div className="text-gray-400 text-sm truncate" title={item.username}>{item.username}</div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                                    <button onClick={() => revelarSenha(item.id)} className="btn-icon text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/30" title="Ver Senha">
                                        👁️
                                    </button>
                                    <button onClick={() => iniciarEdicao(item.id)} className="btn-icon text-yellow-400 hover:bg-yellow-500/20 hover:border-yellow-500/30" title="Editar">
                                        ✏️
                                    </button>
                                    <button onClick={() => deletarSenhaClick(item.id)} className="btn-icon text-red-400 hover:bg-red-500/20 hover:border-red-500/30" title="Excluir">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full glass-card py-12 text-center text-gray-400 flex flex-col items-center justify-center">
                        <span className="text-4xl mb-3 opacity-50">📭</span>
                        <p>Nenhuma senha encontrada no seu cofre.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-md shadow-2xl border-white/20">
                        <h3 className="text-xl font-bold mb-2 text-white">Importar Senhas</h3>
                        <p className="text-gray-400 text-sm mb-6">Arraste seu arquivo .csv ou clique para selecionar.</p>

                        <div 
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
                                ${dragActive ? 'border-brand-DEFAULT bg-brand-DEFAULT/10' : 'border-gray-600 bg-black/20 hover:border-gray-500'}`}
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
                                className="hidden"
                            />
                            {file ? (
                                <div className="text-brand-light">
                                    <span className="text-2xl block mb-2">✅</span>
                                    <strong className="break-words">{file.name}</strong>
                                </div>
                            ) : (
                                <div className="text-gray-400">
                                    <span className="text-3xl block mb-2">📄</span>
                                    <p>Arraste e solte o arquivo aqui<br/>ou clique para buscar</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button className="btn-secondary flex-1" onClick={() => { setIsModalOpen(false); setFile(null); }} disabled={uploading}>
                                Cancelar
                            </button>
                            <button className="btn-primary flex-1" onClick={handleUpload} disabled={!file || uploading}>
                                {uploading ? 'Importando...' : 'Importar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
