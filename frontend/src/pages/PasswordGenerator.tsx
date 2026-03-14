import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { mySwal } from '../utils/swal';
import { VaultContext } from '../context/VaultContext';

export default function PasswordGenerator() {
    const navigate = useNavigate();
    const { addPassword } = useContext(VaultContext);
    
    // Estados do Gerador
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);

    // Estados para salvar no cofre
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
                password // A senha gerada no momento
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
                    // Limpa apenas os campos de salvar para uma próxima senha
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
        <div className="container">
            <header className="header">
                <h1>🛠️ Gerador de Senhas</h1>
                <button onClick={() => navigate('/')} className="secondary">
                    ⬅️ Voltar ao Cofre
                </button>
            </header>

            <div className="card">
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        background: '#1a1a1a', 
                        padding: '15px', 
                        borderRadius: '8px',
                        border: '1px solid #333'
                    }}>
                        <input 
                            type="text" 
                            value={password} 
                            readOnly 
                            style={{ 
                                flex: 1, 
                                fontSize: '1.2em', 
                                fontFamily: 'monospace',
                                border: 'none',
                                background: 'transparent',
                                color: '#646cff',
                                fontWeight: 'bold'
                            }} 
                        />
                        <button onClick={copyToClipboard} title="Copiar">📋</button>
                        <button onClick={generatePassword} title="Gerar Nova">🔄</button>
                    </div>
                </div>

                <div className="settings" style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '20px', borderBottom: '1px solid #333' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>Tamanho: <strong>{length}</strong></label>
                        <input 
                            type="range" 
                            min="4" 
                            max="50" 
                            value={length} 
                            onChange={(e) => setLength(parseInt(e.target.value))}
                            style={{ width: '60%' }}
                        />
                    </div>

                    <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        justifyContent: 'center', 
                        gap: '20px',
                        margin: '10px 0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input style={{ cursor: 'pointer' }} type="checkbox" id="uppercase" checked={includeUppercase} onChange={(e) => setIncludeUppercase(e.target.checked)} />
                            <label htmlFor="uppercase" style={{ fontSize: '1em', cursor: 'pointer' }}>Maiúsculas</label>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input style={{ cursor: 'pointer' }} type="checkbox" id="numbers" checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)} />
                            <label htmlFor="numbers" style={{ fontSize: '1em', cursor: 'pointer' }}>Números</label>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input style={{ cursor: 'pointer' }} type="checkbox" id="symbols" checked={includeSymbols} onChange={(e) => setIncludeSymbols(e.target.checked)} />
                            <label htmlFor="symbols" style={{ fontSize: '1em', cursor: 'pointer' }}>Símbolos</label>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                    <h3 style={{ marginBottom: '15px', fontSize: '1.1em' }}>💾 Salvar no Cofre</h3>
                    <form onSubmit={handleSaveToVault} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input 
                            placeholder="Site (ex: Instagram)" 
                            value={siteName} 
                            onChange={e => setSiteName(e.target.value)} 
                        />
                        <input 
                            placeholder="Usuário ou E-mail" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)} 
                        />
                        <button 
                            type="submit" 
                            style={{ backgroundColor: '#28a745', marginTop: '5px' }}
                            disabled={saving}
                        >
                            {saving ? 'Salvando...' : 'Guardar Senha Gerada'}
                        </button>
                    </form>
                </div>
            </div>
            
            <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9em', marginTop: '20px' }}>
                A senha salva será exatamente a que estiver exibida no topo.
            </p>
        </div>
    );
}
