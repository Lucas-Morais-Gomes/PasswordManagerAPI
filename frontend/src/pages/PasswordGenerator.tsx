import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mySwal } from '../utils/swal';

export default function PasswordGenerator() {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);

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

    // Gerar uma senha ao carregar a página
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

                <div className="settings" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>Tamanho da Senha: <strong>{length}</strong></label>
                        <input 
                            type="range" 
                            min="4" 
                            max="50" 
                            value={length} 
                            onChange={(e) => setLength(parseInt(e.target.value))}
                            style={{ width: '60%' }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                            type="checkbox" 
                            id="uppercase" 
                            checked={includeUppercase} 
                            onChange={(e) => setIncludeUppercase(e.target.checked)} 
                        />
                        <label htmlFor="uppercase">Incluir Letras Maiúsculas (A-Z)</label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                            type="checkbox" 
                            id="numbers" 
                            checked={includeNumbers} 
                            onChange={(e) => setIncludeNumbers(e.target.checked)} 
                        />
                        <label htmlFor="numbers">Incluir Números (0-9)</label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                            type="checkbox" 
                            id="symbols" 
                            checked={includeSymbols} 
                            onChange={(e) => setIncludeSymbols(e.target.checked)} 
                        />
                        <label htmlFor="symbols">Incluir Símbolos (!@#$)</label>
                    </div>

                    <button onClick={generatePassword} style={{ marginTop: '10px', width: '100%' }}>
                        Gerar Nova Senha
                    </button>
                </div>
            </div>
            
            <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9em', marginTop: '20px' }}>
                Dica: Use senhas longas e complexas para maior segurança.
            </p>
        </div>
    );
}
