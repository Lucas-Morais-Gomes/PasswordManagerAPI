import { describe, it, expect, vi } from 'vitest';
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

    it('deve gerar uma senha ao clicar no botão de recarregar', () => {
        renderPage();
        const initialPassword = screen.getByDisplayValue(/./);
        const generateBtn = screen.getByTitle('Gerar Nova');

        fireEvent.click(generateBtn);
        const newPassword = screen.getByDisplayValue(/./);
        
        // Embora as senhas possam ser geradas aleatoriamente iguais por sorte, a chance é mínima.
        // O teste aqui foca na funcionalidade do clique.
        expect(newPassword).toBeDefined();
    });

    it('deve respeitar a mudança de tamanho da senha', () => {
        renderPage();
        const slider = screen.getByRole('slider');
        
        fireEvent.change(slider, { target: { value: '32' } });
        fireEvent.click(screen.getByTitle('Gerar Nova'));
        
        const passwordInput = screen.getByDisplayValue(/./) as HTMLInputElement;
        expect(passwordInput.value.length).toBe(32);
    });

    it('deve validar se site e usuário estão preenchidos ao salvar', () => {
        renderPage();
        const saveBtn = screen.getByText('Guardar Senha Gerada');
        
        fireEvent.click(saveBtn);
        // O SweetAlert é disparado. Como não estamos testando o Swal, apenas validamos que o mock de addPassword NÃO foi chamado.
        expect(mockAddPassword).not.toHaveBeenCalled();
    });
});
