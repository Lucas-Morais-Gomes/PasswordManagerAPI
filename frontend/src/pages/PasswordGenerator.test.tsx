import { render, screen, fireEvent } from '@testing-library/react';
import PasswordGenerator from './PasswordGenerator';
import { BrowserRouter } from 'react-router-dom';
import { VaultContext } from '../context/VaultContext';

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

    const getPasswordInput = () => {
        const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    
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
        const saveBtn = screen.getByText('Guardar Senha Atual');
        
        fireEvent.click(saveBtn);
    
        expect(mockAddPassword).not.toHaveBeenCalled();
    });
});
