import { createContext, useState, ReactNode, useContext, useEffect } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

interface VaultItem {
    id: number;
    siteName: string;
    username: string;
}

interface VaultContextType {
    passwords: VaultItem[];
    loading: boolean;
    fetchPasswords: (force?: boolean) => Promise<void>;
    addPassword: (item: any) => Promise<void>;
    updatePassword: (id: number, item: any) => Promise<void>;
    deletePassword: (id: number) => Promise<void>;
    deleteAllPasswords: () => Promise<void>;
}

export const VaultContext = createContext<VaultContextType>({} as VaultContextType);

export function VaultProvider({ children }: { children: ReactNode }) {
    const [passwords, setPasswords] = useState<VaultItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const { isAuthenticated, logout } = useContext(AuthContext);

    const fetchPasswords = async (force = false) => {
        // Se já inicializou e não for um "force refresh", não faz a requisição
        if (initialized && !force) return;

        setLoading(true);
        try {
            const response = await api.get('/vault');
            setPasswords(response.data);
            setInitialized(true);
        } catch (error: any) {
            console.error('Erro ao buscar senhas', error);
            if (error.response?.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    // Limpar o estado ao fazer logout
    useEffect(() => {
        if (!isAuthenticated) {
            setPasswords([]);
            setInitialized(false);
        }
    }, [isAuthenticated]);

    const addPassword = async (item: any) => {
        const response = await api.post('/vault', item);
        // Atualiza o estado local sem precisar de um novo GET total (opcional, mas eficiente)
        // Aqui vamos apenas forçar o refresh para garantir consistência com o ID gerado pelo banco
        await fetchPasswords(true);
    };

    const updatePassword = async (id: number, item: any) => {
        await api.put(`/vault/${id}`, item);
        await fetchPasswords(true);
    };

    const deletePassword = async (id: number) => {
        await api.delete(`/vault/${id}`);
        setPasswords(prev => prev.filter(p => p.id !== id));
    };

    const deleteAllPasswords = async () => {
        await api.delete('/vault/all');
        setPasswords([]);
    };

    return (
        <VaultContext.Provider value={{ 
            passwords, 
            loading, 
            fetchPasswords, 
            addPassword, 
            updatePassword, 
            deletePassword, 
            deleteAllPasswords 
        }}>
            {children}
        </VaultContext.Provider>
    );
}
