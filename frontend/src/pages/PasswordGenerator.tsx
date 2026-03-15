import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { mySwal } from '../utils/swal';
import { VaultContext } from '../context/VaultContext';

export default function PasswordGenerator() {
    const navigate = useNavigate();
    const { addPassword } = useContext(VaultContext);
    
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);

    const [siteName, setSiteName] = useState('');
    const [username, setUsername] = useState('');
    const [saving, setSaving] = useState(false);

    const generatePassword = () => {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

        let characters = lowercase;
        if (includeUppercase) characters += uppercase;
        if (includeNumbers) characters += numbers;
        if (includeSymbols) characters += symbols;

        let generatedPassword = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            generatedPassword += characters[randomIndex];
        }
        setPassword(generatedPassword);
    };

    useEffect(() => {
        generatePassword();
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(password);
        mySwal.fire({
            title: 'Copiado!',
            text: 'Senha copiada para a área de transferência.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
    };

    const handleSaveToVault = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!siteName || !username) {
            mySwal.fire({
                title: 'Campos incompletos',
                text: 'Por favor, preencha o site e o usuário para salvar.',
                icon: 'warning'
            });
            return;
        }

        setSaving(true);
        try {
            await addPassword({
                siteName,
                username,
                password 
            });

            mySwal.fire({
                title: 'Sucesso!',
                text: 'Senha gerada foi salva no seu cofre!',
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Ir para o Cofre',
                cancelButtonText: 'Ficar aqui'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/');
                } else {
                    setSiteName('');
                    setUsername('');
                }
            });
        } catch (error) {
            mySwal.fire({
                title: 'Erro!',
                text: 'Não foi possível salvar a senha.',
                icon: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
            <header className="flex justify-between items-center glass-card p-4">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    🛠️ Gerador
                </h1>
                <button onClick={() => navigate('/')} className="btn-secondary w-auto py-2 text-sm">
                    ⬅️ Voltar
                </button>
            </header>

            <div className="glass-card">
                <div className="mb-8">
                    <div className="flex items-center gap-3 bg-black/40 p-4 rounded-xl border border-brand-DEFAULT/30 shadow-inner">
                        <input 
                            type="text" 
                            value={password} 
                            readOnly 
                            className="flex-1 bg-transparent border-none text-2xl md:text-3xl font-mono text-brand-light font-bold outline-none truncate"
                        />
                        <button onClick={copyToClipboard} className="btn-icon p-3 bg-brand-DEFAULT/10 border-brand-DEFAULT/30 text-brand-light hover:bg-brand-DEFAULT/20" title="Copiar">
                            📋
                        </button>
                        <button onClick={generatePassword} className="btn-icon p-3" title="Gerar Nova">
                            🔄
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-6 pb-8 border-b border-white/10">
                    <div className="flex justify-between items-center bg-black/20 p-4 rounded-lg">
                        <label className="text-gray-300 font-medium">
                            Tamanho: <strong className="text-brand-light text-lg ml-2">{length}</strong>
                        </label>
                        <input 
                            type="range" 
                            min="4" 
                            max="50" 
                            value={length} 
                            onChange={(e) => setLength(parseInt(e.target.value))}
                            className="w-1/2 accent-brand-DEFAULT"
                        />
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 p-4 bg-black/20 rounded-lg">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={includeUppercase} 
                                onChange={(e) => setIncludeUppercase(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-600 text-brand-DEFAULT focus:ring-brand-DEFAULT accent-brand-DEFAULT cursor-pointer"
                            />
                            <span className="text-gray-300 group-hover:text-white transition-colors">Maiúsculas (A-Z)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={includeNumbers} 
                                onChange={(e) => setIncludeNumbers(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-600 text-brand-DEFAULT focus:ring-brand-DEFAULT accent-brand-DEFAULT cursor-pointer"
                            />
                            <span className="text-gray-300 group-hover:text-white transition-colors">Números (0-9)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={includeSymbols} 
                                onChange={(e) => setIncludeSymbols(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-600 text-brand-DEFAULT focus:ring-brand-DEFAULT accent-brand-DEFAULT cursor-pointer"
                            />
                            <span className="text-gray-300 group-hover:text-white transition-colors">Símbolos (!@#$)</span>
                        </label>
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                        💾 Guardar no Cofre
                    </h3>
                    <form onSubmit={handleSaveToVault} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                            className="glass-input mb-0"
                            placeholder="Site ou URL (ex: netflix.com)" 
                            value={siteName} 
                            onChange={e => setSiteName(e.target.value)} 
                        />
                        <input 
                            className="glass-input mb-0"
                            placeholder="Usuário ou E-mail" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)} 
                        />
                        <button 
                            type="submit" 
                            className="btn-primary md:col-span-2 bg-green-600/80 hover:bg-green-600 shadow-green-500/20"
                            disabled={saving}
                        >
                            {saving ? 'Salvando...' : 'Guardar Senha Atual'}
                        </button>
                    </form>
                </div>
            </div>
            
            <p className="text-center text-gray-500 text-sm">
                A senha será guardada exatamente como está exibida no painel acima.
            </p>
        </div>
    );
}
