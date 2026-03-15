import { render, screen, fireEvent } from '@testing-library/react';
import PasswordGenerator from './PasswordGenerator';
import { BrowserRouter } from 'react-router-dom';
import { VaultContext } from '../context/VaultContext';

// Mock do Contexto
const mockAddPassword = vi.fn();
const mockVaultContext = {
    passwords: [],
    loading: false,
    fetchPasswords: vi.fn(),
    addPassword: mockAddPassword,
    updatePassword: vi.fn(),
    deletePassword: vi.fn(),
    deleteAllPasswords: vi.fn(),
};

describe('PasswordGenerator Page', () => {
    const renderPage = () => render(
        <VaultContext.Provider value={mockVaultContext}>
            <BrowserRouter>
                <PasswordGenerator />
            </BrowserRouter>
        </VaultContext.Provider>
    );

    // Função auxiliar para pegar o input da senha (o único que é readOnly no topo)
    const getPasswordInput = () => {
        const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
        // O input da senha é o primeiro e tem um estilo específico ou é readonly
        return inputs.find(i => i.readOnly) as HTMLInputElement;
    };

    it('deve gerar uma senha ao clicar no botão de recarregar', () => {
        renderPage();
        const initialPasswordInput = getPasswordInput();
        const initialPassword = initialPasswordInput.value;
        const generateBtn = screen.getByTitle('Gerar Nova');

        fireEvent.click(generateBtn);
        const newPasswordInput = getPasswordInput();
        
        expect(newPasswordInput.value).toBeDefined();
        expect(newPasswordInput.value.length).toBeGreaterThan(0);
    });

    it('deve respeitar a mudança de tamanho da senha', () => {
        renderPage();
        const slider = screen.getByRole('slider');
        
        fireEvent.change(slider, { target: { value: '32' } });
        fireEvent.click(screen.getByTitle('Gerar Nova'));
        
        const passwordInput = getPasswordInput();
        expect(passwordInput.value.length).toBe(32);
    });

    it('deve validar se site e usuário estão preenchidos ao salvar', () => {
        renderPage();
        const saveBtn = screen.getByText('Guardar Senha Gerada');
        
        fireEvent.click(saveBtn);
        // O mockAddPassword não deve ser chamado se os campos estiverem vazios
        expect(mockAddPassword).not.toHaveBeenCalled();
    });
});
